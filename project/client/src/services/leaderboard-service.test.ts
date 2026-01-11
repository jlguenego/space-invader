import { describe, expect, test } from 'bun:test';

import type { LeaderboardDay } from '../ui/ui-state-machine';

import { getDailyLeaderboard } from './leaderboard-service';

describe('getDailyLeaderboard', () => {
  test('returns parsed leaderboard on success', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      const body: LeaderboardDay = {
        timezone: 'Europe/Paris',
        dayKeyParis: '2026-01-11',
        entries: [{ rank: 1, pseudo: 'Anonyme', score: 100 }],
      };

      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as unknown as typeof fetch;

    try {
      const leaderboard = await getDailyLeaderboard();
      expect(leaderboard.timezone).toBe('Europe/Paris');
      expect(leaderboard.entries.length).toBe(1);
      expect(leaderboard.entries[0]?.rank).toBe(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('maps network errors to a non-technical French message', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;

    try {
      await expect(getDailyLeaderboard()).rejects.toThrow(
        'Impossible de contacter le serveur. Réessaie plus tard.',
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
