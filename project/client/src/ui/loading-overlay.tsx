import { uiColors } from './ui-kit';

import type { BootState } from './boot-state';
import { bootPhaseLabel } from './boot-state';
import { bootErrorCopy } from './boot-error-copy';

export function LoadingOverlay(props: { boot: BootState }): JSX.Element | null {
  const { boot } = props;

  if (boot.status === 'ready') return null;

  const copy = boot.status === 'error' && boot.errorCode ? bootErrorCopy(boot.errorCode) : null;
  const title =
    boot.status === 'error' ? (copy?.title ?? 'Chargement impossible') : 'Space Invaders';
  const message =
    boot.status === 'error'
      ? (copy?.message ?? boot.message ?? 'Une erreur est survenue au démarrage.')
      : bootPhaseLabel(boot.phase);

  return (
    <div
      role={boot.status === 'error' ? 'alert' : 'status'}
      aria-live={boot.status === 'error' ? 'assertive' : 'polite'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'grid',
        placeItems: 'center',
        padding: 18,
        background:
          'radial-gradient(circle at 20% 10%, rgba(96, 165, 250, 0.12), transparent 55%), #060816',
        color: uiColors.text,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: 'min(560px, 100%)',
          border: `1px solid ${uiColors.border}`,
          borderRadius: 14,
          padding: '18px 18px 16px',
          background: 'rgba(0,0,0,0.55)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {boot.status !== 'error' && (
            <div
              aria-hidden
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                border: '2px solid rgba(255,255,255,0.25)',
                borderTopColor: 'rgba(255,255,255,0.9)',
                animation: 'spin 900ms linear infinite',
              }}
            />
          )}
          <div style={{ fontWeight: 900, letterSpacing: 0.3 }}>{title}</div>
        </div>

        <div style={{ marginTop: 10, color: uiColors.muted, fontSize: 13 }}>{message}</div>

        {boot.status === 'error' && copy?.actions?.length ? (
          <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: uiColors.muted, fontSize: 13 }}>
            {copy.actions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {boot.status === 'error' && (
          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                border: `1px solid ${uiColors.border}`,
                background: 'rgba(255,255,255,0.08)',
                color: uiColors.text,
                padding: '10px 12px',
                borderRadius: 10,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Recharger
            </button>
          </div>
        )}
      </div>

      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}
