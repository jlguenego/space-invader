import type { Router } from 'express';

import { AppError } from '../http/errors';
import { dayKeyParisFromUtcIso } from '../domain/time-service';
import type { ScoreRepository } from '../storage/score-repository';

const PSEUDO_MAX_LENGTH = 24;

type PostScoresBody = {
  score?: unknown;
  pseudo?: unknown;
};

function asObject(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function validationError(message: string): AppError {
  return new AppError({ status: 400, code: 'VALIDATION_ERROR', message });
}

function normalizePseudo(value: unknown): string {
  if (value === undefined || value === null) return 'Anonyme';

  if (typeof value !== 'string') {
    throw validationError('Invalid pseudo');
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Anonyme';
  if (trimmed.length > PSEUDO_MAX_LENGTH) {
    throw validationError(`Pseudo too long (max ${PSEUDO_MAX_LENGTH})`);
  }

  return trimmed;
}

function parseScore(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw validationError('Invalid score');
  }
  return value;
}

export function registerScoresRoutes(router: Router, deps: { repo: ScoreRepository }): void {
  router.post('/scores', async (req, res, next) => {
    try {
      const bodyObj = asObject(req.body) as PostScoresBody | undefined;
      if (!bodyObj) {
        throw validationError('Invalid body');
      }

      const score = parseScore(bodyObj.score);
      const pseudo = normalizePseudo(bodyObj.pseudo);

      const createdAt = new Date().toISOString();
      const entry = {
        id: crypto.randomUUID(),
        createdAt,
        dayKeyParis: dayKeyParisFromUtcIso(createdAt),
        pseudo,
        score,
      };

      const saved = await deps.repo.append(entry);

      res.status(201).json({ ok: true, saved });
    } catch (err) {
      next(err);
    }
  });
}
