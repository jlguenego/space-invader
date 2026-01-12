import type { InputState } from './input-manager';
import {
  DEFAULT_INPUT_STATE,
  type Bullet,
  type Enemy,
  type Vec2,
  type World,
  type WorldConfig,
  type WorldEvent,
  type WorldUpdateResult,
} from './world-types';

export const DEFAULT_WORLD_CONFIG: WorldConfig = Object.freeze({
  bounds: {
    minX: -12,
    maxX: 12,
    minZ: -14,
    maxZ: 14,
  },

  shipSpeed: 11,
  shipFireCooldownMs: 220,

  bulletSpeed: 18,

  enemySpeedX: 2.4,
  enemyFireCooldownMs: 1400,
  enemyStepZOnBounce: 0.7,
  enemySpawn: {
    rows: 4,
    cols: 8,
    spacingX: 2.0,
    spacingZ: 1.4,
    origin: { x: -7, z: -8 },
  },

  playerLives: 3,

  // Ship starts at z=10; game over line is slightly in front.
  gameOverEnemyZ: 8.6,
});

function clamp(n: number, min: number, max: number): number {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function safeDtMs(dtMs: number): number {
  if (!Number.isFinite(dtMs)) return 0;
  if (dtMs <= 0) return 0;
  return dtMs;
}

function intersectsAabb(
  aCenter: Vec2,
  aHalf: { x: number; z: number },
  bCenter: Vec2,
  bHalf: { x: number; z: number },
): boolean {
  const dx = Math.abs(aCenter.x - bCenter.x);
  const dz = Math.abs(aCenter.z - bCenter.z);
  return dx <= aHalf.x + bHalf.x && dz <= aHalf.z + bHalf.z;
}

function createEnemyId(nextId: number): string {
  return `e_${nextId}`;
}

function createBulletId(nextId: number): string {
  return `b_${nextId}`;
}

function pickEnemyShooter(enemies: Enemy[], shipX: number): Enemy | null {
  // Deterministic: closest enemy to the ship on the lowest alive row.
  // (max z = closest to ship since ship is at positive z)
  let best: Enemy | null = null;
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    if (!best) {
      best = enemy;
      continue;
    }

    if (enemy.pos.z > best.pos.z) {
      best = enemy;
      continue;
    }
    if (enemy.pos.z < best.pos.z) continue;

    const dx = Math.abs(enemy.pos.x - shipX);
    const bestDx = Math.abs(best.pos.x - shipX);
    if (dx < bestDx) {
      best = enemy;
      continue;
    }
    if (dx > bestDx) continue;

    if (enemy.id < best.id) best = enemy;
  }

  return best;
}

export function createInitialWorld(config: WorldConfig = DEFAULT_WORLD_CONFIG): World {
  const shipHalf = { x: 0.9, z: 0.6 };
  const shipZ = 10;

  const enemies: Enemy[] = [];
  let nextId = 1;

  const { rows, cols, spacingX, spacingZ, origin } = config.enemySpawn;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = createEnemyId(nextId++);
      enemies.push({
        id,
        pos: {
          x: origin.x + col * spacingX,
          z: origin.z + row * spacingZ,
        },
        halfSize: { x: 0.7, z: 0.45 },
        alive: true,
      });
    }
  }

  return {
    config,
    timeMs: 0,
    nextId,
    enemyDirX: 1,
    enemyFireCooldownRemainingMs: Math.max(0, config.enemyFireCooldownMs),
    playerLives: Math.max(0, Math.floor(config.playerLives)),
    ship: {
      id: 'ship',
      pos: { x: 0, z: shipZ },
      halfSize: shipHalf,
      fireCooldownMs: 0,
    },
    enemies,
    bullets: [],
  };
}

