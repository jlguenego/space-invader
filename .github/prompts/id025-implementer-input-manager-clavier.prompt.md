# id025 — (P0) (S) Implémenter `InputManager` clavier (flèches/WASD, espace, P, M)

## Role

Tu es un développeur TypeScript senior spécialisé front-end temps réel (React + Vite) et architecture “game loop” navigateur. Tu écris du code testable (Bun tests), tu évites de coupler la boucle de jeu aux re-renders React, et tu centralises les listeners clavier.

## Objectif

Implémenter un module `InputManager` côté client qui :

- Centralise les listeners clavier (pas de listeners dispersés dans l’UI).
- Mappe les touches **flèches + WASD** vers un état de déplacement.
- Mappe **espace** vers l’action “tir”.
- Expose des actions “edge-triggered” (sur `keydown` non répété) : **P** = toggle pause, **M** = toggle mute.
- Ne capture pas les touches quand l’utilisateur est en train de saisir (focus sur `input/textarea/select` ou élément `contenteditable`).

Conserver le comportement existant : **P** pause/reprend en jeu, **M** toggle mute (persisté via `storage/preferences`).

## Format de sortie

Produire une implémentation complète (code + tests + intégration minimale) avec :

- Nouveau module : `project/client/src/game/input-manager.ts`
- Tests : `project/client/src/game/input-manager.test.ts`
- Intégration : mettre à jour `project/client/src/App.tsx` pour utiliser `InputManager` (et supprimer la gestion clavier ad-hoc P/M), afin de respecter “listeners uniques”.

Optionnel (uniquement si nécessaire) : ajouter de petites aides de typage (types exportés) sans refactor massif.

## Contraintes

- Ne pas ajouter de dépendances.
- TypeScript partout.
- Respecter les conventions : fichiers en `kebab-case`, fonctions `camelCase`.
- Ne pas introduire de logique de jeu dans les composants UI React.
- Le module doit être **testable sans DOM réel** : permettre d’injecter un `EventTarget` (ou un petit adaptateur) au lieu de dépendre directement de `window` dans les tests.
- Les toggles **P** et **M** doivent être déclenchés **une seule fois** par pression (ignorer `KeyboardEvent.repeat`).
- Ne pas bloquer la saisie utilisateur : si l’événement vient d’un élément éditable, ignorer.

## Contexte technique

### Existant pertinent

- `project/client/src/App.tsx`
  - Contient actuellement des raccourcis globaux P/M via un `window.addEventListener('keydown', ...)`.
  - Contient déjà une fonction utilitaire `isEditableTarget(target)` : elle doit rester vraie sémantiquement (tu peux la déplacer/partager si besoin).
- `project/client/src/game/game-engine.ts`
  - Fournit `togglePause()` (pause/reprise) et une boucle `requestAnimationFrame`.
- `project/client/src/storage/preferences.ts`
  - Persist `mute` et fournit des valeurs par défaut.

### Docs sources (à respecter)

- `docs/04-specification-fonctionnelle.md` → section “Contrôles (clavier)”
- `docs/07-guidelines-developpement.md` → section “Front-end : boucle de jeu et React” (inputs centralisés)

Docs complémentaires utiles (non ambiguës) :

- `docs/05-decisions-structurantes.md` → D-08 “Contrôles clavier uniquement (mapping fixé)”
- `docs/06-architecture-technique.md` → modules proposés (`InputManager`)
- `docs/08-qualite-tests-et-ux.md` → exigence “pas de touches perdues” + tests front recommandés (input mapping)

## Étapes proposées (sans pause intermédiaire)

1. Créer `InputManager` dans `project/client/src/game/input-manager.ts`.
2. Concevoir une API simple et testable :
   - état courant des inputs (déplacement + tir)
   - actions “one-shot” (toggle pause, toggle mute) consommables ou via callbacks
   - `attach()` / `dispose()` pour gérer l’enregistrement/désenregistrement des listeners
   - injection d’un `EventTarget` (par défaut `window` si disponible)
3. Ajouter des tests Bun dans `project/client/src/game/input-manager.test.ts` couvrant :
   - mapping WASD + flèches
   - espace = tir
   - `P` et `M` déclenchés une seule fois par pression (ignore `repeat`)
   - ignore quand target éditable
   - nettoyage `dispose()` : plus d’événements après
4. Intégrer dans `project/client/src/App.tsx` :
   - instancier `InputManager` une seule fois (ex: `useRef`)
   - brancher `P` sur `engine.togglePause()` + `dispatch({ type: 'TOGGLE_PAUSE' })` quand l’écran est `playing`/`paused`
   - brancher `M` sur `setPreferences(prev => ({...prev, mute: !prev.mute }))`
   - supprimer le listener global P/M existant pour garantir l’unicité

## Cas limites à gérer

- Le `EventTarget` n’est pas disponible (tests / environnement non navigateur) : l’API doit rester utilisable.
- Pressions simultanées (ex: `ArrowLeft` + `KeyA`) : l’état doit rester cohérent.
- Changement d’écran : éviter de toggler pause/mute en dehors des cas voulus.
- Conflits de touches : utiliser `KeyboardEvent.code` (recommandé) plutôt que `key` quand pertinent, afin d’éviter les variations de layout clavier.

## Critères de validation

- Fonctionnel :

  - Déplacement : flèches + WASD (état exposé par `InputManager`).
  - Tir : espace (état exposé par `InputManager`).
  - Pause : P toggle en jeu (fiable, pas de répétition).
  - Mute : M toggle immédiat, persistant (via préférences), sans casser l’UI.
  - Les touches ne sont pas “perdues” en usage normal.

- Tests :

  - `bun test` passe (au moins les nouveaux tests `input-manager.test.ts`).

- Typecheck :
  - `bun run typecheck` (depuis `project/`) passe.

## Clôture

- À la fin, cocher UNIQUEMENT la case de `id025` dans `TODO.md` (`- [ ]` → `- [x]`) **si et seulement si** :
  - tous les livrables sont présents,
  - tous les critères de validation ci-dessus sont satisfaits,
  - `bun test` et `bun run typecheck` passent.
- Ne cocher aucune autre tâche.
