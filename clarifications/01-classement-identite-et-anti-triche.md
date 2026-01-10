# Clarification 01 — Classement, identité joueur, anti-triche

- Date : 2026-01-10
- Contexte : éléments issus de `input/brief.md` (classement par score, front React, back Express, persistance fichiers).
- Statut : CLOTUREE

## Questions

1. Pour le classement, comment identifie-t-on un joueur ?

   - Pseudonyme libre saisi à chaque partie ? oui, mais pseudonyme stocke dans le navigateur (ex: local storage), et modifiable si l'utilisateur est un nouveau joueur ou un joueur qui a joue auparavant. Pas de mot de passe. Aucun interet d'ameliorer le score d'un concurrent.
   - Compte utilisateur (inscription/connexion) ? NON
   - Anonyme (sans identité), seulement top scores « sans nom » ? oui

2. Format du classement attendu :

   - Global uniquement ? oui
   - Top N (ex: top 10 / top 100) ? Top 10
   - Périodique (jour/semaine/mois) ? jour

3. Anti-triche minimal :
   - Le score est-il calculé exclusivement côté serveur (au moins partiellement) ? non
   - Accepte-t-on un modèle simple (ex: envoi score + pseudo) avec confiance côté client ? oui

## Hypothèses possibles (à valider)

- Option A (simple/MVP) : pseudo libre + top N global, anti-triche légère (limites, validation basique).
- Option B (plus robuste) : compte + score validé côté serveur.

Option A retenue.

## Décision / Réponse

- Identité joueur : pseudo libre (sans compte, sans mot de passe), mémorisé côté navigateur (ex: localStorage) et modifiable.
- Pseudo optionnel : un score peut aussi apparaître comme anonyme.
- Classement : global, top 10, sur la journée.
- Anti-triche : modèle simple accepté (score envoyé par le client, pas de calcul côté serveur).
