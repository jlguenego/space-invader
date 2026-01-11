# Prompt — id018 (P0) (M) — Initialiser l’app React (Vite) dans project/client/

## Role

Tu es un expert TypeScript, Bun 1.3.5, Vite/React, monorepo workspaces et intégration front/back (Express sert le front buildé en prod).

## Objectif

Implémenter la tâche TODO **id018** **(P0)** _(M)_ : **initialiser l’app React (Vite) dans project/client/**, en respectant les décisions structurantes (React + Vite + TypeScript, Bun 1.3.5 verrouillée) et en rendant le front :

- utilisable en dev (Vite dev server)
- buildable en prod (artefacts statiques `dist/` exploitables ensuite par Express, topologie A)

## Format de sortie

Produire un état de repo prêt à l’exécution, avec au minimum :

- Un projet Vite + React + TypeScript fonctionnel dans project/client/
- Des scripts Bun cohérents dans project/client/package.json (au minimum `dev`, `build`, `preview`)
- Les fichiers Vite/React attendus (ex: `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`)
- Conserver l’organisation cible déjà posée (dossiers `src/ui/`, `src/game/`, `src/render/`, `src/audio/`, `src/services/`, `src/storage/`) sans casser la structure du monorepo

Le résultat doit permettre :

- `bun run dev` depuis project/ (scripts monorepo) sans message “not initialized” côté client
- `bun run build` depuis project/ qui génère un build statique du front dans project/client/dist/

## Contraintes

- Ne pas implémenter de gameplay ici : uniquement le socle Vite/React.
- Respecter : **TypeScript**, **React**, **Vite**, **Bun 1.3.5** (verrouillée).
- Ne pas modifier les décisions structurantes (voir docs sources).
- Éviter le sur-scope : pas d’E2E, pas d’ajout de frameworks UI lourds.
- Garder les conventions du repo (voir docs/07-guidelines-developpement.md si nécessaire) : code simple, testable, fichiers en kebab-case quand pertinent.
- Autonomie : exécuter la tâche de bout en bout sans demander de validations intermédiaires. Ne solliciter l’utilisateur que si réellement bloqué.
- Important : écriture inclusive interdite.

## Contexte technique

### État actuel

- Le monorepo est sous project/ avec workspaces `client` et `server`.
- project/client/ existe déjà avec une structure de dossiers, mais **n’est pas initialisé**.
- Les scripts client actuels pointent vers un placeholder : project/client/package.json exécute project/scripts/not-initialized.ts.
- Les scripts monorepo lancent `bun run dev` dans `server` et `client` via project/scripts/dev.ts.

### Fichiers concernés (principalement)

- project/client/package.json (remplacer scripts placeholder par scripts Vite)
- project/client/index.html
- project/client/vite.config.ts
- project/client/src/main.tsx
- project/client/src/App.tsx (ou équivalent)
- project/client/src/vite-env.d.ts (types Vite)
- Optionnel : project/client/tsconfig.json (si utile) mais attention au typecheck global.

### Docs sources (à respecter)

- docs/05-decisions-structurantes.md → D-02 (React), D-19 (Bun 1.3.5 + Vite), D-20 (TypeScript)
- docs/06-architecture-technique.md → “Front-end (React)” (modules proposés, principes React vs boucle de jeu)
- docs/09-cicd-et-deploiement.md → “Artefacts” + “Option A : Express sert aussi le front”
- clarifications/12-vite.md → privilégier les commandes d’initialisation/install, Bun comme gestionnaire/scripts

## Analyse des dépendances

- Dépendances déclarées par la todo : id006, id007 (déjà faites dans le repo).
- Impacts aval : id017 dépend de ce build front pour être servi par Express ; donc conserver un build Vite standard (dist/), sans exotisme.

## Étapes proposées (à exécuter, sans pause)

1. Initialiser Vite dans project/client/ en template React+TS.
   - Utiliser une commande d’initialisation cohérente avec Bun (ex: `bun create vite@latest` avec template `react-ts`).
   - Si l’initialisation écrase des dossiers existants, fusionner proprement : conserver les dossiers `src/audio/`, `src/game/`, `src/render/`, `src/services/`, `src/storage/`, `src/ui/`.
2. Mettre à jour project/client/package.json :
   - Scripts : `dev` (vite), `build` (vite build), `preview` (vite preview), `test` (bun test si besoin, même s’il n’y a pas encore de tests).
   - Dépendances : `react`, `react-dom`.
   - Dev deps : `vite`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`.
3. Ajouter/configurer les fichiers minimaux :
   - `src/vite-env.d.ts` avec référence `vite/client`.
   - `src/main.tsx` qui monte React sur `#root`.
   - `src/App.tsx` minimal (shell) : titre “Space Invaders MVP”, et un bloc qui confirme que l’app tourne.
   - Ne pas brancher Three.js/Howler ici.
4. Vérifier l’intégration monorepo :
   - Depuis project/ : `bun install`.
   - `bun run dev` : le serveur et le client démarrent ; côté client, Vite doit écouter sans erreur.
   - `bun run build` : produit project/client/dist/.
   - `bun run typecheck` et `bun run lint` : doivent passer (corriger les erreurs liées au scaffolding).

## Cas limites / points d’attention

- Types Vite : ne pas oublier `vite-env.d.ts`, sinon `import.meta.env` peut casser le typecheck.
- Typecheck monorepo : project/tsconfig.json inclut `**/*.tsx`; s’assurer que les types React sont installés et accessibles.
- Windows : chemins et commandes doivent fonctionner sous Windows (Bun + Vite).
- Ne pas introduire de dépendances non demandées.

## Critères de validation

- [ ] project/client n’affiche plus “not initialized” via les scripts.
- [ ] Depuis project/ : `bun install` réussit.
- [ ] Depuis project/ : `bun run dev` démarre `server` + `client` (Vite dev server actif, pas d’erreur fatale).
- [ ] Depuis project/ : `bun run build` génère project/client/dist/.
- [ ] Depuis project/ : `bun run typecheck` passe.
- [ ] Depuis project/ : `bun run lint` passe.

## Clôture

- Une fois tous les critères validés (y compris commandes et tests), cocher uniquement la case de **id018** dans TODO.md (`- [ ]` → `- [x]`).
- Ne pas cocher d’autres tâches.
- Si un blocage non arbitraire apparaît malgré les docs sources, créer un fichier de clarifications et s’arrêter (gate) :
  - Emplacement : clarifications/<NN>-<slug>.md (NN = prochain numéro disponible)
  - Contenu : Contexte + Questions (QCM avec cases) + Impacts + Décision attendue + Réponses (vide)
