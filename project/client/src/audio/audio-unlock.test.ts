import { describe, expect, test } from 'bun:test';

import type { AudioUnlockState } from './audio-unlock';
import { registerAudioUnlockOnFirstInteraction } from './audio-unlock';

type Listener = (event: Event) => void;

class FakeTarget implements EventTarget {
  private listeners = new Map<string, Set<Listener>>();

  addEventListener(type: string, callback: EventListenerOrEventListenerObject | null): void {
    if (!callback) return;
    const fn: Listener =
      typeof callback === 'function' ? callback : (callback.handleEvent as Listener);

    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(fn);
  }

  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null): void {
    if (!callback) return;
    const fn: Listener =
      typeof callback === 'function' ? callback : (callback.handleEvent as Listener);

    this.listeners.get(type)?.delete(fn);
  }

  dispatch(type: string): void {
    const event = new Event(type);
    const set = this.listeners.get(type);
    if (!set) return;
    for (const fn of Array.from(set)) fn(event);
  }

  dispatchEvent(event: Event): boolean {
    this.dispatch(event.type);
    return true;
  }
}

describe('audio-unlock', () => {
  test('is safe with null target', async () => {
    let called = 0;
    const reg = registerAudioUnlockOnFirstInteraction({
      eventTarget: null,
      driver: {
        tryUnlock: async () => {
          called += 1;
          return true;
        },
      },
    });

    expect(reg.getState()).toBe('locked');
    expect(called).toBe(0);
    reg.dispose();
  });

  test('attempts unlock on first interaction and is idempotent', async () => {
    const target = new FakeTarget();
    let attempts = 0;

    let lastState: AudioUnlockState = 'locked';
    const reg = registerAudioUnlockOnFirstInteraction({
      eventTarget: target,
      driver: {
        tryUnlock: async () => {
          attempts += 1;
          return true;
        },
      },
      onStateChange: (s) => {
        lastState = s;
      },
    });

    target.dispatch('pointerdown');
    target.dispatch('keydown');

    // microtask flush
    await Promise.resolve();

    expect(attempts).toBe(1);
    expect(reg.getState()).toBe('unlocked');
    expect(lastState as AudioUnlockState).toBe('unlocked');

    reg.dispose();
  });

  test('sets failed state when driver returns false', async () => {
    const target = new FakeTarget();

    const reg = registerAudioUnlockOnFirstInteraction({
      eventTarget: target,
      driver: {
        tryUnlock: async () => false,
      },
    });

    target.dispatch('keydown');
    await Promise.resolve();

    expect(reg.getState()).toBe('failed');
    reg.dispose();
  });
});
