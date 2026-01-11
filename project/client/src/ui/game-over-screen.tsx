import { uiButtonStyle, uiCardStyle, uiColors } from './ui-kit';

export type ScoreSaveViewState = {
  status: 'idle' | 'saving' | 'success' | 'error';
  message: string | null;
};

export function GameOverScreen(props: {
  finalScore: number;
  displayedPseudo: string;
  scoreSave: ScoreSaveViewState;
  onReplay: () => void;
  onSaveScore: () => void;
  onOpenLeaderboard: () => void;
  onGoHome: () => void;
}): JSX.Element {
  const {
    finalScore,
    displayedPseudo,
    scoreSave,
    onReplay,
    onSaveScore,
    onOpenLeaderboard,
    onGoHome,
  } = props;

  const statusColor =
    scoreSave.status === 'success'
      ? uiColors.success
      : scoreSave.status === 'error'
        ? uiColors.danger
        : uiColors.muted;

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
      <header>
        <h1 style={{ margin: 0 }}>Fin de partie</h1>
        <p style={{ margin: '8px 0 0', color: uiColors.muted }}>
          Pseudo : <strong style={{ color: uiColors.text }}>{displayedPseudo}</strong>
        </p>
      </header>

      <section style={{ ...uiCardStyle, marginTop: 18 }}>
        <div style={{ fontSize: 12, color: uiColors.muted }}>Score final</div>
        <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: 1 }}>{finalScore}</div>

        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={onReplay} style={uiButtonStyle}>
            Rejouer
          </button>

          <button
            type="button"
            onClick={onSaveScore}
            style={uiButtonStyle}
            disabled={scoreSave.status === 'saving'}
          >
            {scoreSave.status === 'saving' ? 'Enregistrement…' : 'Enregistrer le score'}
          </button>

          <button type="button" onClick={onOpenLeaderboard} style={uiButtonStyle}>
            Voir le top 10
          </button>

          <button type="button" onClick={onGoHome} style={uiButtonStyle}>
            Accueil
          </button>
        </div>

        {(scoreSave.message || scoreSave.status === 'success') && (
          <div style={{ marginTop: 12, fontSize: 13, color: statusColor }}>
            {scoreSave.message ?? 'Score enregistré.'}
          </div>
        )}
      </section>

      <section style={{ ...uiCardStyle, marginTop: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Note</h2>
        <p style={{ margin: '10px 0 0', color: uiColors.muted }}>
          L'enregistrement est simulé (stub). L'API réelle sera branchée dans id021.
        </p>
      </section>
    </main>
  );
}
