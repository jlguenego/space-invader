# 07 — Guidelines de développement

## Rôle du document

Définir des conventions et bonnes pratiques de dev pour implémenter le MVP de façon maintenable (front React + Three.js + Howler, back Express, persistance fichiers JSON).

## Sources

- `input/brief.md`
- `docs/05-decisions-structurantes.md`
- `docs/06-architecture-technique.md`
- `clarifications/12-vite.md`

## 1. Principes généraux

- Priorité : MVP jouable et stable (desktop), avant l’optimisation.
- Lisibilité > micro-optimisation.
- Un seul “owner” par responsabilité (UI, engine, rendu, audio, API, storage).
- Les décisions structurantes (Three.js, Howler, JSON mono-instance, Europe/Paris) ne doivent pas être contournées.

## 1.1 Outillage & commandes (standard)

- Outil de référence : **Bun 1.3.5** (version verrouillée) pour la gestion des dépendances, l’exécution de scripts, et le runtime.
- Front-end : outillage **Vite** (dev server + build).
- Lors de la mise en place d’un module/projet, privilégier les commandes d’initialisation/installation :
  - `bun create vite@latest`
  - `bun install <package>`

## 2. Organisation des dossiers (cible)

Proposition (indicative) :

- `client/` : front React
  - `src/ui/` (écrans, overlays)
  - `src/game/` (engine, règles, scoring, input)
  - `src/render/` (Three.js)
  - `src/audio/` (Howler)
  - `src/services/` (HTTP vers API)
  - `src/storage/` (localStorage)
  - `public/assets/` (sons, textures, modèles)
- `server/` : back Express
  - `src/routes/` (endpoints)
  - `src/domain/` (services métier)
  - `src/storage/` (fichiers JSON)
  - `data/` (fichiers persistés — hors `src/`)

## 3. Conventions de code

### 3.1 Nommage

- Fichiers : `kebab-case`.
- Classes : `PascalCase`.
- Fonctions/variables : `camelCase`.
- Constantes : `UPPER_SNAKE_CASE`.

### 3.2 Style & format

- Utiliser un formateur automatique (ex: Prettier) et s’y tenir.
- Limiter la complexité cyclomatique : extraire des fonctions courtes.
- Éviter les effets de bord non maîtrisés (notamment dans la boucle de jeu).

### 3.3 Gestion d’erreurs

- Front : erreurs réseau non bloquantes (rejouer possible), messages clairs.
- Back : réponses JSON cohérentes (`{ ok: false, error: { code, message } }`).
- Ne jamais exposer de stacktrace au client en prod.

## 4. Front-end : boucle de jeu et React

### 4.1 Règles

- La boucle de jeu ne doit pas dépendre de re-renders React.
- Les objets Three.js sont gérés hors de l’état React (éviter de mettre des Mesh dans des states).
- Utiliser `requestAnimationFrame` pour le rendu et un timing cohérent (delta time).
- Les inputs clavier sont centralisés (éviter les listeners dispersés).

### 4.2 Performance

- Favoriser un nombre raisonnable de draw calls.
- Réutiliser les géométries/matériaux quand possible.
- Nettoyer les ressources Three.js lors de la sortie (dispose) si scènes recréées.

### 4.3 Audio (Howler)

- Prévoir un “audio unlock” après interaction utilisateur.
- Centraliser `mute` (toggle M) et persister la préférence.
- Assets livrés : `mp3` + `ogg`.

## 5. Back-end : Express

### 5.1 API

- Routes sous `/api`.
- Validation stricte des entrées :
  - `score` : number, >= 0
  - `pseudo` : optionnel, trim, longueur max recommandée (ex: 24)
- Limiter la taille des payloads (JSON body limit faible).

### 5.2 Persistance JSON (mono-instance)

- Toute écriture est sérialisée via un mutex en mémoire.
- Écriture atomique : `.tmp` puis renommage.
- Le fichier de données doit être créé s’il n’existe pas.

### 5.3 Temps Europe/Paris

- Calculer `dayKeyParis` explicitement en `Europe/Paris`.
- Stocker `createdAt` en UTC.

## 6. Données & compatibilité

- `pseudo` absent → “Anonyme”.
- Éviter les breaking changes : versionner le format JSON (`version`).

## 7. Tests (niveau MVP)

- Back : tests unitaires sur :
  - validation input `POST /api/scores`
  - calcul `dayKeyParis` (inclure cas de changement d’heure)
  - calcul top10 du jour (tri + filtre)
- Front : tests légers possibles sur :
  - mapping input (touches)
  - règles de scoring (fonction pure)

## 8. Git & hygiène de repo

- Ignorer `server/data/` si données locales (ou fournir un fichier d’exemple vide).
- Ne pas committer d’assets lourds non nécessaires.
- Petites PR/commits : une intention = un changement.

## 9. Check-list de revue (rapide)

- Pas de logique de jeu dans React UI.
- Entrées API validées et bornées.
- Mutex + écriture atomique en place pour la persistance.
- Timezone Europe/Paris explicitement gérée.
- Mute fonctionnel (M) et persistant.
