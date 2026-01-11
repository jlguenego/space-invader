import { ApiClientError, requestJson, type ApiOkBody } from './api-client';

export type SaveScoreInput = {
  score: number;
  pseudo: string | null;
};

export type SavedScore = {
  id: string;
  createdAt: string;
  dayKeyParis: string;
  pseudo: string;
  score: number;
};

type PostScoresResponse = ApiOkBody<{ saved: SavedScore }>;

function toHumanSaveScoreErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.kind === 'network') {
      return 'Impossible de contacter le serveur. Réessaie plus tard.';
    }

    if (error.kind === 'http' && error.apiErrorCode === 'VALIDATION_ERROR') {
      return "Impossible d'enregistrer le score. Vérifie ton pseudo et réessaie.";
    }
  }

  return "Impossible d'enregistrer le score, réessaie plus tard.";
}

export async function saveScore(input: SaveScoreInput): Promise<SavedScore> {
  try {
    const response = await requestJson<PostScoresResponse>('/api/scores', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        score: input.score,
        pseudo: input.pseudo,
      }),
    });

    if (!response || response.ok !== true || !('saved' in response)) {
      throw new ApiClientError({
        kind: 'unexpected',
        message: 'Unexpected response shape',
        url: '/api/scores',
      });
    }

    return response.saved;
  } catch (error) {
    throw new Error(toHumanSaveScoreErrorMessage(error));
  }
}
