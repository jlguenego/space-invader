# Audit critique de la documentation (produit/UX, architecture, sécurité, DevOps/SRE)

Périmètre audité : dossier `/docs` (source principale) + `/clarifications` (contexte/décisions).

## 1) Résumé exécutif (10–15 lignes)

**Forces (3)**

- Documentation structurée et traçable : progression Contexte → Personas → Parcours → Stories → Spec → Décisions → Arch → Qualité → CI/CD → Exploitation (ex : `/docs/00..10`).
- Décisions structurantes explicites et cohérentes avec les clarifications : desktop-only, clavier-only, pseudo optionnel/anonyme, top10 du jour Europe/Paris, Three.js + Howler, persistance JSON mono-instance (`/docs/05-decisions-structurantes.md`, `/clarifications/01..06`).
- Architecture MVP pragmatique : séparation “boucle de jeu” vs UI React, API minimale (2 endpoints), stratégie d’écriture atomique + mutex, gestion explicite du fuseau Europe/Paris (`/docs/06-architecture-technique.md`).

**Risques majeurs (3)**

- Exploitabilité & données : aucune sauvegarde actée + persistance en fichier unique croissant → risque fort de perte/corruption et de saturation disque en prod (`/clarifications/06-deploiement-et-hebergement.md`, `/docs/10-exploitation-et-maintenance.md`).
- Sécurité / abus : pas de modèle de menace ni de contrôles anti-abus concrets (rate limiting, quotas, protection contre spam de scores) alors que l’anti-triche est assumée “simple” (`/docs/06-architecture-technique.md`, `/docs/08-qualite-tests-et-ux.md`).
- HTTPS “sans domaine” : contrainte HTTPS requise mais domaine non requis, sans stratégie documentée de terminaison TLS/certificats (risque de blocage déploiement) (`/clarifications/06-deploiement-et-hebergement.md`, `/docs/09-cicd-et-deploiement.md`).

**Recommandations prioritaires (5)**

1. Documenter et implémenter un socle anti-abus : `express-rate-limit`, limites de payload, quotas basiques par IP, journalisation des refus (P0, effort S/M) (`/docs/06`, `/docs/08`).
2. Ajouter une stratégie minimale de sauvegarde/restauration (même “best effort”) + procédure de recovery JSON (P0, effort S) (`/docs/10`, `/clarifications/06`).
3. Trancher et documenter la terminaison HTTPS (reverse proxy Caddy/Nginx/Traefik, stratégie certificats) malgré “domaine non requis” (P0, effort M) (`/docs/09`, `/docs/10`).
4. Mettre à jour les docs devenues obsolètes (questions ouvertes résolues, décisions “à prendre” déjà prises) pour éviter les ambiguïtés (P1, effort S) (`/docs/01`, `/docs/05`).
5. Compléter l’observabilité MVP (SLI simples + alerting minimal + healthcheck) pour diagnostiquer rapidement en prod (P1, effort M) (`/docs/10`, `/docs/08`).

---

## 2) Tableau des constats

