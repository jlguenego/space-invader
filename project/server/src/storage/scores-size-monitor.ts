import * as fs from 'node:fs/promises';

import { serializeError, type Logger } from '../logger';

/**
 * Default interval between periodic file-size checks (1 hour).
 */
export const SCORES_SIZE_CHECK_INTERVAL_MS = 3_600_000;

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/**
 * Format a byte count into a human-readable string (e.g. "1.2 MB").
 * Pure function — no side effects.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  // Determine the appropriate unit index (0=B … 4=TB).
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), UNITS.length - 1);

  if (i === 0) return `${bytes} B`;

  const value = bytes / k ** i;
  // Use at most 2 decimal places; strip trailing zeros.
  return `${parseFloat(value.toFixed(2))} ${UNITS[i]}`;
}

/**
 * Log the current size of the scores file.
 *
 * - On success: emits an `info` log with `event: "scores.file_size"`.
 * - File not found: emits a `warn` log (not an error — the file may not
 *   exist yet on first startup before any score is posted).
 * - Other I/O errors: emits a `warn` log with error details.
 *
 * Never throws — the caller can safely fire-and-forget.
 */
export async function checkScoresFileSize(scoresPath: string, logger: Logger): Promise<void> {
  try {
    const stat = await fs.stat(scoresPath);

    logger.info('scores file size', {
      event: 'scores.file_size',
      sizeBytes: stat.size,
      sizeHuman: formatFileSize(stat.size),
      scoresPath,
    });
  } catch (err: unknown) {
    const isNotFound =
      err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT';

    if (isNotFound) {
      logger.warn('scores file not found (not yet created)', {
        event: 'scores.file_size',
        scoresPath,
      });
    } else {
      logger.warn('failed to stat scores file', {
        event: 'scores.file_size',
        scoresPath,
        ...serializeError(err),
      });
    }
  }
}

export type ScoresSizeMonitor = {
  /** Stop the periodic check and clear the timer. Safe to call multiple times. */
  stop: () => void;
};

/**
 * Start monitoring the size of the scores file.
 *
 * Emits a size log immediately (at startup) and then periodically at the
 * given interval.  The returned handle exposes a `stop()` method that clears
 * the timer.  The timer is also `unref()`-ed so it does not prevent the
 * process from exiting on its own.
 */
export function startScoresSizeMonitor(options: {
  scoresPath: string;
  logger: Logger;
  intervalMs?: number;
}): ScoresSizeMonitor {
  const { scoresPath, logger } = options;
  const intervalMs = options.intervalMs ?? SCORES_SIZE_CHECK_INTERVAL_MS;

  const monitorLogger = logger.child({ component: 'scores-size-monitor' });

  // Fire immediately (fire-and-forget — checkScoresFileSize never throws).
  void checkScoresFileSize(scoresPath, monitorLogger);

  const timer = setInterval(() => {
    void checkScoresFileSize(scoresPath, monitorLogger);
  }, intervalMs);

  // Ensure the timer does not keep the process alive.
  if (typeof timer === 'object' && 'unref' in timer) {
    timer.unref();
  }

  let stopped = false;

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      clearInterval(timer);
    },
  };
}
