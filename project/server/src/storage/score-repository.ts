import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { Mutex } from './mutex';

export type ScoreEntry = {
  id: string;
  createdAt: string; // UTC ISO
  dayKeyParis: string; // YYYY-MM-DD
  pseudo: string;
  score: number;
};

export type ScoreFileV1 = {
  version: 1;
  scores: ScoreEntry[];
};

export type ScoreRepository = {
  readAll: () => Promise<ScoreFileV1>;
  append: (entry: ScoreEntry) => Promise<ScoreEntry>;
  getFilePath: () => string;
};

function defaultScoreFile(): ScoreFileV1 {
  return { version: 1, scores: [] };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function assertScoreFileV1(value: unknown): asserts value is ScoreFileV1 {
  if (!isObject(value)) {
    throw new Error('Invalid scores file: expected object');
  }

  if (value.version !== 1) {
    throw new Error('Invalid scores file: unsupported version');
  }

  if (!Array.isArray(value.scores)) {
    throw new Error('Invalid scores file: scores must be an array');
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeJsonAtomic(targetPath: string, value: unknown): Promise<void> {
  const tmpPath = `${targetPath}.tmp`; // => scores.json.tmp
  const payload = `${JSON.stringify(value, null, 2)}\n`;

  await fs.writeFile(tmpPath, payload, 'utf8');

  try {
    await fs.rename(tmpPath, targetPath);
  } catch (err) {
    // Best-effort cleanup; the caller may retry.
    try {
      await fs.rm(tmpPath, { force: true });
    } catch {
      // ignore
    }

    throw err;
  }
}

export function createScoreRepository(options?: { dataDir?: string }): ScoreRepository {
  const dataDir = options?.dataDir ?? process.env.DATA_DIR ?? path.resolve(process.cwd(), 'data');
  const scoresPath = path.join(dataDir, 'scores.json');
  const mutex = new Mutex();

  let initPromise: Promise<void> | undefined;

  async function ensureInitialized(): Promise<void> {
    if (initPromise) return initPromise;

    initPromise = mutex.runExclusive(async () => {
      await fs.mkdir(dataDir, { recursive: true });

      if (!(await fileExists(scoresPath))) {
        await writeJsonAtomic(scoresPath, defaultScoreFile());
      }
    });

    return initPromise;
  }

  async function readCurrentFile(): Promise<ScoreFileV1> {
    await ensureInitialized();

    const raw = await fs.readFile(scoresPath, 'utf8');

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Invalid scores file: JSON parse failed');
    }

    assertScoreFileV1(parsed);

    return parsed;
  }

  return {
    getFilePath: () => scoresPath,

    readAll: async () => {
      return await readCurrentFile();
    },

    append: async (entry: ScoreEntry) => {
      await ensureInitialized();

      return await mutex.runExclusive(async () => {
        const current = await readCurrentFile();
        current.scores.push(entry);

        await writeJsonAtomic(scoresPath, current);
        return entry;
      });
    },
  };
}
