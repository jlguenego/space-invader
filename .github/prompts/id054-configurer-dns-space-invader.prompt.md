# Prompt — id054 (P0) (S) — Configurer le DNS du sous-domaine `space-invader.jlg-consulting.com`

## Role

Tu es un ingénieur DevOps / SRE senior, à l’aise avec DNS (A/AAAA, TTL), validation réseau (80/443), et la préparation d’un déploiement Let’s Encrypt via ACME HTTP-01.

## Objectif

Réaliser la tâche **id054** **(P0)** _(S)_ : **configurer le DNS** pour le sous-domaine `space-invader.jlg-consulting.com` afin de permettre :

- l’accès public au VPS
- le challenge **ACME HTTP-01** (pré-requis à l’obtention d’un certificat Let’s Encrypt dans id043)

## Format de sortie

Produire :

- Une **note courte** ajoutée dans `docs/09-cicd-et-deploiement.md` (section “Stratégie HTTPS / DNS”) décrivant :
  - quels enregistrements créer (A et, si applicable, AAAA)
  - quelles valeurs (IP publique du VPS)
  - comment valider (commandes)

Si des informations indispensables manquent (IP publique, accès DNS, etc.), créer un fichier de clarifications et s’arrêter (voir section “Gate clarifications”).

## Contraintes

- Ne pas modifier les décisions structurantes :
  - Hostname : `space-invader.jlg-consulting.com`
  - Challenge : Let’s Encrypt **ACME HTTP-01**
  - Ports : **80** et **443** doivent être utilisables
  - Reverse proxy : **Nginx sur le host** (implémenté dans id043)
- Ne pas implémenter id043 (Nginx/Certbot/UFW) ni id045 (runbook de déploiement complet).
- Ne pas inventer une IP : récupérer l’IP publique du VPS et l’utiliser.
- Écriture inclusive interdite.
- Clôture : cocher uniquement **id054** dans `TODO.md` si et seulement si tous les critères de validation sont satisfaits.

## Contexte technique

### Extrait TODO (source)

- **id054** **(P0)** _(S)_ Configurer le DNS du sous-domaine `space-invader.jlg-consulting.com`
  - **But :** Permettre ACME HTTP-01 + accès public
  - **Livrable :** enregistrements DNS (A/AAAA) + note courte dans doc déploiement
  - **Acceptation :** résolution OK et port 80 atteint le VPS
  - **Dépendances :** id001
  - **Docs sources :**
    - `clarifications/07-https-sans-domaine.md` → “Décisions actées” (sous-domaine + A/AAAA vers IP VPS)
    - `docs/09-cicd-et-deploiement.md` → “Stratégie HTTPS” (Nginx host + Certbot HTTP-01)

### Ce qui est déjà acté (rappel)

- Le sous-domaine `space-invader.jlg-consulting.com` doit pointer vers l’IP publique du VPS.
- Le challenge Let’s Encrypt sera de type HTTP-01 (donc nécessite résolution DNS + port 80 joignable depuis Internet).

## Gate clarifications (obligatoire si bloqué)

Si tu n’as pas accès aux informations/actions nécessaires pour configurer DNS de manière non-arbitraire (ex: IP publique du VPS, accès au panneau DNS OVH), alors :

1. Créer un fichier : `clarifications/16-dns-space-invader.md`
2. Remplir le template ci-dessous et **s’arrêter**.
3. Reprendre id054 seulement après réponse de l’utilisateur dans ce fichier.

Template à inclure dans `clarifications/16-dns-space-invader.md` :

- Contexte : TODO **id054** + docs sources (`clarifications/07-https-sans-domaine.md`, `docs/09-cicd-et-deploiement.md`)
- Questions :
  - Q1 — IPv4 publique du VPS (pour enregistrement A) ?
    - [ ] Je fournis l’IPv4 : \_\_\_\_
    - [ ] Je ne sais pas / besoin d’une recommandation
    - [ ] Laisse l’IA choisir pour toi (avec justification)
  - Q2 — IPv6 publique du VPS disponible (pour enregistrement AAAA) ?
    - [ ] Oui, IPv6 : \_\_\_\_
    - [ ] Non
    - [ ] Je ne sais pas / besoin d’une recommandation
    - [ ] Laisse l’IA choisir pour toi (avec justification)
  - Q3 — Où se gère la zone DNS `jlg-consulting.com` ?
    - [ ] OVH (manager OVH)
    - [ ] Autre : \_\_\_\_
    - [ ] Je ne sais pas / besoin d’une recommandation
    - [ ] Laisse l’IA choisir pour toi (avec justification)
  - Q4 — TTL souhaité ?
    - [ ] Par défaut (fournisseur)
    - [ ] 300s (debug rapide)
    - [ ] 3600s (standard)
    - [ ] Autre : \_\_\_\_
    - [ ] Laisse l’IA choisir pour toi (avec justification)
- Options proposées + impacts (1–2 lignes)
- Décision attendue / critères
- Réponses (section vide)

## Étapes proposées (sans pause, sauf gate)

1. Récupérer l’IP publique du VPS :
   - IPv4 : exécuter sur le VPS `curl -4 https://ifconfig.me` (ou équivalent)
   - IPv6 (si disponible) : `curl -6 https://ifconfig.me`
2. Configurer la zone DNS (OVH ou autre) :
   - Créer `A` : `space-invader` → `<IPv4>`
   - Créer `AAAA` : `space-invader` → `<IPv6>` (uniquement si IPv6 utilisée)
   - Choisir un TTL raisonnable (par défaut fournisseur ou 300s en phase de mise au point)
3. Valider la résolution DNS :
   - `dig +short space-invader.jlg-consulting.com A`
   - `dig +short space-invader.jlg-consulting.com AAAA` (si applicable)
4. Valider “port 80 atteint le VPS” (sans implémenter id043) :
   - Si un service écoute déjà sur 80 : `curl -I http://space-invader.jlg-consulting.com`
   - Sinon, lancer un **listener temporaire** sur le VPS uniquement pour le test (ex: `sudo docker run --rm -p 80:80 nginx:alpine`) puis re-tester `curl -I`.
   - Documenter dans la note ce qui est attendu (200/301/404 acceptables tant que TCP:80 répond), et comment arrêter le listener.
5. Ajouter une note courte dans `docs/09-cicd-et-deploiement.md` décrivant : enregistrements, valeurs, commandes de vérification.

## Critères de validation

- [ ] Les enregistrements DNS `A` (et `AAAA` si applicable) existent pour `space-invader.jlg-consulting.com` et pointent vers l’IP publique du VPS.
- [ ] La résolution est confirmée via `dig`/`nslookup`.
- [ ] Un test réseau confirme que **le port 80** est atteignable sur le VPS via le hostname (au minimum handshake TCP, idéalement réponse HTTP).
- [ ] `docs/09-cicd-et-deploiement.md` contient une note courte sur la config DNS + validation.

## Clôture

- Cocher `- [ ]` → `- [x]` pour **id054** dans `TODO.md` uniquement si tous les critères de validation sont satisfaits.
- Ne pas cocher d’autres tâches.
