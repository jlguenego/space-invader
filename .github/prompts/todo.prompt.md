---
mode: agent
---

# Générateur de prompts pour les tâches TODO

## Contexte

La documentation fonctionnelle/technique du projet est dans le dossier `docs/` (et les précisions associées dans `clarifications/`). Les sections **Docs sources** des tâches du `TODO.md` pointent vers ces fichiers : ce sont les sources de vérité à consulter.

Tu es un expert en :

- Rédaction de prompts IA (clarté, structure, exhaustivité)
- Développement TypeScript / Bun
- Génération PowerPoint (pptxgenjs)
- Gestion de projet (priorisation, découpage de tâches)

## Mission

1. **Lis** le fichier `TODO.md` à la racine du projet
2. **Sélectionne** la tâche à traiter :
   - Si un **ID de tâche** est fourni (ex: `id001`, `id014`), prends cette tâche
   - Sinon, prends la tâche la plus prioritaire non cochée selon le formalisme du projet :
     - Priorité : **(P0)** > **(P1)** > **(P2)**
     - À priorité égale : prends la première tâche rencontrée dans le fichier (ordre d’apparition)
3. **Rédige** un prompt détaillé et méthodique pour réaliser cette tâche

## Format de sortie

Crée un fichier prompt dans `.github/prompts/<id>-<slug>.prompt.md` où :

- `<id>` est l'identifiant exact de la tâche en minuscules (ex: `id001`, `id014`)
- `<slug>` est en **spinal-case**, court et explicite, dérivé du titre de la tâche (ex: `clarifier-https-sans-domaine`, `implementer-post-api-scores`)

Le prompt généré doit **obligatoirement** contenir ces sections :

1. **Role** — Définir le persona/expert attendu pour la tâche
2. **Objectif** — Ce que la tâche doit accomplir
3. **Format de sortie** — Fichiers/structure à produire
4. **Contraintes** — Règles à respecter
5. **Contexte technique** — Fichiers concernés, références
6. **Critères de validation** — Checklist de succès

> Important : le fichier prompt doit être auto-suffisant. Il doit reprendre les informations utiles du TODO (But, Livrable, Acceptation, Dépendances, Docs sources) pour que l’exécution soit possible sans relecture manuelle.

> 💡 Tu peux ajouter d'autres sections si nécessaire (ex: Étapes, Exemples, Cas limites) pour garantir la qualité du prompt.

## Contraintes

- ⚠️ **Ne réalise PAS la tâche**, rédige uniquement le prompt
- Consulte `AGENTS.md` pour comprendre l'architecture du projet (si présent)
- Respecte les conventions du projet (voir `specifications/` si présent)
- Base-toi sur `docs/` et `clarifications/` pour toute décision/règle : ne comble pas les trous “au hasard”.
- ✅ **Clôture (dans le prompt généré)** : demander à l’IA exécutant la tâche de **cocher la case** `- [ ]` → `- [x]` dans `TODO.md` **uniquement si** :

  - tous les livrables sont produits,
  - tous les critères d’acceptation sont vérifiés,
  - les éventuels tests/commandes demandés passent.

  Le générateur de prompt (ce document) **ne coche pas** le `TODO.md` au moment de la génération ; il impose que la case soit cochée **à la fin** de l’exécution réelle de la tâche.

## Clarifications (gate obligatoire)

Si la tâche sélectionnée ne peut pas être réalisée de façon non-arbitraire (règle manquante, barème non chiffré, décision technique non tranchée, etc.) après lecture des **Docs sources** :

1. Le prompt généré doit demander la création d’un fichier de clarifications : `/clarifications/<NN>-<slug>.md`

- `<NN>` : prochain numéro disponible sur 2 chiffres dans `clarifications/` (ex: `07`, `08`, ...), sans trou à combler ; prends `max + 1`.
- `<slug>` : spinal-case court dérivé du sujet (pas forcément l’ID de la todo), ex: `https-sans-domaine`, `bareme-bonus`, `parametres-difficulte`.

2. Le prompt doit **s’arrêter** après création de ce fichier et demander explicitement à l’utilisateur de répondre dans le document.
3. Le prompt ne doit reprendre l’exécution de la todo qu’une fois les réponses apportées (ou la décision actée) dans ce fichier.

Contenu attendu du fichier de clarifications (template à inclure dans le prompt) :

- Contexte (rappel de la todo `idXXX` + lien vers ses Docs sources)
- Questions (liste numérotée, formulations fermées quand possible)
  - Pour chaque question, propose un **QCM** avec cases à cocher (`- [ ]`) afin que l’utilisateur puisse répondre sans jargon.
  - Inclure **toujours** une option : `- [ ] Laisse l’IA choisir pour toi (avec justification)`.
  - Si nécessaire, inclure aussi : `- [ ] Je ne sais pas / besoin d’une recommandation`.
  - Autorise une option `Autre : ____` si aucune proposition ne convient.
- Options proposées (si pertinent) + impacts (résumés en 1–2 lignes par option)
- Décision attendue / critères de décision
- Réponses (section vide à compléter par l’utilisateur)

Exemple de question en QCM (à utiliser comme modèle) :

- Q1 — Stratégie retenue ?
  - [ ] Option A — … (impacts)
  - [ ] Option B — … (impacts)
  - [ ] Autre : \_\_\_\_
  - [ ] Laisse l’IA choisir pour toi (avec justification)

## Formalisme du TODO à respecter

Les tâches suivent ce pattern (exemples) :

- `- [ ] **id010** **(P0)** _(M)_ Initialiser l’app Express et la base /api`
- Blocs de sous-bullets structurées : **But**, **Livrable**, **Acceptation**, **Dépendances**, **Docs sources**

Ton prompt doit :

- Reprendre l’ID, le libellé, la priorité `(P0/P1/P2)` et la taille `(S/M)`.
- Reprendre explicitement les **dépendances** (IDs) et indiquer ce qui est bloquant.
- Citer les **docs sources** (liens vers `docs/` et/ou `clarifications/`) et indiquer quoi y chercher.

## Règles de sélection (détaillées)

- Si l’utilisateur a fourni un ID (ex: `id013`) :
  - Sélectionne uniquement cette tâche.
  - Si elle n’existe pas, échoue proprement avec une liste des IDs proches (ex: mêmes préfixes) et n’écris pas de fichier.
- Sinon :
  - Ne considère que les tâches non cochées `- [ ]`.
  - Choisis la plus prioritaire selon `(P0 > P1 > P2)`.
  - Si plusieurs tâches ont la même priorité, prends la première dans l’ordre d’apparition.

## Attendus du prompt généré

En plus des sections obligatoires, ajoute au besoin :

- **Analyse des dépendances** : ce qui doit exister avant, ce qui peut être stubé.
- **Étapes proposées** : séquence d’implémentation minimale (sans faire le travail).
- **Cas limites** : entrées invalides, erreurs réseau/I/O, timezone/DST, etc. selon la tâche.
- **Check-list** : tests à écrire, commandes à lancer, vérifications manuelles.

Le prompt généré doit aussi contenir une section (ou une étape finale) **Clôture** qui :

- rappelle que la case de la tâche dans `TODO.md` doit être cochée uniquement si les **Critères de validation** sont tous satisfaits,
- interdit de cocher d’autres tâches.
