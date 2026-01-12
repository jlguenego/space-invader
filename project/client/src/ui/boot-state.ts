export type BootPhase = 'assets' | 'webgl';

export type BootStatus = 'loading' | 'ready' | 'error';

export type BootState = {
  status: BootStatus;
  phase: BootPhase | null;
  message: string | null;
};

export type BootAction =
  | { type: 'BOOT_START' }
  | { type: 'BOOT_PHASE'; phase: BootPhase }
  | { type: 'BOOT_READY' }
  | { type: 'BOOT_ERROR'; message: string };

export const initialBootState: BootState = {
  status: 'loading',
  phase: 'assets',
  message: null,
};

export function bootReducer(state: BootState, action: BootAction): BootState {
  switch (action.type) {
    case 'BOOT_START': {
      return { status: 'loading', phase: 'assets', message: null };
    }
    case 'BOOT_PHASE': {
      if (state.status !== 'loading') return state;
      return { ...state, phase: action.phase };
    }
    case 'BOOT_READY': {
      return { status: 'ready', phase: null, message: null };
    }
    case 'BOOT_ERROR': {
      return { status: 'error', phase: null, message: action.message };
    }
    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}

export function bootPhaseLabel(phase: BootPhase | null): string {
  if (phase === 'assets') return 'Chargement…';
  if (phase === 'webgl') return 'Initialisation du rendu 3D…';
  return 'Chargement…';
}
