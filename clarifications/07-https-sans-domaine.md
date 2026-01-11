# Clarification 07 — HTTPS sans domaine

- Date : 2026-01-11
- Contexte : TODO **id001 (P0) (S) — Clarifier la stratégie HTTPS “sans domaine”**
- Docs sources :
  - `docs/09-cicd-et-deploiement.md` (HTTPS requis ; domaine non requis)
  - `docs/10-exploitation-et-maintenance.md` (Sécurité minimum)
  - `clarifications/06-deploiement-et-hebergement.md` (VPS OVH + Compose)
- Statut : CLOTUREE

## Contexte

Le MVP doit être déployable sur un VPS OVH (Docker Compose, 1 service Express). HTTPS est requis en production, mais “domaine non requis”. Il faut décider une stratégie de terminaison HTTPS (reverse proxy + certificats) reproductible.

## Questions

- Q1 — Que signifie exactement “sans domaine” pour toi ?

  - [ ] Pas de domaine **acheté/administré** par nous, mais un **hostname fournisseur** (ex: FQDN OVH) est acceptable
  - [ ] Aucun FQDN : accès uniquement via **adresse IP** (ex: `https://203.0.113.10`)
  - [x] Autre : J'ai un VPS OVH avec le domaine jlg-consulting.com. Je vais creer un sous-domaine space-invader.jlg-consulting.com. Tu me diras comment regler le DNS dans une tache de todo liste pour le deploiement.
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q2 — Expérience utilisateur requise : le navigateur doit-il afficher un HTTPS “valide” (sans alerte) ?

  - [x] Oui : certificat signé par une **AC reconnue publiquement** (type Let’s Encrypt) obligatoire
  - [ ] Non : un certificat auto-signé/privé est acceptable (avec alerte navigateur)
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

Precision: on va installer ensemble et tu me feras un tache de todoliste, pour que l'acquisition du certificat let's encrypt soit le plus automatise possible.

- Q3 — Ports réseau disponibles sur le VPS (et au niveau firewall OVH) ?

  - [x] 80/tcp et 443/tcp sont ouverts et peuvent être utilisés
  - [ ] 443/tcp uniquement
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

Precision : j'aimerais bien que le VPS installe un serveur NGINX qui redirige space-invader.jlg-consulting.com sur un port approprie interne (ex: 9999). Il faudra un firewall (ufw) qui protege tous les ports sauf SSH, HTTP, HTTPS.

- Q4 — Préférence de reverse proxy pour la terminaison TLS ?

  - [ ] Caddy (ACME automatique, config simple)
  - [x] Nginx + outil ACME (certbot ou équivalent)
  - [ ] Traefik (intégration Docker)
  - [ ] Autre : \_\_\_\_
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q5 — Si une AC publique est requise : quelle stratégie d’obtention de certificat est acceptable ?

  - [x] ACME HTTP-01 sur un hostname qui résout vers le VPS (pas de contrôle DNS requis)
  - [ ] ACME DNS-01 (nécessite contrôle DNS d’un domaine)
  - [ ] Utiliser un service de DNS dynamique / sous-domaine gratuit (ex: DuckDNS) (implique un domaine “gratuit”)
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q6 — Redirection HTTP → HTTPS : souhaitée/obligatoire ?

  - [x] Oui, HTTP redirige systématiquement vers HTTPS
  - [ ] Non, HTTP peut rester accessible
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q7 — HSTS (Strict-Transport-Security) : souhaites-tu l’activer ?
  - [x] Oui
  - [ ] Non
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

## Options proposées (résumé + impacts)

### Option A — Hostname fournisseur + ACME (certificat public)

- Idée : utiliser un hostname déjà existant (ex: fourni par OVH) qui pointe vers le VPS et obtenir un cert via ACME.
- Impacts : HTTPS “valide” ; dépend d’un FQDN (mais pas forcément d’un domaine acheté) ; nécessite ports et routage corrects.

### Option B — IP only + certificat auto-signé/privé

- Idée : servir `https://<IP>` avec un cert non public.
- Impacts : alerte navigateur ; acceptable seulement si usage très contrôlé ; souvent “pas vraiment prod”.

### Option C — Sous-domaine gratuit (DuckDNS/équivalent) + ACME

- Idée : obtenir un FQDN sans achat de domaine.
- Impacts : HTTPS “valide” ; introduit une dépendance externe (service de DNS).

### Option D — Acheter un domaine (non recommandé si “sans domaine” est strict)

- Impacts : solution standard, mais contredit la contrainte produit si elle est interprétée strictement.

## Décision attendue / critères

- Priorité : conformité HTTPS en prod + procédure simple/reproductible.
- Critères : coût, dépendances externes, UX (pas d’alerte), simplicité opérationnelle, compatibilité Docker Compose.

## Réponses

Option A. J'ai deja le domaine jlg-consulting.com. Et OVH me laisse condigurer le DNS pour faire des sous-domaines. Il faudra que tu m'aides a faire la regle DNS pour faire le sous domaine 'space-invader'.

## Décisions actées

1. Domaine / hostname

- Domaine utilisé : `jlg-consulting.com`
- Sous-domaine : `space-invader.jlg-consulting.com`
- DNS : un enregistrement `A` (et `AAAA` si IPv6) pointera vers l’IP publique du VPS.

2. Terminaison TLS / reverse proxy

- Reverse proxy : **Nginx** installé sur le VPS (host)
- Certificat : **Let’s Encrypt** via **Certbot** (challenge **ACME HTTP-01**)
- Ports : **80/tcp** et **443/tcp** ouverts
- Routage :
  - HTTP (80) redirige vers HTTPS (443)
  - Nginx proxy vers l’app (Docker) sur `127.0.0.1:9999`

3. Sécurité

- Pare-feu : **UFW** autorise uniquement **SSH**, **HTTP**, **HTTPS**
- HSTS : activé (avec prudence sur la valeur initiale)

4. Renouvellement

- Renouvellement automatique via les timers systemd de Certbot (ou `certbot renew` planifié)

## À intégrer

- Mettre à jour `docs/09-cicd-et-deploiement.md` et `docs/10-exploitation-et-maintenance.md` pour refléter ces décisions (reverse proxy Nginx, certbot, DNS, ports, UFW, HSTS).
