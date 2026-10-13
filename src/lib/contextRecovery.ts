export interface ContextRecoveryOptions {
  canvas: EventTarget;
  /** Recreate application-owned GPU resources after the context is restored. */
  rebuild: () => void | Promise<void>;
  /** Pause rendering and expose the context-loss error. */
  onLost: () => void;
  /** Clear the error and resume only if the document is also visible. */
  onRecovered: () => void;
  onFailure?: (error: unknown) => void;
}

export interface ContextRecovery {
  /** Remains true during rebuilding and after a failed rebuild. */
  isLost: () => boolean;
  isRecovering: () => boolean;
  /** False when unavailable, disposed, canceled or failed; concurrent retries coalesce. */
  retry: () => Promise<boolean>;
  dispose: () => void;
}

interface RecoveryAttempt {
  promise: Promise<boolean>;
  settle: (success: boolean) => void;
}

/**
 * Coordinates canvas context events without changing document visibility or
 * playback intent. Render eligibility is `!isLost() && documentIsVisible`.
 * Synchronous rebuilds complete in the restored event; asynchronous completions
 * are ignored after another loss or disposal. Callbacks should not throw.
 */
export function createContextRecovery({ canvas, rebuild, onLost, onRecovered, onFailure }: ContextRecoveryOptions): ContextRecovery {
  let lost = false;
  let contextAvailable = true;
  let disposed = false;
  let pending: RecoveryAttempt | null = null;

  const cancelPending = () => {
    pending?.settle(false);
    pending = null;
  };

  const retry = (): Promise<boolean> => {
    if (disposed || !lost || !contextAvailable) return Promise.resolve(false);
    if (pending) return pending.promise;

    let settle!: (success: boolean) => void;
    const promise = new Promise<boolean>(resolve => { settle = resolve; });
    const attempt: RecoveryAttempt = { promise, settle };
    // Set pending before calling rebuild so even reentrant retries coalesce.
    pending = attempt;
    const complete = (success: boolean, error?: unknown) => {
      if (disposed || pending !== attempt || !contextAvailable) return;
      pending = null;
      attempt.settle(success);
      if (success) {
        lost = false;
        onRecovered();
      } else onFailure?.(error);
    };

    let result: void | Promise<void>;
    try {
      result = rebuild();
    } catch (error) {
      complete(false, error);
      return promise;
    }
    if (result) void result.then(() => complete(true), error => complete(false, error));
    else complete(true);
    return promise;
  };

  const contextLost = (event: Event) => {
    if (disposed) return;
    event.preventDefault();
    const wasLost = lost;
    contextAvailable = false;
    cancelPending();
    lost = true;
    if (!wasLost) onLost();
  };

  const contextRestored = () => {
    if (disposed) return;
    contextAvailable = true;
    void retry();
  };

  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);

  return {
    isLost: () => lost,
    isRecovering: () => pending !== null,
    retry,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelPending();
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
    },
  };
}
