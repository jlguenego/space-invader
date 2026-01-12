import { uiButtonStyle, uiCardStyle, uiColors } from './ui-kit';

export function PauseOverlay(props: { onResume: () => void }): JSX.Element {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        color: uiColors.text,
      }}
    >
      <div style={{ ...uiCardStyle, width: 'min(520px, 100%)' }}>
        <h2 id="pause-title" style={{ margin: 0 }}>
          Pause
        </h2>
        <p style={{ margin: '10px 0 0', color: uiColors.muted }}>
          Appuie sur <strong>P</strong> pour reprendre.
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={props.onResume} style={uiButtonStyle} data-autofocus>
            Reprendre
          </button>
        </div>
      </div>
    </div>
  );
}
