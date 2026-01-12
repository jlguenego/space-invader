# Prompt — id042 (P0) (M) — Créer `project/docker-compose.yml` (prod) avec bind mount `server/data/` + env

## Role

Tu es un développeur/DevOps senior. Tu maîtrises Docker Compose, les contraintes de déploiement mono-instance avec persistance par fichiers JSON, et tu sais valider un déploiement de façon reproductible (commandes + vérifications).

## Objectif

Implémenter la tâche **id042** **(P0)** _(M)_ : **créer un fichier `project/docker-compose.yml` pour la production** qui exécute l’image Docker de l’application (Express sous Bun servant le front buildé), avec :

- **Persistance** via **bind mount** de `server/data/` (mono-instance)
- Variables d’environnement minimales : `PORT` et `DATA_DIR` (et autres si pertinentes)
- Politique de redémarrage automatique

## Format de sortie

Créer / modifier uniquement ce qui suit (sauf nécessité justifiée) :

- `project/docker-compose.yml`

Optionnel (si utile pour rendre le déploiement réellement exploitable sans ambiguïté) :

- `project/.env.example` (ne pas y mettre de secrets)
- Mise à jour courte de `project/README.md` (section “Production / Docker Compose”) pour expliquer les variables et le bind mount

## Contraintes

- Ne pas changer les décisions structurantes :
  - Runtime : **Bun 1.3.5**
  - Topologie : **option A** (Express sert API + front buildé)
  - Persistance : **fichiers JSON** via **bind mount**
  - Déploiement : **mono-instance**
- Le montage persistant doit couvrir le dossier de données utilisé réellement à l’exécution (pas un chemin “au hasard”).
- Le compose est “prod” : pas de profils dev, pas d’outils supplémentaires (pas de DB, pas de Redis, pas de multi-réplicas).
- Ne pas implémenter les tâches suivantes (elles sont hors périmètre) : terminaison TLS (id043), DNS (id054), documentation déploiement (id045).
- Ne pas cocher d’autres tâches que **id042** dans `TODO.md`.

## Contexte technique

### Tâche TODO (source)

- **id042** **(P0)** _(M)_ Créer `project/docker-compose.yml` (prod) avec bind mount `server/data/` + env
  - **But :** Assurer la persistance en mono-instance
  - **Livrable :** Compose (bind mount, env `PORT`/`DATA_DIR`, restart policy)
  - **Acceptation :** restart conserve `scores.json`
  - **Dépendances :** id041
  - **Docs sources :**
    - `docs/09-cicd-et-deploiement.md` → “Persistance fichiers” + variables recommandées
    - `clarifications/06-deploiement-et-hebergement.md` → décisions actées (VPS OVH, Docker obligatoire, option A, bind mount, mono-instance)

### Points d’appui dans le code

- Image Docker multi-stage déjà en place : `project/Dockerfile`.
- Le serveur lit le port sur `process.env.PORT` (défaut 3000) : `project/server/src/index.ts`.
- Le stockage lit `process.env.DATA_DIR` (sinon `./data` depuis le cwd serveur) : `project/server/src/storage/score-repository.ts`.

### Attendu déploiement (rappel)

- En production, l’app est proxifiée par Nginx sur le host vers `127.0.0.1:9999` (TLS géré hors conteneur).
- Le compose doit donc permettre un mapping de port compatible avec ce schéma.

## Analyse des dépendances

- **Bloquant :** id041 doit être terminé (Dockerfile produit une image qui sert UI+API). Si l’image ou le build compose ne fonctionne pas, corriger d’abord ce qui empêche id042, sans refactor massif.
- **Non-bloquant :** id043 (HTTPS/Nginx) n’est pas requis pour valider la persistance et le redémarrage.

## Étapes proposées (à exécuter sans pause)

1. Concevoir `project/docker-compose.yml` :
   - 1 service unique (ex: `app`)
   - `build:` depuis `project/` (Dockerfile existant)
   - `restart:` configuré (ex: `unless-stopped`)
   - `ports:` avec un binding **en loopback** côté host si la stratégie Nginx est attendue (ex: `127.0.0.1:9999:3000` ou équivalent, avec justification)
   - `environment:` incluant au minimum `PORT` et `DATA_DIR`
   - `volumes:` bind mount du dossier persistant de données (côté host) vers le chemin runtime attendu dans le conteneur (côté container)
2. Vérifier les chemins :
   - confirmer le chemin des données côté container (ex: `/app/server/data`) et aligner `DATA_DIR` + volume mount
3. Validation reproductible (commandes) :
   - `docker compose -f project/docker-compose.yml up -d --build`
   - vérifier que le serveur répond (ex: `/api`)
   - créer/modifier `project/server/data/scores.json` via un appel API (ou en copiant un fichier)
   - `docker compose -f project/docker-compose.yml restart`
   - re-vérifier que `scores.json` est toujours présent et que l’API retourne encore les entrées attendues
4. (Optionnel) Documenter brièvement les variables et le bind mount dans `project/README.md` si ça réduit une ambiguïté de déploiement.

## Cas limites à traiter

- Le dossier `server/data/` peut ne pas exister sur une machine fraîche : le compose doit être clair sur ce prérequis (créer le dossier ou le laisser créé par Docker selon stratégie choisie).
- Droits fichiers : le conteneur doit pouvoir écrire dans le bind mount (éviter un `read_only: true` global).
- Ne pas exposer le port publiquement si la stratégie est “Nginx sur le host” : privilégier un bind `127.0.0.1` côté host.

## Critères de validation

- [ ] `project/docker-compose.yml` existe et démarre l’application en 1 service.
- [ ] Le compose configure un bind mount persistant pour les données (dossier data du serveur).
- [ ] `PORT` et `DATA_DIR` sont configurés explicitement (ou justifiés si une alternative est retenue).
- [ ] Un redémarrage du conteneur via Docker Compose **conserve** `project/server/data/scores.json` (test reproductible décrit et exécuté).
- [ ] Aucune autre tâche que **id042** n’est cochée.

## Clôture

- Une fois (et seulement une fois) tous les critères de validation satisfaits :
  - cocher la case `- [ ]` → `- [x]` de **id042** dans `TODO.md`.
- Ne pas cocher d’autres tâches.
