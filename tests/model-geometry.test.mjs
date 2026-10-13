import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildFab, STATION_POSITIONS } from '../src/scene/buildFab.ts';

if (!globalThis.FileReader) globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(result => { this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`; this.onloadend?.(); }); }
};

function triangles(root) {
  let total = 0;
  function visit(object) {
    if (!object.visible) return;
    if (object.isMesh) total += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3 * (object.isInstancedMesh ? object.count : 1);
    object.children.forEach(visit);
  }
  visit(root);
  return total;
}

function closeVector(actual, expected) {
  actual.toArray().forEach((value, i) => assert.ok(Math.abs(value - expected.toArray()[i]) < 2e-5));
}

function closeBounds(actual, expected) {
  closeVector(actual.min, expected.min);
  closeVector(actual.max, expected.max);
}

function classify(object) {
  let stage;
  while (object) {
    if (object.userData.transportItem) return object.userData.transportItem;
    if (stage === undefined && object.userData.stage !== undefined) stage = object.userData.stage;
    object = object.parent;
  }
  return stage;
}

function pick(model, origin) {
  const hit = new THREE.Raycaster(origin, new THREE.Vector3(0, 0, -1))
    .intersectObjects([...model.stations, model.rail, model.carrier], true)
    .find(hit => hit.object.userData.role !== 'selection');
  return hit ? classify(hit.object) : null;
}

function disposeLoaded(root) {
  const geometries = new Set(), materials = new Set();
  root.traverse(object => {
    if (!object.isMesh) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
}

test('both profiles retain nine separated stations, floor bounds, FOUP/OHT picks and the moving-part contract', () => {
  const defaultModel = buildFab();
  try { assert.equal(defaultModel.profile, 'micron'); } finally { defaultModel.dispose(); }
  for (const profile of ['micron', 'kioxia']) {
    const before = buildFab({ profile, optimizeStatic: false });
    const after = buildFab({ profile });
    try {
      assert.equal(after.profile, profile);
      assert.equal(after.stations.length, 9);
      assert.equal(after.highlights.length, 9);
      assert.ok(after.batching.afterMeshes < before.batching.afterMeshes);
      assert.equal(triangles(after.group), triangles(before.group));
      assert.deepEqual(after.movingParts.map(({ stage, kind }) => [stage, kind]), [[0, 'arm'], [1, 'scan'], [3, 'spin'], [6, 'spin'], [6, 'spin'], [6, 'spin'], [7, 'scan'], [8, 'scan']]);
      const bounds = after.stations.map((station, id) => {
        assert.deepEqual(station.position.toArray(), STATION_POSITIONS[id]);
        assert.equal(station.userData.stage, id);
        assert.equal(station.userData.profile, profile);
        return new THREE.Box3().setFromObject(station);
      });
      bounds.forEach((box, i) => {
        assert.ok(box.min.x >= -13.5 && box.max.x <= 13.5 && box.min.z >= -7.4 && box.max.z <= 7.4);
        bounds.slice(i + 1).forEach(other => assert.equal(box.intersectsBox(other), false));
      });
      after.group.updateMatrixWorld(true);
      before.group.updateMatrixWorld(true);
      closeBounds(new THREE.Box3().setFromObject(after.group), new THREE.Box3().setFromObject(before.group));
      assert.ok(after.group.getObjectByName('学習用クリーンルーム床・模式寸法')?.isMesh);
      for (const name of ['FOUP昇降部', '昇降ケーブル左', '昇降ケーブル右']) assert.ok(after.carrier.getObjectByName(name));
      const containers = [];
      after.group.traverse(object => { if (object.name === 'FOUP容器') containers.push(object); });
      assert.equal(containers.length, 8);
      containers.forEach(container => {
        const origin = container.localToWorld(new THREE.Vector3(0, 0.44, 0.345)).add(new THREE.Vector3(0, 0, 3));
        assert.equal(pick(after, origin), 'foup');
      });
      assert.equal(pick(after, new THREE.Vector3(2.8, 4.5, 6)), 'oht');
      assert.equal(pick(after, new THREE.Vector3(-11.25, 1, -0.5)), 0);
      assert.equal(pick(after, new THREE.Vector3(3.5, 0.9, 8)), 7);
    } finally { before.dispose(); after.dispose(); }
  }
});

test('NAND samples have real through-holes and vertical channels, with independently aligned CBA wafers', () => {
  const model = buildFab({ profile: 'kioxia', optimizeStatic: false });
  const micron = buildFab({ profile: 'micron', optimizeStatic: false });
  try {
    model.group.updateMatrixWorld(true);
    const samples = [];
    model.group.traverse(object => { if (object.userData.role === 'nand-schematic') samples.push(object); });
    assert.deepEqual(samples.map(sample => sample.userData.schematicFeature), ['stack', 'holes', 'channels']);
    samples.forEach(sample => assert.match(sample.userData.representation, /実際の層数・寸法・材料・装置内構造は再現しない/));
    const etched = samples[1];
    const layers = etched.children.filter(object => object.isInstancedMesh);
    const throughHole = etched.localToWorld(new THREE.Vector3(0, 1, 0.19));
    const solid = etched.localToWorld(new THREE.Vector3(0.12, 1, 0));
    const down = new THREE.Vector3(0, -1, 0);
    assert.equal(new THREE.Raycaster(throughHole, down).intersectObjects(layers, false).length, 0);
    assert.ok(new THREE.Raycaster(solid, down).intersectObjects(layers, false).length > 0);
    assert.ok(samples[2].getObjectByName('垂直チャネル・柱状模式')?.isInstancedMesh);
    assert.ok(!micron.group.getObjectByName('多層膜スタック・拡大模式標本'));
    assert.ok(!model.stations[5].children.some(object => object.geometry?.type === 'CylinderGeometry' && object.geometry.parameters.height === 2.22));

    const cmos = model.group.getObjectByName('CMOSウェーハ・CBA模式');
    const array = model.group.getObjectByName('セルアレイウェーハ・CBA対向模式');
    assert.ok(cmos && array);
    assert.equal(cmos.position.x, array.position.x);
    assert.equal(cmos.position.z, array.position.z);
    assert.ok(array.position.y > cmos.position.y);
    const cmosBefore = new THREE.Box3().setFromObject(cmos);
    const arrayBefore = new THREE.Box3().setFromObject(array);
    model.movingParts.find(part => part.stage === 7).object.position.x += 0.22;
    model.group.updateMatrixWorld(true);
    closeBounds(new THREE.Box3().setFromObject(cmos), cmosBefore);
    closeVector(new THREE.Box3().setFromObject(array).min, arrayBefore.min.clone().add(new THREE.Vector3(0.22, 0, 0)));
  } finally { model.dispose(); micron.dispose(); }
});

test('NAND GLBs round-trip with the schematic technology metadata, CBA pose and unchanged batching geometry', async () => {
  const reference = buildFab({ profile: 'kioxia', optimizeStatic: false });
  const batched = buildFab({ profile: 'kioxia' });
  const loadedScenes = [];
  try {
    for (const model of [reference, batched]) {
      const array = model.movingParts.find(part => part.stage === 7).object;
      array.position.x += 0.19;
      model.highlights.forEach(highlight => highlight.removeFromParent());
      model.group.updateMatrixWorld(true);
      const buffer = await new GLTFExporter().parseAsync(model.group, { binary: true, onlyVisible: true });
      const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, new DataView(buffer).getUint32(12, true))));
      const root = json.nodes.find(node => node.extras?.memoryTechnology);
      assert.equal(root.extras.profile, 'kioxia');
      assert.match(root.extras.memoryTechnology, /BiCS FLASH/);
      assert.equal(json.nodes.filter(node => node.extras?.classificationNumber !== undefined).length, 9);
      assert.equal(json.nodes.filter(node => node.name === 'FOUP容器').length, 8);
      assert.ok(json.nodes.some(node => node.extras?.schematicFeature === 'cba-array-wafer'));
      assert.ok(!json.nodes.some(node => node.name?.startsWith('selection-')));
      const loaded = (await new GLTFLoader().parseAsync(buffer, '')).scene;
      loadedScenes.push(loaded);
      loaded.updateMatrixWorld(true);
      closeBounds(new THREE.Box3().setFromObject(loaded), new THREE.Box3().setFromObject(model.group));
      assert.equal(triangles(loaded), triangles(model.group));
      const loadedArray = loaded.getObjectByName('セルアレイウェーハ・CBA対向模式');
      closeVector(loadedArray.position, array.position);
    }
    assert.equal(triangles(loadedScenes[0]), triangles(loadedScenes[1]));
  } finally { loadedScenes.forEach(disposeLoaded); reference.dispose(); batched.dispose(); }
});
