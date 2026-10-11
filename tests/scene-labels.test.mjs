import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createSceneLabels } from '../src/scene/sceneLabels.ts';

function fixture() {
  const operations = [];
  const element = (name, width = 100, height = 34) => {
    const attributes = new Map();
    const values = { display: 'none', visibility: '', maxWidth: '', transform: '' };
    return {
      name, width, height,
      style: new Proxy(values, {
        set(target, property, value) {
          operations.push(`write:${name}:${String(property)}`);
          target[property] = value;
          return true;
        },
      }),
      get offsetWidth() {
        operations.push(`read:${name}:width`);
        return this.style.display === 'none' ? 0 : this.width;
      },
      get offsetHeight() {
        operations.push(`read:${name}:height`);
        return this.style.display === 'none' ? 0 : this.height;
      },
      getAttribute(key) { return attributes.get(key) ?? null; },
      setAttribute(key, value) {
        operations.push(`write:${name}:${key}`);
        attributes.set(key, value);
      },
    };
  };
  const processButtons = Array.from({ length: 9 }, (_, id) => element(`process-${id}`));
  const transportButtons = { oht: element('oht', 112), foup: element('foup', 112) };
  const transportPaths = { oht: element('oht-path'), foup: element('foup-path') };
  const transportDots = { oht: element('oht-dot'), foup: element('foup-dot') };
  const anchors = Array.from({ length: 9 }, (_, id) => new THREE.Vector3(-6 + id * 1.5, -2, 0));
  const movingFoup = new THREE.Object3D();
  movingFoup.position.set(-8, 6, 0);
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  camera.position.set(0, 0, 20);
  camera.updateMatrixWorld();
  const controller = createSceneLabels({ processButtons, transportButtons, transportPaths, transportDots, anchors, movingFoup });
  return { operations, processButtons, transportButtons, transportPaths, transportDots, anchors, movingFoup, camera, controller };
}

const visibleState = { visible: true, stage: 0, view: 'all' };

test('label measurement is batched and stays cached across frames, hide toggles and unchanged resizes', () => {
  const f = fixture();
  f.controller.update(f.camera, visibleState);
  assert.equal(f.controller.getMeasurementCount(), 0, 'a zero-sized viewport must not force measurements');
  f.controller.resize(1000, 600);
  f.operations.length = 0;
  f.controller.update(f.camera, visibleState);
  assert.equal(f.controller.getMeasurementCount(), 11);
  const firstRead = f.operations.findIndex(operation => operation.startsWith('read:'));
  const lastRead = f.operations.findLastIndex(operation => operation.startsWith('read:'));
  assert.equal(f.operations.slice(firstRead, lastRead + 1).length, 22);
  assert.ok(f.operations.slice(firstRead, lastRead + 1).every(operation => operation.startsWith('read:')),
    'every measurement setup write must precede the first layout read');
  assert.ok([...f.processButtons, ...Object.values(f.transportButtons)].every(button => button.style.visibility === ''));

  f.operations.length = 0;
  for (let frame = 0; frame < 30; frame += 1) f.controller.update(f.camera, visibleState);
  assert.deepEqual(f.operations, [], 'steady updates must neither remeasure nor rewrite the DOM');
  f.controller.update(f.camera, { ...visibleState, visible: false });
  assert.ok([...f.processButtons, ...Object.values(f.transportButtons)].every(button => button.style.display === 'none'));
  assert.ok(Object.values(f.transportPaths).every(path => path.style.display === 'none'));
  f.controller.update(f.camera, visibleState);
  f.controller.resize(1000, 600);
  f.controller.update(f.camera, visibleState);
  assert.equal(f.controller.getMeasurementCount(), 11);

  f.operations.length = 0;
  f.controller.invalidateMeasurements();
  f.controller.invalidateMeasurements();
  f.controller.update(f.camera, visibleState);
  assert.equal(f.controller.getMeasurementCount(), 22, 'multiple invalidations coalesce into one batch');
  f.controller.update(f.camera, visibleState);
  assert.equal(f.controller.getMeasurementCount(), 22);
});

test('collision-hidden labels retain their measured size and selected-process priority', () => {
  const f = fixture();
  f.processButtons[1].width = 200;
  f.anchors[0].set(0, 0, 0);
  f.anchors[1].set(2.4, 0, 0);
  f.anchors[8].set(-5, -5, 0);
  f.controller.resize(1000, 600);
  f.controller.update(f.camera, visibleState);
  assert.equal(f.processButtons[0].style.display, 'flex');
  assert.equal(f.processButtons[1].style.display, 'none');
  for (let frame = 0; frame < 5; frame += 1) {
    f.controller.update(f.camera, visibleState);
    assert.equal(f.processButtons[1].style.display, 'none', 'a hidden 200px label must not shrink to a 100px fallback');
  }
  f.controller.update(f.camera, { ...visibleState, stage: 1 });
  assert.equal(f.processButtons[1].style.display, 'flex');
  assert.equal(f.processButtons[0].style.display, 'none');
  f.controller.update(f.camera, { ...visibleState, view: 'fab' });
  assert.equal(f.processButtons[8].style.display, 'none');
  f.controller.update(f.camera, { ...visibleState, stage: 8, view: 'probe' });
  assert.equal(f.processButtons[8].style.display, 'flex');
  assert.equal(f.processButtons[0].style.display, 'none');
  assert.equal(f.controller.getMeasurementCount(), 11);

  // A locale/font change must remeasure even labels currently hidden by view.
  f.processButtons[1].width = 320;
  f.controller.invalidateMeasurements();
  f.controller.update(f.camera, { ...visibleState, stage: 8, view: 'probe' });
  f.controller.update(f.camera, visibleState);
  assert.equal(f.processButtons[1].style.display, 'none');
  assert.equal(f.controller.getMeasurementCount(), 22);
});

test('transport labels keep priority and mobile leaders follow the moving FOUP without measuring', () => {
  const f = fixture();
  f.anchors[0].set(2.8, 4.6 + 16 * 20 / 600, 0);
  f.controller.resize(1000, 600);
  f.controller.update(f.camera, visibleState);
  assert.equal(f.transportButtons.oht.style.display, 'flex');
  assert.equal(f.processButtons[0].style.display, 'none', 'the process label cannot take the transport label’s space');

  f.controller.resize(400, 500);
  f.controller.update(f.camera, { ...visibleState, view: 'probe' });
  assert.equal(f.transportButtons.oht.style.maxWidth, '376px');
  assert.ok(Object.values(f.transportPaths).every(path => path.style.display === ''));
  assert.ok(Object.values(f.transportDots).every(dot => dot.style.display === ''));
  assert.equal(f.controller.getMeasurementCount(), 22);
  const pathBeforeMove = f.transportPaths.foup.getAttribute('d');
  const dotBeforeMove = f.transportDots.foup.getAttribute('cx');
  f.movingFoup.position.set(4, 1, 0);
  f.controller.update(f.camera, { ...visibleState, view: 'probe' });
  assert.notEqual(f.transportPaths.foup.getAttribute('d'), pathBeforeMove);
  assert.notEqual(f.transportDots.foup.getAttribute('cx'), dotBeforeMove);
  assert.equal(f.controller.getMeasurementCount(), 22);
});
