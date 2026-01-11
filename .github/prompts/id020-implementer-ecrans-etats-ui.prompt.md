# Prompt — id020 (P0) (M) — Implémenter les écrans/états UI (Accueil/Jeu/Pause/Fin/Classement)

## Role

Tu es un ingénieur logiciel senior spécialisé en **TypeScript + React (Vite)**, avec une forte expérience en **state machines UI** et en architecture front orientée jeu (séparation UI React vs boucle temps réel).

## Objectif

Implémenter la tâche **id020 (P0) (M)** : **écrans/états UI** couvrant le parcours MVP : **Accueil → Jeu → Pause → Fin de partie → Classement (top 10 du jour)**.

Le résultat doit permettre de dérouler le flux complet **sans dépendre encore de Three.js/GameEngine (id023+) ni de l’intégration API réelle (id021)**.

## Format de sortie

Modifier/créer du code uniquement dans `project/client/`.

Livrables attendus :

- Mise à jour de `project/client/src/App.tsx` pour devenir le **shell UI** piloté par une **state machine**.
- Ajout de composants d’écran dans `project/client/src/ui/` (fichiers en `kebab-case`).
- Ajout d’un module **pur** de state machine/réducer (testable) dans `project/client/src/ui/`.
- Ajout d’au moins **un test Bun** sur la logique pure de navigation/états (pas de test DOM requis).
- Mise à jour de `TODO.md` : cocher **uniquement** la case de **id020** à la toute fin et seulement si tout est validé.

## Contraintes

- Respecter les décisions structurantes : **Bun 1.3.5**, **TypeScript**, **React + Vite**, et la structure modulaire proposée.
- Ne pas implémenter Three.js, GameEngine, InputManager, scoring ou audio : ces sujets sont couverts par d’autres TODO (id023+ / id031+ / id029).
- Ne pas intégrer l’API réelle (`POST /api/scores`, `GET /api/leaderboard/day`) : c’est la tâche **id021**. Pour id020, tu peux créer un **stub** local (ex: promesse simulée) pour matérialiser “Enregistrer le score” et “Voir le top 10”.
- Conserver la persistance des préférences via `storage/preferences.ts` (id019) : pseudo, difficulté, sensibilité, mute.
- Contrôles clavier (contrainte produit) : flèches/WASD, espace, P, M. Dans id020, tu dois au minimum gérer **P** (pause) et **M** (mute) au niveau du shell UI, sans empêcher l’intégration future d’un `InputManager` centralisé.
- Messages et libellés : pas d’écriture inclusive.
- Style : fichiers `kebab-case`, fonctions `camelCase`, composants `PascalCase`.

## Contexte technique

### Dépendances (TODO)

- Dépend de **id018** (React/Vite initialisé) et **id019** (préférences localStorage) — déjà présents.
- **id021** viendra ensuite pour brancher l’API réelle : ton design doit faciliter le remplacement du stub par un vrai service.

### Sources de vérité (Docs sources id020)

- `docs/04-specification-fonctionnelle.md` → section “6. Écrans / états” :
  - Accueil : démarrer, pseudo/anonyme, réglages (difficulté, sensibilité), contrôles.
  - En jeu : score en cours, indicateur mute, pause (P), mute (M).
  - Pause : pause/reprise via P.
  - Fin de partie : score final, rejouer, enregistrer score, voir top 10.
  - Classement : top 10, pseudo ou “Anonyme”, reset “jour” Europe/Paris.
- `docs/02-parcours-et-experience.md` → parcours 1/3/4 et exigences UX (messages clairs, non techniques).

### Architecture & conventions

- `docs/06-architecture-technique.md` → “Front-end (React)”, “Modules proposés”, “Gestion des états”.
- `docs/07-guidelines-developpement.md` → règles “boucle de jeu vs React”, conventions de nommage.

### Fichiers existants à respecter

