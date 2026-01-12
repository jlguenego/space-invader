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

  test('streak palier bonus triggers when reaching 10 and 20 kills', () => {
    let s = createInitialScoreState();

    // Ensure multipliers never apply to the next kill.
    const t = (n: number) => n * 50_000;

    let r = { next: s, scoreDelta: 0 } as ReturnType<typeof applyEnemyDestroyed>;

    for (let i = 1; i <= 9; i++) {
      r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: t(i) });
      s = r.next;
    }

    // 10th kill => +250 streak bonus.
    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: t(10) });
    s = r.next;
    expect(r.scoreDelta).toBe(100 + 10 + 250);

    for (let i = 11; i <= 19; i++) {
      r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: t(i) });
      s = r.next;
    }

    // 20th kill => +600 streak bonus.
    r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: t(20) });
    expect(r.scoreDelta).toBe(100 + 10 + 600);
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

  test('each enemy type activates its expected multiplier kind/value/duration (clarif 09 table)', () => {
    const s0 = createInitialScoreState();

    const rStandard = applyEnemyDestroyed(s0, { enemyType: 'standard', nowMs: 100 });
    expect(rStandard.next.activeMultiplier).toEqual({ kind: 'streak', value: 1.1, untilMs: 6100 });

    const rRapide = applyEnemyDestroyed(s0, { enemyType: 'rapide', nowMs: 200 });
    expect(rRapide.next.activeMultiplier).toEqual({ kind: 'combo', value: 1.25, untilMs: 4200 });

    const rTank = applyEnemyDestroyed(s0, { enemyType: 'tank', nowMs: 300 });
    expect(rTank.next.activeMultiplier).toEqual({ kind: 'temps', value: 1.5, untilMs: 10300 });

    const rElite = applyEnemyDestroyed(s0, { enemyType: 'elite', nowMs: 400 });
    expect(rElite.next.activeMultiplier).toEqual({ kind: 'difficulte', value: 2.0, untilMs: 8400 });
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

  test('kill points are floored after applying multiplier (Math.floor)', () => {
    let s = createInitialScoreState();

    // First kill activates streak x1.10.
    let r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: 0 });
    s = r.next;

    // Next kill while x1.10 is active: (base 100 + rapide bonus 25) * 1.10 = 137.5 => 137.
    r = applyEnemyDestroyed(s, { enemyType: 'rapide', nowMs: 1000 });
    expect(r.scoreDelta).toBe(137);
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

  test('precision thresholds: shots=0, 0.7, 0.9', () => {
    // shots=0 => precision 0 and no bonus.
    let s = createInitialScoreState();
    let fin = finalizeScore(s);
    expect(fin.precision).toBe(0);
    expect(fin.precisionBonus).toBe(0);
    expect(fin.finalScore).toBe(0);

    // 7/10 => 0.7 => +100
    s = createInitialScoreState();
    for (let i = 0; i < 10; i++) s = applyPlayerShot(s);

    // Add 7 hits via 7 kills; ensure multipliers never apply to the next kill.
    for (let i = 0; i < 7; i++) {
      const r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: i * 50_000 });
      s = r.next;
    }

    fin = finalizeScore(s);
    expect(fin.precision).toBeCloseTo(0.7, 8);
    expect(fin.precisionBonus).toBe(100);

    // 9/10 => 0.9 => +500
    s = createInitialScoreState();
    for (let i = 0; i < 10; i++) s = applyPlayerShot(s);
    for (let i = 0; i < 9; i++) {
      const r = applyEnemyDestroyed(s, { enemyType: 'standard', nowMs: i * 50_000 });
      s = r.next;
    }

    fin = finalizeScore(s);
    expect(fin.precision).toBeCloseTo(0.9, 8);
    expect(fin.precisionBonus).toBe(500);
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
