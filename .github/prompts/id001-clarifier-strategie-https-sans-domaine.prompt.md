# Prompt — id001 (P0) (S) — Clarifier la stratégie HTTPS “sans domaine”

## Role

Tu es un·e ingénieur·e DevOps/SRE senior (Linux + Docker Compose + reverse proxy), avec une forte sensibilité sécurité « MVP pragmatique ». Tu sais proposer des options réalistes et trancher quand les contraintes le permettent, tout en demandant des décisions explicites quand c’est nécessaire.

## Objectif

Traiter la TODO **id001 (P0) (S) — Clarifier la stratégie HTTPS “sans domaine”**.

- **But :** rendre le déploiement prod conforme (**HTTPS requis**, **domaine non requis**).
- **Livrable :** décision documentée (reverse-proxy/certificat) + variables/env nécessaires.
- **Acceptation :** une procédure reproductible permet d’obtenir HTTPS sur **VPS OVH** sans dépendre d’un domaine.
- **Dépendances :** aucune.

## Format de sortie

### Livrables attendus (final, après clarification)

1. Une décision documentée expliquant :
   - la topologie retenue (reverse proxy devant l’app Express/Compose),
   - la méthode d’obtention/renouvellement du certificat,
   - la méthode de routage (HTTP→HTTPS),
   - les prérequis réseau (ports),
   - les variables d’environnement / fichiers de config nécessaires.
2. Mise à jour des docs “source de vérité” côté déploiement (au minimum) :
   - `docs/09-cicd-et-deploiement.md` (section “Déploiement (décisions actées)” / HTTPS)
   - `docs/10-exploitation-et-maintenance.md` (section “Sécurité (minimum)” / exploitation HTTPS)

### Clarifications gate (obligatoire)

Si, après lecture des docs sources, tu ne peux pas conclure **sans choix arbitraire** (ce qui est le cas attendu ici), tu dois **d’abord** créer :

- `/clarifications/07-https-sans-domaine.md`

Puis **t’arrêter** et demander explicitement à l’utilisateur de répondre dans ce document. Ne fais aucune autre modification (pas de changements dans `docs/` tant que les réponses ne sont pas fournies).

## Contraintes

- Ne réalise **pas** de mise en production ni de commandes sur un VPS réel (tu n’as pas accès).
- Ne produis pas de solution “au hasard” : si une décision est nécessaire (CA publique vs auto-signé, nom public, ports), déclenche le **clarifications gate**.
- Rester cohérent avec les décisions actées :
  - VPS OVH (Linux)
  - Docker obligatoire, Docker Compose
  - topologie A : **1 service** (Express sert UI + API)
  - persistance via bind mount `server/data/`
  - prod uniquement
- La stratégie doit être compatible avec la TODO future **id043** (terminaison HTTPS via reverse proxy).
- Éviter d’introduire de nouvelles dépendances non justifiées (ex: services externes) si elles contredisent “domaine non requis”.

## Contexte technique (docs sources)

Lis et utilise comme sources de vérité :

- `docs/09-cicd-et-deploiement.md` → “Déploiement (décisions actées)”, “HTTPS : requis ; domaine non requis.”
- `docs/10-exploitation-et-maintenance.md` → “Sécurité (minimum)” + exploitation (logs, redémarrage, ports)
- `clarifications/06-deploiement-et-hebergement.md` → décisions actées (VPS OVH, Compose, HTTPS requis)

Note : il n’y a pas de `AGENTS.md` présent dans le dépôt (ne pas bloquer dessus).

## Analyse des dépendances / impacts

- **Bloque** directement : `id043` (mise en place terminaison HTTPS).
- **Impacte** : procédures de déploiement (id045) et runbook (id046) car le reverse proxy/certificats doivent être opérables.

## Étapes proposées (sans exécuter la TODO “dans le code”)

1. Synthétiser les contraintes et ce qui est déjà acté (à partir des docs sources).
2. Constater ce qui manque pour décider non-arbitrairement (ex: “sans domaine” signifie quoi exactement ? certificat public requis ? ports ouverts ?).
3. Déclencher le **clarifications gate** : créer `clarifications/07-https-sans-domaine.md` avec le template ci-dessous.
4. Stopper et demander à l’utilisateur de répondre.
5. Une fois les réponses apportées :
   - choisir une stratégie cohérente,
   - documenter précisément la procédure (pré-requis, fichiers/config, variables, ports, renouvellement),
   - mettre à jour `docs/09-*` et `docs/10-*`.

