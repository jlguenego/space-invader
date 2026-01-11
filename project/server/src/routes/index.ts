import express, { type Router } from 'express';

import { AppError } from '../http/errors';

export function createApiRouter(options?: { extend?: (router: Router) => void }): Router {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  options?.extend?.(router);

  router.use((_req, _res, next) => {
    next(new AppError({ status: 404, code: 'NOT_FOUND', message: 'Not found' }));
  });

  return router;
}
