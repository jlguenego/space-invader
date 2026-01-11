import { useEffect, useReducer, useState } from 'react';

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

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' || tag === 'textarea' || tag === 'select' || Boolean(target.isContentEditable)
  );
}

export function App(): JSX.Element {
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());
  const [uiState, dispatch] = useReducer(uiReducer, initialUiState);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Global shortcuts: P (pause) and M (mute).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      if (e.repeat) return;
      if (isEditableTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (key === 'm') {
        setPreferences((prev) => ({ ...prev, mute: !prev.mute }));
        return;
      }

      if (key === 'p') {
        if (uiState.screen === 'playing' || uiState.screen === 'paused') {
          dispatch({ type: 'TOGGLE_PAUSE' });
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [uiState.screen]);

  // Simulated gameplay: score ticks while in playing.
  useEffect(() => {
    if (uiState.screen !== 'playing') return;

    const timer = window.setInterval(() => {
      dispatch({ type: 'INCREMENT_SCORE', amount: 5 });
    }, 250);

    return () => window.clearInterval(timer);
  }, [uiState.screen]);

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
          onStartGame={() => dispatch({ type: 'START_GAME' })}
        />
      )}

      {(uiState.screen === 'playing' || uiState.screen === 'paused') && (
        <>
          <GameScreen
            score={uiState.score}
            mute={preferences.mute}
            onGameOver={() => dispatch({ type: 'GAME_OVER' })}
          />
          {uiState.screen === 'paused' && (
            <PauseOverlay onResume={() => dispatch({ type: 'TOGGLE_PAUSE' })} />
          )}
        </>
      )}

      {uiState.screen === 'game-over' && (
        <GameOverScreen
          finalScore={uiState.finalScore}
          displayedPseudo={displayedPseudo}
          scoreSave={uiState.scoreSave}
          onReplay={() => dispatch({ type: 'START_GAME' })}
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
