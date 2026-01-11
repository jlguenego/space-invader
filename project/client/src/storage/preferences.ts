import type { StorageLike } from './storage-like';

// Use stable, language-agnostic internal values; UI labels can be localized later.
export type Difficulty = 'easy' | 'normal' | 'hard';
export type Sensitivity = 'low' | 'medium' | 'high';

export type Preferences = {
  pseudo: string | null;
  difficulty: Difficulty;
  sensitivity: Sensitivity;
  mute: boolean;
};

const STORAGE_KEY = 'space-invaders:prefs:v1';
const STORAGE_VERSION = 1 as const;

export const DEFAULT_PREFERENCES: Preferences = Object.freeze({
  pseudo: null,
  difficulty: 'normal',
  sensitivity: 'medium',
  mute: false,
});

export const PSEUDO_MAX_LENGTH = 24;

export function sensitivityMultiplier(sensitivity: Sensitivity): number {
  switch (sensitivity) {
    case 'low':
      return 0.8;
    case 'medium':
      return 1.0;
    case 'high':
      return 1.2;
  }
}

export function normalizePseudo(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length <= PSEUDO_MAX_LENGTH) return trimmed;
  return trimmed.slice(0, PSEUDO_MAX_LENGTH);
}

type PersistedPreferencesV1 = {
  version: 1;
  pseudo: string | null;
  difficulty: Difficulty;
  sensitivity: Sensitivity;
  mute: boolean;
};

function isDifficulty(value: unknown): value is Difficulty {
  return value === 'easy' || value === 'normal' || value === 'hard';
}

function isSensitivity(value: unknown): value is Sensitivity {
  return value === 'low' || value === 'medium' || value === 'high';
}

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parsePersistedPreferencesV1(parsed: unknown): PersistedPreferencesV1 | null {
  if (!parsed || typeof parsed !== 'object') return null;

  const record = parsed as Record<string, unknown>;
  if (record.version !== STORAGE_VERSION) return null;

  const pseudo = normalizePseudo(record.pseudo);
  const difficulty = isDifficulty(record.difficulty)
    ? record.difficulty
    : DEFAULT_PREFERENCES.difficulty;
  const sensitivity = isSensitivity(record.sensitivity)
    ? record.sensitivity
    : DEFAULT_PREFERENCES.sensitivity;
  const mute = typeof record.mute === 'boolean' ? record.mute : DEFAULT_PREFERENCES.mute;

  return {
    version: 1,
    pseudo,
    difficulty,
    sensitivity,
    mute,
  };
}

function getBrowserStorage(): StorageLike | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadPreferences(
  storage: StorageLike | undefined = getBrowserStorage(),
): Preferences {
  if (!storage) return { ...DEFAULT_PREFERENCES };

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };

    const parsed = safeParseJson(raw);
    const persisted = parsePersistedPreferencesV1(parsed);
    if (!persisted) return { ...DEFAULT_PREFERENCES };

    return {
      pseudo: persisted.pseudo,
      difficulty: persisted.difficulty,
      sensitivity: persisted.sensitivity,
      mute: persisted.mute,
    };
  } catch (error) {
    console.warn('Failed to load preferences from localStorage', error);
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(
  preferences: Preferences,
  storage: StorageLike | undefined = getBrowserStorage(),
): void {
  if (!storage) return;

  const payload: PersistedPreferencesV1 = {
    version: 1,
    pseudo: normalizePseudo(preferences.pseudo),
    difficulty: isDifficulty(preferences.difficulty)
      ? preferences.difficulty
      : DEFAULT_PREFERENCES.difficulty,
    sensitivity: isSensitivity(preferences.sensitivity)
      ? preferences.sensitivity
      : DEFAULT_PREFERENCES.sensitivity,
    mute: Boolean(preferences.mute),
  };

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save preferences to localStorage', error);
  }
}

export function updatePreferences(
  patch: Partial<Preferences>,
  storage: StorageLike | undefined = getBrowserStorage(),
): Preferences {
  const current = loadPreferences(storage);
  const updated: Preferences = {
    ...current,
    ...patch,
    pseudo: patch.pseudo !== undefined ? normalizePseudo(patch.pseudo) : current.pseudo,
    difficulty:
      patch.difficulty !== undefined && isDifficulty(patch.difficulty)
        ? patch.difficulty
        : current.difficulty,
    sensitivity:
      patch.sensitivity !== undefined && isSensitivity(patch.sensitivity)
        ? patch.sensitivity
        : current.sensitivity,
    mute: patch.mute !== undefined ? Boolean(patch.mute) : current.mute,
  };

  savePreferences(updated, storage);
  return updated;
}
