# Prompt — TODO id045 — (P0) (S) Documenter la procédure de déploiement (sans perte de données)

## Role

Tu es un ingénieur senior DevOps / SRE orienté produit, expert en déploiement Docker Compose sur VPS Debian, Nginx + Let’s Encrypt (Certbot), et documentation d’exploitation claire et actionnable.

## Objectif

Réaliser la tâche **id045**.

Rappel des éléments TODO (à respecter explicitement) :

- **But :** Déploiement reproductible sur VPS.
- **Livrable :** `project/docs/deploy.md`.
- **Acceptation :** déployer sans écraser `server/data/`.
- **Dépendances :** id042, id043.
- **Docs sources :** `docs/10-exploitation-et-maintenance.md` → “Procédure de déploiement”, `docs/09-cicd-et-deploiement.md` → “Déploiement”.

Objectif opérationnel : écrire une procédure de déploiement **reproductible** permettant de déployer une nouvelle version **sans perdre les données** persistées dans `server/data/` (notamment `scores.json`).

## Format de sortie

Produire exactement :

- `project/docs/deploy.md` — procédure complète, structurée, orientée “copier-coller”.

Optionnel (uniquement si cela débloque la cohérence documentaire, sans refactor massif) :

- Ajustements mineurs de documentation existante sous `project/docs/` si tu identifies une incohérence bloquante.

## Contraintes

- Ne pas réaliser d’autres TODOs. Ne pas cocher d’autres tâches.
- Ne pas modifier les décisions structurantes : Docker/Compose mono-instance, Bun, persistance fichiers JSON, “jour” Europe/Paris codé explicitement (pas via la timezone système).
- La procédure doit éviter toute perte de données : **ne jamais supprimer** le dossier monté en bind mount, et interdire explicitement les commandes risquées (ex : `docker compose down -v`, suppression du répertoire data, purge de volumes).
- Cible : production (VPS Debian). Commandes bash. Style français technique standard.
- Le document doit être auto-suffisant : un lecteur doit pouvoir exécuter la procédure sans relire les docs racines.
- Ne pas inventer de nouvelles règles. S’aligner sur les docs sources et les fichiers déjà présents dans le dépôt.

## Contexte technique

### Topologie attendue (MVP)

- Une seule application (Express) sert **UI + API**.
- Exécution sous **Bun**.
- Déploiement via **Docker Compose**.
- Persistance via **bind mount** du dossier `server/data/`.
- Terminaison HTTPS via **Nginx (host) + Certbot**, reverse proxy vers `127.0.0.1:9999`.

### Docs sources (à lire avant d’écrire)

- `docs/09-cicd-et-deploiement.md` : “Déploiement (décisions actées)”, “Persistance fichiers (indispensable)”, “Variables de configuration”.
- `docs/10-exploitation-et-maintenance.md` : “Procédure de déploiement (MVP)”, rappels “cible de production”.

### Références opérationnelles déjà présentes dans le repo

- `project/docs/vps-debian-docker-compose.md` : installation Docker + `docker compose`, smoke test local `http://127.0.0.1:9999`.
- `project/docs/vps-debian-nginx-ufw.md` : Nginx, UFW, Certbot, reverse proxy vers `127.0.0.1:9999`, validation.
- `project/docs/nginx/space-invader.jlg-consulting.com.conf` : template Nginx.

## Analyse des dépendances

Tâche bloquée si les livrables suivants n’existent pas ou ne sont pas cohérents :

- **id042** : `project/docker-compose.yml` prod avec bind mount `server/data/` + env.
- **id043** : terminaison HTTPS via Nginx+Certbot (décision id001) et reverse proxy vers `127.0.0.1:9999`.

Action attendue : vérifier rapidement que ces éléments existent dans le dépôt (sans les réécrire). Si tu constates un écart, documente un contournement minimal dans `project/docs/deploy.md` plutôt que de re-architecturer.

## Étapes proposées (ce que `project/docs/deploy.md` doit contenir)

1. Vue d’ensemble

- Schéma textuel : Internet → Nginx (host) → `127.0.0.1:9999` (conteneur app)
- Où vivent les données : `server/data/` sur l’hôte via bind mount

2. Pré-requis VPS

- DNS `space-invader.jlg-consulting.com` résout vers l’IP du VPS
- Docker Engine + plugin `docker compose` installés (référence vers `project/docs/vps-debian-docker-compose.md`)
- Nginx + Certbot + UFW configurés (référence vers `project/docs/vps-debian-nginx-ufw.md`)