| Axe          | Constat                                                                                                                       |                                                         Impact | Probabilité | Sévérité | Références (fichiers)                                                                         | Recommandation                                                               | Effort | Priorité |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------: | ----------: | -------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------ | -------- |
| Exploitation | Sauvegardes explicitement absentes en prod                                                                                    |  Perte définitive des scores en cas d’erreur disque/corruption |      Élevée | P0       | `/clarifications/06-deploiement-et-hebergement.md`, `/docs/10-exploitation-et-maintenance.md` | Ajouter un snapshot quotidien (tar/rsync) + runbook restauration             | S      | Haute    |
| Exploitation | Fichier unique `scores.json` conserve tout l’historique                                                                       |         Grossit sans limite → latence/risque OOM, disque plein |      Élevée | P0       | `/docs/06-architecture-technique.md`, `/docs/10-exploitation-et-maintenance.md`               | Partitionner par période (mois) ou compacter/archiver, avec seuils           | M      | Haute    |
| Sécurité     | Pas de rate limiting / quotas documentés sur `POST /api/scores`                                                               |                   Spam/DoS, disque plein, pollution classement |      Élevée | P0       | `/docs/06-architecture-technique.md`, `/docs/08-qualite-tests-et-ux.md`                       | Mettre `express-rate-limit` + body limit + validation stricte + logs         | S/M    | Haute    |
| Sécurité     | Absence de modèle de menace (auth inexistante assumée)                                                                        | Surfaces d’attaque non couvertes (abuse, XSS via pseudo, scan) |     Moyenne | P1       | `/docs/00-contexte-et-vision.md`, `/docs/06-architecture-technique.md`                        | Ajouter une section “Threat model MVP” + contrôles associés                  | S      | Haute    |
| DevOps/SRE   | HTTPS requis mais “domaine non requis” sans stratégie TLS                                                                     |                   Blocage déploiement / UX navigateur dégradée |      Élevée | P0       | `/clarifications/06-deploiement-et-hebergement.md`, `/docs/09-cicd-et-deploiement.md`         | Décider reverse proxy + cert (Caddy/LE) + clarifier besoin domaine           | M      | Haute    |
| DevOps/SRE   | Pas de healthcheck/endpoint de santé (décision : pas de healthcheck dédié)                                                    |        Monitoring/rollout plus difficiles, diagnostics tardifs |     Moyenne | P1       | `/docs/05-decisions-structurantes.md`, `/docs/10-exploitation-et-maintenance.md`              | Ajouter `GET /healthz` simple (pas “admin”) + Compose healthcheck            | S      | Moyenne  |
| DevOps/SRE   | Observabilité limitée à logs ; pas de métriques/alerting/SLO                                                                  |                         Temps de résolution incident plus long |     Moyenne | P1       | `/docs/08-qualite-tests-et-ux.md`, `/docs/10-exploitation-et-maintenance.md`                  | Définir 3 SLI (taux 5xx, latence, erreurs write) + alerting basique          | M      | Moyenne  |
| Architecture | Persistance : mutex en mémoire = OK en mono-instance, mais pas de stratégie d’initialisation/repair JSON                      |                   Corruption JSON peut bloquer tout le service |     Moyenne | P1       | `/docs/06-architecture-technique.md`, `/docs/10-exploitation-et-maintenance.md`               | Définir comportement en cas de JSON invalide (quarantaine + nouveau fichier) | S/M    | Haute    |
| Sécurité     | Pseudo affiché côté UI → risque XSS si rendu non échappé                                                                      |                 Exécution script dans navigateur (si bug d’UI) |     Moyenne | P1       | `/docs/04-specification-fonctionnelle.md`, `/docs/06-architecture-technique.md`               | Documenter “escape output” + limiter charset/normaliser pseudo               | S      | Haute    |
| UX           | Anti-triche “simple” actée, mais UX risque de sur-vendre le classement                                                        |              Déception / perte de confiance si triche évidente |     Moyenne | P2       | `/docs/02-parcours-et-experience.md`, `/docs/00-contexte-et-vision.md`                        | Ajouter microcopy : “classement fun / non e-sport”, limiter friction         | S      | Moyenne  |
| UX/a11y      | A11y minimal mentionné, mais pas de critères vérifiables (contraste, focus, réductions)                                       |                      Risque de régression et d’inaccessibilité |     Moyenne | P2       | `/docs/08-qualite-tests-et-ux.md`                                                             | Ajouter checklist a11y (tab order, focus trap pause, contrast)               | S      | Moyenne  |
| Architecture | Choix build/outillage front/back non précisés (Vite/CRA, TS/non TS)                                                           |                      Divergences d’implémentation, friction CI |     Moyenne | P2       | `/docs/07-guidelines-developpement.md`, `/docs/09-cicd-et-deploiement.md`                     | Décider et documenter toolchain (ex: Vite + TS) + scripts standard           | M      | Moyenne  |
| DevOps/SRE   | “Prod uniquement” : pas de staging, pas de stratégie rollback détaillée                                                       |                    Déploiements risqués, retour arrière manuel |     Moyenne | P2       | `/clarifications/06-deploiement-et-hebergement.md`, `/docs/09-cicd-et-deploiement.md`         | Documenter rollback Compose (tag image N-1, backup data)                     | S      | Moyenne  |
| Sécurité     | Politique CORS/headers évoquée mais non cadrée (helmet, CSP)                                                                  |                           Mauvaise posture sécurité par défaut |      Faible | P3       | `/docs/06-architecture-technique.md`, `/docs/09-cicd-et-deploiement.md`                       | Ajouter baseline headers (helmet + CSP simple) + config CORS dev             | S      | Basse    |
| UX           | Gestion des cas limites : collisions, pause, audio unlock, erreurs réseau bien mentionnés mais sans maquettes/états détaillés |                     Risque d’UI incohérente à l’implémentation |     Moyenne | P2       | `/docs/02-parcours-et-experience.md`, `/docs/04-specification-fonctionnelle.md`               | Ajouter un “state model” UI (écrans/overlays) + messages standardisés        | S/M    | Moyenne  |
| Docs         | Sections obsolètes (“questions ouvertes” résolues)                                                                            |                          Ambiguïté pour nouveaux contributeurs |      Élevée | P1       | `/docs/01-utilisateurs-personas.md`, `/docs/05-decisions-structurantes.md`                    | Mettre à jour/retirer ces sections ou les marquer “résolues”                 | S      | Haute    |

