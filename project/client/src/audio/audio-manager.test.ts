import { describe, expect, test } from 'bun:test';

import { createAudioManager } from './audio-manager';

describe('audio-manager', () => {
  test('setMuted forwards to howler.mute and is idempotent', () => {
    const calls: boolean[] = [];
    const audio = createAudioManager({
      howler: {
        mute: (muted) => calls.push(muted),
        tryUnlock: async () => true,
      },
    });

    audio.setMuted(true);
    audio.setMuted(true);
    audio.setMuted(false);

    expect(calls).toEqual([true, false]);
  });

  test('toggleMuted flips internal state and forwards to howler.mute', () => {
    const calls: boolean[] = [];
    const audio = createAudioManager({
      howler: {
        mute: (muted) => calls.push(muted),
        tryUnlock: async () => true,
      },
    });

    expect(audio.toggleMuted()).toBe(true);
    expect(audio.toggleMuted()).toBe(false);
    expect(calls).toEqual([true, false]);
  });

  test('registerUnlockOnFirstInteraction triggers howler.tryUnlock on interaction', async () => {
    class FakeTarget implements EventTarget {
      private listeners = new Map<string, Set<(e: Event) => void>>();

      addEventListener(type: string, callback: EventListenerOrEventListenerObject | null): void {
        if (!callback) return;
        const fn =
          typeof callback === 'function'
            ? (callback as (e: Event) => void)
            : (callback.handleEvent as (e: Event) => void);

        let set = this.listeners.get(type);
        if (!set) {
          set = new Set();
          this.listeners.set(type, set);
        }
        set.add(fn);
      }

      removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null): void {
        if (!callback) return;
        const fn =
          typeof callback === 'function'
            ? (callback as (e: Event) => void)
            : (callback.handleEvent as (e: Event) => void);
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

    const target = new FakeTarget();
    let unlockCalls = 0;
    const audio = createAudioManager({
      howler: {
        mute: () => {},
        tryUnlock: async () => {
          unlockCalls += 1;
          return true;
        },
      },
    });

    expect(audio.getUnlockState()).toBe('locked');

    const dispose = audio.registerUnlockOnFirstInteraction(target);
    target.dispatch('pointerdown');
    await Promise.resolve();
    await Promise.resolve();

    expect(unlockCalls).toBe(1);
    expect(audio.getUnlockState()).toBe('unlocked');

    dispose();
  });
});
