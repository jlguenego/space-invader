import { describe, expect, test } from 'bun:test';

import {
  POINTS_KILL_BASE,
  applyEnemyDestroyed,
  applyPlayerHit,
  applyPlayerShot,
  createInitialScoreState,
  finalizeScore,
} from './scoring';

describe('scoring', () => {
  test('kill points include base + enemy type bonus (Elite maps to Tank bonus)', () => {
    const base = POINTS_KILL_BASE;

    const s0 = createInitialScoreState();

    const r1 = applyEnemyDestroyed(s0, { enemyType: 'standard', nowMs: 0 });
    expect(r1.scoreDelta).toBe(base + 10);

    const r2 = applyEnemyDestroyed(s0, { enemyType: 'rapide', nowMs: 0 });
    expect(r2.scoreDelta).toBe(base + 25);

    const r3 = applyEnemyDestroyed(s0, { enemyType: 'tank', nowMs: 0 });
    expect(r3.scoreDelta).toBe(base + 50);

    const r4 = applyEnemyDestroyed(s0, { enemyType: 'elite', nowMs: 0 });
    expect(r4.scoreDelta).toBe(base + 50);
  });

  test('streak palier bonus triggers when reaching 3 and 5 kills, resets on hit', () => {
    let s = createInitialScoreState();

    // Use large time jumps so no multiplier affects the next kill (all multipliers expire).
    const t = (n: number) => n * 50_000;

    let r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: t(1) });
    s = r.next;
    expect(r.scoreDelta).toBe(110);

    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: t(2) });
    s = r.next;
    expect(r.scoreDelta).toBe(110);

    // 3rd kill => +50 streak bonus
    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: t(3) });
    s = r.next;
    expect(r.scoreDelta).toBe(160);

    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: t(4) });
    s = r.next;
    expect(r.scoreDelta).toBe(110);

    // 5th kill => +100 streak bonus
    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: t(5) });
    s = r.next;
    expect(r.scoreDelta).toBe(210);

    s = applyPlayerHit(s);
    expect(s.streakKills).toBe(0);

    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: t(6) });
    expect(r.scoreDelta).toBe(110);
  });

  test('multiplier applies to current kill before activation/replacement (clarif 09 order)', () => {
    let s = createInitialScoreState();

    // t=0 kill rapide: no active multiplier => base+25
    let r = applyEnemyDestroyed(s, { enemyType: 'rapide', nowMs: 0 });
    s = r.next;
    expect(r.scoreDelta).toBe(125);

    // t=500 kill standard: active combo x1.25 applies, then replaced by streak x1.10
    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: 500 });
    s = r.next;
    expect(r.scoreDelta).toBe(Math.floor(110 * 1.25));

    expect(s.activeMultiplier?.value).toBe(1.1);
    expect(s.activeMultiplier?.untilMs).toBe(500 + 6000);
  });

  test('multiplier expires when nowMs >= untilMs', () => {
    let s = createInitialScoreState();

    // kill standard at t=0 activates streak x1.10 until 6000
    let r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: 0 });
    s = r.next;

    // At exactly 6000ms, it is expired (active if nowMs < untilMs).
    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: 6000 });
    expect(r.scoreDelta).toBe(110);
  });

  test('precision bonus is computed at end and is not multiplied', () => {
    let s = createInitialScoreState();

    s = applyPlayerShot(s);
    s = applyPlayerShot(s);
    s = applyPlayerShot(s);
    s = applyPlayerShot(s);
    s = applyPlayerShot(s);

    // Simulate 4 hits (kills) out of 5 shots => 80% => +250
    let r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: 0 });
    s = r.next;
    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: 50_000 });
    s = r.next;
    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: 100_000 });
    s = r.next;
    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: 150_000 });
    s = r.next;

    const fin = finalizeScore(s);
    expect(fin.precision).toBeCloseTo(0.8, 8);
    expect(fin.precisionBonus).toBe(250);
    expect(fin.finalScore).toBe(s.score + 250);
  });

  test('end-to-end scenario: order + precision', () => {
    let s = createInitialScoreState();

    // 2 shots, 2 hits.
    s = applyPlayerShot(s);
    s = applyPlayerShot(s);

    // t=0 kill Elite (no active multiplier): base 100 + bonus(type=50) => 150
    // activates difficulte x2.0
    let r = applyEnemyDestroyed(s, { enemyType: 'elite', nowMs: 0 });
    s = r.next;
    expect(r.scoreDelta).toBe(150);

    // t=1000 kill Rapide: active x2.0 applies to base(100)+bonus(25) = 125 => 250
    // then activates combo x1.25
    r = applyEnemyDestroyed(s, { enemyType: 'rapide', nowMs: 1000 });
    s = r.next;
    expect(r.scoreDelta).toBe(250);

    const fin = finalizeScore(s);
    // 2/2 shots => 100% => +500
    expect(fin.precisionBonus).toBe(500);
    expect(fin.finalScore).toBe(s.score + 500);
  });
});
