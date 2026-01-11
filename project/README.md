# project — monorepo MVP

Ce dossier contient **tout le code exécutable et la configuration de build** du projet.

## Structure

- `client/` : front React (UI + boucle de jeu Three.js + audio Howler)
- `server/` : back Express (API + persistance fichiers JSON)
- `scripts/` : scripts utilitaires du monorepo (créés/complétés dans les tâches d’outillage)

## Sources de vérité

- `docs/06-architecture-technique.md` (modules proposés, structure front/back)
- `docs/07-guidelines-developpement.md` (organisation cible des dossiers)

## Décisions à venir

- **JS vs TypeScript** (front et back) est décidé dans la tâche `id007`.

## Notes

Cette étape pose uniquement la structure (pas d’initialisation React/Express, pas de tooling CI).
