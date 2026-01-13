# id044 — Ajouter GitHub Actions CI (install, lint/typecheck, tests, build, artefact)

## Role

- Ingénieur DevOps/CI expert Bun 1.3.5, TypeScript monorepo (workspaces client/server), GitHub Actions et cache.
- Capable d’automatiser lint/typecheck/tests/build, de produire un artefact téléchargeable, et de sécuriser la version Bun.

## Objectif

- Mettre en place un workflow CI GitHub Actions qui installe les dépendances, vérifie la version Bun (1.3.5), exécute lint + typecheck, lance les tests, construit le projet, et publie un artefact buildé.
- La CI doit échouer sur PR/push si version Bun ou vérifications échouent.

## Format de sortie

- Fichier workflow GitHub Actions (ex: `.github/workflows/ci.yml`).
- Éventuels ajouts mineurs de scripts/config nécessaires pour faire passer la CI (en cohérence avec le monorepo).
- Documentation courte en commentaire du workflow si nécessaire (succincte, ASCII).

## Contraintes

- Priorité **P0**, taille **M**. Respecter le périmètre de la tâche uniquement.
- Outillage verrouillé : **Bun 1.3.5** (voir D-19) ; TypeScript partout.
- Monorepo sous `project/` : commandes à lancer depuis `project/` (root du package.json). Scripts dispo : `bun run lint`, `bun run typecheck`, `bun test`, `bun run build`, `bun run format:check`.
- Utiliser GitHub Actions (pas d’autre CI) ; activer sur push main et PR vers main (cf. pipeline proposé).
- Cache des dépendances Bun attendu (répertoire `.bun` / lockfile `bun.lockb`).
- Publication d’artefact (zip) après build complet (front+back) ; inclure au minimum les sorties de build (ex: `client/dist`, `server/...` selon build) ; éviter d’inclure `node_modules`/`.bun`.
- ASCII only. Pas d’écriture inclusive. Ne pas modifier d’autres tâches du TODO.
- Autonomie : réaliser la tâche de bout en bout sans demander de validation utilisateur, sauf passage par le gate Clarifications si bloqué.

## Contexte technique

- Tâche source : [TODO.md](TODO.md#L240-L258) — **id044 (P0, M)** « Ajouter GitHub Actions CI (install, lint/typecheck, tests, build, artefact) » — But/Livrable/Acceptation/Dépendances listés.
- Docs sources :
  - Pipeline CI proposé : [docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md#L50-L120) — déclencheurs PR/push, étapes Install → Lint/Typecheck → Tests back → Build front → Build back → Artefact.
  - Décision Bun 1.3.5 : [docs/05-decisions-structurantes.md](docs/05-decisions-structurantes.md#L130-L180) (D-19).
- Monorepo : `project/package.json` déclare `packageManager: bun@1.3.5`, workspaces `client` + `server`. Build orchestré via `bun run build` (script `project/scripts/build.ts`).

## Analyse des dépendances

- Dépendances déclarées : id008, id037.
  - id037 est cochée (tests back sensibles présents) → pas bloquant.
  - id008 (non listée comme faite ici) : vérifier si elle impacte la CI ; si non disponible, la CI doit rester cohérente avec l’état actuel (ne pas inventer de steps hors périmètre).
- Pas d’autres blocs en attente avant cette implémentation.

## Étapes proposées (indicatives)

1. Créer le workflow `.github/workflows/ci.yml` avec triggers `pull_request` vers main et `push` sur main.
2. Job unique (ou jobs séparés si pertinent) sur Ubuntu-latest :
   - Check out.
   - Set up Bun 1.3.5 (ex: `oven-sh/setup-bun` avec version pinée).
   - Cache `.bun` et éventuellement `project/node_modules` si nécessaire (mais éviter doublons, privilégier cache Bun).
   - `bun --version` gate pour s’assurer de 1.3.5 (fail sinon).
   - `bun install` dans `project/` (respecter lockfile, workspace-aware).
   - `bun run format:check` (si jugé pertinent avec pipeline proposé), `bun run lint`, `bun run typecheck`.
   - `bun test` (root `project/`).
   - `bun run build` (root `project/`).
3. Publier un artefact : zip minimal contenant le résultat buildé (ex: `project/client/dist`, output back si généré) ; exclure dépendances.
4. Optionnel : séparation jobs (lint/test/build) avec `needs` si gain de clarté ; sinon job unique séquentiel pour simplicité.
5. Ajouter/adapter badges ou doc minimal si nécessaire (non requis hors workflow).

## Cas limites / points d’attention

- S’assurer que toutes les commandes se font depuis `project/` (sinon workspace non résolu).
- Ne pas oublier le typecheck (`bun run typecheck`) séparé du lint.
- Si build back produit uniquement TS exécutable par Bun (sans output), artefact peut se limiter au front + sources nécessaires selon script build ; respecter structure actuelle.
- `bun install` doit respecter le lockfile `bun.lockb` si présent ; éviter `--frozen-lockfile` si non compatible, mais signaler si nécessaire.
- Actions doivent échouer proprement si Bun ≠ 1.3.5 ou si une étape échoue.
- Garder les versions d’actions pinées (ex: `actions/checkout@v4`, `oven-sh/setup-bun@v1`, `actions/cache@v4`, `actions/upload-artifact@v4`).

## Check-list commandes/tests à exécuter dans le workflow

- `bun --version` (attendu 1.3.5)
- `bun install`
- `bun run format:check` (si conservé)
- `bun run lint`
- `bun run typecheck`
- `bun test`
- `bun run build`
- Publication artefact (zip)

## Critères de validation

- Triggers : PR vers main et push sur main actifs.
- CI échoue si Bun n’est pas en 1.3.5 ou si lint/typecheck/tests/build échouent.
- Cache Bun fonctionnel pour accélérer (clé tenant compte de `bun.lockb`).
- Artefact buildé disponible au terme du workflow (zip, sans dépendances inutiles).
- Steps alignés avec la proposition de pipeline CI et décisions D-19.
- Aucune régression sur les commandes locales (`bun run ...`).

## Clôture

- À la fin, vérifier que tous les critères de validation sont satisfaits et que le workflow passe localement si possible.
- Cocher la case de la tâche dans [TODO.md](TODO.md#L240-L258) **uniquement** si tous les livrables et critères sont remplis et que les commandes CI passent ; ne pas cocher d’autres tâches.

## Gate Clarifications (si blocage)

Si une règle indispensable manque ou reste ambiguë après lecture des docs sources, **arrêter l’exécution** et créer un fichier `/clarifications/NN-<slug>.md` (NN = prochain numéro dispo, slug court). Contenu attendu :

- Contexte (rappel de la todo id044 + liens vers docs sources).
- Questions numérotées avec QCM (cases `- [ ]`) incluant toujours une option « Laisse l’IA choisir pour toi (avec justification) » et « Je ne sais pas / besoin d’une recommandation » ; proposer option « Autre : \_\_\_\_ » si utile.
- Pour chaque option, résumer l’impact en 1–2 lignes.
- Décision attendue / critères de décision.
- Section Réponses (vide) à compléter par l’utilisateur.
  Reprendre ensuite la todo uniquement après réponses dans ce fichier.
