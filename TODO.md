# TODO — Space Invaders Web (React + Express)

Cette TODO liste décrit, de manière exécutable, les étapes pour implémenter le MVP (jeu 3D WebGL + sons + classement) et livrer l’exploitation/CI/CD associées.
Elle est basée uniquement sur le référentiel [/docs](docs/) (et clarifications associées) et reflète l’état actuel du dépôt : le dossier [/project](project/) existe et contient la structure cible (front/back + scripts), mais l’initialisation des apps (React/Vite, Express) et l’implémentation du gameplay/API restent à faire.

## Hypothèses & zones à clarifier

- Langage acté : **TypeScript** (front + back) ; impacts CI/outillage à implémenter dans `id008` (référence : [project/README.md](project/README.md)).
- Politique de rétention/croissance de [project/server/data/scores.json](project/server/data/scores.json) (acceptée MVP, mais seuils d’alerte à définir).
- Statut “docs sous /project” : préciser si [/docs](docs/) doit être synchronisé (ou si seules les docs “dev/runbook” sont attendues sous [/project](project/)).

## Plan de livraison

- Phase 0 — Cadrage & repo : structure [/project](project/) (déjà posée) + outillage (Bun/Vite), conventions, scripts.
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

- [x] **id004** **(P1)** _(S)_ Clarifier les paramètres des difficultés (facile/normal/difficile)

  - **But :** traduire “impact global” en paramètres de jeu concrets.
  - **Livrable :** tableau des paramètres par difficulté (ex: vitesse ennemis, cadence tirs, vies…).
  - **Acceptation :** un changement de difficulté entraîne un comportement observable et cohérent.
  - **Dépendances :** Aucune.
  - **Docs sources :** [/docs/04-specification-fonctionnelle.md](docs/04-specification-fonctionnelle.md) → “Difficulté” ; [/docs/02-parcours-et-experience.md](docs/02-parcours-et-experience.md) → “Cadre d’expérience (acté)”.

- [x] **id005** **(P2)** _(S)_ Vérifier/valider un budget perf cible (fps) et contraintes de rendu
  - **But :** cadrer la “qualité visuelle” et le risque WebGL 3D.
  - **Livrable :** cible (ex: fps minimum) + checklist perf (draw calls, assets) adaptée au MVP.
  - **Acceptation :** la DoD inclut un critère perf vérifiable sur desktop.
  - **Dépendances :** Aucune.
  - **Docs sources :** [/docs/00-contexte-et-vision.md](docs/00-contexte-et-vision.md) → “Risques” ; [/docs/08-qualite-tests-et-ux.md](docs/08-qualite-tests-et-ux.md) → “Qualité (définition MVP)”.

### Épique B — Structure repo & outillage (dans [/project](project/))

- [x] **id006** **(P0)** _(S)_ Créer le répertoire [/project](project/) et y poser la structure monorepo

  - **But :** respecter la contrainte de repo (code/config/docs générées sous [/project](project/)).
  - **Livrable :** arborescence [/project/client](project/client/) + [/project/server](project/server/) + fichiers racine (README, scripts).
  - **Acceptation :** tout le code exécutable et la config de build peuvent vivre et tourner depuis [/project](project/).
  - **Dépendances :** Aucune.
  - **Docs sources :** [/docs/06-architecture-technique.md](docs/06-architecture-technique.md) → “Front-end/Back-end structure proposée” ; [/docs/07-guidelines-developpement.md](docs/07-guidelines-developpement.md) → “Organisation des dossiers (cible)”.

- [x] **id007** **(P0)** _(S)_ Décider et documenter JS vs TypeScript (front et back)

  - But: Aligner build/lint/tests et conventions ; Livrable: décision (JS/TS) + impacts CI ; Acceptation: pipeline CI cohérent avec la décision ; Deps: id006 ; Docs: /docs/09-cicd-et-deploiement.md → “Vérifications en CI”, /docs/07-guidelines-developpement.md → “Style & format”.

