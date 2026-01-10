# 01 — Utilisateurs & personas

## Rôle du document

Décrire qui utilise le produit (types d’utilisateurs), leurs objectifs, besoins, contraintes et irritants.
Ce document sert de base pour les parcours, user stories et priorisation.

## Sources

- `input/brief.md`
- `clarifications/01-classement-identite-et-anti-triche.md`
- `clarifications/02-utilisateurs-cibles-plateformes-et-controles.md` (CLOTUREE)

## Ce qui est acté (sans hypothèses)

- L’utilisateur est un joueur qui lance un jeu “Space Invaders” dans le navigateur.
- Plateforme cible : desktop uniquement.
- Contrôles : clavier (pas de souris, pas de tactile, pas de manette).
- Il existe un classement par score : global, top 10 du jour.
- Le joueur peut utiliser un pseudonyme libre (sans compte / sans mot de passe), mémorisé côté navigateur (ex: localStorage) et modifiable.
- Un score peut aussi apparaître comme anonyme.
- Options de confort : possibilité de mute ; réglages de sensibilité et de difficulté.
- Public visé : joueurs occasionnels, joueurs arcade/nostalgie, joueurs compétitifs (leaderboard) ; « 7 à 77 ans ».

## Personas

Les personas ci-dessous sont volontairement génériques : ils ne rajoutent pas de détails métier non présents dans les entrées. Ils servent à structurer les besoins (parcours/stories) à partir des profils validés.

### Persona P1 — Joueur occasionnel (desktop)

- Profil : joueur « grand public » (7 à 77 ans), cherche une session courte et simple.
- Contexte d’usage : navigateur sur desktop.
- Objectifs : jouer immédiatement ; comprendre rapidement ; faire un bon score.
- Besoins clés : contrôles clavier simples ; lisibilité visuelle ; possibilité de couper le son (mute).
- Attentes : un classement du jour (top 10) consultable ; pseudo optionnel (anonyme possible).
- Irritants / risques : friction au démarrage ; complexité de contrôle ; performance/latence qui gêne le gameplay.

### Persona P2 — Joueur arcade / nostalgie (desktop)

- Profil : apprécie l’esprit « Space Invaders » et l’esthétique ; sensible à la qualité visuelle.
- Contexte d’usage : navigateur sur desktop.
- Objectifs : retrouver la sensation arcade ; profiter du rendu 3D WebGL ; améliorer son score.
- Besoins clés : cohérence visuelle ; feedbacks audio (avec option mute) ; réglages (difficulté, sensibilité).
- Attentes : progression du score et comparaison via le top 10 du jour.
- Irritants / risques : rendu peu lisible ; manque de “polish” visuel/sonore ; réglages absents.

### Persona P3 — Joueur compétitif (leaderboard) (desktop)

- Profil : vise le haut du classement ; rejoue pour optimiser son score.
- Contexte d’usage : navigateur sur desktop.
- Objectifs : atteindre le top 10 du jour ; suivre sa position ; rejouer efficacement.
- Besoins clés : classement global journalier clair ; pseudo mémorisé côté navigateur et modifiable ; contrôles clavier fiables ; réglage de difficulté/sensibilité.
- Attentes : envoi du score et affichage dans le top 10 du jour ; pseudo optionnel/anonyme.
- Irritants / risques : incohérences d’enregistrement/affichage des scores ; manque de lisibilité du classement.

## Questions ouvertes

Les points suivants ne sont pas définis dans les entrées actuelles et pourront impacter les parcours et stories :

- Mapping exact des touches clavier.
- Contenu exact des réglages (sensibilité : quoi ? difficulté : quels niveaux ?).
