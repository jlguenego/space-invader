import { uiCardStyle, uiColors } from './ui-kit';
import { useEffect, useRef } from 'react';

import { createThreeRenderer } from '../render/three-renderer';

export function GameScreen(props: {
  score: number;
  mute: boolean;
  paused: boolean;
  onGameOver: () => void;
}): JSX.Element {
  const { score, mute, paused, onGameOver } = props;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<ReturnType<typeof createThreeRenderer> | null>(null);

  useEffect(() => {
    const containerEl = viewportRef.current;
    if (!containerEl) return;

    const runtime = createThreeRenderer(containerEl, { maxPixelRatio: 2 });
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
            Démo UI (rendu Three.js + moteur minimal). Pause : <strong>P</strong> — Mute :{' '}
            <strong>M</strong>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, color: uiColors.muted }}>Mute</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{mute ? 'ON' : 'OFF'}</div>
        </div>
      </header>

      <section style={{ ...uiCardStyle, marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: uiColors.muted }}>Score</div>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 1 }}>{score}</div>
          </div>

          <button type="button" onClick={onGameOver} style={{ ...uiCardStyle, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>Game over</div>
            <div style={{ fontSize: 12, color: uiColors.muted }}>Simuler une fin de partie</div>
          </button>
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
          <li>Le score augmente automatiquement en jeu.</li>
          <li>La pause fige la progression du score.</li>
        </ul>
      </section>
    </main>
  );
}
