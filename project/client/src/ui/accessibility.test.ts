import { describe, expect, it } from 'bun:test';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { uiGlobalA11yCss } from './ui-kit';
import { PauseOverlay } from './pause-overlay';
import { GameOverScreen } from './game-over-screen';
import { LeaderboardScreen } from './leaderboard-screen';
import type { LeaderboardDay } from './ui-state-machine';

function render(component: React.ReactElement): string {
  return renderToStaticMarkup(component);
}

describe('a11y (minimal): menus/focus/labels', () => {
  it('exposes a global :focus-visible style', () => {
    expect(uiGlobalA11yCss).toContain(':focus-visible');
    expect(uiGlobalA11yCss).toContain('outline');
  });

  it('PauseOverlay has an accessible name and autofocuses primary action', () => {
    const html = render(React.createElement(PauseOverlay, { onResume: () => {} }));

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="pause-title"');
    expect(html).toContain('id="pause-title"');
    expect(html).toContain('data-autofocus');
  });

  it('GameOverScreen exposes primary action for autofocus', () => {
    const html = render(
      React.createElement(GameOverScreen, {
        finalScore: 1234,
        displayedPseudo: 'Anonyme',
        scoreSave: { status: 'idle', message: null },
        onReplay: () => {},
        onSaveScore: () => {},
        onOpenLeaderboard: () => {},
        onGoHome: () => {},
      }),
    );

    expect(html).toContain('data-autofocus');
    expect(html).toContain('Rejouer');
  });

  it('LeaderboardScreen exposes primary action for autofocus', () => {
    const leaderboard: LeaderboardDay = {
      dayKeyParis: '2026-01-12',
      timezone: 'Europe/Paris',
      entries: [],
    };

    const html = render(
      React.createElement(LeaderboardScreen, {
        status: 'loaded',
        leaderboard,
        errorMessage: null,
        onRetry: () => {},
        onGoHome: () => {},
      }),
    );

    expect(html).toContain('data-autofocus');
    expect(html).toContain('Accueil');
  });
});
