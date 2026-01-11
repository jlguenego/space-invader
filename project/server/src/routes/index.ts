import express, { type Router } from 'express';

import { AppError } from '../http/errors';
import { createScoreRepository } from '../storage/score-repository';

import { registerScoresRoutes } from './scores';
import { registerLeaderboardRoutes } from './leaderboard';

export function createApiRouter(options?: { extend?: (router: Router) => void }): Router {
  const router = express.Router();

  const repo = createScoreRepository();

  registerScoresRoutes(router, { repo });
  registerLeaderboardRoutes(router, { repo });

  router.get('/', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  options?.extend?.(router);

  router.use((_req, _res, next) => {
    next(new AppError({ status: 404, code: 'NOT_FOUND', message: 'Not found' }));
  });

  return router;
}
