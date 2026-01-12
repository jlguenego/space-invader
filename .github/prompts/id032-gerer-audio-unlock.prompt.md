# Prompt — id032 (P1) (S) — Gérer l’“audio unlock” après interaction utilisateur

## Role

Tu es un développeur senior TypeScript spécialisé en audio navigateur (Web Audio / Howler.js), React, et qualité (tests Bun). Tu connais les contraintes d’autoplay/gesture des navigateurs desktop et tu sais concevoir une intégration robuste, testable et non intrusive.

## Objectif

Implémenter la gestion de l’“audio unlock” côté client : après **la première interaction utilisateur** (clic / touche clavier), l’audio doit pouvoir fonctionner (déverrouillage du contexte audio) sans erreur bloquante, et avec une **UX de repli** si l’audio reste verrouillé.

Tâche TODO ciblée :

- **id032** **(P1)** _(S)_ Gérer l’“audio unlock” après interaction utilisateur
  - **But :** Éviter le silence navigateur
  - **Livrable :** unlock (premier click/keypress) + fallback UX
  - **Acceptation :** sons OK après interaction, pas d’erreur bloquante
  - **Dépendances :** id031
  - **Docs sources :**
    - /docs/06-architecture-technique.md → “Contraintes navigateur”
    - /docs/07-guidelines-developpement.md → “Audio (Howler)”

## Format de sortie

Produire une implémentation complète + tests + validation, en restant minimal.

Livrables attendus (à ajuster si tu trouves un meilleur découpage cohérent avec le code existant) :

- Un module dédié à l’unlock (ex: `project/client/src/audio/audio-unlock.ts`)
- Mise à jour de l’abstraction Howler si nécessaire :
  - `project/client/src/audio/howler-like.ts`
  - `project/client/src/audio/howler-adapter.ts`
- Intégration dans le singleton audio existant :
  - `project/client/src/audio/audio-manager.ts`
- Intégration UI minimale (fallback) si nécessaire :
  - idéalement au niveau de `project/client/src/App.tsx` et/ou `project/client/src/ui/home-screen.tsx`
- Tests Bun :
  - ex: `project/client/src/audio/audio-unlock.test.ts` (et ajustements de tests existants si besoin)

## Contraintes

- Ne pas changer les décisions structurantes (Bun 1.3.5, TypeScript, Howler, etc.).
- Ne pas coupler la boucle de jeu aux re-renders React ; ne pas stocker des objets audio/howler dans le state React.
- Garder un comportement sûr en environnement de test / non-DOM : ne pas tenter de charger Howler si `window` est absent (même logique que `createLazyHowlerAdapter`).
- Pas d’erreur bloquante : toute erreur d’unlock doit être gérée (log console ok) et l’app doit rester jouable.
- Ne pas implémenter id033 (assets audio) : ici, on ne fait que la mécanique “unlock” + UX de repli.
- Écriture inclusive interdite.

## Contexte technique

### Code existant (à respecter)

- Singleton audio (hors React state) : `audioManager` dans `project/client/src/audio/audio-manager.ts`
- Adaptateur Howler lazy-load : `project/client/src/audio/howler-adapter.ts`
  - remarque : aujourd’hui il ne charge Howler qu’à l’appel de `mute()` et ignore les environnements non-DOM.
- App React : `project/client/src/App.tsx`
  - `audioManager.setMuted(preferences.mute)` synchronise le mute avec les préférences
  - Les interactions utilisateur existent déjà : clic sur “Jouer/Démarrer”, input clavier via `InputManager`.

### Contraintes navigateurs (à lire dans les docs sources)

- Les navigateurs bloquent souvent l’audio tant qu’il n’y a pas eu une interaction explicite (gesture).
- La solution doit être robuste (pas dépendante du TZ système ou d’un comportement non standard), et testable.

## Analyse des dépendances

- **id031** est déjà en place : Howler est intégré + mute centralisé.
- **id033** (assets) n’est pas requis ici : l’unlock doit fonctionner même si aucune SFX n’est encore jouée.

## Étapes proposées (sans pause intermédiaire)

1. Lire les sections pertinentes des docs sources (06-architecture, 07-guidelines) et repérer :
   - les recommandations “audio unlock” explicites
   - les exigences UX attendues (message, non-blocage)
2. Concevoir une API interne “unlock” testable :
   - objectif : déclencher un “attempt” d’unlock sur **première interaction** (pointerdown/keydown)
   - état minimal : `locked` / `unlocked` / `failed` (ou équivalent)
   - idempotence : plusieurs interactions ne doivent pas spammer les tentatives
3. Étendre l’abstraction Howler si nécessaire :
   - option recommandée : ajouter `unlock(): Promise<void>` ou `tryUnlock(): Promise<boolean>` à `HowlerLike`
   - implémenter dans `createLazyHowlerAdapter()` une version qui lazy-load Howler seulement côté browser
   - utiliser une stratégie compatible Howler : ex. reprendre le contexte audio (`Howler.ctx.resume()`), et/ou utiliser l’API officielle Howler si disponible
4. Brancher l’unlock dans `audioManager` sans exposer Howler à React :
   - ajouter une méthode (ex: `ensureUnlocked()` / `registerUnlockOnFirstInteraction(target)`)
   - éviter de charger Howler tant que l’utilisateur n’a pas interagi (important perf + compat)
5. Intégrer la détection et la UX de repli :
   - afficher un message discret quand audio non unlock (et mute désactivé) : “Cliquez / appuyez sur une touche pour activer le son”
   - une fois unlock OK, le message disparaît
   - si unlock échoue : afficher un message simple, non technique (ex: “Le son est indisponible sur ce navigateur”) et ne pas bloquer
6. Ajouter des tests Bun :
   - tests unitaires sur le module “unlock” avec un `EventTarget` injecté (fake) pour simuler `addEventListener/removeEventListener`
   - tests idempotence : 2 interactions → 1 seule tentative
   - tests non-DOM : si `window` absent, aucune tentative de lazy-load et pas d’exception
   - tests d’intégration légère : `audioManager` déclenche bien l’unlock via un `HowlerLike` mocké
7. Validation :
   - `bun test`
   - `bun run typecheck`
   - vérifier rapidement dans le navigateur (manuel) : avant interaction → pas d’erreur ; après clic → état unlock OK (et prêt pour id033)

## Cas limites à couvrir

- Utilisateur avec `mute=true` : ne pas afficher une UX d’unlock insistante (ou la rendre très discrète), mais l’unlock peut rester possible.
- Interaction clavier uniquement (accessibilité desktop) : `keydown` doit suffire.
- Plusieurs interactions rapides : éviter les courses (promesse en vol) et le spam console.
- Environnements tests/SSR : `window` absent → aucun crash.
- Erreur au chargement dynamique de Howler : log + état `failed`, sans crash.

## Critères de validation

Checklist de succès :

- [ ] Une tentative d’unlock se déclenche après la première interaction utilisateur (clic et clavier).
- [ ] Le mécanisme est idempotent (pas de multi-unlock, pas de spam).
- [ ] En cas d’échec, l’app reste utilisable et l’erreur n’est pas bloquante.
- [ ] Une UX de repli existe (message clair, non technique, pas de jargon).
- [ ] Tests Bun ajoutés et passants : `bun test`.
- [ ] Typecheck OK : `bun run typecheck`.

## Clôture

- Si (et seulement si) **tous** les critères de validation sont satisfaits, coche la case de **id032** dans `TODO.md` (`- [ ]` → `- [x]`).
- Ne coche aucune autre tâche.