---

## 3) Analyse détaillée par axe

### 3.1 Ergonomie & UX

**Points solides**

- Parcours principaux clairs (première visite, boucle de jeu, fin de partie, classement) et cohérents avec les constraints desktop/clavier (`/docs/02-parcours-et-experience.md`, `/docs/03-user-stories-et-flux.md`).
- États critiques identifiés : init WebGL, WebGL non supporté, échec réseau non bloquant (`/docs/04-specification-fonctionnelle.md`).
- UX “confort” bien cadrée pour MVP : pause, mute, presets difficulté/sensibilité (`/docs/04`, `/clarifications/03`, `/clarifications/04`).

**Problèmes / zones floues**

- Pas de modèle d’état UI formalisé : qui s’affiche quand (overlay pause vs écran séparé), quelles transitions, quelles priorités (ex: erreur réseau pendant fin de partie). Ça augmente le risque d’implémentations divergentes.
- Le classement “fun” est documenté comme anti-triche simple, mais la UX ne dit pas comment éviter d’induire une robustesse implicite (absence de microcopy/expectations).
- A11y : intention “socle minimal” OK, mais critères et tests concrets manquent (focus trap, tab order, contrast mesurable, ARIA minimal).

**Manques**

- Checklists UX/a11y “prêtes à tester” (avant démo) couvrant focus, navigation clavier complète des menus, état pause et modales.
- Gestion de performance perçue côté client (indicateur de chargement d’assets, progressive loading, fallback textures).

**Recommandations (étapes concrètes)**

1. Ajouter un “UI State Model” (1 page) : états/overlays, transitions, priorités, messages d’erreur standardisés (`/docs/04` ou `/docs/02`).
2. Ajouter microcopy sur le leaderboard : “classement du jour, non certifié anti-triche” + limiter la promesse compétitive (`/docs/02`, `/docs/04`).
3. Compléter `/docs/08` avec une checklist a11y testable : focus visible, tab order, raccourcis, contrast, pause accessible.

### 3.2 Sécurité

**Points solides**

- Le niveau de sécurité attendu est explicitement MVP (anti-triche simple accepté, pas de comptes) : bonne transparence produit (`/docs/00-contexte-et-vision.md`, `/docs/05-decisions-structurantes.md`).
- Validation d’entrée et limites de payload mentionnées (`/docs/06-architecture-technique.md`, `/docs/07-guidelines-developpement.md`).

**Problèmes / zones floues**

- Absence de “modèle de menace MVP” : pas de liste des actifs, attaquants, scénarios d’abus (spam de scores, remplissage disque, injection via pseudo, DoS via endpoints).
- Manque de contrôles anti-abus concrets : rate limiting, quotas, protections contre floods, journaux exploitables pour triage.
- Risque XSS implicite via pseudo si l’UI rend du contenu non échappé (React échappe par défaut, mais ce n’est pas une garantie si `dangerouslySetInnerHTML` est utilisé plus tard).

