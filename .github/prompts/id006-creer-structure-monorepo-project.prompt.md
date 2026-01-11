# Prompt — **id006** **(P0)** _(S)_ Créer le répertoire `/project` et y poser la structure monorepo

## Role

Tu es un expert en **architecture de dépôt monorepo** et en mise en place d’une base de projet **front React / back Express**, avec une attention particulière à :

- l’**organisation des dossiers** (cible) et la séparation des responsabilités,
- le fait de rester **agnostique** sur les décisions non prises (ex: **JS vs TS**),
- la création d’une structure qui permet d’implémenter les tâches suivantes (API, persistance JSON, UI + boucle de jeu) **sans devoir bouger les dossiers plus tard**.

## Objectif

Réaliser la tâche **id006 (P0, S)** :

- **Créer** le répertoire `/project/`.
- **Poser** une structure monorepo minimale sous `/project/` avec un front sous `/project/client/` et un back sous `/project/server/`.
- Ajouter les **fichiers racine** nécessaires (au minimum un `README`) pour expliquer la structure et les conventions.

Rappel TODO :

- **But :** respecter la contrainte de repo (code/config/docs générées sous `/project/`).
- **Livrable :** arborescence `/project/client/` + `/project/server/` + fichiers racine (README, scripts).
- **Acceptation :** tout le code exécutable et la config de build peuvent vivre et tourner depuis `/project/`.
- **Dépendances :** aucune.

## Format de sortie

### Dossiers et fichiers à créer (squelette)

Créer l’arborescence suivante (le contenu exact des README est à rédiger, mais reste concis) :

- `/project/`
  - `/project/README.md`
  - `/project/scripts/` (dossier présent, même si vide au MVP)
    - `/project/scripts/README.md` (optionnel, mais recommandé pour expliquer le rôle)
  - `/project/client/`
    - `/project/client/README.md`
    - `/project/client/src/`
      - `/project/client/src/ui/`
      - `/project/client/src/game/`
      - `/project/client/src/render/`
      - `/project/client/src/audio/`
      - `/project/client/src/services/`
      - `/project/client/src/storage/`
    - `/project/client/public/`
      - `/project/client/public/assets/`
  - `/project/server/`
    - `/project/server/README.md`
    - `/project/server/src/`
      - `/project/server/src/routes/`
      - `/project/server/src/domain/`
      - `/project/server/src/storage/`
    - `/project/server/data/`

Notes :

- Si Git ignore les dossiers vides, ajouter un fichier placeholder **minimal** (ex: `.gitkeep`) uniquement là où nécessaire pour conserver l’arborescence.
- Ne pas ajouter de code applicatif (API, React app, etc.) : cette tâche ne fait que poser la structure.

### Contenu minimal attendu des README

- `project/README.md` :

  - la contrainte “tout le code/config sous `/project/`”,
  - un résumé de la structure `client/` vs `server/`,
  - un pointeur vers les docs sources (voir section Contexte technique),
  - une section “Décisions à venir” qui mentionne explicitement que **JS vs TS** est traité par `id007`.

- `project/client/README.md` :

  - rappeler les modules `ui/`, `game/`, `render/`, `audio/`, `services/`, `storage/`.

- `project/server/README.md` :
  - rappeler `routes/`, `domain/`, `storage/` + le dossier `data/` hors `src/`.

## Contraintes

- ⚠️ Ne pas implémenter les tâches suivantes en avance :

  - pas d’initialisation React (`id018`),
  - pas d’initialisation Express (`id010`),
  - pas de persistance JSON (`id012`),
  - pas de scripts `dev/build/test/lint` complets (plutôt `id008`).

- ⚠️ Ne pas trancher **JS vs TypeScript** (décision attendue dans `id007`).

  - Donc, éviter d’introduire des fichiers qui forcent un choix (ex: `tsconfig.json`, convention stricte `.ts`, pipeline typecheck, etc.).

- Respecter l’organisation cible décrite dans les docs (voir Contexte technique).
- Rester minimal : créer le squelette et la documentation associée, rien de plus.

- Ne pas cocher d’autres tâches.
- **Clôture TODO :** cocher `- [ ]` → `- [x]` pour **id006 uniquement** à la fin **uniquement si** tous les critères de validation ci-dessous sont satisfaits.

## Contexte technique (sources de vérité)

- `/docs/06-architecture-technique.md`

  - “Front-end (React)” → liste des modules proposés (`ui/`, `game/`, `render/`, `audio/`, `services/`, `storage/`).
  - “Back-end (Express)” → structure proposée (`app`, `routes`, `domain`, `storage`) et séparation `data/`.

- `/docs/07-guidelines-developpement.md`
  - “Organisation des dossiers (cible)” → structure détaillée `client/src/...` et `server/src/...` + `server/data/`.

Note : aucun `AGENTS.md` n’est présent dans le dépôt à ce stade.

## Étapes proposées

1. Créer le dossier `/project/` et les sous-dossiers `client/` et `server/`.
2. Créer le squelette des sous-dossiers `src/` côté client et serveur selon les docs.
3. Ajouter les README minimaux demandés (contenu concis, orienté “contrat de structure”).
4. Ajouter des placeholders `.gitkeep` uniquement si nécessaire pour conserver les dossiers vides.
5. Vérifier que toute la structure est bien **sous** `/project/` (aucun code/config exécutable ailleurs).

## Cas limites / points d’attention

- Windows : vérifier que les chemins et la casse de dossiers restent cohérents (`src/`, `data/`).
- Ne pas créer de conflits avec des dossiers existants si `/project/` existe déjà (dans ce cas, compléter sans casser).
- Ne pas ajouter de tooling non demandé (monorepo workspaces, Docker, CI, etc.).

## Critères de validation

- Le dossier `/project/` existe et contient au minimum `/project/client/` et `/project/server/`.
- L’arborescence `client/src/{ui,game,render,audio,services,storage}` existe.
- L’arborescence `server/src/{routes,domain,storage}` et `server/data/` existe.
- Un `project/README.md` existe et explique clairement la structure + référence les docs sources.
- La structure posée est compatible avec l’acceptation : le code et la config de build **pourront** vivre et tourner depuis `/project/` (sans forcer JS/TS).

## Clôture

- Mettre à jour **uniquement** la ligne de la todo **id006** dans `/TODO.md` : `- [ ]` → `- [x]` **si et seulement si** tous les critères de validation sont satisfaits.
- Ne cocher aucune autre tâche.
