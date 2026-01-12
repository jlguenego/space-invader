import { describe, expect, test } from 'bun:test';

import { bootReducer, initialBootState, type BootState } from './boot-state';

describe('bootReducer', () => {
  test('BOOT_START resets to loading/assets', () => {
    const prev: BootState = {
      status: 'error',
      phase: null,
      errorCode: 'boot_failed',
      message: 'x',
    };
    const next = bootReducer(prev, { type: 'BOOT_START' });
    expect(next).toEqual({ status: 'loading', phase: 'assets', errorCode: null, message: null });
  });

  test('BOOT_PHASE updates phase only when loading', () => {
    const next = bootReducer(initialBootState, { type: 'BOOT_PHASE', phase: 'webgl' });
    expect(next.status).toBe('loading');
    expect(next.phase).toBe('webgl');

    const ready: BootState = { status: 'ready', phase: null, errorCode: null, message: null };
    expect(bootReducer(ready, { type: 'BOOT_PHASE', phase: 'webgl' })).toEqual(ready);
  });

  test('BOOT_READY sets ready and clears message/phase', () => {
    const next = bootReducer(
      { status: 'loading', phase: 'webgl', errorCode: null, message: null },
      { type: 'BOOT_READY' },
    );
    expect(next).toEqual({ status: 'ready', phase: null, errorCode: null, message: null });
  });

  test('BOOT_ERROR sets error and clears phase', () => {
    const next = bootReducer(
      { status: 'loading', phase: 'webgl', errorCode: null, message: null },
      { type: 'BOOT_ERROR', errorCode: 'boot_failed', message: 'Nope' },
    );
    expect(next).toEqual({
      status: 'error',
      phase: null,
      errorCode: 'boot_failed',
      message: 'Nope',
    });
  });
});
