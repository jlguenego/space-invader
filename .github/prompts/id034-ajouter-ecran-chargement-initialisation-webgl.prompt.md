# TODO Prompt — id034 (P0) (S) — Ajouter un écran de chargement/initialisation WebGL

## Role

Tu es un développeur senior TypeScript spécialisé en React + Vite, Three.js/WebGL et UX de produits interactifs. Tu sais concevoir des états d’attente robustes (chargement, erreurs, fallback) sans coupler la boucle de jeu aux re-renders React.

## Objectif

Implémenter un écran de chargement/initialisation WebGL visible au démarrage, afin d’expliciter l’état d’attente pendant :

- le chargement des assets (au minimum ceux nécessaires au démarrage),
- l’initialisation du rendu WebGL / Three.js.

Le résultat doit éviter l’« écran noir » au lancement et rendre l’état compréhensible (copy non technique).

## Format de sortie

Produire une implémentation prête à l’emploi (code + tests) dans le client.

Livrables attendus (adapter les chemins au code existant) :

- Un composant UI d’overlay de chargement (ex: `project/client/src/ui/loading-overlay.tsx` ou équivalent existant).
- Un mécanisme d’orchestration d’initialisation (ex: hook/service) qui expose un état simple : `idle/loading/ready/error`.
- Intégration dans l’entrée applicative (ex: `project/client/src/App.tsx` ou le shell UI existant).
- Tests Bun pertinents (priorité : fonctions pures et logique d’état) dans `project/client/src/**.test.ts`.

Le prompt vise un résultat “end-to-end tout d’un coup” : implémentation, tests, validation via commandes, et mise à jour finale de `TODO.md` (cocher uniquement si tout est OK).

## Contraintes

- Ne pas modifier les décisions structurantes (Bun, TypeScript, Three.js, Howler, etc.).
- Ne pas coupler la boucle de jeu à des re-renders React : l’overlay doit être piloté par un état minimal et stable.
- Ne pas stocker des objets Three.js dans le state React.
- Garder une UI simple, claire, non technique.
- Respecter le style du dépôt : fichiers en `kebab-case`, code TypeScript, modules courts et testables.
- Ne pas inventer de règles non documentées : si un point est ambigu, se référer aux docs sources.
- Ne pas cocher d’autres tâches du `TODO.md`.

## Contexte technique

Tâche TODO :

- **id034** **(P0)** _(S)_ Ajouter un écran de chargement/initialisation WebGL
  - But: Expliciter l’état d’attente
  - Livrable: overlay “chargement” (assets + WebGL)
  - Acceptation: état visible au démarrage
  - Dépendances: id023, id020

Docs sources à lire avant de coder (sources de vérité) :

- `docs/04-specification-fonctionnelle.md` → section “Chargement / erreurs”
- `docs/08-qualite-tests-et-ux.md` → section “États d’attente”

Contexte repo utile :

- Entrées UI : `project/client/src/main.tsx`, `project/client/src/App.tsx`
- Rendu/engine : `project/client/src/render/`, `project/client/src/game/`
- Tests : présents sous `project/client/src/**.test.ts` et exécutés via `bun test`.

## Analyse des dépendances

- **id023** (bloquant) : doit fournir un point d’entrée/initialisation côté client (app shell, wiring du rendu) pour accrocher l’état de chargement.
- **id020** (bloquant) : doit fournir le flux UX principal (menu → jeu, ou boot UI) ; l’overlay doit s’intégrer sans contredire ce flux.

Si une dépendance n’existe pas sous la forme attendue, adapter l’intégration au code existant sans créer de refactor massif.

## Étapes proposées (à exécuter sans pause)

1. Lire les docs sources et repérer l’attendu exact côté UX (texte, transitions, erreurs).
2. Identifier le “moment” où WebGL/Three.js est initialisé (ou doit l’être) et les points de chargement d’assets critiques.
3. Définir un modèle d’état minimal (ex: `BootState`) et une petite API (ex: `createBootController()` / `useBootState()`), testable sans DOM.
4. Implémenter l’overlay UI et le brancher à l’état.
5. Intégrer l’orchestration dans `App` (ou un shell équivalent), avec un comportement par défaut : overlay visible jusqu’à `ready`.
6. Ajouter des tests unitaires (état et transitions) et un test d’intégration léger si faisable.
7. Lancer les commandes de validation (voir section ci-dessous) et corriger jusqu’au vert.

## Cas limites à couvrir

- Chargement très rapide : l’overlay ne doit pas clignoter de façon agressive (si une stratégie anti-flicker existe dans le codebase, la réutiliser ; sinon rester minimal).
- Erreur d’initialisation WebGL : ne pas planter silencieusement ; exposer un état `error` (le contenu UX détaillé sera traité plus loin, notamment par id035).
- Assets manquants : afficher un état d’attente cohérent et basculer en `error` si l’échec est détectable.
- Rechargement (HMR/dev) : ne pas bloquer le dev ; comportement stable au refresh.

## Critères de validation

Checklist de succès :

- [ ] Au démarrage, un overlay “chargement/initialisation” est visible (pas d’écran noir).
- [ ] L’overlay disparaît uniquement quand l’initialisation WebGL et le minimum requis est prêt.
- [ ] La logique d’état est testée (tests unitaires Bun) et couvre les transitions principales.
- [ ] `bun test` passe.
- [ ] `bun run typecheck` passe.

Commandes à exécuter depuis `project/` :

- `bun test`
- `bun run typecheck`

## Clôture

- Si et seulement si tous les critères de validation sont satisfaits, modifier `TODO.md` et cocher uniquement la tâche **id034** : `- [ ]` → `- [x]`.
- Ne pas cocher d’autres tâches.
