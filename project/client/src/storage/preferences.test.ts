import { describe, expect, it } from 'bun:test';

import {
  DEFAULT_PREFERENCES,
  PSEUDO_MAX_LENGTH,
  loadPreferences,
  normalizePseudo,
  savePreferences,
} from './preferences';
import type { StorageLike } from './storage-like';

class MemoryStorage implements StorageLike {
  private readonly store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }
}

describe('normalizePseudo', () => {
  it('returns null for non-strings or empty strings', () => {
    expect(normalizePseudo(null)).toBe(null);
    expect(normalizePseudo(undefined)).toBe(null);
    expect(normalizePseudo(123)).toBe(null);
    expect(normalizePseudo('')).toBe(null);
    expect(normalizePseudo('   ')).toBe(null);
  });

  it('trims and truncates to max length', () => {
    expect(normalizePseudo('  Alice  ')).toBe('Alice');

    const long = 'a'.repeat(PSEUDO_MAX_LENGTH + 10);
    expect(normalizePseudo(long)?.length).toBe(PSEUDO_MAX_LENGTH);
  });
});

describe('loadPreferences / savePreferences', () => {
  it('loads defaults when nothing is stored', () => {
    const storage = new MemoryStorage();
    expect(loadPreferences(storage)).toEqual(DEFAULT_PREFERENCES);
  });

  it('persists and reloads preferences', () => {
    const storage = new MemoryStorage();

    savePreferences(
      {
        pseudo: '  Bob  ',
        difficulty: 'hard',
        sensitivity: 'high',
        mute: true,
      },
      storage,
    );

    expect(loadPreferences(storage)).toEqual({
      pseudo: 'Bob',
      difficulty: 'hard',
      sensitivity: 'high',
      mute: true,
    });
  });

  it('falls back to defaults for corrupted JSON', () => {
    const storage = new MemoryStorage();
    storage.setItem('space-invaders:prefs:v1', '{ not json');

    expect(loadPreferences(storage)).toEqual(DEFAULT_PREFERENCES);
  });

  it('falls back to defaults for unknown values or wrong version', () => {
    const storage = new MemoryStorage();

    storage.setItem(
      'space-invaders:prefs:v1',
      JSON.stringify({
        version: 999,
        pseudo: 'Eve',
        difficulty: 'extreme',
        sensitivity: 'ultra',
        mute: 'yes',
      }),
    );

    expect(loadPreferences(storage)).toEqual(DEFAULT_PREFERENCES);

    storage.setItem(
      'space-invaders:prefs:v1',
      JSON.stringify({
        version: 1,
        pseudo: 'Eve',
        difficulty: 'extreme',
        sensitivity: 'ultra',
        mute: 'yes',
      }),
    );

    expect(loadPreferences(storage)).toEqual({
      ...DEFAULT_PREFERENCES,
      pseudo: 'Eve',
    });
  });

  it('does not throw when storage throws', () => {
    const throwingStorage: StorageLike = {
      getItem(): string | null {
        throw new Error('blocked');
      },
      setItem(): void {
        throw new Error('blocked');
      },
      removeItem(): void {
        throw new Error('blocked');
      },
    };

    expect(loadPreferences(throwingStorage)).toEqual(DEFAULT_PREFERENCES);
    expect(() => savePreferences(DEFAULT_PREFERENCES, throwingStorage)).not.toThrow();
  });
});
