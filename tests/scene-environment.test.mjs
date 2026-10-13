import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createEnvironment } from '../src/scene/createEnvironment.ts';

function fixture() {
  const originalTarget = new THREE.WebGLRenderTarget(16, 16);
  let originalDisposals = 0;
  originalTarget.addEventListener('dispose', () => originalDisposals++);
  const renderer = {
    target: originalTarget, face: 4, level: 2,
    autoClear: true, toneMapping: THREE.ACESFilmicToneMapping,
    xr: { enabled: true }, color: new THREE.Color(0x123456), alpha: 0.42,
    bindings: [],
    getRenderTarget() { assert.equal(this, renderer); return this.target; },
    getActiveCubeFace() { assert.equal(this, renderer); return this.face; },
    getActiveMipmapLevel() { assert.equal(this, renderer); return this.level; },
    getClearColor(target) { assert.equal(this, renderer); return target.copy(this.color); },
    getClearAlpha() { assert.equal(this, renderer); return this.alpha; },
    setClearColor(color, alpha) { assert.equal(this, renderer); this.color.copy(color); this.alpha = alpha; },
    setRenderTarget(target, face = 0, level = 0) {
      assert.equal(this, renderer, 'the original renderer method must retain its receiver');
      this.target = target; this.face = face; this.level = level;
      this.bindings.push({ target, face, level });
    },
  };
  const originalSetter = renderer.setRenderTarget;
  const assertRestored = () => {
    assert.equal(renderer.setRenderTarget, originalSetter);
    assert.equal(renderer.target, originalTarget);
    assert.equal(renderer.face, 4);
    assert.equal(renderer.level, 2);
    assert.equal(renderer.autoClear, true);
    assert.equal(renderer.toneMapping, THREE.ACESFilmicToneMapping);
    assert.equal(renderer.xr.enabled, true);
    assert.equal(renderer.color.getHex(), 0x123456);
    assert.equal(renderer.alpha, 0.42);
    assert.equal(originalDisposals, 0, 'the caller-owned previous target must remain alive');
  };
  return { renderer, originalTarget, assertRestored };
}

function changeRendererState(renderer) {
  renderer.autoClear = false;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.xr.enabled = false;
  renderer.setClearColor(new THREE.Color(0xff8800), 0.1);
}

function stubGeneration(fromScene, run) {
  const originalFromScene = THREE.PMREMGenerator.prototype.fromScene;
  const originalGeneratorDispose = THREE.PMREMGenerator.prototype.dispose;
  const originalRoomDispose = RoomEnvironment.prototype.dispose;
  const cleanup = { generators: 0, rooms: 0 };
  THREE.PMREMGenerator.prototype.fromScene = fromScene;
  THREE.PMREMGenerator.prototype.dispose = function () {
    cleanup.generators++;
    return originalGeneratorDispose.call(this);
  };
  RoomEnvironment.prototype.dispose = function () {
    cleanup.rooms++;
    return originalRoomDispose.call(this);
  };
  try { run(cleanup); }
  finally {
    THREE.PMREMGenerator.prototype.fromScene = originalFromScene;
    THREE.PMREMGenerator.prototype.dispose = originalGeneratorDispose;
    RoomEnvironment.prototype.dispose = originalRoomDispose;
  }
}

test('successful generation preserves the environment and restores renderer state and method identity', () => {
  const f = fixture();
  const output = new THREE.WebGLRenderTarget(32, 32);
  let outputDisposals = 0;
  output.addEventListener('dispose', () => outputDisposals++);
  try {
    stubGeneration(function (room, sigma) {
      assert.ok(room instanceof RoomEnvironment);
      assert.equal(sigma, 0.04);
      changeRendererState(f.renderer);
      f.renderer.setRenderTarget(output, 1, 3);
      return output;
    }, cleanup => {
      assert.equal(createEnvironment(f.renderer), output);
      f.assertRestored();
      assert.deepEqual(cleanup, { generators: 1, rooms: 1 });
      assert.equal(outputDisposals, 0, 'the returned environment belongs to the caller');
      assert.equal(f.renderer.bindings.length, 2);
    });
  } finally { output.dispose(); f.originalTarget.dispose(); }
});

test('a failure after switching to a later target releases the first output once and restores state', () => {
  const f = fixture();
  const output = new THREE.WebGLRenderTarget(32, 32);
  const laterTarget = new THREE.WebGLRenderTarget(32, 32);
  const failure = new Error('PMREM filtering failed');
  let outputDisposals = 0;
  let laterDisposals = 0;
  output.addEventListener('dispose', () => outputDisposals++);
  laterTarget.addEventListener('dispose', () => laterDisposals++);
  try {
    stubGeneration(function () {
      changeRendererState(f.renderer);
      f.renderer.setRenderTarget(output, 0, 0);
      f.renderer.setRenderTarget(laterTarget, 5, 1);
      throw failure;
    }, cleanup => {
      assert.throws(() => createEnvironment(f.renderer), error => error === failure);
      f.assertRestored();
      assert.deepEqual(cleanup, { generators: 1, rooms: 1 });
      assert.equal(outputDisposals, 1, 'release the output even when it is no longer bound');
      assert.equal(laterDisposals, 0, 'the generator owns its later ping-pong targets');
    });
  } finally { laterTarget.dispose(); f.originalTarget.dispose(); }
});

test('a failure before a new target is bound restores state without disposing the previous target', () => {
  const f = fixture();
  const failure = new Error('PMREM allocation failed');
  try {
    stubGeneration(function () {
      changeRendererState(f.renderer);
      f.renderer.setRenderTarget(f.originalTarget, 0, 0);
      throw failure;
    }, cleanup => {
      assert.throws(() => createEnvironment(f.renderer), error => error === failure);
      f.assertRestored();
      assert.deepEqual(cleanup, { generators: 1, rooms: 1 });
    });
  } finally { f.originalTarget.dispose(); }
});
