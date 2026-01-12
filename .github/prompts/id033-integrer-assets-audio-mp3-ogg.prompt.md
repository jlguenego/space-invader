# Prompt — id033 (P1) (S) — Intégrer les assets audio (mp3 + ogg)

## Role

Tu es un développeur senior TypeScript spécialisé en audio navigateur (Howler.js), Vite/React, et qualité (tests Bun). Tu sais livrer une intégration d’assets statiques fiable (public/ Vite), testable (sans charger Howler en tests) et conforme aux décisions structurantes.

## Objectif

Intégrer les **assets audio** du MVP au front (formats **mp3 + ogg**) et les brancher au système audio existant, afin que les sons clés soient audibles pendant le jeu.

Tâche TODO ciblée :

- **id033** **(P1)** _(S)_ Intégrer les assets audio (mp3 + ogg)
  - **But :** Livrer les formats attendus
  - **Livrable :** assets `public/assets/` + mapping
  - **Acceptation :** sons clés (tir/impact/game over) audibles
  - **Dépendances :** id031
  - **Docs sources :**
    - /docs/05-decisions-structurantes.md → “D-15 — Audio : Howler.js + formats mp3/ogg”
    - /docs/03-user-stories-et-flux.md → “US-05 — Feedbacks visuels et sonores”

## Format de sortie

Produire une implémentation complète + tests + validations (sans demander de validations intermédiaires).

Livrables attendus (ajuste si tu trouves mieux, sans refactor inutile) :

- Assets audio (mp3 + ogg) ajoutés sous :
  - `project/client/public/assets/` (idéalement dans un sous-dossier, ex: `project/client/public/assets/audio/`)
- Mapping SFX (clés → fichiers) + lecture des SFX via Howler :
  - `project/client/src/audio/audio-manager.ts`
  - éventuellement `project/client/src/audio/howler-like.ts` et `project/client/src/audio/howler-adapter.ts` si tu as besoin d’une abstraction testable pour `Howl`
- Tests Bun mis à jour/ajoutés :
  - `project/client/src/audio/audio-manager.test.ts`
  - (optionnel) tests dédiés pour la couche de chargement SFX si tu la crées

## Contraintes

- Respecter les décisions structurantes : Bun 1.3.5, TypeScript, Vite, Howler, et **formats mp3 + ogg**.
- Ne pas stocker d’objets Howler dans le state React.
- Ne pas charger Howler en environnement non-DOM (même contrainte que `createLazyHowlerAdapter`).
- Le chargement/lecture audio ne doit pas être bloquant : aucune exception non gérée.
- S’appuyer sur les clés existantes `SfxKey` (ne pas renommer sans raison) :
  - `ui-click`, `ui-back`, `player-shot`, `enemy-explosion`, `game-over`
- Ne pas ajouter d'assets audio tiers sans provenance/licence explicite et compatible (MVP).
- Écriture inclusive interdite.

## Contexte technique

### Code existant à respecter

- `project/client/src/audio/audio-manager.ts`
  - `playSfx` est actuellement un no-op avec un commentaire indiquant id033.
  - Le singleton `audioManager` est instancié hors React state.
- `project/client/src/audio/howler-adapter.ts`
  - lazy-load Howler, n’essaye pas de charger Howler si `window` est absent.
- `project/client/public/assets/` existe mais est vide (à part `.gitkeep`).

### Exigences fonctionnelles

- US-05 : des feedbacks sonores pour les actions clés (au minimum tir, impact/explosion, game over).
- D-15 : formats fournis au navigateur en mp3 + ogg.

## Clarifications (gate obligatoire)

Cette todo exige des fichiers audio **réels** (mp3 + ogg). Si le dépôt ne contient pas déjà des assets exploitables et qu’aucune source d’assets n’est explicitement fournie, tu ne peux pas “inventer” des fichiers audio arbitraires.

Donc, avant d’implémenter quoi que ce soit :

1. Vérifie si des assets audio (mp3/ogg) ont été fournis quelque part (par ex. sous `project/client/public/assets/`, `input/`, ou via une consigne explicite dans le repo).
2. Si aucun asset n’existe, crée un fichier de clarifications et **arrête-toi** ensuite.

Fichier à créer (prochain numéro) : `clarifications/15-assets-audio-mp3-ogg.md`

