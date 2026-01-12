# Prompt — id030 — Ajouter un “polish” visuel (lisibilité + feedbacks)

## Role

Tu es un ingénieur TypeScript senior spécialisé en rendu temps réel (Three.js), UI React sobre et robuste, et gameplay “feel” (feedbacks visuels lisibles). Tu implémentes de bout en bout (code + tests + validations) dans un monorepo Bun.

## Objectif

Ajouter un “polish” visuel orienté **lisibilité** et **feedbacks** pour atteindre une qualité perçue MVP :

- HUD plus lisible et informatif (score + états clés)
- feedbacks visuels lors d’événements importants (hit / destruction)
- caméra cohérente et stable pendant l’action

## Format de sortie

### Code (front)

Mettre à jour le client dans `project/client/src/` pour fournir :

1. **HUD lisible**

   - score (déjà),
   - vies restantes,
   - état pause,
   - état mute.

2. **Feedbacks visuels** (sans post-processing lourd)

   - destruction d’ennemi visible (flash / explosion simple),
   - hit joueur visible (flash écran léger / secousse caméra légère / indication UI),
   - optionnel : tir joueur visible (muzzle flash / pulse léger), si faisable proprement.

3. **Caméra**
   - caméra stable et cohérente (pas de jitter),
   - cadrage qui favorise la lisibilité (ship + ennemis) ; une légère “follow” en X est acceptable si ça améliore la lecture.

### Tests

Ajouter/mettre à jour des tests Bun ciblés sur des fonctions pures (pas de snapshots lourds) :

- une logique de “FX state” (durées, expiration) si tu l’introduis,
- et/ou une logique de caméra (mapping world → camera pose),
- et/ou un formatage HUD (ex: lives clamp, labels).

### Mise à jour TODO (fin uniquement)

À la toute fin, cocher **uniquement** la case `id030` dans `TODO.md` si tous les critères de validation sont satisfaits.

## Contraintes

- Ne pas changer les décisions structurantes : React + Vite, rendu Three.js, boucle de jeu hors re-render React.
- Ne pas coupler la boucle de jeu au state React : conserver une boucle rAF côté engine/rendu, React sert à l’UI.
- Rester MVP : feedbacks simples, lisibles, performants.
- Performance (budget MVP) :
  - pas de post-processing par défaut,
  - conserver une scène “light” (matériaux partagés, géométries réutilisées),
  - éviter d’ajouter des draw calls inutiles.
- Accessibilité minimale UI : contraste suffisant, labels clairs, pas d’information uniquement par la couleur.
- Éviter les breaking changes inutiles dans l’API interne ; préférer des ajouts (nouveaux champs/callbacks) et garder le style existant.

## Contexte technique

### Tâche TODO

- ID : **id030**
- Priorité : **(P1)**
- Taille : **(M)**
- Titre : Ajouter un “polish” visuel (lisibilité + feedbacks)
- Dépendances : **id026**

### Docs sources (sources de vérité)

- `docs/00-contexte-et-vision.md` → “qualité visuelle”, “mesurer via critères concrets (fps, lisibilité, cohérence, feedbacks)”.
- `docs/08-qualite-tests-et-ux.md` → UX : principes (clarté, feedback, lecture HUD).

### État du code (points d’entrée probables)

- UI :
  - `project/client/src/ui/game-screen.tsx` (HUD actuel + viewport WebGL)
  - `project/client/src/ui/pause-overlay.tsx`
  - `project/client/src/ui/ui-kit.ts` (palette/styles)
- Rendu :
  - `project/client/src/render/three-renderer.ts` (création scène + rAF + rendu à partir de `getWorld()`)
- Monde/événements :
  - `project/client/src/game/world-types.ts` (notamment `WorldEvent`)
  - `project/client/src/game/world-sim.ts` (émet `events`)
  - `project/client/src/game/game-engine.ts` (consomme `events` mais ne les expose pas directement à l’UI)

## Analyse des dépendances

- `id026` est la base jouable (entités + collisions) : les événements `PLAYER_HIT` / `ENEMY_DESTROYED` / `GAME_OVER` existent côté simulation.
- Ce polish ne doit pas modifier les règles du jeu/scoring : uniquement rendre les événements plus visibles.

## Étapes proposées (sans pause)

1. HUD (UI)

   - Afficher **vies** (depuis `world.playerLives`) dans `GameScreen`.
   - Rendre l’état **pause** et **mute** plus visibles (badge, label, contraste).
   - Garder une UI simple via `ui-kit.ts`.

2. Exposer des “signaux” pour les FX

   - Option A (recommandée) : ajouter un callback optionnel `onWorldEvents?: (events: WorldEvent[], nowMs: number) => void` à `createGameEngine()` afin que l’UI/rendu puisse alimenter un petit système de FX.
   - Option B : stocker un “event buffer” dans l’engine avec une méthode `getRecentEvents()` (mais attention à ne pas faire fuiter la mémoire).

3. Implémenter un petit système de FX (testable)

   - Créer un module pur (ex: `project/client/src/render/fx-state.ts` ou `project/client/src/game/fx-state.ts`) :
     - entrée : événements + `nowMs`,
     - sortie : un `FxState` (explosions/hit flashes actifs avec `expiresAtMs`).
   - Garder des durées courtes et constantes (ex: 80–200ms) ; justifier si différent.

4. Brancher les FX dans Three.js

   - Dans `three-renderer.ts`, consommer `FxState` (via un `getFxState()` optionnel dans les options renderer, ou un objet mutable fourni au renderer).
   - Implémenter :
     - explosion simple (mesh sphère/cross + scale + fade via `material.opacity` + `transparent`),
     - ou flash sur l’ennemi à la frame de destruction.
   - Éviter d’allouer énormément par frame ; réutiliser des meshes si possible.

5. Caméra

   - Créer une fonction pure “camera pose” (ex: `computeCameraPose(world)`), testable.
   - Appliquer un smoothing simple (ex: interpolation) si nécessaire, sans jitter.

6. Tests + validations
   - Tests Bun sur :
     - expiration des FX,
     - mapping event → FX,
     - caméra : invariants (pas de NaN, clamp, stabilité).
   - Lancer : `bun test` et `bun run typecheck` depuis `project/`.

## Cas limites à gérer

- Pause : les FX ne doivent pas continuer à “tourner” de manière incohérente quand le jeu est en pause (rendu stoppé) ; au minimum, pas de crash et pas de fuite mémoire.
- Resize : le viewport peut changer de taille (déjà géré via `ResizeObserver`) ; ne pas casser.
- Monde non disponible : `getWorld` peut être absent au démarrage ; ne pas crasher.
- Performance : beaucoup d’ennemis détruits rapidement → les FX doivent rester bornés (cap ou pooling simple).

## Critères de validation

- HUD : en jeu, on voit au minimum **Score**, **Vies**, **Pause**, **Mute** de façon lisible.
- Feedbacks :
  - un ennemi détruit déclenche un feedback visuel évident,
  - un hit joueur déclenche un feedback visuel évident.
- Caméra : cadrage cohérent, pas de tremblement/jitter visible.
- Tests : `bun test` passe.
- Typecheck : `bun run typecheck` passe.
- Pas de régression : la pause stoppe bien la simulation et le rendu (comme avant).

## Check-list (commandes)

Depuis `project/` :

- `bun test`
- `bun run typecheck`

## Clôture

- Cocher la case de **id030** dans `TODO.md` (`- [ ]` → `- [x]`) **uniquement si** tous les critères de validation sont satisfaits et que les commandes de check passent.
- Ne cocher aucune autre tâche.
