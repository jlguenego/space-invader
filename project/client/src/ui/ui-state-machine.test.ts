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

    state = uiReducer(state, { type: 'GAME_OVER', finalScore: 123 });
    expect(state.screen).toBe('game-over');
    if (state.screen !== 'game-over') throw new Error('unreachable');
    expect(state.finalScore).toBe(123);

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

  it('updates score save state only on game-over screen', () => {
    const gameOverState = uiReducer(
      { screen: 'playing', score: 10 },
      { type: 'GAME_OVER', finalScore: 123 },
    );

    expect(gameOverState.screen).toBe('game-over');
    if (gameOverState.screen !== 'game-over') throw new Error('unreachable');

    const savingState = uiReducer(gameOverState, { type: 'SCORE_SAVE_START' });
    expect(savingState.screen).toBe('game-over');
    if (savingState.screen !== 'game-over') throw new Error('unreachable');
    expect(savingState.scoreSave).toEqual({ status: 'saving', message: null });

    const errorState = uiReducer(savingState, {
      type: 'SCORE_SAVE_ERROR',
      message: "Impossible d'enregistrer le score, réessaie plus tard.",
    });
    expect(errorState.screen).toBe('game-over');
    if (errorState.screen !== 'game-over') throw new Error('unreachable');
    expect(errorState.scoreSave).toEqual({
      status: 'error',
      message: "Impossible d'enregistrer le score, réessaie plus tard.",
    });
  });

  it('ignores late score save errors after leaving game-over (non-blocking)', () => {
    const gameOverState = uiReducer(
      { screen: 'playing', score: 10 },
      { type: 'GAME_OVER', finalScore: 123 },
    );
    const savingState = uiReducer(gameOverState, { type: 'SCORE_SAVE_START' });
    const playingState = uiReducer(savingState, { type: 'START_GAME' });

    expect(playingState).toEqual({ screen: 'playing', score: 0 });

    const lateErrorState = uiReducer(playingState, {
      type: 'SCORE_SAVE_ERROR',
      message: 'Network down',
    });

    expect(lateErrorState).toEqual(playingState);
  });
});
