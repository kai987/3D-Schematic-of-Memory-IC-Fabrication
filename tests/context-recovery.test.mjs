import test from 'node:test';
import assert from 'node:assert/strict';
import { createContextRecovery } from '../src/lib/contextRecovery.ts';
import { createDemandLoop } from '../src/lib/demandLoop.ts';

class CanvasEvents extends EventTarget {
  listeners = new Map();
  addEventListener(type, callback, options) {
    super.addEventListener(type, callback, options);
    this.listeners.set(type, callback);
  }
  removeEventListener(type, callback, options) {
    super.removeEventListener(type, callback, options);
    if (this.listeners.get(type) === callback) this.listeners.delete(type);
  }
  emit(type) {
    const event = new Event(type, { cancelable: true });
    this.dispatchEvent(event);
    return event;
  }
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function fakeRAF() {
  let nextId = 0;
  const pending = new Map();
  return {
    requestFrame(callback) { const id = nextId++; pending.set(id, callback); return id; },
    cancelFrame(id) { pending.delete(id); },
    get pendingCount() { return pending.size; },
    step() { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(callback => callback(16)); },
  };
}

test('loss pauses once, prevents default every time, and synchronous restoration recovers once', async () => {
  const canvas = new CanvasEvents();
  const events = [];
  let recovery;
  recovery = createContextRecovery({
    canvas,
    rebuild() { events.push(['rebuild', recovery.isLost(), recovery.isRecovering()]); },
    onLost() { events.push(['lost', recovery.isLost()]); },
    onRecovered() { events.push(['recovered', recovery.isLost(), recovery.isRecovering()]); },
  });
  assert.equal(canvas.listeners.size, 2);
  assert.equal(await recovery.retry(), false);
  canvas.emit('webglcontextrestored');
  assert.deepEqual(events, [], 'an unsolicited restored event must not rebuild or resume');
  assert.equal(canvas.emit('webglcontextlost').defaultPrevented, true);
  assert.equal(canvas.emit('webglcontextlost').defaultPrevented, true);
  assert.equal(recovery.isLost(), true);
  assert.equal(await recovery.retry(), false, 'wait for physical context restoration before rebuilding');
  assert.deepEqual(events, [['lost', true]]);
  canvas.emit('webglcontextrestored');
  assert.equal(recovery.isLost(), false, 'a synchronous resource rebuild clears loss in the restored event');
  assert.deepEqual(events, [['lost', true], ['rebuild', true, true], ['recovered', false, false]]);
  canvas.emit('webglcontextrestored');
  assert.equal(events.length, 3);
  canvas.emit('webglcontextlost');
  assert.deepEqual(events.at(-1), ['lost', true], 'a later context loss must pause again');
  recovery.dispose();
});

test('a failed resource rebuild keeps the error/render pause and can be retried', async () => {
  const canvas = new CanvasEvents();
  const failure = new Error('resource rebuild failed');
  let shouldFail = true;
  let rebuilds = 0;
  let resumed = 0;
  const failures = [];
  const recovery = createContextRecovery({
    canvas, onLost() {},
    rebuild() { rebuilds++; if (shouldFail) throw failure; },
    onRecovered() { resumed++; },
    onFailure(error) { failures.push(error); },
  });
  canvas.emit('webglcontextlost');
  canvas.emit('webglcontextrestored');
  assert.equal(recovery.isLost(), true);
  assert.equal(recovery.isRecovering(), false);
  assert.deepEqual(failures, [failure]);
  assert.equal(resumed, 0);
  assert.equal(await recovery.retry(), false);
  assert.equal(resumed, 0, 'another failed retry must not clear the error or resume rendering');
  shouldFail = false;
  assert.equal(await recovery.retry(), true);
  assert.equal(recovery.isLost(), false);
  assert.equal(resumed, 1);
  assert.equal(rebuilds, 3);
  recovery.dispose();
});

test('duplicate restored events and concurrent retries share one asynchronous resource rebuild', async () => {
  const canvas = new CanvasEvents();
  const resource = deferred();
  let rebuilds = 0;
  let resumed = 0;
  const recovery = createContextRecovery({
    canvas, onLost() {}, rebuild() { rebuilds++; return resource.promise; }, onRecovered() { resumed++; },
  });
  canvas.emit('webglcontextlost');
  canvas.emit('webglcontextrestored');
  const first = recovery.retry();
  canvas.emit('webglcontextrestored');
  assert.equal(recovery.retry(), first);
  assert.equal(recovery.isLost(), true);
  assert.equal(recovery.isRecovering(), true);
  assert.equal(rebuilds, 1);
  resource.resolve();
  assert.equal(await first, true);
  assert.equal(recovery.isLost(), false);
  assert.equal(recovery.isRecovering(), false);
  assert.equal(resumed, 1);
  canvas.emit('webglcontextrestored');
  assert.equal(rebuilds, 1);
  recovery.dispose();
});

for (const staleResult of ['resolve', 'reject']) {
  test(`a new loss ignores a stale asynchronous ${staleResult} completion`, async () => {
    const canvas = new CanvasEvents();
    const oldResource = deferred();
    const newResource = deferred();
    let rebuilds = 0;
    let paused = 0;
    let resumed = 0;
    const failures = [];
    const recovery = createContextRecovery({
      canvas,
      onLost() { paused++; },
      rebuild() { return (rebuilds++ === 0 ? oldResource : newResource).promise; },
      onRecovered() { resumed++; },
      onFailure(error) { failures.push(error); },
    });
    canvas.emit('webglcontextlost');
    canvas.emit('webglcontextrestored');
    const oldAttempt = recovery.retry();
    canvas.emit('webglcontextlost');
    assert.equal(await oldAttempt, false, 'superseded work settles as canceled immediately');
    assert.equal(recovery.isRecovering(), false);
    assert.equal(await recovery.retry(), false);
    canvas.emit('webglcontextrestored');
    const newAttempt = recovery.retry();
    oldResource[staleResult](staleResult === 'reject' ? new Error('stale failure') : undefined);
    await Promise.resolve();
    assert.equal(recovery.isLost(), true);
    assert.equal(recovery.isRecovering(), true);
    assert.equal(resumed, 0);
    assert.equal(paused, 1, 'rendering remains paused across overlapping losses');
    assert.deepEqual(failures, []);
    newResource.resolve();
    assert.equal(await newAttempt, true);
    assert.equal(recovery.isLost(), false);
    assert.equal(resumed, 1);
    recovery.dispose();
  });
}

test('disposal removes both listeners, cancels pending recovery, and ignores stale callbacks', async () => {
  const canvas = new CanvasEvents();
  const resource = deferred();
  let paused = 0;
  let resumed = 0;
  let failed = 0;
  const recovery = createContextRecovery({
    canvas, rebuild: () => resource.promise,
    onLost() { paused++; }, onRecovered() { resumed++; }, onFailure() { failed++; },
  });
  const oldLostListener = canvas.listeners.get('webglcontextlost');
  const oldRestoredListener = canvas.listeners.get('webglcontextrestored');
  canvas.emit('webglcontextlost');
  canvas.emit('webglcontextrestored');
  const attempt = recovery.retry();
  recovery.dispose();
  recovery.dispose();
  assert.equal(canvas.listeners.size, 0);
  assert.equal(await attempt, false);
  assert.equal(recovery.isRecovering(), false);
  assert.equal(await recovery.retry(), false);
  assert.equal(canvas.emit('webglcontextlost').defaultPrevented, false);
  canvas.emit('webglcontextrestored');
  oldLostListener(new Event('webglcontextlost', { cancelable: true }));
  oldRestoredListener();
  resource.reject(new Error('disposed rebuild'));
  await Promise.resolve();
  assert.equal(paused, 1);
  assert.equal(resumed, 0);
  assert.equal(failed, 0);
});

test('document visibility and context loss independently gate demand rendering', async () => {
  const raf = fakeRAF();
  let hidden = false;
  let shouldFail = false;
  let renders = 0;
  const demand = createDemandLoop({ ...raf, render() { renders++; return false; } });
  const canvas = new CanvasEvents();
  let recovery;
  const updateVisibility = () => demand.setVisible(!hidden && !recovery.isLost());
  recovery = createContextRecovery({
    canvas, onLost: updateVisibility, onRecovered: updateVisibility,
    rebuild() { if (shouldFail) throw new Error('environment unavailable'); },
  });
  demand.invalidate();
  assert.equal(raf.pendingCount, 1);
  canvas.emit('webglcontextlost');
  assert.equal(raf.pendingCount, 0);
  hidden = true; updateVisibility();
  hidden = false; updateVisibility();
  demand.invalidate();
  assert.equal(raf.pendingCount, 0, 'showing the document must not resume a lost context');
  hidden = true; updateVisibility();
  canvas.emit('webglcontextrestored');
  assert.equal(recovery.isLost(), false);
  assert.equal(raf.pendingCount, 0, 'restoration must not resume a hidden document');
  hidden = false; updateVisibility();
  assert.equal(raf.pendingCount, 1);
  raf.step();
  assert.equal(renders, 1);

  shouldFail = true;
  canvas.emit('webglcontextlost');
  canvas.emit('webglcontextrestored');
  demand.invalidate();
  hidden = true; updateVisibility();
  hidden = false; updateVisibility();
  assert.equal(raf.pendingCount, 0, 'failed rebuilds remain stopped even after visibility changes');
  assert.equal(await recovery.retry(), false);
  assert.equal(raf.pendingCount, 0);
  shouldFail = false;
  assert.equal(await recovery.retry(), true);
  assert.equal(raf.pendingCount, 1);
  recovery.dispose();
  demand.dispose();
});
