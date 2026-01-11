import { describe, expect, it } from 'bun:test';

import { keyboardControls } from './controls-panel';

describe('keyboardControls', () => {
  it('contains exactly the MVP keyboard controls', () => {
    expect(keyboardControls).toEqual([
      { action: 'Déplacement', keys: 'flèches ou WASD' },
      { action: 'Tir', keys: 'espace' },
      { action: 'Pause', keys: 'P' },
      { action: 'Mute', keys: 'M' },
    ]);
  });
});