3. Arborescence recommandée sur le VPS

- Décrire une arborescence simple (ex : clone git dans `$HOME/space-invader`, données dans un répertoire dédié persistant) et la justification.

4. Variables d’environnement / configuration runtime

- Rappeler les variables pertinentes (ex : `NODE_ENV=production`, `PORT`/`APP_PORT`, `APP_BIND_HOST`, `DATA_DIR`), en restant cohérent avec la stratégie déjà utilisée dans le dépôt.
- Dire où les définir (Compose `.env` si déjà utilisé, sinon `environment:`), sans introduire un nouveau mécanisme.

5. Premier déploiement (initialisation)

- Cloner/mettre à jour le dépôt
- Démarrer : `docker compose up -d --build`
- Vérifier en local sur le VPS :
  - `curl -I http://127.0.0.1:9999/`
  - `curl -I http://127.0.0.1:9999/api`
- Vérifier côté HTTPS public :
  - `curl -I https://space-invader.jlg-consulting.com/`
  - `curl -I https://space-invader.jlg-consulting.com/api/leaderboard/day`

6. Déployer une nouvelle version (sans perte de données)

- Décrire une stratégie “safe” (adapter au dépôt) :
  - mise à jour du code (`git pull --ff-only`) ou mise à jour de l’image (`docker compose pull`)
  - redémarrage via `docker compose up -d --build` (ou `docker compose up -d` si images)
  - vérification logs + endpoints
- Inclure une section “À ne pas faire” (commandes dangereuses et pourquoi).
- Inclure un plan de rollback minimal (revenir au commit/image précédent) et une vérification que `server/data/` n’a pas été modifié.

7. Vérifications post-déploiement

- HTTPS OK, redirection HTTP→HTTPS OK, HSTS présent (valeur prudente attendue)
- UI accessible
- API OK
- Données intactes : `scores.json` présent et non vidé (décrire une vérification simple et non destructive)

8. Dépannage rapide (maximum 3 scénarios)

- Le site ne répond pas
- L’API renvoie 5xx
- Problème de permissions sur le bind mount

## Cas limites à couvrir explicitement

- Répertoire de données absent au premier démarrage : création, propriétaire, permissions.
- Erreur d’écriture `scores.json` : espace disque, permissions, lecture des logs.
- Nginx OK mais upstream `127.0.0.1:9999` down : comment diagnostiquer rapidement.
- Mise à jour qui casse : rollback.

## Critères de validation

- [ ] `project/docs/deploy.md` existe et décrit un premier déploiement + un redéploiement sans perte de données.
- [ ] Le document explique clairement la persistance via bind mount de `server/data/` et comment éviter de l’écraser.
- [ ] La procédure inclut des commandes de vérification minimales (curl local + curl HTTPS).
- [ ] Le contenu est cohérent avec `docs/09-cicd-et-deploiement.md`, `docs/10-exploitation-et-maintenance.md` et les documents sous `project/docs/`.

## Clarifications (gate obligatoire si blocage réel)

Si, après lecture des docs sources, tu es réellement bloqué (règle manquante, décision technique non tranchée, incohérence empêchant d’écrire une procédure non arbitraire) :

1. Créer un fichier `clarifications/<NN>-<slug>.md` (où `<NN>` est le prochain numéro disponible sur 2 chiffres, sans trou, et `<slug>` est en spinal-case).
2. Remplir le fichier avec le template ci-dessous.
3. S’arrêter immédiatement et demander à l’utilisateur de répondre dans ce document. Ne pas poursuivre id045 tant que les réponses ne sont pas fournies.

Template à utiliser :

- Contexte (rappel de la todo `id045` + liens vers `docs/09-cicd-et-deploiement.md` et `docs/10-exploitation-et-maintenance.md`)
- Questions (QCM)
  - Q1 — … ?
    - [ ] Option A — … (impacts)
    - [ ] Option B — … (impacts)
    - [ ] Autre : \_\_\_\_
    - [ ] Je ne sais pas / besoin d’une recommandation
    - [ ] Laisse l’IA choisir pour toi (avec justification)
- Options proposées + impacts (1–2 lignes)
- Décision attendue / critères de décision
- Réponses (vide)

## Clôture

- Interdiction de pause “pour validation” hors gate clarifications : exécuter la tâche de bout en bout, puis rendre compte.
- Une fois tous les critères de validation satisfaits, cocher uniquement la case **id045** dans `TODO.md` (`- [ ]` → `- [x]`).
- Ne cocher aucune autre tâche.