export function updateWorld(
  world: World,
  input: InputState | undefined,
  dtMs: number,
): WorldUpdateResult {
  const clampedDtMs = safeDtMs(dtMs);
  if (clampedDtMs <= 0) {
    return { world, events: [] };
  }

  const dtSec = clampedDtMs / 1000;
  const inState = input ?? DEFAULT_INPUT_STATE;
  const events: WorldEvent[] = [];

  // --- Ship movement ---
  const moveX = (inState.movement.right ? 1 : 0) - (inState.movement.left ? 1 : 0);
  const nextShipX = world.ship.pos.x + moveX * world.config.shipSpeed * dtSec;
  const boundedShipX = clamp(nextShipX, world.config.bounds.minX, world.config.bounds.maxX);

  const nextShipCooldown = Math.max(0, world.ship.fireCooldownMs - clampedDtMs);
  const nextEnemyFireCooldown = Math.max(0, world.enemyFireCooldownRemainingMs - clampedDtMs);

  // --- Fire (player) ---
  const nextBullets: Bullet[] = [];
  let nextId = world.nextId;
  let shipCooldown = nextShipCooldown;

  if (inState.fire && shipCooldown <= 0) {
    const bulletId = createBulletId(nextId++);
    nextBullets.push({
      id: bulletId,
      owner: 'player',
      pos: { x: boundedShipX, z: world.ship.pos.z - world.ship.halfSize.z - 0.3 },
      vel: { x: 0, z: -world.config.bulletSpeed },
      halfSize: { x: 0.12, z: 0.28 },
      alive: true,
    });
    shipCooldown = world.config.shipFireCooldownMs;
  }

  // Keep existing bullets.
  for (const bullet of world.bullets) {
    if (!bullet.alive) continue;
    nextBullets.push(bullet);
  }

  // --- Fire (enemy) ---
  let enemyFireCooldownRemainingMs = nextEnemyFireCooldown;
  if (world.config.enemyFireCooldownMs > 0 && enemyFireCooldownRemainingMs <= 0) {
    const shooter = pickEnemyShooter(world.enemies, boundedShipX);
    if (shooter) {
      const bulletId = createBulletId(nextId++);
      nextBullets.push({
        id: bulletId,
        owner: 'enemy',
        pos: {
          x: shooter.pos.x,
          z: shooter.pos.z + shooter.halfSize.z + 0.3,
        },
        vel: { x: 0, z: world.config.bulletSpeed },
        halfSize: { x: 0.12, z: 0.28 },
        alive: true,
      });
      enemyFireCooldownRemainingMs = world.config.enemyFireCooldownMs;
    }
  }

  // --- Enemy movement (formation bounce + descend) ---
  // Compute alive bounds.
  let minX = Infinity;
  let maxX = -Infinity;
  let anyEnemyAlive = false;

  for (const enemy of world.enemies) {
    if (!enemy.alive) continue;
    anyEnemyAlive = true;
    if (enemy.pos.x < minX) minX = enemy.pos.x;
    if (enemy.pos.x > maxX) maxX = enemy.pos.x;
  }

  let dirX: -1 | 1 = world.enemyDirX;

  // Predict next bounds.
  const enemyHalfX = 0.7;
  const nextMinX = minX + dirX * world.config.enemySpeedX * dtSec;
  const nextMaxX = maxX + dirX * world.config.enemySpeedX * dtSec;

  let stepZ = 0;
  if (anyEnemyAlive) {
    if (nextMinX - enemyHalfX <= world.config.bounds.minX) {
      dirX = 1;
      stepZ = world.config.enemyStepZOnBounce;
    } else if (nextMaxX + enemyHalfX >= world.config.bounds.maxX) {
      dirX = -1;
      stepZ = world.config.enemyStepZOnBounce;
    }
  }

  const enemies: Enemy[] = [];
  for (const enemy of world.enemies) {
    if (!enemy.alive) {
      enemies.push(enemy);
      continue;
    }

    const nextX = enemy.pos.x + dirX * world.config.enemySpeedX * dtSec;
    const boundedX = clamp(nextX, world.config.bounds.minX, world.config.bounds.maxX);

    enemies.push({
      ...enemy,
      pos: { x: boundedX, z: enemy.pos.z + stepZ },
    });
  }

  // --- Bullet movement + culling ---
  const movedBullets: Bullet[] = [];
  for (const bullet of nextBullets) {
    if (!bullet.alive) continue;

    const moved: Bullet = {
      ...bullet,
      pos: {
        x: bullet.pos.x + bullet.vel.x * dtSec,
        z: bullet.pos.z + bullet.vel.z * dtSec,
      },
    };

    const outOfBounds =
      moved.pos.z < world.config.bounds.minZ - 2 || moved.pos.z > world.config.bounds.maxZ + 2;
    if (outOfBounds) continue;

    movedBullets.push(moved);
  }

  // --- Collisions: player bullet -> enemy ---
  const aliveEnemiesById = new Map<string, Enemy>();
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    aliveEnemiesById.set(enemy.id, enemy);
  }

  const collidedEnemyIds = new Set<string>();
  const bulletsAfterHits: Bullet[] = [];

  for (const bullet of movedBullets) {
    if (bullet.owner !== 'player') {
      bulletsAfterHits.push(bullet);
      continue;
    }

    let hitEnemyId: string | null = null;
    for (const enemy of aliveEnemiesById.values()) {
      if (collidedEnemyIds.has(enemy.id)) continue;
      if (intersectsAabb(bullet.pos, bullet.halfSize, enemy.pos, enemy.halfSize)) {
        hitEnemyId = enemy.id;
        break;
      }
    }

    if (hitEnemyId) {
      collidedEnemyIds.add(hitEnemyId);
      events.push({ type: 'ENEMY_DESTROYED', enemyId: hitEnemyId, byBulletId: bullet.id });
      continue; // bullet consumed
    }

    bulletsAfterHits.push(bullet);
  }

  const enemiesAfterHits: Enemy[] = enemies.map((e) =>
    collidedEnemyIds.has(e.id) ? { ...e, alive: false } : e,
  );

  // --- Collisions: enemy bullet -> ship ---
  let playerLives = world.playerLives;
  const bulletsAfterShipHits: Bullet[] = [];
  for (const bullet of bulletsAfterHits) {
    if (!bullet.alive) continue;
    if (bullet.owner !== 'enemy') {
      bulletsAfterShipHits.push(bullet);
      continue;
    }

    const hitShip = intersectsAabb(
      bullet.pos,
      bullet.halfSize,
      { x: boundedShipX, z: world.ship.pos.z },
      world.ship.halfSize,
    );

    if (hitShip) {
      playerLives = Math.max(0, playerLives - 1);
      continue;
    }

    bulletsAfterShipHits.push(bullet);
  }

  // --- Game over conditions ---
  if (playerLives <= 0) {
    events.push({ type: 'GAME_OVER', reason: 'ship_destroyed' });
  }

  let aliveEnemies = 0;
  for (const enemy of enemiesAfterHits) {
    if (!enemy.alive) continue;
    aliveEnemies++;
    if (enemy.pos.z >= world.config.gameOverEnemyZ) {
      events.push({ type: 'GAME_OVER', reason: 'enemy_reached_line' });
      break;
    }
  }

  if (aliveEnemies === 0) {
    events.push({ type: 'GAME_OVER', reason: 'all_enemies_destroyed' });
  }

  const nextWorld: World = {
    ...world,
    timeMs: world.timeMs + clampedDtMs,
    nextId,
    enemyDirX: dirX,
    enemyFireCooldownRemainingMs,
    playerLives,
    ship: {
      ...world.ship,
      pos: { x: boundedShipX, z: world.ship.pos.z },
      fireCooldownMs: shipCooldown,
    },
    enemies: enemiesAfterHits,
    bullets: bulletsAfterShipHits,
  };

  return { world: nextWorld, events };
}
