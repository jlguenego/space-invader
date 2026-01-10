# Clarification 03 — Questions ouvertes (parcours & UX)

- Date : 2026-01-10
- Contexte : `docs/02-parcours-et-experience.md` (section « Questions ouvertes »), en cohérence avec `input/brief.md` et les clarifications 01–02.
- Statut : CLOTUREE

## Questions

1. Mapping des touches clavier

- Quelles touches exactes ? (ex: gauche/droite, tirer, pause, mute)
  TIRER : espace
  PAUSE : P
  MUTE : M (switch)
- Préférence : flèches ou WASD (ou les deux) ? les deux

2. Réglages — sensibilité

- La “sensibilité” correspond à quoi ?
  - vitesse de déplacement ? OUI
  - vitesse de rotation/caméra (si applicable) ? NON
  - autre ? Pas d'autre
- Valeurs attendues : curseur continu ou presets (faible/moyen/fort) ? PRESETS FAIBLE MOYEN FORT

3. Réglages — difficulté

- Quels niveaux (ex: facile/normal/difficile) ? NIVEAU FACILE/NORMALE/DIFFICILE
- Quels effets concrets sur le jeu ? (ex: vitesse ennemis, fréquence tirs, nombre de vies, etc.) effets sur tout (vitesse ennemis, frequences tirs, nombres de vies, etc.)

4. Définition de « top 10 du jour »

- Frontière de journée : minuit selon quel fuseau horaire ?
  - heure locale du joueur ?
  - heure serveur (préciser TZ) ?
- À quel moment le classement “reset” ?

LE TOP 10 tient compte de l'heure de FRANCE PARIS

5. Score — règles de calcul

- Comment calcule-t-on le score ? (ex: points par ennemi, bonus, multiplicateurs, etc.)
- Y a-t-il des événements qui donnent des points (ex: vague terminée) ? NON.

ON CALCULE LE SCORE PAR ENNEMIS TUES, avec des bonus, et des multiplicateurs.

## Hypothèses possibles (à valider)

- Touches : flèches + espace (classique) et option WASD. OUI
- Reset : minuit heure serveur. OUI
- Réglages : 3 niveaux de difficulté et 3 presets de sensibilité. OUI

## Décision / Réponse

1. Mapping touches clavier

- Déplacements : flèches et WASD (les deux).
- Tir : espace.
- Pause : P.
- Mute (switch) : M.

2. Réglages — sensibilité

- Sensibilité = vitesse de déplacement.
- Format : presets (faible / moyen / fort).

3. Réglages — difficulté

- Niveaux : facile / normal / difficile.
- Effets : influence globale (vitesse ennemis, fréquence tirs, nombre de vies, etc.).

4. Top 10 du jour

- Référence temps : heure France/Paris.
- Reset : minuit heure serveur (aligné sur Europe/Paris).

5. Score — règles de calcul

- Score basé sur les ennemis tués.
- Bonus et multiplicateurs.
- Pas de points spécifiques « vague terminée ».
