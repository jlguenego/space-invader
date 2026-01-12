# id027 (P0) (S) — Implémenter la sensibilité (0.8x / 1.0x / 1.2x)

## Role

Tu es un développeur TypeScript senior (React + Vite + Three.js), orienté code propre et tests (Bun). Tu connais les contraintes d’une boucle de jeu (rAF, dt), et tu sais intégrer des réglages de gameplay sans coupler la simulation aux re-renders React.

## Objectif

Implémenter le réglage **Sensibilité** (faible/moyen/fort) en appliquant un multiplicateur **sur la vitesse de déplacement du joueur**, conformément au MVP :

- faible = **0.8x**
- moyen = **1.0x**
- fort = **1.2x**

La sensibilité doit être **observable en jeu** (le vaisseau se déplace plus lentement/plus vite) et doit utiliser la préférence déjà persistée côté client.

## Format de sortie

Modifier uniquement le front (sauf découverte d’un bug bloquant).

Livrables attendus :

- Code : implémentation de l’application du multiplicateur à la vitesse du joueur.
- Tests Bun : au moins 1 test unitaire prouvant que la sensibilité modifie effectivement la vitesse de déplacement.
- Mise à jour de TODO : cocher uniquement la case **id027** à la fin, si et seulement si tous les critères de validation sont satisfaits.

## Contraintes

- Ne pas inventer de nouvelles règles : valeurs fixées à **0.8 / 1.0 / 1.2**.
- TypeScript partout, style existant (pas de refactor massif).
- Ne pas coupler la simulation (GameEngine / WorldSim) aux re-renders React.
- Utiliser Bun pour les tests (`bun test`).
- Ne pas cocher d’autres tâches que **id027**.

## Contexte technique

### Dépendances (bloquantes)

- **id019** : stockage local des préférences (déjà en place).
- **id026** : entités + mouvements + collisions (la vitesse du joueur existe via `shipSpeed`).

### Points d’entrée / fichiers pertinents

- Préférences et multiplicateur :
  - `project/client/src/storage/preferences.ts`
    - `Sensitivity` = `'low' | 'medium' | 'high'`
    - `sensitivityMultiplier(sensitivity)` retourne déjà 0.8 / 1.0 / 1.2
- UI de sélection de la sensibilité :
  - `project/client/src/ui/home-screen.tsx` (select + libellés “Faible (0.8x) …”).
- Simulation :
  - `project/client/src/game/world-types.ts` : `WorldConfig.shipSpeed` (units/sec)
  - `project/client/src/game/world-sim.ts` : mouvement du vaisseau utilise `world.config.shipSpeed`
- Intégration moteur :
  - `project/client/src/game/game-engine.ts` : crée le monde via `worldConfig`
  - `project/client/src/App.tsx` : crée l’engine une fois, puis `startNewGame()` au clic “Jouer”

### Docs sources (sources de vérité)

- `docs/04-specification-fonctionnelle.md` → section **5.2 Sensibilité**
- `docs/05-decisions-structurantes.md` → décision **D-09**
- (Contexte élargi) `clarifications/04-details-score-et-sensibilite.md` → confirmation ratios

## Étapes proposées (à exécuter, sans pauses intermédiaires)

1. Identifier où la vitesse du joueur est définie et consommée : `WorldConfig.shipSpeed` → `world-sim.ts`.
2. Choisir une stratégie d’intégration pour que la sensibilité courante soit prise en compte :
   - Option A (souvent la plus simple) : construire un `WorldConfig` dérivé de `DEFAULT_WORLD_CONFIG` au moment de démarrer une partie, en multipliant `shipSpeed` par `sensitivityMultiplier(preferences.sensitivity)`.
   - Option B : ajouter une API côté moteur pour mettre à jour `worldConfig` avant `startNewGame` (à faire seulement si Option A est trop intrusive côté App).
   - Dans tous les cas, ne pas recalculer la config à chaque frame.
3. Implémenter l’application du multiplicateur, en réutilisant `sensitivityMultiplier` (ne pas dupliquer les valeurs).
4. Ajouter des tests Bun ciblés :
   - Test minimal recommandé : vérifier que, pour un `dtMs` donné, le déplacement du vaisseau sur l’axe X est proportionnel au multiplicateur (ex: config base vs config \* 1.2).
   - Les tests doivent être déterministes (pas de rAF requis) : utiliser `updateWorld()` directement, ou bien `createGameEngine({ worldConfig })` et `engine.step()`.
5. Valider localement : `bun test` et (si présent) `bun run typecheck` depuis `project/`.
6. Clôture : cocher **id027** dans `TODO.md` uniquement si tout est OK.

## Cas limites à couvrir

- La préférence `sensitivity` vaut une valeur inattendue : le code doit rester robuste et retomber sur le comportement par défaut (déjà géré par `loadPreferences` / types TS).
- La sensibilité change dans l’écran d’accueil puis on démarre une partie : la partie doit refléter la nouvelle valeur.
- Éviter toute régression : la difficulté/scoring ne sont pas concernés.

## Critères de validation

Checklist de succès (tous requis) :

- [ ] La sensibilité (low/medium/high) applique bien **0.8x / 1.0x / 1.2x** sur la vitesse du joueur.
- [ ] En jeu, le changement de preset est observable (déplacement plus lent/rapide).
- [ ] Tests ajoutés et verts : `bun test`.
- [ ] Typecheck OK : `bun run typecheck` (si script présent).
- [ ] Aucun refactor massif, intégration propre et minimale.

## Clôture

- Cocher `- [ ] **id027**` → `- [x] **id027**` dans `TODO.md` uniquement si tous les critères de validation sont satisfaits.
- Ne cocher aucune autre tâche.
