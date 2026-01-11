# 06 — Architecture technique

## Rôle du document

Décrire l’architecture cible (composants, modules, flux, données, API) pour implémenter le MVP sans ambigüité, en respectant les décisions structurantes.

## Sources

- `input/brief.md`
- `docs/04-specification-fonctionnelle.md`
- `docs/05-decisions-structurantes.md`
- `clarifications/05-choix-techniques-stack-et-stockage.md`
- `clarifications/10-parametres-difficulte.md`
- `clarifications/12-vite.md`

## 1. Vue d’ensemble

### 1.1 Composants

- Navigateur (front React)
  - Langage : TypeScript (`.tsx`)
  - Outillage : Vite (dev server + build)
  - Rendu 3D : Three.js (WebGL)
  - Audio : Howler.js (assets `mp3` + `ogg`)
  - Stockage local : pseudo + réglages (localStorage)
- Serveur (back Express)
  - Langage : TypeScript (`.ts`)
  - Runtime : Bun (Bun 1.3.5 verrouillée)
  - API REST : enregistrement score + lecture top10 du jour
  - Persistance : fichiers JSON, mono-instance, historique complet
  - Référence “jour” : Europe/Paris

### 1.2 Schéma logique

```
[Browser: React + Three.js + Howler]
   |  POST /api/scores
   |  GET  /api/leaderboard/day
   v
[Express API]
   v
[File Storage: JSON (historique)]
```

## 2. Front-end (React)

Outillage : le front est outillé avec **Vite** (projet React basé sur Vite). Dépendances et scripts sont gérés via **Bun 1.3.5 (verrouillée)**. En production, le serveur tourne sur **Bun (runtime)** (cf. `clarifications/12-vite.md`).

Langage : le code du front est écrit en **TypeScript** (`.tsx`).

### 2.1 Principes

- Séparer la “boucle de jeu” (temps réel) de l’UI React (menus, overlays, settings).
- Rendre via Three.js avec une boucle `requestAnimationFrame` pilotée par un module “GameEngine”.
- Garder le calcul du score côté client (anti-triche simple accepté) et l’envoyer au serveur en fin de partie.

### 2.2 Modules proposés

- `ui/` : écrans et composants
  - Accueil, En jeu (HUD), Pause, Fin de partie, Classement
- `game/` : logique du jeu
  - `GameEngine` : boucle, timing, state machine (running/paused/gameover)
  - `InputManager` : clavier (flèches/WASD, espace, P, M)
  - `Rules` : difficulté, sensibilité, bonus, multiplicateurs (paramètres difficulté MVP : `clarifications/10-parametres-difficulte.md`)
  - `Scoring` : calcul score final
- `render/` : rendu Three.js
  - création scène/caméra/lumières, entités visuelles, effets
- `audio/` : Howler (mute, volumes, play SFX)
- `services/` : client API (`POST score`, `GET top10`)
- `storage/` : localStorage (pseudo, difficulté, sensibilité, mute)

### 2.3 Gestion des états

- UI React : état “shell” (écran actif, settings, chargement, erreurs réseau).
- Jeu : état “temps réel” dans `GameEngine` (positions, entités, tirs, collisions, score en cours).
- Pont UI↔jeu : callbacks/events (ex: `onGameOver(finalScore)`), sans faire dépendre la boucle de jeu du rendu React.

### 2.4 Contraintes navigateur importantes

- Audio : prévoir que certains navigateurs bloquent l’audio avant une interaction utilisateur.
- WebGL : afficher un état explicite en cas d’échec (non support / init fail).

## 3. Back-end (Express)

### 3.1 Principes

- API minimaliste (2 endpoints) et robuste : validation d’entrée + limites (taille payload, longueur pseudo).
- Persistance en fichiers JSON avec écriture atomique et sérialisation des écritures (mono-instance).
- Calcul du “jour” en Europe/Paris côté serveur (indépendant du fuseau système).

Langage/exécution : le code du serveur est écrit en **TypeScript** (`.ts`) et exécuté via **Bun** (pas de compilation TS→JS requise pour exécuter).

### 3.2 Structure proposée

- `server/app.ts` : création Express, middlewares
- `server/routes/`
  - `scores.ts` : `POST /api/scores`
  - `leaderboard.ts` : `GET /api/leaderboard/day`
- `server/domain/`
  - `leaderboardService.ts` : calcul top 10 du jour
  - `timeService.ts` : conversions Europe/Paris → `dayKey`
