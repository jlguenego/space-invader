# Manuel d’installation — VPS Debian (OVH) : Nginx + UFW (+ prérequis Let’s Encrypt)

Objectif : préparer un VPS Debian “fresh install” pour servir un site en HTTP/HTTPS via **Nginx**, avec un firewall **UFW** strict (SSH + HTTP + HTTPS).

Contexte projet : le domaine cible est `space-invader.jlg-consulting.com` et le certificat sera obtenu via Let’s Encrypt **ACME HTTP-01** (nécessite `TCP:80` joignable depuis Internet).

## 0) Prérequis

- Accès SSH au VPS.
- Le DNS du sous-domaine pointe vers l’IP publique du VPS.

Note : l’installation Docker (Docker Engine + plugin `docker compose`) est documentée séparément dans `project/docs/vps-debian-docker-compose.md`.

Hypothèse pour les commandes ci-dessous : le dépôt est cloné sur le VPS dans `$HOME/space-invader`.

Sur ton poste (Windows), vérifier que le hostname résout :

- `nslookup -type=A space-invader.jlg-consulting.com 1.1.1.1`

## 1) Connexion et vérifications de base

Se connecter :

- `ssh <user>@space-invader.jlg-consulting.com`

Vérifier la version Debian :

- `cat /etc/os-release`
- `cat /etc/debian_version`

Vérifier si quelque chose écoute déjà sur le port 80 :

- `sudo ss -lntp | grep ':80 ' || true`

## 2) Mise à jour système

Sur le VPS :

- `sudo -i`
- `apt update`
- `apt upgrade -y`
- `apt install -y ca-certificates curl`

## 3) Installer et démarrer Nginx

Installer :

- `apt install -y nginx`

Activer au boot + démarrer :

- `systemctl enable --now nginx`

Vérifier :

- `systemctl status nginx --no-pager`
- `ss -lntp | grep ':80 ' || true`
- `curl -I http://127.0.0.1/`

Depuis ton poste (extérieur), vérifier que le VPS répond sur 80 :

- `powershell -c "Test-NetConnection space-invader.jlg-consulting.com -Port 80"`
- `curl -I http://space-invader.jlg-consulting.com/`

Toute réponse HTTP (`200`, `301`, `404`) est acceptable à ce stade ; le point clé est que **TCP:80 répond**.

## 4) Vérifier la présence d’un firewall (avant UFW)

Lister ce qui est déjà actif :

- UFW : `sudo ufw status verbose` (si la commande existe)
- nftables :
  - `sudo systemctl status nftables --no-pager || true`
  - `sudo nft list ruleset | sed -n '1,200p' || true`
- iptables :
  - `sudo iptables -S || true`
  - `sudo iptables -L -n -v || true`

Si tu vois déjà des règles bloquantes, note-les avant de continuer.

## 5) Installer et configurer UFW (SSH + HTTP + HTTPS uniquement)

Important : **autoriser SSH avant d’activer UFW** (sinon risque de perdre la connexion).

Installer :

- `apt install -y ufw`

Autoriser SSH :

- `ufw allow OpenSSH`

Autoriser HTTP+HTTPS pour Nginx :

- `ufw allow 'Nginx Full'`

Vérifier les règles :

- `ufw status verbose`

Activer :

- `ufw enable`

Re-vérifier :

- `ufw status verbose`

Checklist attendue :

- `OpenSSH` autorisé
- `Nginx Full` autorisé (80/tcp + 443/tcp)
- Tout le reste bloqué (policy par défaut)

## 6) (Optionnel / suite) Installer Certbot Let’s Encrypt pour Nginx

Ce projet vise Let’s Encrypt via **HTTP-01**.

Installer Certbot :

- `apt install -y certbot python3-certbot-nginx`

Obtenir le certificat :

- `certbot --nginx -d space-invader.jlg-consulting.com`

Tester le renouvellement :

- `certbot renew --dry-run`

## 6bis) Terminaison HTTPS + reverse proxy vers 127.0.0.1:9999 (production)

Objectif :

- `http://space-invader.jlg-consulting.com` redirige vers `https://space-invader.jlg-consulting.com`
- `https://space-invader.jlg-consulting.com` reverse-proxy vers l’app sur `http://127.0.0.1:9999`
- Certificat valide Let’s Encrypt via **Certbot** (ACME **HTTP-01**)
- HSTS activé avec une valeur prudente (ex: `max-age=86400`, sans `preload`)
- UFW strict : SSH + 80/tcp + 443/tcp uniquement

