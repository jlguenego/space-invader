import { describe, expect, test } from 'bun:test';

import { InputManager } from './input-manager';

type Listener = (evt: Event) => void;

class FakeEventTarget implements EventTarget {
  private readonly listeners = new Map<string, Set<Listener>>();

  addEventListener(type: string, callback: EventListenerOrEventListenerObject | null): void {
    if (!callback) return;
    const fn: Listener =
      typeof callback === 'function' ? callback : (evt) => callback.handleEvent(evt);

    const set = this.listeners.get(type) ?? new Set<Listener>();
    set.add(fn);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null): void {
    if (!callback) return;
    const fn: Listener =
      typeof callback === 'function' ? callback : (evt) => callback.handleEvent(evt);

    this.listeners.get(type)?.delete(fn);
  }

  dispatch(type: string, event: Omit<KeyboardEvent, 'type'> & { type?: string }): void {
    const evt = { ...event, type } as unknown as Event;
    for (const listener of this.listeners.get(type) ?? []) {
      listener(evt);
    }
  }

  // Unused by our tests; required by interface.
  dispatchEvent(_event: Event): boolean {
    return true;
  }
}

function keyEvent(params: {
  code: string;
  repeat?: boolean;
  target?: EventTarget | null;
  key?: string;
}): KeyboardEvent {
  return {
    code: params.code,
    key: params.key ?? '',
    repeat: params.repeat ?? false,
    target: params.target ?? null,
  } as unknown as KeyboardEvent;
}

describe('InputManager', () => {
  test('maps arrows + WASD into movement state (supports simultaneous sources)', () => {
    const target = new FakeEventTarget();
    const input = new InputManager({ eventTarget: target });
    input.attach();

    target.dispatch('keydown', keyEvent({ code: 'ArrowLeft' }));
    expect(input.getState().movement.left).toBe(true);

    // Also press KeyA (same direction). Releasing ArrowLeft should still keep left.
    target.dispatch('keydown', keyEvent({ code: 'KeyA' }));
    target.dispatch('keyup', keyEvent({ code: 'ArrowLeft' }));
    expect(input.getState().movement.left).toBe(true);

    target.dispatch('keyup', keyEvent({ code: 'KeyA' }));
    expect(input.getState().movement.left).toBe(false);

    target.dispatch('keydown', keyEvent({ code: 'KeyW' }));
    target.dispatch('keydown', keyEvent({ code: 'ArrowDown' }));

    const movement = input.getState().movement;
    expect(movement.up).toBe(true);
    expect(movement.down).toBe(true);

    target.dispatch('keyup', keyEvent({ code: 'KeyW' }));
    target.dispatch('keyup', keyEvent({ code: 'ArrowDown' }));
    expect(input.getState().movement).toEqual({
      left: false,
      right: false,
      up: false,
      down: false,
    });
  });

  test('maps Space into fire held state', () => {
    const target = new FakeEventTarget();
    const input = new InputManager({ eventTarget: target });
    input.attach();

    expect(input.getState().fire).toBe(false);

    target.dispatch('keydown', keyEvent({ code: 'Space' }));
    expect(input.getState().fire).toBe(true);

    target.dispatch('keyup', keyEvent({ code: 'Space' }));
    expect(input.getState().fire).toBe(false);
  });

  test('falls back to KeyboardEvent.key when code is empty (Space + P)', () => {
    const target = new FakeEventTarget();

    let pauseCount = 0;
    const input = new InputManager({ eventTarget: target, onTogglePause: () => pauseCount++ });
    input.attach();

    // Space via key=" "
    target.dispatch('keydown', keyEvent({ code: '', key: ' ' }));
    expect(input.getState().fire).toBe(true);

    target.dispatch('keyup', keyEvent({ code: '', key: ' ' }));
    expect(input.getState().fire).toBe(false);

    // Pause via key="p" / "P" and ignore repeat.
    target.dispatch('keydown', keyEvent({ code: '', key: 'p', repeat: false }));
    target.dispatch('keydown', keyEvent({ code: '', key: 'P', repeat: true }));
    expect(pauseCount).toBe(1);

    expect(input.consumeEdgeActions()).toEqual({ togglePause: true, toggleMute: false });
    expect(input.consumeEdgeActions()).toEqual({ togglePause: false, toggleMute: false });
  });

  test('P and M are edge-triggered on non-repeated keydown', () => {
    const target = new FakeEventTarget();

    let pauseCount = 0;
    let muteCount = 0;

    const input = new InputManager({
      eventTarget: target,
      onTogglePause: () => pauseCount++,
      onToggleMute: () => muteCount++,
    });

    input.attach();

    target.dispatch('keydown', keyEvent({ code: 'KeyP', repeat: false }));
    target.dispatch('keydown', keyEvent({ code: 'KeyP', repeat: true }));
    expect(pauseCount).toBe(1);

    expect(input.consumeEdgeActions()).toEqual({ togglePause: true, toggleMute: false });
    expect(input.consumeEdgeActions()).toEqual({ togglePause: false, toggleMute: false });

    target.dispatch('keydown', keyEvent({ code: 'KeyM', repeat: false }));
    target.dispatch('keydown', keyEvent({ code: 'KeyM', repeat: true }));
    expect(muteCount).toBe(1);

    expect(input.consumeEdgeActions()).toEqual({ togglePause: false, toggleMute: true });
  });

  test('ignores events when target is editable (input/textarea/select/contenteditable)', () => {
    const target = new FakeEventTarget();

    let pauseCount = 0;
    let muteCount = 0;

    const input = new InputManager({
      eventTarget: target,
      onTogglePause: () => pauseCount++,
      onToggleMute: () => muteCount++,
    });

    input.attach();

    target.dispatch(
      'keydown',
      keyEvent({ code: 'KeyP', target: { tagName: 'INPUT' } as unknown as EventTarget }),
    );
    target.dispatch(
      'keydown',
      keyEvent({ code: 'KeyM', target: { tagName: 'textarea' } as unknown as EventTarget }),
    );
    target.dispatch(
      'keydown',
      keyEvent({ code: 'Space', target: { tagName: 'select' } as unknown as EventTarget }),
    );
    target.dispatch(
      'keydown',
      keyEvent({
        code: 'ArrowLeft',
        target: { isContentEditable: true } as unknown as EventTarget,
      }),
    );

    expect(pauseCount).toBe(0);
    expect(muteCount).toBe(0);
    expect(input.getState().fire).toBe(false);
    expect(input.getState().movement.left).toBe(false);
  });

  test('dispose() unregisters listeners (no more state changes)', () => {
    const target = new FakeEventTarget();
    let pauseCount = 0;

    const input = new InputManager({ eventTarget: target, onTogglePause: () => pauseCount++ });
    input.attach();

    target.dispatch('keydown', keyEvent({ code: 'KeyP' }));
    expect(pauseCount).toBe(1);

    input.dispose();

    target.dispatch('keydown', keyEvent({ code: 'KeyP' }));
    target.dispatch('keydown', keyEvent({ code: 'ArrowLeft' }));
    target.dispatch('keydown', keyEvent({ code: 'Space' }));

    expect(pauseCount).toBe(1);
    expect(input.getState().movement.left).toBe(false);
    expect(input.getState().fire).toBe(false);
  });
});
