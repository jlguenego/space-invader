import { describe, expect, test } from 'bun:test';

import { createGameEngine } from './game-engine';

describe('GameEngine', () => {
  test('starts in idle', () => {
    const engine = createGameEngine();
    expect(engine.getState()).toEqual({ status: 'idle', score: 0 });
  });

  test('startNewGame() moves to running and resets score', () => {
    const engine = createGameEngine({ scorePerSecond: 10, maxStepMs: 1000 });

    engine.startNewGame();
    expect(engine.getState()).toEqual({ status: 'running', score: 0 });

    engine.step(1000);
    expect(engine.getState()).toEqual({ status: 'running', score: 10 });

    engine.startNewGame();
    expect(engine.getState()).toEqual({ status: 'running', score: 0 });
  });

  test('togglePause() toggles between running and paused (idempotent outside game)', () => {
    const engine = createGameEngine({ scorePerSecond: 10, maxStepMs: 1000 });

    // No effect in idle.
    engine.togglePause();
    expect(engine.getState()).toEqual({ status: 'idle', score: 0 });

    engine.startNewGame();
    engine.step(1000);
    expect(engine.getState()).toEqual({ status: 'running', score: 10 });

    engine.togglePause();
    expect(engine.getState()).toEqual({ status: 'paused', score: 10 });

    engine.togglePause();
    expect(engine.getState()).toEqual({ status: 'running', score: 10 });
  });

  test('step() is a no-op while paused', () => {
    const engine = createGameEngine({ scorePerSecond: 20, maxStepMs: 1000 });

    engine.startNewGame();
    engine.step(500);
    expect(engine.getState()).toEqual({ status: 'running', score: 10 });

    engine.togglePause();
    expect(engine.getState()).toEqual({ status: 'paused', score: 10 });

    engine.step(1000);
    expect(engine.getState()).toEqual({ status: 'paused', score: 10 });

    engine.togglePause();
    engine.step(500);
    expect(engine.getState()).toEqual({ status: 'running', score: 20 });
  });

  test('triggerGameOver() works from running and from paused and freezes score', () => {
    const observedFinalScores: number[] = [];
    const engine = createGameEngine({
      scorePerSecond: 20,
      maxStepMs: 1000,
      onGameOver: (finalScore) => observedFinalScores.push(finalScore),
    });

    engine.startNewGame();
    engine.step(500);
    engine.triggerGameOver();

    expect(engine.getState()).toEqual({ status: 'gameover', score: 10, finalScore: 10 });
    expect(observedFinalScores).toEqual([10]);

    engine.step(1000);
    expect(engine.getState()).toEqual({ status: 'gameover', score: 10, finalScore: 10 });

    // From paused
    engine.startNewGame();
    engine.step(250);
    engine.togglePause();
    engine.triggerGameOver();
    expect(engine.getState()).toEqual({ status: 'gameover', score: 5, finalScore: 5 });
    expect(observedFinalScores).toEqual([10, 5]);
  });

  test('clamps invalid dtMs and large dtMs via maxStepMs', () => {
    const engine = createGameEngine({ scorePerSecond: 20, maxStepMs: 100 });
    engine.startNewGame();

    engine.step(NaN);
    engine.step(-10);
    engine.step(Infinity);
    expect(engine.getState()).toEqual({ status: 'running', score: 0 });

    // Clamped to 100ms => 2 points
    engine.step(1000);
    expect(engine.getState()).toEqual({ status: 'running', score: 2 });
  });

  test('accumulates fractional points over multiple small steps', () => {
    const engine = createGameEngine({ scorePerSecond: 20, maxStepMs: 1000 });
    engine.startNewGame();

    // 25ms => 0.5 point
    engine.step(25);
    expect(engine.getState()).toEqual({ status: 'running', score: 0 });

    engine.step(25);
    expect(engine.getState()).toEqual({ status: 'running', score: 1 });

    engine.step(25);
    engine.step(25);
    expect(engine.getState()).toEqual({ status: 'running', score: 2 });
  });

  test('emits score callbacks only when score increases', () => {
    const deltas: number[] = [];
    const scores: number[] = [];

    const engine = createGameEngine({
      scorePerSecond: 20,
      maxStepMs: 1000,
      onScoreDelta: (d) => deltas.push(d),
      onScoreChanged: (s) => scores.push(s),
    });

    engine.startNewGame();
    expect(scores).toEqual([0]);

    engine.step(10); // 0.2
    expect(deltas).toEqual([]);
    expect(scores).toEqual([0]);

    engine.step(50); // +1
    expect(deltas).toEqual([1]);
    expect(scores).toEqual([0, 1]);
  });
});
