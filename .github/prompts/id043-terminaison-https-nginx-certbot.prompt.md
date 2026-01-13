# Prompt — TODO id043 (P0) (M) — Mettre en place la terminaison HTTPS (Nginx+Certbot) selon décision id001

## Role

Tu es un ingénieur DevOps / SRE senior, orienté “runbook reproductible”, avec de très bonnes pratiques sécurité, et à l’aise avec Nginx + Certbot sur Debian (VPS). Tu sais produire une documentation opérable (copy/paste), sans blabla, et tu valides systématiquement par des commandes de vérification.

## Objectif

Implémenter la terminaison HTTPS “production” sur un VPS Debian OVH, conformément à la décision id001 :

- Hostname public : `space-invader.jlg-consulting.com`
- Reverse-proxy : Nginx sur le host
- Certificat : Let’s Encrypt via Certbot, challenge ACME HTTP-01
- Routage : HTTP (80) redirige vers HTTPS (443) ; HTTPS reverse-proxy vers l’app sur `127.0.0.1:9999`
- Sécurité : UFW strict (SSH + HTTP + HTTPS uniquement) + HSTS activé (durée prudente)

Le résultat doit être documenté de manière reproductible et vérifiable.

## Format de sortie

Produire (et/ou mettre à jour) les fichiers suivants dans le dépôt :

1. Documentation opérable (obligatoire)

- Mettre à jour le runbook existant : [project/docs/vps-debian-nginx-ufw.md](project/docs/vps-debian-nginx-ufw.md)
  - Ajouter une section complète “Terminaison HTTPS + reverse proxy vers 127.0.0.1:9999” incluant :
    - création/édition du vhost Nginx
    - activation du site
    - obtention du certificat via Certbot
    - redirection HTTP→HTTPS
    - activation HSTS (max-age prudent)
    - vérifications réseau (depuis l’extérieur) et diagnostics
    - renouvellement automatique (systemd timer) + test `--dry-run`

2. Template de configuration Nginx (fortement recommandé)

- Ajouter un fichier de template versionné : `project/docs/nginx/space-invader.jlg-consulting.com.conf`
  - Contient un exemple de configuration “sûre” et lisible (server block 80 + 443) avec proxy vers `127.0.0.1:9999`.
  - Ce fichier est une référence ; l’installation sur le VPS se fait dans `/etc/nginx/sites-available/...`.

3. Ajustements éventuels (uniquement si nécessaire)

- Si la config runtime actuelle ne permet pas le reverse proxy tel que demandé, proposer un correctif minimal dans :
  - [project/docker-compose.yml](project/docker-compose.yml)
  - et/ou configuration serveur Bun/Express côté `APP_BIND_HOST`/`PORT`

## Contraintes

- Ne pas changer les décisions structurantes : Bun 1.3.5, mono-instance, persistance bind mount, timezone Europe/Paris.
- Conserver la topologie retenue : Nginx sur le host, application servie en local sur `127.0.0.1:9999`.
- Garder UFW strict : autoriser uniquement SSH + 80/tcp + 443/tcp.
- HSTS doit être activé, mais avec une valeur initiale prudente (éviter une durée longue d’emblée). Ne pas activer `preload`.
- Ne pas inventer de prérequis non mentionnés : si un point est ambigu, s’appuyer sur les docs sources listées.
- Le prompt est en mode autonome : exécuter de bout en bout (docs + templates + validation). Ne pas demander de confirmations intermédiaires.

## Contexte technique

### Tâche TODO (à reprendre telle quelle)

- ID : **id043**
- Priorité : **(P0)**
- Taille : _(M)_
- Titre : Mettre en place la terminaison HTTPS (Nginx+Certbot) selon décision id001

- But : Respecter HTTPS requis.
- Livrable : Nginx reverse-proxy + Certbot/LE + HTTP→HTTPS + HSTS + UFW + doc.
- Acceptation : HTTPS OK, HTTP redirige, proxy `127.0.0.1:9999`, renouvellement auto.
- Dépendances : **id001**, **id042**, **id054**.

### Décision HTTPS (source de vérité)

