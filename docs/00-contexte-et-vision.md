# 00 — Contexte et vision

## 1. Contexte

Le projet consiste à réaliser un jeu de type « Space Invaders » sous forme d’application web.
Il doit inclure un front-end et un back-end, avec un rendu 3D en WebGL (librairie autorisée si besoin), des effets sonores, et un accent particulier sur la qualité visuelle.
Le projet prévoit également des classements entre joueurs basés sur le score.

## 2. Vision

Proposer une expérience « Space Invaders » moderne dans le navigateur, qui combine :

- un gameplay arcade simple et lisible,
- un rendu 3D soigné (WebGL),
- une ambiance sonore,
- une dimension compétitive via un classement des scores.

## 3. Objectifs

### 3.1 Objectifs produit

- Offrir un jeu jouable dans un navigateur web.
- Mettre en avant une qualité visuelle forte via un rendu 3D WebGL.
- Ajouter des effets sonores qui renforcent l’expérience.
- Permettre de comparer les performances via un classement par score.

### 3.2 Objectifs techniques (imposés)

- Front-end : ReactJS.
- Back-end : Express.
- Persistance : base de données « fichiers » (stockage sur le système de fichiers côté serveur).

## 4. Périmètre

### 4.1 Inclus (à ce stade)

- Jeu « Space Invaders » en 3D WebGL.
- Effets sonores.
- API back-end pour enregistrer et consulter des scores.
- Classement des joueurs (par score) : classement global, top 10 du jour.

### 4.2 Non précisé / à clarifier

Les éléments suivants ne sont pas spécifiés dans l’entrée et devront être clarifiés avant les décisions d’architecture et de spécification détaillée :

- Plateformes cibles (desktop uniquement ? mobile ?).
- Contrôles attendus (clavier/souris/manette/tactile).
- Mode de jeu (solo uniquement, ou autre).
- (Autres contraintes/règles de jeu non précisées dans l’entrée.)

## 5. Contraintes et principes

### 5.1 Contraintes

- Technologie web.
- Séparation front/back.
- ReactJS côté front.
- Express côté back.
- Stockage en fichiers pour les données.
- Rendu 3D via WebGL (librairie autorisée).
- Présence d’effets sonores.
- Focus sur la qualité visuelle.
- Présence d’un classement des joueurs basé sur le score.

### 5.2 Principes de réalisation (non décisionnels)

Sans ajouter de nouvelles exigences, on retient comme principes de travail :

- « D’abord jouable, ensuite polir » (stabiliser une boucle de jeu puis améliorer rendu/son).
- Mesurer la qualité visuelle via des critères concrets (fps, lisibilité, cohérence, feedbacks).

## 6. Risques et points d’attention

- WebGL 3D + qualité visuelle : risque de complexité et de performance selon le matériel/navigateur.
- Effets sonores : risques de contraintes navigateur (autoplay, latence, formats).
- Classement : le modèle anti-triche est volontairement simple (score envoyé par le client), donc risque de triche accepté.
- Stockage en fichiers : risques de concurrence d’écriture, sauvegarde, corruption, limites de scalabilité.

## 7. Critères de succès (observables)

- Le jeu est jouable de bout en bout dans un navigateur.
- Le rendu 3D WebGL est en place et visuellement soigné.
- Les effets sonores fonctionnent et sont audibles dans les principaux navigateurs.
- Un classement des scores est consultable.
- Un score peut être enregistré via le back-end.

## 8. Questions ouvertes

Ces questions sont à trancher explicitement (et seront journalisées en clarifications) :

1. Quelles plateformes sont ciblées (desktop, mobile) et quels contrôles ?
2. Mode de jeu (solo uniquement, ou autre) ?

Décisions actées (voir clarification 01) :

- Identité : pseudo libre (sans compte) et pseudo optionnel (anonyme possible).
- Classement : global, top 10, sur la journée.
- Anti-triche : modèle simple accepté (score envoyé par le client).
