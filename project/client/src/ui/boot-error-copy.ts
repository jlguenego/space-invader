import type { BootErrorCode } from './boot-state';

export type BootErrorCopy = {
  title: string;
  message: string;
  actions: string[];
};

export function bootErrorCopy(code: BootErrorCode): BootErrorCopy {
  switch (code) {
    case 'webgl_incompatible': {
      return {
        title: 'Jeu incompatible',
        message:
          'Ce navigateur ne permet pas d’afficher le jeu. Essayez un autre navigateur ou mettez le vôtre à jour.',
        actions: [
          'Mettre à jour le navigateur.',
          'Essayer un autre navigateur (Chrome, Edge ou Firefox).',
        ],
      };
    }
    case 'boot_failed': {
      return {
        title: 'Chargement impossible',
        message: 'Impossible de démarrer le jeu pour le moment.',
        actions: ['Recharger la page.'],
      };
    }
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}
