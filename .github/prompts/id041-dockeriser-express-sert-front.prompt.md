# Prompt — id041 (P0) (M) — Dockeriser l’application (1 service Express servant le front)

## Role

Tu es un ingénieur logiciel senior spécialisé en conteneurisation Docker, Bun 1.3.5 et monorepos TypeScript. Tu sais produire des Dockerfiles reproductibles, compacts, cache-friendly, et cohérents avec une app Express qui sert un front Vite buildé.

## Objectif

Implémenter la tâche **id041** : **Dockeriser l’application** en **un seul service** (topologie A), où **Express sert l’API + le front buildé**, et où **le process tourne sous Bun (pas Node)**.

Rappel TODO (à reprendre tel quel dans l’implémentation) :

- **But :** Livrer un artefact prod Docker
- **Livrable :** `project/Dockerfile` (Bun runtime) + build Vite → assets statiques
- **Acceptation :** l’image sert UI+API et le process tourne sous Bun (pas Node)
- **Dépendances :** `id017`, `id018`
- **Docs sources :** `docs/09-cicd-et-deploiement.md` (Déploiement / option A) ; `docs/10-exploitation-et-maintenance.md` (cible de production)

## Format de sortie

Produire au minimum :

- `project/Dockerfile`

Optionnel (uniquement si utile et cohérent) :

- `project/.dockerignore` (pour accélérer le build et réduire la taille du contexte)
- Ajustements mineurs de doc (ex: `project/README.md`) si nécessaires pour expliquer build/run, sans changer le périmètre fonctionnel.

## Contraintes

- Runtime **obligatoire** : **Bun 1.3.5** (pas Node).
- Conserver la topologie A : **un seul service** Express sert aussi les assets du front buildé.
- Ne pas introduire d’architecture multi-services, ni de multi-instance (mono-instance en prod).
- Le front doit être buildé via Vite et servi statiquement.
- Ne pas changer les décisions structurantes (Bun/TS/Express/Vite).
- Ne pas “inventer” de règles produit (timezone Europe/Paris est déjà codée côté serveur et n’a pas à être une variable système).

## Contexte technique

### Monorepo et scripts

- Racine monorepo : `project/`
- Workspaces : `project/client`, `project/server` (cf. `project/package.json`)
- Build orchestré : `bun run build` (cf. `project/scripts/build.ts`) qui exécute :
  - `server` : `bunx tsc -p ../tsconfig.json --noEmit` (typecheck)
  - `client` : `vite build` (génère `client/dist`)

### Où Express attend le build front

- Le serveur (Express) sert le build SPA si `client/dist` existe.
- Par défaut, le dist est résolu à : **`<projectRoot>/client/dist`**.
- En conteneur, aligne le layout pour que le build finisse dans ` /app/client/dist` (ou adapte l’option `spa.distDir` si tu fais un choix différent, mais évite les modifications inutiles).

### Données persistantes (pour la suite id042)

- Le serveur lit `DATA_DIR` sinon utilise `process.cwd()/data`.
- En prod, le répertoire `server/data/` sera monté en bind mount via Compose (id042). Le Dockerfile ne doit pas empêcher ce montage.

### Références (Docs sources)

- `docs/09-cicd-et-deploiement.md` :
  - Option A : Express sert le front buildé.
  - Persistance via bind mount sur `server/data/`.
  - Variables runtime recommandées (`PORT`, `DATA_DIR`, `NODE_ENV=production`, etc.).
- `docs/10-exploitation-et-maintenance.md` :
  - Cible de production : 1 service, logs via stdout/stderr, données dans `server/data/`.

## Étapes proposées (exécution autonome)

1. Concevoir un `project/Dockerfile` orienté prod avec **Bun 1.3.5**.
2. Faire un build front (Vite) pendant la construction de l’image.
3. Préparer une image runtime qui démarre le serveur Bun/Express et sert `client/dist`.
4. Vérifier que le conteneur démarre correctement et sert :
   - `GET /api/*` (API)
   - `/` et routes SPA (front)
5. (Optionnel) Ajouter un `.dockerignore` pour éviter d’envoyer `node_modules`, `dist`, etc.

## Détails d’implémentation attendus

- Utiliser une image Bun officielle/standard en précisant **la version 1.3.5** (pin explicite).
- Recommander un Dockerfile multi-stage (build → runtime) pour limiter la taille finale.
- Dans l’étape build :
  - Copier d’abord les manifests/lock (`project/package.json`, `project/bun.lock`, `project/client/package.json`, `project/server/package.json`) pour profiter du cache.
  - Exécuter `bun install` à la racine `project/`.
  - Exécuter `bun run build` à la racine `project/` (génère `client/dist`).
- Dans l’étape runtime :
  - Conserver un layout compatible avec `server/src/app.ts` (dist par défaut en `client/dist`).
  - Démarrer le serveur via Bun (ex: `bun server/src/index.ts` ou `bun run` depuis `server/`).
  - Configurer `NODE_ENV=production`.
  - Exposer le port `PORT` (ou documenter le mapping) sans figer une valeur unique.

## Cas limites à traiter

- Le dist front doit exister dans l’image runtime : si absent, Express ne servira pas la SPA.
- L’application doit pouvoir écouter sur `0.0.0.0` en conteneur (par défaut `APP_BIND_HOST=0.0.0.0` côté serveur).
- Le conteneur ne doit pas échouer si `DATA_DIR` pointe vers un dossier monté (permissions) ; le serveur crée le dossier si nécessaire.

## Critères de validation

Checklist (à exécuter et reporter dans le compte-rendu) :

- [ ] `project/Dockerfile` existe et est lisible.
- [ ] L’image construite utilise **Bun 1.3.5** et ne dépend pas de Node pour exécuter le serveur.
- [ ] Le build inclut `client/dist` et Express sert le front buildé.
- [ ] Le conteneur répond :
  - [ ] `GET /api/leaderboard/day` (ou au minimum `GET /api`/health selon routes existantes)
  - [ ] `GET /` retourne l’HTML de la SPA
- [ ] Les logs serveur sortent bien sur stdout/stderr.
- [ ] Aucune modification hors-scope (pas de refactor massif).

Commandes de validation suggérées (adapter si besoin) :

- `cd project`
- `docker build -t space-invaders-mvp -f Dockerfile .`
- `docker run --rm -p 9999:3000 -e PORT=3000 -e NODE_ENV=production space-invaders-mvp`
  - Puis vérifier `http://localhost:9999/` et `http://localhost:9999/api/leaderboard/day`

## Clôture

- À la fin seulement, si **tous** les critères de validation ci-dessus sont satisfaits, modifier `TODO.md` en cochant uniquement la tâche `id041` : `- [ ]` → `- [x]`.
- Ne pas cocher d’autres tâches.
