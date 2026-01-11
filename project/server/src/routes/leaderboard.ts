import type { Router } from 'express';

import { PARIS_TIMEZONE, dayKeyParisFromDate } from '../domain/time-service';
import type { ScoreRepository, ScoreEntry } from '../storage/score-repository';

type LeaderboardEntry = {
  rank: number;
  pseudo: string;
  score: number;
};

function compareScoresForLeaderboard(a: ScoreEntry, b: ScoreEntry): number {
  if (a.score !== b.score) return b.score - a.score;

  // Deterministic tie-breaker to avoid flaky ordering.
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
  if (a.id !== b.id) return a.id < b.id ? -1 : 1;

  return 0;
}

export function registerLeaderboardRoutes(router: Router, deps: { repo: ScoreRepository }): void {
  router.get('/leaderboard/day', async (_req, res, next) => {
    try {
      const dayKeyParis = dayKeyParisFromDate(new Date());

      const all = await deps.repo.readAll();
      const entries = all.scores
        .filter((s) => s.dayKeyParis === dayKeyParis)
        .sort(compareScoresForLeaderboard)
        .slice(0, 10)
        .map<LeaderboardEntry>((s, index) => ({
          rank: index + 1,
          pseudo: s.pseudo,
          score: s.score,
        }));

      res.status(200).json({
        timezone: PARIS_TIMEZONE,
        dayKeyParis,
        entries,
      });
    } catch (err) {
      next(err);
    }
  });
}
