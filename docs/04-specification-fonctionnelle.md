# 04 — Spécification fonctionnelle

## Rôle du document

Décrire précisément les fonctionnalités attendues (comportements, règles, données, cas d’erreur) sans détailler l’implémentation technique.

## Sources

- `input/brief.md`
- `docs/00-contexte-et-vision.md`
- `docs/01-utilisateurs-personas.md`
- `docs/02-parcours-et-experience.md`
- `docs/03-user-stories-et-flux.md`
- `clarifications/01-classement-identite-et-anti-triche.md`
- `clarifications/02-utilisateurs-cibles-plateformes-et-controles.md`
- `clarifications/03-questions-ouvertes-parcours-et-ux.md`
- `clarifications/04-details-score-et-sensibilite.md`

## 1. Périmètre fonctionnel (MVP)

Inclus :

- Jeu type Space Invaders en application web (desktop).
- Rendu 3D via WebGL (librairie autorisée) + qualité visuelle.
- Effets sonores + mute.
- Contrôles clavier (flèches/WASD, espace, P, M).
- Réglages : difficulté (facile/normal/difficile) et sensibilité (faible/moyen/fort).
- Score (ennemis + bonus + multiplicateurs).
- Classement : top 10 du jour, global, basé sur Europe/Paris.
- Identité joueur : pseudo libre optionnel, mémorisé côté navigateur ; anonyme possible.
- Back-end : enregistrement et consultation des scores (persistance fichiers).

Hors périmètre (non défini dans les entrées) :

- Comptes utilisateurs / authentification.
- Mobile/tablette, manette, tactile.
- Anti-triche avancée / validation serveur du score.

## 2. Acteurs

- Joueur (unique acteur).

## 3. Données

### 3.1 Pseudo

- Champ optionnel.
- Stocké côté navigateur.
- Modifiable.
- Si absent : le joueur est considéré “Anonyme” pour le classement.

### 3.2 Score

- Score calculé à partir :
  - ennemis tués,
  - bonus,
  - multiplicateurs.
- Aucun point attribué spécifiquement pour “vague terminée”.

### 3.3 Entrée de classement

Chaque score enregistré doit permettre d’afficher au minimum :

- un libellé d’identité (pseudo ou “Anonyme”),
- une valeur de score,
- un ancrage temporel “jour” basé sur Europe/Paris (pour le top 10 du jour).

## 4. Contrôles (clavier)

- Déplacements : flèches et WASD.
- Tir : espace.
- Pause : P.
- Mute (toggle) : M.

## 5. Réglages

### 5.1 Difficulté

- Valeurs : facile / normal / difficile.
- Effets : impact global sur le jeu (exemples cités : vitesse ennemis, fréquence tirs, nombre de vies, etc.).

### 5.2 Sensibilité

- Sensibilité = vitesse de déplacement.
- Presets :
  - Faible : 0.8x
  - Moyen : 1.0x
  - Fort : 1.2x

## 6. Écrans / états

### 6.1 Accueil

Doit permettre :

- Démarrer une partie.
- Voir/éditer le pseudo (ou choisir anonyme).
- Accéder aux réglages (difficulté, sensibilité).
- Voir les contrôles.

### 6.2 En jeu

Doit afficher :

- Le score en cours.
- Un indicateur d’état mute (au minimum).
  Doit permettre :
- Jouer (déplacements/tir).
- Pause (P).
- Mute (M).

### 6.3 Pause

- Mettre le jeu en pause et reprendre via P.

### 6.4 Fin de partie

Doit afficher :

- Le score final.
  Doit proposer :
- Rejouer.
- Enregistrer le score (pseudo ou anonyme).
- Voir le top 10 du jour.

### 6.5 Classement (top 10 du jour)

- Affiche 10 entrées maximum.
- Affiche pour chaque entrée : pseudo ou “Anonyme” + score.
- Période : “du jour” basée sur Europe/Paris (reset à minuit Europe/Paris).

### 6.6 Chargement / erreurs

- Chargement/initialisation WebGL : état explicite.
- WebGL non supporté : message clair non technique.
- Échec d’enregistrement score : message clair, non bloquant (rejouer possible).

## 7. Règles fonctionnelles

### 7.1 Top 10 du jour (Europe/Paris)

- Le classement est calculé sur la journée courante au sens Europe/Paris.
- Reset à minuit Europe/Paris.
- Classement global : pas de segmentation par utilisateur.

### 7.2 Enregistrement d’un score

- Un score peut être envoyé depuis le client avec :
  - pseudo (optionnel) et score.
- Le modèle anti-triche est volontairement simple : le serveur accepte le score tel quel.

### 7.3 Bonus (définition)

- Types de bonus :
  - type d’ennemi,
  - série de kills (streak),
  - précision.
- Ordre de grandeur : 1 à 1000 points selon l’importance.
- Barème chiffré (MVP) : voir `clarifications/08-bareme-bonus.md`.

### 7.4 Multiplicateurs (définition)

- Types : combo, temps, difficulté, streak.
- Déclenchement : lorsqu’un certain type d’ennemi est tué.
- Durée : prédéterminée.
- Plafond : aucun.

## 8. Points à préciser (non bloquants pour la structure)

- Barème exact des bonus (valeurs par type/condition) : spécifié dans `clarifications/08-bareme-bonus.md`.
- Liste précise des types d’ennemis déclenchant les multiplicateurs et durées associées.

## 9. Critères d’acceptation globaux

- Le jeu est jouable sur desktop au clavier (flèches/WASD + espace + P + M).
- Le rendu WebGL 3D est en place, avec une qualité visuelle travaillée.
- Les effets sonores fonctionnent et le mute est disponible.
- Les réglages difficulté et sensibilité existent.
- Le score s’affiche et se sauvegarde côté serveur.
- Le top 10 du jour (Europe/Paris) est consultable.
