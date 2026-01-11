# AGENTS.md — Guide de prise en main (Copilot / VS Code)

Ce dépôt décrit et implémente un MVP de **Space Invaders web** :

- Front : **React + Vite**, rendu **3D WebGL via Three.js**, audio **Howler.js**.
- Back : **Express**, exécution **Bun**, persistance **fichiers JSON**.
- Classement : **top 10 du jour** basé sur **Europe/Paris**.

Les sources de vérité fonctionnelles/techniques sont dans `docs/` (et `clarifications/`). Le code exécutable et la config sont dans `project/`.

---

## 1) TL;DR (pour un agent)

- Lis d’abord `docs/06-architecture-technique.md`, `docs/07-guidelines-developpement.md`, `docs/04-specification-fonctionnelle.md`, puis `TODO.md`.
- Ne change pas les décisions structurantes : **Bun 1.3.5**, **TypeScript**, **Three.js**, **Howler**, **JSON mono-instance**, **Europe/Paris**.
- Implémente petit, teste vite : privilégier fonctions pures + tests Bun.
- Évite d’“inventer des règles” : scoring/difficulté/multiplicateurs viennent des clarifications.

---

## 2) État actuel du dépôt

- Monorepo sous `project/` (workspaces `client` + `server`).
- **Serveur** : socle Express + contrat d’erreurs JSON + tests de base déjà présents.
- **Client** : structure de dossiers posée mais **app React/Vite non initialisée** (scripts placeholder).
- La roadmap “exécutable” est dans `TODO.md` (IDs `id010+`).

---

## 3) Commandes (Bun 1.3.5)

Depuis `project/` :

- Installer : `bun install`
- Dev (orchestre server + client) : `bun run dev`
- Build (orchestre server puis client) : `bun run build`
- Tests : `bun test`
- Typecheck : `bun run typecheck`
- Lint : `bun run lint`
- Format : `bun run format` / `bun run format:check`

Vérifier la version de Bun :

- Windows : `powershell -ExecutionPolicy Bypass -File project/scripts/check-bun-version.ps1`
- macOS/Linux : `project/scripts/check-bun-version.sh`

Remarque : tant que `project/client` n’est pas initialisé, `bun run dev` lancera le serveur et échouera/affichera un message côté client (placeholder).

---

## 4) Cartographie rapide

### 4.1 Dossiers

- `docs/` : référentiel (vision → archi → qualité → CI/CD → exploitation)
- `clarifications/` : décisions chiffrées (bonus, multiplicateurs, difficulté, etc.)
- `project/` : code et config
  - `project/client/` : front (cible React/Vite)
  - `project/server/` : back Express
  - `project/scripts/` : orchestration monorepo

### 4.2 Points d’entrée (server)

- `project/server/src/index.ts` : démarrage, `PORT` (défaut 3000), `APP_BIND_HOST` (défaut `0.0.0.0`)
- `project/server/src/app.ts` : app Express, JSON body limit `10kb`, middleware d’erreurs
- `project/server/src/routes/index.ts` : route `/api` (health minimal), 404 JSON
- Contrat d’erreurs : `project/server/src/http/errors.ts`

### 4.3 API attendue (MVP)

Base `/api` :

- `POST /api/scores` : enregistre un score (anti-triche simple accepté)
- `GET /api/leaderboard/day` : renvoie le top 10 du jour (Europe/Paris)

Voir `docs/06-architecture-technique.md` pour le contrat.

---

## 5) Contraintes produit (à ne pas casser)

- Plateforme : **desktop uniquement**.
- Contrôles clavier :
  - Déplacement : flèches + WASD
  - Tir : espace
  - Pause : P
  - Mute : M
- Identité : pseudo optionnel, sinon **"Anonyme"**.
- Classement : **top 10 du jour**, reset à minuit **Europe/Paris**.
- Anti-triche : **modèle simple accepté** (score envoyé par le client).

Sources : `docs/04-specification-fonctionnelle.md`, `docs/05-decisions-structurantes.md`.

---

## 6) Conventions d’implémentation

### 6.1 Style

- TypeScript partout.
- Nommage : fichiers `kebab-case`, classes `PascalCase`, fonctions `camelCase`.
- Préférer des fonctions courtes et testables.

### 6.2 Front (quand initialisé)

- Ne pas coupler la boucle de jeu aux re-renders React.
- Ne pas stocker des objets Three.js dans le state React.
- Centraliser les listeners clavier (InputManager).
- Rendu : `requestAnimationFrame`, simulation via `delta time`.
- Audio : gérer l’"audio unlock" après interaction utilisateur.

### 6.3 Back

- Validation stricte : `score` number et `>= 0`, `pseudo` optionnel, `trim`, longueur max.
- Réponses d’erreur JSON cohérentes (déjà en place via `AppError`).
- Ne jamais exposer de stacktrace en prod.

---

## 7) Persistance & timezone (points sensibles)

### 7.1 Persistance JSON (mono-instance)

Attendu (MVP) :

- Mutex en mémoire (sérialiser les écritures)
- Écriture atomique : `scores.json.tmp` puis rename vers `scores.json`
- Données dans `project/server/data/` (bind mount en prod)

### 7.2 "Jour" Europe/Paris

- `dayKeyParis` doit être calculé explicitement en `Europe/Paris`.
- `createdAt` reste en UTC (ISO 8601).
- Tests attendus sur les transitions heure d’été/hiver.

Recommandation doc : utiliser une lib robuste de timezone (ex: Luxon) plutôt que dépendre du TZ système.

---

## 8) Déploiement (MVP)

Cible : VPS OVH (Linux), Docker/Compose, **mono-instance**, persistance via bind mount.

- HTTPS : Nginx sur le host + Let’s Encrypt/Certbot (HTTP-01)
- Ports : 80/443 ouverts, proxy vers l’app sur `127.0.0.1:9999`

Variables recommandées :

- `NODE_ENV=production`
- `PORT` (interne app)
- `DATA_DIR` (chemin data)
- `APP_BIND_HOST` (`127.0.0.1` en prod si Nginx host)
- `APP_PORT=9999` (si standardisé côté infra)

Sources : `docs/09-cicd-et-deploiement.md`, `docs/10-exploitation-et-maintenance.md`.

---

## 9) "Prompting" Copilot (templates utiles)

### 9.1 Template — implémenter un item de TODO

Copier-coller dans Copilot Chat, puis ajuster :

- Objectif : implémenter TODO `id0xx`.
- Contexte : respecter `docs/06-architecture-technique.md` + `docs/07-guidelines-developpement.md`.
- Contraintes : Bun 1.3.5, TS, Europe/Paris explicite, JSON atomic write + mutex.
- Livrables : fichiers à créer/modifier (liste) + tests Bun associés.
- DoD : endpoints conformes au contrat + tests verts (`bun test`) + `bun run typecheck`.

### 9.2 Template — ajouter un endpoint API

- Ajouter route sous `project/server/src/routes/`.
- Utiliser `AppError` pour les erreurs et garder le format JSON.
- Ajouter tests dans `project/server/src/*.test.ts` (start server sur port 0 et `fetch`).

### 9.3 Template — changement gameplay/règles

- Commencer par une fonction pure (ex: scoring) + tests.
- Brancher ensuite la boucle de jeu.
- Vérifier que les valeurs viennent de `clarifications/` (pas d’invention).

---

## 10) Non-objectifs (anti-scope creep)

Ne pas introduire sans demande explicite :

- Auth/comptes, anti-triche avancée, mobile/tactile/manette.
- Multiples instances serveur (contradictoire avec persistance fichier mono-instance).
- Refactor massif hors du périmètre TODO en cours.
