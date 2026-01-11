# 03 — User stories et flux

## Rôle du document

Décomposer le produit en user stories (orientées valeur) et décrire les principaux flux.
Ce document sert d’entrée à la spécification fonctionnelle.

## Sources

- `input/brief.md`
- `docs/00-contexte-et-vision.md`
- `docs/01-utilisateurs-personas.md`
- `docs/02-parcours-et-experience.md`
- `clarifications/01-classement-identite-et-anti-triche.md`
- `clarifications/02-utilisateurs-cibles-plateformes-et-controles.md`
- `clarifications/03-questions-ouvertes-parcours-et-ux.md`
- `clarifications/04-details-score-et-sensibilite.md`

## Rappel des décisions impactant les stories (acté)

- Desktop uniquement.
- Contrôles clavier : déplacements flèches + WASD ; tirer = espace ; pause = P ; mute = M.
- Rendu WebGL 3D + qualité visuelle.
- Sons + option mute.
- Réglages : difficulté (facile/normal/difficile) ; sensibilité = vitesse de déplacement (0.8x / 1.0x / 1.2x).
- Classement : global top 10 du jour, basé sur Europe/Paris.
- Identité : pseudo libre mémorisé côté navigateur, modifiable ; pseudo optionnel (anonyme possible).
- Score : basé sur ennemis tués + bonus et multiplicateurs ; pas de points “vague terminée”.
- Bonus : type d’ennemi / série de kills / précision ; bonus entre 1 et 1000 selon importance.
- Multiplicateurs : combo / temps / difficulté / streak ; déclenchés par certains types d’ennemis tués, durée prédéterminée, pas de plafond.
- Anti-triche : modèle simple accepté (score envoyé par le client).

## Épics

- E1 — Accueil & démarrage rapide
- E2 — Gameplay (boucle de jeu)
- E3 — Réglages & confort
- E4 — Score & fin de partie
- E5 — Classement (top 10 du jour)
- E6 — Robustesse UX (chargement/erreurs)

## User stories

### E1 — Accueil & démarrage rapide

**US-01 — Lancer une partie sans compte**

- En tant que joueur, je veux démarrer une partie rapidement, afin de jouer sans friction.
- Critères d’acceptation :
  - Un chemin clair “Démarrer” est disponible.
  - Aucun compte / mot de passe n’est requis.

**US-02 — Gérer le pseudo (optionnel)**

- En tant que joueur, je veux jouer avec un pseudo ou en anonyme, afin d’apparaître (ou non) au classement.
- Critères d’acceptation :
  - Si aucun pseudo n’est défini, l’UI propose pseudo ou anonyme.
  - Si un pseudo est défini, il est pré-rempli et modifiable.
  - Le pseudo est mémorisé côté navigateur.

**US-03 — Afficher les contrôles clavier**

- En tant que joueur, je veux connaître les touches, afin de jouer sans deviner.
- Critères d’acceptation :
  - Les touches sont affichées : flèches/WASD, espace, P, M.

### E2 — Gameplay (boucle de jeu)

**US-04 — Contrôler le vaisseau au clavier**

- En tant que joueur, je veux contrôler mon vaisseau au clavier, afin de jouer efficacement.
- Critères d’acceptation :
  - Déplacement possible via flèches et WASD.
  - Tir possible via espace.

**US-05 — Feedbacks visuels et sonores**

- En tant que joueur, je veux des feedbacks visuels et sonores, afin de comprendre l’action et ressentir le “polish”.
- Critères d’acceptation :
  - Les actions clés disposent de feedbacks (tir, impact, fin de partie).
  - Les sons sont désactivables (voir US-07).

**US-06 — Score en cours de partie**

- En tant que joueur, je veux voir mon score évoluer, afin de suivre ma performance.
- Critères d’acceptation :
  - Le score est visible pendant la partie.
  - Le score correspond aux règles actées (ennemis + bonus + multiplicateurs).

### E3 — Réglages & confort

**US-07 — Mute (switch)**

- En tant que joueur, je veux pouvoir couper/réactiver le son, afin de jouer sans déranger.
- Critères d’acceptation :
  - La touche M bascule l’état mute.
  - L’état est visible dans l’UI.

