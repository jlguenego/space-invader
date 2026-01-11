# Prompt — **id026** **(P0)** _(M)_ Implémenter entités de base (vaisseau/ennemis/tirs) + collisions

## Role

Tu es un développeur TypeScript senior orienté gameplay/simulation temps-réel et architecture front, dans un projet **Space Invaders web** (desktop) basé sur **React + Vite + Three.js** (rendu) et **Bun** (tests).

Tu implémentes la tâche **de bout en bout en une seule passe** : code + tests + validations, sans pauses intermédiaires, sauf si tu es réellement bloqué par une règle manquante (voir section “Clarifications / gate obligatoire”).

## Objectif

Rendre le jeu **jouable** en ajoutant un “monde” minimal :

- Un vaisseau contrôlable au clavier (InputManager déjà présent).
- Des ennemis spawné(s) avec un mouvement simple.
- Des tirs (joueur au minimum).
- Des collisions (tir ↔ ennemi, et condition de game over atteignable).

La simulation doit s’exécuter via `requestAnimationFrame` (boucle déjà en place via `GameEngine.startLoop()`), sans dépendre des re-renders React.

## Format de sortie

Produire des changements dans le client, typiquement :

- Un module “monde / entités” testable (fonctions pures autant que possible) dans `project/client/src/game/`.
- Mise à jour de `project/client/src/game/game-engine.ts` pour intégrer la simulation (sans casser pause/gameover).
- Mise à jour du rendu Three.js (ex: `project/client/src/render/three-renderer.ts` ou un module dédié) pour afficher vaisseau/ennemis/tirs.
- Mise à jour de l’intégration UI dans `project/client/src/App.tsx` / `project/client/src/ui/game-screen.tsx` si nécessaire.
- Tests Bun associés dans `project/client/src/game/`.

## Contraintes

- Ne change pas les décisions structurantes : TypeScript, Three.js, Bun.
- Desktop uniquement ; contrôles : flèches/WASD, espace, P, M.
- Ne couple pas la boucle de jeu aux re-renders React ; ne stocke pas d’objets Three.js dans du state React.
- Garde la simulation déterministe et testable : privilégie fonctions pures + état explicite.
- La pause doit figer la simulation (et idéalement le rendu animé) ; game over doit figer le score final.
- Ne pas implémenter ici : scoring complet (id029), difficulté (id028), sensibilité (id027), audio (id031+), API.
- Respecte le style du repo : fichiers en `kebab-case`, fonctions `camelCase`.
- Écriture inclusive interdite.

## Contexte technique

### TODO (source)

- **id026 (P0) (M)** — Implémenter entités de base (vaisseau/ennemis/tirs) + collisions
  - **But** : Rendre le jeu jouable
  - **Livrable** : spawn / mouvements / tirs / hit / game over
  - **Acceptation** : ennemis détruisables et fin de partie atteignable
  - **Dépendances** : id024, id025
  - **Docs sources** :
    - `docs/02-parcours-et-experience.md` → “Boucle de gameplay”
    - `docs/04-specification-fonctionnelle.md` → “Périmètre MVP”

### Existant (à réutiliser)

- Moteur : `project/client/src/game/game-engine.ts` (états idle/running/paused/gameover, boucle rAF, clamp dt).
- Entrées : `project/client/src/game/input-manager.ts` (movement + fire + edge actions pause/mute).
- UI : `project/client/src/App.tsx` orchestre `GameEngine` et `InputManager`.
- Rendu : `project/client/src/render/three-renderer.ts` (scène/caméra/lumières + rAF interne démo).

### Attendus d’architecture (guidelines du projet)

- La simulation doit utiliser `delta time` et éviter les gros dt (déjà pris en charge côté `GameEngine`).
- Centraliser les listeners clavier (déjà via `InputManager`).
- Rendu : `requestAnimationFrame` ; ne pas faire dépendre la simulation d’un re-render React.

## Analyse des dépendances

