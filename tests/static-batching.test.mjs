import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { buildFab } from '../src/scene/buildFab.ts';
import { stages } from '../src/data/processes.ts';

function meshSummary(model) {
  const materialTriangles = new Map();
  let triangles = 0, instanced = 0, instances = 0, transparent = 0;
  model.group.traverse(object => {
    if (!object.isMesh) return;
    const count = (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3
      * (object.isInstancedMesh ? object.count : 1);
    triangles += count;
    if (object.isInstancedMesh) { instanced++; instances += object.count; }
    if (object.material.transparent && object.userData.role !== 'selection') transparent++;
    const m = object.material;
    const key = [m.type, m.color?.getHexString(), m.emissive?.getHexString(), m.emissiveIntensity,
      m.opacity, m.transparent, m.metalness, m.roughness, m.side].join('|');
    materialTriangles.set(key, (materialTriangles.get(key) ?? 0) + count);
  });
  return { triangles, instanced, instances, transparent, materialTriangles: [...materialTriangles].sort() };
}

function closeVector(actual, expected, tolerance = 2e-5) {
  actual.toArray().forEach((n, i) => assert.ok(Math.abs(n - expected.toArray()[i]) <= tolerance, `${actual.toArray()} vs ${expected.toArray()}`));
}

function closeBounds(actual, expected) {
  closeVector(actual.min, expected.min);
  closeVector(actual.max, expected.max);
}

function classification(object) {
  let stage;
  while (object) {
    if (object.userData.transportItem === 'oht' || object.userData.transportItem === 'foup') return object.userData.transportItem;
    if (stage === undefined && typeof object.userData.stage === 'number') stage = object.userData.stage;
    object = object.parent;
  }
  return stage;
}

function pick(model, origin, direction = new THREE.Vector3(0, 0, -1)) {
  const ray = new THREE.Raycaster(origin, direction);
  const hit = ray.intersectObjects([...model.stations, model.rail, model.carrier], true)
    .find(item => item.object.userData.role !== 'selection');
  return hit ? classification(hit.object) : null;
}

test('static batching lowers submissions while retaining material, triangle, instance and transparent geometry', () => {
  const before = buildFab({ optimizeStatic: false });
  const after = buildFab();
  try {
    assert.ok(after.batching.afterMeshes < before.batching.afterMeshes * 0.6);
    assert.deepEqual(meshSummary(after), meshSummary(before));
    before.group.updateMatrixWorld(true);
    after.group.updateMatrixWorld(true);
    closeBounds(new THREE.Box3().setFromObject(after.group), new THREE.Box3().setFromObject(before.group));
    after.stations.forEach((station, i) => closeBounds(new THREE.Box3().setFromObject(station), new THREE.Box3().setFromObject(before.stations[i])));
    const floor = after.group.getObjectByName('学習用クリーンルーム床・模式寸法');
    assert.ok(floor?.isMesh, 'the day/night floor material lookup still targets a physical mesh');
  } finally { before.dispose(); after.dispose(); }
});

test('FOUP, OHT and cabinet hits remain distinct after batching', () => {
  for (const optimizeStatic of [false, true]) {
    const model = buildFab({ optimizeStatic });
    try {
      model.group.updateMatrixWorld(true);
      const containers = [];
      model.group.traverse(object => { if (object.name === 'FOUP容器') containers.push(object); });
      assert.equal(containers.length, 8);
      for (const container of containers) {
        const face = container.localToWorld(new THREE.Vector3(0, 0.44, 0.345));
        assert.equal(pick(model, face.add(new THREE.Vector3(0, 0, 3))), 'foup');
      }
      assert.equal(pick(model, new THREE.Vector3(2.8, 4.5, 6)), 'oht');
      assert.equal(pick(model, new THREE.Vector3(-11.25, 1, -0.5)), 0);
      assert.equal(pick(model, new THREE.Vector3(-5, 0.6, -0.5)), 1);
      assert.equal(pick(model, new THREE.Vector3(8.6, 0.7, 8)), 8);
    } finally { model.dispose(); }
  }
});

test('moving parts, carrier payload/cables and selection highlights retain animation behavior', () => {
  const before = buildFab({ optimizeStatic: false });
  const after = buildFab();
  try {
    assert.equal(after.movingParts.length, before.movingParts.length);
    for (const model of [before, after]) {
      for (const part of model.movingParts) {
        assert.ok(part.object.parent);
        part.object.rotation.y = 0.47;
        part.object.position.x += 0.13;
      }
      const payload = model.carrier.getObjectByName('FOUP昇降部');
      payload.position.y = -3.2;
      model.carrier.position.set(2.5, 4.5, 2);
      for (const name of ['昇降ケーブル左', '昇降ケーブル右']) {
        const cable = model.carrier.getObjectByName(name);
        assert.ok(cable?.isMesh);
        const bottomY = payload.position.y + cable.userData.attachmentOffsetY;
        cable.position.y = (cable.userData.topY + bottomY) / 2;
        cable.scale.y = (cable.userData.topY - bottomY) / cable.userData.baseLength;
      }
      model.highlights[2].visible = true;
      assert.equal(model.highlights[2].parent, model.stations[2]);
      assert.equal(model.highlights[2].userData.role, 'selection');
      model.group.updateMatrixWorld(true);
    }
    after.movingParts.forEach((part, i) => closeBounds(new THREE.Box3().setFromObject(part.object), new THREE.Box3().setFromObject(before.movingParts[i].object)));
    closeBounds(new THREE.Box3().setFromObject(after.carrier), new THREE.Box3().setFromObject(before.carrier));
    closeVector(after.carrier.getObjectByName('FOUP容器').getWorldPosition(new THREE.Vector3()), before.carrier.getObjectByName('FOUP容器').getWorldPosition(new THREE.Vector3()));
  } finally { before.dispose(); after.dispose(); }
});

// GLTFExporter uses this browser primitive to finish binary GLB buffers.
if (!globalThis.FileReader) globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(result => { this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`; this.onloadend?.(); }); }
};

async function exportModel(model) {
  model.stations.forEach((station, id) => Object.assign(station.userData, {
    sourceIds: stages[id].sourceIds, evidenceStatus: stages[id].evidenceStatus, unconfirmed: stages[id].unconfirmed,
  }));
  const buffer = await new GLTFExporter().parseAsync(model.group, { binary: true, onlyVisible: true });
  const view = new DataView(buffer);
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, view.getUint32(12, true))));
  return { json, bytes: buffer.byteLength };
}

test('GLB retains process evidence, transport identities and searchable original part metadata', async () => {
  const before = buildFab({ optimizeStatic: false });
  const after = buildFab();
  try {
    const baseline = await exportModel(before);
    const batched = await exportModel(after);
    assert.ok(batched.json.meshes.length < baseline.json.meshes.length);
    assert.equal(batched.json.nodes.filter(node => node.name === 'FOUP容器').length, 8);
    assert.ok(batched.json.nodes.some(node => node.name === 'OHT搬送レール・模式配置' && node.extras.transportItem === 'oht'));
    for (const model of [baseline.json, batched.json]) {
      const classifications = model.nodes.filter(node => node.extras?.classificationNumber !== undefined);
      assert.equal(classifications.length, 9);
      classifications.forEach((node, i) => {
        assert.deepEqual(node.extras.sourceIds, stages[i].sourceIds);
        assert.equal(node.extras.evidenceStatus, stages[i].evidenceStatus);
        assert.deepEqual(node.extras.unconfirmed, stages[i].unconfirmed);
      });
      assert.ok(model.nodes.some(node => node.extras?.representation?.includes('模式表現')));
      assert.ok(!model.nodes.some(node => node.name?.startsWith('selection-')));
    }
    const batchNodes = batched.json.nodes.filter(node => node.extras?.role === 'opaque-static-batch');
    assert.ok(batchNodes.length > 0);
    assert.ok(batchNodes.every(node => node.extras.sourceParts.every(part => typeof part.name === 'string' && part.transform.length === 16)));
    assert.ok(batchNodes.some(node => node.extras.sourcePartNames.some(name => name.includes('模式部品'))));
  } finally { before.dispose(); after.dispose(); }
});

test('model disposal releases retained original and new batch geometries exactly once', () => {
  const model = buildFab();
  const counts = new Map();
  model.group.traverse(object => {
    if (!object.isMesh || counts.has(object.geometry)) return;
    counts.set(object.geometry, 0);
    object.geometry.addEventListener('dispose', () => counts.set(object.geometry, counts.get(object.geometry) + 1));
  });
  model.dispose();
  assert.ok([...counts.values()].every(count => count === 1));
});
