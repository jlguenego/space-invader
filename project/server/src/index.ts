import { createApp } from './app';
import { createLogger } from './logger';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.APP_BIND_HOST ?? '0.0.0.0';

const logger = createLogger({ baseFields: { component: 'server' } });

const app = createApp({ logger });

const server = app.listen(port, host, () => {
  logger.info('server listening', { event: 'server.listen', host, port });
});

function shutdown(signal: string) {
  logger.info('server shutting down', { event: 'server.shutdown', signal });
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
