import * as THREE from 'three';
import { buildFab, STATION_POSITIONS } from './buildFab.ts';
import type { FabModel } from './buildFab.ts';

/**
 * Keep the render-time batches out of the saved model. The temporary model
 * shares no geometry or material with the live scene and is always released.
 */
export async function exportFabGLB(source: FabModel, localize: (model: FabModel) => void): Promise<ArrayBuffer> {
  const saved = buildFab({ optimizeStatic: false, profile: source.profile });
  try {
    // Capture the visible state before the first await, so playback cannot
    // change the pose halfway through preparing an export.
    saved.movingParts.forEach((part, index) => {
      const current = source.movingParts[index];
      if (!current || current.stage !== part.stage || current.kind !== part.kind) {
        throw new Error('The fabrication model has incompatible moving parts.');
      }
      part.object.position.copy(current.object.position);
      part.object.quaternion.copy(current.object.quaternion);
      part.object.scale.copy(current.object.scale);
      part.object.visible = current.object.visible;
    });
    const floorName = '学習用クリーンルーム床・模式寸法';
    const currentFloor = source.group.getObjectByName(floorName);
    const savedFloor = saved.group.getObjectByName(floorName);
    if (currentFloor instanceof THREE.Mesh && currentFloor.material instanceof THREE.MeshStandardMaterial
      && savedFloor instanceof THREE.Mesh && savedFloor.material instanceof THREE.MeshStandardMaterial) {
      savedFloor.material.copy(currentFloor.material);
    }

    // Match the existing saved-model convention: retract the hoist and park
    // the trolley at the first station, independently of playback position.
    saved.carrier.visible = true;
    saved.carrier.position.set(STATION_POSITIONS[0][0], 4.5, -2);
    const payload = saved.carrier.getObjectByName('FOUP昇降部');
    if (payload) payload.position.y = -1.7;
    for (const name of ['昇降ケーブル左', '昇降ケーブル右']) {
      const cable = saved.carrier.getObjectByName(name);
      if (cable) { cable.position.y = -0.64; cable.scale.y = 0.4; }
    }
    saved.highlights.forEach(highlight => highlight.removeFromParent());
    localize(saved);

    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    const result = await new GLTFExporter().parseAsync(saved.group, { binary: true, onlyVisible: true });
    if (!(result instanceof ArrayBuffer)) throw new Error('The fabrication export did not return a binary GLB.');
    return result;
  } finally {
    saved.dispose();
  }
}
