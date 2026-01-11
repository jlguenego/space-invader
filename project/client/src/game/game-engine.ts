export type GameEngineStatus = 'idle' | 'running' | 'paused' | 'gameover';

export type GameEngineState =
  | { status: 'idle'; score: 0 }
  | { status: 'running'; score: number }
  | { status: 'paused'; score: number }
  | { status: 'gameover'; score: number; finalScore: number };

export type GameEngineOptions = {
  scorePerSecond?: number;
  maxStepMs?: number;
  onScoreDelta?: (amount: number) => void;
  onScoreChanged?: (score: number) => void;
  onStateChanged?: (next: GameEngineState) => void;
  onGameOver?: (finalScore: number) => void;
};

export type GameEngine = {
  getState: () => GameEngineState;
  startNewGame: () => void;
  togglePause: () => void;
  triggerGameOver: () => void;
  step: (dtMs: number) => void;
  startLoop: () => void;
  stopLoop: () => void;
};

const DEFAULT_MAX_STEP_MS = 100;

function clampStepMs(dtMs: number, maxStepMs: number): number {
  if (!Number.isFinite(dtMs)) return 0;
  if (dtMs <= 0) return 0;
  if (dtMs > maxStepMs) return maxStepMs;
  return dtMs;
}

function safeOptions(options: GameEngineOptions | undefined): Required<GameEngineOptions> {
  return {
    scorePerSecond: Math.max(0, options?.scorePerSecond ?? 0),
    maxStepMs: Math.max(1, options?.maxStepMs ?? DEFAULT_MAX_STEP_MS),
    onScoreDelta: options?.onScoreDelta ?? (() => {}),
    onScoreChanged: options?.onScoreChanged ?? (() => {}),
    onStateChanged: options?.onStateChanged ?? (() => {}),
    onGameOver: options?.onGameOver ?? (() => {}),
  };
}

export function createGameEngine(options?: GameEngineOptions): GameEngine {
  const opts = safeOptions(options);

  let state: GameEngineState = { status: 'idle', score: 0 };
  let scoreRemainder = 0;

  let desiredLoopRunning = false;
  let rafId: number | null = null;
  let lastTimestampMs = 0;

  function emitState(next: GameEngineState): void {
    state = next;
    opts.onStateChanged(next);
  }

  function emitScoreDelta(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) return;
    opts.onScoreDelta(amount);
  }

  function emitScoreChanged(score: number): void {
    if (!Number.isFinite(score) || score < 0) return;
    opts.onScoreChanged(score);
  }

  function stopRaf(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function maybeStartRaf(): void {
    if (!desiredLoopRunning) return;
    if (rafId !== null) return;

    if (state.status !== 'running' && state.status !== 'paused') return;

    lastTimestampMs = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function frame(timestampMs: number): void {
    if (!desiredLoopRunning) {
      stopRaf();
      return;
    }

    if (state.status !== 'running' && state.status !== 'paused') {
      stopRaf();
      return;
    }

    rafId = requestAnimationFrame(frame);

    const dtMs = timestampMs - lastTimestampMs;
    lastTimestampMs = timestampMs;

    step(dtMs);
  }

  function step(dtMs: number): void {
    if (state.status !== 'running') return;

    const clampedMs = clampStepMs(dtMs, opts.maxStepMs);
    if (clampedMs <= 0) return;

    if (opts.scorePerSecond <= 0) return;

    const points = (opts.scorePerSecond * clampedMs) / 1000;
    const total = scoreRemainder + points;
    const delta = Math.floor(total);
    scoreRemainder = total - delta;

    if (delta <= 0) return;

    const nextScore = state.score + delta;
    emitState({ status: 'running', score: nextScore });
    emitScoreDelta(delta);
    emitScoreChanged(nextScore);
  }

  function startNewGame(): void {
    scoreRemainder = 0;
    emitState({ status: 'running', score: 0 });
    emitScoreChanged(0);
    maybeStartRaf();
  }

  function togglePause(): void {
    if (state.status === 'running') {
      emitState({ status: 'paused', score: state.score });
      return;
    }

    if (state.status === 'paused') {
      emitState({ status: 'running', score: state.score });
      // Avoid a huge dt on resume if the rAF loop stayed alive.
      lastTimestampMs = performance.now();
      maybeStartRaf();
    }
  }

  function triggerGameOver(): void {
    if (state.status !== 'running' && state.status !== 'paused') return;

    const finalScore = state.score;
    emitState({ status: 'gameover', score: finalScore, finalScore });
    opts.onGameOver(finalScore);

    // Stop background loop by default; a new game can restart it.
    stopLoop();
  }

  function startLoop(): void {
    if (
      typeof requestAnimationFrame === 'undefined' ||
      typeof cancelAnimationFrame === 'undefined'
    ) {
      throw new Error('GameEngine.startLoop() requires requestAnimationFrame.');
    }
    if (typeof performance === 'undefined') {
      throw new Error('GameEngine.startLoop() requires performance.now().');
    }

    desiredLoopRunning = true;
    maybeStartRaf();
  }

  function stopLoop(): void {
    desiredLoopRunning = false;
    stopRaf();
  }

  return {
    getState: () => state,
    startNewGame,
    togglePause,
    triggerGameOver,
    step,
    startLoop,
    stopLoop,
  };
}
