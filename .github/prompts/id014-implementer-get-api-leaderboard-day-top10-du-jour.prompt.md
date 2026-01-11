# Role

Tu es un développeur TypeScript senior, orienté qualité, expert en API Express sous Bun et en tests Bun.

# Objectif

Implémenter l’endpoint back-end **`GET /api/leaderboard/day`** qui renvoie le **top 10 du jour** basé sur **Europe/Paris**, en s’appuyant sur la persistance JSON existante (repository + mutex) et le calcul de `dayKeyParis` déjà implémenté.

Tâche TODO ciblée : **id014 (P0) (M)** — _Implémenter `GET /api/leaderboard/day` (top 10 du jour)_

- **But :** fournir le top 10 du jour.
- **Livrable :** endpoint filtre `dayKeyParis` + tri desc + cap 10.
- **Acceptation :** réponse contient `timezone`, `dayKeyParis`, `entries` rangées.
- **Dépendances :** **id011**, **id012** (doivent déjà être présentes).
- **Docs sources :**
  - [docs/06-architecture-technique.md](../../docs/06-architecture-technique.md) → “6.2 GET /api/leaderboard/day”, “Gestion du fuseau Europe/Paris”, “Stratégie d’écriture”
  - [docs/04-specification-fonctionnelle.md](../../docs/04-specification-fonctionnelle.md) → “Classement (top 10 du jour)”, “Top 10 du jour (Europe/Paris)”
  - (qualité) [docs/08-qualite-tests-et-ux.md](../../docs/08-qualite-tests-et-ux.md) → “Tests: GET /api/leaderboard/day”

# Format de sortie

Produire une implémentation complète (code + tests) côté serveur.

- Créer le routeur : `project/server/src/routes/leaderboard.ts`
- Enregistrer la route dans l’API : `project/server/src/routes/index.ts`
- Ajouter des tests : `project/server/src/routes/leaderboard.test.ts`
- Mettre à jour `TODO.md` : cocher **uniquement** la case `id014` **si et seulement si** tous les critères de validation sont remplis et les tests passent.

# Contraintes

- Ne pas changer les décisions structurantes : Bun 1.3.5, TypeScript, Express, persistance JSON mono-instance, timezone **Europe/Paris** explicite.
- Respecter le contrat d’erreurs JSON existant via `AppError` + middleware dans `project/server/src/app.ts`.
- Ne pas introduire de nouvelle dépendance sans nécessité. (Luxon est déjà présent pour `dayKeyParis` dans le serveur, via id011.)
- Implémentation minimaliste et testable : fonctions courtes, tri/filtre déterministes.
- Écriture inclusive interdite.
- Exécution autonome : réaliser la tâche de bout en bout (code + tests + vérifications) sans demander de validations intermédiaires.
- Ne pas cocher d’autres tâches du `TODO.md`.

# Contexte technique

## API existante

- L’app Express est dans `project/server/src/app.ts` avec :
  - `express.json({ limit: '10kb' })`
  - middleware d’erreurs qui renvoie toujours un JSON `{ ok:false, error:{code,message} }`
- Le router `/api` est construit dans `project/server/src/routes/index.ts`.
  - Il instancie un `repo` via `createScoreRepository()`.
  - Il enregistre déjà `POST /api/scores` via `registerScoresRoutes()`.

## Persistance / repository

- `ScoreRepository` expose `readAll()` et `append()` : `project/server/src/storage/score-repository.ts`.
- Le fichier JSON contient `scores[]` avec `ScoreEntry` comprenant `dayKeyParis` (format `YYYY-MM-DD`).

## Timezone / dayKey

- Les helpers existent dans `project/server/src/domain/time-service.ts` (id011), notamment une fonction pour obtenir une clé `dayKeyParis` à partir d’une date (ou d’un ISO UTC).
- Pour le classement “du jour”, la clé doit correspondre à **la journée courante au sens Europe/Paris**.

## Contrat attendu (docs)

Réponse `200` (extrait doc architecture) :

```json
{
  "timezone": "Europe/Paris",
  "dayKeyParis": "2026-01-10",
  "entries": [{ "rank": 1, "pseudo": "Anonyme", "score": 99999 }]
}
```

Notes :

- `entries` doit contenir **au plus 10** éléments.
- Les entrées doivent être **triées par score décroissant**.
- `rank` commence à 1 et suit l’ordre dans `entries`.

# Étapes proposées

1. Créer `registerLeaderboardRoutes(router, { repo, timeService })` (ou uniquement `{ repo }` si le timeService est importé directement) dans `project/server/src/routes/leaderboard.ts`.
2. Implémenter le handler `GET /leaderboard/day` :
   - calculer `dayKeyParis` “aujourd’hui” (Europe/Paris) via la fonction id011,
   - `await repo.readAll()` puis filtrer `scores` sur `dayKeyParis`,
   - trier par `score` décroissant,
   - appliquer un tie-breaker **déterministe** si nécessaire (ex: `createdAt` puis `id`) afin d’éviter des tests flakys,
   - prendre les 10 premiers,
   - mapper en `{ rank, pseudo, score }`.
3. Enregistrer la route dans `project/server/src/routes/index.ts` à côté de `registerScoresRoutes`.
4. Ajouter des tests Bun dans `project/server/src/routes/leaderboard.test.ts` en réutilisant le pattern de `project/server/src/routes/scores.test.ts` :
   - lancer un serveur sur port 0,
   - isoler la persistance via un `DATA_DIR` temporaire,
   - préparer des scores en appelant `POST /api/scores` (ou en écrivant via `repo` si c’est plus simple),
   - valider : filtre par `dayKeyParis`, tri desc, cap à 10, champs `timezone/dayKeyParis/entries`.
5. Lancer les commandes de validation et ne cocher `id014` dans `TODO.md` qu’en fin de tâche si tout est vert.

# Cas limites à couvrir

- Aucun score pour le jour courant : `entries` doit être `[]` (pas d’erreur).
- Scores présents sur plusieurs jours : seuls ceux du `dayKeyParis` courant sont retenus.
- Plus de 10 scores : cap strict à 10.
- Égalités de score : ordre déterministe (choisi et justifié brièvement).
- Erreur I/O ou JSON corrompu : doit remonter en `500` via le middleware (sans exposer de stacktrace en prod).

# Critères de validation

Checklist (tout doit être vrai) :

- [ ] `GET /api/leaderboard/day` répond `200` avec un JSON conforme : `timezone`, `dayKeyParis`, `entries`.
- [ ] `entries` est triée par `score` décroissant et contient `rank` (1..n), `pseudo`, `score`.
- [ ] Filtrage strict sur la journée courante Europe/Paris.
- [ ] Cap à 10 entrées.
- [ ] Les tests `project/server/src/routes/leaderboard.test.ts` couvrent filtre/tri/cap et passent.
- [ ] `bun test` (depuis `project/`) passe.

# Clôture

- Si (et seulement si) tous les critères de validation sont satisfaits et les tests passent, modifier `TODO.md` pour cocher `- [ ] **id014**` → `- [x] **id014**`.
- Ne cocher aucune autre tâche.
