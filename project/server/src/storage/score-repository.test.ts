import { describe, expect, test } from 'bun:test';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

import { createScoreRepository, type ScoreEntry } from './score-repository';
import type { LogEvent, Logger } from '../logger';

async function makeTempDir(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'space-invaders-scores-'));
}

async function readText(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf8');
}

describe('scoreRepository (file JSON + atomic write + mutex)', () => {
  test('initializes missing data dir and scores.json', async () => {
    const tmpRoot = await makeTempDir();
    const dataDir = path.join(tmpRoot, 'data');

    try {
      const repo = createScoreRepository({ dataDir });
      const file = await repo.readAll();

      expect(file).toEqual({ version: 1, scores: [] });

      const scoresPath = repo.getFilePath();
      await expect(readText(scoresPath)).resolves.toContain('"version": 1');
      await expect(fs.access(`${scoresPath}.tmp`)).rejects.toBeTruthy();
    } finally {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });

  test('concurrent appends produce valid final JSON with all entries (no corruption)', async () => {
    const tmpRoot = await makeTempDir();
    const dataDir = path.join(tmpRoot, 'data');

    try {
      const repo = createScoreRepository({ dataDir });

      const entries: ScoreEntry[] = Array.from({ length: 40 }, (_v, i) => ({
        id: `id-${i}`,
        createdAt: `2026-01-11T00:00:${String(i).padStart(2, '0')}.000Z`,
        dayKeyParis: '2026-01-11',
        pseudo: 'Anonyme',
        score: i,
      }));

      await Promise.all(entries.map((e) => repo.append(e)));

      const scoresPath = repo.getFilePath();
      const raw = await readText(scoresPath);

      // Must be parseable JSON
      const parsed = JSON.parse(raw) as { version: number; scores: Array<{ id: string }> };
      expect(parsed.version).toBe(1);
      expect(parsed.scores).toHaveLength(entries.length);

      const ids = new Set(parsed.scores.map((s) => s.id));
      for (const e of entries) {
        expect(ids.has(e.id)).toBe(true);
      }

      await expect(fs.access(`${scoresPath}.tmp`)).rejects.toBeTruthy();
    } finally {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });

  test('invalid JSON on disk throws (no silent repair)', async () => {
    const tmpRoot = await makeTempDir();
    const dataDir = path.join(tmpRoot, 'data');

    try {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(path.join(dataDir, 'scores.json'), '{not valid json', 'utf8');

      const repo = createScoreRepository({ dataDir });
      await expect(repo.readAll()).rejects.toThrow(/JSON parse failed/);
    } finally {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });

  test('unsupported version throws', async () => {
    const tmpRoot = await makeTempDir();
    const dataDir = path.join(tmpRoot, 'data');

    try {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(
        path.join(dataDir, 'scores.json'),
        JSON.stringify({ version: 2, scores: [] }, null, 2),
        'utf8',
      );

      const repo = createScoreRepository({ dataDir });
      await expect(repo.readAll()).rejects.toThrow(/unsupported version/);
    } finally {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });

  test('logs an error when atomic write fails (incident detectable via logs)', async () => {
    const tmpRoot = await makeTempDir();
    const dataDir = path.join(tmpRoot, 'data');

    const events: LogEvent[] = [];
    const logger: Logger = {
      debug: (msg, fields) => events.push({ ts: 'x', level: 'debug', msg, ...(fields ?? {}) }),
      info: (msg, fields) => events.push({ ts: 'x', level: 'info', msg, ...(fields ?? {}) }),
      warn: (msg, fields) => events.push({ ts: 'x', level: 'warn', msg, ...(fields ?? {}) }),
      error: (msg, fields) => events.push({ ts: 'x', level: 'error', msg, ...(fields ?? {}) }),
      child: (_fields) => logger,
    };

    try {
      const repo = createScoreRepository({
        dataDir,
        logger,
        writeJsonAtomic: async () => {
          throw new Error('simulated write failure');
        },
      });

      const entry: ScoreEntry = {
        id: 'id-1',
        createdAt: '2026-01-11T00:00:00.000Z',
        dayKeyParis: '2026-01-11',
        pseudo: 'Anonyme',
        score: 1,
      };

      await expect(repo.append(entry)).rejects.toThrow(/simulated write failure/);

      const errorEvent = events.find((e) => e.level === 'error');
      if (!errorEvent) {
        throw new Error(`Expected an error log event. Got: ${JSON.stringify(events, null, 2)}`);
      }

      // Must be exploitable/greppable: structured fields including an event name and an operation.
      expect((errorEvent as Record<string, unknown>).event).toBeTruthy();
      expect((errorEvent as Record<string, unknown>).op).toBeTruthy();
    } finally {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });
});
