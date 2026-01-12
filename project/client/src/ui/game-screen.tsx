import { uiCardStyle, uiColors } from './ui-kit';
import { useEffect, useRef } from 'react';

import { createThreeRenderer } from '../render/three-renderer';
import type { FxState } from '../render/fx-state';

export function GameScreen(props: {
  score: number;
  lives: number;
  mute: boolean;
  paused: boolean;
  getWorld: () => import('../game/world-types').World;
  getFxState: () => FxState;
}): JSX.Element {
  const { score, lives, mute, paused, getWorld, getFxState } = props;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<ReturnType<typeof createThreeRenderer> | null>(null);

  useEffect(() => {
    const containerEl = viewportRef.current;
    if (!containerEl) return;

    const runtime = createThreeRenderer(containerEl, { maxPixelRatio: 2, getWorld, getFxState });
    runtimeRef.current = runtime;
    runtime.resizeToContainer();
    runtime.start();

    return () => {
      runtimeRef.current = null;
      runtime.dispose();
    };
  }, []);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    if (paused) runtime.stop();
    else runtime.start();
  }, [paused]);

  return (
    <main
      style={{
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        padding: 24,
        lineHeight: 1.4,
        maxWidth: 980,
        margin: '0 auto',
        color: uiColors.text,
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>En jeu</h1>
          <p style={{ margin: '8px 0 0', color: uiColors.muted }}>
            Déplacement : flèches / WASD — Tir : <strong>Espace</strong> — Pause :{' '}
            <strong>P</strong> — Mute : <strong>M</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {paused && (
            <div
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: `1px solid ${uiColors.border}`,
                background: 'rgba(245, 158, 11, 0.14)',
                color: uiColors.text,
                fontWeight: 800,
                letterSpacing: 0.3,
              }}
              aria-label="Jeu en pause"
            >
              PAUSE
            </div>
          )}
          <div
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: `1px solid ${uiColors.border}`,
              background: mute ? 'rgba(255, 107, 107, 0.14)' : 'rgba(34, 197, 94, 0.14)',
              color: uiColors.text,
              fontWeight: 800,
              letterSpacing: 0.3,
            }}
            aria-label={mute ? 'Mute activé' : 'Mute désactivé'}
          >
            {mute ? 'MUTE ON' : 'MUTE OFF'}
          </div>
        </div>
      </header>

      <section style={{ ...uiCardStyle, marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: uiColors.muted }}>Score</div>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 1 }}>{score}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: uiColors.muted }}>Vies</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{Math.max(0, lives)}</div>
          </div>
        </div>
      </section>

      <section style={{ ...uiCardStyle, marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div
          ref={viewportRef}
          style={{
            width: '100%',
            height: 520,
            background: '#070b16',
          }}
        />
      </section>

      <section style={{ ...uiCardStyle, marginTop: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Aide</h2>
        <ul style={{ margin: '10px 0 0', color: uiColors.muted }}>
          <li>Détruis les ennemis avec tes tirs.</li>
          <li>La pause fige la simulation et le rendu.</li>
        </ul>
      </section>
    </main>
  );
}
