import { describe, expect, it } from 'bun:test';

import { initialUiState, uiReducer } from './ui-state-machine';

describe('uiReducer', () => {
  it('follows the MVP navigation flow', () => {
    let state = initialUiState;

    state = uiReducer(state, { type: 'START_GAME' });
    expect(state.screen).toBe('playing');

    state = uiReducer(state, { type: 'INCREMENT_SCORE', amount: 10 });
    expect(state).toEqual({ screen: 'playing', score: 10 });

    state = uiReducer(state, { type: 'TOGGLE_PAUSE' });
    expect(state).toEqual({ screen: 'paused', score: 10 });

    state = uiReducer(state, { type: 'TOGGLE_PAUSE' });
    expect(state).toEqual({ screen: 'playing', score: 10 });

    state = uiReducer(state, { type: 'GAME_OVER' });
    expect(state.screen).toBe('game-over');
    if (state.screen !== 'game-over') throw new Error('unreachable');
    expect(state.finalScore).toBe(10);

    state = uiReducer(state, { type: 'OPEN_LEADERBOARD' });
    expect(state).toEqual({
      screen: 'leaderboard',
      status: 'loading',
      leaderboard: null,
      errorMessage: null,
    });

    state = uiReducer(state, { type: 'GO_HOME' });
    expect(state).toEqual({ screen: 'home' });
  });

  it('toggles pause only from playing/paused', () => {
    expect(uiReducer({ screen: 'home' }, { type: 'TOGGLE_PAUSE' })).toEqual({ screen: 'home' });

    expect(uiReducer({ screen: 'playing', score: 0 }, { type: 'TOGGLE_PAUSE' })).toEqual({
      screen: 'paused',
      score: 0,
    });

    expect(uiReducer({ screen: 'paused', score: 3 }, { type: 'TOGGLE_PAUSE' })).toEqual({
      screen: 'playing',
      score: 3,
    });
  });
});