- [x] **id008** **(P0)** _(M)_ Mettre en place scripts monorepo (dev/build/test/lint) + formatage

  - But: Rendre le dev reproductible ; Livrable: scripts Bun (client+server) + config format (ex: Prettier) + intégration verrouillage Bun 1.3.5 ; Acceptation: `dev` lance client+server et CI exécute lint/format+tests ; Deps: id006, id007 ; Docs: /docs/07-guidelines-developpement.md → “Outillage & commandes”, “Style & format”, /docs/09-cicd-et-deploiement.md → “Pipeline CI (proposition)”, /docs/05-decisions-structurantes.md → “D-19”.

- [x] **id009** **(P0)** _(S)_ Configurer l’ignorance Git et la gestion de `server/data/`
  - But: Éviter de versionner des données runtime ; Livrable: `.gitignore` + fichier d’exemple (si retenu) ; Acceptation: données persistées locales/prod non committées ; Deps: id006 ; Docs: /docs/07-guidelines-developpement.md → “Git & hygiène de repo”, /docs/09-cicd-et-deploiement.md → “Persistance fichiers (indispensable)”.

### Épique C — Back-end (Express) : API + persistance JSON

- [x] **id010** **(P0)** _(M)_ Initialiser l’app Express (socle) et la base `/api`

  - But: Fournir le socle serveur ; Livrable: app Express sous Bun + routes `/api` + erreurs JSON + mode prod sans stacktrace ; Acceptation: démarrage local OK et format d’erreur stable ; Deps: id006, id007 ; Docs: /docs/06-architecture-technique.md → “Back-end (Express)”, /docs/07-guidelines-developpement.md → “Gestion d’erreurs”, /docs/05-decisions-structurantes.md → “D-03”, “D-19”.

- [x] **id011** **(P0)** _(S)_ Implémenter `dayKeyParis` (Europe/Paris explicite)

  - But: Respecter le “jour” Paris ; Livrable: `timeService` UTC→`dayKeyParis` ; Acceptation: tests couvrent instants UTC + DST ; Deps: id010 ; Docs: /docs/06-architecture-technique.md → “Gestion du fuseau Europe/Paris”, /docs/08-qualite-tests-et-ux.md → “Tests : dayKeyParis”.

- [x] **id012** **(P0)** _(M)_ Implémenter le repository scores (mutex + écriture atomique)

  - But: Persister sans corruption en mono-instance ; Livrable: `scoreRepository` (read/write JSON, `.tmp` + rename, mutex) ; Acceptation: tests valident JSON final non corrompu + sérialisation ; Deps: id010 ; Docs: /docs/06-architecture-technique.md → “Stratégie d’écriture”, /docs/07-guidelines-developpement.md → “Persistance JSON”.

- [x] **id013** **(P0)** _(M)_ Implémenter `POST /api/scores` (validation + normalisation pseudo)

  - But: Enregistrer un score conforme ; Livrable: endpoint + validation (`score` >= 0) + normalisation `pseudo` (trim, max) + `createdAt` UTC + `dayKeyParis` ; Acceptation: 201/400/500 conformes + pseudo vide→“Anonyme” ; Deps: id011, id012 ; Docs: /docs/06-architecture-technique.md → “POST /api/scores”, /docs/04-specification-fonctionnelle.md → “Enregistrement d’un score”, /docs/07-guidelines-developpement.md → “Validation stricte”.

- [x] **id014** **(P0)** _(M)_ Implémenter `GET /api/leaderboard/day` (top 10 du jour)

  - But: Fournir le top 10 du jour ; Livrable: endpoint filtre `dayKeyParis` + tri desc + cap 10 ; Acceptation: réponse contient `timezone`, `dayKeyParis`, `entries` rangées ; Deps: id011, id012 ; Docs: /docs/06-architecture-technique.md → “GET /api/leaderboard/day”, /docs/04-specification-fonctionnelle.md → “Top 10 du jour”.

- [x] **id015** **(P0)** _(S)_ Ajouter protections serveur minimales (limits/headers/erreurs prod)

  - But: Durcir le MVP sans sur-scope ; Livrable: limite payload JSON + headers de base + erreurs prod sans détails ; Acceptation: payload trop gros rejeté et aucune stacktrace exposée ; Deps: id010 ; Docs: /docs/09-cicd-et-deploiement.md → “Sécurité & conformité (minimum)”, /docs/07-guidelines-developpement.md → “Gestion d’erreurs”.

