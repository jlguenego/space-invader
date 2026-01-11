export type MovementState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

export type InputState = {
  movement: MovementState;
  fire: boolean;
};

export type EdgeActions = {
  togglePause: boolean;
  toggleMute: boolean;
};

export type InputManagerOptions = {
  eventTarget?: EventTarget | null;
  onTogglePause?: () => void;
  onToggleMute?: () => void;
};

const DEFAULT_MOVEMENT: MovementState = Object.freeze({
  left: false,
  right: false,
  up: false,
  down: false,
});

function isHTMLElement(value: unknown): value is HTMLElement {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target) return false;

  // Browser path (keeps App.tsx semantics).
  if (isHTMLElement(target)) {
    const tag = target.tagName.toLowerCase();
    return (
      tag === 'input' || tag === 'textarea' || tag === 'select' || Boolean(target.isContentEditable)
    );
  }

  // Test / non-DOM path: duck-typing.
  if (typeof target !== 'object') return false;
  const record = target as unknown as Record<string, unknown>;

  const tagNameRaw = record.tagName;
  const tagName = typeof tagNameRaw === 'string' ? tagNameRaw.toLowerCase() : null;

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    Boolean(record.isContentEditable)
  );
}

function resolveCode(e: KeyboardEvent): string {
  if (typeof e.code === 'string' && e.code.length > 0) return e.code;
  if (typeof e.key !== 'string') return '';

  // Fallback: avoid being too clever; keep it minimal.
  const k = e.key.toLowerCase();
  if (k === ' ') return 'Space';
  if (k === 'arrowleft') return 'ArrowLeft';
  if (k === 'arrowright') return 'ArrowRight';
  if (k === 'arrowup') return 'ArrowUp';
  if (k === 'arrowdown') return 'ArrowDown';
  if (k === 'p') return 'KeyP';
  if (k === 'm') return 'KeyM';
  if (k === 'w') return 'KeyW';
  if (k === 'a') return 'KeyA';
  if (k === 's') return 'KeyS';
  if (k === 'd') return 'KeyD';
  return '';
}

function nextMovementFromPressed(pressed: ReadonlySet<string>): MovementState {
  const left = pressed.has('ArrowLeft') || pressed.has('KeyA');
  const right = pressed.has('ArrowRight') || pressed.has('KeyD');
  const up = pressed.has('ArrowUp') || pressed.has('KeyW');
  const down = pressed.has('ArrowDown') || pressed.has('KeyS');
  return { left, right, up, down };
}

export class InputManager {
  private readonly target: EventTarget | null;
  private readonly onTogglePause: (() => void) | undefined;
  private readonly onToggleMute: (() => void) | undefined;

  private attached = false;

  private readonly pressedCodes = new Set<string>();
  private fire = false;

  private pendingActions: EdgeActions = { togglePause: false, toggleMute: false };

  private readonly onKeyDownBound = (e: Event) => this.onKeyDown(e);
  private readonly onKeyUpBound = (e: Event) => this.onKeyUp(e);

  constructor(options?: InputManagerOptions) {
    this.target =
      options?.eventTarget ??
      (typeof window !== 'undefined' ? (window as unknown as EventTarget) : null);

    this.onTogglePause = options?.onTogglePause;
    this.onToggleMute = options?.onToggleMute;
  }

  attach(): void {
    if (this.attached) return;
    if (!this.target) return;

    this.target.addEventListener('keydown', this.onKeyDownBound);
    this.target.addEventListener('keyup', this.onKeyUpBound);
    this.attached = true;
  }

  dispose(): void {
    if (!this.attached) return;
    if (!this.target) return;

    this.target.removeEventListener('keydown', this.onKeyDownBound);
    this.target.removeEventListener('keyup', this.onKeyUpBound);
    this.attached = false;
  }

  getState(): InputState {
    return {
      movement: nextMovementFromPressed(this.pressedCodes),
      fire: this.fire,
    };
  }

  consumeEdgeActions(): EdgeActions {
    const snapshot = this.pendingActions;
    this.pendingActions = { togglePause: false, toggleMute: false };
    return snapshot;
  }

  private onKeyDown(raw: Event): void {
    const e = raw as KeyboardEvent;
    if (isEditableTarget(e.target ?? null)) return;

    const code = resolveCode(e);

    switch (code) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'KeyW':
      case 'KeyA':
      case 'KeyS':
      case 'KeyD':
        this.pressedCodes.add(code);
        break;

      case 'Space':
        this.fire = true;
        break;

      default:
        break;
    }

    if (e.repeat) return;

    if (code === 'KeyP') {
      this.pendingActions = { ...this.pendingActions, togglePause: true };
      this.onTogglePause?.();
      return;
    }

    if (code === 'KeyM') {
      this.pendingActions = { ...this.pendingActions, toggleMute: true };
      this.onToggleMute?.();
    }
  }

  private onKeyUp(raw: Event): void {
    const e = raw as KeyboardEvent;
    if (isEditableTarget(e.target ?? null)) return;

    const code = resolveCode(e);

    switch (code) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'KeyW':
      case 'KeyA':
      case 'KeyS':
      case 'KeyD':
        this.pressedCodes.delete(code);
        break;

      case 'Space':
        this.fire = false;
        break;

      default:
        break;
    }
  }
}
