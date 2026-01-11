import { describe, expect, test } from 'bun:test';
import express, { type Router } from 'express';
import { AddressInfo } from 'node:net';

import { createApp } from './app';
import { createApiRouter } from './routes';

async function start(app: ReturnType<typeof createApp>) {
  const server = app.listen(0);
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}

describe('server /api socle', () => {
  test('GET /api responds ok:true', async () => {
    const app = createApp();
    const srv = await start(app);

    try {
      const res = await fetch(`${srv.baseUrl}/api`);
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ ok: true });
    } finally {
      await srv.close();
    }
  });

  test('GET /api includes minimal security headers', async () => {
    const app = createApp();
    const srv = await start(app);

    try {
      const res = await fetch(`${srv.baseUrl}/api`);
      expect(res.status).toBe(200);

      expect(res.headers.get('x-powered-by')).toBeNull();
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('DENY');
      expect(res.headers.get('referrer-policy')).toBe('no-referrer');
      expect(res.headers.get('permissions-policy')).toBe(
        'camera=(), microphone=(), geolocation=()',
      );
    } finally {
      await srv.close();
    }
  });

  test('unknown /api route returns JSON error contract', async () => {
    const app = createApp();
    const srv = await start(app);

    try {
      const res = await fetch(`${srv.baseUrl}/api/nope`);
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body).toEqual({ ok: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
    } finally {
      await srv.close();
    }
  });

  test('JSON payload too large returns 413 and JSON error contract', async () => {
    const app = createApp();
    const srv = await start(app);

    try {
      const padding = 'a'.repeat(12 * 1024);
      const res = await fetch(`${srv.baseUrl}/api/scores`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ score: 0, pseudo: 'Anonyme', padding }),
      });

      expect(res.status).toBe(413);
      const body = await res.json();
      expect(body).toEqual({
        ok: false,
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Payload too large' },
      });
    } finally {
      await srv.close();
    }
  });

  test('NODE_ENV=production hides internal error details', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const boomApiRouter: Router = createApiRouter({
      extend: (router) => {
        router.get('/_boom', () => {
          throw new Error('boom');
        });
      },
    });

    const app = createApp({ apiRouter: express.Router().use('/', boomApiRouter) });
    const srv = await start(app);

    try {
      const res = await fetch(`${srv.baseUrl}/api/_boom`);
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body).toEqual({
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal error',
        },
      });
    } finally {
      process.env.NODE_ENV = prev;
      await srv.close();
    }
  });
});
