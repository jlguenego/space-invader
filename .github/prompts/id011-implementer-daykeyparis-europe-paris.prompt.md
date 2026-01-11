# id011 (P0) (S) — Implémenter `dayKeyParis` (Europe/Paris explicite)

## Role

Tu es un(e) ingénieur(e) TypeScript senior côté back-end (Express + Bun), avec une forte sensibilité aux sujets de timezone/DST et aux tests unitaires fiables.

## Objectif

Implémenter le calcul de la clé de “jour” **Europe/Paris** (`dayKeyParis`) côté serveur, de manière **explicite et indépendante du fuseau système**, afin de pouvoir :

- associer chaque score à une journée Paris (`YYYY-MM-DD`),
- garantir le reset quotidien à minuit Europe/Paris,
- couvrir les cas sensibles (instants UTC proches de minuit et transitions heure d’été/hiver).

Rappel TODO :

- **But :** Respecter le “jour” Paris.
- **Livrable :** `timeService` UTC→`dayKeyParis`.
- **Acceptation :** tests couvrent instants UTC + DST.

## Format de sortie

Modifier/créer uniquement ce qui est nécessaire pour `id011`.

Fichiers attendus (proposition conforme à l’architecture cible) :

- `project/server/src/domain/time-service.ts`
  - expose une fonction pure de conversion UTC → `dayKeyParis`.
- `project/server/src/domain/time-service.test.ts`
  - tests Bun couvrant : instants UTC (bords de journée) + DST Europe/Paris.
- `project/server/package.json`
  - ajouter la dépendance timezone (voir Contraintes).

Optionnel (si tu en as besoin pour la clarté), sans sur-scope :

- `project/server/src/domain/types.ts` ou export type local dans `time-service.ts`.

## Contraintes

- **Ne pas implémenter d’autres TODO** (ex: endpoints `POST /api/scores`, repository JSON). Reste strictement dans le périmètre `id011`.
- Runtime : **Bun 1.3.5** (pas Node runtime), langage **TypeScript**.
- Le calcul doit être **explicite** en `Europe/Paris` et **ne doit pas dépendre** de `process.env.TZ` ni du fuseau de la machine.
- Format de `dayKeyParis` : **`YYYY-MM-DD`** (ex: `2026-01-10`).
- Ajouter une lib robuste de timezone **recommandée par les docs** (Luxon) plutôt que du bricolage `Date`.
- Tests : utiliser `bun:test` (comme les tests existants) et couvrir les cas demandés.
- Respecter les conventions projet (AGENTS) : TypeScript partout, code court et testable, fichiers en `kebab-case`.

## Contexte technique

- Dépendance : **`id010`** (socle Express déjà présent).
- Structure serveur actuelle : `project/server/src/` contient `app.ts`, `routes/`, `http/errors.ts`, tests Bun.
- Architecture cible (dossier `domain/`) : voir [docs/06-architecture-technique.md](docs/06-architecture-technique.md) → section “Back-end (Express)” et “Gestion du fuseau Europe/Paris”.
- Exigences de tests : voir [docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Tests : dayKeyParis”.

### Décision technique attendue

- Utiliser **Luxon** (ou équivalent robuste) avec zone explicite : `Europe/Paris`.
  - Indice doc : [docs/06-architecture-technique.md](docs/06-architecture-technique.md) recommande Luxon.

### API interne recommandée (à ajuster si mieux)

Créer un petit service pur, par exemple :

- `dayKeyParisFromUtcIso(utcIso: string): string`
  - entrée : ISO UTC (ex: `2026-01-10T12:34:56.000Z`)
  - sortie : `YYYY-MM-DD` en Europe/Paris.

Ou si tu préfères (mais reste cohérent) :

- `dayKeyParisFromDate(date: Date): string` en supposant que le `Date` représente un instant UTC.

## Étapes proposées (sans sur-détailler)

1. Ajouter la dépendance Luxon au workspace serveur (`project/server`).
2. Créer `domain/time-service.ts` avec une fonction pure et testable.
3. Écrire `domain/time-service.test.ts` couvrant :
   - cas “bord de journée” (instant UTC appartenant au lendemain en Europe/Paris),
   - cas DST (début et fin) en Europe/Paris, sans dépendre du TZ système.
4. Lancer les tests et le typecheck.

## Cas limites à couvrir (minimum)

- **Bords de journée** : un instant UTC tardif qui devient le lendemain en Europe/Paris.
  - Exemple : `2026-01-10T23:30:00.000Z` → `dayKeyParis = 2026-01-11` (car +01:00 en hiver).
- **DST start (heure d’été)** : deux instants UTC encadrant le saut d’heure doivent produire le **même** `dayKeyParis` (date stable).
- **DST end (heure d’hiver)** : deux instants UTC autour de l’heure répétée doivent produire le **même** `dayKeyParis`.
- Robustesse : si l’entrée ISO est invalide, décider d’un comportement (throw / AppError) — pour `id011`, privilégier un **throw** (et documenter via tests) ou une validation minimaliste.

## Critères de validation

Checklist de succès :

- [ ] Un module `timeService` existe et calcule `dayKeyParis` en **Europe/Paris explicite**.
- [ ] `dayKeyParis` est formaté `YYYY-MM-DD`.
- [ ] Les tests Bun couvrent :
  - [ ] au moins 1 cas “instant UTC → lendemain Paris”,
  - [ ] au moins 1 cas DST début (heure d’été),
  - [ ] au moins 1 cas DST fin (heure d’hiver).
- [ ] Les tests passent : `bun test` (depuis `project/` ou `project/server`).
- [ ] Le typecheck passe (si applicable) : `bun run typecheck` (depuis `project/`).

## Commandes utiles

- Installer dépendances : depuis `project/` → `bun install`
- Ajouter Luxon : depuis `project/server/` → `bun add luxon`
- Tests : depuis `project/` → `bun test` (ou `project/server` → `bun test`)

## Clôture

- À la toute fin, **cocher uniquement** la case de `id011` dans [TODO.md](TODO.md) (`- [ ]` → `- [x]`) **si et seulement si** tous les livrables sont présents et tous les critères de validation ci-dessus sont satisfaits.
- Ne cocher aucune autre tâche.
