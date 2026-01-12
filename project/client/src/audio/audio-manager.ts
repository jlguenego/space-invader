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

function isDebugAudio(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('space-invaders:debug-audio') === '1';
  } catch {
    return false;
  }
}

const SFX_SOURCES: Record<SfxKey, string[]> = {
  // Important: Howler picks the first playable format, and will not fallback to the next
  // source if the chosen one 404s. Put mp3 first so the game remains audible even if
  // ogg files are missing during development.
  'ui-click': ['/assets/audio/ui-click.mp3', '/assets/audio/ui-click.ogg'],
  'ui-back': ['/assets/audio/ui-back.mp3', '/assets/audio/ui-back.ogg'],
  'player-shot': ['/assets/audio/player-shot.mp3', '/assets/audio/player-shot.ogg'],
  'enemy-explosion': ['/assets/audio/enemy-explosion.mp3', '/assets/audio/enemy-explosion.ogg'],
  'game-over': ['/assets/audio/game-over.mp3', '/assets/audio/game-over.ogg'],
};

export function createAudioManager(options: CreateAudioManagerOptions = {}): AudioManager {
  const howler = options.howler;
  let muted: boolean | null = null;

  let warnedMuted = false;
  let warnedNoWindow = false;
  let warnedUnlockFailed = false;

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
        const howl = await howler?.createHowl?.({ src, preload: true, html5: true });
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
    if (isDebugAudio()) {
      console.info('[audio] playSfx', { key, muted: muted ?? false, unlockState });
    }

    if (muted ?? false) {
      if (!warnedMuted && isDebugAudio()) {
        warnedMuted = true;
        console.info('[audio] skipped: muted');
      }
      return;
    }

    // Important for Bun tests / non-DOM environments: do not attempt to load Howler.
    if (typeof window === 'undefined') {
      if (!warnedNoWindow && isDebugAudio()) {
        warnedNoWindow = true;
        console.info('[audio] skipped: no window');
      }
      return;
    }

    // Some browsers can miss the initial unlock attempt (timing, focus, etc.).
    // As a fallback, try unlocking on demand when a user-driven action triggers a sound.
    if (unlockState === 'locked') {
      try {
        const ok = (await howler?.tryUnlock?.()) ?? false;
        unlockState = ok ? 'unlocked' : 'failed';
      } catch (error) {
        unlockState = 'failed';
        console.warn('Failed to unlock audio while playing SFX', error);
      }

      if (unlockState !== 'unlocked') {
        if (!warnedUnlockFailed && isDebugAudio()) {
          warnedUnlockFailed = true;
          console.warn('[audio] skipped: unlock failed');
        }
        return;
      }
    }

    try {
      const handle = await getSfxHandle(key);
      if (!handle) {
        console.warn('SFX handle is null (missing file? Howler failed?)', {
          key,
          src: SFX_SOURCES[key],
        });
        return;
      }
      handle.play();
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
