import type { HowlerLike } from './howler-like';

type HowlerModule = {
  Howler: {
    mute: (muted: boolean) => void;
    ctx?: {
      state?: string;
      resume?: () => Promise<unknown>;
    };
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
          tryUnlock: async () => {
            const ctx = howler.ctx;
            if (!ctx) return true;

            const state = typeof ctx.state === 'string' ? ctx.state : null;
            if (state === 'running') return true;

            if (typeof ctx.resume !== 'function') return false;
            await ctx.resume();
            return typeof ctx.state === 'string' ? ctx.state === 'running' : true;
          },
        };

        if (lastMuted !== null) {
          try {
            loaded.mute(lastMuted);
          } catch (error) {
            console.warn('Failed to apply Howler mute after load', error);
          }
        }

        return loaded;
      });
    }
    return loading;
  }

  return {
    mute: (muted) => {
      lastMuted = muted;

      // Important for Bun tests / non-DOM environments: do not attempt to load Howler.
      // Also avoid loading Howler before first user interaction; we apply lastMuted when we do load.
      if (typeof window === 'undefined') return;

      if (loaded) {
        try {
          loaded.mute(muted);
        } catch (error) {
          console.warn('Failed to set Howler mute', error);
        }
      }
    },
    tryUnlock: async () => {
      // Important for Bun tests / non-DOM environments: do not attempt to load Howler.
      if (typeof window === 'undefined') return false;

      try {
        const howler = await load();
        return await howler.tryUnlock();
      } catch (error) {
        console.warn('Failed to unlock Howler', error);
        return false;
      }
    },
  };
}
