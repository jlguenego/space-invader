# id021 — (P0) (S) Intégrer l’API côté client (`POST /api/scores`, `GET /api/leaderboard/day`)

## Role

Tu es un développeur TypeScript senior orienté qualité (front React/Vite) avec une forte rigueur sur les contrats HTTP, la gestion d’erreurs et les tests unitaires Bun.

## Objectif

Remplacer l’usage des stubs côté client par de vrais appels HTTP vers l’API du serveur Express :

- `POST /api/scores` pour enregistrer un score en fin de partie.
- `GET /api/leaderboard/day` pour afficher le top 10 du jour.

L’intégration doit respecter le contrat API v0, produire des erreurs lisibles côté UI, et garantir que l’échec réseau n’empêche pas de rejouer.

## Format de sortie

Implémenter les livrables suivants dans le workspace `project/client` :

- Un module `services/` non-stub pour appeler l’API et gérer les erreurs (fetch, parsing JSON, mapping erreurs → messages UI).
- Remplacement dans l’app (actuellement dans `App.tsx`) des imports `*.stub.ts` par les vrais services.
- Ajustement du dev server Vite si nécessaire pour que les appels à `/api/...` fonctionnent en dev (proxy recommandé).
- Tests Bun pertinents côté client (unitaires) pour valider :
  - parsing des réponses `ok: true` / `ok: false`,
  - messages d’erreur “non techniques” sur erreurs réseau ou HTTP.

Fichiers attendus (tu peux ajuster les noms si tu respectes les conventions du repo) :

- `project/client/src/services/api-client.ts` (ou équivalent)
- `project/client/src/services/scores-service.ts`
- `project/client/src/services/leaderboard-service.ts`
- Mise à jour de `project/client/src/App.tsx`
- Mise à jour éventuelle de `project/client/vite.config.ts`
- Tests : `project/client/src/services/*.test.ts` (ou placement cohérent)

## Contraintes

- Ne pas changer les décisions structurantes : Bun 1.3.5, TypeScript, API sous `/api`, classement “du jour” Europe/Paris.
- L’UI doit rester jouable même si l’enregistrement du score échoue (dégradation gracieuse) : rejouer doit fonctionner.
- Messages d’erreur côté UI : en français, non techniques (ex: “Impossible d’enregistrer le score, réessaie plus tard”).
- Ne pas introduire de dépendances lourdes sans nécessité. Si tu ajoutes une dépendance, justifie-la brièvement.
- Respecter les conventions de nommage : fichiers `kebab-case`, fonctions `camelCase`.
- Ne pas modifier d’autres tâches du TODO. Ne cocher que `id021` et uniquement en clôture si tout est vert.

## Contexte technique

### Dépendances (TODO)

- Dépend de : `id020` (UI/écrans), `id013` (POST scores), `id014` (GET leaderboard)
- Ces dépendances sont déjà implémentées côté serveur ; tu dois t’aligner sur leur comportement réel.

### Docs sources (à suivre)

- `docs/06-architecture-technique.md`
  - Contrat API v0 : `POST /api/scores` et `GET /api/leaderboard/day`
  - Le dossier `services/` côté client est l’emplacement cible
- `docs/08-qualite-tests-et-ux.md`
  - Exigence : erreurs réseau non bloquantes, message clair

### Contrats et formats (serveur)

- Base API : `/api`

`POST /api/scores`

- Body JSON : `{ score: number, pseudo?: string | null }`
- Règles serveur :
  - `score` doit être `number` fini et `>= 0`, sinon `400 VALIDATION_ERROR`.
  - `pseudo` :
    - `undefined | null | string vide/whitespace` → “Anonyme”
    - `string` trim
    - longueur max `24` sinon `400 VALIDATION_ERROR`
- Réponse `201` (succès) : `{ ok: true, saved: { id, createdAt, dayKeyParis, pseudo, score } }`

`GET /api/leaderboard/day`

- Réponse `200` :
  ```json
  {
    "timezone": "Europe/Paris",
    "dayKeyParis": "YYYY-MM-DD",
    "entries": [{ "rank": 1, "pseudo": "Anonyme", "score": 99999 }]
  }
  ```

Erreurs API (format JSON)

- Le serveur renvoie des erreurs JSON sous la forme :
  ```json
  {
    "ok": false,
    "error": {
      "code": "VALIDATION_ERROR|NOT_FOUND|PAYLOAD_TOO_LARGE|INTERNAL_ERROR",
      "message": "..."
    }
  }
  ```

### État actuel côté client

- Les stubs sont ici :
  - `project/client/src/services/scores-service.stub.ts`
  - `project/client/src/services/leaderboard-service.stub.ts`
- Ils sont utilisés dans `project/client/src/App.tsx`.
- Le reducer UI gère déjà des états d’erreur :
  - `scoreSave: { status: 'error', message }`
  - `leaderboard: status 'error' + errorMessage`

### Dev (Vite + serveur)

- En dev, `bun run dev` lance `server` (port 3000 par défaut) et `client` (Vite).
- Le serveur n’expose pas de CORS actuellement : privilégie un proxy Vite pour router `/api` vers `http://127.0.0.1:3000`.

## Étapes proposées (sans pauses)

1. Créer un petit client HTTP (`api-client.ts`) :
   - base URL relative (`/api`) pour rester compatible prod (same-origin quand Express sert le build).
   - helper `requestJson<T>()` qui :
     - fait `fetch`,
     - parse la réponse JSON,
     - distingue erreurs réseau vs erreurs HTTP,
     - expose une erreur typée (ex: `ApiClientError`) avec un `kind` (`network` | `http`) et, si présent, `apiErrorCode`.
2. Implémenter `saveScore()` et `getDailyLeaderboard()` dans `services/` en s’alignant sur les types de `ui-state-machine` (`LeaderboardDay`).
3. Remplacer dans `App.tsx` l’usage des stubs par les vrais services.
4. Ajouter (si nécessaire) un proxy Vite :
   - `server: { proxy: { '/api': 'http://127.0.0.1:3000' } }`.
5. Ajouter des tests Bun côté client :
   - tests unitaires sur le mapping d’erreurs → messages UI,
   - tests sur parsing des réponses `ok: false`.
   - évite les tests E2E ; privilégie des fonctions pures testables.

## Cas limites à couvrir

- Réseau indisponible / serveur non joignable : message clair, pas de crash.
- Réponse non-JSON ou JSON invalide (rare mais possible) : traiter comme erreur générique.
- `POST /api/scores` renvoie `400 VALIDATION_ERROR` : message clair (même si en pratique cela ne doit pas arriver avec un score calculé localement).
- `GET /api/leaderboard/day` vide : afficher la liste vide (pas une erreur).

## Critères de validation

- Fonctionnel
  - Le flow “Game Over → Enregistrer score” appelle bien `POST /api/scores`.
  - En cas d’échec (réseau/500), l’écran fin de partie affiche un message clair et le bouton rejouer fonctionne.
  - Le flow “Ouvrir classement” appelle bien `GET /api/leaderboard/day` et affiche les entrées.
- Qualité / tests
  - `bun test` passe (au minimum dans `project/client`, idéalement à la racine `project`).
  - `bun run typecheck` passe depuis `project/`.
- Dev ergonomique
  - `bun run dev` permet au client d’appeler `/api/...` en dev (proxy si nécessaire).

## Clôture

- Cocher la case `- [ ]` → `- [x]` uniquement pour **id021** dans `TODO.md` si et seulement si :
  - tous les livrables sont présents,
  - tous les critères de validation ci-dessus sont satisfaits,
  - les tests/commandes passent.
- Ne cocher aucune autre tâche.
