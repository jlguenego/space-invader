import express, { type ErrorRequestHandler, type RequestHandler, type Router } from 'express';

import { AppError, toApiErrorBody, type ApiErrorCode } from './http/errors';
import { createLogger, serializeError, type Logger } from './logger';
import { createApiRouter } from './routes';

function isProduction() {
  return process.env.NODE_ENV === 'production';
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

    const anyErr = err as any;

    // express.json() body parsing errors
    if (anyErr?.type === 'entity.too.large' || anyErr?.status === 413) {
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

    if (
      anyErr instanceof SyntaxError &&
      typeof (anyErr as { status?: unknown }).status === 'number'
    ) {
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
    const message = prod ? 'Internal error' : (anyErr?.message ?? 'Internal error');

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

export function createApp(options?: { apiRouter?: Router; logger?: Logger }) {
  const app = express();
  const logger = options?.logger ?? createLogger({ baseFields: { component: 'http' } });

  app.disable('x-powered-by');

  app.use(jsonBody);
  app.use(securityHeaders);

  const apiRouter = options?.apiRouter ?? createApiRouter();
  app.use('/api', apiRouter);

  // Global 404 (kept JSON for now; can be adapted when serving SPA)
  app.use((_req, _res, next) => {
    next(new AppError({ status: 404, code: 'NOT_FOUND', message: 'Not found' }));
  });

  app.use(createErrorMiddleware(logger));

  return app;
}