**Manques**

- Politique de validation “pseudo” (charset, trimming, normalisation unicode, longueur max) et règles de rejet.
- Politique de logs sécurité (échantillonnage, corrélation request-id, IP, user-agent).

**Recommandations (étapes concrètes)**

1. Ajouter une section Threat Model MVP (1–2 pages) dans `/docs/06` ou `/docs/10` : actifs (disque, données scores), surfaces (POST/GET), scénarios d’abus, contrôles.
2. Implémenter et documenter : `express-rate-limit`, `express.json({ limit })`, validation stricte (Zod/Joi/valibot), et logs structurés des rejets.
3. Définir une politique pseudo : longueur max, whitelist caractères (ou “printable”), suppression des contrôles invisibles, fallback “Anonyme”.

### 3.3 Exploitation (DevOps/SRE)

**Points solides**

- Déploiement MVP clair et réaliste : VPS OVH, Docker Compose, mono-instance, bind mount sur `server/data/`, CI GitHub Actions (`/clarifications/06-deploiement-et-hebergement.md`, `/docs/09-cicd-et-deploiement.md`).
- Runbook léger (site down, erreurs write, classement vide) utile pour MVP (`/docs/10-exploitation-et-maintenance.md`).

**Problèmes / zones floues**

- HTTPS requis mais stratégie de terminaison TLS non définie (reverse proxy ? gestion des certificats ?). Le “domaine non requis” est potentiellement incompatible avec un HTTPS “propre” sur navigateur.
- Pas de sauvegarde → risque majeur, et la doc n’indique pas de procédure de restauration.
- Observabilité “logs only” : pas de SLI/SLO, pas d’alerting, pas de healthcheck (même minimal).

**Manques**

- Stratégie rollback (image N-1), migrations de format JSON (versionning déjà mentionné mais pas de procédure), et “disaster recovery” minimal.
- Contrôles opérationnels contre la saturation disque (seuils, rotation, quotas).

**Recommandations (étapes concrètes)**

1. Décider et documenter la terminaison TLS : Caddy (recommandé simplicité) ou Nginx + certbot ; clarifier si un domaine devient “recommandé” même s’il n’est pas “requis”.
2. Ajouter une sauvegarde quotidienne du bind mount + script de restauration + test de restauration (même manuel).
3. Ajouter `GET /healthz` + Compose healthcheck + 3 alertes simples (site down, erreurs 5xx, erreurs write).

### 3.4 Architecture

**Points solides**

- Découpage front clair (UI vs engine vs render vs audio vs services vs storage) adapté à un jeu temps réel (`/docs/06-architecture-technique.md`).
- Persistance fichiers : approche saine pour MVP (mutex + écriture atomique, versionning du JSON) (`/docs/06`, `/docs/07`).
- Gestion Europe/Paris explicite (clé `dayKeyParis`, `createdAt` en UTC) : bon compromis robustesse/lecture (`/docs/06`).

**Problèmes / zones floues**

- Stratégie de lecture/tri en mémoire sur historique complet : acceptable MVP, mais non bornée (risque performance)
- Gestion des corruptions JSON : runbook mentionne “réparer/restaurer” mais pas de stratégie applicative (quarantaine, fallback, validation de schema au boot).
- Tooling non tranché (TS oui/non, Vite/CRA, structure exacte des scripts, lint) alors que CI l’évoque.

**Manques**

- Contrat de données (schema) et compatibilité (comment gérer `version` → migrations).
- Stratégie de “partitionnement” (scores-YYYY-MM.json) si croissance.

**Recommandations (étapes concrètes)**

1. Définir un schema de score (ex: JSON schema/Zod) utilisé au runtime + tests.
2. Ajouter une stratégie de partitionnement par mois dès qu’un seuil est dépassé (fichier > X MB ou > N entrées).
3. Fixer la toolchain et la refléter dans CI (scripts standard `lint`, `test`, `build`).

