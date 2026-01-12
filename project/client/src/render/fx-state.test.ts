import { describe, expect, test } from 'bun:test';

import type { World, WorldEvent } from '../game/world-types';
import { createInitialFxState, reduceFxState } from './fx-state';

function makeWorld(partial?: Partial<World>): World {
  return {
    config: {
      bounds: { minX: -12, maxX: 12, minZ: -14, maxZ: 14 },
      shipSpeed: 1,
      shipFireCooldownMs: 200,
      bulletSpeed: 10,
      enemySpeedX: 1,
      enemyFireCooldownMs: 1000,
      enemyStepZOnBounce: 0.7,
      enemySpawn: { rows: 1, cols: 1, spacingX: 1, spacingZ: 1, origin: { x: 0, z: 0 } },
      playerLives: 3,
      gameOverEnemyZ: 8,
    },
    timeMs: 0,
    nextId: 1,
    enemyDirX: 1,
    enemyFireCooldownRemainingMs: 0,
    playerLives: 3,
    ship: { id: 'ship', pos: { x: 0, z: 10 }, halfSize: { x: 1, z: 1 }, fireCooldownMs: 0 },
    enemies: [],
    bullets: [],
    ...partial,
  };
}

describe('fx-state', () => {
  test('creates an explosion at destroyed enemy position', () => {
    const world = makeWorld({
      timeMs: 1000,
      enemies: [
        {
          id: 'e_1',
          enemyType: 'standard',
          pos: { x: 3, z: -4 },
          halfSize: { x: 1, z: 1 },
          alive: false,
        },
      ],
    });

    const events: WorldEvent[] = [
      { type: 'ENEMY_DESTROYED', enemyId: 'e_1', enemyType: 'standard', byBulletId: 'b_1' },
    ];

    const next = reduceFxState({
      prev: createInitialFxState(),
      world,
      events,
      explosionDurationMs: 200,
    });

    expect(next.explosions).toHaveLength(1);
    expect(next.explosions[0]?.pos).toEqual({ x: 3, z: -4 });
    expect(next.explosions[0]?.createdAtMs).toBe(1000);
    expect(next.explosions[0]?.expiresAtMs).toBe(1200);
  });

  test('expires explosions over time', () => {
    const prevWorld = makeWorld({
      timeMs: 1000,
      enemies: [
        {
          id: 'e_1',
          enemyType: 'standard',
          pos: { x: 0, z: 0 },
          halfSize: { x: 1, z: 1 },
          alive: false,
        },
      ],
    });

    const prev = reduceFxState({
      prev: createInitialFxState(),
      world: prevWorld,
      events: [
        { type: 'ENEMY_DESTROYED', enemyId: 'e_1', enemyType: 'standard', byBulletId: 'b_1' },
      ],
      explosionDurationMs: 100,
    });

    const worldLater = makeWorld({ timeMs: 1101, enemies: prevWorld.enemies });
    const next = reduceFxState({ prev, world: worldLater, events: [], explosionDurationMs: 100 });

    expect(next.explosions).toHaveLength(0);
  });

  test('caps explosions to maxExplosions', () => {
    let state = createInitialFxState();
    const baseWorld = makeWorld({
      timeMs: 1000,
      enemies: [
        {
          id: 'e_1',
          enemyType: 'standard',
          pos: { x: 0, z: 0 },
          halfSize: { x: 1, z: 1 },
          alive: false,
        },
      ],
    });

    const events: WorldEvent[] = [
      { type: 'ENEMY_DESTROYED', enemyId: 'e_1', enemyType: 'standard', byBulletId: 'b_1' },
    ];

    for (let i = 0; i < 10; i++) {
      const world = makeWorld({ timeMs: 1000 + i, enemies: baseWorld.enemies });
      state = reduceFxState({
        prev: state,
        world,
        events,
        explosionDurationMs: 10_000,
        maxExplosions: 3,
      });
    }

    expect(state.explosions).toHaveLength(3);
    // should keep the most recent
    expect(state.explosions[0]!.createdAtMs).toBe(1007);
    expect(state.explosions[2]!.createdAtMs).toBe(1009);
  });

  test('player hit sets a short-lived hit marker', () => {
    let state = createInitialFxState();

    const worldHit = makeWorld({ timeMs: 2000 });
    state = reduceFxState({
      prev: state,
      world: worldHit,
      events: [{ type: 'PLAYER_HIT', remainingLives: 2 }],
      hitFlashDurationMs: 150,
    });
    expect(state.hit.lastPlayerHitAtMs).toBe(2000);

    const worldLater = makeWorld({ timeMs: 2151 });
    state = reduceFxState({ prev: state, world: worldLater, events: [], hitFlashDurationMs: 150 });
    expect(state.hit.lastPlayerHitAtMs).toBe(null);
  });
});
