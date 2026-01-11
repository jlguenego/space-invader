import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_PREFERENCES,
  type Difficulty,
  type Preferences,
  type Sensitivity,
  loadPreferences,
  normalizePseudo,
  savePreferences,
  sensitivityMultiplier,
} from './storage/preferences';

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

export function App() {
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());
  const [pseudoInput, setPseudoInput] = useState<string>(preferences.pseudo ?? '');

  useEffect(() => {
    // Keep the input in sync if preferences are changed programmatically.
    setPseudoInput(preferences.pseudo ?? '');
  }, [preferences.pseudo]);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

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
        maxWidth: 820,
      }}
    >
      <h1 style={{ margin: 0 }}>Space Invaders MVP</h1>
      <p style={{ marginTop: 12 }}>
        Démo id019 : préférences persistées via localStorage (reload pour vérifier).
      </p>

      <section style={{ marginTop: 18, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Préférences</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10, marginTop: 12 }}>
          <label htmlFor="pseudo">Pseudo (optionnel)</label>
          <div>
            <input
              id="pseudo"
              value={pseudoInput}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setPseudoInput(value);
                setPreferences((prev) => ({ ...prev, pseudo: normalizePseudo(value) }));
              }}
              placeholder="Laisser vide pour Anonyme"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>
              Affiché : <strong>{displayedName}</strong>
            </div>
          </div>

          <label htmlFor="difficulty">Difficulté</label>
          <select
            id="difficulty"
            value={preferences.difficulty}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                difficulty: e.currentTarget.value as Difficulty,
              }))
            }
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
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
                setPreferences((prev) => ({
                  ...prev,
                  sensitivity: e.currentTarget.value as Sensitivity,
                }))
              }
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            >
              {sensitivityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>
              Multiplicateur vitesse joueur : <strong>{multiplier.toFixed(1)}x</strong>
            </div>
          </div>

          <label htmlFor="mute">Mute</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              id="mute"
              type="checkbox"
              checked={preferences.mute}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, mute: e.currentTarget.checked }))
              }
            />
            {preferences.mute ? 'Activé' : 'Désactivé'}
          </label>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setPreferences({ ...DEFAULT_PREFERENCES })}
            style={{ padding: '8px 12px' }}
          >
            Réinitialiser (defaults)
          </button>
          <button
            type="button"
            onClick={() => setPreferences(loadPreferences())}
            style={{ padding: '8px 12px' }}
          >
            Recharger depuis storage
          </button>
        </div>
      </section>
    </main>
  );
}