- [x] **id016** **(P1)** _(M)_ Ajouter des logs serveur exploitables

  - But: Diagnostiquer en prod via stdout ; Livrable: logs démarrage + validation + I/O JSON + erreurs ; Acceptation: incident écriture JSON détectable via logs ; Deps: id010, id012 ; Docs: /docs/08-qualite-tests-et-ux.md → “Observabilité (MVP)”, /docs/10-exploitation-et-maintenance.md → “Logs”.

- [x] **id017** **(P0)** _(S)_ Servir le front buildé depuis Express (topologie A)
  - But: Déployer 1 service UI+API ; Livrable: statics du build front + fallback SPA ; Acceptation: une seule origine en prod (CORS simplifié) ; Deps: id010, id018 ; Docs: /docs/09-cicd-et-deploiement.md → “Option A : Express sert aussi le front”.

### Épique D — Front-end (React) : UI shell, stockage local, intégration API

- [x] **id018** **(P0)** _(M)_ Initialiser l’app React (Vite) dans [/project/client](project/client/)

  - But: Poser le socle UI ; Livrable: app React outillée Vite (deps/scripts Bun) + dev/build ; Acceptation: dev Vite OK et build statique exploitable par Express ; Deps: id006, id007 ; Docs: /docs/05-decisions-structurantes.md → “D-02”, “D-19”, /docs/06-architecture-technique.md → “Front-end (React)”, /docs/09-cicd-et-deploiement.md → “Artefacts”.

- [x] **id019** **(P0)** _(S)_ Implémenter le stockage local (pseudo, difficulté, sensibilité, mute)

  - But: Conserver identité/réglages ; Livrable: module `storage/` (localStorage) + API prefs ; Acceptation: reload conserve pseudo/réglages/mute ; Deps: id018 ; Docs: /docs/04-specification-fonctionnelle.md → “Pseudo”, “Réglages”, /docs/06-architecture-technique.md → “storage/”.

- [x] **id020** **(P0)** _(M)_ Implémenter les écrans/états UI (Accueil/Jeu/Pause/Fin/Classement)

  - But: Couvrir le parcours MVP ; Livrable: composants UI + state machine d’écrans ; Acceptation: jouer→pause→game over→save score→voir top10 ; Deps: id018, id019 ; Docs: /docs/04-specification-fonctionnelle.md → “Écrans / états”, /docs/02-parcours-et-experience.md → “Parcours”.

- [x] **id021** **(P0)** _(S)_ Intégrer l’API côté client (`POST /api/scores`, `GET /api/leaderboard/day`)

  - But: Relier UI↔API ; Livrable: module `services/` (fetch, gestion erreurs) ; Acceptation: erreur d’enregistrement non bloquante + message clair ; Deps: id020, id013, id014 ; Docs: /docs/06-architecture-technique.md → “services/ + flux”, /docs/08-qualite-tests-et-ux.md → “Erreurs réseau”.

- [x] **id022** **(P0)** _(S)_ Afficher les contrôles clavier (flèches/WASD, espace, P, M)
  - But: Éviter l’UX “devinette” ; Livrable: panneau contrôles (Accueil et/ou overlay) ; Acceptation: touches visibles dès l’accueil ; Deps: id020 ; Docs: /docs/08-qualite-tests-et-ux.md → “UX : principes”, /docs/04-specification-fonctionnelle.md → “Contrôles”.

### Épique E — Boucle de jeu (Three.js) : engine, input, rendu

- [x] **id023** **(P0)** _(M)_ Intégrer Three.js et initialiser le rendu (scène/caméra/lumières)

  - But: Poser le socle WebGL 3D ; Livrable: module `render/` (init/resize/cleanup + rAF) ; Acceptation: scène 3D stable sans dépendre des re-renders React ; Deps: id018 ; Docs: /docs/05-decisions-structurantes.md → “D-14”, /docs/07-guidelines-developpement.md → “Boucle de jeu et React”.

- [x] **id024** **(P0)** _(M)_ Implémenter `GameEngine` (running/paused/gameover)

  - But: Séparer simulation vs UI ; Livrable: module `game/` (update dt + state machine) ; Acceptation: P fige/reprend, game over déclenche l’écran fin ; Deps: id023 ; Docs: /docs/06-architecture-technique.md → “GameEngine”, /docs/04-specification-fonctionnelle.md → “Pause / Fin de partie”.

