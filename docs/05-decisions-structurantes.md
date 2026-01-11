# 05 — Décisions structurantes

## Rôle du document

Consigner les décisions qui structurent durablement le produit (fonctionnel + technique) et leurs raisons, afin d’éviter les ambiguïtés et de garder une traçabilité.

## Sources

- `input/brief.md`
- `docs/00-contexte-et-vision.md`
- `docs/01-utilisateurs-personas.md`
- `docs/02-parcours-et-experience.md`
- `docs/03-user-stories-et-flux.md`
- `docs/04-specification-fonctionnelle.md`
- `clarifications/01-classement-identite-et-anti-triche.md`
- `clarifications/02-utilisateurs-cibles-plateformes-et-controles.md`
- `clarifications/03-questions-ouvertes-parcours-et-ux.md`
- `clarifications/04-details-score-et-sensibilite.md`
- `clarifications/05-choix-techniques-stack-et-stockage.md`
- `clarifications/12-vite.md`

## Décisions actées

### D-01 — Application web avec front + back

- Décision : application web avec un front-end et un back-end.
- Source : `input/brief.md`.

### D-02 — Front-end en ReactJS

- Décision : le front-end est en ReactJS.
- Source : `input/brief.md`.

### D-03 — Back-end en Express

- Décision : le back-end est en Express.
- Source : `input/brief.md`.

### D-04 — Persistance en base fichiers

- Décision : la persistance serveur utilise une “BDD fichiers” (stockage sur le système de fichiers).
- Source : `input/brief.md`.

### D-05 — Rendu 3D en WebGL (librairie autorisée)

- Décision : rendu WebGL 3D ; utilisation d’une librairie autorisée si besoin.
- Motivation : qualité visuelle.
- Source : `input/brief.md`.

### D-06 — Effets sonores + mute

- Décision : effets sonores + possibilité de mute.
- Source : `input/brief.md`, `clarifications/02-utilisateurs-cibles-plateformes-et-controles.md`, `clarifications/03-questions-ouvertes-parcours-et-ux.md`.

### D-07 — Plateforme cible : desktop uniquement

- Décision : desktop uniquement (pas de mobile/tablette).
- Source : `clarifications/02-utilisateurs-cibles-plateformes-et-controles.md`.

### D-08 — Contrôles clavier uniquement (mapping fixé)

- Décision : clavier uniquement.
- Mapping :
  - Déplacements : flèches + WASD
  - Tir : espace
  - Pause : P
  - Mute : M (toggle)
- Source : `clarifications/02-utilisateurs-cibles-plateformes-et-controles.md`, `clarifications/03-questions-ouvertes-parcours-et-ux.md`.

### D-09 — Réglages disponibles (difficulté & sensibilité)

- Décision : réglages de difficulté et de sensibilité.
- Difficulté : facile / normal / difficile (impact global sur le jeu).
- Paramètres de difficulté (MVP) : voir `clarifications/10-parametres-difficulte.md`.
- Sensibilité : vitesse de déplacement avec presets :
  - faible = 0.8x
  - moyen = 1.0x
  - fort = 1.2x
- Source : `clarifications/02-utilisateurs-cibles-plateformes-et-controles.md`, `clarifications/03-questions-ouvertes-parcours-et-ux.md`, `clarifications/04-details-score-et-sensibilite.md`, `clarifications/10-parametres-difficulte.md`.

### D-10 — Classement : global top 10 du jour (Europe/Paris)

- Décision : classement global, top 10, “du jour”.
- Temps : référence Europe/Paris (reset minuit Europe/Paris).
- Source : `clarifications/01-classement-identite-et-anti-triche.md`, `clarifications/03-questions-ouvertes-parcours-et-ux.md`.

### D-11 — Identité joueur sans compte (pseudo optionnel)

- Décision : pas de compte / pas de mot de passe.
- Pseudo libre optionnel :
  - mémorisé côté navigateur (ex: localStorage)
  - modifiable
  - anonyme possible
- Motivation : démarrage rapide, faible friction.
- Source : `clarifications/01-classement-identite-et-anti-triche.md`.

