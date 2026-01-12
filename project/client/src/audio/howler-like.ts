export type HowlerLike = {
  mute: (muted: boolean) => void;
  tryUnlock: () => Promise<boolean>;
};
