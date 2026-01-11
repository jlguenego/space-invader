export type UiScreen = 'home' | 'playing' | 'paused' | 'game-over' | 'leaderboard';

export type LeaderboardEntry = {
  rank: number;
  pseudo: string;
  score: number;
};

export type LeaderboardDay = {
  timezone: 'Europe/Paris';
  dayKeyParis: string;
  entries: LeaderboardEntry[];
};

export type ScoreSaveStatus = 'idle' | 'saving' | 'success' | 'error';

export type UiState =
  | { screen: 'home' }
  | { screen: 'playing'; score: number }
  | { screen: 'paused'; score: number }
  | {
      screen: 'game-over';
      finalScore: number;
      scoreSave: { status: ScoreSaveStatus; message: string | null };
    }
  | {
      screen: 'leaderboard';
      status: 'loading' | 'loaded' | 'error';
      leaderboard: LeaderboardDay | null;
      errorMessage: string | null;
    };

export type UiAction =
  | { type: 'GO_HOME' }
  | { type: 'START_GAME' }
  | { type: 'INCREMENT_SCORE'; amount: number }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'GAME_OVER' }
  | { type: 'OPEN_LEADERBOARD' }
  | { type: 'LEADERBOARD_LOAD_START' }
  | { type: 'LEADERBOARD_LOAD_SUCCESS'; leaderboard: LeaderboardDay }
  | { type: 'LEADERBOARD_LOAD_ERROR'; message: string }
  | { type: 'SCORE_SAVE_START' }
  | { type: 'SCORE_SAVE_SUCCESS' }
  | { type: 'SCORE_SAVE_ERROR'; message: string };

export const initialUiState: UiState = { screen: 'home' };

export function uiReducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case 'GO_HOME':
      return { screen: 'home' };

    case 'START_GAME':
      return { screen: 'playing', score: 0 };

    case 'INCREMENT_SCORE': {
      if (state.screen !== 'playing') return state;
      if (!Number.isFinite(action.amount) || action.amount <= 0) return state;
      return { ...state, score: state.score + action.amount };
    }

    case 'TOGGLE_PAUSE': {
      if (state.screen === 'playing') return { screen: 'paused', score: state.score };
      if (state.screen === 'paused') return { screen: 'playing', score: state.score };
      return state;
    }

    case 'GAME_OVER': {
      if (state.screen !== 'playing' && state.screen !== 'paused') return state;
      return {
        screen: 'game-over',
        finalScore: state.score,
        scoreSave: { status: 'idle', message: null },
      };
    }

    case 'OPEN_LEADERBOARD':
      return {
        screen: 'leaderboard',
        status: 'loading',
        leaderboard: null,
        errorMessage: null,
      };

    case 'LEADERBOARD_LOAD_START': {
      if (state.screen !== 'leaderboard') return state;
      return { ...state, status: 'loading', errorMessage: null };
    }

    case 'LEADERBOARD_LOAD_SUCCESS': {
      if (state.screen !== 'leaderboard') return state;
      return {
        ...state,
        status: 'loaded',
        leaderboard: action.leaderboard,
        errorMessage: null,
      };
    }

    case 'LEADERBOARD_LOAD_ERROR': {
      if (state.screen !== 'leaderboard') return state;
      return {
        ...state,
        status: 'error',
        leaderboard: null,
        errorMessage: action.message,
      };
    }

    case 'SCORE_SAVE_START': {
      if (state.screen !== 'game-over') return state;
      return { ...state, scoreSave: { status: 'saving', message: null } };
    }

    case 'SCORE_SAVE_SUCCESS': {
      if (state.screen !== 'game-over') return state;
      return {
        ...state,
        scoreSave: { status: 'success', message: 'Score enregistré.' },
      };
    }

    case 'SCORE_SAVE_ERROR': {
      if (state.screen !== 'game-over') return state;
      return {
        ...state,
        scoreSave: { status: 'error', message: action.message },
      };
    }

    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}
