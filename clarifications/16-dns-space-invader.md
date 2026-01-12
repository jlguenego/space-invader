# Clarification 16 — DNS `space-invader.jlg-consulting.com`

- Date : 2026-01-12
- Contexte : TODO **id054 (P0) (S) — Configurer le DNS du sous-domaine `space-invader.jlg-consulting.com`**
- Docs sources :
  - `clarifications/07-https-sans-domaine.md`
  - `docs/09-cicd-et-deploiement.md`
- Statut : CLOTUREE

## Contexte

L’objectif est de configurer le DNS pour `space-invader.jlg-consulting.com` afin que le hostname résolve vers l’IP publique du VPS et permette le challenge Let’s Encrypt **ACME HTTP-01** (pré-requis à id043).

## Questions

- Q1 — IPv4 publique du VPS (pour enregistrement A) ?

  - [x] Je fournis l’IPv4 : 51.38.129.125
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q2 — IPv6 publique du VPS disponible (pour enregistrement AAAA) ?

  - [x] Oui, IPv6 : 2001:41d0:601:1100::13c8
  - [ ] Non
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q3 — Où se gère la zone DNS `jlg-consulting.com` ?

  - [x] OVH (manager OVH)
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q4 — TTL souhaité ?
  - [ ] Par défaut (fournisseur)
  - [ ] 300s (debug rapide)
  - [ ] 3600s (standard)
  - [ ] Autre : \_\_\_\_
  - [x] Laisse l’IA choisir pour toi (avec justification)

## Options proposées (si tu hésites)

- Option A — A seulement (IPv4) + TTL 300s

  - Impacts : simple, propagation rapide ; compatible ACME HTTP-01.

- Option B — A + AAAA (IPv4+IPv6) + TTL 300s

  - Impacts : meilleure compatibilité IPv6 ; nécessite que le VPS accepte bien le trafic IPv6.

- Option C — A seulement + TTL 3600s
  - Impacts : plus standard/stable ; propagation plus lente en cas de correction.

Reponse : On prend option A.

## Décision attendue / critères

- A minima : créer `A space-invader` → IPv4 publique du VPS.
- Ajouter `AAAA` uniquement si IPv6 est réellement routée/utile sur le VPS.
- TTL : 300s recommandé tant que la mise au point (DNS + Nginx/Certbot) n’est pas terminée.

## Réponses

- DNS : créer `A space-invader` → `51.38.129.125`
- AAAA : non (pour l’instant)
- TTL : 300s recommandé (phase de mise au point)
