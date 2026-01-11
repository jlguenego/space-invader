# id007 — Décider et documenter JS vs TypeScript (front et back)

## Role

Tu es un lead engineer JavaScript/TypeScript (Bun + Vite + Express) et tu dois acter une décision de langage **exécutable** pour un monorepo (client React/Vite, server Express/Bun) + ses impacts CI/outillage.

## Objectif

Acter la décision **JS vs TypeScript** pour :

- le front (React + Vite)
- le back (Express exécuté sous Bun)

…et documenter clairement les impacts sur : structure, conventions, scripts, lint/format, tests et CI.

> Contrainte fournie par l’utilisateur (à appliquer) : **utiliser TypeScript au maximum**. **Bun exécute le TypeScript**, donc côté serveur il ne doit pas être nécessaire de “compiler TS → JS” pour exécuter (mais le bundling front via Vite reste un build).

## Format de sortie

Produire au minimum :

1. Une décision écrite dans un endroit unique et évident (au choix, mais justifié) parmi :

   - `project/README.md` (section “Décisions / Langage”)
   - ou `project/docs/decisions.md` (si `project/docs/` existe déjà ; sinon créer `project/docs/`)
   - et/ou mise à jour de `docs/05-decisions-structurantes.md` **uniquement si** ce fichier est utilisé comme registre de décisions (ne pas inventer un nouveau registre concurrent).

2. Une note courte “Impacts CI/outillage” listant ce qui changera/sera attendu dans `id008` (scripts, lint, typecheck, config TS).

3. Mise à jour **minimale** de `TODO.md` : retirer l’ambiguïté côté “Hypothèses & zones à clarifier” pour JS/TS **si et seulement si** la décision est actée (sans cocher `id007` tant que les critères de validation ne sont pas tous satisfaits).

## Contraintes

- Ne pas implémenter `id008` (scripts, configs lint, CI) : ici tu acteras la décision et tu décriras les impacts.
- Se baser sur les sources de vérité du repo : `docs/` et `clarifications/`.
- Conserver les décisions déjà actées : Bun 1.3.5 verrouillée, Vite côté front, Express côté back.
- Ne pas ajouter de features non demandées.
- Respecter la contrainte repo : le code et la doc “projet/exécution” doivent vivre sous `project/`.

## Contexte technique

### Dépendances

- `id006` est indiqué comme dépendance et est déjà fait (structure `project/client`, `project/server`, `project/scripts`).

### Sources docs à consulter (obligatoires)

- `/docs/09-cicd-et-deploiement.md` → “Vérifications en CI” (lint/typecheck si TS, build front, tests back).
- `/docs/07-guidelines-developpement.md` → “Style & format” (formatteur auto, conventions, etc.).

### Contexte repo (indices)

- Le repo est déjà structuré : `project/client/src/*` et `project/server/src/*` existent (dossiers vides/placeholder).
- Il n’y a pas (encore) de `package.json`/configs outillage : cela sera traité dans `id008`.

## Analyse des dépendances (à inclure dans ton raisonnement)

- `id007` est un **gate** : `id008`, `id010`, `id018` dépendent de cette décision.
- Tu dois produire une décision qui n’implique pas de “travail fantôme” : préciser explicitement ce qui sera fait dans `id008` (scripts/configs).

## Étapes proposées

1. Lire les sources docs et confirmer le cadre : Bun (1.3.5), Vite, Express, CI attendue.
2. Acter la décision de langage :
   - Front : TypeScript (fichiers `.ts/.tsx`).
   - Back : TypeScript (fichiers `.ts`), exécuté par Bun (pas de compilation requise pour exécuter en dev/prod).
3. Documenter les implications :
   - Standards de code : extensions, conventions de fichiers, import paths.
   - CI : présence d’un step `typecheck` (si retenu), sinon au minimum `tsc --noEmit` (à planifier dans `id008`).
   - Build : rappeler que Vite produit un build statique (TS transpile via Vite), et que le serveur peut rester en TS.
4. Mettre à jour la section “Hypothèses & zones à clarifier” de `TODO.md` pour refléter la décision (JS vs TS n’est plus une hypothèse).

## Cas limites / points à expliciter dans la décision

- Côté serveur : Bun exécute TS, mais certains outils (tests/lint) peuvent exiger config TS (`tsconfig.json`). Noter que c’est géré dans `id008`.
- Côté front : même si “pas besoin de compiler TS en JS” côté serveur, le front nécessite un build (Vite) en prod.
- Décider si les fichiers de config sont en TS ou JS (ex: `vite.config.ts`, `eslint.config.*`) : acte une ligne directrice “prefer TS si supporté”.

## Critères de validation

- La décision “JS vs TS” est écrite et trouvable rapidement (dans `project/README.md` ou `project/docs/decisions.md`), avec :
  - le choix pour front et back,
  - la justification courte,
  - les impacts CI/outillage explicités.
- Les références aux docs sources sont citées (au moins les deux docs ci-dessus).
- `TODO.md` n’est plus ambigu sur la question JS/TS (hypothèse retirée ou reformulée en décision actée).

## Clôture

- À la fin, **ne coche** `- [ ] **id007**` → `- [x]` dans `TODO.md` **uniquement si** tous les livrables sont produits et que les critères de validation ci-dessus sont satisfaits.
- Ne coche aucune autre tâche.
