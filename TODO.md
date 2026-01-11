# TODO — Space Invaders Web (React + Express)

Cette TODO liste décrit, de manière exécutable, les étapes pour implémenter le MVP (jeu 3D WebGL + sons + classement) et livrer l’exploitation/CI/CD associées.
Elle est basée uniquement sur le référentiel [/docs](docs/) (et clarifications associées) et reflète l’état actuel du dépôt (pas de code encore, pas de dossier [/project](project/)).

## Hypothèses & zones à clarifier

- HTTPS sans domaine : préciser la stratégie de certificat (domaine non requis mais HTTPS requis).
- Barème exact des bonus (valeurs chiffrées) et règles exactes des multiplicateurs (ennemis déclencheurs + durées).
- Paramètres exacts des difficultés (quels effets, quelles valeurs : vitesse ennemis, cadence tirs, vies, etc.).
- Définition opérationnelle de “qualité visuelle” (assets attendus, style, budget perf cible/fps).
- Choix JS vs TS (les docs laissent la possibilité ; les conventions/CI doivent s’aligner).
- Politique de rétention/croissance de [project/server/data/scores.json](project/server/data/scores.json) (acceptée MVP, mais seuils d’alerte à définir).

## Plan de livraison

- Phase 0 — Cadrage & repo : créer [/project](project/), outillage, conventions, scripts.
- Phase 1 — Back-end MVP : API (POST score, GET top10 du jour), persistance JSON atomique, timezone Europe/Paris, tests.
- Phase 2 — Front-end MVP : shell UI + boucle de jeu (Three.js), input clavier, audio (Howler), scoring, intégration API.
- Phase 3 — Qualité : UX (états/erreurs), accessibilité minimale, perfs, observabilité.
- Phase 4 — Livraison : Docker/Compose (mono-instance + bind mount), GitHub Actions, procédure de déploiement.
- Phase 5 — Documentation : installation, usage, exploitation/runbook, troubleshooting.

## Backlog détaillé

### Épique A — Cadrage & clarifications

