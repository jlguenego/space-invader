import { describe, expect, test } from 'bun:test';

import { ApiClientError, requestJson } from './api-client';

describe('requestJson', () => {
  test('parses a JSON ok response', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ ok: true, saved: { id: '1' } }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      });
    }) as unknown as typeof fetch;

    try {
      const body = await requestJson<{ ok: true; saved: { id: string } }>('/api/scores', {
        method: 'POST',
      });
      expect(body.ok).toBe(true);
      expect(body.saved.id).toBe('1');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('throws ApiClientError for API error body (ok:false)', async () => {
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
      await expect(
        requestJson('/api/scores', {
          method: 'POST',
        }),
      ).rejects.toMatchObject({
        name: 'ApiClientError',
        kind: 'http',
        status: 400,
        apiErrorCode: 'VALIDATION_ERROR',
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('throws ApiClientError(network) on fetch rejection', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;

    try {
      await expect(requestJson('/api/leaderboard/day')).rejects.toMatchObject({
        name: 'ApiClientError',
        kind: 'network',
      } satisfies Partial<ApiClientError>);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
