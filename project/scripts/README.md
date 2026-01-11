# scripts

Ce dossier est réservé aux scripts utilitaires du monorepo (dev/build/test/lint, génération, etc.).

Le contenu sera ajouté au fil des tâches d’outillage (ex: `id008`).

## Scripts disponibles

- `check-bun-version.ps1` / `check-bun-version.sh` : vérifie que la version de Bun correspond à `.bun-version` (Bun 1.3.5 verrouillée).

## Scripts ajoutés (id008)

- `dev.ts` : orchestre `bun run dev` dans `server/` et `client/`.
- `build.ts` : orchestre `bun run build` dans `server/` puis `client/`.
- `not-initialized.ts` : helper pour les scripts placeholder tant que `id010`/`id018` ne sont pas réalisés.
