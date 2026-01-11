```markdown
# id022 — (P0) (S) Afficher les contrôles clavier (flèches/WASD, espace, P, M)

## Role

Tu es un développeur front TypeScript senior (React + Vite) orienté UX/qualité. Tu privilégies des composants simples, réutilisables, et tu ajoutes des tests légers quand c’est pertinent (Bun), sans introduire de dépendances lourdes.

## Objectif

Rendre l’UX “non-devinette” en affichant clairement les contrôles clavier du MVP (desktop) :

- Déplacement : flèches ou WASD
- Tir : espace
- Pause : P
- Mute : M

Les contrôles doivent être visibles **dès l’écran d’accueil** (au minimum), conformément aux exigences UX.

## Format de sortie

Dans `project/client`, produire une implémentation qui respecte le style existant :

- Un petit composant UI réutilisable (recommandé) pour l’affichage des contrôles, par ex. :
  - `project/client/src/ui/controls-panel.tsx` (ou nom équivalent cohérent)
- Intégration dans l’écran d’accueil :
  - mise à jour de `project/client/src/ui/home-screen.tsx`
- (Optionnel) Intégration complémentaire en jeu (si utile et cohérent) :
  - via `project/client/src/ui/game-screen.tsx` et/ou `project/client/src/ui/pause-overlay.tsx`
- Tests Bun “légers” (sans dépendance de test UI lourde) validant que la liste des contrôles affichés est conforme.

## Contraintes

- Ne pas changer les décisions structurantes : Bun 1.3.5, TypeScript, React/Vite.
- Ne pas inventer de nouvelles touches : uniquement flèches/WASD, espace, P, M.
- Les contrôles doivent être visibles dès l’accueil (critère d’acceptation).
- Éviter d’ajouter une dépendance de test UI (Testing Library, Playwright, etc.) pour cette tâche S, sauf nécessité réelle (si ajout, justification brève).
- Conserver le style UI existant (utiliser `uiCardStyle`, `uiColors`, etc.).
- Ne pas modifier d’autres tâches du TODO. Ne cocher que `id022` (et uniquement en clôture si tout est OK).
- Écriture inclusive interdite.

## Contexte technique

### Tâche TODO

- **id022** **(P0)** _(S)_ Afficher les contrôles clavier (flèches/WASD, espace, P, M)
  - **But :** éviter l’UX “devinette”.
  - **Livrable :** panneau contrôles (Accueil et/ou overlay).
  - **Acceptation :** touches visibles dès l’accueil.
  - **Dépendances :** `id020` (écrans/états UI).
  - **Docs sources :**
    - `docs/08-qualite-tests-et-ux.md` → “UX : principes” (afficher les contrôles dès l’accueil)
    - `docs/04-specification-fonctionnelle.md` → “Contrôles (clavier)”

### État actuel (repo)

- L’écran d’accueil est `project/client/src/ui/home-screen.tsx`.
- Styles UI partagés : `project/client/src/ui/ui-kit.ts`.
- L’application est orchestrée dans `project/client/src/App.tsx`.
- Raccourcis globaux déjà gérés côté app : `P` (pause) et `M` (mute) dans `App.tsx`.

## Étapes proposées (sans pauses)

1. Créer un composant `ControlsPanel` (ou équivalent) qui affiche une carte/panneau “Contrôles (desktop)” et la liste des 4 actions.
2. Centraliser la source de vérité des libellés (recommandé) :
   - exposer une constante exportée (ex: `keyboardControls`) utilisée par le composant.
   - objectif : rendre un test unitaire trivial sans infrastructure DOM.
3. Intégrer le composant dans `HomeScreen` à un endroit visible sans scroll excessif (au minimum “dans la page” et non derrière un état caché).
4. (Optionnel) Si tu ajoutes un rappel en jeu, le faire sans polluer l’écran :
   - rappel court dans `GameScreen` ou enrichir `PauseOverlay`.
5. Ajouter un test Bun unitaire qui vérifie strictement la liste des contrôles :
   - qu’elle contient exactement les 4 actions attendues,
   - que les touches affichées correspondent (flèches/WASD, espace, P, M).

## Cas limites

- Cohérence de wording : “espace” vs “Space” → rester en français (“espace”) comme dans la spec.
- Lisibilité : les touches (P, M) doivent ressortir visuellement (gras) mais sans ajouter une librairie.
- Ne pas casser les raccourcis globaux existants (P/M) ni les interactions sur champs input (pseudo, select).

## Critères de validation

- Fonctionnel
  - Les contrôles sont visibles dès l’accueil.
  - La liste affiche exactement :
    - “Déplacement : flèches ou WASD”
    - “Tir : espace”
    - “Pause : P”
    - “Mute : M”
- Qualité
  - `bun test` passe (depuis `project/` ou au minimum `project/client`).
  - `bun run typecheck` passe depuis `project/`.
- UX
  - Pas de jargon technique, texte clair.

## Clôture

- Cocher la case `- [ ]` → `- [x]` uniquement pour **id022** dans `TODO.md` si et seulement si :
  - tous les livrables sont présents,
  - tous les critères de validation sont satisfaits,
  - les commandes (`bun test`, `bun run typecheck`) passent.
- Ne cocher aucune autre tâche.
```
