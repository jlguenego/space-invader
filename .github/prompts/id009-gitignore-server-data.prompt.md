# Prompt — **id009** **(P0)** _(S)_ Configurer l’ignorance Git et la gestion de `server/data/`

## 1) Role

Tu es un développeur **TypeScript / Bun** expérimenté avec une forte sensibilité **hygiène Git / data runtime / déploiement Docker**.

## 2) Objectif

Mettre en place une gestion propre des données runtime du back-end (fichiers persistés, ex: scores), afin que :

- les données runtime ne soient **jamais versionnées** (local/prod),
- le dossier de données existe dans le repo (pour éviter les erreurs au premier run),
- la stratégie soit cohérente avec le déploiement prévu (Docker Compose + bind mount sur `server/data/`).

Tâche ciblée : **id009 uniquement**.

## 3) Format de sortie

Produire (ou ajuster) uniquement les éléments suivants :

- `.gitignore` (racine) : règles d’ignorance pour les données runtime.
- `project/server/data/.gitkeep` : conserver le dossier `project/server/data/` dans Git.
- _(Optionnel, uniquement si pertinent et sans contredire les docs)_ un fichier d’exemple **non runtime** (ex: `project/server/data/scores.example.json`) **si** tu juges que cela aide à l’onboarding sans risque de confusion.

## 4) Contraintes

- Ne pas implémenter d’autres TODOs (ne pas toucher aux endpoints, au repository, au docker-compose, etc.).
- Ne pas committer de données runtime (ex: `scores.json`, fichiers `.tmp`, dumps, exports).
- La persistance runtime doit être compatible avec la topologie “Option A” (Express sert aussi le front) et le bind mount Docker (cf. docs).
- Préserver les conventions existantes et minimiser les changements.
- **Ne pas cocher** la TODO tant que tous les critères de validation ne sont pas satisfaits.

## 5) Contexte technique

### Dépendances

- Dépendance : **id006** (structure monorepo sous `project/`).
- Statut : la structure `project/server/data/` existe déjà dans le repo.

### Docs sources (sources de vérité)

- `docs/07-guidelines-developpement.md` → section **“Git & hygiène de repo”** (données à ignorer, possibilité de fichier d’exemple vide).
- `docs/09-cicd-et-deploiement.md` → section **“Persistance fichiers (indispensable)”** (runtime-only + bind mount Docker sur `server/data/`, variable `DATA_DIR`).

### État actuel pertinent (à vérifier, puis ajuster si besoin)

- Un `.gitignore` existe déjà à la racine.
- Le dossier `project/server/data/` contient un `.gitkeep`.
- D’autres outils (TS/ESLint/Prettier) peuvent déjà ignorer `server/data/` côté tooling : vérifie que ta solution ne crée pas d’incohérence.

## 6) Étapes proposées (sans sur-scope)

1. Inspecter `.gitignore` à la racine :
   - Vérifier que `project/server/data/**` (ou équivalent) est ignoré.
   - Vérifier qu’une exception maintient `project/server/data/.gitkeep` versionné.
2. Vérifier `project/server/data/` :
   - Le dossier existe.
   - `.gitkeep` est présent et **non ignoré**.
3. Vérifier qu’aucun fichier de données runtime n’est actuellement committé (ex: `scores.json`).
4. (Optionnel) Si tu ajoutes un fichier d’exemple :
   - S’assurer qu’il n’est **pas** confondu avec le runtime (nom explicite `*.example.json`).
   - Ajuster `.gitignore` si nécessaire pour ne pas l’ignorer.

## 7) Cas limites à gérer

- Un pattern d’ignore trop large qui empêcherait de versionner `.gitkeep` (ou un éventuel fichier d’exemple).
- Confusion entre chemins “runtime” et chemins “build artifacts” (ne pas mélanger `dist/` et `server/data/`).
- Différences de chemins selon OS : rester sur des patterns Git robustes (`/` dans `.gitignore`).

## 8) Critères de validation

Checklist (tout doit être vrai) :

- [ ] `.gitignore` ignore bien les données runtime dans `project/server/data/`.
- [ ] `.gitignore` **n’ignore pas** `project/server/data/.gitkeep`.
- [ ] Le dossier `project/server/data/` reste présent après un clone (via `.gitkeep`).
- [ ] Aucun fichier runtime (ex: `scores.json`, `*.tmp`, exports) n’est versionné.
- [ ] La stratégie reste cohérente avec le déploiement prévu : données montées en bind mount Docker sur `server/data/` (cf. `docs/09-cicd-et-deploiement.md`).

## 9) Clôture

- Si (et seulement si) tous les livrables sont produits et que tous les critères de validation sont cochés ci-dessus, **cocher uniquement la case de `id009`** dans `TODO.md` (`- [ ]` → `- [x]`).
- Ne cocher aucune autre tâche.
