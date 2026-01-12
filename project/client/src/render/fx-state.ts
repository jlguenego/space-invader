import type { Vec2, World, WorldEvent } from '../game/world-types';

export type ExplosionFx = {
  id: string;
  pos: Vec2;
  createdAtMs: number;
  expiresAtMs: number;
};

export type HitFx = {
  lastPlayerHitAtMs: number | null;
};

export type FxState = {
  explosions: ExplosionFx[];
  hit: HitFx;
};

export function createInitialFxState(): FxState {
  return { explosions: [], hit: { lastPlayerHitAtMs: null } };
}

export type ReduceFxStateParams = {
  prev: FxState;
  world: World;
  events: WorldEvent[];
  maxExplosions?: number;
  explosionDurationMs?: number;
  hitFlashDurationMs?: number;
};

const DEFAULT_MAX_EXPLOSIONS = 20;
const DEFAULT_EXPLOSION_DURATION_MS = 220;
const DEFAULT_HIT_FLASH_DURATION_MS = 160;

function pruneExplosions(explosions: ExplosionFx[], nowMs: number): ExplosionFx[] {
  if (explosions.length === 0) return explosions;
  return explosions.filter((e) => e.expiresAtMs > nowMs);
}

export function reduceFxState(params: ReduceFxStateParams): FxState {
  const {
    prev,
    world,
    events,
    maxExplosions = DEFAULT_MAX_EXPLOSIONS,
    explosionDurationMs = DEFAULT_EXPLOSION_DURATION_MS,
    hitFlashDurationMs = DEFAULT_HIT_FLASH_DURATION_MS,
  } = params;

  const nowMs = world.timeMs;

  let explosions = pruneExplosions(prev.explosions, nowMs);
  let lastPlayerHitAtMs = prev.hit.lastPlayerHitAtMs;

  if (lastPlayerHitAtMs !== null && nowMs - lastPlayerHitAtMs > hitFlashDurationMs) {
    lastPlayerHitAtMs = null;
  }

  for (const event of events) {
    if (event.type === 'ENEMY_DESTROYED') {
      const enemy = world.enemies.find((e) => e.id === event.enemyId);
      if (!enemy) continue;

      const createdAtMs = nowMs;
      const id = `ex_${event.enemyId}_${createdAtMs}`;
      explosions = explosions.concat({
        id,
        pos: { x: enemy.pos.x, z: enemy.pos.z },
        createdAtMs,
        expiresAtMs: createdAtMs + Math.max(1, explosionDurationMs),
      });
      continue;
    }

    if (event.type === 'PLAYER_HIT') {
      lastPlayerHitAtMs = nowMs;
      continue;
    }
  }

  if (explosions.length > maxExplosions) {
    explosions = explosions.slice(explosions.length - maxExplosions);
  }

  return {
    explosions,
    hit: { lastPlayerHitAtMs },
  };
}