- `server/storage/`
  - `scoreRepository.ts` : lecture/écriture JSON + mutex

## 4. Données & persistance fichiers

### 4.1 Format de fichier (MVP)

- Dossier : `data/`
- Fichier : `data/scores.json`
- Contenu : un objet JSON avec version + tableau des scores.

Exemple de structure :

```json
{
  "version": 1,
  "scores": [
    {
      "id": "...",
      "createdAt": "2026-01-10T12:34:56.000Z",
      "dayKeyParis": "2026-01-10",
      "pseudo": "Anonyme",
      "score": 12345
    }
  ]
}
```

Notes :

- `createdAt` est en UTC (ISO 8601) pour rester stable.
- `dayKeyParis` est la clé “du jour” calculée en Europe/Paris (format `YYYY-MM-DD`).
- Conserver tout l’historique implique que le fichier grossira ; acceptable MVP, à surveiller.

### 4.2 Stratégie d’écriture (anti-corruption)

- Charger le fichier en mémoire au démarrage (si absent, initialiser structure vide).
- Sur `POST /api/scores` :
  - acquérir un mutex en mémoire,
  - ajouter l’entrée,
  - écrire dans un fichier temporaire `scores.json.tmp`,
  - renommer atomiquement vers `scores.json`,
  - libérer le mutex.

## 5. Gestion du fuseau Europe/Paris

### 5.1 Règle

- Le “jour” du classement est basé sur Europe/Paris et reset à minuit Europe/Paris.
- Le serveur calcule `dayKeyParis` pour chaque score à l’enregistrement.

### 5.2 Implémentation recommandée

- Utiliser une lib de timezone robuste (ex: Luxon) pour produire `dayKeyParis`.
- Ne pas dépendre du TZ système : utiliser explicitement `Europe/Paris`.

## 6. Contrat API (v0)

Base : `/api`

### 6.1 `POST /api/scores`

- But : enregistrer un score (anti-triche simple : accepté tel quel).
- Body JSON :
  - `score` (number, requis, >= 0)
  - `pseudo` (string, optionnel ; si vide/null → “Anonyme”)

Réponse `201` :

```json
{
  "ok": true,
  "saved": {
    "id": "...",
    "createdAt": "...",
    "dayKeyParis": "2026-01-10",
    "pseudo": "Anonyme",
    "score": 12345
  }
}
```

Erreurs :

- `400` : payload invalide (score manquant/non numérique, pseudo trop long, etc.).
- `500` : erreur d’écriture fichier.

### 6.2 `GET /api/leaderboard/day`

- But : récupérer le top 10 du jour (Europe/Paris), global.
- Réponse `200` :

```json
{
  "timezone": "Europe/Paris",
  "dayKeyParis": "2026-01-10",
  "entries": [{ "rank": 1, "pseudo": "Anonyme", "score": 99999 }]
}
```

## 7. Flux principaux

### 7.1 Enregistrement score (fin de partie)

1. Le jeu calcule le score final côté client.
2. Le front appelle `POST /api/scores`.
3. Le back calcule `dayKeyParis`, persist l’entrée, répond `201`.
4. Le front affiche confirmation + propose le top 10 du jour.

### 7.2 Consultation classement

1. Le front appelle `GET /api/leaderboard/day`.
2. Le back filtre l’historique sur `dayKeyParis` et renvoie les 10 meilleurs.

## 8. Qualité, performance, sécurité (MVP)

- Validation d’entrée : score numérique, bornes ; pseudo longueur max (ex: 20–24) + trimming.
- Limites : taille payload faible, réponses compactes.
- CORS : nécessaire uniquement si front/back servis sur origines différentes en dev.
- Anti-triche : assumée simple ; pas de signature/validation serveur.

Note CI/outillage : le pipeline doit inclure un step “lint + typecheck” (ex: `tsc --noEmit`) et les configs TypeScript nécessaires ; ces éléments sont outillés dans le monorepo (cf. `docs/09-cicd-et-deploiement.md`).

## 9. Risques & mitigations

- Croissance du fichier JSON : prévoir rotation (ex: un fichier par mois) si nécessaire.
- Timezone : toujours calculer via `Europe/Paris` (lib dédiée), tests unitaires sur changement d’heure.
- WebGL : fallback UX si non supporté ; tester sur plusieurs navigateurs desktop.
- Audio : gérer le “unlock” audio après interaction utilisateur.
