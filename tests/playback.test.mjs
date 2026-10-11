import test from 'node:test';
import assert from 'node:assert/strict';
import { advancePlayback, STEP_SECONDS } from '../src/lib/playback.ts';
import { DEMO_ROUTE } from '../src/data/processes.ts';

test('preserves overflow across repeated process steps and respects playback speed', () => {
  assert.deepEqual(advancePlayback(4, 5.5, 1, 2, DEMO_ROUTE.length), { cursor: 5, elapsed: 1.5, ended: false });
});
test('stops at the end of the illustrated wafer demo instead of silently looping', () => {
  const last = DEMO_ROUTE.length - 1;
  assert.deepEqual(advancePlayback(last, 5, 10, 1, DEMO_ROUTE.length), { cursor: last, elapsed: STEP_SECONDS, ended: true });
});
test('does not advance on negative elapsed deltas and handles an empty route', () => {
  assert.deepEqual(advancePlayback(2, 1, -5, 1, DEMO_ROUTE.length), { cursor: 2, elapsed: 1, ended: false });
  assert.deepEqual(advancePlayback(0, 0, 1, 1, 0), { cursor: 0, elapsed: 0, ended: true });
});
