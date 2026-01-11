import { __internalAddMockScore } from './leaderboard-service.stub';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizePseudoForApi(pseudo: string | null): string {
  if (!pseudo) return 'Anonyme';
  const trimmed = pseudo.trim();
  if (trimmed.length === 0) return 'Anonyme';
  return trimmed;
}

export type SaveScoreInput = {
  score: number;
  pseudo: string | null;
};

export type SaveScoreResponse = {
  ok: true;
  saved: {
    id: string;
    createdAt: string;
    pseudo: string;
    score: number;
  };
};

export async function saveScoreStub(input: SaveScoreInput): Promise<SaveScoreResponse> {
  await sleep(randomInt(250, 650));

  if (!Number.isFinite(input.score) || input.score < 0) {
    throw new Error('Score invalide');
  }

  // Simulate occasional failure.
  if (Math.random() < 0.18) {
    throw new Error("Échec de l'enregistrement (stub)");
  }

  const createdAt = new Date().toISOString();
  const saved = {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `stub-${Date.now()}`,
    createdAt,
    pseudo: normalizePseudoForApi(input.pseudo),
    score: input.score,
  };

  __internalAddMockScore({
    id: saved.id,
    createdAt: saved.createdAt,
    pseudo: saved.pseudo,
    score: saved.score,
  });

  return { ok: true, saved };
}
