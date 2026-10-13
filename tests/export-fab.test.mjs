import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildFab } from '../src/scene/buildFab.ts';
import { exportFabGLB } from '../src/scene/exportFab.ts';
import { getProcessContent } from '../src/data/localizedProcesses.ts';
import { getTransportContent } from '../src/data/transport.ts';

// The model has no image textures. Only the exporter's binary Blob reader is
// needed to exercise the same GLB serializer as the browser.
if (!globalThis.FileReader) globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(result => { this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`; this.onloadend?.(); }); }
};

function glbJSON(buffer) {
  assert.equal(new DataView(buffer).getUint32(0, true), 0x46546c67);
  return JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, new DataView(buffer).getUint32(12, true))));
}

function localizer(locale, profile = 'micron') {
  const content = getProcessContent(locale, profile);
  const transport = getTransportContent(locale, profile);
  return model => {
    model.group.name = content.modelTitle;
    Object.assign(model.group.userData, {
      title: content.modelTitle, language: locale, scope: content.scopeNote, disclaimer: content.disclaimer,
      sources: content.sources, processes: content.stages, transportSystems: Object.values(transport.items),
    });
    model.stations.forEach((station, i) => {
      const stage = content.stages[i];
      station.name = `${String(i + 1).padStart(2, '0')} ${stage.title}`;
      Object.assign(station.userData, {
        language: locale, title: stage.title, evidenceStatus: stage.evidenceStatus,
        evidenceStatement: stage.evidenceStatement, sourceIds: stage.sourceIds, unconfirmed: stage.unconfirmed,
      });
    });
    model.group.traverse(object => {
      const item = transport.items[object.userData.transportItem];
      if (item) Object.assign(object.userData, { language: locale, title: item.title, description: item.description, scopeNote: item.scopeNote, sourceIds: item.sourceIds });
    });
    // Tags let the loader round-trip assertions identify even repeated unnamed
    // polishing heads without depending on GLTFLoader's name deduplication.
    model.movingParts.forEach((part, i) => { part.object.userData.exportPoseIndex = i; });
  };
}

function liveState(model) {
  const objects = [];
  model.group.traverse(object => objects.push({
    uuid: object.uuid, parent: object.parent?.uuid, name: object.name, visible: object.visible,
    position: object.position.toArray(), quaternion: object.quaternion.toArray(), scale: object.scale.toArray(),
    userData: structuredClone(object.userData),
    geometry: object.geometry?.uuid,
    material: object.material?.uuid,
  }));
  const floor = model.group.getObjectByName('学習用クリーンルーム床・模式寸法');
  return { objects, floorColor: floor.material.color.toArray(), floorRoughness: floor.material.roughness };
}

function resources(model) {
  const geometries = new Set(), materials = new Set();
  for (const root of [model.group, ...model.highlights]) root.traverse(object => {
    if (!object.isMesh) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
  });
  return [...geometries, ...materials];
}

function watchDisposals(objects) {
  const counts = new Map(objects.map(object => [object, 0]));
  counts.forEach((_, object) => object.addEventListener('dispose', () => counts.set(object, counts.get(object) + 1)));
  return counts;
}

function visibleTriangles(root) {
  let triangles = 0;
  function visit(object) {
    if (!object.visible) return;
    if (object.isMesh) triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3 * (object.isInstancedMesh ? object.count : 1);
    object.children.forEach(visit);
  }
  visit(root);
  return triangles;
}

function closeVector(actual, expected, tolerance = 2e-5) {
  actual.toArray().forEach((value, i) => assert.ok(Math.abs(value - expected.toArray()[i]) <= tolerance, `${actual.toArray()} vs ${expected.toArray()}`));
}

function closeBounds(actual, expected) {
  closeVector(actual.min, expected.min);
  closeVector(actual.max, expected.max);
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

test('compact GLB round-trip retains bounds, triangles, floor material and moving poses without touching the live model', async () => {
  const source = buildFab();
  let loaded;
  try {
    source.movingParts.forEach((part, i) => {
      part.object.position.x += 0.07 + i * 0.01;
      part.object.quaternion.setFromEuler(new THREE.Euler(0.04, 0.2 + i * 0.03, 0.02));
      part.object.scale.set(1.02, 0.98, 1.01);
    });
    const floor = source.group.getObjectByName('学習用クリーンルーム床・模式寸法');
    floor.material.color.set('#334b62');
    floor.material.roughness = 0.58;
    source.carrier.position.set(7.5, 4.5, 2);
    source.carrier.getObjectByName('FOUP昇降部').position.y = -3.2;
    source.carrier.getObjectByName('昇降ケーブル左').scale.y = 1.9;
    source.highlights[3].visible = true;
    localizer('ja')(source);
    const initialState = liveState(source);
    const liveResources = resources(source);
    const liveDisposals = watchDisposals(liveResources);
    let temporaryDisposals;

    const compact = await exportFabGLB(source, saved => {
      localizer('ja')(saved);
      const savedResources = resources(saved);
      assert.ok(savedResources.every(resource => !liveResources.includes(resource)), 'export resources are independently owned');
      temporaryDisposals = watchDisposals(savedResources);
    });
    assert.deepEqual(liveState(source), initialState);
    assert.ok([...liveDisposals.values()].every(count => count === 0));
    assert.ok([...temporaryDisposals.values()].every(count => count === 1));

    // Compare to the former browser export convention, including the parked
    // carrier and retracted cables, but retaining batched render geometry.
    const former = source.group.clone(true);
    former.traverse(object => { if (object.userData.role === 'selection') object.visible = false; });
    const formerCarrier = former.getObjectByName('OHT・FOUP 搬送キャリア');
    formerCarrier.position.set(-10, 4.5, -2);
    formerCarrier.getObjectByName('FOUP昇降部').position.y = -1.7;
    for (const name of ['昇降ケーブル左', '昇降ケーブル右']) {
      const cable = formerCarrier.getObjectByName(name);
      cable.position.y = -0.64; cable.scale.y = 0.4;
    }
    const batched = await new GLTFExporter().parseAsync(former, { binary: true, onlyVisible: true });
    assert.ok(compact.byteLength < batched.byteLength * 0.55, `${compact.byteLength} bytes vs ${batched.byteLength}`);

    loaded = (await new GLTFLoader().parseAsync(compact, '')).scene;
    former.updateMatrixWorld(true);
    loaded.updateMatrixWorld(true);
    closeBounds(new THREE.Box3().setFromObject(loaded), new THREE.Box3().setFromObject(former));
    assert.equal(visibleTriangles(loaded), visibleTriangles(former));
    const loadedFloor = loaded.getObjectByName('学習用クリーンルーム床・模式寸法');
    closeVector(loadedFloor.material.color, floor.material.color);
    assert.equal(loadedFloor.material.roughness, 0.58);
    const loadedActors = [];
    loaded.traverse(object => { if (object.userData.exportPoseIndex !== undefined) loadedActors[object.userData.exportPoseIndex] = object; });
    source.movingParts.forEach((part, i) => {
      closeVector(loadedActors[i].position, part.object.position);
      closeVector(loadedActors[i].scale, part.object.scale);
      closeVector(loadedActors[i].quaternion, part.object.quaternion);
      closeBounds(new THREE.Box3().setFromObject(loadedActors[i]), new THREE.Box3().setFromObject(part.object));
    });
    const loadedCarrier = loaded.getObjectByName('OHT・FOUP_搬送キャリア');
    closeVector(loadedCarrier.position, new THREE.Vector3(-10, 4.5, -2));
    assert.equal(loadedCarrier.getObjectByName('FOUP昇降部').position.y, -1.7);
    assert.equal(loadedCarrier.getObjectByName('昇降ケーブル左').scale.y, 0.4);
    assert.equal(loadedCarrier.getObjectByName('昇降ケーブル右').scale.y, 0.4);
  } finally { if (loaded) disposeLoaded(loaded); source.dispose(); }
});

test('all three compact GLBs keep nine localized categories, thirteen sources, eight FOUPs and stable Japanese part names', async () => {
  const source = buildFab();
  try {
    for (const locale of ['ja', 'en', 'zh']) {
      const content = getProcessContent(locale);
      const json = glbJSON(await exportFabGLB(source, localizer(locale)));
      const root = json.nodes.find(node => node.extras?.sources);
      assert.equal(root.name, content.modelTitle);
      assert.equal(root.extras.language, locale);
      assert.deepEqual(root.extras.sources, content.sources);
      assert.equal(root.extras.sources.length, 13);
      assert.equal(root.extras.transportSystems.length, 2);
      const stations = json.nodes.filter(node => node.extras?.classificationNumber !== undefined);
      assert.equal(stations.length, 9);
      stations.forEach((station, i) => {
        assert.equal(station.name, `${String(i + 1).padStart(2, '0')} ${content.stages[i].title}`);
        assert.equal(station.extras.evidenceStatus, content.stages[i].evidenceStatus);
        assert.deepEqual(station.extras.sourceIds, content.stages[i].sourceIds);
        assert.deepEqual(station.extras.unconfirmed, content.stages[i].unconfirmed);
      });
      assert.equal(json.nodes.filter(node => node.name === 'FOUP容器').length, 8);
      for (const name of ['FOUP昇降部', '昇降ケーブル左', '昇降ケーブル右', 'OHT搬送レール・模式配置']) assert.ok(json.nodes.some(node => node.name === name));
      assert.ok(json.nodes.some(node => node.name?.includes('模式部品')));
      assert.ok(!json.nodes.some(node => node.name?.startsWith('selection-') || node.extras?.role === 'opaque-static-batch'));
      assert.ok(json.extensionsUsed.includes('EXT_mesh_gpu_instancing'));
    }
  } finally { source.dispose(); }
});

test('the compact export helper retains KIOXIA NAND geometry and localized nine-stage/eight-source metadata', async () => {
  const source = buildFab({ profile: 'kioxia' });
  const arrayPose = source.movingParts.find(part => part.stage === 7).object;
  arrayPose.position.x += 0.16;
  try {
    for (const locale of ['ja', 'en', 'zh']) {
      let loaded;
      try {
        const content = getProcessContent(locale, 'kioxia');
        const buffer = await exportFabGLB(source, localizer(locale, 'kioxia'));
        const json = glbJSON(buffer);
        const root = json.nodes.find(node => node.extras?.sources);
        assert.equal(root.extras.profile, 'kioxia', 'the helper must construct the source profile, not its Micron default');
        assert.match(root.extras.memoryTechnology, /BiCS FLASH/u);
        assert.equal(root.name, content.modelTitle);
        assert.equal(root.extras.language, locale);
        assert.equal(root.extras.sources.length, 8);
        assert.deepEqual(root.extras.sources, content.sources);
        const stations = json.nodes.filter(node => node.extras?.classificationNumber !== undefined);
        assert.equal(stations.length, 9);
        stations.forEach((station, i) => {
          assert.equal(station.extras.title, content.stages[i].title);
          assert.deepEqual(station.extras.sourceIds, content.stages[i].sourceIds);
          assert.deepEqual(station.extras.unconfirmed, content.stages[i].unconfirmed);
        });
        assert.equal(json.nodes.filter(node => node.name === 'FOUP容器').length, 8);

        loaded = (await new GLTFLoader().parseAsync(buffer, '')).scene;
        loaded.updateMatrixWorld(true);
        const samples = new Map();
        loaded.traverse(object => {
          if (object.userData.schematicFeature) samples.set(object.userData.schematicFeature, object);
        });
        assert.ok(samples.get('stack')?.children.some(object => object.isInstancedMesh), 'the actual multilayer stack must survive serialization');
        const etched = samples.get('holes');
        assert.ok(etched, 'the vertical-hole sample must not be replaced by DRAM geometry');
        const layers = etched.children.filter(object => object.isInstancedMesh);
        const down = new THREE.Vector3(0, -1, 0);
        const hole = etched.localToWorld(new THREE.Vector3(0, 1, 0.19));
        const solid = etched.localToWorld(new THREE.Vector3(0.12, 1, 0));
        assert.equal(new THREE.Raycaster(hole, down).intersectObjects(layers, false).length, 0);
        assert.ok(new THREE.Raycaster(solid, down).intersectObjects(layers, false).length > 0, 'real holes, not an empty placeholder');
        assert.ok(samples.get('channels')?.getObjectByName('垂直チャネル・柱状模式')?.isInstancedMesh);
        const cmos = samples.get('cba-cmos-wafer');
        const array = samples.get('cba-array-wafer');
        assert.ok(cmos && array, 'both separately represented CBA wafers must survive export');
        assert.ok(array.position.y > cmos.position.y);
        closeVector(array.position, arrayPose.position);
      } finally { if (loaded) disposeLoaded(loaded); }
    }
  } finally { source.dispose(); }
});

test('localization and serialization failures release temporary resources while the live model remains usable', async () => {
  const source = buildFab();
  const initialState = liveState(source);
  const liveDisposals = watchDisposals(resources(source));
  try {
    for (const failure of ['localization', 'serialization']) {
      let temporaryDisposals;
      await assert.rejects(exportFabGLB(source, saved => {
        temporaryDisposals = watchDisposals(resources(saved));
        if (failure === 'localization') throw new Error('Expected localization failure');
        saved.stations[0].children.find(object => object.isMesh).geometry = null;
      }));
      assert.ok([...temporaryDisposals.values()].every(count => count === 1), failure);
      assert.deepEqual(liveState(source), initialState);
      assert.ok([...liveDisposals.values()].every(count => count === 0));
    }
    assert.ok((await exportFabGLB(source, localizer('ja'))).byteLength > 0, 'a subsequent export still succeeds');
  } finally { source.dispose(); }
});