---

## 4) Incohérences & décisions à trancher

1. **Docs obsolètes : “questions ouvertes” déjà closes**

- Où : `/docs/01-utilisateurs-personas.md` (section “Questions ouvertes” mentionne mapping et réglages comme non définis).
- Pourquoi c’est problématique : crée de la dette de compréhension ; un lecteur peut croire que le mapping/réglages ne sont pas actés.
- Arbitrage nécessaire : décider si le doc garde une section “historique” ou si on supprime/annote “résolu”.
- Correction proposée : mettre à jour la section en “Questions closes (résolues)” et référencer `/clarifications/03` et `/clarifications/04`.

2. **Décisions “à prendre” alors qu’elles sont prises**

- Où : `/docs/05-decisions-structurantes.md` (section “Décisions à prendre… avant d’écrire `/docs/06`”).
- Pourquoi c’est problématique : incohérent avec le fait que `/docs/06` et `/clarifications/06` existent ; peut induire des divergences.
- Arbitrage nécessaire : soit (a) considérer que la section est un reliquat, soit (b) la transformer en “Décisions prises (références)”.
- Correction proposée : remplacer par un lien vers `/clarifications/06-deploiement-et-hebergement.md` et noter “intégré dans `/docs/09` & `/docs/10`”.

3. **HTTPS requis mais domaine non requis : stratégie TLS manquante**

- Où : `/clarifications/06-deploiement-et-hebergement.md`, `/docs/09-cicd-et-deploiement.md`, `/docs/10-exploitation-et-maintenance.md`.
- Pourquoi c’est problématique : sur internet, un HTTPS “propre” nécessite généralement un certificat reconnu et souvent un nom de domaine ; sinon on risque un blocage produit/déploiement.
- Arbitrage nécessaire :
  - Option A : accepter un domaine (même gratuit) pour Let’s Encrypt.
  - Option B : accepter un HTTPS “technique” (cert auto-signé) avec UX dégradée.
- Correction proposée : documenter l’option retenue + la stack (Caddy recommandé) et la procédure certificats.

4. **Sauvegardes “aucunes” (décision) vs “si nécessaire” (reco) sans seuil**

- Où : `/docs/09-cicd-et-deploiement.md` (mentions de sauvegarde “si nécessaire”) vs décision “aucune (MVP)”.
- Pourquoi c’est problématique : ambiguïté sur l’exigence ; en pratique, sans sauvegarde, le runbook de corruption est incomplet.
- Arbitrage nécessaire : clarifier si “aucune” veut dire “non automatique” mais “runbook manuel présent”.
- Correction proposée : conserver “aucune automatique”, mais ajouter une procédure de snapshot manuel/à la demande + test de restauration.

---

## 5) Plan d’amélioration

### Quick wins (≤ 1 jour)

- Mettre à jour la doc obsolète : `/docs/01` (questions ouvertes) et `/docs/05` (décisions à prendre) pour refléter les clarifications.
- Ajouter une section “Threat model MVP” (brouillon) : scénarios d’abus + contrôles minimums.
- Ajouter une checklist a11y testable dans `/docs/08` (focus, tab order, pause accessible, contrast).
- Ajouter un runbook “backup manuel + restore” (même simple) dans `/docs/10`.

### Court terme (1–2 semaines)

- Implémenter anti-abus : rate limiting, quotas, logs structurés, validation stricte des inputs.
- Décider et documenter HTTPS : reverse proxy + certificats + procédure de renouvellement.
- Ajouter `GET /healthz` + Compose healthcheck + monitoring “site up”.
- Définir schema de données (score) + validation au boot + gestion de JSON invalide (quarantaine).

### Moyen terme (1–2 mois)

- Gérer la croissance des données : partitionnement mensuel, compaction/archivage, seuils d’alerte disque.
- Étendre observabilité : métriques (latence, erreurs, taille fichier), alerting, SLO “MVP” (disponibilité/erreurs).
- Durcir la posture sécurité web (headers CSP, dépendances, scanning basique en CI).
