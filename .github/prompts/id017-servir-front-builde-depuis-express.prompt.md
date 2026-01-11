# id017 — (P0) (S) Servir le front buildé depuis Express (topologie A)

## Role

Tu es un ingénieur full-stack TypeScript senior (Bun + Express + Vite), orienté fiabilité et tests. Tu connais les pièges classiques des SPA (fallback `index.html`, ordre des middlewares, cohabitation `/api` + assets statiques).

## Objectif

Implémenter la **topologie A** en production : une **seule app Express** sert :

- l’API sous `/api/*`
- le front React **buildé par Vite** (fichiers statiques) + un **fallback SPA** (`index.html`) pour les routes front

Le résultat doit permettre un déploiement “1 service UI+API” (CORS simplifié) tel que décrit dans la doc.

## Format de sortie

Modifier/créer le minimum de fichiers sous `project/server/src/`.

Livrables attendus :

- Mise à jour de l’app Express pour servir le build Vite (statics) + fallback SPA.
- Configuration du chemin vers le build front (répertoire `client/dist`) robuste (ne pas dépendre du `cwd`).
- Tests Bun/Express qui valident le comportement (API inchangée + SPA correctement servie).
- (Clôture) Cocher uniquement la case `id017` dans `TODO.md` si tous les critères de validation passent.

## Contraintes

- Ne pas changer les décisions structurantes : **Bun 1.3.5**, **TypeScript**, **Express**, **Vite**, **Europe/Paris**.
- Ne pas introduire de sur-scope (pas de reverse-proxy, pas de Docker ici, pas de refactor massif).
- Préserver le contrat d’erreurs JSON existant côté API.
- Le fallback SPA ne doit **jamais** intercepter `/api/*`.
- Éviter toute dépendance au fuseau horaire système (non concerné ici, mais ne pas casser le back).
- Pas d’écriture inclusive.

## Contexte technique

### Tâche TODO

- ID : **id017**
- Priorité/Taille : **(P0)** _(S)_
- Titre : **Servir le front buildé depuis Express (topologie A)**

But / Livrable / Acceptation (résumé fidèle) :

- **But :** Déployer 1 service UI+API
- **Livrable :** statics du build front + fallback SPA
- **Acceptation :** une seule origine en prod (CORS simplifié)

### Dépendances

- **Bloquantes :** id010, id018
  - Socle Express déjà en place.
  - App Vite côté client déjà initialisée et buildable.

### Docs sources (à lire avant de coder)

- `docs/09-cicd-et-deploiement.md` → section “Option A (simple) : Express sert aussi le front”
- `docs/06-architecture-technique.md` → “Artefacts” (front build Vite `client/dist`) + principes back
- `clarifications/12-vite.md` → Bun/Vite, exécution sous Bun

### État actuel du code (points importants)

- Le serveur est dans `project/server/src/` et expose l’API sous `/api` via `createApiRouter()`.
- Aujourd’hui, `createApp()` termine par un **404 JSON global**. En topologie A, il faut conserver le 404 JSON pour `/api/*` mais servir le front pour les routes UI.
- Le build Vite produit par défaut un dossier `project/client/dist/` (Vite default) ; la config `project/client/vite.config.ts` est actuellement minimale.

## Étapes proposées (à exécuter sans pause)

1. Ajouter une résolution robuste du chemin vers le build front (`project/client/dist`) : utiliser `import.meta.url` + `fileURLToPath` + `path.resolve`, pas `process.cwd()`.
2. Brancher le service statique : `express.static(distDir, …)` (assets + `index.html`).
3. Ajouter un fallback SPA : pour les requêtes `GET`/`HEAD` hors `/api/*` qui ne matchent aucun fichier statique, renvoyer `index.html`.
4. Adapter le comportement 404 :
   - `/api/*` garde les erreurs JSON (contrat existant)
   - le reste est géré par le front (fallback) ou un 404 HTML (si tu choisis de distinguer)
5. Écrire des tests Bun pour valider :
   - `/api` répond toujours JSON `{ ok: true }`
   - `/api/unknown` répond 404 JSON
   - `/` sert `index.html` (Content-Type HTML)
   - `/some/spa/route` sert aussi `index.html`
   - un fichier statique présent est servi tel quel

Astuce test : comme `client/dist` n’est pas forcément présent pendant les tests, rends le `distDir` **injectable** dans `createApp()` (option) et, dans les tests, crée un dossier temporaire avec un `index.html` + un asset (ex: `assets/test.txt`).

## Critères de validation

Checklist :

- `bun test` (depuis `project/`) passe.
- L’API existante reste inchangée :
  - `GET /api` → 200 JSON
  - routes `/api/*` non trouvées → 404 JSON au format existant
- Le serveur peut servir le build front :
  - `GET /` → `index.html`
  - `GET /route-front-qui-nexiste-pas` → `index.html` (fallback SPA)
  - `GET /assets/<file>` (ou équivalent) → fichier statique
- Le fallback SPA ne casse pas `/api/*`.

## Clôture

- Ne cocher **que** `id017` dans `TODO.md`, et uniquement si :
  - tous les livrables sont présents,
  - tous les critères de validation sont respectés,
  - les tests/commandes passent.
- Ne pas cocher d’autres tâches.