### 6bis.1) Pré-checks indispensables

1. DNS : vérifier que le hostname résout vers l’IP du VPS

Depuis une machine extérieure :

- `nslookup -type=A space-invader.jlg-consulting.com 1.1.1.1`

Si tu as un AAAA, vérifier qu’IPv6 est réellement routée, sinon supprimer le AAAA.

2. Réseau : vérifier que TCP:80 répond depuis Internet (pré-requis ACME HTTP-01)

- `curl -I http://space-invader.jlg-consulting.com/`

Toute réponse HTTP (`200`, `301`, `404`) est acceptable ; le point clé est que **TCP:80 répond**.

3. App locale : vérifier que l’app écoute en local sur le VPS

Sur le VPS :

- `curl -I http://127.0.0.1:9999/`

Si ça ne répond pas, déployer/démarrer l’app d’abord (Docker Compose) avant de continuer.

### 6bis.2) Créer le vhost Nginx (HTTP + HTTPS) pour le reverse proxy

Sur le VPS :

1. Créer le dossier webroot ACME (sert uniquement le challenge HTTP-01, même après redirection)

- `sudo mkdir -p /var/www/letsencrypt/.well-known/acme-challenge`
- `sudo chown -R www-data:www-data /var/www/letsencrypt`

2. Créer le site Nginx

Avant d’obtenir le certificat, ne mets pas un vhost `listen 443 ssl` “final” : `nginx -t` échouera si les fichiers `/etc/letsencrypt/live/...` n’existent pas encore.

Étape A — créer un vhost **HTTP-only** (safe) pour permettre le challenge HTTP-01 :

- `sudo tee /etc/nginx/sites-available/space-invader.jlg-consulting.com > /dev/null <<'EOF'
  server {
  listen 80;
  listen [::]:80;

  server_name space-invader.jlg-consulting.com;

  location ^~ /.well-known/acme-challenge/ {
  root /var/www/letsencrypt;
  default_type "text/plain";
  try_files $uri =404;
  }

  location / { # temporaire : le HTTPS sera activé par Certbot (puis on appliquera le template du repo)
  return 200 "nginx ok (http)";
  }
  }
  EOF`

Étape B — activer le site et recharger Nginx :

- `sudo ln -sf /etc/nginx/sites-available/space-invader.jlg-consulting.com /etc/nginx/sites-enabled/space-invader.jlg-consulting.com`
- `sudo rm -f /etc/nginx/sites-enabled/default`
- `sudo nginx -t`
- `sudo systemctl reload nginx`

Étape C — après obtention du certificat (voir section suivante), appliquer le template versionné du repo (config finale HTTP→HTTPS + reverse-proxy) :

- `sudo cp -f ~/space-invader/project/docs/nginx/space-invader.jlg-consulting.com.conf /etc/nginx/sites-available/space-invader.jlg-consulting.com`
- `sudo nginx -t`
- `sudo systemctl reload nginx`

3. Activer le site

- `sudo ln -sf /etc/nginx/sites-available/space-invader.jlg-consulting.com /etc/nginx/sites-enabled/space-invader.jlg-consulting.com`

Optionnel (recommandé) : désactiver le site par défaut s’il entre en conflit

- `sudo rm -f /etc/nginx/sites-enabled/default`

4. Valider la config et recharger

- `sudo nginx -t`
- `sudo systemctl reload nginx`

### 6bis.3) Obtenir le certificat Let’s Encrypt (Certbot)

Installer Certbot + plugin Nginx (si pas déjà fait) :

- `sudo apt update`
- `sudo apt install -y certbot python3-certbot-nginx`

Obtenir et installer le certificat (ACME HTTP-01) :

- `sudo certbot --nginx -d space-invader.jlg-consulting.com`

Puis appliquer le template du repo (si ce n’est pas déjà fait) :

- `sudo cp -f ~/space-invader/project/docs/nginx/space-invader.jlg-consulting.com.conf /etc/nginx/sites-available/space-invader.jlg-consulting.com`
- `sudo nginx -t`
- `sudo systemctl reload nginx`

Notes :

