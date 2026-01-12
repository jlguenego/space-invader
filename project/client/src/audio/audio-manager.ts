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

export function createAudioManager(options: CreateAudioManagerOptions = {}): AudioManager {
  const howler = options.howler;
  let muted: boolean | null = null;

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

  return {
    setMuted: (nextMuted) => applyMute(Boolean(nextMuted)),
    toggleMuted: () => {
      const nextMuted = !(muted ?? false);
      applyMute(nextMuted);
      return nextMuted;
    },
    playSfx: (_key) => {
      // id033 will provide actual SFX assets + mapping.
      // Until then, this is intentionally a no-op.
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
