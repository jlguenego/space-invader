import express, { type ErrorRequestHandler, type RequestHandler, type Router } from 'express';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { AppError, toApiErrorBody, type ApiErrorCode } from './http/errors';
import { createLogger, serializeError, type Logger } from './logger';
import { createApiRouter } from './routes';

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function resolveDefaultClientDistDir(): string {
  // server/src/app.ts -> project/server/src
  const here = dirname(fileURLToPath(import.meta.url));
  const projectRoot = join(here, '..', '..');
  return join(projectRoot, 'client', 'dist');
}

function isLikelyAssetPath(pathname: string): boolean {
  const last = pathname.split('/').pop() ?? '';
  return last.includes('.');
}

function acceptsHtml(req: express.Request): boolean {
  const accept = req.headers.accept;
  if (typeof accept !== 'string' || accept.length === 0) {
    return true;
  }

  return accept.includes('text/html') || accept.includes('*/*');
}

const jsonBody: RequestHandler = express.json({ limit: '10kb' });

const securityHeaders: RequestHandler = (_req, res, next) => {
  // Minimal, dependency-free hardening suitable for MVP.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  next();
};

function shouldIncludeStackInLogs(): boolean {
  // Logs are internal; still avoid noisy stacktraces in production by default.
  return !isProduction() && process.env.LOG_STACK !== '0';
}

function getErrorProps(err: unknown): { type?: string; status?: number; message?: string } {
  if (!err || typeof err !== 'object') {
    return {};
  }

  const record = err as Record<string, unknown>;
  const type = typeof record.type === 'string' ? record.type : undefined;
  const status = typeof record.status === 'number' ? record.status : undefined;
  const message = typeof record.message === 'string' ? record.message : undefined;

  return { type, status, message };
}

function createErrorMiddleware(logger: Logger): ErrorRequestHandler {
  const includeStack = shouldIncludeStackInLogs();

  return (err, req, res, _next) => {
    const prod = isProduction();

    if (err instanceof AppError) {
      if (err.code === 'VALIDATION_ERROR') {
        logger.warn('request validation error', {
          event: 'http.validation_error',
          method: req.method,
          path: req.path,
          status: err.status,
          code: err.code,
          message: err.message,
        });
      }

      res.status(err.status).json(toApiErrorBody({ code: err.code, message: err.message }));
      return;
    }

    const { type: errType, status: errStatus, message: errMessage } = getErrorProps(err);

    // express.json() body parsing errors
    if (errType === 'entity.too.large' || errStatus === 413) {
      logger.warn('payload too large', {
        event: 'http.payload_too_large',
        method: req.method,
        path: req.path,
        status: 413,
      });

      res
        .status(413)
        .json(toApiErrorBody({ code: 'PAYLOAD_TOO_LARGE', message: 'Payload too large' }));
      return;
    }

    if (err instanceof SyntaxError && typeof errStatus === 'number') {
      logger.warn('invalid JSON body', {
        event: 'http.invalid_json',
        method: req.method,
        path: req.path,
        status: 400,
      });

      res
        .status(400)
        .json(toApiErrorBody({ code: 'VALIDATION_ERROR', message: 'Invalid JSON body' }));
      return;
    }

    const code: ApiErrorCode = 'INTERNAL_ERROR';
    const message = prod ? 'Internal error' : (errMessage ?? 'Internal error');

    logger.error('unhandled server error', {
      event: 'http.internal_error',
      method: req.method,
      path: req.path,
      status: 500,
      ...serializeError(err, { includeStack }),
    });

    res.status(500).json(toApiErrorBody({ code, message }));
  };
}

export function createApp(options?: {
  apiRouter?: Router;
  logger?: Logger;
  spa?: { enabled?: boolean; distDir?: string };
}) {
  const app = express();
  const logger = options?.logger ?? createLogger({ baseFields: { component: 'http' } });

  app.disable('x-powered-by');

  app.use(jsonBody);
  app.use(securityHeaders);

  const apiRouter = options?.apiRouter ?? createApiRouter();
  app.use('/api', apiRouter);

  const spaOptions = options?.spa;
  const distDir = spaOptions?.distDir ?? resolveDefaultClientDistDir();
  const spaEnabled = spaOptions?.enabled ?? existsSync(distDir);

  if (spaEnabled) {
    if (!existsSync(distDir)) {
      throw new Error(`SPA distDir not found: ${distDir}`);
    }

    app.use(
      express.static(distDir, {
        index: false,
        fallthrough: true,
      }),
    );

    const indexPath = join(distDir, 'index.html');
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next();
        return;
      }

      if (!acceptsHtml(req)) {
        next();
        return;
      }

      if (isLikelyAssetPath(req.path)) {
        next();
        return;
      }

      res.sendFile(indexPath);
    });
  }

  // Global 404
  // - For API routes, JSON contract is already handled by the /api router.
  // - When serving the SPA, keep non-API 404s non-JSON to avoid leaking API-style errors to the UI.
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      next(new AppError({ status: 404, code: 'NOT_FOUND', message: 'Not found' }));
      return;
    }

    if (spaEnabled) {
      res.status(404).type('text/plain').send('Not found');
      return;
    }

    next(new AppError({ status: 404, code: 'NOT_FOUND', message: 'Not found' }));
  });

  app.use(createErrorMiddleware(logger));

  return app;
}
