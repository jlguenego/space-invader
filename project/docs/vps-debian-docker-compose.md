# Manuel d’installation — VPS Debian (OVH) : Docker Engine + plugin Compose (v2)

Objectif : installer **Docker** proprement sur Debian (VPS OVH), avec **Docker Compose v2** (plugin), et valider l’installation.

Ce dépôt déploie l’app via Docker Compose (mono-instance). Le reverse proxy Nginx (host) doit ensuite proxy vers l’app bindée en local sur `127.0.0.1:9999`.

---

## 0) Prérequis

- Accès SSH au VPS.
- Un utilisateur non-root (recommandé) avec `sudo`.

Vérifier Debian :

- `cat /etc/os-release`
- `cat /etc/debian_version`

Identifier le codename (ex: `bookworm`) :

- `. /etc/os-release; echo "$VERSION_CODENAME"`

---

## 1) (Optionnel) Nettoyer une ancienne installation Docker

Si Docker a déjà été installé via un autre canal, nettoyer d’abord :

- `sudo apt-get remove -y docker docker-engine docker.io containerd runc || true`

---

## 2) Installer Docker via le dépôt officiel (recommandé)

### 2.1 Dépendances APT

- `sudo apt-get update`
- `sudo apt-get install -y ca-certificates curl gnupg`

### 2.2 Ajouter la clé GPG et le dépôt Docker

- `sudo install -m 0755 -d /etc/apt/keyrings`
- `curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg`
- `sudo chmod a+r /etc/apt/keyrings/docker.gpg`

Ajouter le repo (utilise automatiquement l’architecture + le codename Debian) :

- `. /etc/os-release; echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $VERSION_CODENAME stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`

Mettre à jour l’index :

- `sudo apt-get update`

### 2.3 Installer Docker Engine + Compose plugin

Installer les paquets officiels :

- `sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`

Activer et démarrer Docker :

- `sudo systemctl enable --now docker`

---

## 3) Vérifications (à faire systématiquement)

### 3.1 Versions

- `docker --version`
- `docker compose version`

### 3.2 Service

- `sudo systemctl status docker --no-pager`
- `sudo ss -lntp | grep docker || true`

### 3.3 Test “hello-world”

En root (ou via sudo) :

- `sudo docker run --rm hello-world`

Attendu : un message indiquant que Docker fonctionne.

---

## 4) Utiliser Docker sans sudo (optionnel mais recommandé)

Ajouter ton utilisateur au groupe `docker` :

- `sudo usermod -aG docker $USER`

Important :

- Déconnecte-toi/reconnecte-toi (ou ouvre une nouvelle session SSH) pour que le groupe soit pris en compte.

Vérifier :

- `id`
- `docker ps`

---

## 5) Points sécurité / firewall (UFW)

- Ne pas exposer le daemon Docker sur TCP (ne pas activer une écoute `0.0.0.0:2375`).
- Docker manipule `iptables`/`nftables` et peut interagir avec UFW.

Pour ce projet :

- Le Docker Compose production mappe l’app sur `127.0.0.1:9999` uniquement ; **tu ne dois pas ouvrir 9999** sur Internet.
- UFW doit laisser passer uniquement : SSH + HTTP(80) + HTTPS(443) (cf. runbook Nginx).

Vérifier UFW :

- `sudo ufw status verbose`

---

## 6) Récupérer le code sur le VPS (Git clone)

Installer Git :

- `sudo apt-get update`
- `sudo apt-get install -y git`

Vérifier :

- `git --version`

Important (recommandation prod) : si ton VPS est **read-only** (tu ne veux jamais pousser/modifier le code depuis le VPS), préfère **HTTPS**.
Sur un dépôt public, HTTPS ne demande ni clé SSH, ni token.

### 6.1 Clone (read-only, léger) — HTTPS shallow

Clone léger (historique réduit) :

- `git clone --depth 1 https://github.com/jlguenego/space-invader.git space-invader`
- `cd space-invader`

### 6.2 Vérifications rapides

Vérifier que tu es au bon endroit :

- `pwd`
- `ls -la`

Vérifier l’état Git :

- `git status`
- `git rev-parse --short HEAD`

### 6.3 Mettre à jour plus tard

Depuis le dossier du dépôt :

- `git pull --ff-only`

Astuce “read-only stricte” : ne fais pas de commits sur le VPS (pas de `git commit`). Si tu veux éviter tout prompt interactif, tu peux aussi faire :

- `GIT_TERMINAL_PROMPT=0 git pull --ff-only`

---

## 7) Déployer l’app via Docker Compose (smoke local)

Depuis la racine du dépôt cloné :

- `cd project`

- `docker compose version`
- `docker compose up -d --build`

Vérifier que le conteneur tourne :

- `docker compose ps`
- `docker compose logs --tail=200 app`

Vérifier que l’app répond en local sur le VPS :

- `curl -I http://127.0.0.1:9999/`
- `curl -I http://127.0.0.1:9999/api`

---

## 8) Dépannage rapide

### 8.1 “permission denied” sur le socket Docker

- Vérifier que l’utilisateur est bien dans le groupe docker : `id`
- Si le groupe vient d’être ajouté : se reconnecter, puis retester.

### 8.2 Erreur de dépôt/codename (ex: `VERSION_CODENAME` vide)

- Vérifier `/etc/os-release` et que `VERSION_CODENAME` existe.
- À défaut, utiliser une valeur explicite (ex: `bookworm`) dans `/etc/apt/sources.list.d/docker.list`.

### 8.3 Docker ne démarre pas

- `sudo journalctl -u docker --no-pager -n 200`
- `sudo systemctl restart docker`

### 8.4 Conflit de ports

- `sudo ss -lntp | egrep ':80 |:443 |:9999 ' || true`

---

## 9) Désinstallation (si nécessaire)

- `sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`
- `sudo rm -rf /var/lib/docker /var/lib/containerd`
