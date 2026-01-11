# Prompt — **id005** **(P2)** _(S)_ Vérifier/valider un budget perf cible (fps) et contraintes de rendu

## Role

Tu es un expert **WebGL / Three.js**, optimisation perf front-end, et définition de **critères qualité/DoD** pour un MVP. Tu sais transformer une exigence vague (“qualité visuelle”) en **contraintes mesurables** et une **checklist** praticable.

## Objectif

Réaliser la tâche **id005 (P2, S)** :

- **Cadrer** la “qualité visuelle” côté performance pour limiter le risque WebGL 3D.
- Produire une **cible fps** (ex: fps minimum) + une **checklist perf** (draw calls, assets, réglages de rendu) adaptée au MVP.
- Faire en sorte que la **DoD** inclue un **critère perf vérifiable sur desktop**.

Rappel TODO :

- **But :** cadrer la “qualité visuelle” et le risque WebGL 3D.
- **Livrable :** cible (ex: fps minimum) + checklist perf (draw calls, assets) adaptée au MVP.
- **Acceptation :** la DoD inclut un critère perf vérifiable sur desktop.
- **Dépendances :** aucune.

## Format de sortie

### Gate (obligatoire si infos manquantes)

1. Créer un fichier de clarifications :

- `/clarifications/11-budget-perf-fps.md`

2. **S’arrêter après création** de ce fichier et demander explicitement à l’utilisateur de **répondre dans le document**.

### Après réponses utilisateur (reprendre seulement ensuite)

Une fois les réponses présentes dans `/clarifications/11-budget-perf-fps.md` :

- Compléter ce même fichier avec la **décision actée** (fps cible + méthode de mesure + budgets + checklist).
- Mettre à jour la DoD pour inclure le critère perf (voir “Contexte technique”).

## Contraintes

- ⚠️ Ne pas implémenter de code : produire uniquement de la **documentation de cadrage**.
- Ne pas “choisir au hasard” des chiffres (fps, draw calls, tailles textures, etc.). Si la doc ne fixe pas une valeur, **passer par la clarification**.
- Rester **MVP** : éviter les exigences type “benchmark multi-devices”, “profiling approfondi”, ou outillage lourd.
- Ne pas créer/cocher d’autres tâches.
- **Clôture TODO :** cocher `- [ ]` → `- [x]` pour **id005 uniquement** à la fin **uniquement si** tous les livrables sont produits et les critères de validation ci-dessous sont satisfaits.

## Contexte technique (sources de vérité)

- `/docs/00-contexte-et-vision.md` → section “Risques” et critères de succès (notamment perf WebGL 3D + qualité visuelle).
- `/docs/08-qualite-tests-et-ux.md` → section “Qualité (définition MVP)” et “Critères de sortie (DoD)”.

Note : aucun `AGENTS.md` n’est présent dans le dépôt à ce stade.

## Clarifications (gate obligatoire)

Les docs indiquent “fluide sur desktop” et recommandent de mesurer via critères concrets, mais **ne fixent pas** de budget chiffré (fps / contraintes de rendu). Pour éviter un choix arbitraire, commence par créer :

`/clarifications/11-budget-perf-fps.md` avec le template suivant (copier-coller et remplir) :

---

# Clarification — Budget perf & contraintes de rendu (fps)

## Contexte

- Todo : **id005** — Vérifier/valider un budget perf cible (fps) et contraintes de rendu
- Docs sources :
  - `/docs/00-contexte-et-vision.md` (Risques WebGL 3D + “Mesurer via critères concrets (fps…)”)
  - `/docs/08-qualite-tests-et-ux.md` (Qualité MVP : “fluide sur desktop” + DoD)

## Questions

- Q1 — Objectif de fluidité retenu (desktop) ?

  - [ ] **60 fps cible**, avec **min acceptable 50 fps** (plus exigeant; meilleur ressenti)
  - [ ] **60 fps cible**, avec **min acceptable 45 fps** (tolérant; réduit le risque)
  - [ ] **30 fps min acceptable** (MVP très tolérant; qualité perçue potentiellement plus faible)
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q2 — Machine de référence pour valider le critère ?

  - [ ] Desktop “moyen” (ex: i5/Ryzen 5 + iGPU récent) — priorise l’accessibilité
  - [ ] Desktop “gaming” (GPU dédié) — priorise la qualité visuelle
  - [ ] Laptop (GPU intégré) — priorise le cas le plus contraignant
  - [ ] Autre (préciser CPU/GPU/OS) : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q3 — Résolution / taille canvas de référence ?

  - [ ] 1920×1080 (plein écran) — standard desktop
  - [ ] 1280×720 — réduit le risque perf
  - [ ] Responsive: “fit” mais validation sur 1920×1080
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q4 — Méthode de mesure acceptée (simple, MVP) ?

  - [ ] Moyenne FPS sur 60s après 5s de warmup (simple)
  - [ ] Pire cas (min fps observé sur 60s) + moyenne (plus strict)
  - [ ] Percentile (p95/p99) (plus robuste mais plus complexe)
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q5 — Contraintes de rendu à figer dès maintenant ? (cocher ce qui doit être “budgeté”)
  - [ ] Draw calls max
  - [ ] Triangles/vertices max
  - [ ] Nombre de lumières / ombres
  - [ ] Post-processing (bloom, SSAO, etc.) autorisé ou non
  - [ ] Tailles textures / formats
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

## Options proposées (impacts)

- **Objectif 60 fps** : meilleur ressenti; contraintes plus strictes; plus de travail d’optimisation.
- **Objectif 45–50 fps min** : compromis; baisse le risque; UX potentiellement acceptable.
- **30 fps min** : risque moindre côté dev; mais peut contredire “qualité visuelle” perçue.

## Décision attendue / critères de décision

- Maximiser la probabilité d’un MVP “fluide sur desktop” (docs qualité), sans sur-scoper l’optimisation.
- Garder une règle **mesurable** et **reproductible**.

## Réponses

(À compléter par l’utilisateur)

---

✅ STOP : après avoir créé ce fichier, demande à l’utilisateur de répondre dedans, puis attends.

## Étapes proposées (après réponses)

1. Synthétiser les réponses en une **décision actée** : objectif fps, machine de référence, résolution, méthode de mesure.
2. Rédiger une **checklist perf** MVP (éléments budgétés + pratiques simples d’optimisation orientées Three.js).
3. Ajouter/mettre à jour un critère DoD “perf” dans `/docs/08-qualite-tests-et-ux.md` (section DoD) pour qu’il soit vérifiable.

## Cas limites à couvrir dans la checklist

- Navigateur différent (Chrome/Firefox) : tolérance documentée (au moins mention).
- Différences refresh rate (60Hz vs 120Hz) : préciser comment mesurer (fps vs frame time).
- Scènes “pire cas” (beaucoup d’ennemis/tirs/explosions) : préciser que la mesure se fait sur un scénario worst-case.

## Critères de validation

- Un fichier `/clarifications/11-budget-perf-fps.md` existe et contient les questions QCM + une section “Réponses”.
- Après réponses, la décision actée est écrite clairement (valeurs chiffrées + méthode de mesure).
- Une checklist perf MVP est fournie (items mesurables/pratiques, sans outillage lourd).
- La DoD dans `/docs/08-qualite-tests-et-ux.md` inclut un critère perf vérifiable sur desktop.

## Clôture

- Mettre à jour **uniquement** la ligne de la todo **id005** dans `/TODO.md` : `- [ ]` → `- [x]` **si et seulement si** tous les critères de validation sont satisfaits.
- Ne cocher aucune autre tâche.
