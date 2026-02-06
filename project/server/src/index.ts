import * as path from 'node:path';

import { createApp } from './app';
import { createLogger } from './logger';
import { startScoresSizeMonitor } from './storage/scores-size-monitor';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.APP_BIND_HOST ?? '0.0.0.0';

const logger = createLogger({ baseFields: { component: 'server' } });

const app = createApp({ logger });

// Derive the scores file path the same way score-repository does.
const dataDir = process.env.DATA_DIR ?? path.resolve(process.cwd(), 'data');
const scoresPath = path.join(dataDir, 'scores.json');
const sizeMonitor = startScoresSizeMonitor({ scoresPath, logger });

const server = app.listen(port, host, () => {
  logger.info('server listening', { event: 'server.listen', host, port });
});

function shutdown(signal: string) {
  logger.info('server shutting down', { event: 'server.shutdown', signal });
  sizeMonitor.stop();
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
