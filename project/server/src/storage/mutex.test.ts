import { describe, expect, test } from 'bun:test';

import { Mutex } from './mutex';

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

describe('Mutex', () => {
  test('runExclusive never runs critical sections concurrently', async () => {
    const mutex = new Mutex();

    let active = 0;
    let maxActive = 0;

    const tasks = Array.from({ length: 25 }, (_v, i) =>
      mutex.runExclusive(async () => {
        active += 1;
        maxActive = Math.max(maxActive, active);

        await sleep(5 + (i % 3));

        active -= 1;
        return i;
      }),
    );

    const results = await Promise.all(tasks);

    expect(results).toHaveLength(25);
    expect(maxActive).toBe(1);
  });

  test('runExclusive returns the function result', async () => {
    const mutex = new Mutex();

    const value = await mutex.runExclusive(() => 123);
    expect(value).toBe(123);
  });
});
