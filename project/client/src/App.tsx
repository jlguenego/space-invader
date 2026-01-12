import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { Preferences } from './storage/preferences';
import { loadPreferences, savePreferences } from './storage/preferences';

import { getDailyLeaderboard } from './services/leaderboard-service';
import { saveScore } from './services/scores-service';

import { GameOverScreen } from './ui/game-over-screen';
import { GameScreen } from './ui/game-screen';
import { HomeScreen } from './ui/home-screen';
import { LeaderboardScreen } from './ui/leaderboard-screen';
import { LoadingOverlay } from './ui/loading-overlay';
import { PauseOverlay } from './ui/pause-overlay';
import { initialUiState, uiReducer } from './ui/ui-state-machine';
import { uiColors } from './ui/ui-kit';

import { bootReducer, initialBootState } from './ui/boot-state';

import { createGameEngine } from './game/game-engine';
import { InputManager } from './game/input-manager';
import { DEFAULT_WORLD_CONFIG } from './game/world-sim';
import { applyDifficultyToWorldConfig } from './game/difficulty';
import { sensitivityMultiplier } from './storage/preferences';

import { createInitialFxState, reduceFxState } from './render/fx-state';
import { probeWebgl } from './render/webgl-probe';

import { audioManager } from './audio/audio-manager';
import type { AudioUnlockState } from './audio/audio-unlock';
import { bootErrorCopy } from './ui/boot-error-copy';

