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
import { DEFAULT_WORLD_CONFIG } from './game/world-sim';
import { applyDifficultyToWorldConfig } from './game/difficulty';
import { sensitivityMultiplier } from './storage/preferences';

import { createInitialFxState, reduceFxState } from './render/fx-state';

export function App(): JSX.Element {
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());
  const [uiState, dispatch] = useReducer(uiReducer, initialUiState);
  const [lives, setLives] = useState<number>(() => DEFAULT_WORLD_CONFIG.playerLives);

  const uiScreenRef = useRef(uiState.screen);
  uiScreenRef.current = uiState.screen;

  const inputRef = useRef<InputManager | null>(null);

  const fxRef = useRef(createInitialFxState());

  const engineRef = useRef<ReturnType<typeof createGameEngine> | null>(null);
  if (!inputRef.current) {
    inputRef.current = new InputManager({
      onToggleMute: () => setPreferences((prev) => ({ ...prev, mute: !prev.mute })),
      onTogglePause: () => {
        const screen = uiScreenRef.current;
        if (screen === 'playing' || screen === 'paused') {
          engineRef.current?.togglePause();
          dispatch({ type: 'TOGGLE_PAUSE' });
        }
      },
    });
  }

  if (!engineRef.current) {
    engineRef.current = createGameEngine({
      maxStepMs: 100,
      getInputState: () =>
        inputRef.current?.getState() ?? {
          movement: { left: false, right: false, up: false, down: false },
          fire: false,
        },
      onScoreDelta: (amount) => dispatch({ type: 'INCREMENT_SCORE', amount }),
      onGameOver: (finalScore) => dispatch({ type: 'GAME_OVER', finalScore }),
      onWorldEvents: ({ world, events }) => {
        fxRef.current = reduceFxState({ prev: fxRef.current, world, events });
        for (const event of events) {
          if (event.type === 'PLAYER_HIT') {
            setLives(event.remainingLives);
          }
        }
      },
    });
  }

  const engine = engineRef.current;

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
            const multiplier = sensitivityMultiplier(preferences.sensitivity);
            const baseConfig = {
              ...DEFAULT_WORLD_CONFIG,
              shipSpeed: DEFAULT_WORLD_CONFIG.shipSpeed * multiplier,
            };
            const config = applyDifficultyToWorldConfig(baseConfig, preferences.difficulty);
            engine.setWorldConfig(config);
            setLives(config.playerLives);
            fxRef.current = createInitialFxState();
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
            lives={lives}
            mute={preferences.mute}
            paused={uiState.screen === 'paused'}
            getWorld={() => engine.getWorld()}
            getFxState={() => fxRef.current}
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
            setLives(engine.getWorld().config.playerLives);
            fxRef.current = createInitialFxState();
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
