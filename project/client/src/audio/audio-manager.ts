import type { HowlerLike } from './howler-like';
import { createLazyHowlerAdapter } from './howler-adapter';
import type { AudioUnlockState } from './audio-unlock';
import { registerAudioUnlockOnFirstInteraction } from './audio-unlock';

export type SfxKey = 'ui-click' | 'ui-back' | 'player-shot' | 'enemy-explosion' | 'game-over';

export type AudioManager = {
  setMuted: (muted: boolean) => void;
  toggleMuted: () => boolean;
  playSfx: (key: SfxKey) => void;
  getUnlockState: () => AudioUnlockState;
  registerUnlockOnFirstInteraction: (
    eventTarget?: EventTarget | null,
    onStateChange?: (state: AudioUnlockState) => void,
  ) => () => void;
};

export type CreateAudioManagerOptions = {
  howler?: HowlerLike;
};

const SFX_SOURCES: Record<SfxKey, string[]> = {
  'ui-click': ['/assets/audio/ui-click.ogg', '/assets/audio/ui-click.mp3'],
  'ui-back': ['/assets/audio/ui-back.ogg', '/assets/audio/ui-back.mp3'],
  'player-shot': ['/assets/audio/player-shot.ogg', '/assets/audio/player-shot.mp3'],
  'enemy-explosion': ['/assets/audio/enemy-explosion.ogg', '/assets/audio/enemy-explosion.mp3'],
  'game-over': ['/assets/audio/game-over.ogg', '/assets/audio/game-over.mp3'],
};

export function createAudioManager(options: CreateAudioManagerOptions = {}): AudioManager {
  const howler = options.howler;
  let muted: boolean | null = null;

  const sfxCache = new Map<SfxKey, Promise<{ play: () => unknown } | null>>();

  let unlockState: AudioUnlockState = 'locked';
  let unlockDispose: (() => void) | null = null;

  function setUnlockState(next: AudioUnlockState): void {
    unlockState = next;
  }

  function applyMute(nextMuted: boolean): void {
    if (muted === nextMuted) return;
    muted = nextMuted;

    try {
      howler?.mute(nextMuted);
    } catch (error) {
      console.warn('Failed to set Howler mute', error);
    }
  }

  async function getSfxHandle(key: SfxKey): Promise<{ play: () => unknown } | null> {
    const existing = sfxCache.get(key);
    if (existing) return existing;

    const p = (async () => {
      try {
        const src = SFX_SOURCES[key];
        const howl = await howler?.createHowl?.({ src, preload: true });
        return howl ?? null;
      } catch (error) {
        console.warn('Failed to load SFX', { key }, error);
        return null;
      }
    })();

    sfxCache.set(key, p);
    return p;
  }

  async function playSfxAsync(key: SfxKey): Promise<void> {
    if (muted ?? false) return;

    // Important for Bun tests / non-DOM environments: do not attempt to load Howler.
    if (typeof window === 'undefined') return;

    try {
      const handle = await getSfxHandle(key);
      handle?.play();
    } catch (error) {
      console.warn('Failed to play SFX', { key }, error);
    }
  }

  return {
    setMuted: (nextMuted) => applyMute(Boolean(nextMuted)),
    toggleMuted: () => {
      const nextMuted = !(muted ?? false);
      applyMute(nextMuted);
      return nextMuted;
    },
    playSfx: (key) => {
      void playSfxAsync(key);
    },
    getUnlockState: () => unlockState,
    registerUnlockOnFirstInteraction: (eventTarget, onStateChange) => {
      unlockDispose?.();
      unlockDispose = null;

      const target =
        eventTarget ?? (typeof window !== 'undefined' ? (window as unknown as EventTarget) : null);

      const registration = registerAudioUnlockOnFirstInteraction({
        eventTarget: target,
        driver: {
          tryUnlock: async () => {
            try {
              return (await howler?.tryUnlock?.()) ?? false;
            } catch (error) {
              console.warn('Failed to unlock audio', error);
              return false;
            }
          },
        },
        onStateChange: (state) => {
          setUnlockState(state);
          onStateChange?.(state);
        },
      });

      // Keep internal state in sync even when caller doesn't provide a callback.
      setUnlockState(registration.getState());

      unlockDispose = () => registration.dispose();
      return () => {
        unlockDispose?.();
        unlockDispose = null;
      };
    },
  };
}

// Singleton used by the app (keeps Howler out of React state).
export const audioManager: AudioManager = createAudioManager({ howler: createLazyHowlerAdapter() });
