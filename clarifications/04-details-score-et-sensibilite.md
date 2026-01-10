# Clarification 04 — Détails score (bonus/multiplicateurs) & sensibilité

- Date : 2026-01-10
- Contexte : `docs/03-user-stories-et-flux.md` (US-06, US-10 et section « Questions / détails à compléter ») + `clarifications/03-questions-ouvertes-parcours-et-ux.md`.
- Statut : CLOTUREE

## Questions

1. Sensibilité (presets)

- Quelles valeurs exactes pour : faible / moyen / fort ?
  - exemple attendu : vitesse (unités ou ratio) ou paramètres de déplacement.

Décision confirmée : ratios 0.8x / 1.0x / 1.2x.

2. Score — bonus

- Quels bonus existent ? (ex: type d’ennemi, série de kills, précision, etc.)
  - Reponse : LES 3 TYPES CITE EN EXAMPLE
- Combien de points (ordre de grandeur) et dans quelles conditions ?
  - Reponse : entre 1 et 1000 points selon l'importance de la recompense.

3. Score — multiplicateurs

- Quels multiplicateurs existent ? (ex: combo, temps, difficulté, streak)
  - Reponse : combo, temps, difficulté, streak
- Comment ils se déclenchent et se terminent ?
  - Reponse : ils se declenchent quand certains type d'ennemis sont tues, et dure un temps predetermine.
- Plafond (max) ? Aucun

## Hypothèses possibles (à valider)

- Sensibilité : ratios simples (ex: 0.8x / 1.0x / 1.2x). JE CONFIRME 0.8x / 1.0x / 1.2x
- Bonus/multiplicateurs : combos (streak) et difficulté. OUI

## Décision / Réponse

1. Sensibilité (presets)

- Faible : 0.8x
- Moyen : 1.0x
- Fort : 1.2x

2. Score — bonus

- Types : type d’ennemi, série de kills (streak), précision.
- Ordre de grandeur : bonus entre 1 et 1000 points selon l’importance de la récompense.

3. Score — multiplicateurs

- Types : combo, temps, difficulté, streak.
- Déclenchement : lorsqu’un certain type d’ennemi est tué.
- Durée : durée prédéterminée.
- Plafond : aucun.
