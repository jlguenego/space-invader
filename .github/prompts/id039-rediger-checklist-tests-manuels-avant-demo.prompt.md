# id039 — (P1) (S) Rédiger la checklist de tests manuels “avant démo”

## Role

Tu es un QA / développeur TypeScript senior orienté produit pour un MVP de jeu web (React/Vite + Three.js + Howler, back Express sous Bun). Tu sais rédiger une checklist de tests manuels courte, actionnable et non technique, utilisable en 5–10 minutes avant une démo.

## Objectif

Rédiger une checklist de tests manuels « avant démo » qui permet de valider rapidement, sans outillage, que le MVP est présentable.

La checklist doit couvrir au minimum :

- démarrage / chargement
- contrôles clavier (flèches + WASD, espace, P, M)
- pause
- mute
- fin de partie
- cas “API down” (dégradation gracieuse)
- affichage du leaderboard (top 10 du jour)

## Format de sortie

Livrable principal :

- Créer le fichier : `project/docs/manual-test-checklist.md`
  - Créer le dossier `project/docs/` s’il n’existe pas.

Clôture (uniquement si tout est conforme) :

- Cocher la case de la tâche `id039` dans `TODO.md` (`- [ ]` → `- [x]`). Ne coche aucune autre tâche.

## Contraintes

- Ne pas implémenter de features ni modifier le gameplay : produire uniquement la checklist demandée.
- Checklist utilisable par une personne non technique : phrases simples, étapes courtes.
- Format Markdown lisible, avec des cases à cocher (`- [ ]`) et des attentes observables.
- Ne pas inventer de règles produit : se baser sur la spec et la doc qualité.
- Inclure une variante « API down » réalisable localement (ex: arrêter le serveur) sans modifier le code.
- Écriture inclusive interdite.
- Mode autonome : exécuter la tâche de bout en bout (rédaction + mise en forme + placement au bon chemin) sans demander de confirmations intermédiaires, sauf blocage réel.

## Contexte technique

### Tâche TODO (rappel)

- **id039** **(P1)** _(S)_ Rédiger la checklist de tests manuels “avant démo”
  - **But :** Valider vite sans outillage
  - **Livrable :** `project/docs/manual-test-checklist.md`
  - **Acceptation :** couvre démarrage/contrôles/pause/mute/game over/API down/leaderboard
  - **Dépendances :** `id020`, `id034`, `id035`, `id036`

### Docs sources (obligatoires)

- `docs/08-qualite-tests-et-ux.md` → section "6. Checklists de test manuel (avant démo)" + "2. UX : principes"

### Contexte produit (à refléter dans la checklist)

- Desktop uniquement.
- Contrôles clavier : déplacement (flèches + WASD), tir (espace), pause (P), mute (M).
- En cas d’erreur réseau, l’utilisateur doit pouvoir rejouer (dégradation gracieuse).

### Commandes utiles (si besoin dans la checklist)

Depuis `project/` :

- `bun install`
- `bun run dev`

## Structure attendue du document

Le fichier `project/docs/manual-test-checklist.md` doit contenir au minimum :

1. **But et périmètre** (1–3 lignes)
2. **Pré-requis** (navigateurs cibles, audio activé, clavier, fenêtre)
3. **Démarrage** (checklist)
4. **Partie en cours (contrôles + HUD)**
5. **Pause**
6. **Mute (M)**
7. **Fin de partie (game over)**
8. **Leaderboard (top 10 du jour)**
9. **Mode “API down” (démo dégradée)**
10. **Notes / problèmes fréquents** (optionnel, 3–6 puces max)

Chaque section de test doit préciser :

- Étapes (cases à cocher)
- Résultat attendu (observable)

## Cas limites à inclure (sans surcharger)

- La page ne doit pas rester “noire” : si WebGL non supporté, message clair.
- Le chargement doit être explicite (overlay / état visible).
- Les touches P et M ne doivent pas “spammer” un toggle involontaire (comportement stable).
- API down : message clair lors de l’enregistrement du score, mais possibilité de rejouer.

## Critères de validation

- [ ] Le fichier `project/docs/manual-test-checklist.md` existe et est lisible.
- [ ] La checklist couvre explicitement : démarrage, contrôles, pause, mute, game over, API down, leaderboard.
- [ ] Chaque item est testable manuellement (étape + résultat attendu).
- [ ] La checklist est exécutable rapidement (objectif 5–10 minutes).
- [ ] Aucun changement de code inutile n’a été fait.

## Clôture

- Cocher `id039` dans `TODO.md` uniquement si le livrable est présent et que tous les critères de validation sont satisfaits.
- Ne cocher aucune autre tâche.
