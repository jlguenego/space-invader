# Prompt — id019 (P0) (S) Implémenter le stockage local (pseudo, difficulté, sensibilité, mute)

## Role

Tu es un développeur senior TypeScript front-end (React + Vite) avec une approche “fonctions pures + tests”. Tu connais bien les contraintes navigateur (localStorage, erreurs en navigation privée) et tu sais concevoir une API de préférences stable, versionnée et testable avec Bun.

## Objectif

Implémenter le module de stockage local côté client (localStorage) pour conserver entre rechargements :

- le **pseudo** (optionnel)
- la **difficulté** (facile / normal / difficile)
- la **sensibilité** (faible / moyen / fort → 0.8x / 1.0x / 1.2x)
- l’état **mute** (bool)

Le module doit fournir une petite API typée (load/save/update) utilisée par l’UI, et être robuste (données corrompues, valeurs inconnues, localStorage indisponible).

Taille : _(S)_. Reste minimal et propre.

## Format de sortie

Créer/modifier uniquement le nécessaire dans `project/client` :

- Créer un module sous `project/client/src/storage/` (fichiers en **kebab-case**) qui expose :
  - les types (`Difficulty`, `Sensitivity`, `Preferences`)
  - les **valeurs par défaut**
  - `loadPreferences()` (ou équivalent) et `savePreferences()`
  - des helpers de normalisation/validation (pseudo trim + bornes)
  - une abstraction de stockage injectable (pour tests)
- Ajouter des tests Bun pour ce module (sans dépendre du DOM) :
  - stub de stockage en mémoire ou injection d’un `StorageLike`
- (Minimal) Mettre à jour `project/client/src/App.tsx` pour afficher/éditer les préférences et démontrer que le reload conserve bien l’état (UI très simple acceptée, pas de design à faire).

## Contraintes

- Respecter les décisions structurantes : TypeScript, Bun **1.3.5**, Vite, pas de refactor massif.
- Ne pas ajouter de dépendance lourde. Pas de lib de state management.
- Le code doit être **testable** en environnement Bun : ne pas référencer `window.localStorage` directement dans les tests (injecter une interface).
- Ne pas inventer de règles : utiliser les docs/clarifications citées ci-dessous.
- Le pseudo est **optionnel**. Si absent, le joueur est affiché **“Anonyme”**.
- Normaliser le pseudo côté client : `trim`, chaîne vide → “absent”, et limiter la longueur (recommandation projet : **24** caractères max).
- Versionner la donnée stockée (ex: `{ version: 1, ... }`) et être résilient aux anciennes/invalides.

## Contexte technique

Dépendances :

- Cette tâche dépend de **id018** (app React/Vite initialisée) — déjà en place.

Docs sources (à respecter) :

- `docs/04-specification-fonctionnelle.md`
  - Pseudo : optionnel, stocké navigateur, modifiable, absent → “Anonyme”
  - Réglages : difficulté (facile/normal/difficile), sensibilité (faible/moyen/fort)
  - Contrôles : mute toggle `M`
- `docs/06-architecture-technique.md`
  - Module `storage/` : localStorage (pseudo, difficulté, sensibilité, mute)
- `docs/07-guidelines-developpement.md`
  - Centraliser `mute` et persister la préférence
  - Validation `pseudo` (trim + longueur max recommandée ~24)
- `clarifications/04-details-score-et-sensibilite.md`
  - Sensibilité confirmée : 0.8x / 1.0x / 1.2x
- `clarifications/10-parametres-difficulte.md`
  - Difficulté : valeurs (facile/normal/difficile) et paramètres chiffrés (utile pour futurs `Rules`, mais ici on stocke au moins le choix)

Codebase (emplacements) :

- `project/client/src/storage/` (à implémenter)
- `project/client/src/App.tsx` (actuellement placeholder)

## Étapes proposées (à exécuter sans pause)

1. Définir les types et valeurs autorisées (en TS) :
   - `Difficulty` ∈ {`'easy'|'normal'|'hard'`} ou {`'facile'|'normal'|'difficile'`} (choisir et justifier en 1 ligne ; rester stable ensuite)
   - `Sensitivity` ∈ {`'low'|'medium'|'high'`} (ou labels FR), avec mapping vers multiplicateur 0.8/1.0/1.2
2. Définir un format de persistance versionné :
   - clé localStorage namespacée (ex: `space-invaders:prefs:v1`)
   - payload JSON `{ version: 1, pseudo: string|null, difficulty: ..., sensitivity: ..., mute: boolean }`
3. Implémenter :
   - `normalizePseudo(input: unknown): string | null` (trim, vide → null, longueur max 24)
   - `parsePreferences(json: string): Preferences` (fallback safe)
   - `loadPreferences(storage?: StorageLike): Preferences`
   - `savePreferences(prefs, storage?: StorageLike): void`
   - Comportement en erreur localStorage (throw quota, denied) : ne pas planter l’app, logger en `console.warn` (ou silencieux si vous préférez) et utiliser les defaults.
4. Ajouter des tests Bun (sans DOM) :
   - charge defaults si rien n’est stocké
   - persiste et recharge les valeurs
   - ignore/répare JSON invalide
   - normalise pseudo (espaces, trop long, vide)
   - refuse valeurs inconnues (difficulty/sensitivity) → fallback defaults
5. Mettre à jour `App.tsx` pour démontrer la persistance :
   - au montage : charger les prefs
   - contrôles simples (input pseudo, selects difficulté/sensibilité, checkbox mute)
   - à chaque changement : sauvegarder
   - afficher aussi la valeur “Anonyme” si pseudo absent

## Cas limites à couvrir

- localStorage indisponible (exception au get/set)
- JSON corrompu / partiel / version inconnue
- valeurs hors enum (difficulty/sensitivity)
- pseudo : `null`, number, string vide, string avec espaces, string > 24

## Critères de validation

- Les préférences (pseudo, difficulté, sensibilité, mute) sont conservées après un reload.
- Les valeurs sont validées/normalisées et ne peuvent pas casser l’app.
- Tests : `bun test` passe.
- Qualité : `bun run typecheck` passe et aucune erreur ESLint/format (si déjà câblés dans le repo).

## Clôture

- Cocher **uniquement** la case `id019` dans `TODO.md` (`- [ ]` → `- [x]`) si et seulement si :
  - tous les livrables sont présents,
  - tous les critères de validation ci-dessus sont satisfaits,
  - les commandes demandées passent.
- Ne pas cocher d’autres tâches.