Template obligatoire à coller dans ce fichier :

---

# Clarifications — Assets audio mp3/ogg (id033)

## Contexte

La todo **id033** demande d’intégrer des assets audio **mp3 + ogg** côté front pour rendre audibles les sons clés (tir, impact/explosion, game over), via Howler.

Docs sources :

- /docs/05-decisions-structurantes.md → D-15
- /docs/03-user-stories-et-flux.md → US-05

## Questions

- Q1 — Source des assets audio ?

  - [ ] Je fournis moi-même les fichiers mp3/ogg (et leurs noms) à placer dans `project/client/public/assets/audio/`
  - [ ] Utiliser un pack d’assets explicitement libre de droits que je fournis (fichiers inclus dans le repo)
  - [ ] Laisse l’IA choisir pour toi (avec justification)
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Autre : \_\_\_\_

- Q2 — Nommage des fichiers (recommandation : un fichier par SFX, avec mp3+ogg pour le même son) ?

  - [ ] Conserver une convention dérivée des clés SfxKey (ex: `player-shot.(mp3|ogg)`)
  - [ ] Je fournis ma propre convention de noms
  - [ ] Laisse l’IA choisir pour toi (avec justification)
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Autre : \_\_\_\_

- Q3 — Ajout d’un document de licence/crédits pour les sons ?
  - [ ] Oui — ajouter `project/client/public/assets/audio/ATTRIBUTION.md`
  - [ ] Non
  - [ ] Laisse l’IA choisir pour toi (avec justification)
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Autre : \_\_\_\_

## Options proposées (si pertinent) + impacts

- Fournir les fichiers : implémentation rapide, aucun risque de droits.
- Laisser l’IA choisir : nécessite une validation explicite de la source/licence.

## Décision attendue / critères de décision

- Les sons doivent être utilisables en prod (droits clairs) et compatibles desktop.

## Réponses

(à compléter)

---

Après réponse dans ce fichier (ou assets ajoutés), tu peux reprendre l’exécution de id033.

## Étapes proposées (sans pause intermédiaire après le gate)

1. Placer les assets mp3/ogg dans `project/client/public/assets/audio/`.
2. Définir un mapping unique (clés `SfxKey` → URLs Vite) dans `project/client/src/audio/audio-manager.ts` (ou un module dédié ex: `audio-sfx-manifest.ts`).
3. Implémenter `playSfx(key)` :
   - ne doit pas throw
   - doit fonctionner avec le mute existant (si mute actif, no-op acceptable)
   - doit rester compatible avec l’unlock (id032) : si audio verrouillé, comportement non bloquant
4. Préserver la testabilité :
   - ne pas charger Howler en tests
   - injecter une abstraction “player”/factory pour vérifier que le bon SFX est demandé (sans lire de vrais fichiers)
5. Ajouter/adapter les tests Bun :
   - `playSfx` déclenche bien le chargement/lecture pour une clé connue
   - une clé inconnue (si cas possible) est gérée proprement
   - aucun chargement Howler si `window` absent
6. Validation :
   - `bun test`
   - `bun run typecheck`
   - vérification manuelle navigateur : déclencher les actions (tir/impact/game over) et confirmer que les sons sont audibles.

## Cas limites à couvrir

- Fichiers manquants (erreur 404) : log console ok, pas de crash.
- Audio verrouillé (avant interaction) : ne pas crasher.
- Mute actif : `playSfx` ne doit pas rendre l’app bruyante.
- Environnement tests/non-DOM : pas de tentative de lazy-load Howler.

## Critères de validation

Checklist de succès :

- [ ] Les assets mp3 + ogg sont présents sous `project/client/public/assets/` (idéalement `.../audio/`).
- [ ] `playSfx` n’est plus un no-op et permet de jouer au moins : tir, impact/explosion, game over.
- [ ] Les sons sont audibles en conditions normales (non mute, après interaction utilisateur).
- [ ] Aucun crash si audio verrouillé / fichier manquant.
- [ ] Tests Bun passants : `bun test`.
- [ ] Typecheck OK : `bun run typecheck`.

## Clôture

- Si (et seulement si) **tous** les critères de validation sont satisfaits, coche la case de **id033** dans `TODO.md` (`- [ ]` → `- [x]`).
- Ne coche aucune autre tâche.