- **id024** fournit l’état machine + boucle rAF côté moteur.
- **id025** fournit l’état d’input (movement + fire) et les edge actions (P/M).
- id026 doit s’intégrer sans casser les tests existants (ou les mettre à jour si l’API évolue, en restant cohérent).

## Étapes proposées (sans faire le travail à moitié)

1. Définir les types d’entités (vaisseau, ennemi, tir) et l’état “monde” minimal.
2. Implémenter une simulation pure : `updateWorld(world, input, dtMs) -> { world, events }`.
3. Implémenter le spawn initial (vaisseau + formation simple d’ennemis) et un mouvement d’ennemis minimal.
4. Implémenter les tirs (joueur) avec cooldown minimal (valeur par défaut raisonnable) et suppression hors écran.
5. Implémenter les collisions (au minimum tir-joueur ↔ ennemi) et un critère de fin de partie.
6. Brancher `InputManager.getState()` dans la boucle (probablement via `App.tsx` → options / callback / ref).
7. Brancher le rendu : afficher meshes simples (cubes/sphères) pour vaisseau/ennemis/tirs ; mise à jour par frame sans re-render React.
8. Ajouter/mettre à jour des tests unitaires (collision, suppression d’ennemis, game over atteignable).
9. Lancer `bun test` + `bun run typecheck` et corriger ce qui est lié à la tâche.

## Décisions minimales autorisées (pour éviter l’arbitraire)

Les docs ne fixent pas de métriques chiffrées pour les dimensions/vitesses/cooldowns à ce stade.
Tu peux donc choisir des valeurs par défaut **raisonnables** (et les regrouper dans une config locale) tant que :

- le gameplay est jouable,
- les collisions sont visibles et testables,
- les paramètres sont centralisés pour être remplacés plus tard par difficulté/sensibilité.

## Cas limites à gérer

- `dtMs` nul/négatif/NaN : pas d’évolution.
- Pause : aucun déplacement, pas de tirs, pas de collisions.
- Plusieurs hits le même frame : éviter les doubles destructions (filtrer par IDs, retirer proprement).
- Nettoyage : les tirs hors zone sont supprimés.
- Résilience : ne pas créer d’allocations massives par frame (éviter `.map` multiples si possible, mais sans micro-optimiser).

## Critères de validation

- [ ] Le vaisseau se déplace au clavier (flèches/WASD) pendant l’état running.
- [ ] Appuyer sur espace déclenche des tirs (au moins un tir joueur) et les tirs se déplacent.
- [ ] Des ennemis sont présents et peuvent être détruits par collision avec un tir.
- [ ] Une condition de fin de partie est atteignable sans bouton “simuler” (ex: ennemi atteint une limite, ou vaisseau touché si tu implémentes tirs ennemis).
- [ ] Pause (P) fige la simulation ; reprise réactive.
- [ ] Les tests Bun du client passent (`bun test`).
- [ ] `bun run typecheck` passe.

## Check-list commandes

Depuis `project/` :

- `bun test`
- `bun run typecheck`

## Clarifications / gate obligatoire

Si tu découvres qu’une règle est indispensable et absente (ex: condition de game over non tranchée de façon exploitable), crée un fichier de clarifications puis **arrête-toi** après cette création :

- Chemin : `clarifications/14-gameover-et-collisions.md` (numéro à ajuster si `14` est déjà pris ; prendre `max + 1` en respectant le formalisme)

Template à utiliser :

- Contexte (rappel de la todo `id026` + Docs sources)
- Questions (QCM à cases à cocher `- [ ]`, inclure toujours “Laisse l’IA choisir pour toi (avec justification)”, et “Je ne sais pas / besoin d’une recommandation”)
- Options proposées + impacts
- Décision attendue / critères de décision
- Réponses (vide)

## Clôture

- Une fois (et seulement une fois) tous les critères de validation satisfaits et les commandes passées, coche **uniquement** la case de **id026** dans `TODO.md` (`- [ ]` → `- [x]`).
- Ne coche aucune autre tâche.
