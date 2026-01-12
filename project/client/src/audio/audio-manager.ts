import type { HowlerLike } from './howler-like';
import { createLazyHowlerAdapter } from './howler-adapter';

export type SfxKey = 'ui-click' | 'ui-back' | 'player-shot' | 'enemy-explosion' | 'game-over';

export type AudioManager = {
  setMuted: (muted: boolean) => void;
  toggleMuted: () => boolean;
  playSfx: (key: SfxKey) => void;
};

export type CreateAudioManagerOptions = {
  howler?: HowlerLike;
};

export function createAudioManager(options: CreateAudioManagerOptions = {}): AudioManager {
  const howler = options.howler;
  let muted: boolean | null = null;

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
  };
}

// Singleton used by the app (keeps Howler out of React state).
export const audioManager: AudioManager = createAudioManager({ howler: createLazyHowlerAdapter() });
