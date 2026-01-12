export type AudioUnlockState = 'locked' | 'unlocked' | 'failed';

export type AudioUnlockDriver = {
  tryUnlock: () => Promise<boolean>;
};

export type RegisterAudioUnlockOptions = {
  eventTarget: EventTarget | null;
  driver: AudioUnlockDriver;
  onStateChange?: (state: AudioUnlockState) => void;
  logger?: Pick<Console, 'warn'>;
};

export type AudioUnlockRegistration = {
  getState: () => AudioUnlockState;
  dispose: () => void;
};

export function registerAudioUnlockOnFirstInteraction(
  options: RegisterAudioUnlockOptions,
): AudioUnlockRegistration {
  const { eventTarget, driver } = options;
  const logger = options.logger ?? console;

  let state: AudioUnlockState = 'locked';
  let disposed = false;
  let attemptStarted = false;
  let inFlight: Promise<void> | null = null;

  const notify = () => options.onStateChange?.(state);

  const onInteraction = () => {
    void attemptUnlock();
  };

  function attach(): void {
    if (!eventTarget) return;

    eventTarget.addEventListener('pointerdown', onInteraction);
    eventTarget.addEventListener('keydown', onInteraction);
  }

  function detach(): void {
    if (!eventTarget) return;

    eventTarget.removeEventListener('pointerdown', onInteraction);
    eventTarget.removeEventListener('keydown', onInteraction);
  }

  async function attemptUnlock(): Promise<void> {
    if (disposed) return;
    if (state !== 'locked') return;
    if (attemptStarted) return;

    attemptStarted = true;
    detach();

    inFlight = (async () => {
      try {
        const ok = await driver.tryUnlock();
        state = ok ? 'unlocked' : 'failed';
      } catch (error) {
        state = 'failed';
        logger.warn('Audio unlock failed', error);
      } finally {
        notify();
        inFlight = null;
      }
    })();

    await inFlight;
  }

  attach();

  return {
    getState: () => state,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      detach();
    },
  };
}
