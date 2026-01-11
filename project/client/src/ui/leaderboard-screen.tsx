import type { LeaderboardDay } from './ui-state-machine';
import { uiButtonStyle, uiCardStyle, uiColors } from './ui-kit';

export function LeaderboardScreen(props: {
  status: 'loading' | 'loaded' | 'error';
  leaderboard: LeaderboardDay | null;
  errorMessage: string | null;
  onRetry: () => void;
  onGoHome: () => void;
}): JSX.Element {
  const { status, leaderboard, errorMessage, onRetry, onGoHome } = props;

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
          <h1 style={{ margin: 0 }}>Classement</h1>
          <p style={{ margin: '8px 0 0', color: uiColors.muted }}>Top 10 du jour — Europe/Paris</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" onClick={onGoHome} style={uiButtonStyle}>
            Accueil
          </button>
        </div>
      </header>

      <section style={{ ...uiCardStyle, marginTop: 18 }}>
        {status === 'loading' && <div style={{ color: uiColors.muted }}>Chargement…</div>}

        {status === 'error' && (
          <div>
            <div style={{ color: uiColors.danger, fontWeight: 700 }}>Impossible de charger.</div>
            {errorMessage && (
              <div style={{ marginTop: 6, color: uiColors.muted, fontSize: 13 }}>
                {errorMessage}
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={onRetry} style={uiButtonStyle}>
                Réessayer
              </button>
            </div>
          </div>
        )}

        {status === 'loaded' && leaderboard && (
          <div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: uiColors.muted }}>
              <div>
                Jour (Paris) :{' '}
                <strong style={{ color: uiColors.text }}>{leaderboard.dayKeyParis}</strong>
              </div>
              <div>
                Fuseau : <strong style={{ color: uiColors.text }}>{leaderboard.timezone}</strong>
              </div>
            </div>

            <div style={{ marginTop: 14, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: uiColors.muted, fontSize: 12 }}>
                    <th style={{ padding: '6px 0' }}>#</th>
                    <th style={{ padding: '6px 0' }}>Pseudo</th>
                    <th style={{ padding: '6px 0', textAlign: 'right' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.entries.map((e) => (
                    <tr key={`${e.rank}-${e.pseudo}-${e.score}`}>
                      <td style={{ padding: '8px 0', width: 60 }}>{e.rank}</td>
                      <td style={{ padding: '8px 0' }}>{e.pseudo}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>
                        {e.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {leaderboard.entries.length === 0 && (
                <div style={{ marginTop: 10, color: uiColors.muted }}>
                  Aucun score pour l'instant.
                </div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={onRetry} style={uiButtonStyle}>
                Recharger
              </button>
            </div>
          </div>
        )}
      </section>

      <section style={{ ...uiCardStyle, marginTop: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Note</h2>
        <p style={{ margin: '10px 0 0', color: uiColors.muted }}>
          Le classement est chargé depuis l'API du serveur.
        </p>
      </section>
    </main>
  );
}
