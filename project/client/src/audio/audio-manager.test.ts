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

  test('playSfx does not throw (even when howler.createHowl rejects)', async () => {
    const previousWindow = (globalThis as unknown as { window?: unknown }).window;
    // Provide a window so playSfxAsync does not early-return.
    (globalThis as unknown as { window?: unknown }).window = {};

    const audio = createAudioManager({
      howler: {
        mute: () => {},
        tryUnlock: async () => true,
        createHowl: async () => {
          throw new Error('boom');
        },
      },
    });

    expect(() => audio.playSfx('player-shot')).not.toThrow();
    await new Promise((r) => setTimeout(r, 0));

    if (typeof previousWindow === 'undefined') {
      delete (globalThis as unknown as { window?: unknown }).window;
    } else {
      (globalThis as unknown as { window?: unknown }).window = previousWindow;
    }
  });

  test('playSfx calls howler.createHowl once per key and plays it', async () => {
    const previousWindow = (globalThis as unknown as { window?: unknown }).window;
    // Provide a window so playSfxAsync does not early-return.
    (globalThis as unknown as { window?: unknown }).window = {};

    const created: Array<{ src: string[]; preload?: boolean; html5?: boolean }> = [];
    let plays = 0;

    const audio = createAudioManager({
      howler: {
        mute: () => {},
        tryUnlock: async () => true,
        createHowl: async (options) => {
          created.push({ src: options.src, preload: options.preload, html5: options.html5 });
          return { play: () => (plays += 1) };
        },
      },
    });

    audio.playSfx('player-shot');
    audio.playSfx('player-shot');

    await new Promise((r) => setTimeout(r, 0));

    expect(created).toHaveLength(1);
    expect(created[0]?.src).toEqual([
      '/assets/audio/player-shot.mp3',
      '/assets/audio/player-shot.ogg',
    ]);
    expect(created[0]?.html5).toBe(true);
    expect(plays).toBe(2);

    if (typeof previousWindow === 'undefined') {
      delete (globalThis as unknown as { window?: unknown }).window;
    } else {
      (globalThis as unknown as { window?: unknown }).window = previousWindow;
    }
  });

  test('playSfx is a no-op without window (Bun tests / non-DOM)', async () => {
    const previousWindow = (globalThis as unknown as { window?: unknown }).window;
    // Ensure window is absent.
    delete (globalThis as unknown as { window?: unknown }).window;

    let createCalls = 0;
    const audio = createAudioManager({
      howler: {
        mute: () => {},
        tryUnlock: async () => true,
        createHowl: async () => {
          createCalls += 1;
          return { play: () => {} };
        },
      },
    });

    audio.playSfx('player-shot');
    await new Promise((r) => setTimeout(r, 0));

    expect(createCalls).toBe(0);

    if (typeof previousWindow === 'undefined') {
      delete (globalThis as unknown as { window?: unknown }).window;
    } else {
      (globalThis as unknown as { window?: unknown }).window = previousWindow;
    }
  });

  test('playSfx is a no-op when muted', async () => {
    const previousWindow = (globalThis as unknown as { window?: unknown }).window;
    (globalThis as unknown as { window?: unknown }).window = {};

    let createCalls = 0;
    const audio = createAudioManager({
      howler: {
        mute: () => {},
        tryUnlock: async () => true,
        createHowl: async () => {
          createCalls += 1;
          return { play: () => {} };
        },
      },
    });

    audio.setMuted(true);
    audio.playSfx('player-shot');
    await new Promise((r) => setTimeout(r, 0));

    expect(createCalls).toBe(0);

    if (typeof previousWindow === 'undefined') {
      delete (globalThis as unknown as { window?: unknown }).window;
    } else {
      (globalThis as unknown as { window?: unknown }).window = previousWindow;
    }
  });
});
