import type { EnemyType } from './world-types';

export type MultiplierKind = 'streak' | 'combo' | 'temps' | 'difficulte';

export type ActiveMultiplier = {
  kind: MultiplierKind;
  value: number;
  untilMs: number;
};

export type ScoreState = {
  score: number;
  shots: number;
  hits: number;
  streakKills: number;
  activeMultiplier: ActiveMultiplier | null;
};

export type ScoreFinal = {
  finalScore: number;
  precisionBonus: number;
  precision: number;
};

export const POINTS_KILL_BASE = 100;

export function createInitialScoreState(): ScoreState {
  return {
    score: 0,
    shots: 0,
    hits: 0,
    streakKills: 0,
    activeMultiplier: null,
  };
}

export function applyPlayerShot(state: ScoreState): ScoreState {
  return {
    ...state,
    shots: state.shots + 1,
  };
}

export function applyPlayerHit(state: ScoreState): ScoreState {
  return {
    ...state,
    streakKills: 0,
  };
}

function getActiveMultiplierValue(state: ScoreState, nowMs: number): number {
  const m = state.activeMultiplier;
  if (!m) return 1;
  if (nowMs >= m.untilMs) return 1;
  return m.value;
}

function bonusForEnemyType(enemyType: EnemyType): number {
  // Clarification 08 defines Standard/Rapide/Tank; Elite maps to Tank.
  switch (enemyType) {
    case 'standard':
      return 10;
    case 'rapide':
      return 25;
    case 'tank':
      return 50;
    case 'elite':
      return 50;
    default: {
      const _exhaustive: never = enemyType;
      return _exhaustive;
    }
  }
}

function bonusForStreak(nextStreakKills: number): number {
  // Clarification 08: palier bonus is granted when reaching the threshold.
  switch (nextStreakKills) {
    case 3:
      return 50;
    case 5:
      return 100;
    case 10:
      return 250;
    case 20:
      return 600;
    default:
      return 0;
  }
}

function multiplierForEnemyType(enemyType: EnemyType): {
  kind: MultiplierKind;
  value: number;
  durationMs: number;
} {
  // Clarification 09 table.
  switch (enemyType) {
    case 'standard':
      return { kind: 'streak', value: 1.1, durationMs: 6000 };
    case 'rapide':
      return { kind: 'combo', value: 1.25, durationMs: 4000 };
    case 'tank':
      return { kind: 'temps', value: 1.5, durationMs: 10000 };
    case 'elite':
      return { kind: 'difficulte', value: 2.0, durationMs: 8000 };
    default: {
      const _exhaustive: never = enemyType;
      return _exhaustive;
    }
  }
}

export function applyEnemyDestroyed(
  state: ScoreState,
  params: { enemyType: EnemyType; nowMs: number },
): { next: ScoreState; scoreDelta: number } {
  const nextStreakKills = state.streakKills + 1;

  const pointsKillBase = POINTS_KILL_BASE;
  const pointsKillBonusEnemyType = bonusForEnemyType(params.enemyType);
  const pointsKillBonusStreak = bonusForStreak(nextStreakKills);

  const eventPoints = pointsKillBase + pointsKillBonusEnemyType + pointsKillBonusStreak;

  // Order (clarif 09): apply current active multiplier on this kill, then activate the one triggered.
  const activeMultiplier = getActiveMultiplierValue(state, params.nowMs);
  const scoredPoints = Math.floor(eventPoints * activeMultiplier);

  const nextMultiplier = multiplierForEnemyType(params.enemyType);

  return {
    next: {
      ...state,
      score: state.score + scoredPoints,
      hits: state.hits + 1,
      streakKills: nextStreakKills,
      activeMultiplier: {
        kind: nextMultiplier.kind,
        value: nextMultiplier.value,
        untilMs: params.nowMs + nextMultiplier.durationMs,
      },
    },
    scoreDelta: scoredPoints,
  };
}

export function finalizeScore(state: ScoreState): ScoreFinal {
  const precision = state.shots <= 0 ? 0 : state.hits / state.shots;

  let precisionBonus = 0;
  if (precision >= 0.9) precisionBonus = 500;
  else if (precision >= 0.8) precisionBonus = 250;
  else if (precision >= 0.7) precisionBonus = 100;

  return {
    finalScore: state.score + precisionBonus,
    precisionBonus,
    precision,
  };
}
