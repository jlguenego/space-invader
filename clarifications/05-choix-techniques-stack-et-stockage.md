# Clarification 05 — Choix techniques (stack, WebGL, audio, persistance fichiers)

- Date : 2026-01-10
- Contexte : `docs/05-decisions-structurantes.md` (section « Décisions à prendre ») et contraintes de `input/brief.md`.
- Statut : CLOTUREE

## Questions

1. WebGL 3D

- Souhaites-tu choisir une librairie (ex: Three.js) ou rester en WebGL “vanilla” ?
- Si librairie : as-tu une préférence ? Reponse : THREE.JS

2. Audio

- Souhaites-tu une librairie audio (ex: Howler.js) ou API Web Audio / HTMLAudio ?
  REPONSE : Howler.js
- Besoin de formats cibles (mp3/ogg/wav) ? JE NE SAIS PAS. DECIDE POUR MOI.

3. Persistance “BDD fichiers” (côté back Express)

- Format de stockage souhaité : JSON (fichiers), ou autre ? Reponse : JSON !
- Contrainte attendue : mono-instance (simple) ou multi-process (plus complexe) ? Reponse : MONO-INSTANCE
- Souhaites-tu conserver tout l’historique ou uniquement des agrégats (ex: top 10 du jour) ? reponse : tout l'historique

4. API score / classement

- Endpoints minimaux attendus :
  - POST score ? OUI
  - GET top10 du jour ? OUI
- Souhaites-tu aussi : purge quotidienne / endpoint admin / healthcheck ? NON

5. Europe/Paris (reset minuit)

- On fixe le serveur en TZ Europe/Paris et on “reset” à minuit Europe/Paris : OK ? OUI

## Hypothèses possibles (à valider)

- WebGL : Three.js (réduit le risque/temps).
- Audio : Howler.js (mute/toggle simple).
- Persistance : JSON + verrouillage simple, conservation du top 10 par jour.

## Décision / Réponse

### Décisions actées

1. WebGL 3D

- Décision : utiliser Three.js.
- Raison : accélère fortement le développement et réduit le risque (scène, caméra, shaders/mesh, loaders), tout en restant WebGL.

2. Audio

- Décision : utiliser Howler.js.
- Formats cibles : fournir les effets sonores en `mp3` + `ogg`.
  - Raison : bon compromis compatibilité/poids ; Howler gère la sélection automatique.
  - Note : la source de travail peut être en `wav` côté production si besoin, mais les assets livrés au navigateur seront `mp3/ogg`.

3. Persistance “BDD fichiers” (Express)

- Décision : stockage en JSON.
- Contrainte : mono-instance.
- Conservation : conserver tout l’historique des scores (pas uniquement un agrégat top10).
- Stratégie d’écriture (implicite) : écriture atomique (fichier temporaire puis renommage) + verrou/mutex en mémoire pour sérialiser les écritures.

4. API score / classement

- Décision : endpoints minimaux uniquement.
  - `POST` score : OUI
  - `GET` top10 du jour : OUI
- Pas d’endpoint admin / purge / healthcheck dédié.

5. Europe/Paris (reset minuit)

- Décision : le “jour” est défini en Europe/Paris (reset à minuit Europe/Paris).
- Implication : les calculs “du jour” utilisent explicitement le fuseau `Europe/Paris` (ex: clé de jour `YYYY-MM-DD` en Europe/Paris), indépendamment du fuseau système.

### À intégrer

- Reporter ces décisions dans `docs/05-decisions-structurantes.md`.
- Retirer les points correspondants de « Décisions à prendre ».
