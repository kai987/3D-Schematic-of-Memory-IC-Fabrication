import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export interface StaticBatchStats {
  beforeMeshes: number;
  afterMeshes: number;
  sourceMeshes: number;
  batches: number;
}

interface BatchOptions {
  /** These objects and every descendant retain their original identity. */
  excludedRoots?: ReadonlySet<THREE.Object3D>;
}

interface BatchResult {
  stats: StaticBatchStats;
  /** The caller owns these geometries and must dispose them with the model. */
  geometries: THREE.BufferGeometry[];
}

interface Candidate {
  mesh: THREE.Mesh;
  matrix: THREE.Matrix4;
}

function meshCount(root: THREE.Object3D) {
  let count = 0;
  root.traverse(object => { if (object instanceof THREE.Mesh) count++; });
  return count;
}

/**
 * Batch opaque static geometry in local semantic domains, never across a
 * process classification or a physical FOUP/OHT boundary. Transparent meshes
 * stay independent so that the renderer retains its existing sorting units.
 */
export function optimizeStaticMeshes(root: THREE.Group, options: BatchOptions = {}): BatchResult {
  const stats: StaticBatchStats = { beforeMeshes: meshCount(root), afterMeshes: 0, sourceMeshes: 0, batches: 0 };
  const geometries: THREE.BufferGeometry[] = [];
  const preparedGeometries = new Map<THREE.BufferGeometry, THREE.BufferGeometry>();
  const domains = new Map<THREE.Group, Map<string, Candidate[]>>();
  root.updateMatrixWorld(true);

  const visit = (object: THREE.Object3D, domain: THREE.Group) => {
    if (options.excludedRoots?.has(object) || object.userData.role === 'selection' || !object.visible) return;
    if (object instanceof THREE.Group && object !== domain) {
      const stage = object.userData.stage;
      const transport = object.userData.transportItem;
      if ((typeof stage === 'number' && stage !== domain.userData.stage)
        || (transport !== undefined && transport !== domain.userData.transportItem)) domain = object;
    }
    if (object instanceof THREE.Mesh && !(object instanceof THREE.InstancedMesh) && !Array.isArray(object.material) && !('isSkinnedMesh' in object)
      && !object.material.transparent && object.material.opacity === 1
      && Object.keys(object.geometry.morphAttributes).length === 0) {
      const relative = domain.matrixWorld.clone().invert().multiply(object.matrixWorld);
      // Baking a reflection requires changing winding. Keep such rare parts
      // separate instead of changing their front/back-face behavior.
      if (relative.determinant() > 0) {
        const attributes = Object.keys(object.geometry.attributes).map(name => {
          const attribute = object.geometry.getAttribute(name);
          return `${name}:${attribute.itemSize}:${attribute.normalized}`;
        }).sort().join(',');
        const key = `${object.material.uuid}|${object.castShadow}|${object.receiveShadow}|${object.renderOrder}|${object.layers.mask}|${attributes}`;
        if (!domains.has(domain)) domains.set(domain, new Map());
        const buckets = domains.get(domain)!;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key)!.push({ mesh: object, matrix: relative });
      }
    }
    for (const child of object.children) visit(child, domain);
  };
  visit(root, root);

  domains.forEach((buckets, domain) => buckets.forEach(candidates => {
    if (candidates.length < 2) return;
    const baked: THREE.BufferGeometry[] = [];
    const sourceParts = candidates.map(({ mesh, matrix }) => ({
      name: mesh.name,
      userData: structuredClone(mesh.userData),
      transform: matrix.toArray(),
      geometryType: mesh.geometry.type,
    }));
    for (const { mesh, matrix } of candidates) {
      if (!preparedGeometries.has(mesh.geometry)) {
        if (mesh.geometry.index) preparedGeometries.set(mesh.geometry, mesh.geometry);
        else {
          // A sequential index preserves every original vertex, UV and normal.
          // Existing InstancedMeshes stay separate and are never expanded.
          // Copy into BufferGeometry so cloning a procedural subclass does not
          // rerun RoundedBoxGeometry/CylinderGeometry constructors.
          const prepared = new THREE.BufferGeometry().copy(mesh.geometry);
          const count = prepared.getAttribute('position').count;
          const index = count > 65535 ? new Uint32Array(count) : new Uint16Array(count);
          for (let i = 0; i < count; i++) index[i] = i;
          prepared.setIndex(new THREE.BufferAttribute(index, 1));
          preparedGeometries.set(mesh.geometry, prepared);
        }
      }
      baked.push(new THREE.BufferGeometry().copy(preparedGeometries.get(mesh.geometry)!).applyMatrix4(matrix));
    }
    const merged = mergeGeometries(baked, false);
    baked.forEach(geometry => geometry.dispose());
    if (!merged) return;
    const geometry = merged;
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometries.push(geometry);
    const first = candidates[0].mesh;
    const batch = new THREE.Mesh(geometry, first.material);
    batch.name = `${domain.name || 'クリーンルーム'}・静的部品バッチ`;
    batch.castShadow = first.castShadow;
    batch.receiveShadow = first.receiveShadow;
    batch.renderOrder = first.renderOrder;
    batch.layers.mask = first.layers.mask;
    batch.userData = {
      role: 'opaque-static-batch', sourceParts,
      sourcePartNames: [...new Set(sourceParts.map(part => part.name))],
    };
    if (typeof domain.userData.stage === 'number') batch.userData.stage = domain.userData.stage;
    if (domain.userData.transportItem) batch.userData.transportItem = domain.userData.transportItem;
    domain.add(batch);
    candidates.forEach(({ mesh }) => mesh.removeFromParent());
    stats.sourceMeshes += candidates.length;
    stats.batches++;
  }));
  preparedGeometries.forEach((prepared, original) => { if (prepared !== original) prepared.dispose(); });
  stats.afterMeshes = meshCount(root);
  return { stats, geometries };
}
