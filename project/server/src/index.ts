import { createApp } from './app';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.APP_BIND_HOST ?? '0.0.0.0';

const app = createApp();

const server = app.listen(port, host, () => {
  console.log(`[server] listening on http://${host}:${port}`);
});

function shutdown(signal: string) {
  console.log(`[server] ${signal} received, shutting down...`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