export function App(): JSX.Element {
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());
  const [uiState, dispatch] = useReducer(uiReducer, initialUiState);
  const [boot, bootDispatch] = useReducer(bootReducer, initialBootState);
  const [lives, setLives] = useState<number>(() => DEFAULT_WORLD_CONFIG.playerLives);

  const [audioUnlockState, setAudioUnlockState] = useState<AudioUnlockState>(() =>
    audioManager.getUnlockState(),
  );

  const uiScreenRef = useRef(uiState.screen);
  uiScreenRef.current = uiState.screen;

  const inputRef = useRef<InputManager | null>(null);

  const webglProbeRef = useRef<HTMLDivElement | null>(null);

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
      onGameOver: (finalScore) => {
        audioManager.playSfx('game-over');
        dispatch({ type: 'GAME_OVER', finalScore });
      },
      onWorldEvents: ({ world, events }) => {
        fxRef.current = reduceFxState({ prev: fxRef.current, world, events });
        for (const event of events) {
          if (event.type === 'PLAYER_SHOT') {
            audioManager.playSfx('player-shot');
          }

          if (event.type === 'ENEMY_DESTROYED') {
            audioManager.playSfx('enemy-explosion');
          }

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

  // Keep Howler mute in sync with preferences (source of truth).
  useEffect(() => {
    audioManager.setMuted(preferences.mute);
  }, [preferences.mute]);

  // Attempt audio unlock on first user interaction (pointerdown / keydown).
  // useLayoutEffect reduces the risk of missing the very first click after initial paint.
  useLayoutEffect(() => {
    const dispose = audioManager.registerUnlockOnFirstInteraction(undefined, setAudioUnlockState);
    return () => dispose();
  }, []);

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

  // Boot sequence: show an explicit loading state while initializing assets + WebGL.
  useEffect(() => {
    let cancelled = false;

    function nowMs(): number {
      if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        return performance.now();
      }
      return Date.now();
    }

    function delay(ms: number): Promise<void> {
      if (ms <= 0) return Promise.resolve();
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function nextFrame(): Promise<void> {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    async function waitForProbeEl(): Promise<HTMLElement> {
      for (let i = 0; i < 60; i++) {
        const el = webglProbeRef.current;
        if (el) return el;
        await nextFrame();
      }
      throw new Error('WebGL probe container not mounted');
    }

    (async () => {
      const minOverlayMs = 450;
      const startedAt = nowMs();

      bootDispatch({ type: 'BOOT_START' });

      // Ensure the overlay has a chance to paint before doing heavier work.
      await nextFrame();
      if (cancelled) return;

      try {
        bootDispatch({ type: 'BOOT_PHASE', phase: 'assets' });

        // Minimal “asset” readiness: wait for fonts (if supported) and a frame.
        // This keeps the UI stable and avoids a blank first paint.
        try {
          await (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
        } catch {
          // ignore
        }

        await nextFrame();
        if (cancelled) return;

        bootDispatch({ type: 'BOOT_PHASE', phase: 'webgl' });
        const probeEl = await waitForProbeEl();
        if (cancelled) return;

        const probe = probeWebgl(probeEl);
        if (!probe.ok) {
          console.error('WebGL probe failed', probe);
          const copy = bootErrorCopy('webgl_incompatible');
          bootDispatch({
            type: 'BOOT_ERROR',
            errorCode: 'webgl_incompatible',
            message: copy.message,
          });
          return;
        }

        const elapsed = nowMs() - startedAt;
        await delay(minOverlayMs - elapsed);
        if (cancelled) return;

        bootDispatch({ type: 'BOOT_READY' });
      } catch (error) {
        if (cancelled) return;
        const copy = bootErrorCopy('boot_failed');
        const message = copy.message;
        console.error('Boot failed', error);
        bootDispatch({ type: 'BOOT_ERROR', errorCode: 'boot_failed', message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
      <LoadingOverlay boot={boot} />

      <div
        ref={webglProbeRef}
        aria-hidden
        style={{
          position: 'fixed',
          left: -9999,
          top: -9999,
          width: 1,
          height: 1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      />

      {!preferences.mute && audioUnlockState === 'locked' && (
        <div
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            right: 12,
            zIndex: 50,
            background: 'rgba(0,0,0,0.65)',
            border: `1px solid ${uiColors.border}`,
            color: uiColors.text,
            padding: '10px 12px',
            borderRadius: 10,
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
            fontSize: 13,
            maxWidth: 520,
            margin: '0 auto',
          }}
        >
          Cliquez ou appuyez sur une touche pour activer le son.
        </div>
      )}

      {!preferences.mute && audioUnlockState === 'failed' && (
        <div
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            right: 12,
            zIndex: 50,
            background: 'rgba(0,0,0,0.65)',
            border: `1px solid ${uiColors.border}`,
            color: uiColors.text,
            padding: '10px 12px',
            borderRadius: 10,
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
            fontSize: 13,
            maxWidth: 520,
            margin: '0 auto',
          }}
        >
          Le son est indisponible sur ce navigateur.
        </div>
      )}

      {uiState.screen === 'home' && (
        <HomeScreen
          preferences={preferences}
          onChangePreferences={(patch) => setPreferences((prev) => ({ ...prev, ...patch }))}
          onStartGame={() => {
            audioManager.playSfx('ui-click');
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
            audioManager.playSfx('ui-click');
            setLives(engine.getWorld().config.playerLives);
            fxRef.current = createInitialFxState();
            engine.startNewGame();
            engine.startLoop();
            dispatch({ type: 'START_GAME' });
          }}
          onSaveScore={() => void onSaveScore(uiState.finalScore)}
          onOpenLeaderboard={() => {
            audioManager.playSfx('ui-click');
            dispatch({ type: 'OPEN_LEADERBOARD' });
          }}
          onGoHome={() => {
            audioManager.playSfx('ui-back');
            dispatch({ type: 'GO_HOME' });
          }}
        />
      )}

      {uiState.screen === 'leaderboard' && (
        <LeaderboardScreen
          status={uiState.status}
          leaderboard={uiState.leaderboard}
          errorMessage={uiState.errorMessage}
          onRetry={() => {
            audioManager.playSfx('ui-click');
            dispatch({ type: 'LEADERBOARD_LOAD_START' });
          }}
          onGoHome={() => {
            audioManager.playSfx('ui-back');
            dispatch({ type: 'GO_HOME' });
          }}
        />
      )}
    </div>
  );
}
