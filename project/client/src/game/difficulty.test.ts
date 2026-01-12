import { describe, expect, test } from 'bun:test';

import type { Difficulty } from '../storage/preferences';

import { DEFAULT_WORLD_CONFIG } from './world-sim';
import { applyDifficultyToWorldConfig, difficultyParams } from './difficulty';

describe('difficulty', () => {
  test('difficultyParams() matches clarified MVP values', () => {
    const cases: Array<[Difficulty, ReturnType<typeof difficultyParams>]> = [
      ['easy', { enemySpeedMultiplier: 0.75, enemyFireCooldownMultiplier: 1.35, playerLives: 4 }],
      ['normal', { enemySpeedMultiplier: 1.0, enemyFireCooldownMultiplier: 1.0, playerLives: 3 }],
      ['hard', { enemySpeedMultiplier: 1.3, enemyFireCooldownMultiplier: 0.75, playerLives: 2 }],
    ];

    for (const [difficulty, expected] of cases) {
      expect(difficultyParams(difficulty)).toEqual(expected);
    }
  });

  test('applyDifficultyToWorldConfig() applies enemy speed, enemy fire cooldown and player lives', () => {
    const base = {
      ...DEFAULT_WORLD_CONFIG,
      enemySpeedX: 10,
      enemyFireCooldownMs: 2000,
      playerLives: 999,
    };

    expect(applyDifficultyToWorldConfig(base, 'easy')).toMatchObject({
      enemySpeedX: 7.5,
      enemyFireCooldownMs: 2700,
      playerLives: 4,
    });

    expect(applyDifficultyToWorldConfig(base, 'normal')).toMatchObject({
      enemySpeedX: 10,
      enemyFireCooldownMs: 2000,
      playerLives: 3,
    });

    expect(applyDifficultyToWorldConfig(base, 'hard')).toMatchObject({
      enemySpeedX: 13,
      enemyFireCooldownMs: 1500,
      playerLives: 2,
    });
  });
});