- [x] **id025** **(P0)** _(S)_ Implémenter `InputManager` clavier (flèches/WASD, espace, P, M)

  - But: Contrôles fiables ; Livrable: mapping touches + listeners uniques ; Acceptation: déplacement/tir stables, P pause, M mute ; Deps: id024 ; Docs: /docs/04-specification-fonctionnelle.md → “Contrôles”, /docs/07-guidelines-developpement.md → “Inputs centralisés”.

- [x] **id026** **(P0)** _(M)_ Implémenter entités de base (vaisseau/ennemis/tirs) + collisions

  - But: Rendre le jeu jouable ; Livrable: spawn/mouvements/tirs/hit/game over ; Acceptation: ennemis détruisables et fin de partie atteignable ; Deps: id024, id025 ; Docs: /docs/02-parcours-et-experience.md → “Boucle de gameplay”, /docs/04-specification-fonctionnelle.md → “Périmètre MVP”.

- [x] **id027** **(P0)** _(S)_ Implémenter la sensibilité (0.8x / 1.0x / 1.2x)

  - But: Exposer le réglage confort ; Livrable: règle appliquée à la vitesse joueur ; Acceptation: preset change la vitesse de façon observable ; Deps: id019, id026 ; Docs: /docs/04-specification-fonctionnelle.md → “Sensibilité”, /docs/05-decisions-structurantes.md → “D-09”.

- [x] **id028** **(P0)** _(M)_ Implémenter la difficulté (facile/normal/difficile) selon paramètres MVP

  - But: Appliquer les presets validés ; Livrable: règles (vitesse ennemis/cooldown tirs/vies) ; Acceptation: facile/normal/difficile appliquent 0.75/1.00/1.30, 1.35/1.00/0.75, 4/3/2 ; Deps: id026, id019 ; Docs: /docs/04-specification-fonctionnelle.md → “5.1 Difficulté”, /clarifications/10-parametres-difficulte.md → “Décision actée”.

- [x] **id029** **(P0)** _(M)_ Implémenter le scoring (ennemis + bonus + multiplicateurs)

  - But: Score conforme aux règles ; Livrable: module `Scoring` (fonctions pures) + tests d’exemples ; Acceptation: score en jeu + score final, tests couvrent barème/multiplicateurs ; Deps: id026, id002, id003 ; Docs: /docs/04-specification-fonctionnelle.md → “Score / Bonus / Multiplicateurs”, /clarifications/08-bareme-bonus.md → “Barème”, /clarifications/09-multiplicateurs-declencheurs-durees.md → “Règles”.

- [x] **id030** **(P1)** _(M)_ Ajouter un “polish” visuel (lisibilité + feedbacks)
  - But: Atteindre la qualité perçue MVP ; Livrable: HUD lisible + feedbacks (hit/explosion) + cohérence caméra ; Acceptation: action lisible et événements clés visibles ; Deps: id026 ; Docs: /docs/00-contexte-et-vision.md → “Qualité visuelle”, /docs/08-qualite-tests-et-ux.md → “UX : principes”.

### Épique F — Audio (Howler) : SFX + mute

- [x] **id031** **(P0)** _(M)_ Intégrer Howler.js + mute centralisé (touche M)

  - But: Fournir SFX + mute persistant ; Livrable: module `audio/` (load/play/mute) + persistance ; Acceptation: M toggle immédiat + état mute visible ; Deps: id019, id025 ; Docs: /docs/05-decisions-structurantes.md → “D-15”, /docs/04-specification-fonctionnelle.md → “En jeu : mute”.

- [x] **id032** **(P1)** _(S)_ Gérer l’“audio unlock” après interaction utilisateur

  - But: Éviter le silence navigateur ; Livrable: unlock (premier click/keypress) + fallback UX ; Acceptation: sons OK après interaction, pas d’erreur bloquante ; Deps: id031 ; Docs: /docs/06-architecture-technique.md → “Contraintes navigateur”, /docs/07-guidelines-developpement.md → “Audio (Howler)”.

