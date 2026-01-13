# Prompt — id046 (P1) (S) — Documenter le runbook incidents (site down, POST scores en erreur, classement vide)

## 1) Role

Tu es un ingénieur logiciel senior orienté **exploitation/production (SRE-lite)**, à l’aise avec **Docker Compose**, **Nginx + Certbot**, et le diagnostic d’une app **Bun + Express** (mono-instance) qui persiste des données en **JSON** via bind mount.

Objectif de ton rôle : produire une documentation **actionnable** et **non ambiguë** (checklists + commandes) pour diagnostiquer et résoudre rapidement les incidents MVP, sans sur-scope.

## 2) Objectif

Implémenter la TODO **id046 (P1) (S)** : **documenter un runbook incidents** couvrant au minimum les cas suivants :

1. **Site down / ne répond plus**
2. **`POST /api/scores` en erreur** (4xx/5xx, en pratique surtout 5xx)
3. **Classement du jour vide “alors qu’il y a des scores”**

Le runbook doit accélérer le diagnostic en production (VPS OVH Linux) et proposer des **actions correctives** réalistes dans le cadre du MVP.

## 3) Format de sortie

Produis exclusivement :

- Le fichier [project/docs/runbook.md](project/docs/runbook.md)

Contenu attendu (structure recommandée) :

- Titre + périmètre (MVP, mono-instance)
- Pré-requis / accès (ssh, droits, où se trouvent les logs)
- Section par incident :
  - **Symptômes** (1–3 phrases)
  - **Vérifier** (checklist ordonnée, “du plus simple au plus probable”)
  - **Actions** (remédiations, rollback simples, redémarrage, corrections données)
  - **Escalade / Notes** (si applicable : quand arrêter et ouvrir un ticket)

## 4) Contraintes

- Ne change pas les décisions structurantes : **Bun 1.3.5**, **TypeScript**, **Express**, **mono-instance**, persistance **fichier JSON**, “jour” calculé en **Europe/Paris**, HTTPS via **Nginx + Certbot**.
- Ne crée pas d’outillage nouveau (pas d’APM, pas de Prometheus, pas de multi-instance).
- Le runbook doit rester **court mais complet**, orienté actions et commandes.
- Les commandes doivent être adaptées à un VPS Linux avec Docker/Compose et Nginx. Évite de dépendre d’outils non standards ; si tu proposes `jq`, propose aussi une alternative (ex: `python -m json.tool`).
- Ne réalise pas d’autres TODO. Ne modifie pas d’autres fichiers sauf si strictement nécessaire pour la doc (idéalement : aucun autre fichier).

## 5) Contexte technique

### Dépendances

- **Dépend de : id016** (logs serveur exploitables).
  - Ton runbook doit expliquer comment lire les logs via Docker/Compose, et quels messages chercher.

### Docs sources (source de vérité)

- Lis attentivement : [docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) — section **“5. Gestion des incidents (runbook léger)”**.
  - Tu dois en dériver une version plus opérationnelle sous `project/docs/runbook.md`.

### Rappels d’architecture (à refléter dans la doc)

- Déploiement : **Docker + Docker Compose**, 1 service applicatif (Express sert API + front buildé).
- HTTPS : terminaison sur le host via **Nginx + Certbot**, hostname `space-invader.jlg-consulting.com`.
- Données : `server/data/` monté en **bind mount** ; fichier typique `server/data/scores.json`.
- Logs : stdout/stderr du conteneur (diagnostic principal).

## 6) Étapes proposées (méthode)

1. Parcourir [docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) et extraire les points “Vérifier/Actions” des 3 incidents.
2. Écrire [project/docs/runbook.md](project/docs/runbook.md) avec une structure homogène par incident.
3. Ajouter des commandes concrètes, typiquement :
   - Docker : `docker compose ps`, `docker compose logs --tail=200`, `docker compose restart`, `docker compose exec ...`
   - HTTP : `curl -I https://space-invader.jlg-consulting.com/`, `curl -i https://space-invader.jlg-consulting.com/api/leaderboard/day`
   - Nginx/Certbot : `systemctl status nginx`, `nginx -t`, `certbot certificates`, `certbot renew --dry-run`
   - Système : `df -h`, `timedatectl`, vérification NTP
   - Données : validation JSON `scores.json` + sauvegarde avant réparation
4. Relire la doc pour garantir : concision, actionnabilité, ordre logique (du plus probable au plus coûteux).

## 7) Cas limites à couvrir explicitement

- **Site down** :
  - conteneur arrêté / en crash loop
  - Nginx down / mauvais vhost / ports 80/443 fermés
  - certificat expiré / renouvellement cassé
- **POST /api/scores en erreur** :
  - disque plein
  - permissions/ownership du dossier monté
  - `scores.json` corrompu / invalide
  - régression applicative (trace dans logs)
- **Classement vide** :
  - décalage de date du VPS (NTP off)
  - `dayKeyParis` incohérent avec la date réelle
  - scores présents mais pas pour le “jour” Paris (expliquer le principe)

## 8) Critères de validation (checklist)

- [ ] Le fichier [project/docs/runbook.md](project/docs/runbook.md) existe et est lisible.
- [ ] Les 3 incidents demandés sont présents, chacun avec **“Vérifier”** et **“Actions”**.
- [ ] Les actions proposées sont compatibles MVP (mono-instance, JSON file) et ne supposent pas d’outillage non prévu.
- [ ] Les commandes sont concrètes et cohérentes avec la stack (Docker Compose, Nginx, Certbot).
- [ ] La doc mentionne où sont les données (`server/data/`) et qu’il faut **sauvegarder** avant toute réparation du JSON.

## 9) Clôture

- Si (et seulement si) tous les critères de validation ci-dessus sont satisfaits : coche la case de **id046** dans [TODO.md](TODO.md) en passant `- [ ]` à `- [x]`.
- Interdiction de cocher d’autres tâches.
