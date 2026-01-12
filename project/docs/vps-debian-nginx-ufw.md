# Manuel d’installation — VPS Debian (OVH) : Nginx + UFW (+ prérequis Let’s Encrypt)

Objectif : préparer un VPS Debian “fresh install” pour servir un site en HTTP/HTTPS via **Nginx**, avec un firewall **UFW** strict (SSH + HTTP + HTTPS).

Contexte projet : le domaine cible est `space-invader.jlg-consulting.com` et le certificat sera obtenu via Let’s Encrypt **ACME HTTP-01** (nécessite `TCP:80` joignable depuis Internet).

## 0) Prérequis

- Accès SSH au VPS.
- Le DNS du sous-domaine pointe vers l’IP publique du VPS.

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
