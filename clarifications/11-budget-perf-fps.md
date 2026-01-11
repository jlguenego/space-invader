# Clarification — Budget perf & contraintes de rendu (fps)

## Contexte

- Todo : **id005** — Vérifier/valider un budget perf cible (fps) et contraintes de rendu
- Docs sources :
  - `/docs/00-contexte-et-vision.md` (Risques WebGL 3D + “Mesurer via critères concrets (fps…)”)
  - `/docs/08-qualite-tests-et-ux.md` (Qualité MVP : “fluide sur desktop” + DoD)

## Questions

- Q1 — Objectif de fluidité retenu (desktop) ?

  - [x] **60 fps cible**, avec **min acceptable 50 fps** (plus exigeant; meilleur ressenti)
  - [ ] **60 fps cible**, avec **min acceptable 45 fps** (tolérant; réduit le risque)
  - [ ] **30 fps min acceptable** (MVP très tolérant; qualité perçue potentiellement plus faible)
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q2 — Machine de référence pour valider le critère ?

  - [ ] Desktop “moyen” (ex: i5/Ryzen 5 + iGPU récent) — priorise l’accessibilité
  - [ ] Desktop “gaming” (GPU dédié) — priorise la qualité visuelle
  - [x] Laptop (GPU intégré) — priorise le cas le plus contraignant
  - [ ] Autre (préciser CPU/GPU/OS) : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q3 — Résolution / taille canvas de référence ?

  - [x] 1920×1080 (plein écran) — standard desktop
  - [ ] 1280×720 — réduit le risque perf
  - [ ] Responsive: “fit” mais validation sur 1920×1080
  - [ ] Autre : \_\_\_\_
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Laisse l’IA choisir pour toi (avec justification)

- Q4 — Méthode de mesure acceptée (simple, MVP) ?

  - [x] Moyenne FPS sur 60s après 5s de warmup (simple)
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
  - [x] Laisse l’IA choisir pour toi (avec justification)

## Options proposées (impacts)

- **Objectif 60 fps** : meilleur ressenti; contraintes plus strictes; plus de travail d’optimisation.
- **Objectif 45–50 fps min** : compromis; baisse le risque; UX potentiellement acceptable.
- **30 fps min** : risque moindre côté dev; mais peut contredire “qualité visuelle” perçue.

## Décision attendue / critères de décision

- Maximiser la probabilité d’un MVP “fluide sur desktop” (docs qualité), sans sur-scoper l’optimisation.
- Garder une règle **mesurable** et **reproductible**.

## Réponses

### Choix retenus

- Q1 : **60 fps cible**, **min acceptable 50 fps**
- Q2 : **Laptop (GPU intégré)** (cas le plus contraignant)
- Q3 : **1920×1080** (plein écran)
- Q4 : **Moyenne FPS sur 60s après 5s de warmup**
- Q5 : **Laisse l’IA choisir** (avec justification) → voir “Contraintes de rendu (budget MVP)” ci-dessous

## Décision actée

### Cible de performance (desktop)

- **Objectif :** viser un rendu “fluide” sur desktop.
- **Cible :** **60 fps**.
- **Minimum acceptable :** **50 fps**.

### Méthode de mesure (reproductible, MVP)

- **Scénario :** une séquence “pire cas” (ex: vague avec beaucoup d’ennemis + tirs + impacts/explosions). Le scénario doit être décrit dans le futur runbook/checklist (pas besoin d’outillage avancé).
- **Résolution de référence :** canvas **1920×1080**.
- **Warmup :** ignorer les **5 premières secondes** (chargement, JIT, caches).
- **Fenêtre de mesure :** mesurer la **moyenne FPS sur 60 secondes**.
- **Matériel de référence :** **laptop avec GPU intégré** (le plus contraignant).

Critère : **moyenne ≥ 60 fps** sur 60s (après warmup) sur la machine de référence.
Tolérance : si la moyenne n’est pas atteinte mais reste **≥ 50 fps**, c’est considéré “acceptable” pour le MVP (mais doit déclencher action d’optimisation avant “polish”).

## Contraintes de rendu (budget MVP)

Q5 a été déléguée à l’IA : les budgets ci-dessous sont choisis pour maximiser les chances de tenir **1080p sur iGPU** sans sur-spécifier.

- **Draw calls (objectif) :** viser **≤ 100** en “pire cas”; tolérance **≤ 150**.
  - Justification : sur iGPU, la CPU overhead des draw calls devient vite limitante; instancing et batching doivent garder ce budget bas.
- **Géométrie :** viser **≤ 100k triangles** en “pire cas”; tolérance **≤ 200k**.
  - Justification : 3D simple/arcade; budget suffisant pour vaisseau + ennemis instanciés + FX simples.
- **Lumières / ombres :**
  - Lumières : **1 Directional + 1 Ambient/Hemisphere** (ou équivalent), éviter les multiplications de lights dynamiques.
  - Ombres : **désactivées par défaut** pour le MVP; si activées, **1 seule lumière avec ombres** max, shadow map **1024**.
  - Justification : ombres temps réel coûtent cher et sont souvent le premier levier pour tenir 60 fps.
- **Post-processing :** **désactivé par défaut**.
  - Autorisé : **1 effet léger maximum** (ex: bloom), uniquement si le budget fps est respecté.
  - Justification : le MVP demande lisibilité/feedback; le post-process est un “bonus” conditionnel aux perfs.
- **Textures / formats :**
  - Taille : privilégier **512×512**; autoriser **1024×1024** ponctuellement; éviter > 1024 pour le MVP.
  - Filtrage : éviter anisotropy élevée; rester sobre.
  - Justification : iGPU = bande passante/mémoire limitées; le style peut rester “propre” avec peu de textures.

## Checklist perf (MVP)

À utiliser comme checklist de validation quand la boucle de jeu Three.js existera :

1. **Mesure**

- Canvas 1920×1080, warmup 5s, mesurer 60s sur scénario “pire cas”.
- Reporter : moyenne fps + conditions (navigateur, machine).

2. **Draw calls**

- Utiliser instancing pour ennemis/tirs quand possible.
- Partager matériaux/géométries (éviter clones inutiles).

3. **Géométrie**

- Limiter le polycount; préférer silhouettes lisibles + matériaux simples.

4. **Lumières / ombres**

- Garder une config lumière simple; ombres off par défaut.

5. **Post-processing**

- Off par défaut; activer seulement si la cible fps est tenue.

6. **Textures**

- Limiter la taille/quantité; éviter les grosses textures; compresser quand possible plus tard si besoin.
