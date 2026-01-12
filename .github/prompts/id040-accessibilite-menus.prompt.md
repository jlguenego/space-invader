# Prompt — id040 (P1) (S) — Assurer l’accessibilité minimale des menus (clavier + focus)

## Role

Tu es un développeur front-end senior spécialisé en accessibilité web (a11y) et en React + TypeScript, avec une approche MVP pragmatique (socle minimal), tests Bun et UI en styles simples.

## Objectif

Implémenter le socle d’accessibilité minimal des menus/écrans UI du jeu afin qu’ils soient utilisables **au clavier, sans souris**, avec un **focus visible** et des **labels** corrects.

Tâche ciblée (depuis TODO.md) :

- **id040** **(P1)** _(S)_ Assurer l’accessibilité minimale des menus (clavier + focus)
- But: Respecter le socle a11y
- Livrable: navigation clavier + focus visible + labels
- Acceptation: menus utilisables au clavier sans souris
- Dépendances: id020
- Docs sources: `/docs/08-qualite-tests-et-ux.md` → “Accessibilité (socle minimal)”

## Format de sortie

Produire des changements concrets dans le client, idéalement sans ajouter de dépendances externes.

Livrables attendus (selon besoin) :

- Modifications dans des composants UI existants (menus/écrans) sous `project/client/src/ui/`.
- Ajout d’un style global (ou d’un mécanisme équivalent) garantissant un **focus visible** sur éléments interactifs.
- Ajustements sémantiques (boutons/liens/champs) pour garantir la navigation clavier.
- Tests unitaires Bun pertinents (au minimum sur des éléments vérifiables sans E2E) et une courte checklist manuelle.

Créer/modifier uniquement ce qui est nécessaire pour satisfaire l’acceptation.

## Contraintes

- Ne pas changer les décisions structurantes du projet (voir `AGENTS.md`) : TypeScript, React/Vite, desktop, contrôles clavier (WASD/flèches, espace, P, M).
- Ne pas coupler la boucle de jeu à des re-renders React (hors scope ici, mais ne pas introduire de patterns qui aggravent ce point).
- Accessibilité visée = **socle minimal** (pas de conformité AA complète).
- Ne pas introduire de nouvelles dépendances sauf si indispensable. Si ajout d’une dépendance, justifier brièvement.
- Conserver la cohérence visuelle : styles simples, pas de refactor massif.
- Les contrôles “Mute” doivent rester accessibles **au clavier** via la touche `M` **et** via l’UI.
- Écriture inclusive interdite.

## Contexte technique

Éléments déjà en place :

- Les écrans/états UI MVP (id020) existent (Accueil/Jeu/Pause/Fin/Classement) via `ui-state-machine`.
- Les composants concernés sont notamment :
  - `project/client/src/ui/home-screen.tsx`
  - `project/client/src/ui/game-screen.tsx`
  - `project/client/src/ui/pause-overlay.tsx`
  - `project/client/src/ui/game-over-screen.tsx`
  - `project/client/src/ui/leaderboard-screen.tsx`
  - `project/client/src/ui/loading-overlay.tsx`
  - `project/client/src/ui/ui-kit.ts`
- L’app est rendue par `project/client/src/App.tsx` et montée via `project/client/src/main.tsx`.
- La doc qualité fixe le socle minimal a11y :
  - Navigation clavier complète dans les menus.
  - Focus visible sur éléments interactifs.
  - Contraste suffisant pour les textes UI importants.
  - Option “mute” accessible sans souris (touche M) + via UI.

## Analyse des dépendances

- **Bloquant** : id020 (déjà fait) car cette tâche consiste à rendre accessibles les menus/écrans créés.
- Non bloquant : aucune dépendance back-end.

## Étapes proposées (exécution sans pause)

1. Lire la section “Accessibilité (socle minimal)” de `docs/08-qualite-tests-et-ux.md` et la traduire en exigences concrètes sur les écrans.
2. Passer en revue tous les écrans/menus (Accueil/Préférences, Pause, Fin de partie, Classement) et lister les éléments interactifs.
3. Garantir la sémantique HTML :
   - Utiliser de vrais `<button type="button">` pour les actions.
   - Utiliser `<a>` uniquement pour navigation/liens.
   - Utiliser `<label htmlFor>` + `id` pour champs (pseudo, difficulté, sensibilité, mute si applicable).
4. Mettre en place un **focus visible** fiable :
   - Ajouter un style global `:focus-visible` (recommandé) pour `button`, `a`, `input`, `select`, et tout élément interactif.
   - S’assurer que le style ne dépend pas d’un hover/souris.
5. (Recommandé) Gestion de focus sur changement d’écran :
   - Quand on entre sur un écran/menu, placer le focus sur l’action primaire (ex: “Démarrer/Jouer”, “Reprendre”, “Rejouer”, “Retour”).
   - Implémenter ceci via `ref` + `useEffect` au montage du composant (sans “voler” le focus en continu).
6. Vérifier le contraste minimal des textes importants (ex: score/états) avec la palette actuelle. Ajuster au besoin de manière minimale (ex: couleur du focus ring, textes critiques).
7. Ajouter des tests unitaires Bun :
   - Priorité : tests “sans DOM” ou via rendu statique React (`react-dom/server`) pour vérifier la présence de labels/attributs clés.
   - Exemples : chaque écran rendu contient un `<main>` ou une structure de titres cohérente, les champs ont `id`/`htmlFor`, les boutons ont du texte explicite.
8. Ajouter/mettre à jour une mini checklist manuelle (dans la description de PR ou dans `project/docs/manual-test-checklist.md` si pertinent et déjà prévu par le projet).

## Cas limites à traiter

- Navigation Tab/Shift+Tab : aucun “piège au focus”, ordre logique (header → contenu → actions).
- Focus visible : le ring doit rester visible sur fond sombre et sur tous les boutons/champs.
- États overlay (pause/chargement) :
  - Si l’overlay bloque l’interaction, s’assurer que les éléments non pertinents ne reçoivent pas le focus.
  - Si l’overlay a des actions (pause), ces actions doivent être focusables et activables au clavier.
- Texte : libellés compréhensibles (éviter uniquement icônes sans texte).

## Critères de validation

Checklist de succès (obligatoire) :

- [ ] La navigation au clavier est complète dans les menus (Tab/Shift+Tab + Entrée/Espace sur boutons).
- [ ] Le focus est visible sur tous les éléments interactifs des menus/écrans.
- [ ] Les champs ont des labels corrects (`label` + `htmlFor`/`id`) ou un `aria-label` pertinent si un label visible n’est pas applicable.
- [ ] Le contraste des textes UI importants reste suffisant après changements.
- [ ] L’option mute est accessible sans souris : touche `M` (déjà) + UI (bouton/checkbox) utilisable au clavier.
- [ ] Les tests `bun test` passent.

Commandes à exécuter :

- Depuis `project/` : `bun test`
- Optionnel (si le repo le supporte) : `bun run typecheck`

## Clôture

- Cocher `- [ ]` → `- [x]` pour **id040** dans `TODO.md` uniquement si :
  - tous les livrables ci-dessus sont produits,
  - tous les critères de validation sont satisfaits,
  - `bun test` passe.
- Ne cocher aucune autre tâche.
