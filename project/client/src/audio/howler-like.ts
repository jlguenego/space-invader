export type HowlLike = {
  play: () => unknown;
};

export type HowlOptions = {
  src: string[];
  volume?: number;
  preload?: boolean;
  html5?: boolean;
};

export type HowlerLike = {
  mute: (muted: boolean) => void;
  tryUnlock: () => Promise<boolean>;
  createHowl?: (options: HowlOptions) => Promise<HowlLike | null>;
};
