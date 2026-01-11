import type { LeaderboardDay } from '../ui/ui-state-machine';

import { ApiClientError, requestJson } from './api-client';

function toHumanLeaderboardErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.kind === 'network') {
      return 'Impossible de contacter le serveur. Réessaie plus tard.';
    }
  }

  return 'Impossible de charger le classement, réessaie plus tard.';
}

export async function getDailyLeaderboard(): Promise<LeaderboardDay> {
  try {
    return await requestJson<LeaderboardDay>('/api/leaderboard/day', {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });
  } catch (error) {
    throw new Error(toHumanLeaderboardErrorMessage(error));
  }
}
