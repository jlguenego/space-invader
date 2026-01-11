import { describe, expect, test } from 'bun:test';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { AddressInfo } from 'node:net';

import { createApp } from '../app';
import { dayKeyParisFromUtcIso } from '../domain/time-service';

async function makeTempDir(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'space-invaders-api-scores-'));
}

async function start() {
  const app = createApp();
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

describe('POST /api/scores', () => {
  test('201: pseudo absent -> Anonyme, createdAt/dayKeyParis computed', async () => {
    const tmpRoot = await makeTempDir();
    const prevDataDir = process.env.DATA_DIR;
    process.env.DATA_DIR = path.join(tmpRoot, 'data');

    const srv = await start();

    try {
      const res = await fetch(`${srv.baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ score: 123 }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();

      expect(body.ok).toBe(true);
      expect(body.saved.score).toBe(123);
      expect(body.saved.pseudo).toBe('Anonyme');
      expect(typeof body.saved.id).toBe('string');
      expect(typeof body.saved.createdAt).toBe('string');
      expect(typeof body.saved.dayKeyParis).toBe('string');

      expect(body.saved.dayKeyParis).toBe(dayKeyParisFromUtcIso(body.saved.createdAt));
    } finally {
      process.env.DATA_DIR = prevDataDir;
      await srv.close();
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });

  test('201: pseudo is trimmed; null pseudo becomes Anonyme', async () => {
    const tmpRoot = await makeTempDir();
    const prevDataDir = process.env.DATA_DIR;
    process.env.DATA_DIR = path.join(tmpRoot, 'data');

    const srv = await start();

    try {
      const res1 = await fetch(`${srv.baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ score: 1, pseudo: '  Alice  ' }),
      });
      expect(res1.status).toBe(201);
      await expect(res1.json()).resolves.toMatchObject({
        ok: true,
        saved: { pseudo: 'Alice', score: 1 },
      });

      const res2 = await fetch(`${srv.baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ score: 2, pseudo: null }),
      });
      expect(res2.status).toBe(201);
      await expect(res2.json()).resolves.toMatchObject({
        ok: true,
        saved: { pseudo: 'Anonyme', score: 2 },
      });
    } finally {
      process.env.DATA_DIR = prevDataDir;
      await srv.close();
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });

  test('400: invalid score (missing, not a number, negative, null)', async () => {
    const tmpRoot = await makeTempDir();
    const prevDataDir = process.env.DATA_DIR;
    process.env.DATA_DIR = path.join(tmpRoot, 'data');

    const srv = await start();

    async function post(body: unknown) {
      return await fetch(`${srv.baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    try {
      const r1 = await post({});
      expect(r1.status).toBe(400);
      await expect(r1.json()).resolves.toEqual({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid score' },
      });

      const r2 = await post({ score: '123' });
      expect(r2.status).toBe(400);

      const r3 = await post({ score: -1 });
      expect(r3.status).toBe(400);

      const r4 = await post({ score: null });
      expect(r4.status).toBe(400);
    } finally {
      process.env.DATA_DIR = prevDataDir;
      await srv.close();
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });

  test('400: invalid pseudo (non-string) and pseudo too long', async () => {
    const tmpRoot = await makeTempDir();
    const prevDataDir = process.env.DATA_DIR;
    process.env.DATA_DIR = path.join(tmpRoot, 'data');

    const srv = await start();

    try {
      const r1 = await fetch(`${srv.baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ score: 1, pseudo: 123 }),
      });

      expect(r1.status).toBe(400);
      await expect(r1.json()).resolves.toEqual({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid pseudo' },
      });

      const tooLong = 'a'.repeat(25);
      const r2 = await fetch(`${srv.baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ score: 1, pseudo: tooLong }),
      });

      expect(r2.status).toBe(400);
      await expect(r2.json()).resolves.toEqual({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Pseudo too long (max 24)' },
      });
    } finally {
      process.env.DATA_DIR = prevDataDir;
      await srv.close();
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });
});
