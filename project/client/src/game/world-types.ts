import type { InputState } from './input-manager';

export type Vec2 = { x: number; z: number };

export type Aabb = {
  center: Vec2;
  halfSize: { x: number; z: number };
};

export type Ship = {
  id: 'ship';
  pos: Vec2;
  halfSize: { x: number; z: number };
  fireCooldownMs: number;
};

export type Enemy = {
  id: string;
  pos: Vec2;
  halfSize: { x: number; z: number };
  alive: boolean;
};

export type BulletOwner = 'player' | 'enemy';

export type Bullet = {
  id: string;
  owner: BulletOwner;
  pos: Vec2;
  vel: Vec2;
  halfSize: { x: number; z: number };
  alive: boolean;
};

export type WorldBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type WorldConfig = {
  bounds: WorldBounds;

  shipSpeed: number; // units/sec
  shipFireCooldownMs: number;

  bulletSpeed: number; // units/sec

  enemySpeedX: number; // units/sec
  enemyFireCooldownMs: number;
  enemyStepZOnBounce: number;
  enemySpawn: {
    rows: number;
    cols: number;
    spacingX: number;
    spacingZ: number;
    origin: Vec2;
  };

  playerLives: number;

  gameOverEnemyZ: number;
};

export type World = {
  config: WorldConfig;
  timeMs: number;
  nextId: number;
  enemyDirX: -1 | 1;
  enemyFireCooldownRemainingMs: number;
  playerLives: number;
  ship: Ship;
  enemies: Enemy[];
  bullets: Bullet[];
};

export type WorldEvent =
  | { type: 'ENEMY_DESTROYED'; enemyId: string; byBulletId: string }
  | {
      type: 'GAME_OVER';
      reason: 'enemy_reached_line' | 'all_enemies_destroyed' | 'ship_destroyed';
    };

export type WorldUpdateResult = {
  world: World;
  events: WorldEvent[];
};

export const DEFAULT_INPUT_STATE: InputState = Object.freeze({
  movement: Object.freeze({ left: false, right: false, up: false, down: false }),
  fire: false,
});
