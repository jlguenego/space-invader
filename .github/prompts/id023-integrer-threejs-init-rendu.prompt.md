# id023 (P0) (M) — Intégrer Three.js et initialiser le rendu (scène/caméra/lumières)

## Role

Tu es un développeur TypeScript senior orienté produit, spécialisé en rendu WebGL avec Three.js et intégration propre dans une app React (Vite). Tu écris du code maintenable, modulaire, et testable (Bun).

## Objectif

Implémenter le socle de rendu 3D côté front en intégrant Three.js et en initialisant un rendu minimal (scène/caméra/lumières) avec une boucle `requestAnimationFrame`, sans dépendre des re-renders React.

À la fin, l’écran de jeu doit afficher une scène Three.js stable (même si le gameplay est encore simulé), avec une gestion correcte du redimensionnement et du cleanup.

## Format de sortie

Produire/modifier uniquement ce qui est nécessaire pour la tâche id023.

Livrables attendus (minimum) :

- Un module sous project/client/src/render/ qui expose une API claire d’initialisation/resize/cleanup + démarrage/arrêt de la boucle rAF.
- L’intégration dans l’UI de jeu (GameScreen) via un conteneur DOM (ref) qui reçoit le canvas WebGL.
- Ajout de la dépendance Three.js dans le workspace client.
- Tests Bun pour les parties pures que tu introduis (ex: calcul de tailles, clamp du pixel ratio, mapping resize), sans dépendre d’un contexte WebGL réel.

Fichiers typiquement concernés (à adapter si tu choisis d’autres noms) :

- project/client/package.json
- project/client/src/ui/game-screen.tsx
- project/client/src/render/\* (nouveaux fichiers)
- project/client/src/render/\*.test.ts (si tu ajoutes des helpers purs)

## Contraintes

- Ne pas implémenter le gameplay (c’est id024+). Ici : rendu Three.js minimal + plumbing.
- Respecter Bun 1.3.5, TypeScript, Vite.
- Ne pas coupler la boucle de rendu aux re-renders React.
- Ne pas mettre d’objets Three.js (Scene, Mesh, Renderer, etc.) dans le state React.
- Gérer correctement le cleanup (stop rAF, detach canvas, dispose Three.js si applicable).
- Gérer le resize (au minimum via `window.resize`, idéalement via `ResizeObserver` sur le conteneur).
- Prévoir la réalité de React.StrictMode en dev : effets montés/démontés deux fois. Ton code doit rester stable (pas de double boucle, pas de fuite).
- Conserver le style du repo : fichiers en kebab-case, fonctions camelCase, code simple.
- Écriture inclusive interdite.

## Contexte technique

### Tâche TODO

- id023 (P0) (M) — Intégrer Three.js et initialiser le rendu (scène/caméra/lumières)
  - But : Poser le socle WebGL 3D
  - Livrable : module render/ (init/resize/cleanup + rAF)
  - Acceptation : scène 3D stable sans dépendre des re-renders React
  - Dépendances : id018

### Docs sources (à lire et respecter)

- docs/05-decisions-structurantes.md :
  - D-14 (Three.js obligatoire)
  - D-19 (Bun 1.3.5 + Vite)
  - D-20 (TypeScript)
- docs/07-guidelines-developpement.md :
  - “Boucle de jeu et React” (rAF, pas de state React pour Three)
  - “Nettoyer les ressources Three.js lors de la sortie (dispose)”
- docs/06-architecture-technique.md :
  - Modules proposés (render/)
  - Contraintes navigateur (WebGL)

### Code existant utile

- project/client/src/ui/game-screen.tsx : écran “En jeu” (placeholder) à enrichir pour accueillir un viewport/canvas.
- project/client/src/App.tsx : l’app est rendue sous React.StrictMode, et gère déjà P/M globalement.
- project/client/src/render/ : dossier présent mais vide (gitkeep).

## Étapes proposées (séquence minimale)

1. Ajouter Three.js au workspace client.
   - Dépendance attendue : `three`.
2. Créer un petit “render runtime” dans project/client/src/render/.
   - API recommandée : une fonction `createThreeRenderer(containerEl, options?)` qui retourne un objet avec :
     - `start()` / `stop()` (boucle rAF)
     - `resize(width, height)` ou `resizeToContainer()`
     - `dispose()` (cleanup complet)
   - Interne : `scene`, `camera`, `renderer`, lumières de base.
   - Visuel minimal acceptable : un sol/une grille + un cube (ou équivalent) pour prouver que l’éclairage et la caméra fonctionnent.
3. Intégrer dans l’UI de jeu.
   - Ajouter un conteneur (div) “viewport” avec une `ref`.
   - Dans un `useEffect`, initialiser `createThreeRenderer` une seule fois par montage, démarrer la boucle, et disposer au cleanup.
   - Garder le HUD existant (score/mute) au-dessus ou à côté du viewport (pas besoin d’un design final).
4. Gérer le resize.
   - Option A (simple) : écoute `window.resize` et resize vers `container.getBoundingClientRect()`.
   - Option B (mieux) : `ResizeObserver` sur le conteneur.
   - Dans tous les cas : mettre à jour `camera.aspect` + `camera.updateProjectionMatrix()` + `renderer.setSize(w, h, false)`.
   - Pixel ratio : appliquer `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` (valeur max raisonnable) via helper pur testable.
5. Ajouter des tests Bun sur les helpers “purs”.
   - Exemple : `clampPixelRatio(dpr, max)` ; `computeSizeFromRect(rect)`.
   - Ne pas tenter de tester WebGL/Three directement en environnement test.
6. Validation finale par commandes.

## Cas limites à gérer

- Conteneur DOM absent (ref null) au moment de l’effet : ne pas crasher.
- Taille 0x0 (viewport non visible) : ne pas lancer un render loop gourmand ; au minimum, ne pas produire d’exception.
- StrictMode : éviter de laisser une boucle rAF active après cleanup.
- Navigation UI (playing ↔ paused) : l’intégration doit rester compatible avec l’arrivée prochaine de id024 (GameEngine). Ne pas verrouiller une API impossible à brancher ensuite.

## Critères de validation

Checklist de succès (à respecter strictement) :

- [ ] Three.js est installé dans le workspace client et le build compile.
- [ ] L’écran de jeu affiche un rendu 3D (scène/caméra/lumières) visiblement actif.
- [ ] Le rendu tourne via `requestAnimationFrame` et ne dépend pas des re-renders React.
- [ ] Le resize fonctionne (fenêtre redimensionnée → canvas adapte taille et aspect).
- [ ] Le cleanup fonctionne (pas de fuite évidente, boucle stoppée, canvas retiré, ressources disposées si créées).
- [ ] Les tests ajoutés (helpers purs) passent.
- [ ] `bun test` passe.
- [ ] `bun run typecheck` passe.

## Clôture

- Si et seulement si tous les critères de validation ci-dessus sont satisfaits, cocher la case de id023 dans TODO.md (`- [ ]` → `- [x]`).
- Ne cocher aucune autre tâche.
- Inclure dans ton compte-rendu final : liste des fichiers modifiés/ajoutés + commandes exécutées + éventuelles décisions (courtes) prises.
