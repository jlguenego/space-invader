# Clarification 06 — Déploiement & hébergement

- Date : 2026-01-10
- Contexte : finalisation de `docs/09-cicd-et-deploiement.md` + contraintes (mono-instance, persistance fichiers JSON).
- Statut : CLOTUREE

## Questions

### 1) Cible d’hébergement

- Où souhaites-tu héberger le projet ?
  - VPS (Linux) (ex: OVH/Hetzner/DigitalOcean) VPS chez OVH (OVH VPS)
  - PaaS (ex: Render/Railway/Fly.io) NON
  - Autre (à préciser) NON
- As-tu une préférence “Docker obligatoire” ou “Docker interdit” ? DOCKER OBLIGATOIRE

### 2) Topologie

- Souhaites-tu :
  - Option A : une seule app Express qui sert aussi le front buildé (1 service) OUI
  - Option B : front statique séparé + back API séparé (2 services) NON

### 3) Domaine, HTTPS, CORS

- Domaine requis (oui/non) ? NON
- HTTPS requis (oui/non) ? OUI
- Si option B : CORS autorisé depuis quel(s) domaine(s) ? NON

### 4) Persistance fichiers (JSON)

- Où stocker `server/data/` en production ?
  - volume disque du serveur (répertoire)
  - volume Docker (bind mount) OUI
  - volume managé (selon PaaS)
- Souhaites-tu une stratégie de sauvegarde ?
  - aucune (MVP) AUCUNE
  - sauvegarde quotidienne
  - autre

### 5) Process manager / run mode

- En production, tu préfères :
  - `node` simple OUI
  - PM2
  - systemd
  - Docker (compose)

### 6) Environnements

- Souhaites-tu :
  - 1 environnement (prod uniquement) OUI
  - 2 environnements (staging + prod) NON

### 7) CI (outil)

- Plateforme CI souhaitée :
  - GitHub Actions OUI
  - GitLab CI
  - autre

## Hypothèses proposées (si tu n’as pas de préférence)

- Déploiement : VPS Linux + Docker Compose. OUI
- Topologie : option A (Express sert le front) pour réduire la complexité. OUI
- Persistance : bind mount de `server/data/` sur le disque. OUI
- Run : redémarrage automatique via Docker (policy) ; logs via stdout. OUI
- CI : GitHub Actions. OUI

## Décision / Réponse

### Décisions actées

1. Hébergement

- Décision : VPS OVH (Linux).
- PaaS : non.

2. Conteneurisation

- Décision : Docker obligatoire.
- Mode : Docker Compose.

3. Topologie

- Décision : option A — une seule app Express qui sert aussi le front buildé (1 service).
- Option B : non.

4. Domaine / HTTPS / CORS

- Domaine : non requis.
- HTTPS : requis.
- CORS : non applicable (option A) ; pas d’exigence spécifique.

5. Persistance fichiers

- Décision : persistance via bind mount Docker pour `server/data/`.
- Sauvegardes : aucune (MVP).

6. Run mode

- Décision : exécution simple (pas de PM2/systemd en direct), pilotée via Docker (redémarrage automatique + logs stdout).

7. Environnements

- Décision : un seul environnement (prod uniquement).

8. CI

- Décision : GitHub Actions.

### À intégrer

- Mettre à jour `docs/09-cicd-et-deploiement.md` pour remplacer les hypothèses “à valider” par ces décisions.