- Certbot peut proposer d’activer la redirection HTTP→HTTPS : accepter (la config du template la fait déjà, mais Certbot peut la réécrire).
- Si Certbot modifie la config, re-valider ensuite.

Vérifier :

- `sudo nginx -t`
- `sudo systemctl reload nginx`
- `sudo certbot certificates`

### 6bis.4) Activer HSTS (valeur prudente)

La manière la plus simple (et reproductible) est d’appliquer le template versionné du repo, qui contient déjà un HSTS prudent (`max-age=86400`, sans `preload`).

Commande (copier/coller) :

- `sudo cp -f ~/space-invader/project/docs/nginx/space-invader.jlg-consulting.com.conf /etc/nginx/sites-available/space-invader.jlg-consulting.com && sudo nginx -t && sudo systemctl reload nginx`

Vérifier que l’header est présent (depuis une machine extérieure) :

- `curl -I https://space-invader.jlg-consulting.com/ | grep -i strict-transport-security || true`

Attendu : `Strict-Transport-Security: max-age=86400`.

### 6bis.5) Firewall UFW (rappel) + vérification

Vérifier que seuls SSH/80/443 sont ouverts :

- `sudo ufw status verbose`

Attendu : `OpenSSH` + `Nginx Full` et rien d’autre.

Si tu dois (re)appliquer :

- `sudo ufw allow OpenSSH`
- `sudo ufw allow 'Nginx Full'`
- `sudo ufw enable`

### 6bis.6) Validation depuis l’extérieur (checklist)

Depuis une machine extérieure :

1. HTTP redirige vers HTTPS

- `curl -I http://space-invader.jlg-consulting.com/`

Attendu : code `301`/`308` et un header `Location: https://space-invader.jlg-consulting.com/...`.

2. HTTPS répond sans erreur TLS

- `curl -I https://space-invader.jlg-consulting.com/`

Attendu : réponse HTTP (200/304/3xx acceptables selon ton app) sans erreur TLS.

3. HSTS présent

- `curl -I https://space-invader.jlg-consulting.com/ | grep -i strict-transport-security || true`

Attendu : `Strict-Transport-Security: max-age=86400`.

4. Vérifier les dates du certificat

- `echo | openssl s_client -connect space-invader.jlg-consulting.com:443 -servername space-invader.jlg-consulting.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates`

### 6bis.7) Renouvellement automatique (systemd timer) + dry-run

Tester le renouvellement :

- `sudo certbot renew --dry-run`

Vérifier le mécanisme automatique (Debian) :

- `systemctl list-timers --all | grep -i certbot || true`
- `systemctl status certbot.timer --no-pager || true`

Vérifier les logs :

- `sudo journalctl -u certbot --since "7 days ago" --no-pager || true`

### 6bis.8) Dépannage rapide (cas fréquents)

1. Port 80 non joignable depuis Internet

- Vérifier UFW : `sudo ufw status verbose`
- Vérifier Nginx : `sudo ss -lntp | egrep ':80 |:443 ' || true`
- Vérifier firewall OVH / règles réseau : s’assurer que 80/443 sont ouverts

2. DNS non propagé / mauvais enregistrement

- `nslookup space-invader.jlg-consulting.com 1.1.1.1`
- `dig +short space-invader.jlg-consulting.com A`

3. Conflit : un service écoute déjà sur 80/443

- `sudo ss -lntp | egrep ':80 |:443 ' || true`

4. Certbot a cassé la config Nginx

- `sudo nginx -t`
- Revenir temporairement en arrière (restaurer le fichier vhost) puis relancer `certbot --nginx`

5. Certificat existant / ancien

- Lister : `sudo certbot certificates`
- Forcer renouvellement (si nécessaire) : `sudo certbot renew --force-renewal`

## 7) Dépannage rapide

- Logs Nginx :
  - `tail -n 50 /var/log/nginx/error.log`
  - `tail -n 50 /var/log/nginx/access.log`
- Vérifier les ports :
  - `sudo ss -lntp | egrep ':80 |:443 ' || true`
- Vérifier UFW :
  - `sudo ufw status numbered`

## Notes

- Cette page couvre uniquement la préparation Nginx/UFW. La configuration reverse-proxy vers l’application (port interne `127.0.0.1:9999`) et l’HTTPS complet font partie de la suite (Nginx site config + Certbot + HSTS).
