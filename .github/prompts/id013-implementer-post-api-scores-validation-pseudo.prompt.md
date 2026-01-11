# Prompt — id013 (P0) (M) — Implémenter `POST /api/scores` (validation + normalisation pseudo)

## 1) Role

Tu es un développeur senior TypeScript/Bun/Express, rigoureux sur les contrats d’API et les tests (Bun test). Tu connais les contraintes timezone (Europe/Paris explicite via Luxon) et la persistance JSON mono-instance (mutex + écriture atomique déjà en place).

## 2) Objectif

Implémenter l’endpoint **`POST /api/scores`** côté serveur afin d’enregistrer un score conforme au contrat MVP.

L’endpoint doit :

- Valider strictement le body JSON.
- Normaliser `pseudo` (trim + fallback "Anonyme" si vide/absent).
- Refuser un `pseudo` trop long.
- Enrichir l’entrée persistée avec `id`, `createdAt` (UTC ISO) et `dayKeyParis` (Europe/Paris explicite).
- Persister via le repository existant (fichier JSON + mutex + écriture atomique).

## 3) Format de sortie

Produire uniquement les changements nécessaires dans le code et les tests.

Livrables attendus (minimum) :

- Un module de route pour `POST /api/scores` sous `project/server/src/routes/`.
- L’intégration de cette route dans le router `/api` existant.
- Des tests Bun couvrant les cas d’acceptation (201/400) et les règles de normalisation/validation.

Fichiers typiques (tu peux ajuster si tu restes cohérent avec le repo) :

- `project/server/src/routes/scores.ts` (nouveau)
- `project/server/src/routes/index.ts` (modifié pour brancher la route)
- `project/server/src/routes/scores.test.ts` (nouveau) **ou** ajout de tests ciblés dans `project/server/src/app.test.ts`

## 4) Contraintes

- Ne change pas les décisions structurantes : Bun 1.3.5, TypeScript, Express, Luxon, persistance JSON mono-instance.
- Respecte le contrat d’erreurs JSON existant : `project/server/src/http/errors.ts` (utiliser `AppError` pour les erreurs 4xx, ne pas inventer un autre format).
- Ne pas exposer de stacktrace en production : déjà géré globalement, ne le casse pas.
- Pas de sur-scope : pas d’auth, pas d’anti-triche avancée, pas de multi-instance.
- Validation : `score` doit être un **number** et `>= 0`.
- Normalisation pseudo :
  - `pseudo` absent / `null` / vide / blanc après trim ⇒ **"Anonyme"**.
  - `pseudo` doit être une string si présent (sinon erreur 400).
  - Appliquer `trim()`.
  - Longueur max : utiliser une constante (recommandation doc : ~24). Choisir **24** sauf justification contraire, et tester le rejet.

## 5) Contexte technique

### Tâche TODO

- ID : **id013**
- Priorité : **(P0)**
- Taille : **(M)**
- Titre : Implémenter `POST /api/scores` (validation + normalisation pseudo)
- Dépendances : **id011**, **id012** (déjà implémentées dans le repo)

### Sources de vérité (Docs sources)

- `docs/06-architecture-technique.md` → section “6.1 POST /api/scores” (contrat request/response + erreurs)
- `docs/04-specification-fonctionnelle.md` → “7.2 Enregistrement d’un score” + règles pseudo/anonyme
- `docs/07-guidelines-developpement.md` → “Validation stricte des entrées” + conventions back
- `docs/08-qualite-tests-et-ux.md` → recommandations de tests back-end (validation + pseudo trop long)

### Implémentation existante à réutiliser

- Router `/api` : `project/server/src/routes/index.ts` (`createApiRouter({ extend })`)
- App Express + middleware erreurs : `project/server/src/app.ts`
- Contrat d’erreurs : `project/server/src/http/errors.ts`
- Repo persistance : `project/server/src/storage/score-repository.ts` (mutex + `.tmp` + rename)
- Timezone : `project/server/src/domain/time-service.ts` (`dayKeyParisFromUtcIso`)

### Contrat API à respecter (rappel)

- Route : `POST /api/scores`
- Body JSON :
  - `score` (number, requis, `>= 0`)
  - `pseudo` (string, optionnel ; si vide/null ⇒ "Anonyme")
- Réponse succès : HTTP **201**
  - `{ ok: true, saved: { id, createdAt, dayKeyParis, pseudo, score } }`
- Erreurs :
  - HTTP **400** si payload invalide (score manquant/non numérique, score < 0, pseudo trop long, pseudo non-string, JSON invalide, etc.)
  - HTTP **500** si erreur interne / I/O (la middleware globale gère déjà)

## 6) Étapes proposées (à exécuter sans pause)

1. Ajouter un module de route `scores.ts` qui enregistre `POST /scores` sur un `Router` Express.
2. Construire un “handler” pur/testable pour :
   - valider `score` / `pseudo` (types + bornes)
   - normaliser `pseudo`
   - produire l’objet `ScoreEntry` (id + createdAt + dayKeyParis + pseudo + score)
3. Brancher le repository via `createScoreRepository()` (instance partagée) et appeler `append()`.
4. Brancher la route dans le router `/api` existant (`createApiRouter` via `extend`).
5. Écrire des tests Bun (démarrer l’app sur port 0 comme `app.test.ts`) :
   - 201 avec score valide + pseudo absent ⇒ pseudo "Anonyme"
   - 201 avec pseudo " Alice " ⇒ pseudo "Alice"
   - 400 score manquant / score non number / score < 0
   - 400 pseudo non-string
   - 400 pseudo trop long (> 24)

## 7) Cas limites à couvrir

- Body JSON invalide : déjà converti en 400 par la middleware globale (`Invalid JSON body`) ; ne pas le régresser.
- `pseudo` = " " (espaces) ⇒ "Anonyme".
- `pseudo` = "" ⇒ "Anonyme".
- `pseudo` = null ⇒ "Anonyme" (si tu acceptes null explicitement), sinon rejeter : fais un choix cohérent avec le contrat “vide/null → Anonyme” et teste-le.
- `score` = NaN / Infinity : doit être rejeté (validation stricte "number" + finitude).

## 8) Critères de validation

Checklist de fin (à respecter avant clôture) :

- [ ] `POST /api/scores` répond **201** et retourne un objet `saved` conforme (id, createdAt UTC ISO, dayKeyParis, pseudo, score).
- [ ] `pseudo` absent/vide/blanc ⇒ "Anonyme".
- [ ] `pseudo` est trimé et limité à 24 caractères (rejet au-delà).
- [ ] Les erreurs 400 utilisent le contrat `{ ok:false, error:{ code, message } }` via `AppError`.
- [ ] Les tests Bun passent : `bun test` (depuis `project/`).
- [ ] Le typecheck passe : `bun run typecheck` (depuis `project/`).

## 9) Clôture

- Ne coche **que** la tâche **id013** dans `TODO.md` (remplacer `- [ ]` par `- [x]`) **uniquement si** tous les critères de validation ci-dessus sont satisfaits (implémentation + tests + typecheck).
- Ne coche aucune autre tâche.
