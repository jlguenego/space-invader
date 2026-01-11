import { useEffect, useReducer, useRef, useState } from 'react';

import type { Preferences } from './storage/preferences';
import { loadPreferences, savePreferences } from './storage/preferences';

import { getDailyLeaderboard } from './services/leaderboard-service';
import { saveScore } from './services/scores-service';

import { GameOverScreen } from './ui/game-over-screen';
import { GameScreen } from './ui/game-screen';
import { HomeScreen } from './ui/home-screen';
import { LeaderboardScreen } from './ui/leaderboard-screen';
import { PauseOverlay } from './ui/pause-overlay';
import { initialUiState, uiReducer } from './ui/ui-state-machine';
import { uiColors } from './ui/ui-kit';

import { createGameEngine } from './game/game-engine';
import { InputManager } from './game/input-manager';

export function App(): JSX.Element {
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());
  const [uiState, dispatch] = useReducer(uiReducer, initialUiState);

  const uiScreenRef = useRef(uiState.screen);
  uiScreenRef.current = uiState.screen;

  const engineRef = useRef<ReturnType<typeof createGameEngine> | null>(null);
  if (!engineRef.current) {
    engineRef.current = createGameEngine({
      // Temporary MVP pacing (matches previous 5 points / 250ms).
      scorePerSecond: 20,
      maxStepMs: 100,
      onScoreDelta: (amount) => dispatch({ type: 'INCREMENT_SCORE', amount }),
      onGameOver: () => dispatch({ type: 'GAME_OVER' }),
    });
  }

  const engine = engineRef.current;

  const inputRef = useRef<InputManager | null>(null);
  if (!inputRef.current) {
    inputRef.current = new InputManager({
      onToggleMute: () => setPreferences((prev) => ({ ...prev, mute: !prev.mute })),
      onTogglePause: () => {
        const screen = uiScreenRef.current;
        if (screen === 'playing' || screen === 'paused') {
          engine.togglePause();
          dispatch({ type: 'TOGGLE_PAUSE' });
        }
      },
    });
  }

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Centralized keyboard input (single set of listeners).
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.attach();
    return () => input.dispose();
  }, []);

  // Cleanup: ensure no loop survives unmount.
  useEffect(() => {
    return () => {
      engine.stopLoop();
    };
  }, [engine]);

  // Load leaderboard when entering leaderboard screen.
  useEffect(() => {
    if (uiState.screen !== 'leaderboard') return;
    if (uiState.status !== 'loading') return;

    let cancelled = false;
    (async () => {
      try {
        const leaderboard = await getDailyLeaderboard();
        if (cancelled) return;
        dispatch({ type: 'LEADERBOARD_LOAD_SUCCESS', leaderboard });
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        dispatch({ type: 'LEADERBOARD_LOAD_ERROR', message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uiState]);

  async function onSaveScore(finalScore: number): Promise<void> {
    dispatch({ type: 'SCORE_SAVE_START' });
    try {
      await saveScore({ score: finalScore, pseudo: preferences.pseudo });
      dispatch({ type: 'SCORE_SAVE_SUCCESS' });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de l'enregistrement";
      dispatch({ type: 'SCORE_SAVE_ERROR', message });
    }
  }

  const displayedPseudo = preferences.pseudo ?? 'Anonyme';

  return (
    <div style={{ minHeight: '100vh', background: uiColors.bg }}>
      {uiState.screen === 'home' && (
        <HomeScreen
          preferences={preferences}
          onChangePreferences={(patch) => setPreferences((prev) => ({ ...prev, ...patch }))}
          onStartGame={() => {
            engine.startNewGame();
            engine.startLoop();
            dispatch({ type: 'START_GAME' });
          }}
        />
      )}

      {(uiState.screen === 'playing' || uiState.screen === 'paused') && (
        <>
          <GameScreen
            score={uiState.score}
            mute={preferences.mute}
            paused={uiState.screen === 'paused'}
            onGameOver={() => engine.triggerGameOver()}
          />
          {uiState.screen === 'paused' && (
            <PauseOverlay
              onResume={() => {
                engine.togglePause();
                dispatch({ type: 'TOGGLE_PAUSE' });
              }}
            />
          )}
        </>
      )}

      {uiState.screen === 'game-over' && (
        <GameOverScreen
          finalScore={uiState.finalScore}
          displayedPseudo={displayedPseudo}
          scoreSave={uiState.scoreSave}
          onReplay={() => {
            engine.startNewGame();
            engine.startLoop();
            dispatch({ type: 'START_GAME' });
          }}
          onSaveScore={() => void onSaveScore(uiState.finalScore)}
          onOpenLeaderboard={() => dispatch({ type: 'OPEN_LEADERBOARD' })}
          onGoHome={() => dispatch({ type: 'GO_HOME' })}
        />
      )}

      {uiState.screen === 'leaderboard' && (
        <LeaderboardScreen
          status={uiState.status}
          leaderboard={uiState.leaderboard}
          errorMessage={uiState.errorMessage}
          onRetry={() => dispatch({ type: 'LEADERBOARD_LOAD_START' })}
          onGoHome={() => dispatch({ type: 'GO_HOME' })}
        />
      )}
    </div>
  );
}
