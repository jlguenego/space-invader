# Déploiement production (VPS Debian) — sans perte de données

Objectif : déployer le MVP sur un VPS Debian (OVH) via **Docker Compose**, avec terminaison **HTTPS Nginx + Certbot**, et surtout **sans jamais perdre les données** persistées dans `server/data/` (notamment `scores.json`).

Ce runbook est écrit pour être **copié-collé**.

---

## 1) Vue d’ensemble (topologie)

Schéma :

- Internet → **Nginx (host)** (ports 80/443)
- Nginx → reverse proxy vers `http://127.0.0.1:9999` (host)
- `127.0.0.1:9999` → port publié du conteneur **app** (Express sous Bun)
- Le conteneur sert **UI + API** (une seule app)

### Où vivent les données (point critique)

- Les données runtime sont dans `project/server/data/` côté dépôt.
- En prod, elles sont **montées dans le conteneur** via bind mount :
  - hôte : `./server/data` (depuis `project/`)
  - conteneur : `/app/server/data`

Le Compose prod (repo) : `project/docker-compose.yml`.

---

## 2) Pré-requis VPS (une fois)

### 2.1 DNS

- Le hostname `space-invader.jlg-consulting.com` doit résoudre vers l’IP du VPS (record A).
- Pré-requis Let’s Encrypt (ACME HTTP-01) : **TCP:80 doit répondre depuis Internet**.

Vérifications (depuis une machine extérieure) :

```bash
nslookup -type=A space-invader.jlg-consulting.com 1.1.1.1
curl -I http://space-invader.jlg-consulting.com/
```

### 2.2 Docker + Compose

Suivre : `project/docs/vps-debian-docker-compose.md`.

### 2.3 Nginx + UFW + Certbot

Suivre : `project/docs/vps-debian-nginx-ufw.md`.

Points attendus :

- UFW : SSH + 80/tcp + 443/tcp uniquement
- HTTP → HTTPS
- Reverse proxy vers `127.0.0.1:9999`
- HSTS prudent : `max-age=86400` (sans `preload`)

---

## 3) Arborescence recommandée sur le VPS

Deux approches possibles. Les deux fonctionnent ; la 2 est plus robuste.

### Option 1 — simple (données dans le clone git)

- Code + données vivent sous le même dossier.
- Suffisant tant que tu ne supprimes pas le dossier du dépôt.

Arbo :

- `$HOME/space-invader/` (clone du repo)
- `$HOME/space-invader/project/server/data/` (données persistées)

### Option 2 — recommandée (données dédiées + symlink)

Objectif : si tu dois re-cloner le dépôt, les données restent intactes.

Arbo :

- `$HOME/space-invader/` (clone du repo)
- `/srv/space-invader-data/` (données persistées, hors repo)
- `$HOME/space-invader/project/server/data` → symlink vers `/srv/space-invader-data`

Création (à faire **avant** le premier démarrage du conteneur) :

```bash
sudo mkdir -p /srv/space-invader-data
sudo chown -R $USER:$USER /srv/space-invader-data
sudo chmod 0750 /srv/space-invader-data

cd "$HOME/space-invader/project"

# Sauvegarde de sécurité si un dossier data existe déjà
if [ -d server/data ] && [ ! -L server/data ]; then
  mv server/data "server/data.bak.$(date +%Y%m%d-%H%M%S)"
fi

ln -s /srv/space-invader-data server/data

# Vérifier : le chemin résolu doit pointer vers /srv/space-invader-data
readlink -f server/data
ls -la server/data
```

---

## 4) Variables d’environnement / configuration runtime

La configuration prod est déjà fixée dans `project/docker-compose.yml`.

Actuellement :

- `NODE_ENV=production`
- `PORT=3000` (port d’écoute **dans** le conteneur)
- `APP_BIND_HOST=0.0.0.0` (écoute dans le conteneur)
- `DATA_DIR=/app/server/data` (doit correspondre au bind mount)

Note : la règle “jour Europe/Paris” est codée explicitement côté serveur ; ne pas compter sur le TZ système.

---

## 5) Premier déploiement (initialisation)

### 5.1 Connexion

```bash
ssh <user>@space-invader.jlg-consulting.com
```

### 5.2 Récupérer le code

Clone (read-only, léger) :

```bash
mkdir -p "$HOME"
cd "$HOME"

# Remplace l’URL si besoin (fork, miroir, etc.)
git clone --depth 1 https://github.com/jlguenego/space-invader.git space-invader
cd space-invader

git rev-parse --short HEAD
```

### 5.3 Préparer la persistance (indispensable)

- Option 1 : ne rien faire (données dans le clone)
- Option 2 : symlink vers `/srv/space-invader-data/` (recommandée) — voir section 3

Vérifier que le dossier data existe (ou que le symlink est correct) :

```bash
cd "$HOME/space-invader/project"
ls -la server/data
```

### 5.4 Démarrer (build + run)

```bash
cd "$HOME/space-invader/project"

docker compose up -d --build

docker compose ps
```

### 5.5 Vérifications locales (sur le VPS)

```bash
curl -I http://127.0.0.1:9999/
curl -I http://127.0.0.1:9999/api
```

Vérifier que `9999` est bien bindé en local uniquement :

