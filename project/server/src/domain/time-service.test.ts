import { describe, expect, test } from 'bun:test';

import { dayKeyParisFromUtcIso } from './time-service';

describe('timeService dayKeyParis (Europe/Paris)', () => {
  test('UTC late evening can become next day in Paris (winter)', () => {
    // 2026-01-10 23:30Z is 2026-01-11 00:30 in Europe/Paris (CET, +01)
    expect(dayKeyParisFromUtcIso('2026-01-10T23:30:00.000Z')).toBe('2026-01-11');
  });

  test('DST start (summer time) keeps same Paris day key around the jump', () => {
    // Europe/Paris switches to DST on 2026-03-29.
    // Around the jump, local clock skips from 02:00 -> 03:00, but the day stays the same.
    expect(dayKeyParisFromUtcIso('2026-03-29T00:30:00.000Z')).toBe('2026-03-29');
    expect(dayKeyParisFromUtcIso('2026-03-29T01:30:00.000Z')).toBe('2026-03-29');
  });

  test('DST end (winter time) keeps same Paris day key around the repeated hour', () => {
    // Europe/Paris switches back from DST on 2026-10-25.
    // The local 02:xx hour occurs twice; the day stays the same.
    expect(dayKeyParisFromUtcIso('2026-10-25T00:30:00.000Z')).toBe('2026-10-25');
    expect(dayKeyParisFromUtcIso('2026-10-25T01:30:00.000Z')).toBe('2026-10-25');
  });

  test('Explicit Europe/Paris is not affected by process.env.TZ', () => {
    const prev = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';

    try {
      expect(dayKeyParisFromUtcIso('2026-01-10T23:30:00.000Z')).toBe('2026-01-11');
    } finally {
      process.env.TZ = prev;
    }
  });

  test('Invalid ISO input throws', () => {
    expect(() => dayKeyParisFromUtcIso('not-a-date')).toThrow();
  });
});