- `project/client/src/App.tsx` : actuellement une démo de préférences ; à refactor en shell UI.
- `project/client/src/storage/preferences.ts` : source de vérité prefs (pseudo/difficulté/sensibilité/mute + normalisation).
- `project/client/src/ui/` : dossier existant (vide).

## Analyse des dépendances (ce qui peut être stubé)

- Gameplay réel : stub.
  - Proposition minimale : un “jeu simulé” qui a un score qui évolue (ex: compteur) et un bouton “Game over”.
  - Le but est de valider les transitions d’écrans et l’ergonomie, pas de faire la boucle de jeu.
- Classement : stub.
  - Afficher un top 10 factice (ex: 3–10 entrées) et une mention “du jour (Europe/Paris)”.
  - Préparer une interface de service (ex: `LeaderboardService`) qui sera implémentée en vrai dans id021.

## Étapes proposées (à exécuter sans demander de validation intermédiaire)

1. Définir une **machine d’états UI** (type discriminé + reducer + actions) : `home`, `playing`, `paused`, `game-over`, `leaderboard`.
2. Refactor `App.tsx` :
   - Charger/enregistrer les préférences via `loadPreferences` / `savePreferences`.
   - Router vers le bon écran via la state machine.
   - Gérer les raccourcis globaux `P` (toggle pause seulement si en jeu) et `M` (toggle mute via préférences).
3. Créer les composants dans `src/ui/` :
   - `home-screen.tsx` (démarrer, pseudo, réglages, contrôles visibles)
   - `game-screen.tsx` (HUD score en cours + indicateur mute + aide touches)
   - `pause-overlay.tsx` (overlay pause, reprise via P + bouton)
   - `game-over-screen.tsx` (score final, actions : rejouer, enregistrer, voir classement)
   - `leaderboard-screen.tsx` (top 10 factice + retour accueil)
4. Créer un petit stub “services” pour id020 :
   - soit dans `src/services/` (ex: `leaderboard-service.stub.ts`, `scores-service.stub.ts`),
   - soit local au `App.tsx` mais idéalement séparé pour faciliter id021.
   - Le stub doit simuler succès/échec d’enregistrement (pour préparer l’UX non bloquante, sans faire id036).
5. Ajouter un test Bun sur le reducer (ex: transitions `START_GAME`, `TOGGLE_PAUSE`, `GAME_OVER`, `OPEN_LEADERBOARD`, `GO_HOME`).
6. Vérifier build/typecheck/tests.
7. Clôture : cocher **uniquement** `id020` dans `TODO.md` si tout est vert.

## Cas limites à couvrir

- Pseudo vide → afficher “Anonyme” (conforme aux specs).
- `P` :
  - ne doit pas mettre en pause depuis l’accueil/fin/classement,
  - doit basculer `playing ↔ paused`.
- `M` : toggle mute persistant (via préférences) et indicateur visible en jeu.
- “Enregistrer le score” :
  - en succès : afficher un retour clair,
  - en échec : afficher un message clair et permettre de rejouer (ne pas bloquer l’UI).

## Critères de validation

Checklist à satisfaire avant de cocher la case :

- [ ] Le flux complet fonctionne : Accueil → Jeu → Pause → Fin de partie → (Enregistrer) → Classement.
- [ ] Les préférences (pseudo/difficulté/sensibilité/mute) restent persistées via `localStorage` (id019).
- [ ] `P` met en pause et reprend uniquement pendant le jeu.
- [ ] `M` toggle mute et l’état est visible en jeu.
- [ ] La state machine est **pure/testée** (au moins 1 test Bun passe).
- [ ] Commandes OK :
  - [ ] Depuis `project/` : `bun test`
  - [ ] Depuis `project/` : `bun run typecheck`
  - [ ] Optionnel manuel : `bun run dev` puis vérifier le parcours.

## Clôture

- Mets à jour `TODO.md` en remplaçant **uniquement** la case de `id020` de `- [ ]` à `- [x]` **si et seulement si** tous les livrables sont présents et tous les critères de validation ci-dessus sont satisfaits.
- Ne coche aucune autre tâche.
