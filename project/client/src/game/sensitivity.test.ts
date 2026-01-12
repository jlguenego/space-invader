import { describe, expect, it } from 'bun:test';

import { sensitivityMultiplier } from '../storage/preferences';
import { createInitialWorld, DEFAULT_WORLD_CONFIG, updateWorld } from './world-sim';
import type { WorldConfig } from './world-types';

describe('sensitivity (ship speed multiplier)', () => {
  it('changes ship movement speed in updateWorld()', () => {
    const baseSpeed = 10;
    const dtMs = 1000;

    const baseConfig: WorldConfig = {
      ...DEFAULT_WORLD_CONFIG,
      bounds: { ...DEFAULT_WORLD_CONFIG.bounds, minX: -100, maxX: 100 },
      enemySpawn: { ...DEFAULT_WORLD_CONFIG.enemySpawn, rows: 0, cols: 0 },
      shipSpeed: baseSpeed,
    };

    const highMultiplier = sensitivityMultiplier('high');
    expect(highMultiplier).toBe(1.2);

    const highConfig: WorldConfig = {
      ...baseConfig,
      shipSpeed: baseSpeed * highMultiplier,
    };

    const inputRight = {
      movement: { left: false, right: true, up: false, down: false },
      fire: false,
    };

    const baseWorld = createInitialWorld(baseConfig);
    const highWorld = createInitialWorld(highConfig);

    const baseNext = updateWorld(baseWorld, inputRight, dtMs).world;
    const highNext = updateWorld(highWorld, inputRight, dtMs).world;

    expect(baseNext.ship.pos.x).toBeCloseTo(baseSpeed);
    expect(highNext.ship.pos.x).toBeCloseTo(baseSpeed * highMultiplier);
  });
});
