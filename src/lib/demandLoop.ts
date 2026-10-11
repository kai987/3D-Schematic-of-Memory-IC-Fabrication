export interface DemandLoopOptions {
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
  /** Return true while another animation frame is needed. */
  render: () => boolean;
}

export interface DemandLoop {
  invalidate: () => void;
  setVisible: (visible: boolean) => void;
  dispose: () => void;
}

/** Starts idle; invalidation requests one frame, while render can request more. */
export function createDemandLoop({ requestFrame, cancelFrame, render }: DemandLoopOptions): DemandLoop {
  let frameId: number | null = null;
  let generation = 0;
  let visible = true;
  let disposed = false;
  let rendering = false;
  let dirty = false;

  const schedule = () => {
    if (disposed || !visible || rendering || frameId !== null) return;
    const scheduledGeneration = ++generation;
    frameId = requestFrame(() => {
      // Ignore a callback canceled before visibility changed or disposal.
      if (disposed || !visible || scheduledGeneration !== generation) return;
      frameId = null;
      // Consume only requests preceding this render, retaining reentrant ones.
      dirty = false;
      rendering = true;
      let keepRunning = false;
      try {
        keepRunning = render();
      } finally {
        rendering = false;
      }
      if (keepRunning || dirty) schedule();
    });
  };

  const cancelPending = () => {
    ++generation;
    if (frameId !== null) cancelFrame(frameId);
    frameId = null;
  };

  const invalidate = () => {
    if (disposed) return;
    dirty = true;
    schedule();
  };

  return {
    invalidate,
    setVisible(nextVisible) {
      if (disposed || visible === nextVisible) return;
      visible = nextVisible;
      if (visible) invalidate();
      else cancelPending();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      dirty = false;
      cancelPending();
    },
  };
}
