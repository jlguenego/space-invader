import { describe, expect, test } from 'bun:test';

import { saveScore } from './scores-service';

describe('saveScore', () => {
  test('maps network errors to a non-technical French message', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;

    try {
      await expect(saveScore({ score: 123, pseudo: 'Alice' })).rejects.toThrow(
        'Impossible de contacter le serveur. Réessaie plus tard.',
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('maps validation errors to a non-technical French message', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid score' },
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        },
      );
    }) as unknown as typeof fetch;

    try {
      await expect(saveScore({ score: -1, pseudo: null })).rejects.toThrow(
        "Impossible d'enregistrer le score. Vérifie ton pseudo et réessaie.",
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
