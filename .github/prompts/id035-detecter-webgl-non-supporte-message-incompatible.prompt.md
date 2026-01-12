# TODO id035 — (P0) (S) Détecter WebGL non supporté et afficher un message non technique

## Role

Tu es un développeur front-end senior (TypeScript, React, Three.js) orienté UX robuste. Tu écris du code testable (fonctions pures quand possible) et tu respectes les conventions du dépôt (Bun 1.3.5, TypeScript partout, pas de refactor hors scope).

## Objectif

Implémenter la tâche **id035 (P0) (S)** : si le rendu 3D ne peut pas démarrer (WebGL non supporté ou init WebGL impossible), l’application ne doit pas afficher d’écran noir. Elle doit afficher un écran/état “incompatible” avec un **message clair, non technique** et **actionnable**.

Concrètement :

- Détecter le cas “WebGL non disponible” le plus tôt possible au démarrage.
- Afficher un message sans jargon (éviter “WebGL”, “GPU”, “Three.js”, “context”, etc.).
- Conserver un log console utile pour le debug, mais ne pas exposer les détails techniques dans l’UI.

## Format de sortie

Produire une implémentation complète (code + tests + validations) dans le workspace existant, typiquement via :

- Modifications dans le client :
  - `project/client/src/App.tsx`
  - `project/client/src/render/webgl-probe.ts`
  - `project/client/src/ui/boot-state.ts`
  - `project/client/src/ui/loading-overlay.tsx`
- Ajout de tests Bun (au moins un test unitaire pertinent) dans `project/client/src/**`.
- Mise à jour de `TODO.md` : cocher `id035` uniquement si tout est validé.

## Contraintes

- Ne pas changer les décisions structurantes (Bun 1.3.5, TS, Three.js, Howler).
- Desktop uniquement (pas de travail mobile/tactile).
- Ne pas introduire de nouvelle dépendance NPM sans nécessité.
- Ne pas inventer de règles produit : se limiter à ce qui est demandé (fallback UX WebGL).
- Message “non technique” : pas de jargon, pas de codes d’erreur, pas de stacktrace.
- Garder l’approche “UI shell React + boucle de jeu hors React” (voir docs d’architecture).
- Pas d’écriture inclusive.

## Contexte technique

### Extrait des sources de vérité

- `docs/04-specification-fonctionnelle.md` → section **6.6 Chargement / erreurs**
  - “Chargement/initialisation WebGL : état explicite.”
  - “WebGL non supporté : message clair non technique.”
- `docs/06-architecture-technique.md` → section **2.4 Contraintes navigateur importantes**
  - “WebGL : afficher un état explicite en cas d’échec (non support / init fail).”
- `docs/06-architecture-technique.md` → **Risques & mitigations**
  - “WebGL : fallback UX si non supporté ; tester sur plusieurs navigateurs desktop.”

### État actuel dans le code (à prendre en compte)

- Le boot existe déjà et utilise un overlay :
  - `project/client/src/ui/boot-state.ts` (BootState/BootReducer)
  - `project/client/src/ui/loading-overlay.tsx` (affiche l’état “chargement” ou “erreur”)
- La sonde WebGL existe déjà :
  - `project/client/src/render/webgl-probe.ts` : `probeWebgl(containerEl)` tente de créer un `THREE.WebGLRenderer` et renvoie `{ ok: true }` ou `{ ok: false; message }`.
- Le boot dans `project/client/src/App.tsx` appelle `probeWebgl` et met `boot.status` à `error` en cas d’échec, mais le message UI est actuellement générique.

## Analyse des dépendances

- Dépendance TODO : **id023** (Three.js init/rendu). Elle est considérée comme déjà en place.
- Aucune dépendance back-end.

## Étapes proposées (sans pause intermédiaire)

1. Définir précisément ce que l’UI doit afficher en cas d’incompatibilité :
   - Un titre explicite (ex: “Jeu incompatible” ou “Impossible d’afficher le jeu”).
   - Un message non technique et actionnable (ex: “Ce navigateur ne permet pas l’affichage 3D nécessaire. Essayez un autre navigateur ou mettez à jour le vôtre.”).
2. Faire en sorte que le code distingue correctement :
   - Échec “WebGL non disponible / init impossible” → écran “incompatible”.
   - Autre erreur de boot (si applicable) → écran d’erreur générique.
     Options acceptables (choisir une approche simple et testable) :
   - Ajouter un `BootErrorCode` (ex: `'webgl_unsupported' | 'boot_failed'`) dans `BootState`.
   - Ou enrichir le résultat de `probeWebgl` avec un champ `reason`/`kind` au lieu d’exposer `error.message`.
3. Mettre à jour `LoadingOverlay` pour afficher un rendu adapté quand l’erreur est “incompatible” :
   - Message clair, sans jargon.
   - Un bouton “Recharger” peut rester, mais ne doit pas être la seule information.
4. Ajouter au moins un test unitaire Bun (sans tests React lourds) :
   - Recommandation : tester une fonction pure de mapping (ex: `getWebglFallbackMessage()` ou `formatBootErrorMessage(code)`), ou tester le reducer si tu introduis `BootErrorCode`.
5. Vérifier manuellement rapidement :
   - Cas nominal (WebGL OK) : l’overlay disparaît et le jeu démarre.
   - Cas échec (simulé) : forcer `probeWebgl` à échouer localement (temporairement) pour vérifier le texte et le rendu, puis remettre.

## Cas limites à couvrir

- `probeWebgl` échoue en levant une exception non-`Error`.
- Le container de sonde n’est pas monté à temps (erreur “probe container not mounted”) : cela ne doit pas afficher un faux message “incompatible WebGL” si ce n’est pas le bon diagnostic.
- L’erreur technique ne doit jamais être affichée telle quelle à l’utilisateur.

## Critères de validation

- UX : si WebGL ne peut pas être initialisé, l’écran affiche un état “incompatible” (pas d’écran noir) avec un texte clair et non technique.
- Code : pas de régressions sur le boot nominal.
- Tests : `bun test` passe.
- Typecheck : `bun run typecheck` passe (depuis `project/`).

## Check-list d’exécution

- Installer si besoin : `cd project` puis `bun install` (si dépendances non présentes).
- Lancer : `bun test`.
- Lancer : `bun run typecheck`.

## Clôture

- Mettre à jour `TODO.md` en cochant uniquement `- [ ] **id035**` → `- [x] **id035**` **uniquement si** tous les critères de validation sont satisfaits et que les commandes de check passent.
- Ne cocher aucune autre tâche.
