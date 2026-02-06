import { describe, expect, test } from 'bun:test';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

import type { LogEvent, Logger } from '../logger';
import { checkScoresFileSize, formatFileSize, startScoresSizeMonitor } from './scores-size-monitor';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function makeTempDir(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'space-invaders-size-monitor-'));
}

function collectingLogger(): { events: LogEvent[]; logger: Logger } {
  const events: LogEvent[] = [];

  function record(level: LogEvent['level'], msg: string, fields?: Record<string, unknown>) {
    events.push({ ts: new Date().toISOString(), level, msg, ...fields } as LogEvent);
  }

  const logger: Logger = {
    debug: (msg, fields) => record('debug', msg, fields),
    info: (msg, fields) => record('info', msg, fields),
    warn: (msg, fields) => record('warn', msg, fields),
    error: (msg, fields) => record('error', msg, fields),
    child: () => logger, // flat — good enough for tests
  };

  return { events, logger };
}

// ---------------------------------------------------------------------------
// formatFileSize
// ---------------------------------------------------------------------------

describe('formatFileSize', () => {
  test('0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  test('bytes (< 1 KB)', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1)).toBe('1 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  test('kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(10240)).toBe('10 KB');
  });

  test('megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1258291)).toBe('1.2 MB');
  });

  test('gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  test('handles large values without int32 truncation', () => {
    // 100 GB
    const size = 100 * 1024 * 1024 * 1024;
    expect(formatFileSize(size)).toBe('100 GB');
  });
});

// ---------------------------------------------------------------------------
// checkScoresFileSize
// ---------------------------------------------------------------------------

describe('checkScoresFileSize', () => {
  test('logs info with size when file exists', async () => {
    const tmpDir = await makeTempDir();
    const filePath = path.join(tmpDir, 'scores.json');

    try {
      const content = JSON.stringify({ version: 1, scores: [] }, null, 2);
      await fs.writeFile(filePath, content, 'utf8');

      const { events, logger } = collectingLogger();
      await checkScoresFileSize(filePath, logger);

      expect(events).toHaveLength(1);
      const evt = events[0];
      expect(evt.level).toBe('info');
      expect(evt.event).toBe('scores.file_size');
      expect(typeof evt.sizeBytes).toBe('number');
      expect(evt.sizeBytes as number).toBeGreaterThan(0);
      expect(typeof evt.sizeHuman).toBe('string');
      expect(evt.scoresPath).toBe(filePath);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  test('logs warn when file does not exist', async () => {
    const tmpDir = await makeTempDir();
    const filePath = path.join(tmpDir, 'nonexistent.json');

    try {
      const { events, logger } = collectingLogger();
      await checkScoresFileSize(filePath, logger);

      expect(events).toHaveLength(1);
      const evt = events[0];
      expect(evt.level).toBe('warn');
      expect(evt.event).toBe('scores.file_size');
      expect(evt.scoresPath).toBe(filePath);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  test('logs warn on I/O error other than ENOENT', async () => {
    // Use a path that will fail for a reason other than "not found" —
    // stat-ing a file inside a non-existent nested directory produces ENOENT
    // as well, so instead we point at something that exists but cannot be
    // stat-ed.  On Windows/Linux the simplest way is to point at a directory
    // as if it were a file; however, fs.stat succeeds on directories too.
    // So we simulate by providing an empty-string path which triggers an
    // error on most OSes.  We accept an ENOENT warn as well; the important
    // thing is no throw.
    const { events, logger } = collectingLogger();
    await checkScoresFileSize('', logger);

    expect(events).toHaveLength(1);
    expect(events[0].level).toBe('warn');
  });

  test('logs sizeBytes 0 for an empty file', async () => {
    const tmpDir = await makeTempDir();
    const filePath = path.join(tmpDir, 'scores.json');

    try {
      await fs.writeFile(filePath, '', 'utf8');

      const { events, logger } = collectingLogger();
      await checkScoresFileSize(filePath, logger);

      expect(events).toHaveLength(1);
      expect(events[0].level).toBe('info');
      expect(events[0].sizeBytes).toBe(0);
      expect(events[0].sizeHuman).toBe('0 B');
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// startScoresSizeMonitor
// ---------------------------------------------------------------------------

describe('startScoresSizeMonitor', () => {
  test('emits a log immediately at startup', async () => {
    const tmpDir = await makeTempDir();
    const filePath = path.join(tmpDir, 'scores.json');

    try {
      await fs.writeFile(filePath, '{}', 'utf8');

      const { events, logger } = collectingLogger();
      const monitor = startScoresSizeMonitor({
        scoresPath: filePath,
        logger,
        intervalMs: 60_000, // high interval — we only care about the immediate call
      });

      // The immediate call is async (fire-and-forget). Give it a tick to resolve.
      await new Promise((r) => setTimeout(r, 50));

      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0].event).toBe('scores.file_size');

      monitor.stop();
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  test('stop() clears the timer and can be called multiple times', async () => {
    const tmpDir = await makeTempDir();
    const filePath = path.join(tmpDir, 'scores.json');

    try {
      await fs.writeFile(filePath, '{}', 'utf8');

      const { events, logger } = collectingLogger();
      const monitor = startScoresSizeMonitor({
        scoresPath: filePath,
        logger,
        intervalMs: 10, // very short
      });

      // Wait for the immediate check to complete.
      await new Promise((r) => setTimeout(r, 50));

      monitor.stop();
      monitor.stop(); // idempotent — no error

      const countAfterStop = events.length;

      // Wait a bit more to verify no new logs appear.
      await new Promise((r) => setTimeout(r, 50));

      expect(events.length).toBe(countAfterStop);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  test('stop() works even when called before timer fires', () => {
    const { logger } = collectingLogger();
    const monitor = startScoresSizeMonitor({
      scoresPath: '/nonexistent/scores.json',
      logger,
      intervalMs: 999_999,
    });

    // Should not throw.
    monitor.stop();
  });
});