- [ ] **id033** **(P1)** _(S)_ Intégrer les assets audio (mp3 + ogg)
  - But: Livrer les formats attendus ; Livrable: assets `public/assets/` + mapping ; Acceptation: sons clés (tir/impact/game over) audibles ; Deps: id031 ; Docs: /docs/05-decisions-structurantes.md → “D-15”, /docs/03-user-stories-et-flux.md → “US-05”.

### Épique G — Robustesse UX : chargement, erreurs, WebGL non supporté

- [ ] **id034** **(P0)** _(S)_ Ajouter un écran de chargement/initialisation WebGL

  - But: Expliciter l’état d’attente ; Livrable: overlay “chargement” (assets + WebGL) ; Acceptation: état visible au démarrage ; Deps: id023, id020 ; Docs: /docs/04-specification-fonctionnelle.md → “Chargement / erreurs”, /docs/08-qualite-tests-et-ux.md → “États d’attente”.

- [ ] **id035** **(P0)** _(S)_ Détecter WebGL non supporté et afficher un message non technique

  - But: Éviter l’écran noir ; Livrable: détection support + écran “incompatible” ; Acceptation: message clair sans jargon en cas d’échec ; Deps: id023 ; Docs: /docs/04-specification-fonctionnelle.md → “WebGL non supporté”, /docs/06-architecture-technique.md → “Contraintes navigateur”.

- [ ] **id036** **(P0)** _(S)_ Rendre l’échec d’enregistrement score non bloquant (UX)
  - But: Permettre de rejouer si API down ; Livrable: message clair + état UI “échec” (sans bloquer) ; Acceptation: en erreur réseau, rejouer reste possible ; Deps: id021 ; Docs: /docs/04-specification-fonctionnelle.md → “Échec d’enregistrement score”, /docs/08-qualite-tests-et-ux.md → “Dégradation gracieuse”.

### Épique H — Tests & qualité

- [ ] **id037** **(P0)** _(M)_ Ajouter les tests back-end prioritaires (validation/timezone/leaderboard)

  - But: Sécuriser les règles sensibles ; Livrable: tests (POST validation, DST `dayKeyParis`, tri/filtre/cap top10) ; Acceptation: CI exécute et couvre les cas du doc qualité ; Deps: id013, id014 ; Docs: /docs/08-qualite-tests-et-ux.md → “Back-end (recommandé)”, /docs/07-guidelines-developpement.md → “Tests (niveau MVP)”.

- [ ] **id038** **(P1)** _(S)_ Ajouter des tests front sur fonctions pures (input/scoring)

  - But: Tester sans E2E ; Livrable: tests unitaires mapping input + scoring ; Acceptation: un changement de règles casse un test ; Deps: id025, id029 ; Docs: /docs/08-qualite-tests-et-ux.md → “Front-end (recommandé)”, /docs/07-guidelines-developpement.md → “Tests front légers”.

- [ ] **id039** **(P1)** _(S)_ Rédiger la checklist de tests manuels “avant démo”

  - But: Valider vite sans outillage ; Livrable: `project/docs/manual-test-checklist.md` ; Acceptation: couvre démarrage/contrôles/pause/mute/game over/API down/leaderboard ; Deps: id020, id034, id035, id036 ; Docs: /docs/08-qualite-tests-et-ux.md → “Checklists de test manuel”.

- [ ] **id040** **(P1)** _(S)_ Assurer l’accessibilité minimale des menus (clavier + focus)
  - But: Respecter le socle a11y ; Livrable: navigation clavier + focus visible + labels ; Acceptation: menus utilisables au clavier sans souris ; Deps: id020 ; Docs: /docs/08-qualite-tests-et-ux.md → “Accessibilité (socle minimal)”.

### Épique I — Docker/Compose & CI (GitHub Actions)

- [ ] **id041** **(P0)** _(M)_ Dockeriser l’application (1 service Express servant le front)

  - But: Livrer un artefact prod Docker ; Livrable: `project/Dockerfile` (Bun runtime) + build Vite→assets statiques ; Acceptation: image sert UI+API et process tourne sous Bun (pas Node) ; Deps: id017, id018 ; Docs: /docs/09-cicd-et-deploiement.md → “Déploiement (décisions actées)”, /docs/10-exploitation-et-maintenance.md → “Cible de production”.