## Clarifications gate — Contenu du fichier à créer

Crée le fichier `/clarifications/07-https-sans-domaine.md` avec le contenu suivant (adapter seulement les formulations si nécessaire, pas la structure) :

---

# Clarification 07 — HTTPS sans domaine

- Date : AAAA-MM-JJ
- Contexte : TODO **id001 (P0) (S) — Clarifier la stratégie HTTPS “sans domaine”**
- Docs sources :
  - `docs/09-cicd-et-deploiement.md` (HTTPS requis ; domaine non requis)
  - `docs/10-exploitation-et-maintenance.md` (Sécurité minimum)
  - `clarifications/06-deploiement-et-hebergement.md` (VPS OVH + Compose)
- Statut : À REMPLIR

## Contexte

Le MVP doit être déployable sur un VPS OVH (Docker Compose, 1 service Express). HTTPS est requis en production, mais “domaine non requis”. Il faut décider une stratégie de terminaison HTTPS (reverse proxy + certificats) reproductible.

## Questions

- Q1 — Que signifie exactement “sans domaine” pour toi ?

  - [ ] Pas de domaine **acheté/administré** par nous, mais un **hostname fournisseur** (ex: FQDN OVH) est acceptable
  - [ ] Aucun FQDN : accès uniquement via **adresse IP** (ex: `https://203.0.113.10`)
  - [ ] Autre : \_\_\_\_
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q2 — Expérience utilisateur requise : le navigateur doit-il afficher un HTTPS “valide” (sans alerte) ?

  - [ ] Oui : certificat signé par une **AC reconnue publiquement** (type Let’s Encrypt) obligatoire
  - [ ] Non : un certificat auto-signé/privé est acceptable (avec alerte navigateur)
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q3 — Ports réseau disponibles sur le VPS (et au niveau firewall OVH) ?

  - [ ] 80/tcp et 443/tcp sont ouverts et peuvent être utilisés
  - [ ] 443/tcp uniquement
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q4 — Préférence de reverse proxy pour la terminaison TLS ?

  - [ ] Caddy (ACME automatique, config simple)
  - [ ] Nginx + outil ACME (certbot ou équivalent)
  - [ ] Traefik (intégration Docker)
  - [ ] Autre : \_\_\_\_
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q5 — Si une AC publique est requise : quelle stratégie d’obtention de certificat est acceptable ?

  - [ ] ACME HTTP-01 sur un hostname qui résout vers le VPS (pas de contrôle DNS requis)
  - [ ] ACME DNS-01 (nécessite contrôle DNS d’un domaine)
  - [ ] Utiliser un service de DNS dynamique / sous-domaine gratuit (ex: DuckDNS) (implique un domaine “gratuit”)
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q6 — Redirection HTTP → HTTPS : souhaitée/obligatoire ?

  - [ ] Oui, HTTP redirige systématiquement vers HTTPS
  - [ ] Non, HTTP peut rester accessible
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q7 — HSTS (Strict-Transport-Security) : souhaites-tu l’activer ?
  - [ ] Oui
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

(À compléter par l’utilisateur)

---

## Critères de validation

- [ ] Le fichier `clarifications/07-https-sans-domaine.md` existe et contient un QCM répondable.
- [ ] Le prompt demande explicitement à l’utilisateur de compléter le fichier et **s’arrête** ensuite.
- [ ] Après réponses (dans une exécution ultérieure), la stratégie retenue est documentée et met à jour `docs/09-*` et `docs/10-*` avec une procédure reproductible.

## Checklist (pour l’exécution après réponses)

- Vérifier que la stratégie retenue respecte : VPS OVH + Docker Compose + topologie A.
- Décrire précisément : mapping des ports 80/443, service reverse proxy, renouvellement cert, redirection HTTP→HTTPS.
- Lister les variables d’environnement / fichiers de config (ex: email ACME, hostname public, chemins de certificats, ports).
- Noter les cas limites : port 80 indisponible, IPv6, firewall, redémarrage container, renouvellement cert.
