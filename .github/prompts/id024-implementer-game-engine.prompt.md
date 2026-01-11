# Prompt — id024 — (P0) (M) Implémenter `GameEngine` (running/paused/gameover)

## Role

Tu es un développeur front senior TypeScript spécialisé en architectures de jeu temps réel dans le navigateur (boucle `requestAnimationFrame`, séparation simulation/rendu/React), avec une approche orientée tests (Bun).

## Objectif

Implémenter le module `GameEngine` côté front pour gérer l’état temps réel du jeu avec une state machine **running / paused / gameover** et une mise à jour basée sur le delta time (`dt`).

Le moteur doit être **découplé de React** (pas de dépendance aux re-renders) et doit permettre à l’UI de :

- démarrer/arrêter une partie,
- mettre en pause/reprendre via **P**,
- déclencher un **game over** qui bascule l’UI vers l’écran de fin (avec le score final).

> Contexte TODO (source de vérité)

- **id024** **(P0)** _(M)_ Implémenter `GameEngine` (running/paused/gameover)
  - **But :** Séparer simulation vs UI
  - **Livrable :** module `game/` (update dt + state machine)
  - **Acceptation :** P fige/reprend, game over déclenche l’écran fin
  - **Dépendances :** id023
  - **Docs sources :**
    - docs/06-architecture-technique.md → “GameEngine” + séparation UI↔jeu
    - docs/04-specification-fonctionnelle.md → “Pause / Fin de partie”

## Format de sortie

Produire une implémentation complète (code + tests + wiring minimal UI) dans le monorepo sous `project/`.

Fichiers attendus (minimum) :

- `project/client/src/game/game-engine.ts` (nouveau) — API du moteur + state machine + loop (ou loop optionnelle)
- `project/client/src/game/game-engine.test.ts` (nouveau) — tests unitaires Bun sur les transitions d’état et le gel en pause

Fichiers probablement modifiés pour brancher le moteur (selon ton design) :

- `project/client/src/App.tsx` — retirer le score simulé par `setInterval` et piloter l’UI via le moteur
- `project/client/src/ui/game-screen.tsx` — enlever le bouton “Game over” si tu le remplaces par un mécanisme moteur, ou le conserver en le branchant au moteur (mode debug acceptable MVP)
- `project/client/src/render/three-renderer.ts` — uniquement si nécessaire pour que la pause arrête aussi le rendu (sinon le moteur doit au moins geler la simulation)

## Contraintes

- Respecter les décisions structurantes et conventions (voir AGENTS.md et docs/) :
  - TypeScript partout.
  - Nommage fichiers en `kebab-case`.
  - Bun 1.3.5, tests via `bun test`.
  - Ne pas coupler la boucle de jeu aux re-renders React.
  - Ne pas stocker des objets Three.js dans le state React.
- Ne pas ajouter de dépendances externes sauf nécessité forte (justifier brièvement si tu en ajoutes une).
- Ne pas implémenter `InputManager` ici (c’est id025). Tu peux garder un pont temporaire depuis l’UI pour appeler pause/reprise, mais l’API du moteur doit être compatible avec l’arrivée future d’un `InputManager`.

## Contexte technique

État du code pertinent :

- UI state machine : `project/client/src/ui/ui-state-machine.ts`
  - `TOGGLE_PAUSE` et `GAME_OVER` existent déjà.
  - `playing/paused` portent un `score`.
- UI actuelle : `project/client/src/App.tsx`
  - Pause/mute via listeners globaux.
  - Le score est simulé avec un `setInterval` quand `uiState.screen === 'playing'`.
- Rendu : `project/client/src/render/three-renderer.ts`
  - Fournit un runtime `start/stop/resize/dispose` et sa propre boucle `requestAnimationFrame`.

Objectif d’architecture (docs/06) :

- Le `GameEngine` porte l’état temps réel (entités, tirs, collisions, score…).
- L’UI React ne fait que refléter l’état et envoyer des commandes (start/pause/resume/stop).
- Le pont UI↔jeu se fait via callbacks/events (ex: `onGameOver(finalScore)`), sans dépendre du rendu React.

## Design attendu (directive)

Conçois le moteur pour être testable :

- Sépare une logique “pure” (state machine + `step(dtMs)`) de l’orchestration (rAF, timers).
- Les tests ne doivent pas dépendre de `requestAnimationFrame`.

Suggestion d’API (tu peux adapter, mais garde l’intention) :

- `createGameEngine(options)` retourne un objet avec :
  - `getState(): { status: 'idle' | 'running' | 'paused' | 'gameover'; score: number; finalScore?: number }`
  - `startNewGame()`
  - `togglePause()` ou `pause()/resume()`
  - `triggerGameOver()` (debug acceptable) ou `endGame()`
  - `step(dtMs: number)` (pour tests) — no-op si paused/gameover
  - (optionnel) `startLoop()` / `stopLoop()` pour rAF
- Callbacks optionnels :
  - `onScoreDelta(amount)` ou `onScoreChanged(score)`
  - `onStateChanged(nextState)`
  - `onGameOver(finalScore)`

Exigence clé : quand l’état est `paused`, **le score et la simulation n’évoluent pas**.

## Étapes proposées (séquence minimale)

1. Créer `project/client/src/game/game-engine.ts` avec une state machine explicite et une fonction `step(dtMs)`.
2. Écrire `project/client/src/game/game-engine.test.ts` :
   - transitions `start → running`, `running → paused`, `paused → running`, `running/paused → gameover`.
   - `step()` n’a aucun effet en pause.
   - robustesse sur `dtMs` invalides (NaN, négatif, trop grand) : clamp raisonnable.
3. Brancher dans `project/client/src/App.tsx` :
   - remplacer le `setInterval` de score par le moteur (score mis à jour via callback → `dispatch({ type: 'INCREMENT_SCORE', amount })` ou via une action dédiée si tu ajoutes une action).
   - sur `P`, appeler le moteur (et garder l’UI en sync via `TOGGLE_PAUSE`).
   - sur game over, déclencher `dispatch({ type: 'GAME_OVER' })` quand le moteur signale la fin.
4. (Optionnel mais recommandé) Geler aussi le rendu Three.js pendant la pause :
   - soit via un prop `paused` sur `GameScreen` qui appelle `runtime.stop()`/`runtime.start()`,
   - soit via une orchestration moteur si tu centralises la loop.

## Cas limites à gérer

- Appuis répétés sur P (idempotence / toggling stable).
- `GAME_OVER` depuis `paused` (la spec autorise la fin de partie depuis pause).
- `dtMs` très grand (onglet inactif) : clamp pour éviter de “sauter” trop loin.
- Nettoyage : s’assurer qu’une nouvelle partie repart à score 0 et que les callbacks/loops ne doublent pas.

## Critères de validation

- Code :
  - Le score n’est plus incrémenté par un `setInterval` dans React ; la simulation appartient au moteur.
  - En pause (P), la simulation est figée (au minimum le score), et reprend correctement.
  - Un game over déclenché par le moteur bascule l’UI vers `game-over` avec le bon `finalScore`.
- Tests :
  - `bun test` passe à la racine `project/`.
  - Les tests nouvellement ajoutés couvrent les transitions d’état et le gel en pause.
- Respect des conventions : fichiers `kebab-case`, TypeScript, pas d’objets Three.js dans le state React.

## Clôture

- Ne coche la case `id024` dans `TODO.md` (`- [ ]` → `- [x]`) **que si** :
  - tous les livrables ci-dessus sont présents,
  - tous les critères de validation sont satisfaits,
  - `bun test` passe.
- Ne coche aucune autre tâche.