- [ ] **id042** **(P0)** _(M)_ Créer `project/docker-compose.yml` (prod) avec bind mount `server/data/` + env

  - But: Assurer la persistance en mono-instance ; Livrable: Compose (bind mount, env `PORT`/`DATA_DIR`, restart policy) ; Acceptation: restart conserve `scores.json` ; Deps: id041 ; Docs: /docs/09-cicd-et-deploiement.md → “Persistance fichiers”, /clarifications/06-deploiement-et-hebergement.md → “Déploiement”.

- [ ] **id054** **(P0)** _(S)_ Configurer le DNS du sous-domaine `space-invader.jlg-consulting.com`

  - But: Permettre ACME HTTP-01 + accès public ; Livrable: enregistrements DNS (A/AAAA) + note courte dans doc déploiement ; Acceptation: résolution OK et port 80 atteint le VPS ; Deps: id001 ; Docs: /clarifications/07-https-sans-domaine.md → “Décision”, /docs/09-cicd-et-deploiement.md → “Stratégie HTTPS”.

- [ ] **id043** **(P0)** _(M)_ Mettre en place la terminaison HTTPS (Nginx+Certbot) selon décision id001

  - But: Respecter HTTPS requis ; Livrable: Nginx reverse-proxy + Certbot/LE + HTTP→HTTPS + HSTS + UFW + doc ; Acceptation: HTTPS OK, HTTP redirige, proxy `127.0.0.1:9999`, renouvellement auto ; Deps: id001, id042, id054 ; Docs: /docs/09-cicd-et-deploiement.md → “Stratégie HTTPS”, /docs/10-exploitation-et-maintenance.md → “Sécurité (minimum)”, /clarifications/07-https-sans-domaine.md → “Procédure”.

- [ ] **id044** **(P0)** _(M)_ Ajouter GitHub Actions CI (install, lint/typecheck, tests, build, artefact)
  - But: Automatiser la qualité ; Livrable: workflow CI (vérif Bun 1.3.5, cache deps, tests, build, artefact) ; Acceptation: PR échoue si Bun/version/tests/lint échouent ; Deps: id008, id037 ; Docs: /docs/09-cicd-et-deploiement.md → “Pipeline CI (proposition)”, /docs/05-decisions-structurantes.md → “D-19”.

### Épique J — Exploitation & maintenance (runbook MVP)

- [ ] **id045** **(P0)** _(S)_ Documenter la procédure de déploiement (sans perte de données)

  - But: Déploiement reproductible sur VPS ; Livrable: `project/docs/deploy.md` ; Acceptation: déployer sans écraser `server/data/` ; Deps: id042, id043 ; Docs: /docs/10-exploitation-et-maintenance.md → “Procédure de déploiement”, /docs/09-cicd-et-deploiement.md → “Déploiement”.

- [ ] **id046** **(P1)** _(S)_ Documenter le runbook incidents (site down, POST scores en erreur, classement vide)

  - But: Accélérer le diagnostic ; Livrable: `project/docs/runbook.md` ; Acceptation: chaque incident a “Vérifier” + “Actions” ; Deps: id016 ; Docs: /docs/10-exploitation-et-maintenance.md → “Gestion des incidents”.

- [ ] **id047** **(P1)** _(S)_ Ajouter un suivi de la taille de `server/data/scores.json` (log simple)
  - But: Surveiller la croissance acceptée MVP ; Livrable: log taille fichier (au démarrage ou périodique) ; Acceptation: taille visible dans logs pour action manuelle ; Deps: id012, id016 ; Docs: /docs/10-exploitation-et-maintenance.md → “Signaux à surveiller”.

### Épique K — Documentation projet (dev + usage)

- [ ] **id048** **(P0)** _(S)_ Compléter `project/README.md` (setup, dev, build, tests, variables)

  - But: Rendre le repo utilisable sans contexte ; Livrable: README complet (pré-requis, commandes, env vars, structure) ; Acceptation: un dev lance le projet via commandes documentées ; Deps: id008 ; Docs: /docs/07-guidelines-developpement.md → “Organisation / conventions”, /docs/09-cicd-et-deploiement.md → “Variables de configuration”.

