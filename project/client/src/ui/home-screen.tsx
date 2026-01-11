import { useEffect, useMemo, useState } from 'react';

import type { Difficulty, Preferences, Sensitivity } from '../storage/preferences';
import { normalizePseudo, sensitivityMultiplier } from '../storage/preferences';
import { uiButtonStyle, uiCardStyle, uiColors, uiInputStyle } from './ui-kit';

const difficultyOptions: Array<{ value: Difficulty; label: string }> = [
  { value: 'easy', label: 'Facile' },
  { value: 'normal', label: 'Normal' },
  { value: 'hard', label: 'Difficile' },
];

const sensitivityOptions: Array<{ value: Sensitivity; label: string }> = [
  { value: 'low', label: 'Faible (0.8x)' },
  { value: 'medium', label: 'Moyen (1.0x)' },
  { value: 'high', label: 'Fort (1.2x)' },
];

export function HomeScreen(props: {
  preferences: Preferences;
  onChangePreferences: (patch: Partial<Preferences>) => void;
  onStartGame: () => void;
}): JSX.Element {
  const { preferences, onChangePreferences, onStartGame } = props;
  const [pseudoInput, setPseudoInput] = useState<string>(preferences.pseudo ?? '');

  useEffect(() => {
    setPseudoInput(preferences.pseudo ?? '');
  }, [preferences.pseudo]);

  const displayedName = preferences.pseudo ?? 'Anonyme';

  const multiplier = useMemo(
    () => sensitivityMultiplier(preferences.sensitivity),
    [preferences.sensitivity],
  );

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
          <h1 style={{ margin: 0 }}>Space Invaders</h1>
          <p style={{ margin: '8px 0 0', color: uiColors.muted }}>
            MVP UI (id020) — flux complet sans moteur de jeu.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={onStartGame} style={uiButtonStyle}>
            Démarrer
          </button>
        </div>
      </header>

      <section style={{ ...uiCardStyle, marginTop: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Préférences</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gap: 10,
            marginTop: 12,
            alignItems: 'center',
          }}
        >
          <label htmlFor="pseudo">Pseudo (optionnel)</label>
          <div>
            <input
              id="pseudo"
              value={pseudoInput}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setPseudoInput(value);
                onChangePreferences({ pseudo: normalizePseudo(value) });
              }}
              placeholder="Laisser vide pour Anonyme"
              style={uiInputStyle}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: uiColors.muted }}>
              Affiché : <strong style={{ color: uiColors.text }}>{displayedName}</strong>
            </div>
          </div>

          <label htmlFor="difficulty">Difficulté</label>
          <select
            id="difficulty"
            value={preferences.difficulty}
            onChange={(e) =>
              onChangePreferences({ difficulty: e.currentTarget.value as Difficulty })
            }
            style={uiInputStyle}
          >
            {difficultyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label htmlFor="sensitivity">Sensibilité</label>
          <div>
            <select
              id="sensitivity"
              value={preferences.sensitivity}
              onChange={(e) =>
                onChangePreferences({ sensitivity: e.currentTarget.value as Sensitivity })
              }
              style={uiInputStyle}
            >
              {sensitivityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 6, fontSize: 12, color: uiColors.muted }}>
              Multiplicateur vitesse joueur :{' '}
              <strong style={{ color: uiColors.text }}>{multiplier.toFixed(1)}x</strong>
            </div>
          </div>

          <label htmlFor="mute">Mute</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              id="mute"
              type="checkbox"
              checked={preferences.mute}
              onChange={(e) => onChangePreferences({ mute: e.currentTarget.checked })}
            />
            {preferences.mute ? 'Activé' : 'Désactivé'}
            <span style={{ fontSize: 12, color: uiColors.muted }}>(touche M)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <button type="button" onClick={onStartGame} style={uiButtonStyle}>
            Jouer
          </button>
        </div>
      </section>

      <section style={{ ...uiCardStyle, marginTop: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Contrôles (desktop)</h2>
        <ul style={{ margin: '10px 0 0', color: uiColors.muted }}>
          <li>Déplacement : flèches ou WASD</li>
          <li>Tir : espace</li>
          <li>Pause : P</li>
          <li>Mute : M</li>
        </ul>
      </section>
    </main>
  );
}
