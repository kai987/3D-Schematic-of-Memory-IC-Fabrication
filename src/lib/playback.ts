export interface PlaybackPosition { cursor: number; elapsed: number; ended: boolean }

export const STEP_SECONDS = 6;
export const TRANSFER_SECONDS = 1.8;

/** Bounded elapsed-time advance; retains overflow when a slow frame crosses steps. */
export function advancePlayback(cursor: number, elapsed: number, delta: number, speed: number, routeLength: number): PlaybackPosition {
  if (routeLength < 1) return { cursor: 0, elapsed: 0, ended: true };
  const total = Math.max(0, Math.min(cursor, routeLength - 1)) * STEP_SECONDS
    + Math.max(0, elapsed) + Math.max(0, delta) * Math.max(0, speed);
  if (total >= routeLength * STEP_SECONDS) return { cursor: routeLength - 1, elapsed: STEP_SECONDS, ended: true };
  return { cursor: Math.floor(total / STEP_SECONDS), elapsed: total % STEP_SECONDS, ended: false };
}
