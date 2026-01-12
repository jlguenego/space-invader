import type { Difficulty } from '../storage/preferences';
import type { WorldConfig } from './world-types';

export type DifficultyParams = {
  enemySpeedMultiplier: number;
  enemyFireCooldownMultiplier: number;
  playerLives: number;
};

export function difficultyParams(difficulty: Difficulty): DifficultyParams {
  switch (difficulty) {
    case 'easy':
      return {
        enemySpeedMultiplier: 0.75,
        enemyFireCooldownMultiplier: 1.35,
        playerLives: 4,
      };
    case 'normal':
      return {
        enemySpeedMultiplier: 1.0,
        enemyFireCooldownMultiplier: 1.0,
        playerLives: 3,
      };
    case 'hard':
      return {
        enemySpeedMultiplier: 1.3,
        enemyFireCooldownMultiplier: 0.75,
        playerLives: 2,
      };
  }
}

export function applyDifficultyToWorldConfig(
  baseConfig: WorldConfig,
  difficulty: Difficulty,
): WorldConfig {
  const params = difficultyParams(difficulty);

  return {
    ...baseConfig,
    enemySpeedX: baseConfig.enemySpeedX * params.enemySpeedMultiplier,
    enemyFireCooldownMs: baseConfig.enemyFireCooldownMs * params.enemyFireCooldownMultiplier,
    playerLives: params.playerLives,
  };
}
