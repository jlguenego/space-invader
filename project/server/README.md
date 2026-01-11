# server

Back-end Express.

## Organisation (cible)

- `src/routes/` : routes API (endpoints)
- `src/domain/` : services métier (leaderboard, time)
- `src/storage/` : repository de persistance JSON (mutex + écriture atomique)
- `data/` : fichiers persistés (hors `src/`)

## Notes

Le “jour” du leaderboard est basé sur `Europe/Paris` (calcul explicite, pas dépendant du TZ système).