```bash
sudo ss -lntp | grep ':9999 ' || true
```

### 5.6 Vérifications publiques (HTTPS)

```bash
curl -I https://space-invader.jlg-consulting.com/
curl -I https://space-invader.jlg-consulting.com/api/leaderboard/day

# HSTS (attendu : max-age=86400)
curl -I https://space-invader.jlg-consulting.com/ | grep -i strict-transport-security || true
```

### 5.7 Logs

```bash
docker compose logs --tail=200 app
```

---

## 6) Déployer une nouvelle version (sans perte de données)

Principe : **ne jamais toucher au répertoire bind mount** et redémarrer via `docker compose up -d --build`.

### 6.1 Pré-checks (sécurité données)

Avant toute mise à jour, vérifier que les données existent et ne sont pas vides :

```bash
cd "$HOME/space-invader/project"

# Présence du fichier de scores (peut être absent si aucun score n’a encore été écrit)
ls -la server/data || true

# Si le fichier existe, vérifier sa taille (non destructif)
if [ -f server/data/scores.json ]; then
  wc -c server/data/scores.json
  tail -n 2 server/data/scores.json || true
fi
```

### 6.2 Mise à jour du code

```bash
cd "$HOME/space-invader"

git fetch --all --prune

git pull --ff-only

git rev-parse --short HEAD
```

### 6.3 Rebuild + redémarrage (safe)

```bash
cd "$HOME/space-invader/project"

docker compose up -d --build

docker compose ps
```

### 6.4 Vérification post-déploiement

```bash
# Local upstream
curl -I http://127.0.0.1:9999/
curl -I http://127.0.0.1:9999/api

# Public HTTPS
curl -I https://space-invader.jlg-consulting.com/
curl -I https://space-invader.jlg-consulting.com/api/leaderboard/day

# Logs
docker compose logs --tail=200 app
```

### 6.5 Vérifier que les données n’ont pas été écrasées

```bash
cd "$HOME/space-invader/project"

if [ -f server/data/scores.json ]; then
  wc -c server/data/scores.json
fi
```

---

## 7) À NE PAS FAIRE (risque de perte de données)

Ces commandes sont dangereuses en prod pour ce projet (persistance fichiers) :

- Ne jamais supprimer le dossier monté en bind mount : `rm -rf project/server/data` (interdit)
- Ne jamais utiliser : `docker compose down -v` (interdit)
- Éviter : `docker system prune --volumes` (peut supprimer des volumes nécessaires)
- Éviter : `git clean -fdx` dans le repo (peut supprimer des fichiers non suivis, donc `scores.json`)
- Éviter de “re-cloner par-dessus” le dossier existant sans préserver `server/data/`

Rappel : `scores.json` n’est pas versionné (volontairement) ; c’est donc à toi de **protéger le répertoire** qui le contient.

---

## 8) Rollback minimal

Objectif : revenir rapidement à une version précédente si une mise à jour casse.

### 8.1 Revenir au commit précédent (simple)

```bash
cd "$HOME/space-invader"

# Trouver le commit précédent
prev="$(git rev-parse HEAD~1)"

git checkout "$prev"

git rev-parse --short HEAD

cd "$HOME/space-invader/project"
docker compose up -d --build

docker compose ps
```

### 8.2 Vérifier après rollback

```bash
curl -I http://127.0.0.1:9999/
curl -I https://space-invader.jlg-consulting.com/api/leaderboard/day

docker compose logs --tail=200 app
```

Données :

```bash
cd "$HOME/space-invader/project"
ls -la server/data || true
if [ -f server/data/scores.json ]; then wc -c server/data/scores.json; fi
```

---

## 9) Dépannage rapide (3 scénarios)

### 9.1 Le site ne répond pas

1. Nginx :

```bash
sudo systemctl status nginx --no-pager
sudo nginx -t
sudo ss -lntp | egrep ':80 |:443 ' || true
```

2. Upstream local :

```bash
curl -I http://127.0.0.1:9999/ || true
sudo ss -lntp | grep ':9999 ' || true
```

3. Conteneur :

```bash
cd "$HOME/space-invader/project"
docker compose ps
docker compose logs --tail=200 app
```

### 9.2 L’API renvoie 5xx

```bash
cd "$HOME/space-invader/project"
docker compose logs --tail=400 app
```

Points typiques :

- Permissions/écriture sur `server/data/`
- Disque plein
- JSON corrompu (rare si écriture atomique, mais possible en cas de manipulation manuelle)

Vérifications non destructives :

```bash
cd "$HOME/space-invader/project"

df -h
ls -la server/data

if [ -f server/data/scores.json ]; then
  head -n 2 server/data/scores.json || true
  tail -n 2 server/data/scores.json || true
fi
```

### 9.3 Problème de permissions sur le bind mount (`server/data/`)

Symptômes : erreurs d’écriture dans les logs, `EACCES`, scores non enregistrés.

Fix “standard” (si tu utilises l’option 2 avec `/srv/space-invader-data`) :

```bash
sudo chown -R $USER:$USER /srv/space-invader-data
sudo chmod 0750 /srv/space-invader-data
```

Puis redémarrer :

```bash
cd "$HOME/space-invader/project"
docker compose up -d
```
