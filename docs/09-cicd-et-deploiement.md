# 09 — CI/CD et déploiement

## Rôle du document

Définir une approche simple et reproductible pour construire, tester et livrer le jeu (front React + back Express), en restant cohérent avec la persistance fichiers JSON (mono-instance).

## Sources

- `docs/06-architecture-technique.md`
- `docs/07-guidelines-developpement.md`
- `docs/08-qualite-tests-et-ux.md`
- `clarifications/06-deploiement-et-hebergement.md`
- `clarifications/12-vite.md`

## 1. Objectifs

- Permettre un build fiable (front + back).
- Exécuter les tests de base sur chaque PR.
- Produire un artefact déployable.
- Déployer en mono-instance avec un volume persistant pour les fichiers JSON.

## 2. Hypothèses de déploiement (MVP) — à valider

## 2. Déploiement (décisions actées)

- Hébergement : VPS OVH (Linux).
- Conteneurisation : Docker obligatoire, via Docker Compose.
- Topologie : option A (une seule app Express sert l’API + le front buildé).
- HTTPS : requis ; domaine non requis (au sens « pas besoin d’acheter un domaine dédié au projet »).
- Stratégie HTTPS (décision id001) :
  - Hostname : `space-invader.jlg-consulting.com` (sous-domaine de `jlg-consulting.com`)
  - DNS :
    - Créer un enregistrement **A** : `space-invader` → `51.38.129.125` (TTL recommandé : 300s tant que la mise au point n’est pas terminée)
    - (Optionnel) Créer un enregistrement **AAAA** seulement si IPv6 est réellement utilisée/routée en prod
  - Validation DNS (depuis n’importe quelle machine) :
    - `nslookup space-invader.jlg-consulting.com`
    - `dig +short space-invader.jlg-consulting.com A`
  - Validation réseau (pré-requis ACME HTTP-01) :
    - Depuis une machine extérieure (ton poste, un autre VPS, etc.), vérifier que le VPS répond sur **TCP:80** via le hostname.
    - Exemple : `curl -I http://space-invader.jlg-consulting.com` (toute réponse HTTP est acceptable ; le point clé est que TCP:80 répond)
  - Terminaison TLS : **Nginx** sur le VPS (host)
  - Certificat : **Let’s Encrypt** via **Certbot** (ACME **HTTP-01**)
  - Réseau : ports **80** et **443** ouverts
  - Routage : HTTP→HTTPS, puis proxy vers l’app sur `127.0.0.1:9999`
- Persistance : bind mount Docker pour `server/data/` (volume persistant sur disque).
- Environnements : prod uniquement.
- CI : GitHub Actions.
- Sauvegardes : aucune (MVP).

Source : `clarifications/06-deploiement-et-hebergement.md`.

## 3. Stratégie de build

### 3.1 Artefacts

- Front : build statique via Vite (ex: `client/dist`).
- Back : exécution sous Bun (runtime) ; build TS si utilisé, sinon exécution directe (JS).

### 3.2 Vérifications en CI

- Lint/format (si outillé).
- Tests back-end (priorité : validation API, timezone Europe/Paris, top10 du jour).
- Tests de fonctions pures front (scoring/input) si présents.

## 4. Pipeline CI (proposition)

### 4.1 Déclencheurs

- Sur pull request vers la branche principale.
- Sur push sur la branche principale.

### 4.2 Étapes recommandées

1. Install (cache des dépendances) — privilégier `bun install` (Bun 1.3.5 verrouillée)
2. Lint + typecheck (si TS)
3. Tests back
4. Build front (Vite)
5. Build back
6. Publication d’artefact (zip)

## 5. Déploiement

### 5.1 Option A (simple) : Express sert aussi le front

- Le back sert les fichiers statiques du front buildé.
- Avantage : une seule app à déployer.
- Point d’attention : CORS simplifié.

### 5.2 Option B : front statique + back séparé

- Front hébergé statiquement (CDN/hosting), back sur un serveur Bun (runtime).
- Avantage : mise en cache et perf.
- Point d’attention : CORS à configurer.

## 6. Persistance fichiers (indispensable)

- Le répertoire de données (ex: `server/data/`) doit être :
  - exclu du build (runtime-only),
  - monté sur un disque/volume persistant en prod.

Si Docker est utilisé :

- Monter un volume sur `/app/server/data`.
- Garder 1 réplique (mono-instance).

## 7. Variables de configuration (recommandées)

- `PORT` : port d’écoute.
- `DATA_DIR` : chemin vers le dossier des données (par défaut `server/data`).
- `NODE_ENV` : `development|production`.

Variables recommandées (côté déploiement) :

- `PUBLIC_HOSTNAME` : ex `space-invader.jlg-consulting.com` (utile pour la doc / logs)
- `APP_BIND_HOST` : `127.0.0.1` (recommandé si Nginx est sur le host)
- `APP_PORT` : `9999` (port local exposé par l’app, ciblé par Nginx)
- `LETSENCRYPT_EMAIL` : email utilisé par Certbot/Let’s Encrypt

Note : la timezone “jour Europe/Paris” est une règle produit et doit être codée explicitement, pas via une variable système.

## 8. Sécurité & conformité (minimum)

- Désactiver les détails d’erreurs en prod.
- Limiter la taille des payloads JSON.
- Activer des headers de base (helmet) si pertinent.

## 9. Exploitabilité (minimum)

- Logs structurés côté serveur.
- Redémarrage automatique (PM2/systemd) ou équivalent.
- Sauvegarde périodique des fichiers JSON (simple copie) si nécessaire.
