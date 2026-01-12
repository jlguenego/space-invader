# TODO id036 — (P0) (S) Rendre l’échec d’enregistrement score non bloquant (UX)

## Role

Tu es un développeur front-end senior (TypeScript, React) orienté UX robuste. Tu écris du code testable (fonctions pures quand possible) et tu respectes les conventions du dépôt (Bun 1.3.5, TypeScript partout, pas de refactor hors scope).

## Objectif

Implémenter la tâche **id036 (P0) (S)** : si l’enregistrement du score échoue (API down, erreur réseau, erreur HTTP, erreur inattendue), l’application doit afficher un **message clair et non technique**, mais **ne doit pas bloquer** le joueur.

Concrètement, sur l’écran de fin de partie (game over) :

- L’échec d’enregistrement doit être visible via un état UI (ex: “échec” + message).
- Le joueur doit pouvoir **rejouer** même si l’API est indisponible (et sans redémarrer la page).
- Le reste de l’UI ne doit pas être “cassé” : retour accueil et navigation vers le top 10 doivent rester possibles.

## Format de sortie

Produire une implémentation complète (code + tests + validations) dans le workspace existant.

Livrables attendus (selon l’état actuel du code) :

- Modifications côté client (si nécessaire) :
  - `project/client/src/App.tsx` (gestion du flux save score et dispatch UI)
  - `project/client/src/ui/ui-state-machine.ts` (état/réducer score save)
  - `project/client/src/ui/game-over-screen.tsx` (message, désactivation éventuelle de boutons, microcopy)
  - `project/client/src/services/scores-service.ts` (mapping d’erreurs “non technique”)
- Ajout/ajustement de tests Bun pertinents dans `project/client/src/**`.
- Mise à jour de `TODO.md` : cocher `id036` uniquement si tout est validé.

## Contraintes

- Respecter les décisions structurantes : Bun 1.3.5, TypeScript, React, Three.js, Howler.
- Desktop uniquement.
- Ne pas introduire de nouvelle dépendance NPM sans nécessité.
- Ne pas afficher de détails techniques à l’utilisateur (pas de stacktrace, pas de jargon HTTP, pas de codes d’erreur).
- Dégradation gracieuse : une erreur réseau ne doit pas empêcher de rejouer.
- Ne pas faire de refactor massif : modifications minimales centrées sur id036.
- Pas d’écriture inclusive.

## Contexte technique

### Extrait des sources de vérité

- `docs/04-specification-fonctionnelle.md` → **6.6 Chargement / erreurs**
  - “Échec d’enregistrement score : message clair, non bloquant (rejouer possible).”
- `docs/08-qualite-tests-et-ux.md` → **1. Qualité (définition MVP)**
  - “Les erreurs réseau n’empêchent pas de rejouer (dégradation gracieuse).”
  - Exemples de microcopy non technique : “Impossible d’enregistrer le score, réessaie plus tard”.

### Dépendances TODO

- Dépendance : **id021** (intégration API client). Elle doit exister.
  - Si id021 est incomplet, corriger uniquement ce qui bloque id036 (pas plus).

### État actuel (à prendre en compte)

- L’appel API score est encapsulé dans `project/client/src/services/scores-service.ts` et transforme les erreurs en `Error` avec message humain.
- Le flux UI de fin de partie passe par `project/client/src/App.tsx` (dispatch `SCORE_SAVE_*`).
- L’état `scoreSave` vit dans `project/client/src/ui/ui-state-machine.ts` et est affiché par `project/client/src/ui/game-over-screen.tsx`.

## Analyse des dépendances

- Aucun changement back-end attendu.
- L’objectif est une amélioration UX côté front : état + message + non-blocage.

## Étapes proposées (sans pause intermédiaire)

1. Lire les sections docs indiquées et vérifier les exigences exactes.
2. Vérifier le comportement réel :
   - En cas d’erreur de save, un message apparaît.
   - Rejouer reste possible (même pendant/juste après un échec).
3. Si nécessaire, ajuster le modèle d’erreur du save score pour éviter tout cas “bloquant” :
   - Option acceptable : conserver `throw new Error(message)` mais garantir que l’UI ne bloque jamais les actions “Rejouer/Accueil/Top 10”.
   - Option acceptable : retourner un résultat typé (succès/échec) au lieu d’une exception, si cela simplifie le flux UI.
   - Dans les deux cas : pas de messages techniques.
4. Ajuster `GameOverScreen` si besoin pour :
   - Afficher un texte d’erreur clair en cas d’échec.
   - Ne jamais désactiver “Rejouer” à cause d’un échec d’enregistrement.
   - Éviter les états incohérents si l’utilisateur change d’écran pendant un enregistrement.
5. Ajouter au moins un test Bun ciblé (pas de tests React lourds) :
   - Recommandation : test du reducer `uiReducer` garantissant qu’après un `START_GAME`, un éventuel `SCORE_SAVE_ERROR` tardif ne “rebascule” pas l’UI.
   - Et/ou un test de mapping d’erreur dans `scores-service` (si modifié).
6. Valider avec les commandes de repo et cocher id036 uniquement si tout passe.

## Cas limites à couvrir

- Erreur réseau (`fetch` rejette) : message clair ; replay possible.
- Erreur HTTP renvoyée par l’API (format erreur JSON) : message clair ; replay possible.
- Réponse inattendue (JSON invalide / shape inattendue) : message générique non technique ; replay possible.
- “Race” : l’utilisateur clique sur “Rejouer” pendant que l’enregistrement est en cours ; l’app ne doit pas planter ni afficher un état incohérent.

## Critères de validation

- UX : en cas d’erreur lors de l’enregistrement du score, un message clair apparaît sur l’écran fin de partie.
- UX : même en échec réseau, l’utilisateur peut rejouer (action “Rejouer” fonctionne sans recharger).
- Robustesse : aucune exception non gérée ; pas de détails techniques affichés dans l’UI.
- Tests : `bun test` passe.
- Typecheck : `bun run typecheck` passe (depuis `project/`).

## Check-list d’exécution

- `cd project` puis `bun install` (si nécessaire)
- `bun test`
- `bun run typecheck`

## Clôture

- Mettre à jour `TODO.md` en cochant uniquement `- [ ] **id036**` → `- [x] **id036**` **uniquement si** tous les critères de validation sont satisfaits et que les commandes passent.
- Ne cocher aucune autre tâche.
