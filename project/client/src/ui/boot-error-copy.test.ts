import { describe, expect, test } from 'bun:test';

import { bootErrorCopy } from './boot-error-copy';

describe('bootErrorCopy', () => {
  test('webgl_incompatible copy stays non-technical and actionable', () => {
    const copy = bootErrorCopy('webgl_incompatible');

    expect(copy.title.length).toBeGreaterThan(3);
    expect(copy.message.length).toBeGreaterThan(20);
    expect(copy.actions.length).toBeGreaterThanOrEqual(1);

    const combined = [copy.title, copy.message, ...copy.actions].join(' ').toLowerCase();
    expect(combined).not.toContain('webgl');
    expect(combined).not.toContain('three');
    expect(combined).not.toContain('gpu');
    expect(combined).not.toContain('context');
  });

  test('boot_failed mentions reload', () => {
    const copy = bootErrorCopy('boot_failed');
    const combined = [copy.title, copy.message, ...copy.actions].join(' ').toLowerCase();
    expect(combined).toContain('recharg');
  });
});
