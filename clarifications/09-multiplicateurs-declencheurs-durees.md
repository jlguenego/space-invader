# Clarification 09 — Multiplicateurs : déclencheurs & durées

- Date : 2026-01-11
- Contexte : TODO **id003 (P1) (S) — Clarifier les déclencheurs/durées des multiplicateurs**
- Docs sources :
  - `docs/04-specification-fonctionnelle.md` (7.4 Multiplicateurs + 8 Points à préciser)
  - `docs/03-user-stories-et-flux.md` (Décisions actées + Points à préciser)
  - `clarifications/04-details-score-et-sensibilite.md` (multiplicateurs : types + principes)
- Statut : OUVERTE

## Contexte

Les multiplicateurs existent (combo / temps / difficulté / streak). Ils sont déclenchés par la mort de certains types d’ennemis et durent un temps prédéterminé, sans plafond. Cette clarification fixe des règles **chiffrées** et **non ambiguës** pour permettre une implémentation et des tests unitaires.

## Questions (à cocher)

### Q1 — Liste des types d’ennemis à considérer (pour déclenchement des multiplicateurs) ?

- [ ] Option A — 3 types : Standard / Rapide / Tank (impacts : simple, tuning rapide)
- [ ] Option B — 4 types : Standard / Rapide / Tank / Elite (impacts : plus de variété)
- [ ] Option C — 5 types : Standard / Rapide / Tank / Sniper / Elite (impacts : plus riche, plus long à équilibrer)
- [ ] Autre : ____
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q2 — Quels types d’ennemis déclenchent un multiplicateur ?

- [ ] Option A — Uniquement les ennemis “rares” (ex: Elite) (impacts : événementiel)
- [ ] Option B — Certains types (ex: Rapide + Elite) (impacts : équilibrage flexible)
- [ ] Option C — Tous les types peuvent déclencher, mais avec des effets différents (impacts : plus complexe)
- [ ] Autre : ____
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q3 — Mapping « ennemi déclencheur → type de multiplicateur » ?

> Choisir une règle déterministe (sans ambiguïté) pour associer un kill à un multiplicateur.

- [ ] Option A — Chaque type d’ennemi déclenche **un seul** multiplicateur précis (table fixe) (impacts : testable, lisible)
- [ ] Option B — Les ennemis déclencheurs activent **le même** multiplicateur (ex: “temps”) (impacts : simple)
- [ ] Option C — Un ennemi peut déclencher **plusieurs** multiplicateurs (impacts : très puissant, plus dur à équilibrer)
- [ ] Autre : ____
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q4 — Valeurs des multiplicateurs (x1.2, x1.5, etc.) ?

- [ ] Option A — 3 niveaux : x1.25 / x1.5 / x2.0 (impacts : lisible, impact fort)
- [ ] Option B — 4 niveaux : x1.1 / x1.25 / x1.5 / x2.0 (impacts : progressif)
- [ ] Option C — Formule (ex: dépend de la difficulté) (impacts : plus complexe, nécessite règles additionnelles)
- [ ] Autre : ____
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q5 — Durées des multiplicateurs (secondes) ?

- [ ] Option A — Durée unique pour tous (ex: 5s) (impacts : simple)
- [ ] Option B — Durée par type de multiplicateur (ex: combo 3s, temps 10s, etc.) (impacts : plus contrôlable)
- [ ] Option C — Durée par type d’ennemi déclencheur (impacts : plus de paramètres)
- [ ] Autre : ____
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q6 — Règle de rafraîchissement (si un multiplicateur est redéclenché pendant qu’il est actif) ?

- [ ] Option A — Refresh : le timer repart à la durée max (impacts : encourage focus sur ennemis déclencheurs)
- [ ] Option B — Extend : ajoute un supplément de durée (cap optionnel) (impacts : peut durer très longtemps)
- [ ] Option C — Aucun effet : si actif, un nouveau déclenchement est ignoré (impacts : simple, moins “combo”)
- [ ] Autre : ____
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q7 — Cumul de multiplicateurs (plusieurs actifs en même temps) ?

- [ ] Option A — Un seul multiplicateur actif à la fois (le plus récent remplace) (impacts : simple)
- [ ] Option B — Plusieurs possibles, mais pas du même type (impacts : modéré)
- [ ] Option C — Tous peuvent se cumuler (produit) (impacts : explosif, risque scoring)
- [ ] Autre : ____
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q8 — Interaction multiplicateurs vs bonus (clarifiés dans `clarifications/08-bareme-bonus.md`) ?

- [ ] Option A — Les multiplicateurs s’appliquent sur (ennemis + bonus)
- [ ] Option B — Les multiplicateurs s’appliquent uniquement sur les points “ennemis” (hors bonus)
- [ ] Option C — Les multiplicateurs s’appliquent uniquement sur les bonus
- [ ] Autre : ____
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q9 — Précision temporelle et arrondi (pour tests unitaires) ?

- [ ] Option A — Durées en millisecondes entières, arrondi au ms (impacts : testable)
- [ ] Option B — Durées en secondes, arrondi au 0.1s (impacts : plus simple, moins précis)
- [ ] Option C — Tick-based (ex: 60 fps) (impacts : dépend du framerate)
- [ ] Autre : ____
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

## Options proposées & impacts (récap)

- Un seul multiplicateur à la fois + refresh timer : le plus simple et très testable.
- Multiples cumulables : plus spectaculaire mais augmente fortement la variance et le risque d’exploser le scoring.

## Décision attendue

À partir des réponses, produire une spécification finale :

- la liste des types d’ennemis,
- la table « ennemi → multiplicateur (type + valeur) + durée »,
- les règles de cumul/refresh,
- 3–5 exemples de scénarios (timeline) pour valider par tests.

## Réponses (à compléter)

- Réponses utilisateur :
