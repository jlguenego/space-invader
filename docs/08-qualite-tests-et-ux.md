# 08 — Qualité, tests et UX

## Rôle du document

Définir le niveau de qualité attendu pour le MVP, les tests minimums (priorités) et les exigences UX (clarté, accessibilité de base, messages d’erreur), sans sur-spécifier.

## Sources

- `docs/04-specification-fonctionnelle.md`
- `docs/06-architecture-technique.md`
- `docs/07-guidelines-developpement.md`

## 1. Qualité (définition MVP)

Le MVP est considéré “qualitatif” si :

- Le jeu tourne de façon fluide sur desktop (navigateurs modernes).
- Les contrôles sont réactifs et fiables (pas de touches “perdues”).
- Les états clés sont robustes : init WebGL, jeu, pause, fin de partie, classement.
- Les erreurs réseau n’empêchent pas de rejouer (dégradation gracieuse).
- Le mute (M) fonctionne immédiatement et de manière persistante.

## 2. UX : principes

- Clarté : afficher les contrôles (flèches/WASD, espace, P, M) dès l’accueil.
- Feedback : son + visuel lors des tirs/impacts (si non mute).
- Lecture : HUD lisible (score, état pause, mute).
- États d’attente : chargement explicite lors de l’initialisation (assets, WebGL).
- Erreurs : messages non techniques (ex: “Impossible d’enregistrer le score, réessaie plus tard”).

## 3. Accessibilité (socle minimal)

- Navigation clavier complète dans les menus.
- Focus visible sur les éléments interactifs.
- Contraste suffisant pour les textes UI importants.
- Option “mute” accessible sans souris (touche M) + via UI.

## 4. Observabilité (MVP)

- Logs côté serveur :
  - démarrage, chargement/écriture fichier JSON,
  - erreurs d’écriture,
  - erreurs de validation requêtes.
- Logs côté client (dev) : erreurs init WebGL/audio, erreurs API.

## 5. Tests : stratégie

### 5.1 Priorités

1. Back-end : préserver l’intégrité des données et les règles “du jour”.
2. Fonctions pures : scoring et règles (facile à tester, gros ROI).
3. Sanity tests end-to-end manuels (checklist).

### 5.2 Back-end (recommandé)

- Validation `POST /api/scores` :
  - score manquant/non numérique, score < 0,
  - pseudo vide/null → “Anonyme”,
  - pseudo trop long (rejet).
- Calcul `dayKeyParis` :
  - différents instants UTC qui tombent sur la même journée Paris,
  - transition heure d’été/hiver (cas non régressif).
- `GET /api/leaderboard/day` :
  - filtre par `dayKeyParis`,
  - tri décroissant des scores,
  - top 10 (cap à 10).
- Persistance :
  - écriture atomique (fichier final non corrompu),
  - sérialisation via mutex (pas d’interleaving).

### 5.3 Front-end (recommandé)

- Input mapping : WASD + flèches, espace, P, M.
- Mute : persistance + effet immédiat.
- Scoring : tests sur fonctions pures (bonus/multiplicateurs).

## 6. Checklists de test manuel (avant démo)

- Démarrage : l’accueil s’affiche, réglages modifiables, contrôles visibles.
- Lancement partie : rendu 3D OK, HUD OK.
- Contrôles : déplacement (WASD + flèches), tir (espace), pause (P).
- Mute : toggle (M) coupe/remet les sons, icône/indication cohérente.
- Fin de partie : écran score final, option enregistrer, option classement.
- Réseau down (simulé) : enregistrement échoue avec message clair, rejouer possible.
- Classement : top10 du jour visible, pseudo/anonyme affichés.

## 7. Critères de sortie (DoD) pour une feature

- Fonctionnel : AC respectés (docs 03/04).
- Tests : au moins 1 test unitaire quand pertinent (ou justification).
- UX : message clair en cas d’erreur.
- Non-régression : pas de crash sur pause/reprise.
