import { describe, expect, test } from 'bun:test';

import { DEFAULT_INPUT_STATE } from './world-types';
import { createInitialWorld, updateWorld, DEFAULT_WORLD_CONFIG } from './world-sim';

describe('world-sim', () => {
  test('updateWorld() is a no-op for invalid dtMs', () => {
    const world = createInitialWorld();

    const r1 = updateWorld(world, DEFAULT_INPUT_STATE, NaN);
    expect(r1.world).toBe(world);
    expect(r1.events).toEqual([]);

    const r2 = updateWorld(world, DEFAULT_INPUT_STATE, -10);
    expect(r2.world).toBe(world);
    expect(r2.events).toEqual([]);
  });

  test('holding fire spawns bullets respecting cooldown', () => {
    const config = {
      ...DEFAULT_WORLD_CONFIG,
      shipFireCooldownMs: 200,
    };
    let world = createInitialWorld(config);

    // First shot immediately.
    let result = updateWorld(world, { ...DEFAULT_INPUT_STATE, fire: true }, 16);
    world = result.world;
    expect(world.bullets.length).toBe(1);

    // Still cooling down: no new bullet.
    result = updateWorld(world, { ...DEFAULT_INPUT_STATE, fire: true }, 100);
    world = result.world;
    expect(world.bullets.length).toBe(1);

    // Cooldown elapsed: next bullet.
    result = updateWorld(world, { ...DEFAULT_INPUT_STATE, fire: true }, 120);
    world = result.world;
    expect(world.bullets.length).toBe(2);
  });

  test('player bullet destroys an enemy on collision', () => {
    const config = {
      ...DEFAULT_WORLD_CONFIG,
      shipSpeed: 0,
      shipFireCooldownMs: 1,
      bulletSpeed: 0,
      enemySpeedX: 0,
      enemyStepZOnBounce: 0,
    };
    let world = createInitialWorld(config);

    // Place one enemy right in front of the ship.
    const targetId = world.enemies[0]!.id;
    const bulletSpawnZ = world.ship.pos.z - world.ship.halfSize.z - 0.3;
    world = {
      ...world,
      enemies: world.enemies.map((e, idx) =>
        idx === 0 ? { ...e, pos: { x: 0, z: bulletSpawnZ } } : e,
      ),
    };

    // Fire: bullet spawns and should overlap enemy after a small dt (no movement).
    const r = updateWorld(world, { ...DEFAULT_INPUT_STATE, fire: true }, 16);

    expect(r.events.some((e) => e.type === 'ENEMY_DESTROYED' && e.enemyId === targetId)).toBe(true);

    const nextEnemy = r.world.enemies.find((e) => e.id === targetId);
    expect(nextEnemy?.alive).toBe(false);
    expect(r.world.bullets.length).toBe(0);
  });

  test('game over triggers when an enemy reaches the line', () => {
    const config = {
      ...DEFAULT_WORLD_CONFIG,
      shipSpeed: 0,
      shipFireCooldownMs: 999999,
      bulletSpeed: 0,
      enemySpeedX: 0,
      enemyStepZOnBounce: 0,
      gameOverEnemyZ: 5,
    };

    let world = createInitialWorld(config);

    // Move one enemy past the line.
    world = {
      ...world,
      enemies: world.enemies.map((e, idx) => (idx === 0 ? { ...e, pos: { x: e.pos.x, z: 6 } } : e)),
    };

    const r = updateWorld(world, DEFAULT_INPUT_STATE, 16);
    expect(r.events.some((e) => e.type === 'GAME_OVER' && e.reason === 'enemy_reached_line')).toBe(
      true,
    );
  });
});
