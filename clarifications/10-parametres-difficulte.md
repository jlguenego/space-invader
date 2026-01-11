# 10 — Paramètres difficulté (facile / normal / difficile)

## Contexte

Cette clarification répond à la todo **id004** : “Clarifier les paramètres des difficultés (facile/normal/difficile)”.

Docs sources à respecter :

- docs/04-specification-fonctionnelle.md (section « 5.1 Difficulté »)
- docs/02-parcours-et-experience.md (section « Cadre d’expérience (acté) »)

Objectif : décider des **paramètres chiffrés** (MVP) pour rendre la difficulté observable et testable.

## Questions

### Q1 — Quels paramètres de difficulté retient-on pour le MVP ? (2 à 4 max)

- [ ] Vitesse de déplacement des ennemis (multiplicateur)
- [ ] Fréquence des tirs ennemis (cooldown ou tirs/seconde)
- [ ] Nombre de vies du joueur
- [ ] Vitesse des projectiles ennemis
- [ ] Santé / points de vie des ennemis (ex: 1 hit vs 2 hits)
- [ ] Autre : \_\_\_\_
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q2 — Valeurs de référence : on définit « normal » comme base 1.0 ?

- [ ] Oui : normal = 1.0 et facile/difficile sont des multiplicateurs
- [ ] Non : je veux des valeurs absolues (ex: px/s, tirs/s, etc.)
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q3 — Vitesse ennemis (si retenu)

Choisir un triplet (facile / normal / difficile) :

- [ ] 0.85 / 1.00 / 1.15 (écart léger)
- [ ] 0.75 / 1.00 / 1.30 (écart marqué)
- [ ] 0.70 / 1.00 / 1.40 (très marqué)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q4 — Fréquence tirs ennemis (si retenu)

Exprimer comme multiplicateur d’un cooldown (plus petit = plus difficile) :

- [ ] 1.20 / 1.00 / 0.85 (léger)
- [ ] 1.35 / 1.00 / 0.75 (marqué)
- [ ] 1.50 / 1.00 / 0.70 (très marqué)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q5 — Vies joueur (si retenu)

- [ ] 5 / 3 / 2
- [ ] 4 / 3 / 2
- [ ] 3 / 3 / 2 (facile identique mais autres paramètres changent)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q6 — Objectif d’équilibrage (global)

- [ ] Facile : accessible, pardonne les erreurs
- [ ] Normal : challenge “par défaut”
- [ ] Difficile : exigeant, top10 plus rare
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

## Options proposées (impacts)

- Vitesse ennemis ↑ : pression permanente, difficulté très lisible
- Tirs ennemis ↑ : augmente le besoin d’esquive, peut devenir punitif
- Vies joueur ↓ : raccourcit la durée moyenne d’une partie
- Vitesse projectiles ↑ : réduit le temps de réaction (attention lisibilité)
- Ennemis à 2 hits : augmente la durée d’engagement, peut rallonger les vagues

## Décision attendue

À minima :

1. Liste des paramètres retenus (2–4)
2. Valeurs (ou multiplicateurs) par difficulté

## Réponses

(À compléter par l’utilisateur)

- Q1 : Laisse l’IA choisir → 3 paramètres retenus : vitesse ennemis, fréquence tirs ennemis, vies joueur.
- Q2 : Laisse l’IA choisir → normal = base 1.0 et facile/difficile sont des multiplicateurs (sauf vies = valeur entière).
- Q3 : Laisse l’IA choisir → 0.75 / 1.00 / 1.30.
- Q4 : Laisse l’IA choisir → 1.35 / 1.00 / 0.75.
- Q5 : Laisse l’IA choisir → 4 / 3 / 2.
- Q6 : Laisse l’IA choisir →
  - Facile : accessible, pardonne les erreurs.
  - Normal : challenge “par défaut”.
  - Difficile : exigeant, top10 plus rare.

## Décision (actée)

Paramètres retenus (MVP) :

1. **Vitesse ennemis** (multiplicateur appliqué aux vitesses ennemies)
2. **Fréquence tirs ennemis** (multiplicateur appliqué au cooldown de tir ennemi ; plus petit = plus difficile)
3. **Vies joueur** (entier)

Justification (résumé) :

- 3 paramètres suffisent pour un impact global **très observable** sans sur-complexifier.
- Les multiplicateurs (base normal = 1.0) rendent les règles faciles à implémenter/tester.
- Les vies sont un levier de “pardon” simple à comprendre côté UX.

## Spécification résultante (à remplir après réponses)

| Paramètre                    | Facile | Normal | Difficile | Commentaire                                                                                          |
| ---------------------------- | -----: | -----: | --------: | ---------------------------------------------------------------------------------------------------- |
| Vitesse ennemis (mult)       |   0.75 |   1.00 |      1.30 | Facile laisse plus de temps de réaction ; difficile augmente la pression (lisible).                  |
| Cooldown tirs ennemis (mult) |   1.35 |   1.00 |      0.75 | Facile réduit la densité de projectiles ; difficile augmente la menace (attention à rester lisible). |
| Vies joueur                  |      4 |      3 |         2 | Paramètre “pardon” direct : plus de marge en facile, plus punitif en difficile.                      |
