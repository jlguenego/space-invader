# id010 (P0) (M) — Initialiser l’app Express (socle) et la base `/api`

## Role

Tu es un développeur senior TypeScript spécialisé en **Bun** et **Express**, attentif à la robustesse des APIs (contrats stables), à la lisibilité du code et à l’outillage (scripts, tests). Tu respectes strictement la documentation du projet.

## Objectif

Implémenter le **socle serveur** (package `project/server`) :

- Une app **Express** exécutée via **Bun**
- Des routes sous la base **`/api`**
- Un **format d’erreur JSON stable**
- Un mode **production** qui **n’expose jamais de stacktrace**

Cette tâche prépare le terrain pour les tâches suivantes (timezone Europe/Paris, persistance JSON, endpoints scores/leaderboard) sans les implémenter.

## Rappel TODO (à intégrer)

- **But :** Fournir le socle serveur
- **Livrable :** app Express sous Bun + routes `/api` + erreurs JSON + mode prod sans stacktrace
- **Acceptation :** démarrage local OK et format d’erreur stable
- **Dépendances :** id006, id007
- **Docs sources :**
  - docs/06-architecture-technique.md → “Back-end (Express)”
  - docs/07-guidelines-developpement.md → “Gestion d’erreurs”
  - docs/05-decisions-structurantes.md → “D-03”, “D-19”

## Format de sortie

Produire (ou modifier) a minima :

- `project/server/package.json` : remplacer les scripts placeholder `id010` par des scripts fonctionnels
- `project/server/src/app.ts` : création de l’app Express (middlewares + router `/api`)
- `project/server/src/index.ts` : démarrage HTTP (lecture `PORT`, écoute, logs minimal)
- `project/server/src/routes/index.ts` (ou équivalent) : router racine `/api`
- Optionnel : `project/server/src/http/errorTypes.ts` / `errors.ts` pour centraliser le format d’erreur
- Tests Bun (`bun:test`) dans `project/server/src/**` ou `project/server/test/**` (selon conventions existantes du repo) couvrant le contrat d’erreur et le `/api` de base

## Contraintes

- Ne pas implémenter `POST /api/scores` ni `GET /api/leaderboard/day` (ce sera `id013`/`id014`). Ici, on pose le socle + base `/api`.
- Respecter la décision **Express** (D-03) et **Bun 1.3.5 verrouillée** (D-19).
- Code serveur en **TypeScript** et exécutable directement via Bun (pas de build TS→JS requis pour exécuter).
- Erreurs : respecter le contrat décrit dans docs/07-guidelines-developpement.md :
  - Réponse JSON cohérente : `{"ok": false, "error": { "code": "…", "message": "…" }}`
  - En prod : **aucune stacktrace exposée** au client
- API sous `/api`.
- Ne pas ajouter d’endpoint “healthcheck” dédié (cf. décision API minimale — le but ici est un socle et un ping minimal sous `/api` si nécessaire).

## Contexte technique (sources de vérité)

- Structure serveur cible (à adapter à la structure réelle du monorepo) :
  - docs/06-architecture-technique.md : principes back, structure proposée, contrat API v0 (base `/api`), validation d’entrée (à venir).
  - docs/07-guidelines-developpement.md :
    - routes sous `/api`
    - validation stricte (à venir)
    - **gestion d’erreurs** (format JSON + pas de stacktrace en prod)
  - docs/05-decisions-structurantes.md :
    - D-03 : Express
    - D-19 : Bun 1.3.5
- Monorepo : `project/scripts/dev.ts` lance `bun run dev` dans `project/server` ; tes scripts doivent donc être long-running en dev.
- Variables recommandées (utile pour ce socle) : docs/09-cicd-et-deploiement.md
  - `PORT`
  - `NODE_ENV=development|production`
  - (plus tard) `DATA_DIR`

## Analyse des dépendances

- **Bloquant** : id006/id007 sont déjà actées (structure monorepo + TS). Rien d’autre.
- **À stubber** : les routes métier (scores/leaderboard) peuvent rester absentes ; on veut uniquement une base `/api` et un gestionnaire d’erreur stable.

## Étapes proposées (séquence minimale)

1. Ajouter les dépendances serveur
   - Ajouter `express` au workspace `project/server`
   - Ajouter les types nécessaires (ex: `@types/express`) si utiles côté TS
2. Mettre en place `app.ts`
   - `express()`
   - JSON body parser avec **limite faible** (conforme guidelines)
   - Router monté sur `/api`
   - Un endpoint minimal sous `/api` (ex: `GET /api` → `{ ok: true }`) pour valider que la base `/api` est en place
   - Handler 404 (sous `/api` et/ou global) retournant le format d’erreur JSON
   - Middleware d’erreur Express (signature à 4 args) qui mappe les erreurs vers le format `{ ok:false, error:{code,message} }`
3. Mettre en place `index.ts`
   - Lire `PORT` (défaut raisonnable ex: 3000)
   - Démarrer l’écoute via `app.listen`
   - Afficher un log de démarrage (stdout)
4. Mode production (sans stacktrace)
   - Utiliser `NODE_ENV === 'production'` pour contrôler l’exposition d’informations
   - En prod : ne renvoyer **que** `code` et `message` (pas de stack, pas de détails internes)
5. Scripts `project/server/package.json`
   - `dev` : lancer le serveur en mode dev (idéalement avec watch Bun si disponible)
   - `build` : s’assurer que `bun run build` (monorepo) ne casse pas (ex: `bunx tsc -p ../tsconfig.json --noEmit` ou équivalent)
   - `test` : `bun test`
6. Ajouter des tests (bun:test)
   - Tester que `GET /api` répond bien
   - Tester qu’une route inconnue sous `/api` renvoie une erreur JSON au format attendu
   - Tester qu’en `NODE_ENV=production` la réponse d’erreur **ne contient pas** de stacktrace

## Détails attendus (contrat d’erreur)

Comme les docs imposent un format mais ne listent pas un catalogue de `code`, choisir un set **minimal et stable**, documenté dans le code, par exemple :

- `NOT_FOUND`
- `VALIDATION_ERROR` (utile ensuite)
- `INTERNAL_ERROR`

Important : les tests doivent figer ce contrat (format + codes choisis).

## Cas limites

- Payload JSON trop gros → erreur propre (HTTP 413 ou 400) au format JSON
- Route inconnue → 404 JSON stable
- Erreur levée par une route → 500 JSON stable
- `NODE_ENV=production` → pas de stacktrace / détails internes

## Critères de validation

- Le serveur démarre en local via les scripts monorepo : `bun run dev` depuis `project/` lance aussi le serveur.
- Un ping minimal sur `/api` fonctionne (ex: `GET /api` → `{ ok: true }`).
- Toute erreur renvoyée par l’API respecte :
  - forme `{"ok": false, "error": {"code": string, "message": string}}`
  - en prod (`NODE_ENV=production`) : **aucune stacktrace** n’est présente dans la réponse
- Les tests Bun ajoutés passent (`bun test`), au moins ceux couvrant `/api` et les erreurs.

## Clôture

- Une fois **tous** les livrables produits et **tous** les critères de validation vérifiés (tests/commandes inclus), cocher uniquement la tâche **id010** dans TODO.md en passant `- [ ]` à `- [x]`.
- Ne cocher aucune autre tâche.
