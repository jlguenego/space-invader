# 02 — Parcours et expérience

## Rôle du document

Décrire les parcours utilisateurs (end-to-end) et l’expérience attendue, sans entrer dans les détails techniques.
Ce document prépare les user stories, les flux et la spécification fonctionnelle.

## Sources

- `input/brief.md`
- `docs/00-contexte-et-vision.md`
- `docs/01-utilisateurs-personas.md`
- `clarifications/01-classement-identite-et-anti-triche.md`
- `clarifications/02-utilisateurs-cibles-plateformes-et-controles.md`

## Cadre d’expérience (acté)

- Plateforme : desktop.
- Contrôles : clavier uniquement.
- Mapping touches :
  - Déplacements : flèches et WASD.
  - Tir : espace.
  - Pause : P.
  - Mute (switch) : M.
- Audio : effets sonores + option de mute.
- Rendu : WebGL 3D (librairie autorisée), accent sur la qualité visuelle.
- Classement : global, top 10 du jour.
- Référence “jour” : heure France/Paris (reset à minuit Europe/Paris).
- Identité : pseudo libre (sans compte) mémorisé côté navigateur (ex: localStorage), modifiable ; pseudo optionnel (anonyme possible).
- Anti-triche : modèle simple accepté (score envoyé par le client).
- Réglages :
  - Sensibilité = vitesse de déplacement (presets : faible / moyen / fort).
  - Difficulté : facile / normal / difficile (impact global : vitesse ennemis, fréquence tirs, nombre de vies, etc.).
- Score : basé sur les ennemis tués, avec bonus et multiplicateurs (pas de points “vague terminée”).

## Principes UX (directement liés aux contraintes)

- Démarrage rapide : pouvoir lancer une partie sans création de compte.
- Lisibilité en priorité : malgré la 3D, l’action doit rester claire.
- Feedbacks immédiats : visuels + sonores sur les actions clés (tir, hit, dégâts, fin de partie).
- Contrôle clavier fiable : latence minimale et comportements consistants.
- Confort : mute et réglages (difficulté, sensibilité) accessibles.
- Classement compréhensible : montrer clairement le top 10 du jour et l’identité (pseudo/anonyme).

## Parcours 1 — Première visite : lancer une partie

### Déclencheur

Le joueur arrive sur l’application web depuis un navigateur desktop.

### Étapes (niveau intention)

1. Découvrir l’écran d’accueil (jeu + entrée vers démarrer).
2. Vérifier/choisir un pseudo (facultatif) :
   - si aucun pseudo n’est défini, proposer de jouer en anonyme ou de saisir un pseudo,
   - si un pseudo est déjà mémorisé, l’afficher et permettre modification.
3. (Optionnel) Ajuster les réglages (difficulté, sensibilité) et/ou activer le mute.
4. Démarrer une partie.

### Résultat attendu

- Le joueur est en jeu rapidement.
- Le mode d’identification (pseudo/anonyme) est clair sans compte.

### Points d’attention

- Expliquer que les contrôles sont au clavier (flèches/WASD) et rappeler les touches clés (espace/P/M).

## Parcours 2 — Jouer : boucle de gameplay

### Déclencheur

La partie est démarrée.

### Étapes

1. Le joueur contrôle son vaisseau au clavier et interagit (tir, déplacements).
2. Le joueur reçoit des feedbacks visuels/sonores cohérents.
3. Le score évolue pendant la partie.
4. Le joueur peut accéder au confort : mute et réglages (si disponibles en jeu ou via pause).

### Résultat attendu

- Gameplay fluide et lisible.
- Les feedbacks (son/visuel) renforcent l’expérience.

### Points d’attention

- Performance : maintenir une expérience stable malgré la 3D.

## Parcours 3 — Fin de partie : score, enregistrement, classement

### Déclencheur

Le joueur perd la partie (game over).

### Étapes

1. Afficher le score final.
2. Proposer d’enregistrer le score pour le classement du jour :
   - si pseudo : envoyer (pseudo + score),
   - si anonyme : envoyer (anonyme + score).
3. Confirmer l’enregistrement (succès/échec) de manière claire.
4. Afficher le top 10 du jour et la position si applicable (si le score est dans le top 10).
5. Proposer actions : rejouer, retourner à l’accueil, modifier pseudo/réglages.

### Résultat attendu

- Le joueur comprend si son score est enregistré.
- Le classement du jour est facilement consultable.

### Points d’attention

- Anti-triche : risque accepté ; l’UX ne doit pas suggérer une robustesse « e-sport ».

## Parcours 4 — Consultation du classement (sans jouer)

### Déclencheur

Le joueur souhaite voir le top 10 du jour.

### Étapes

1. Accéder au classement.
2. Voir le top 10 (pseudo ou anonyme + score).
3. Comprendre qu’il s’agit du classement du jour (période journalière).

### Résultat attendu

- Le classement est lisible et simple.

## Parcours 5 — Retour d’un joueur : pseudo mémorisé

### Déclencheur

Le joueur revient sur le site sur le même navigateur.

### Étapes

1. Le pseudo mémorisé est pré-rempli (modifiable).
2. Le joueur lance une partie rapidement.
3. Il vise éventuellement le top 10 du jour.

### Résultat attendu

- La reprise est rapide, sans friction.

## Expérience : états et messages (minimum)

- Chargement / initialisation WebGL : expliquer qu’un chargement est en cours.
- Erreur de rendu WebGL : indiquer que le navigateur/matériel ne supporte pas (message clair).
- Enregistrement score échoue : permettre de rejouer sans bloquer ; message non technique.

## Questions ouvertes (impact sur parcours et stories)

La clarification 03 fixe les points précédemment ouverts.
Restent éventuellement à préciser (si nécessaire pour la suite) :

- Valeurs exactes derrière les presets de sensibilité (faible/moyen/fort).
- Détails “bonus et multiplicateurs” (quand/combien) si on veut des flux très précis.
