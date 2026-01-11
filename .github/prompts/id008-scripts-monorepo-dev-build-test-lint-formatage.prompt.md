# id008 — Mettre en place scripts monorepo (dev/build/test/lint) + formatage

## Role

Tu es un lead engineer TypeScript spécialisé en **Bun (1.3.5 verrouillée)**, monorepos et outillage (scripts dev/build/test/lint/format), avec une sensibilité CI GitHub Actions.

## Objectif

Réaliser la tâche **id008 (P0) (M)** : “Mettre en place scripts monorepo (dev/build/test/lint) + formatage”.

### Rappel TODO (source)

- **But :** Rendre le dev reproductible
- **Livrable :** scripts Bun (client+server) + config format (ex: Prettier) + intégration verrouillage Bun 1.3.5
- **Acceptation :** `dev` lance client+server et CI exécute lint/format+tests
- **Dépendances :** `id006`, `id007`
- **Docs sources :**
  - [docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Outillage & commandes”, “Style & format”
  - [docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Pipeline CI (proposition)”
  - [docs/05-decisions-structurantes.md](docs/05-decisions-structurantes.md) → “D-19”

## Format de sortie

### Clarifications (gate obligatoire)

Créer **uniquement** le fichier de clarifications suivant, puis **s’arrêter** (ne pas implémenter l’outillage tant que l’utilisateur n’a pas répondu) :

- `clarifications/13-scope-id008-outillage.md`

Le fichier doit utiliser exactement ce template (à copier-coller) :

---

# Clarifications — Scope & choix outillage (id008)

## Contexte

- TODO : **id008** — Mettre en place scripts monorepo (dev/build/test/lint) + formatage
- But : rendre le dev reproductible
- Dépendances : id006, id007
- Docs sources :
  - [docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md)
  - [docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md)
  - [docs/05-decisions-structurantes.md](docs/05-decisions-structurantes.md) (D-19)

## Questions

- Q1 — Périmètre de `id008` vis-à-vis de `id010` (serveur) et `id018` (client) ?

  - [ ] Option A — **Outillage uniquement** : créer scripts/configs monorepo, mais **ne pas initialiser** Vite/Express (impacts : `bun run dev` ne pourra être pleinement vérifié qu’après `id010`/`id018`).
  - [ ] Option B — **Stubs minimaux** : créer le minimum strict (ex: `package.json` + entrées minimales) pour que `bun run dev` démarre client+server **sans** implémenter l’API ni le gameplay (impacts : réduit le risque d’empiéter sur `id010`/`id018` mais nécessite des choix de stubs).
  - [ ] Option C — **Inclure l’initialisation des socles** : générer aussi le squelette Vite React TS et le socle Express (sans routes métier) pour rendre `dev/build` immédiatement vérifiables (impacts : `id010`/`id018` deviendront partiellement redondantes).
  - [ ] Autre : \_\_\_\_
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q2 — Quel couple lint/format retenir ?

  - [ ] Option A — **Prettier + ESLint** (classique TS, configurable finement)
  - [ ] Option B — **Biome** (format + lint intégré, config plus simple)
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q3 — Quel runner de tests pour garantir “CI exécute … + tests” dès maintenant ?

  - [ ] Option A — **Bun test** (simple, natif)
  - [ ] Option B — **Vitest** (écosystème front, snapshots, etc.)
  - [ ] Option C — Mix : Bun test (server) + Vitest (client)
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q4 — Où placer la “racine” d’outillage (configs lint/format/tsconfig) ?
  - [ ] Option A — Sous `project/` uniquement (aligné contrainte “tout le code/config de build sous project”, scripts CI doivent `cd project`)
  - [ ] Option B — À la racine du repo (plus standard pour CI, mais moins strict vs contrainte `project/`)
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

## Options proposées + impacts (résumé)

- Option “Outillage uniquement” : évite de toucher aux tâches `id010`/`id018`, mais l’acceptation “`dev` lance client+server” devient difficile à prouver tout de suite.
- Option “Stubs minimaux” : rend `dev` vérifiable sans implémenter l’API, mais nécessite de choisir des stubs (et donc de fixer le périmètre exact).
- Option “Init socles” : rend le pipeline complet testable rapidement, mais brouille le découpage des TODOs.

## Décision attendue / critères de décision

- Minimiser les recouvrements avec `id010`/`id018` tout en restant conforme à l’acceptation de `id008`.
- Préférer une solution cross-platform (Windows + Linux) et compatible Bun 1.3.5.

## Réponses

(À compléter par l’utilisateur)

---

## Contraintes

- ⚠️ Ne pas implémenter la tâche `id008` tant que le fichier de clarifications n’est pas créé **et** renseigné.
- Respecter les sources de vérité (docs/ et clarifications/), en particulier :
  - Bun **1.3.5 verrouillée** ([docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md), D-19 dans [docs/05-decisions-structurantes.md](docs/05-decisions-structurantes.md))
  - attentes CI (lint/format/tests) ([docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md))
- Ne pas cocher `TODO.md` à cette étape.

## Contexte technique

- Version Bun verrouillée : fichier `.bun-version` à la racine (actuellement `1.3.5`).
- CI existante : [/.github/workflows/tooling.yml](.github/workflows/tooling.yml) vérifie déjà Bun et le script `project/scripts/check-bun-version.sh`.
- Scripts existants :
  - `project/scripts/check-bun-version.ps1`
  - `project/scripts/check-bun-version.sh`

## Critères de validation

- Le fichier `clarifications/13-scope-id008-outillage.md` existe et suit le template ci-dessus.
- L’utilisateur a coché/complété des réponses pour Q1..Q4 (ou a choisi “Laisse l’IA choisir …”).
- Aucune autre modification n’est réalisée (pas de scaffolding Vite/Express, pas de configs lint/format, etc.) tant que les réponses ne sont pas fournies.

## Clôture

- Ne coche **pas** `- [ ] **id008**` dans `TODO.md` à ce stade.
- Une fois les réponses fournies, reprendre `id008` en appliquant ces décisions, puis ne cocher `id008` **uniquement** quand tous les livrables sont produits et tous les critères d’acceptation sont vérifiés.
- Ne coche aucune autre tâche.