### D-12 — Anti-triche : modèle simple accepté

- Décision : le score est envoyé par le client et accepté côté serveur (pas de validation serveur avancée).
- Motivation : simplicité ; pas d’intérêt à “améliorer le score d’un concurrent”.
- Source : `clarifications/01-classement-identite-et-anti-triche.md`.

### D-13 — Score : ennemis + bonus + multiplicateurs

- Décision : score basé sur ennemis tués, avec bonus et multiplicateurs.
- Bonus : type d’ennemi / série de kills / précision (ordre de grandeur 1..1000).
- Multiplicateurs : combo / temps / difficulté / streak ; déclenchés par certains types d’ennemis, durée prédéterminée, pas de plafond.
- Pas de points spécifiques “vague terminée”.
- Source : `clarifications/03-questions-ouvertes-parcours-et-ux.md`, `clarifications/04-details-score-et-sensibilite.md`.

### D-14 — Librairie WebGL : Three.js

- Décision : utiliser Three.js pour le rendu 3D (au-dessus de WebGL).
- Motivation : réduire le risque et le temps (scène/caméra/objets, gestion des assets, outillage).
- Source : `clarifications/05-choix-techniques-stack-et-stockage.md`.

### D-15 — Audio : Howler.js + formats mp3/ogg

- Décision : utiliser Howler.js pour les effets sonores et le contrôle du mute.
- Formats livrés au navigateur : mp3 + ogg.
- Motivation : compatibilité/poids et API simple.
- Source : `clarifications/05-choix-techniques-stack-et-stockage.md`.

### D-16 — Persistance : JSON, mono-instance, historique complet

- Décision : stocker côté serveur en fichiers JSON.
- Contrainte : mono-instance (un seul process serveur écrit).
- Données : conserver tout l’historique des scores.
- Note d’implémentation attendue : écritures atomiques et sérialisation des écritures (mutex en mémoire) pour éviter la corruption.
- Source : `clarifications/05-choix-techniques-stack-et-stockage.md`.

### D-17 — API : endpoints minimaux score & top10 du jour

- Décision : API minimale.
  - `POST` score
  - `GET` top10 du jour
- Décision : pas d’endpoint admin / purge / healthcheck dédié.
- Source : `clarifications/05-choix-techniques-stack-et-stockage.md`.

### D-18 — Définition du “jour” : Europe/Paris (reset minuit)

- Décision : la journée de classement est définie en Europe/Paris (reset à minuit Europe/Paris).
- Implication : calcul explicite en fuseau `Europe/Paris` (pas dépendant du fuseau système).
- Source : `clarifications/05-choix-techniques-stack-et-stockage.md`.

### D-19 — Outillage JS : Bun (1.3.5) + Vite côté front

- Décision : utiliser **Bun** comme outil principal pour le projet (gestion des dépendances, exécution de scripts) et comme **runtime** côté serveur.
- Version : **Bun 1.3.5 verrouillée** (dev, CI et prod).
- Décision : côté front-end, utiliser **Vite** comme outillage de dev/build (projet React basé sur Vite).
- Convention : lors de la construction/initialisation du projet, privilégier les commandes d’installation/initialisation (ex: `bun create …`, `bun install …`).
- Source : `clarifications/12-vite.md`.

### D-20 — Langage : TypeScript (front + back)

- Décision : utiliser **TypeScript** pour le front et le back (extensions `.tsx/.ts`).
- Motivation : cohérence de codebase et réduction des erreurs ; permet un step CI “lint + typecheck” cohérent avec `docs/09-cicd-et-deploiement.md`.
- Note : côté serveur, **Bun exécute le TypeScript** (pas besoin de compiler TS→JS pour exécuter) ; côté front, le build reste assuré par Vite.
- Source : décision projet (todo `id007`) + cadre `docs/07-guidelines-developpement.md` et `docs/09-cicd-et-deploiement.md`.

## Décisions à prendre (non actées)

Les choix ci-dessous structurent l’architecture et devront être tranchés avant d’écrire `docs/06-architecture-technique.md`.

- Stratégie d’hébergement/déploiement (si contrainte).
