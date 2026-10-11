import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemandLoop } from '../src/lib/demandLoop.ts';

function fakeRAF() {
  let nextId = 0;
  const pending = new Map();
  const canceled = [];
  return {
    requestFrame(callback) {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    },
    cancelFrame(id) {
      canceled.push(id);
      pending.delete(id);
    },
    step() {
      assert.ok(pending.size > 0, 'a frame must be scheduled before stepping');
      const callbacks = [...pending.values()];
      pending.clear();
      for (const callback of callbacks) callback(16);
    },
    get pendingCount() { return pending.size; },
    get nextCallback() { return pending.values().next().value; },
    canceled,
  };
}

test('starts idle and coalesces invalidations into one render', () => {
  const raf = fakeRAF();
  let renders = 0;
  const loop = createDemandLoop({ ...raf, render: () => { renders++; return false; } });
  assert.equal(raf.pendingCount, 0);
  loop.invalidate();
  loop.invalidate();
  loop.invalidate();
  assert.equal(raf.pendingCount, 1);
  raf.step();
  assert.equal(renders, 1);
  assert.equal(raf.pendingCount, 0);
  loop.invalidate();
  raf.step();
  assert.equal(renders, 2);
  assert.equal(raf.pendingCount, 0);
});

test('continues during animation, stops when paused and resumes on invalidation', () => {
  const raf = fakeRAF();
  let playing = true;
  let renders = 0;
  const loop = createDemandLoop({ ...raf, render: () => { renders++; return playing; } });
  loop.invalidate();
  raf.step();
  assert.equal(raf.pendingCount, 1);
  loop.invalidate();
  loop.invalidate();
  assert.equal(raf.pendingCount, 1);
  raf.step();
  playing = false;
  raf.step();
  assert.equal(renders, 3);
  assert.equal(raf.pendingCount, 0);
  playing = true;
  loop.invalidate();
  raf.step();
  assert.equal(renders, 4);
  assert.equal(raf.pendingCount, 1);
  loop.dispose();
});

test('retains and coalesces invalidations issued during a render that returns false', () => {
  const raf = fakeRAF();
  let renders = 0;
  const loop = createDemandLoop({ ...raf, render: () => {
    renders++;
    if (renders === 1) {
      loop.invalidate();
      loop.invalidate();
      assert.equal(raf.pendingCount, 0, 'schedule after the current render completes');
    }
    return false;
  } });
  loop.invalidate();
  raf.step();
  assert.equal(renders, 1);
  assert.equal(raf.pendingCount, 1);
  raf.step();
  assert.equal(renders, 2);
  assert.equal(raf.pendingCount, 0);
});

test('hiding cancels a queued frame including RAF id zero and coalesces hidden requests', () => {
  const raf = fakeRAF();
  let renders = 0;
  const loop = createDemandLoop({ ...raf, render: () => { renders++; return false; } });
  loop.invalidate();
  loop.setVisible(false);
  assert.deepEqual(raf.canceled, [0]);
  assert.equal(raf.pendingCount, 0);
  loop.invalidate();
  loop.invalidate();
  loop.setVisible(false);
  assert.equal(raf.pendingCount, 0);
  loop.setVisible(true);
  loop.setVisible(true);
  assert.equal(raf.pendingCount, 1);
  raf.step();
  assert.equal(renders, 1);
  assert.equal(raf.pendingCount, 0);
});

test('becoming visible refreshes even without dirty requests or active animation', () => {
  const raf = fakeRAF();
  let renders = 0;
  const loop = createDemandLoop({ ...raf, render: () => { renders++; return false; } });
  loop.setVisible(true);
  assert.equal(raf.pendingCount, 0, 'unchanged visibility does not wake an idle loop');
  loop.setVisible(false);
  loop.setVisible(true);
  assert.equal(raf.pendingCount, 1);
  raf.step();
  assert.equal(renders, 1);
  assert.equal(raf.pendingCount, 0);
});

test('hiding during rendering stops animation until visibility resumes', () => {
  const raf = fakeRAF();
  let renders = 0;
  const loop = createDemandLoop({ ...raf, render: () => {
    renders++;
    if (renders === 1) loop.setVisible(false);
    return true;
  } });
  loop.invalidate();
  raf.step();
  assert.equal(raf.pendingCount, 0);
  loop.setVisible(true);
  raf.step();
  assert.equal(renders, 2);
  assert.equal(raf.pendingCount, 1);
  loop.dispose();
});

test('a stale canceled callback cannot render or consume a newly scheduled frame', () => {
  const raf = fakeRAF();
  let renders = 0;
  const loop = createDemandLoop({ ...raf, render: () => { renders++; return false; } });
  loop.invalidate();
  const staleCallback = raf.nextCallback;
  loop.setVisible(false);
  loop.setVisible(true);
  staleCallback(16);
  assert.equal(renders, 0);
  loop.invalidate();
  assert.equal(raf.pendingCount, 1);
  raf.step();
  assert.equal(renders, 1);
  assert.equal(raf.pendingCount, 0);
});

test('disposal cancels queued work and permanently ignores invalidation and visibility', () => {
  const raf = fakeRAF();
  let renders = 0;
  const loop = createDemandLoop({ ...raf, render: () => { renders++; return true; } });
  loop.invalidate();
  const staleCallback = raf.nextCallback;
  loop.dispose();
  loop.dispose();
  loop.invalidate();
  loop.setVisible(false);
  loop.setVisible(true);
  staleCallback(16);
  assert.equal(renders, 0);
  assert.equal(raf.pendingCount, 0);
  assert.deepEqual(raf.canceled, [0]);
});

test('disposal during rendering prevents continuation and drops reentrant requests', () => {
  const raf = fakeRAF();
  let renders = 0;
  const loop = createDemandLoop({ ...raf, render: () => {
    renders++;
    loop.invalidate();
    loop.dispose();
    loop.invalidate();
    return true;
  } });
  loop.invalidate();
  raf.step();
  assert.equal(renders, 1);
  assert.equal(raf.pendingCount, 0);
});
