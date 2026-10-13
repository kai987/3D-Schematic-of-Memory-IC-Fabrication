import { useCallback, useEffect, useRef, useState } from 'react';
import { DEMO_ROUTE } from '../data/processes';
import { advancePlayback, STEP_SECONDS, TRANSFER_SECONDS } from '../lib/playback';

export interface SimulationSnapshot { stage: number; previousStage: number; transfer: number; processing: number; playing: boolean; time: number }

export function useSimulation(suspended = false, route: readonly number[] = DEMO_ROUTE) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [position, setPosition] = useState({ cursor: 2, elapsed: TRANSFER_SECONDS, ended: false });
  const positionRef = useRef(position);
  const snapshot = useRef<SimulationSnapshot>({ stage: 2, previousStage: 1, transfer: 1, processing: 0, playing: false, time: 0 });
  const stage = route[position.cursor];

  const updateSnapshot = useCallback((pos: typeof position, isPlaying: boolean) => {
    snapshot.current = {
      stage: route[pos.cursor],
      previousStage: route[Math.max(0, pos.cursor - 1)],
      transfer: Math.min(1, pos.elapsed / TRANSFER_SECONDS),
      processing: Math.max(0, (pos.elapsed - TRANSFER_SECONDS) / (STEP_SECONDS - TRANSFER_SECONDS)),
      playing: isPlaying,
      time: pos.cursor * STEP_SECONDS + pos.elapsed,
    };
  }, [route]);

  useEffect(() => {
    updateSnapshot(positionRef.current, playing && !suspended);
    if (!playing || suspended) {
      // Keep the last visible position while graphics resources are unavailable.
      setPosition(positionRef.current);
      return;
    }
    let raf = 0;
    let previousTime = 0;
    let lastPublish = 0;
    const frame = (now: number) => {
      // Don't consume hidden-tab time: users should see every stage on return.
      const delta = previousTime ? Math.min(0.2, (now - previousTime) / 1000) : 0;
      previousTime = now;
      const next = advancePlayback(positionRef.current.cursor, positionRef.current.elapsed, delta, speed, route.length);
      positionRef.current = next;
      updateSnapshot(next, !next.ended);
      if (now - lastPublish > 80 || next.ended) { setPosition(next); lastPublish = now; }
      if (next.ended) { setPlaying(false); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, suspended, updateSnapshot, route]);

  const seek = useCallback((cursor: number, elapsed = TRANSFER_SECONDS) => {
    const next = { cursor: Math.max(0, Math.min(route.length - 1, cursor)), elapsed, ended: false };
    positionRef.current = next;
    setPosition(next);
    setPlaying(false);
    updateSnapshot(next, false);
  }, [updateSnapshot, route]);

  const selectStage = useCallback((id: number) => seek(route.indexOf(id)), [seek, route]);
  const togglePlaying = useCallback(() => {
    if (positionRef.current.ended) {
      const start = { cursor: 0, elapsed: 0, ended: false };
      positionRef.current = start;
      setPosition(start);
    }
    setPlaying(value => !value);
  }, []);
  const reset = useCallback(() => seek(0, 0), [seek]);

  return { playing, speed, setSpeed, position, stage, snapshot, seek, selectStage, togglePlaying, reset, routeLength: route.length,
    progress: (position.cursor + position.elapsed / STEP_SECONDS) / route.length,
    processing: position.elapsed >= TRANSFER_SECONDS,
  };
}
