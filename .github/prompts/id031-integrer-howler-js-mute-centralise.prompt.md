# id031 (P0) (M) — Intégrer Howler.js + mute centralisé (touche M)

## Role

Tu es un développeur senior TypeScript spécialisé front-end React, audio navigateur (WebAudio/Howler) et qualité (tests Bun). Tu implémentes des modules découplés, testables, et tu respectes strictement l’architecture décrite dans `docs/`.

## Objectif

Implémenter l’intégration de **Howler.js** côté front et un **mute centralisé**, piloté par la touche **M** (toggle), avec **persistance** via les préférences (localStorage).

Le résultat attendu est :

- Un module `audio/` qui encapsule Howler (initialisation, play SFX, mute).
- Le mute est une “source de vérité” côté préférences (déjà existant) et est appliqué immédiatement à Howler.
- L’UI affiche un indicateur mute (déjà présent) qui reste cohérent avec l’état audio.

## Format de sortie

Produire une PR locale (modifs dans le repo) qui inclut au minimum :

- Mise à jour des dépendances front :
  - `project/client/package.json` : ajout de `howler`.
- Nouveau module audio : fichiers sous `project/client/src/audio/` (noms en `kebab-case` ou `camelCase` cohérents avec le dossier existant) permettant :
  - `setMuted(muted: boolean)` / `toggleMuted()` (si pertinent)
  - `playSfx(key: ...)` (API prête, même si la table d’assets sera complétée dans `id033`)
  - implémentation robuste qui ne casse pas les tests Bun (pas d’accès global navigateur au moment de l’import).
- Intégration dans l’app :
  - `project/client/src/App.tsx` : connecter `preferences.mute` au module audio (appliquer le mute à Howler dès le démarrage et à chaque changement).
- Tests Bun :
  - Un ou plusieurs tests unitaires dans `project/client/src/audio/*.test.ts` validant le comportement mute (sans dépendre d’assets audio réels).

## Contraintes

- Ne pas changer les décisions structurantes :
  - Audio via **Howler.js** (décision D-15).
  - Contrôle mute via **touche M** (toggle).
  - Persistance des réglages via `storage/`.
- Ne pas coupler la boucle de jeu à des re-renders React : ne pas stocker des objets Howler/Audio dans un state React.
- Respecter TypeScript partout.
- Ne pas implémenter la tâche `id032` (audio unlock) dans cette todo, mais structurer le code pour que l’ajout soit simple (ex: point d’extension / flag `unlocked` / méthode dédiée).
- Ne pas “inventer” des règles produit non définies. Si un choix mineur est nécessaire (ex: nom des clés SFX), prendre une décision raisonnable et la noter en 1–2 lignes dans le rapport final.

## Contexte technique

### Tâche (extrait TODO)

- **But :** Fournir SFX + mute persistant
- **Livrable :** module `audio/` (load/play/mute) + persistance
- **Acceptation :** M toggle immédiat + état mute visible
- **Dépendances :** `id019`, `id025`
- **Docs sources :**
  - `docs/05-decisions-structurantes.md` → “D-15”
  - `docs/04-specification-fonctionnelle.md` → “En jeu : mute”

### État actuel du code (à utiliser)

- Préférences (inclut `mute: boolean`) : `project/client/src/storage/preferences.ts`.
- L’UI affiche déjà `MUTE ON/OFF` : `project/client/src/ui/game-screen.tsx`.
- Le clavier déclenche déjà `onToggleMute` sur `KeyM` : `project/client/src/game/input-manager.ts`.
- L’app toggle déjà `preferences.mute` sur M : `project/client/src/App.tsx`.
- Le dossier `project/client/src/audio/` existe mais est vide.

### Rappel d’architecture

Voir `docs/06-architecture-technique.md` : le module `audio/` doit encapsuler Howler (mute, volumes, play SFX) et rester découplé de React.

## Étapes proposées (séquence minimale)

1. Ajouter la dépendance `howler` dans `project/client/package.json`.
2. Créer un petit wrapper audio testable (exemples de design acceptables) :
   - `createAudioManager({ howler?: HowlerLike })` (injection pour tests)
   - ou un module `audio/howler-adapter.ts` qui exporte une interface minimale (`mute(boolean)`), mockable dans les tests.
3. Implémenter le “mute centralisé” :
   - Le state mute reste dans `preferences`.
   - Dans `App.tsx`, appliquer `preferences.mute` à Howler via le module audio :
     - au montage (état initial)
     - à chaque changement de `preferences.mute`.
4. Exposer une API `playSfx(...)` prête pour `id033` :
   - Pas d’assets obligatoires ici.
   - Le code ne doit pas lancer d’erreurs si une SFX est demandée mais non configurée (no-op acceptable).
5. Ajouter des tests Bun :
   - Vérifier que `setMuted(true|false)` appelle le bon mécanisme Howler.
   - Vérifier l’idempotence (deux appels avec la même valeur ne cassent pas).
   - Vérifier que l’import/initialisation du module ne dépend pas de `window` (tests exécutables en environnement non-DOM).

## Cas limites à couvrir

- Environnement de test sans DOM : éviter `window`/`document` au top-level.
- Toggle rapide du mute : pas d’état désynchronisé UI vs audio.
- Remontées d’erreur Howler (assets manquants) : ne jamais bloquer le jeu/menus.
- Préparer l’arrivée de l’“audio unlock” (tâche `id032`) sans introduire de comportement partiel qui casserait des navigateurs.

## Critères de validation

Checklist de réussite :

- [ ] `howler` est ajouté à `project/client/package.json` et l’app build/test fonctionne.
- [ ] Un module audio existe sous `project/client/src/audio/` et encapsule Howler (mute + API play).
- [ ] Le mute est appliqué immédiatement à Howler quand `preferences.mute` change.
- [ ] L’indicateur mute reste cohérent (UI déjà existante) et le toggle M agit instantanément.
- [ ] Tests audio ajoutés et verts : `bun test` (depuis `project/`).
- [ ] Typecheck OK : `bun run typecheck` (depuis `project/`).

## Clôture

- Si (et seulement si) tous les critères de validation ci-dessus sont satisfaits, cocher la tâche dans `TODO.md` : `- [ ] **id031** ...` → `- [x] **id031** ...`.
- Ne cocher aucune autre tâche.
- Dans le rapport final, lister brièvement les fichiers modifiés/créés et les commandes exécutées (`bun test`, `bun run typecheck`).
