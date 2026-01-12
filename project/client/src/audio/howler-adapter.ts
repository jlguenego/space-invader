import type { HowlerLike } from './howler-like';

type HowlerModule = {
  Howler: {
    mute: (muted: boolean) => void;
  };
};

export function createLazyHowlerAdapter(): HowlerLike {
  let loaded: HowlerLike | null = null;
  let loading: Promise<HowlerLike> | null = null;
  let lastMuted: boolean | null = null;

  async function load(): Promise<HowlerLike> {
    if (loaded) return loaded;
    if (!loading) {
      loading = import('howler').then((mod) => {
        const howler = (mod as unknown as HowlerModule).Howler;
        loaded = {
          mute: (muted) => howler.mute(muted),
        };
        return loaded;
      });
    }
    return loading;
  }

  return {
    mute: (muted) => {
      lastMuted = muted;

      // Important for Bun tests / non-DOM environments: do not attempt to load Howler.
      if (typeof window === 'undefined') return;

      void load()
        .then((howler) => {
          if (lastMuted === null) return;
          howler.mute(lastMuted);
        })
        .catch((error) => {
          console.warn('Failed to load Howler', error);
        });
    },
  };
}
