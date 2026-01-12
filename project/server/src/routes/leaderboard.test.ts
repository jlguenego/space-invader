import { describe, expect, test } from 'bun:test';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { AddressInfo } from 'node:net';

import { createApp } from '../app';
import { dayKeyParisFromDate } from '../domain/time-service';
import { createScoreRepository, type ScoreEntry } from '../storage/score-repository';

type LeaderboardEntry = {
  rank: number;
  pseudo: string;
  score: number;
};

type LeaderboardDayResponse = {
  timezone: string;
  dayKeyParis: string;
  entries: LeaderboardEntry[];
};

async function makeTempDir(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'space-invaders-api-leaderboard-'));
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

async function withFixedDate<T>(isoUtc: string, fn: () => Promise<T>): Promise<T> {
  const fixedMs = new Date(isoUtc).getTime();
  if (!Number.isFinite(fixedMs)) throw new Error(`Invalid fixed date: ${isoUtc}`);

  const RealDate = Date;
  class MockDate extends RealDate {
    constructor(...args: unknown[]) {
      super(...(args as unknown as ConstructorParameters<typeof RealDate>));
      if (args.length === 0) return new RealDate(fixedMs) as unknown as MockDate;
    }

    static now() {
      return fixedMs;
    }

    static parse = RealDate.parse;
    static UTC = RealDate.UTC;
  }

  // @ts-expect-error - override global Date for test determinism
  globalThis.Date = MockDate;
  try {
    return await fn();
  } finally {
    globalThis.Date = RealDate;
  }
}

function makeEntry(
  overrides: Partial<ScoreEntry> & Pick<ScoreEntry, 'dayKeyParis' | 'score'>,
): ScoreEntry {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    dayKeyParis: overrides.dayKeyParis,
    pseudo: overrides.pseudo ?? 'Anonyme',
    score: overrides.score,
  };
}

describe('GET /api/leaderboard/day', () => {
  test('200: empty list when no scores', async () => {
    await withFixedDate('2026-01-12T12:00:00.000Z', async () => {
      const tmpRoot = await makeTempDir();
      const prevDataDir = process.env.DATA_DIR;
      process.env.DATA_DIR = path.join(tmpRoot, 'data');

      const srv = await start();

      try {
        const res = await fetch(`${srv.baseUrl}/api/leaderboard/day`);
        expect(res.status).toBe(200);

        const body: LeaderboardDayResponse = await res.json();
        expect(body.timezone).toBe('Europe/Paris');
        expect(typeof body.dayKeyParis).toBe('string');
        expect(body.entries).toEqual([]);
      } finally {
        process.env.DATA_DIR = prevDataDir;
        await srv.close();
        await fs.rm(tmpRoot, { recursive: true, force: true });
      }
    });
  });

  test('200: filters by Paris dayKey and sorts desc, cap 10, ranks', async () => {
    await withFixedDate('2026-01-12T12:00:00.000Z', async () => {
      const tmpRoot = await makeTempDir();
      const prevDataDir = process.env.DATA_DIR;
      const dataDir = path.join(tmpRoot, 'data');
      process.env.DATA_DIR = dataDir;

      const repo = createScoreRepository({ dataDir });
      const todayParis = dayKeyParisFromDate(new Date());

      // Other day should be ignored.
      await repo.append(makeEntry({ dayKeyParis: '1999-01-01', score: 999, pseudo: 'Old' }));

      // 12 scores today => cap 10.
      const scores = [5, 200, 1, 199, 300, 2, 999, 10, 9, 8, 7, 6];

      // Force deterministic ordering for the score ties (50 vs 50): createdAt then id.
      await repo.append(
        makeEntry({
          dayKeyParis: todayParis,
          score: 50,
          pseudo: 'TieA',
          createdAt: '2026-01-01T00:00:00.000Z',
          id: '00000000-0000-0000-0000-000000000001',
        }),
      );
      await repo.append(
        makeEntry({
          dayKeyParis: todayParis,
          score: 50,
          pseudo: 'TieB',
          createdAt: '2026-01-02T00:00:00.000Z',
          id: '00000000-0000-0000-0000-000000000002',
        }),
      );

      for (const score of scores) {
        await repo.append(makeEntry({ dayKeyParis: todayParis, score, pseudo: `S${score}` }));
      }

      const srv = await start();

      try {
        const res = await fetch(`${srv.baseUrl}/api/leaderboard/day`);
        expect(res.status).toBe(200);

        const body: LeaderboardDayResponse = await res.json();
        expect(body).toMatchObject({ timezone: 'Europe/Paris', dayKeyParis: todayParis });

        expect(Array.isArray(body.entries)).toBe(true);
        expect(body.entries).toHaveLength(10);

        // Sorted desc by score.
        const returnedScores = body.entries.map((e) => e.score);
        expect(returnedScores).toEqual([...returnedScores].sort((a: number, b: number) => b - a));

        // Ranks are 1..n in order.
        const returnedRanks = body.entries.map((e) => e.rank);
        expect(returnedRanks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        // Tie-breaker is deterministic for same score (50): TieA should appear before TieB.
        const pseudosFor50 = body.entries.filter((e) => e.score === 50).map((e) => e.pseudo);
        expect(pseudosFor50).toEqual(['TieA', 'TieB']);
      } finally {
        process.env.DATA_DIR = prevDataDir;
        await srv.close();
        await fs.rm(tmpRoot, { recursive: true, force: true });
      }
    });
  });
});