- [x] **id001** **(P0)** _(S)_ Clarifier la stratégie HTTPS “sans domaine”

  - **But :** rendre le déploiement prod conforme (HTTPS requis, domaine non requis).
  - **Livrable :** décision documentée (reverse-proxy/certificat) + variables/env nécessaires.
  - **Acceptation :** une procédure reproductible permet d’obtenir HTTPS sur VPS OVH sans dépendre d’un domaine.
  - **Dépendances :** Aucune.
  - **Docs sources :** [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Déploiement (décisions actées)” ; [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) → “Sécurité (minimum)” ; [/clarifications/06-deploiement-et-hebergement.md](clarifications/06-deploiement-et-hebergement.md).

- [x] **id002** **(P1)** _(S)_ Clarifier le barème des bonus (valeurs chiffrées)

  - **But :** éviter un scoring arbitraire non conforme.
  - **Livrable :** table de valeurs (type d’ennemi, streak, précision) + exemples.
  - **Acceptation :** les règles du score peuvent être implémentées sans “choisir au hasard”.
  - **Dépendances :** Aucune.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Bonus (définition)” ; [/docs/03-user-stories-et-flux.md](docs/03-user-stories-et-flux.md) → “Points à préciser plus tard”.

- [x] **id003** **(P1)** _(S)_ Clarifier les déclencheurs/durées des multiplicateurs

  - **But :** rendre les multiplicateurs implémentables et testables.
  - **Livrable :** liste des types d’ennemis déclencheurs + durée + multiplicateur associé.
  - **Acceptation :** un test unitaire peut valider les règles de multiplicateur.
  - **Dépendances :** Aucune.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Multiplicateurs (définition)” ; [/docs/03-user-stories-et-flux.md](docs/03-user-stories-et-flux.md) → “Points à préciser plus tard”.

- [ ] **id004** **(P1)** _(S)_ Clarifier les paramètres des difficultés (facile/normal/difficile)

  - **But :** traduire “impact global” en paramètres de jeu concrets.
  - **Livrable :** tableau des paramètres par difficulté (ex: vitesse ennemis, cadence tirs, vies…).
  - **Acceptation :** un changement de difficulté entraîne un comportement observable et cohérent.
  - **Dépendances :** Aucune.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Difficulté” ; [/docs/02-parcours-et-experience.md](docs/02-parcours-et-experience.md) → “Cadre d’expérience (acté)”.

- [ ] **id005** **(P2)** _(S)_ Vérifier/valider un budget perf cible (fps) et contraintes de rendu
  - **But :** cadrer la “qualité visuelle” et le risque WebGL 3D.
  - **Livrable :** cible (ex: fps minimum) + checklist perf (draw calls, assets) adaptée au MVP.
  - **Acceptation :** la DoD inclut un critère perf vérifiable sur desktop.
  - **Dépendances :** Aucune.
  - **Docs sources :** [/docs/00-contexte-et-vision.md](docs/00-contexte-et-vision.md) → “Risques” ; [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Qualité (définition MVP)”.

### Épique B — Structure repo & outillage (dans [/project](project/))

- [ ] **id006** **(P0)** _(S)_ Créer le répertoire [/project](project/) et y poser la structure monorepo

  - **But :** respecter la contrainte de repo (code/config/docs générées sous [/project](project/)).
  - **Livrable :** arborescence [/project/client](project/client/) + [/project/server](project/server/) + fichiers racine (README, scripts).
  - **Acceptation :** tout le code exécutable et la config de build peuvent vivre et tourner depuis [/project](project/).
  - **Dépendances :** Aucune.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “Front-end/Back-end structure proposée” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Organisation des dossiers (cible)”.

- [ ] **id007** **(P0)** _(S)_ Décider et documenter JS vs TypeScript (front et back)

  - **But :** aligner build, lint, CI et conventions.
  - **Livrable :** décision (JS/TS) + impacts (scripts, config, typecheck ou non).
  - **Acceptation :** le pipeline CI (lint/typecheck) est cohérent avec la décision.
  - **Dépendances :** id006.
  - **Docs sources :** [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Lint + typecheck (si TS)” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Style & format”.

- [ ] **id008** **(P0)** _(M)_ Mettre en place scripts de dev (front/back) et conventions de formatage

  - **But :** rendre le développement reproductible.
  - **Livrable :** scripts `dev`, `build`, `test`, `lint` (ou équivalents) ; config format (ex: Prettier).
  - **Acceptation :** un dev peut lancer front+back en local avec une commande.
  - **Dépendances :** id006, id007.
  - **Docs sources :** [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Style & format” ; [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Stratégie de build / Vérifications en CI”.

- [ ] **id009** **(P0)** _(S)_ Configurer [project/.gitignore](project/.gitignore) et la gestion de [project/server/data/](project/server/data/)
  - **But :** éviter de committer des données runtime.
  - **Livrable :** règles `.gitignore` + (optionnel) un fichier d’exemple vide/versionné.
  - **Acceptation :** les données persistées en local/prod ne sont pas versionnées.
  - **Dépendances :** id006.
  - **Docs sources :** [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Git & hygiène de repo” ; [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Persistance fichiers (indispensable)”.

### Épique C — Back-end (Express) : API + persistance JSON

- [ ] **id010** **(P0)** _(M)_ Initialiser l’app Express et la base `/api`

  - **But :** fournir le socle serveur (middlewares, routing, erreurs) pour l’API MVP.
  - **Livrable :** serveur Express avec routes sous `/api` et réponse d’erreur JSON cohérente.
  - **Acceptation :** l’app démarre, répond 404/erreurs avec un format stable sans stacktrace en prod.
  - **Dépendances :** id006, id007.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “Back-end structure proposée” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Gestion d’erreurs / API”.

- [ ] **id011** **(P0)** _(S)_ Implémenter le calcul `dayKeyParis` (Europe/Paris explicite)

  - **But :** respecter la règle “top 10 du jour” en Europe/Paris.
  - **Livrable :** service time `UTC → dayKeyParis (YYYY-MM-DD)` explicitement en `Europe/Paris`.
  - **Acceptation :** des tests couvrent des instants UTC différents et les transitions d’heure d’été/hiver.
  - **Dépendances :** id010.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “Gestion du fuseau Europe/Paris” ; [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Tests : dayKeyParis”.

- [ ] **id012** **(P0)** _(M)_ Implémenter le repository de scores (lecture/écriture JSON, mutex, écriture atomique)

  - **But :** persister de façon robuste en mono-instance sans corruption.
  - **Livrable :** module de stockage pour [project/server/data/scores.json](project/server/data/scores.json) avec `.tmp` + rename et sérialisation.
  - **Acceptation :** tests unitaires/integ valident l’absence d’interleaving et un JSON final valide.
  - **Dépendances :** id010.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “Stratégie d’écriture (anti-corruption)” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Persistance JSON (mono-instance)”.

- [ ] **id013** **(P0)** _(M)_ Implémenter `POST /api/scores` (validation + normalisation pseudo)

  - **But :** enregistrer un score (anti-triche simple accepté) avec règles de validation.
  - **Livrable :** endpoint `POST /api/scores` qui valide `score` et normalise `pseudo` (trim, max length, “Anonyme”).
  - **Acceptation :** cas 201/400/500 conformes, payload size limitée, pseudo vide/null → “Anonyme”.
  - **Dépendances :** id011, id012.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “Contrat API: POST /api/scores” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Validation stricte des entrées”.

- [ ] **id014** **(P0)** _(M)_ Implémenter `GET /api/leaderboard/day` (top10 du jour)

  - **But :** fournir le classement global top 10 du jour (Europe/Paris).
  - **Livrable :** endpoint `GET /api/leaderboard/day` qui filtre sur `dayKeyParis` et trie desc.
  - **Acceptation :** réponse contient timezone + dayKeyParis + max 10 entrées avec rang.
  - **Dépendances :** id011, id012.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “Contrat API: GET /api/leaderboard/day” ; [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Top 10 du jour”.

- [ ] **id015** **(P0)** _(S)_ Ajouter protections serveur minimales (payload limit, headers, no stacktrace)

  - **But :** durcir le MVP sans ajouter de features non demandées.
  - **Livrable :** configuration Express (limite JSON body, headers de base, désactivation détails prod).
  - **Acceptation :** payload trop gros rejeté ; en prod, pas de stacktrace exposée.
  - **Dépendances :** id010.
  - **Docs sources :** [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Sécurité & conformité (minimum)” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Gestion d’erreurs”.

- [ ] **id016** **(P1)** _(M)_ Ajouter logs serveur exploitables (validation, I/O JSON, erreurs)

  - **But :** diagnostiquer rapidement en prod via stdout du conteneur.
  - **Livrable :** logs cohérents au démarrage + sur erreurs (validation, read/write) ; niveau configurable.
  - **Acceptation :** un incident “écriture JSON” est détectable dans les logs sans debug local.
  - **Dépendances :** id010, id012.
  - **Docs sources :** [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Observabilité (MVP)” ; [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) → “Logs”.

- [ ] **id017** **(P0)** _(S)_ Servir le front buildé depuis Express (topologie A)
  - **But :** respecter la topologie cible (1 service).
  - **Livrable :** serveur Express qui sert les fichiers statiques du build front + fallback route.
  - **Acceptation :** en prod, une seule URL sert UI + API sans CORS.
  - **Dépendances :** id010 (et plus tard build front).
  - **Docs sources :** [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Option A : Express sert aussi le front” ; [/clarifications/06-deploiement-et-hebergement.md](clarifications/06-deploiement-et-hebergement.md).

### Épique D — Front-end (React) : UI shell, stockage local, intégration API

- [ ] **id018** **(P0)** _(M)_ Initialiser l’app React dans [/project/client](project/client/)

  - **But :** fournir la base UI du jeu (menus/overlays) séparée de la boucle de jeu.
  - **Livrable :** app React avec pages/overlays de base et pipeline build.
  - **Acceptation :** l’app démarre en dev et build en prod (artefacts statiques).
  - **Dépendances :** id006, id007.
  - **Docs sources :** [/docs/05-decisions-structurantes.md](docs/05-decisions-structurantes.md) → “Front-end en ReactJS” ; [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Artefacts : front build statique”.

- [ ] **id019** **(P0)** _(S)_ Implémenter le stockage local (pseudo, difficulté, sensibilité, mute)

  - **But :** respecter l’identité sans compte et les réglages persistants.
  - **Livrable :** module `storage/` (localStorage) + API pour lire/écrire préférences.
  - **Acceptation :** rechargement page conserve pseudo/réglages/mute.
  - **Dépendances :** id018.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Pseudo / Réglages” ; [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “storage/”.

- [ ] **id020** **(P0)** _(M)_ Écrans/états UI : Accueil, En jeu HUD, Pause, Fin de partie, Classement

  - **But :** couvrir les écrans et états minimaux MVP.
  - **Livrable :** composants UI + navigation d’état (screen state machine côté UI).
  - **Acceptation :** on peut démarrer, jouer, pause, game over, enregistrer score et voir top 10.
  - **Dépendances :** id018, id019.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Écrans / états” ; [/docs/02-parcours-et-experience.md](docs/02-parcours-et-experience.md) → “Parcours”.

- [ ] **id021** **(P0)** _(S)_ Client API : `POST /api/scores` et `GET /api/leaderboard/day`

  - **But :** intégrer l’API Express depuis le front.
  - **Livrable :** module `services/` avec fonctions d’appel + gestion d’erreurs.
  - **Acceptation :** échec d’enregistrement est non bloquant et affiche un message clair.
  - **Dépendances :** id020 (et endpoints back id013/id014).
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “services/ + flux” ; [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Erreurs : non bloquant”.

- [ ] **id022** **(P0)** _(S)_ Afficher les contrôles clavier (flèches/WASD, espace, P, M)
  - **But :** respecter l’UX “pas de devinette”.
  - **Livrable :** panneau/section contrôles sur l’accueil et/ou en overlay.
  - **Acceptation :** les touches sont visibles dès l’accueil.
  - **Dépendances :** id020.
  - **Docs sources :** [/docs/03-user-stories-et-flux.md](docs/03-user-stories-et-flux.md) → “US-03” ; [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “UX : principes”.

### Épique E — Boucle de jeu (Three.js) : engine, input, rendu

- [ ] **id023** **(P0)** _(M)_ Intégrer Three.js et initialiser le rendu (scène/caméra/lumières)

  - **But :** poser le socle WebGL 3D.
  - **Livrable :** module `render/` avec init/resize/cleanup et boucle rAF.
  - **Acceptation :** une scène 3D s’affiche en continu, sans dépendre des re-renders React.
  - **Dépendances :** id018.
  - **Docs sources :** [/docs/05-decisions-structurantes.md](docs/05-decisions-structurantes.md) → “Librairie WebGL : Three.js” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Boucle de jeu et React”.

- [ ] **id024** **(P0)** _(M)_ Implémenter `GameEngine` (state machine running/paused/gameover)

  - **But :** structurer la boucle de gameplay hors React.
  - **Livrable :** module `game/` avec boucle update (delta time) et états.
  - **Acceptation :** pause (P) fige la simulation ; reprise relance proprement ; game over déclenche l’écran fin.
  - **Dépendances :** id023.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “GameEngine” ; [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Pause / Fin de partie”.

- [ ] **id025** **(P0)** _(S)_ Implémenter `InputManager` clavier (flèches/WASD, espace, P, M)

  - **But :** garantir des contrôles fiables et centralisés.
  - **Livrable :** module d’input (listeners uniques) + mapping touches.
  - **Acceptation :** déplacement et tir répondent de manière stable ; P pause ; M mute.
  - **Dépendances :** id024.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Contrôles” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Inputs centralisés”.

- [ ] **id026** **(P0)** _(M)_ Implémenter les entités de base (vaisseau, ennemis, tirs) + collisions

  - **But :** rendre le jeu jouable end-to-end.
  - **Livrable :** simulation minimale (spawn, mouvement, tirs, hit, game over).
  - **Acceptation :** on peut détruire des ennemis, perdre la partie, et atteindre un écran de fin.
  - **Dépendances :** id024, id025.
  - **Docs sources :** [/docs/00-contexte-et-vision.md](docs/00-contexte-et-vision.md) → “Jeu jouable” ; [/docs/02-parcours-et-experience.md](docs/02-parcours-et-experience.md) → “Boucle de gameplay”.

- [ ] **id027** **(P0)** _(S)_ Implémenter la sensibilité (0.8x / 1.0x / 1.2x)

  - **But :** exposer un réglage de confort validé.
  - **Livrable :** module `Rules` ou équivalent appliquant le ratio à la vitesse du joueur.
  - **Acceptation :** changer le preset modifie visiblement la vitesse de déplacement.
  - **Dépendances :** id019, id026.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Sensibilité” ; [/docs/03-user-stories-et-flux.md](docs/03-user-stories-et-flux.md) → “US-10”.

- [ ] **id028** **(P0)** _(M)_ Implémenter la difficulté (facile/normal/difficile)

  - **But :** adapter le challenge conformément aux décisions.
  - **Livrable :** paramètres de jeu par difficulté (au moins 2–3 paramètres impactants).
  - **Acceptation :** les 3 niveaux existent et changent le comportement du jeu.
  - **Dépendances :** id004 (si paramètres précisés) ; id026 ; id019.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Difficulté” ; [/docs/03-user-stories-et-flux.md](docs/03-user-stories-et-flux.md) → “US-09”.

- [ ] **id029** **(P0)** _(M)_ Implémenter le scoring (ennemis + bonus + multiplicateurs)

  - **But :** afficher un score conforme aux règles.
  - **Livrable :** module `Scoring` (fonctions pures) + affichage HUD.
  - **Acceptation :** le score évolue en jeu et le score final est affiché à la fin.
  - **Dépendances :** id026 ; id002 ; id003.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Score / Bonus / Multiplicateurs” ; [/docs/03-user-stories-et-flux.md](docs/03-user-stories-et-flux.md) → “US-06”.

- [ ] **id030** **(P1)** _(M)_ Ajouter un premier niveau de “polish” visuel (lisibilité, feedbacks)
  - **But :** répondre à l’exigence de qualité visuelle sans sur-scope.
  - **Livrable :** feedbacks visuels (hit/explosion), HUD lisible, cohérence scène/caméra.
  - **Acceptation :** l’action reste lisible et les événements clés ont un feedback visuel.
  - **Dépendances :** id026.
  - **Docs sources :** [/docs/00-contexte-et-vision.md](docs/00-contexte-et-vision.md) → “Qualité visuelle” ; [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “UX : principes”.

### Épique F — Audio (Howler) : SFX + mute

- [ ] **id031** **(P0)** _(M)_ Intégrer Howler.js + gestion centralisée du mute (touche M)

  - **But :** fournir des effets sonores + mute persistant.
  - **Livrable :** module `audio/` (load, play, mute toggle) + persistance mute.
  - **Acceptation :** M coupe/réactive immédiatement les sons ; état mute visible.
  - **Dépendances :** id019, id025.
  - **Docs sources :** [/docs/05-decisions-structurantes.md](docs/05-decisions-structurantes.md) → “Audio : Howler.js” ; [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “En jeu : mute”.

- [ ] **id032** **(P1)** _(S)_ Gérer l’“audio unlock” après interaction utilisateur

  - **But :** éviter les sons silencieux dus aux politiques navigateur.
  - **Livrable :** mécanisme d’unlock (ex: premier click/keypress) + fallback UX si bloqué.
  - **Acceptation :** les sons se déclenchent après une interaction ; pas d’erreur console bloquante.
  - **Dépendances :** id031.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “Contraintes navigateur importantes” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Audio (Howler)”.

- [ ] **id033** **(P1)** _(S)_ Lister et intégrer les assets audio mp3 + ogg
  - **But :** livrer les formats attendus au navigateur.
  - **Livrable :** assets dans [project/client/public/assets/](project/client/public/assets/) (ou équivalent) + mapping dans le module audio.
  - **Acceptation :** les sons clés existent (tir, impact, game over) et fonctionnent.
  - **Dépendances :** id031.
  - **Docs sources :** [/docs/05-decisions-structurantes.md](docs/05-decisions-structurantes.md) → “Audio : Howler.js + mp3/ogg” ; [/docs/03-user-stories-et-flux.md](docs/03-user-stories-et-flux.md) → “US-05”.

### Épique G — Robustesse UX : chargement, erreurs, WebGL non supporté

- [ ] **id034** **(P0)** _(S)_ Ajouter un écran de chargement/initialisation WebGL

  - **But :** expliciter l’état d’attente au démarrage.
  - **Livrable :** écran/overlay “chargement” pendant init (assets + WebGL).
  - **Acceptation :** l’utilisateur voit un état explicite au démarrage.
  - **Dépendances :** id023, id020.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Chargement / erreurs” ; [/docs/03-user-stories-et-flux.md](docs/03-user-stories-et-flux.md) → “US-15”.

- [ ] **id035** **(P0)** _(S)_ Détecter WebGL non supporté et afficher un message non technique

  - **But :** éviter un écran noir incompréhensible.
  - **Livrable :** détection support WebGL + écran “incompatible”.
  - **Acceptation :** sur échec d’init, un message clair est affiché, sans jargon.
  - **Dépendances :** id023.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “WebGL non supporté” ; [/docs/03-user-stories-et-flux.md](docs/03-user-stories-et-flux.md) → “US-16”.

- [ ] **id036** **(P0)** _(S)_ Rendre l’échec d’enregistrement score non bloquant (UX + retry)
  - **But :** permettre de rejouer même si l’API est down.
  - **Livrable :** message clair + état UI “échec” ; option rejouer disponible.
  - **Acceptation :** en simulant une erreur réseau, l’app reste utilisable (rejouer).
  - **Dépendances :** id021.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Échec d’enregistrement score : non bloquant” ; [/docs/03-user-stories-et-flux.md](docs/03-user-stories-et-flux.md) → “US-17”.

### Épique H — Tests & qualité

- [ ] **id037** **(P0)** _(M)_ Ajouter tests back-end prioritaires (validation, timezone, leaderboard)

  - **But :** sécuriser les règles les plus sensibles.
  - **Livrable :** suite de tests (validation POST, dayKeyParis DST, top10 tri/filtre/cap).
  - **Acceptation :** le CI exécute ces tests et ils couvrent les cas listés dans [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md).
  - **Dépendances :** id013, id014.
  - **Docs sources :** [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Back-end (recommandé)” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Tests (niveau MVP)”.

- [ ] **id038** **(P1)** _(S)_ Ajouter tests front “fonctions pures” (input/scoring)

  - **But :** tester sans complexité E2E.
  - **Livrable :** tests unitaires sur mapping input et fonctions de scoring.
  - **Acceptation :** un test échoue si mapping ou règles scoring changent.
  - **Dépendances :** id025, id029.
  - **Docs sources :** [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Front-end (recommandé)” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Tests front légers”.

- [ ] **id039** **(P1)** _(S)_ Implémenter la checklist de tests manuels “avant démo”

  - **But :** cadrer une validation fonctionnelle rapide.
  - **Livrable :** document checklist (ex: [project/docs/manual-test-checklist.md](project/docs/manual-test-checklist.md)).
  - **Acceptation :** la checklist couvre démarrage, contrôles, pause, mute, game over, API down, leaderboard.
  - **Dépendances :** id020, id034–id036.
  - **Docs sources :** [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Checklists de test manuel”.

- [ ] **id040** **(P1)** _(S)_ Accessibilité minimale des menus (navigation clavier + focus visible)
  - **But :** respecter le socle a11y MVP.
  - **Livrable :** focus visible, tab order correct, composants accessibles (labels).
  - **Acceptation :** les menus sont utilisables au clavier sans souris.
  - **Dépendances :** id020.
  - **Docs sources :** [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Accessibilité (socle minimal)”.

### Épique I — Docker/Compose & CI (GitHub Actions)

- [ ] **id041** **(P0)** _(M)_ Dockeriser l’application (1 service Express servant le front)

  - **But :** livrer un artefact prod conforme (Docker obligatoire).
  - **Livrable :** [project/Dockerfile](project/Dockerfile) + build multi-stage (front build → back runtime) si pertinent.
  - **Acceptation :** `docker build` produit une image qui sert UI+API.
  - **Dépendances :** id017, id018.
  - **Docs sources :** [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Déploiement (décisions actées)” ; [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) → “Cible de production”.

- [ ] **id042** **(P0)** _(M)_ Créer [project/docker-compose.yml](project/docker-compose.yml) prod avec bind mount [project/server/data/](project/server/data/) + env

  - **But :** assurer la persistance des scores en prod (mono-instance).
  - **Livrable :** Compose avec volume bind mount, `PORT`, `DATA_DIR`, policy de restart.
  - **Acceptation :** redémarrer le conteneur ne perd pas [project/server/data/scores.json](project/server/data/scores.json).
  - **Dépendances :** id041.
  - **Docs sources :** [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Persistance fichiers (indispensable)” ; [/clarifications/06-deploiement-et-hebergement.md](clarifications/06-deploiement-et-hebergement.md).

- [ ] **id054** **(P0)** _(S)_ Configurer le DNS du sous-domaine `space-invader.jlg-consulting.com`

  - **But :** permettre l’obtention du certificat Let’s Encrypt (ACME HTTP-01) et l’accès public au jeu.
  - **Livrable :** enregistrements DNS (A, et AAAA si IPv6) pointant vers l’IP du VPS + note courte dans la doc de déploiement.
  - **Acceptation :** `space-invader.jlg-consulting.com` résout vers le VPS (tests `dig/nslookup`) et l’accès HTTP sur port 80 atteint bien le VPS.
  - **Dépendances :** id001.
  - **Docs sources :** [/clarifications/07-https-sans-domaine.md](clarifications/07-https-sans-domaine.md) ; [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Stratégie HTTPS (décision id001)”.

- [ ] **id043** **(P0)** _(M)_ Mettre en place la terminaison HTTPS (reverse proxy) selon décision id001

  - **But :** respecter HTTPS requis en prod.
  - **Livrable :** Nginx (host) en reverse proxy + certificats Let’s Encrypt (certbot) + redirection HTTP→HTTPS + HSTS + règles UFW + doc.
  - **Acceptation :**
    - `https://space-invader.jlg-consulting.com` fonctionne (certificat valide, pas d’alerte navigateur)
    - `http://space-invader.jlg-consulting.com` redirige vers HTTPS
    - Nginx proxy vers l’app sur `127.0.0.1:9999`
    - UFW n’autorise que SSH + HTTP + HTTPS
    - le renouvellement Let’s Encrypt est automatisé (timer systemd ou équivalent)
  - **Dépendances :** id001, id042, id054.
  - **Docs sources :** [/clarifications/07-https-sans-domaine.md](clarifications/07-https-sans-domaine.md) ; [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Stratégie HTTPS (décision id001)” ; [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) → “Sécurité (minimum)”.

- [ ] **id044** **(P0)** _(M)_ Ajouter GitHub Actions CI (install, lint/typecheck, tests, build, artefact)
  - **But :** automatiser la qualité minimale à chaque PR/push.
  - **Livrable :** workflow CI (cache deps, tests back, build front/back, publication artefact).
  - **Acceptation :** une PR exécute le pipeline et échoue si tests/lint échouent.
  - **Dépendances :** id008, id037.
  - **Docs sources :** [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Pipeline CI (proposition)” ; [/clarifications/06-deploiement-et-hebergement.md](clarifications/06-deploiement-et-hebergement.md) → “CI : GitHub Actions”.

### Épique J — Exploitation & maintenance (runbook MVP)

- [ ] **id045** **(P0)** _(S)_ Documenter la procédure de déploiement (sans perte de données)

  - **But :** rendre le déploiement reproductible sur VPS.
  - **Livrable :** doc [project/docs/deploy.md](project/docs/deploy.md) (pull image/artefact, restart compose, vérifs).
  - **Acceptation :** une personne suit la doc et déploie une version sans écraser [project/server/data/](project/server/data/).
  - **Dépendances :** id042, id043.
  - **Docs sources :** [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) → “Procédure de déploiement (MVP)” ; [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Déploiement”.

- [ ] **id046** **(P1)** _(S)_ Documenter le runbook incidents (site down, POST scores en erreur, classement vide)

  - **But :** accélérer le diagnostic en prod.
  - **Livrable :** doc [project/docs/runbook.md](project/docs/runbook.md) avec checks/actions.
  - **Acceptation :** chaque incident a une section “Vérifier” + “Actions” conforme à [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md).
  - **Dépendances :** id016.
  - **Docs sources :** [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) → “Gestion des incidents”.

- [ ] **id047** **(P1)** _(S)_ Ajouter un suivi de la taille de [project/server/data/scores.json](project/server/data/scores.json) (log/alerte simple)
  - **But :** surveiller la croissance continue acceptée en MVP.
  - **Livrable :** log périodique ou au démarrage indiquant taille fichier + recommandation.
  - **Acceptation :** la taille est visible dans les logs et peut déclencher une action manuelle.
  - **Dépendances :** id012, id016.
  - **Docs sources :** [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) → “Signaux à surveiller / Croissance des données”.

### Épique K — Documentation projet (dev + usage)

- [ ] **id048** **(P0)** _(S)_ Rédiger [project/README.md](project/README.md) (setup, dev, build, tests, variables)

  - **But :** rendre le repo utilisable sans contexte oral.
  - **Livrable :** README avec prérequis, commandes, env vars, structure.
  - **Acceptation :** un développeur lance le projet en local via les commandes documentées.
  - **Dépendances :** id008.
  - **Docs sources :** [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Organisation / conventions” ; [/docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) → “Variables de configuration”.

- [ ] **id049** **(P1)** _(S)_ Documenter l’API (contrat + exemples + erreurs)

  - **But :** stabiliser l’intégration front/back.
  - **Livrable :** doc [project/docs/api.md](project/docs/api.md) décrivant `POST /api/scores` et `GET /api/leaderboard/day`.
  - **Acceptation :** la doc couvre payloads, codes d’erreur (400/500) et normalisation pseudo.
  - **Dépendances :** id013, id014.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “Contrat API (v0)” ; [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Règles enregistrement”.

- [ ] **id050** **(P1)** _(S)_ Documenter l’architecture “vue d’ensemble” (front/game/render/audio/back/storage)

  - **But :** faciliter onboarding et maintenance.
  - **Livrable :** doc [project/docs/architecture.md](project/docs/architecture.md) alignée sur les modules proposés.
  - **Acceptation :** la doc reflète la structure réelle [/project/client](project/client/) et [/project/server](project/server/).
  - **Dépendances :** id006, id010, id018.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Organisation des dossiers”.

- [ ] **id051** **(P2)** _(S)_ Vérifier si le référentiel [/docs](docs/) doit être copié/synchronisé dans [/project/docs](project/docs/)
  - **But :** respecter la contrainte “documentation générée dans /project” sans perdre les sources.
  - **Livrable :** décision + mécanisme (copie, lien, séparation source vs doc dev).
  - **Acceptation :** les docs nécessaires au build/exploit existent sous [/project](project/).
  - **Dépendances :** id006.
  - **Docs sources :** [/docs/\_etat-projet.md](docs/_etat-projet.md) → “Référentiel” ; [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) → “Procédure de déploiement”.

### Épique L — Post-MVP (pistes explicitement listées)

- [ ] **id052** **(P2)** _(M)_ Ajouter un healthcheck (si besoin post-MVP)

  - **But :** améliorer l’exploitabilité (sondage simple) sans impacter le MVP.
  - **Livrable :** endpoint healthcheck et doc.
  - **Acceptation :** endpoint retourne un statut simple sans exposer d’infos sensibles.
  - **Dépendances :** id010.
  - **Docs sources :** [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) → “Évolutions post-MVP (pistes)”.

- [ ] **id053** **(P2)** _(M)_ Partitionner/archiver les fichiers de scores (si la taille devient problématique)
  - **But :** limiter le risque de croissance illimitée.
  - **Livrable :** stratégie (par mois) + migration et tests.
  - **Acceptation :** le leaderboard du jour reste correct avec partition.
  - **Dépendances :** id012, id047.
  - **Docs sources :** [/docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) → “Croissance des données (mitigation post-MVP)”.