- [ ] **id049** **(P1)** _(S)_ Documenter l’API (contrat + exemples + erreurs)

  - But: Stabiliser l’intégration ; Livrable: `project/docs/api.md` ; Acceptation: payloads + codes 400/500 + normalisation pseudo ; Deps: id013, id014 ; Docs: /docs/06-architecture-technique.md → “Contrat API (v0)”, /docs/04-specification-fonctionnelle.md → “Enregistrement”.

- [ ] **id050** **(P1)** _(S)_ Documenter l’architecture (front/game/render/audio/back/storage)

  - But: Faciliter onboarding/maintenance ; Livrable: `project/docs/architecture.md` ; Acceptation: reflète la structure réelle `client/` et `server/` ; Deps: id006, id010, id018 ; Docs: /docs/06-architecture-technique.md → “Modules proposés”, /docs/07-guidelines-developpement.md → “Organisation des dossiers”.

- [ ] **id051** **(P2)** _(S)_ Vérifier si `/docs` doit être copié/synchronisé dans `project/docs/`

  - But: Respecter la contrainte “docs dans /project” ; Livrable: décision + mécanisme (copie/lien/séparation) ; Acceptation: docs nécessaires build/exploit disponibles sous `/project` ; Deps: id006 ; Docs: /docs/\_etat-projet.md → “Référentiel”, /docs/10-exploitation-et-maintenance.md → “Procédure de déploiement”.

- [ ] **id055** **(P1)** _(S)_ Documenter la stratégie perf (cible fps + méthode + budgets) côté projet

  - But: Rendre la DoD perf exécutable ; Livrable: `project/docs/performance.md` (cible 60fps/min 50fps, méthode 60s+warmup, budgets draw calls/triangles, scénario “pire cas”) ; Acceptation: un lecteur peut reproduire la mesure sur machine de référence ; Deps: id023, id026, id030 ; Docs: /clarifications/11-budget-perf-fps.md → “Décision actée”, /docs/08-qualite-tests-et-ux.md → “DoD perf”.

- [ ] **id056** **(P1)** _(M)_ Ajouter une vérification perf “pire cas” dans la checklist manuelle

  - But: Empêcher une régression perf silencieuse ; Livrable: section perf dans `project/docs/manual-test-checklist.md` (conditions + résultat attendu) ; Acceptation: la checklist contient un pas “mesurer fps” + seuils ; Deps: id039, id055 ; Docs: /docs/08-qualite-tests-et-ux.md → “Checklists”, /clarifications/11-budget-perf-fps.md → “Méthode de mesure”.

- [ ] **id057** **(P2)** _(S)_ Ajouter une doc contribution (conventions, scripts, PR)

  - But: Fluidifier les contributions ; Livrable: `project/docs/contributing.md` ; Acceptation: conventions (naming/style/tests) + commandes standard documentées ; Deps: id008 ; Docs: /docs/07-guidelines-developpement.md → “Conventions”, /docs/09-cicd-et-deploiement.md → “CI”.

- [ ] **id058** **(P2)** _(S)_ Documenter un troubleshooting “client” (WebGL/audio/API)
  - But: Réduire les tickets “écran noir / pas de son / score non enregistré” ; Livrable: `project/docs/troubleshooting.md` ; Acceptation: couvre WebGL non supporté, audio unlock, erreurs réseau non bloquantes ; Deps: id034, id035, id032, id036 ; Docs: /docs/04-specification-fonctionnelle.md → “Chargement/erreurs”, /docs/08-qualite-tests-et-ux.md → “UX/erreurs”, /docs/10-exploitation-et-maintenance.md → “Diagnostics”.

### Épique L — Post-MVP (pistes explicitement listées)

- [ ] **id052** **(P2)** _(M)_ Ajouter un healthcheck (post-MVP)

  - But: Améliorer l’exploitabilité ; Livrable: endpoint healthcheck + doc ; Acceptation: statut simple sans infos sensibles ; Deps: id010 ; Docs: /docs/10-exploitation-et-maintenance.md → “Évolutions post-MVP”.

- [ ] **id053** **(P2)** _(M)_ Partitionner/archiver les fichiers de scores (si la taille devient problématique)
  - But: Limiter le risque de croissance ; Livrable: stratégie (par mois) + migration + tests ; Acceptation: leaderboard du jour correct avec partition ; Deps: id012, id047 ; Docs: /docs/10-exploitation-et-maintenance.md → “Croissance des données”.
