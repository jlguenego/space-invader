# id012 (P0) (M) — Implémenter le repository scores (mutex + écriture atomique)

## Role

Tu es un(e) ingénieur(e) TypeScript senior côté back-end (Express + Bun), à l’aise avec l’I/O fichier, les problématiques d’atomicité, et l’écriture de tests unitaires robustes.

## Objectif

Implémenter la **persistance des scores** côté serveur via un repository fichier JSON, en respectant la contrainte **mono-instance** et en évitant toute **corruption** du fichier.

Le repository doit :

- lire/initialiser un fichier `scores.json` versionné,
- sérialiser toutes les écritures via un **mutex en mémoire**,
- écrire de manière **atomique** (`.tmp` puis renommage vers `scores.json`),
- être testable facilement (tests Bun) et couvrir les cas critiques demandés.

Rappel TODO :

- **But :** persister sans corruption en mono-instance.
- **Livrable :** `scoreRepository` (read/write JSON, `.tmp` + rename, mutex).
- **Acceptation :** tests valident JSON final non corrompu + sérialisation.

## Format de sortie

Modifier/créer uniquement ce qui est nécessaire pour `id012`.

Fichiers attendus (proposition conforme à l’architecture cible) :

- `project/server/src/storage/score-repository.ts`
  - repository de persistance : lecture/écriture du fichier + mutex.
- `project/server/src/storage/score-repository.test.ts`
  - tests Bun : intégrité du fichier final + écritures sérialisées.

Optionnel mais recommandé (si ça améliore la testabilité et la propreté) :

- `project/server/src/storage/mutex.ts`
  - un mini mutex async sans dépendance externe.
- `project/server/src/storage/mutex.test.ts`
  - test unitaire qui démontre l’absence d’exécution concurrente dans la section critique.

## Contraintes

- **Ne pas implémenter d’autres TODO** (notamment `id013`/`id014` endpoints). Reste strictement dans le périmètre `id012`.
- Runtime : **Bun 1.3.5**, langage **TypeScript**.
- Persistance : **fichiers JSON** (mono-instance), pas de DB.
- Écriture atomique obligatoire : écrire dans `scores.json.tmp` (même dossier) puis `rename` vers `scores.json`.
- Mutex obligatoire : sérialiser les écritures dans le process (une seule écriture à la fois).
- Le repository doit créer le dossier de données s’il n’existe pas.
- Conserver un format JSON versionné : objet `{ version: 1, scores: [...] }`.
- Tests : utiliser `bun:test` et des fichiers temporaires (ne jamais écrire dans `project/server/data/` pendant les tests).
- Conventions : fichiers en `kebab-case`, fonctions courtes et testables.

## Contexte technique

- Dépendance : **`id010`** (socle Express et contrat d’erreurs JSON déjà présents).
- Architecture cible : [docs/06-architecture-technique.md](docs/06-architecture-technique.md) → sections “Back-end (Express)” et “Données & persistance fichiers”.
- Règles persistance : [docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Persistance JSON (mono-instance)”.
- Exigences de tests persistance : [docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Tests : Persistance”.
- Exemple de fichier : `project/server/data/scores.example.json`.

### Décision technique attendue (cohérente docs)

- **Stratégie d’écriture anti-corruption** (référence doc) :
  1. (Au choix) charger/maintenir une représentation en mémoire, ou relire le fichier à chaque écriture — mais les écritures doivent rester **sérialisées**.
  2. Pour toute écriture : mutex → write `scores.json.tmp` → rename atomique vers `scores.json` → release.

### Chemin des données

- Par défaut, utiliser `project/server/data/scores.json`.
- Option recommandé (sans sur-scope) : permettre un override via `process.env.DATA_DIR` (comme recommandé dans le runbook/AGENTS), en gardant le fichier `scores.json` dans ce dossier.

## Étapes proposées (sans sur-détailler)

1. Définir les types TS pour le fichier (`ScoreFileV1`) et les entrées (`ScoreEntry`).
2. Implémenter un petit `Mutex` async (ou équivalent) sans dépendance externe.
3. Implémenter `scoreRepository` :
   - init : dossier data + fichier absent → structure vide,
   - lecture : parse JSON (et gestion d’erreur propre côté repository),
   - écriture : `.tmp` + `rename` sous mutex.
4. Écrire des tests Bun isolés (temp dir) couvrant :
   - création/initialisation,
   - écritures concurrentes (promesses lancées en parallèle) → fichier final JSON valide,
   - sérialisation (section critique jamais concurrente).
5. Lancer `bun test` et `bun run build` (typecheck).

## Cas limites à couvrir (minimum)

- **Fichier absent** : création automatique avec `{ version: 1, scores: [] }`.
- **Dossier absent** : création automatique (recursive).
- **Écritures concurrentes** : N appels `append/save` en parallèle → fichier final parseable et contenant N entrées.
- **Résidus `.tmp`** : après succès, pas de `.tmp` persistant.
- **JSON invalide** (optionnel) : si `scores.json` est corrompu/illisible, le repository doit échouer explicitement (throw) — pas de “réparation silencieuse”.

## Critères de validation

Checklist de succès :

- [ ] Un repository `scoreRepository` existe dans `project/server/src/storage/` et gère lecture/écriture JSON.
- [ ] Les écritures sont sérialisées via un mutex (preuve par test).
- [ ] Les écritures sont atomiques via `.tmp` + `rename` (preuve par test ou assertion sur l’absence de corruption / absence de `.tmp` final).
- [ ] Les tests Bun passent : `bun test` (depuis `project/` ou `project/server`).
- [ ] Le typecheck passe : `bun run build` (depuis `project/server`) ou `bun run build` (depuis `project/`).

## Commandes utiles

- Depuis `project/` : `bun install`
- Tests : `bun test`
- Typecheck : `bun run build` (serveur)

## Clôture

- À la toute fin, **cocher uniquement** la case de `id012` dans [TODO.md](TODO.md) (`- [ ]` → `- [x]`) **si et seulement si** tous les livrables sont présents et tous les critères de validation ci-dessus sont satisfaits.
- Ne cocher aucune autre tâche.
