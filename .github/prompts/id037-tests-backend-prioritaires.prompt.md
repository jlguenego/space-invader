# id037 — (P0) (M) Ajouter les tests back-end prioritaires (validation/timezone/leaderboard)

## 1) Role

Tu es un développeur senior TypeScript spécialisé **Bun + Express**, avec une forte expertise en **tests (bun:test)**, en règles de **timezone Europe/Paris**, et en API REST robustes.

## 2) Objectif

Sécuriser les règles sensibles du back-end via une suite de tests automatisés couvrant au minimum :

- La validation de `POST /api/scores` (entrées invalides + normalisation pseudo).
- Le calcul `dayKeyParis` (timezone `Europe/Paris` explicite) incluant les cas de changement d’heure (DST).
- Le endpoint `GET /api/leaderboard/day` (filtre par jour Paris, tri décroissant, cap top10, ranks cohérents).

Important : il est possible que tout ou partie de ces tests existent déjà. Dans ce cas, l’objectif est de **vérifier la couverture vs docs**, d’ajouter uniquement ce qui manque, et d’éviter tout refactor inutile.

## 3) Format de sortie

Modifier/ajouter uniquement ce qui est nécessaire, typiquement :

- `project/server/src/routes/scores.test.ts`
- `project/server/src/routes/leaderboard.test.ts`
- `project/server/src/domain/time-service.test.ts`
- (si besoin) `project/server/src/storage/score-repository.test.ts`

Et à la fin, **uniquement si** tous les critères de validation sont satisfaits :

- Cocher la case de la tâche `id037` dans `TODO.md` (`- [ ]` → `- [x]`).

Ne pas cocher d’autres tâches.

## 4) Contraintes

- Runtime imposé : **Bun 1.3.5**.
- Langage : **TypeScript**.
- Timezone “jour produit” : calcul explicite en **`Europe/Paris`**, ne pas dépendre du TZ système.
- Tests : utiliser **`bun:test`** (pas Jest/Vitest).
- Éviter l’invention de règles : les seuils/messages exacts doivent refléter le code actuel et/ou le contrat documenté.
- Ne pas sur-scoper : pas d’E2E, pas de docker/CI ici.
- Ne pas casser le contrat JSON d’erreurs (`AppError`), ni changer l’API pour “faire passer les tests” sauf bug avéré.

## 5) Contexte technique

### Extrait TODO (source)

- ID : **id037**
- Priorité : **(P0)**
- Taille : **(M)**
- Titre : **Ajouter les tests back-end prioritaires (validation/timezone/leaderboard)**
- But : Sécuriser les règles sensibles
- Livrable : tests (POST validation, DST `dayKeyParis`, tri/filtre/cap top10)
- Acceptation : CI exécute et couvre les cas du doc qualité
- Dépendances : **id013**, **id014**
- Docs sources :
  - `docs/08-qualite-tests-et-ux.md` → section “5.2 Back-end (recommandé)”
  - `docs/07-guidelines-developpement.md` → section “7. Tests (niveau MVP)”

### Points “source de vérité” (à respecter)

- `POST /api/scores` (contrat v0, validation) : `docs/06-architecture-technique.md`.
- `GET /api/leaderboard/day` (top 10, timezone, champs) : `docs/06-architecture-technique.md`.
- Recos tests back : `docs/08-qualite-tests-et-ux.md` + `docs/07-guidelines-developpement.md`.

### Indications d’implémentation attendue (pour guider les tests)

- Les tests back existants (si présents) utilisent souvent :
  - `app.listen(0)` + `fetch()` sur `http://127.0.0.1:<port>`
  - un `DATA_DIR` temporaire pour isoler la persistance JSON
- `dayKeyParis` doit rester stable autour des transitions DST (heure d’été/hiver).
- Le leaderboard “day” doit : filtrer par `dayKeyParis` du jour Paris, trier par score desc, cap à 10, produire des rangs `1..n`.

## 6) Critères de validation

La tâche est considérée comme terminée si :

### Tests exigés (fonctionnels)

- `POST /api/scores` :

  - Rejette (400) : score manquant, non numérique, `< 0`, `null`.
  - Normalise : pseudo absent / `null` / vide → “Anonyme”.
  - Trim : pseudo entouré d’espaces est nettoyé.
  - Rejette : pseudo non-string.
  - Rejette : pseudo trop long, avec un message cohérent avec l’implémentation (ne pas deviner : lire la constante/max utilisé dans le code et l’asserter).

- `dayKeyParis` :

  - Cas “UTC tardif -> jour suivant à Paris” (hiver).
  - DST start (saut d’heure) : la journée Paris ne change pas autour du jump.
  - DST end (heure répétée) : la journée Paris ne change pas autour de l’heure répétée.
  - Indépendance du TZ process : changer `process.env.TZ` ne doit pas affecter le résultat.
  - Entrée ISO invalide : throw (ou comportement explicitement défini par le code ; tester le comportement réel).

- `GET /api/leaderboard/day` :
  - Répond 200 avec `{ timezone: "Europe/Paris", dayKeyParis, entries: [] }` si aucun score.
  - Filtre par `dayKeyParis` (ignore les autres jours).
  - Trie décroissant par score.
  - Cap à 10.
  - Rangs `rank` cohérents : `1..entries.length`.
  - (si pertinent dans le code) Tie-break déterministe (ex: createdAt puis id) afin d’éviter les tests flakys.

### Commandes

- Depuis `project/` : `bun test` doit passer.

### Clôture (TODO)

- Cocher `id037` dans `TODO.md` uniquement si tout ce qui précède est OK.

## 7) Étapes proposées (sans pause)

1. Localiser les tests existants côté serveur et comparer à la liste “Tests exigés”.
2. Ajouter/compléter uniquement les cas manquants, en réutilisant les helpers existants (start server, temp DATA_DIR).
3. Stabiliser les tests (pas de dépendance à l’heure locale/à l’ordre d’écriture non déterministe).
4. Lancer `bun test`.
5. Cocher `id037` dans `TODO.md` si tout est vert.
