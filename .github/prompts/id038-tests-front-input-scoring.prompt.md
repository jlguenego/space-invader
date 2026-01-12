# id038 — (P1) (S) Ajouter des tests front sur fonctions pures (input/scoring)

## Role

Tu es un développeur TypeScript senior spécialisé en tests unitaires front (Bun test) pour un jeu web (React/Vite/Three.js/Howler). Tu écris des tests rapides, déterministes, sans E2E et sans dépendre de React.

## Objectif

Implémenter (ou compléter si déjà présents) des tests unitaires côté front qui valident :

- le mapping des inputs clavier (flèches + WASD, espace, P, M) via l’InputManager
- le scoring via des fonctions pures (barème, bonus, multiplicateurs, score final)

Le but est de sécuriser les règles : un changement involontaire de mapping ou de règles de scoring doit casser au moins un test.

## Format de sortie

Livrables attendus (au minimum) :

- Tests Bun dans le workspace client :
  - `project/client/src/game/input-manager.test.ts`
  - `project/client/src/game/scoring.test.ts`

Optionnel (uniquement si nécessaire pour tester proprement, et sans changer les règles) :

- Ajustements mineurs de code pour testabilité dans :
  - `project/client/src/game/input-manager.ts`
  - `project/client/src/game/scoring.ts`

Clôture (uniquement si tout est vert) :

- Cocher la case de la tâche `id038` dans `TODO.md` (`- [ ]` → `- [x]`). Ne coche aucune autre tâche.

## Contraintes

- Ne pas faire de tests E2E, pas de Playwright/Cypress.
- Tests rapides et déterministes : pas de dépendance au temps réel (utiliser des `nowMs` injectés / valeurs fixes).
- Ne pas coupler aux re-renders React et ne pas manipuler Three.js.
- Utiliser Bun (`bun test`) comme runner.
- Ne pas inventer de règles : les chiffres viennent des clarifications (bonus/multiplicateurs) et de la spec.
- Ne pas faire de refactor massif. Changements minimaux et ciblés.
- Écriture inclusive interdite.
- Mode autonome : tu exécutes la tâche de bout en bout (implémentation + tests + validations) sans demander de confirmations intermédiaires, sauf blocage réel.

## Contexte technique

### Dépendances (TODO)

- Dépend de `id025` (InputManager) et `id029` (scoring), déjà implémentés.

### Docs sources (TODO)

- `docs/08-qualite-tests-et-ux.md` → section "5.3 Front-end (recommandé)" et stratégie "fonctions pures"
- `docs/07-guidelines-developpement.md` → section "7. Tests (niveau MVP)" (tests front légers)

### Références utiles (code existant)

- Input : `project/client/src/game/input-manager.ts`
  - Points sensibles à tester :
    - mapping flèches + WASD
    - état "fire" sur espace (keydown/keyup)
    - actions edge-triggered : P et M seulement sur keydown non répété (`repeat=false`)
    - ignore quand la cible est éditable (input/textarea/select/contenteditable)
    - `dispose()` doit retirer les listeners
    - fallback `resolveCode()` si `KeyboardEvent.code` est absent (utilise `key`)
- Scoring : `project/client/src/game/scoring.ts`
  - Points sensibles à tester :
    - base kill + bonus par type d’ennemi
    - bonus de streak sur paliers (issus de `clarifications/08-bareme-bonus.md`)
    - multiplicateurs (type, valeur, durée) + ordre d’application (issus de `clarifications/09-multiplicateurs-declencheurs-durees.md`)
    - expiration : multiplier actif uniquement si `nowMs < untilMs` (borne `>=`)
    - arrondi : `Math.floor` sur les points multipliés
    - bonus de précision et seuils, et règle "bonus de précision non multiplié"

### Clarifications liées au scoring

Même si la tâche ne liste pas explicitement ces fichiers, les règles de scoring sont définies ici et doivent être la source de vérité chiffrée :

- `clarifications/08-bareme-bonus.md`
- `clarifications/09-multiplicateurs-declencheurs-durees.md`

## Étapes proposées (sans pauses)

1. État des lieux : vérifier si des tests existent déjà dans `project/client/src/game/` pour `InputManager` et `scoring`.
2. Compléter la couverture de tests pour attraper les régressions probables :
   - Input : ajouter au moins 1 test sur le fallback `KeyboardEvent.key` (quand `code` est vide), et 1 test sur la non-régression des touches P/M (pas de double-trigger sur `repeat`).
   - Scoring : ajouter des tests qui couvrent explicitement :
     - au moins un palier de streak > 5 (ex: 10 ou 20)
     - un multiplicateur différent de ceux déjà couverts (ex: chaque `EnemyType` déclenche son kind/durée attendus)
     - l’arrondi `Math.floor` (cas où le produit n’est pas entier)
     - les seuils de précision (0.7/0.8/0.9) + cas `shots=0`
3. Vérifier que les tests expriment clairement les règles (valeurs attendues en dur) pour que tout changement casse un test.
4. Exécuter les commandes de validation (voir section suivante).
5. Clôture : cocher `id038` dans `TODO.md` uniquement si tout passe.

## Cas limites à couvrir

- Input
  - Pressions simultanées (ex: ArrowLeft + KeyA) et relâchement partiel.
  - Ignorer la saisie quand l’event target est éditable.
  - Fallback `key` : par ex. `key=" "` → Space, `key="p"`/`"P"` → KeyP.
- Scoring
  - Expiration au moment exact `nowMs === untilMs`.
  - Un kill avec multiplicateur actif, puis remplacement par un nouveau multiplicateur.
  - Précision : cas limites aux seuils (>= 0.7, >= 0.8, >= 0.9) et cas sans tir.

## Critères de validation

- [ ] Les tests unitaires existent et couvrent input + scoring selon les sections "Front-end (recommandé)" et "Tests front légers".
- [ ] Un changement simple de règle (ex: valeur bonus, multiplicateur, mapping touche) ferait échouer au moins un test.
- [ ] `bun test` (à la racine `project/`) passe.
- [ ] `bun run typecheck` (à la racine `project/`) passe.
- [ ] Aucun test n’est flaky (pas de dépendance au temps réel).

## Commandes à lancer

Depuis `project/` :

- `bun test`
- `bun run typecheck`

Optionnel (pour itérer vite) :

- `bun test client/src/game/input-manager.test.ts`
- `bun test client/src/game/scoring.test.ts`

## Clôture

- Cocher `id038` dans `TODO.md` uniquement si tous les livrables sont présents et que tous les critères de validation sont satisfaits.
- Ne cocher aucune autre tâche.