**US-08 — Mettre en pause**

- En tant que joueur, je veux mettre le jeu en pause, afin de faire une pause.
- Critères d’acceptation :
  - La touche P met en pause et reprend.

**US-09 — Choisir la difficulté**

- En tant que joueur, je veux choisir une difficulté (facile/normal/difficile), afin d’adapter le challenge.
- Critères d’acceptation :
  - Les 3 niveaux existent et sont sélectionnables.
  - Le choix a un impact global sur le jeu (vitesse ennemis, fréquence tirs, vies, etc.).

**US-10 — Choisir la sensibilité**

- En tant que joueur, je veux choisir une sensibilité (faible/moyen/fort), afin d’adapter la vitesse de déplacement.
- Critères d’acceptation :
  - 3 presets existent.
  - Les ratios sont : 0.8x / 1.0x / 1.2x.
  - Le preset modifie la vitesse de déplacement.

### E4 — Score & fin de partie

**US-11 — Écran de fin de partie**

- En tant que joueur, je veux voir un écran de fin de partie, afin de connaître mon score final.
- Critères d’acceptation :
  - Le score final est affiché.
  - Une action “Rejouer” est disponible.

**US-12 — Enregistrer le score**

- En tant que joueur, je veux enregistrer mon score, afin d’apparaître potentiellement au top 10 du jour.
- Critères d’acceptation :
  - L’utilisateur peut envoyer un score avec pseudo ou en anonyme.
  - Une confirmation succès/échec est affichée.

### E5 — Classement (top 10 du jour)

**US-13 — Voir le top 10 du jour**

- En tant que joueur, je veux consulter le top 10 du jour, afin de comparer les scores.
- Critères d’acceptation :
  - Affichage du top 10.
  - La période est explicitée : “du jour” selon Europe/Paris.

**US-14 — Afficher pseudo ou anonyme**

- En tant que joueur, je veux que le classement affiche le pseudo ou “Anonyme”, afin que l’identité soit cohérente.
- Critères d’acceptation :
  - Entrée score = pseudo ou anonyme.

### E6 — Robustesse UX (chargement/erreurs)

**US-15 — Écran de chargement WebGL**

- En tant que joueur, je veux voir un état de chargement, afin de comprendre l’attente au démarrage.
- Critères d’acceptation :
  - Un état “chargement/initialisation” est visible.

**US-16 — Erreur WebGL non supporté**

- En tant que joueur, je veux un message clair si WebGL ne fonctionne pas, afin de comprendre pourquoi je ne peux pas jouer.
- Critères d’acceptation :
  - Un message non technique indique l’incompatibilité.

**US-17 — Échec enregistrement score (non bloquant)**

- En tant que joueur, je veux pouvoir continuer à jouer même si l’enregistrement échoue, afin de ne pas être bloqué.
- Critères d’acceptation :
  - L’échec est signalé, mais “Rejouer” reste possible.

## Flux (niveau fonctionnel)

### F1 — Démarrage + pseudo

1. Ouverture du jeu (desktop).
2. Affichage des contrôles et accès rapide “Démarrer”.
3. Gestion pseudo : pré-rempli si existant, sinon choix pseudo ou anonyme.
4. (Optionnel) réglages difficulté + sensibilité ; mute.
5. Démarrage partie.

### F2 — En cours de jeu

1. Déplacements via flèches/WASD.
2. Tir via espace.
3. Pause via P.
4. Mute via M.
5. Score visible.

### F3 — Fin de partie + enregistrement score

1. Game over → affichage score final.
2. Action “Enregistrer le score” :
   - pseudo si présent, sinon anonyme.
3. Confirmation succès/échec.
4. Affichage top 10 du jour.
5. Rejouer.

### F4 — Consultation classement

1. Accès au classement.
2. Affichage top 10 du jour (Europe/Paris) avec pseudo/anonyme.

## Points à préciser plus tard (si besoin)

- Détail des valeurs exactes par bonus (répartition des 1..1000 par type/condition) : spécifié (MVP) dans `clarifications/08-bareme-bonus.md`.
- Liste précise des “types d’ennemis” qui déclenchent un multiplicateur et les durées associées.
