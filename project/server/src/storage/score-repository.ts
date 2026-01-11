import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { Mutex } from './mutex';
import { createLogger, serializeError, type Logger } from '../logger';

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

export function createScoreRepository(options?: {
  dataDir?: string;
  logger?: Logger;
  writeJsonAtomic?: (targetPath: string, value: unknown) => Promise<void>;
}): ScoreRepository {
  const dataDir = options?.dataDir ?? process.env.DATA_DIR ?? path.resolve(process.cwd(), 'data');
  const scoresPath = path.join(dataDir, 'scores.json');
  const mutex = new Mutex();

  const logger = (
    options?.logger ?? createLogger({ baseFields: { component: 'score-repository' } })
  ).child({ scoresPath });
  const writeJsonAtomicImpl = options?.writeJsonAtomic ?? writeJsonAtomic;

  let initPromise: Promise<void> | undefined;

  async function ensureInitialized(): Promise<void> {
    if (initPromise) return initPromise;

    initPromise = mutex.runExclusive(async () => {
      try {
        await fs.mkdir(dataDir, { recursive: true });
      } catch (err) {
        logger.error('failed to ensure data directory', {
          event: 'scores.io_error',
          op: 'mkdir',
          dataDir,
          ...serializeError(err),
        });
        throw err;
      }

      if (!(await fileExists(scoresPath))) {
        try {
          await writeJsonAtomicImpl(scoresPath, defaultScoreFile());
          logger.info('initialized scores file', { event: 'scores.init', dataDir, scoresPath });
        } catch (err) {
          logger.error('failed to initialize scores file', {
            event: 'scores.io_error',
            op: 'init-write',
            dataDir,
            ...serializeError(err),
          });
          throw err;
        }
      }
    });

    return initPromise;
  }

  async function readCurrentFile(): Promise<ScoreFileV1> {
    await ensureInitialized();

    let raw: string;
    try {
      raw = await fs.readFile(scoresPath, 'utf8');
    } catch (err) {
      logger.error('failed to read scores file', {
        event: 'scores.io_error',
        op: 'read',
        ...serializeError(err),
      });
      throw err;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const parseErr = new Error('Invalid scores file: JSON parse failed');
      logger.error(parseErr.message, {
        event: 'scores.parse_error',
        op: 'parse',
        ...serializeError(err),
      });
      throw parseErr;
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

        try {
          await writeJsonAtomicImpl(scoresPath, current);
        } catch (err) {
          logger.error('failed to write scores file', {
            event: 'scores.io_error',
            op: 'write',
            ...serializeError(err),
          });
          throw err;
        }
        return entry;
      });
    },
  };
}
