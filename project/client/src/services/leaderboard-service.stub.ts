import type { LeaderboardDay, LeaderboardEntry } from '../ui/ui-state-machine';

type StoredScore = {
  id: string;
  createdAt: string;
  pseudo: string;
  score: number;
  dayKeyParis: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dayKeyParisNow(): string {
  // fr-CA yields YYYY-MM-DD.
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function compareScores(a: StoredScore, b: StoredScore): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
  return a.id < b.id ? -1 : 1;
}

const seedDayKey = dayKeyParisNow();

let mockScores: StoredScore[] = [
  {
    id: 'seed-1',
    createdAt: new Date().toISOString(),
    pseudo: 'Anonyme',
    score: 1200,
    dayKeyParis: seedDayKey,
  },
  {
    id: 'seed-2',
    createdAt: new Date().toISOString(),
    pseudo: 'Alice',
    score: 950,
    dayKeyParis: seedDayKey,
  },
  {
    id: 'seed-3',
    createdAt: new Date().toISOString(),
    pseudo: 'Bob',
    score: 700,
    dayKeyParis: seedDayKey,
  },
];

export function __internalAddMockScore(score: Omit<StoredScore, 'dayKeyParis'>): void {
  mockScores = [...mockScores, { ...score, dayKeyParis: dayKeyParisNow() }];
}

export async function getDailyLeaderboardStub(): Promise<LeaderboardDay> {
  await sleep(randomInt(200, 550));

  // Simulate occasional transient failure.
  if (Math.random() < 0.12) {
    throw new Error('Réseau indisponible (stub)');
  }

  const dayKeyParis = dayKeyParisNow();

  const entries: LeaderboardEntry[] = mockScores
    .filter((s) => s.dayKeyParis === dayKeyParis)
    .sort(compareScores)
    .slice(0, 10)
    .map((s, index) => ({ rank: index + 1, pseudo: s.pseudo, score: s.score }));

  return {
    timezone: 'Europe/Paris',
    dayKeyParis,
    entries,
  };
}
