import { describe, expect, test } from 'bun:test';

import { createAudioManager } from './audio-manager';

describe('audio-manager', () => {
  test('setMuted forwards to howler.mute and is idempotent', () => {
    const calls: boolean[] = [];
    const audio = createAudioManager({
      howler: {
        mute: (muted) => calls.push(muted),
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
      },
    });

    expect(audio.toggleMuted()).toBe(true);
    expect(audio.toggleMuted()).toBe(false);
    expect(calls).toEqual([true, false]);
  });
});
