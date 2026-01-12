# id028 (P0) (M) — Implémenter la difficulté (facile/normal/difficile) selon paramètres MVP

## Role

Tu es un développeur senior TypeScript (Bun) orienté gameplay, avec une approche "fonctions pures + tests".
Tu sais faire évoluer un moteur de jeu minimal sans coupler la simulation aux re-renders React.

## Objectif

Implémenter la difficulté **facile / normal / difficile** dans le client, conformément aux paramètres chiffrés actés.
La difficulté doit produire un impact **observable et testable** sur :

1. **Vitesse des ennemis** (multiplicateur sur les vitesses ennemies)
2. **Fréquence de tirs ennemis** (multiplicateur sur le cooldown de tir ennemi ; plus petit = plus difficile)
3. **Vies du joueur** (entier)

La difficulté sélectionnée dans les préférences (déjà persistée) doit être appliquée au démarrage d’une partie.

Rappel todo (source de vérité) :

- **id028** **(P0)** _(M)_ Implémenter la difficulté (facile/normal/difficile) selon paramètres MVP
  - But: Appliquer les presets validés
  - Livrable: règles (vitesse ennemis/cooldown tirs/vies)
  - Acceptation: facile/normal/difficile appliquent **0.75/1.00/1.30**, **1.35/1.00/0.75**, **4/3/2**
  - Dépendances: **id026**, **id019**

## Format de sortie

Livrer une implémentation complète (code + tests) en modifiant/ajoutant uniquement ce qui est nécessaire.

Attendus minimaux :

- Ajout d’un module dédié difficulté (ex: `project/client/src/game/difficulty.ts`) fournissant :
  - une fonction pure `difficultyParams(difficulty)` (ou équivalent)
  - une fonction pure `applyDifficultyToWorldConfig(baseConfig, difficulty)` (ou équivalent)
- Application effective de la difficulté lors du lancement d’une partie (construction du `WorldConfig` à partir des préférences).
- Tests Bun unitaires couvrant les trois axes (vitesse ennemis, cooldown tirs ennemis, vies joueur).

Optionnel (si c’est nécessaire pour rendre l’effet observable dans le moteur actuel) :

- Étendre la simulation pour rendre "cooldown tirs ennemis" et "vies" réellement actifs (tirs ennemis + collisions avec le vaisseau).

## Contraintes

- **Ne pas inventer de valeurs** : utiliser exclusivement les chiffres actés dans `clarifications/10-parametres-difficulte.md`.
- **TypeScript** partout.
- **Bun 1.3.5** (tests via `bun test`).
- Préférer les **fonctions pures** et déterministes ; si une part d’aléatoire est nécessaire (tirs ennemis), **injecter** une source de hasard (RNG) ou rendre le choix du tireur déterministe pour faciliter les tests.
- Respecter les conventions du repo : fichiers en `kebab-case`, fonctions `camelCase`.
- Ne pas coupler la boucle de jeu à React : pas de Three.js ou d’objets de simulation dans du state React.
- Ne pas faire de refactor massif hors périmètre.
- Pas d’écriture inclusive.

## Contexte technique

### Dépendances (déjà faites)

- `id019` : les préférences existent et incluent `difficulty`.
- `id026` : simulation de base (vaisseau/ennemis/bullets player + collisions) déjà présente.

### Sources de vérité (à respecter)

- `docs/04-specification-fonctionnelle.md` → section **5.1 Difficulté**
- `clarifications/10-parametres-difficulte.md` → **Décision (actée)**

Valeurs actées :

- Vitesse ennemis (mult) : **easy 0.75 / normal 1.00 / hard 1.30**
- Cooldown tirs ennemis (mult) : **easy 1.35 / normal 1.00 / hard 0.75**
- Vies joueur : **easy 4 / normal 3 / hard 2**

### Points d’ancrage code (indicatif)

- Préférences : `project/client/src/storage/preferences.ts`
- Simulation : `project/client/src/game/world-types.ts`, `project/client/src/game/world-sim.ts`
- Orchestration : `project/client/src/game/game-engine.ts`

## Étapes proposées (sans pause)

1. Créer un module `game/difficulty.ts` :

   - Définir un type `DifficultyParams` avec :
     - `enemySpeedMultiplier: number`
     - `enemyFireCooldownMultiplier: number`
     - `playerLives: number`
   - Implémenter `difficultyParams(difficulty)` (switch exhaustif sur `easy|normal|hard`).

2. Définir comment la difficulté s’applique au moteur :

   - Choisir une stratégie simple et testable : partir d’un `baseWorldConfig` (normal) et produire un `WorldConfig` dérivé.
   - Exemple (à adapter au code existant) :
     - `enemySpeedX = base.enemySpeedX * enemySpeedMultiplier`
     - `enemyFireCooldownMs = base.enemyFireCooldownMs * enemyFireCooldownMultiplier`
     - `initialLives = playerLives`

3. Rendre la difficulté effectivement utilisée :

   - À l’endroit où une partie est démarrée (UI → création/paramétrage du `GameEngine`), construire le `WorldConfig` à partir des préférences.
   - S’assurer que changer la difficulté depuis l’écran d’accueil puis démarrer une partie change bien la config utilisée.

4. Si nécessaire, rendre "cooldown tirs ennemis" et "vies" observables dans la simulation :

   - Étendre `WorldConfig` et `World` pour supporter :
     - un cooldown de tir ennemi
     - des bullets ennemies (owner `enemy`) et un mouvement vers le joueur
     - un compteur de vies joueur, décrémenté sur impact
   - Choisir un tireur déterministe (ex: l’ennemi vivant le plus proche en X du vaisseau, ou la colonne la plus basse) pour éviter l’aléatoire.
   - Ajouter un nouvel événement game over si besoin (ex: `ship_destroyed`).

5. Écrire/adapter les tests :
   - Tests unitaires du module difficulté (valeurs exactes par preset).
   - Test d’intégration léger : vérifier qu’un `WorldConfig` construit avec `easy|normal|hard` applique bien les trois effets.
   - Si tirs ennemis/vies sont implémentés, ajouter au moins 1 test prouvant :
     - `playerLives` initialisé correctement
     - un impact décrémente les vies et déclenche game over à 0

## Cas limites

- Préférences absentes/corrompues : `difficulty` doit être normalisé (déjà fait côté `preferences.ts`), donc le moteur doit supposer que la valeur est valide.
- Valeurs non finies / dt anormal : conserver les guards existants (pas de NaN).
- Changements de difficulté quand la partie est déjà en cours : décider un comportement simple (recommandé : appliquer au **prochain** `startNewGame()` uniquement).

## Critères de validation

- [ ] La difficulté provient des préférences et est appliquée quand la partie démarre.
- [ ] Les valeurs de difficulté sont strictement celles de `clarifications/10-parametres-difficulte.md`.
- [ ] Les trois effets sont couverts par des tests Bun (au minimum : `difficultyParams` + application à une config).
- [ ] `bun test` passe.
- [ ] `bun run typecheck` passe.
- [ ] Aucune modification hors périmètre (refactor massif, changements de conventions).

## Check-list d’exécution

Depuis `project/` :

- `bun test`
- `bun run typecheck`
- (si présent) `bun run lint`

## Clôture

- Ne coche la case de **id028** dans `TODO.md` (passer `- [ ]` à `- [x]`) **uniquement si** tous les livrables sont présents, que les critères de validation sont satisfaits, et que les commandes de validation passent.
- Ne coche aucune autre tâche.
