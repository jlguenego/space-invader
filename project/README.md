# project — monorepo MVP

Ce dossier contient **tout le code exécutable et la configuration de build** du projet.

## Structure

- `client/` : front React (UI + boucle de jeu Three.js + audio Howler)
- `server/` : back Express (API + persistance fichiers JSON)
- `scripts/` : scripts utilitaires du monorepo (créés/complétés dans les tâches d’outillage)

## Sources de vérité

- `docs/06-architecture-technique.md` (modules proposés, structure front/back)
- `docs/07-guidelines-developpement.md` (organisation cible des dossiers)

## Décisions

### Langage (front + back)

Décision : **TypeScript partout** (client et serveur) autant que possible.

Justification (MVP) :

- Cohérence codebase + réduction des erreurs (types) sur un projet temps réel (jeu) et une API.
- Aligné avec les contrôles CI attendus (lint + typecheck) décrits dans `docs/09-cicd-et-deploiement.md`.

Impacts CI/outillage (réalisés dans `id008`) :

- Ajouter un `tsconfig.json` (au minimum par package ou racine) et un step `typecheck` (ex: `tsc --noEmit`).
- Configs en `.ts` quand supporté (ex: `vite.config.ts`).
- Côté serveur : **Bun exécute le `.ts`** (pas de compilation TS→JS requise pour exécuter) ; côté front : Vite produit le build statique pour la prod.

## Notes

Cette étape pose uniquement la structure (pas d’initialisation React/Express).

## Production (Docker Compose)

- Compose prod : `project/docker-compose.yml`
- Port : le conteneur écoute sur `3000` (via `PORT`) et le host expose `127.0.0.1:9999` (prévu pour un proxy Nginx sur le host).
- Persistance : bind mount `./server/data` → `/app/server/data` ; le serveur lit/écrit `scores.json` dans `DATA_DIR`.

Variables (exemple) : voir `project/.env.example`.

## Outillage (verrouillé)

- Runtime & outillage JS : **Bun 1.3.5** (version verrouillée — dev/CI/prod).
- Front : React outillé avec **Vite**.

Vérification rapide :

- Windows : `powershell -ExecutionPolicy Bypass -File project/scripts/check-bun-version.ps1`
- macOS/Linux : `project/scripts/check-bun-version.sh`