- [clarifications/07-https-sans-domaine.md](clarifications/07-https-sans-domaine.md)
- [docs/09-cicd-et-deploiement.md](docs/09-cicd-et-deploiement.md) (section “Déploiement (décisions actées) / Stratégie HTTPS”)
- [docs/10-exploitation-et-maintenance.md](docs/10-exploitation-et-maintenance.md) (section “Sécurité (minimum)”)

### Configuration applicative attendue

- Compose prod expose l’app en local sur le VPS :
  - [project/docker-compose.yml](project/docker-compose.yml) mappe `127.0.0.1:9999:3000`
  - Nginx doit proxy vers `http://127.0.0.1:9999`

### Éléments à inclure dans le vhost Nginx

- Reverse proxy HTTP/1.1 vers l’upstream local (port 9999)
- Headers proxy standard : `Host`, `X-Forwarded-For`, `X-Forwarded-Proto`
- Timeouts raisonnables
- Redirection HTTP→HTTPS
- HSTS (valeur initiale prudente, exemple : `max-age=86400`)

## Étapes proposées (à exécuter)

1. Vérifier les prérequis des dépendances

- Confirmer que le DNS résout bien `space-invader.jlg-consulting.com` vers l’IP du VPS (A, et AAAA uniquement si IPv6 réelle).
- Confirmer que l’app est accessible localement sur le VPS via `127.0.0.1:9999` (Compose id042) avant de configurer le proxy.

2. Mettre à jour la doc runbook

- Étendre [project/docs/vps-debian-nginx-ufw.md](project/docs/vps-debian-nginx-ufw.md) :
  - étapes Nginx site config (création du fichier, `nginx -t`, reload)
  - activation certbot (installation, commande d’obtention, vérifications)
  - règles UFW (y compris “ne pas se verrouiller hors SSH”)
  - HSTS
  - commandes de diagnostic et de validation depuis une machine externe

3. Ajouter le template de vhost Nginx dans le repo

- Créer `project/docs/nginx/space-invader.jlg-consulting.com.conf`.
- Le template doit inclure les deux server blocks (80 et 443), et la partie TLS peut être “gérée par Certbot” (commentaires clairs sur ce que Certbot injecte).

4. Validation (checklist + commandes)

- Documenter des commandes concrètes, et préciser quelle sortie est attendue.

## Cas limites à couvrir explicitement dans la doc

- Port 80 non joignable depuis Internet (bloqué OVH firewall / security group / UFW / Nginx down)
- DNS non propagé / TTL trop haut / mauvais enregistrement
- Conflit de service écoutant déjà sur 80/443
- Certbot injecte une config qui casse `nginx -t`
- Certificat existant/ancien (renew vs new)

## Critères de validation

Checklist de succès (tout doit être vrai) :

- DNS : `space-invader.jlg-consulting.com` résout vers le VPS (A, et AAAA uniquement si prévu).
- Réseau : depuis une machine extérieure, `curl -I http://space-invader.jlg-consulting.com` répond (avant ou pendant l’obtention du cert), et à la fin renvoie une redirection vers HTTPS.
- HTTPS : `curl -I https://space-invader.jlg-consulting.com` retourne une réponse valide sans erreur TLS.
- Redirection : HTTP (80) redirige systématiquement vers HTTPS (443).
- Proxy : Nginx reverse-proxy vers `127.0.0.1:9999` (pas vers une IP publique, pas de port exposé en 0.0.0.0).
- HSTS : header `Strict-Transport-Security` présent sur les réponses HTTPS, avec une durée prudente (pas de preload).
- Firewall : `ufw status verbose` montre uniquement SSH + 80/tcp + 443/tcp ouverts.
- Renouvellement : `certbot renew --dry-run` passe, et le mécanisme automatique (timer systemd) est vérifié.
- Documentation : le runbook contient une séquence de commandes reproductibles + une section “Dépannage rapide”.

## Clôture

- Cocher `- [ ] **id043**` en `- [x]` dans [TODO.md](TODO.md) uniquement si tous les livrables sont présents et si tous les critères de validation ci-dessus sont satisfaits.
- Ne pas cocher d’autres tâches.
