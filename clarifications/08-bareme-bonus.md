# Clarification 08 — Barème des bonus (valeurs chiffrées)

- Date : 2026-01-11
- Contexte : todo **id002** + `docs/04-specification-fonctionnelle.md` (Bonus) + `docs/03-user-stories-et-flux.md` (Points à préciser)
- Statut : CLOTUREE

## Contexte

Les bonus existent et sont actés au niveau conceptuel (type d’ennemi / streak / précision), mais les **valeurs exactes** ne sont pas chiffrées. Cette clarification vise à figer un barème testable et non arbitraire.

## Questions (à cocher)

### Q1 — Liste des types d’ennemis à considérer pour le bonus « type d’ennemi » ?

- [ ] Option A — 1 seul type (tous les ennemis identiques) → bonus type d’ennemi désactivé (impacts : scoring plus simple)
- [ ] Option B — 3 types (Standard / Rapide / Tank) (impacts : barème simple, variété)
- [ ] Option C — 4 types (Standard / Rapide / Tank / Elite) (impacts : plus de variété, tuning plus long)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q2 — Bonus « type d’ennemi » : forme du barème ?

- [ ] Option A — Bonus fixe par kill selon le type (ex: +X points) (impacts : simple, stable)
- [ ] Option B — Pourcentage du score de base de l’ennemi (ex: +Y%) (impacts : scalable, nécessite score de base)
- [ ] Option C — Les 2 (score de base + bonus fixe) (impacts : plus de paramètres)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q3 — Bonus « type d’ennemi » : valeurs chiffrées (doivent rester dans 1..1000)

> Si Option A de Q2 : propose un tableau type→points.

- [ ] Option A — Standard: **_ ; Rapide: _** ; Tank: **_ ; (Elite: _**)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q4 — Bonus « streak » : comment définir la série ?

- [ ] Option A — Kills consécutifs sans se faire toucher
- [ ] Option B — Kills consécutifs sans rater un tir
- [ ] Option C — Kills consécutifs dans une fenêtre de temps (ex: 5s)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q5 — Bonus « streak » : structure du barème ?

- [ ] Option A — Paliers (ex: 3/5/10 kills) avec bonus fixe par palier
- [ ] Option B — Bonus croissant par kill au-delà d’un seuil (ex: à partir de 3)
- [ ] Option C — Bonus exponentiel doux (impacts : spectaculaire, plus risqué à équilibrer)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q6 — Bonus « streak » : valeurs chiffrées (1..1000)

- [ ] Option A — Paliers : (3 kills: **_), (5 kills: _**), (10 kills: **_), (20 kills: _**)
- [ ] Option B — Seuil=**_ ; +_** points par kill au-delà du seuil
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q7 — Bonus « précision » : comment mesurer la précision ?

- [ ] Option A — hits / shots (impacts : standard)
- [ ] Option B — hits / shots avec exclusions (ex: tirs "charge" ignorés)
- [ ] Option C — précision par fenêtre glissante (ex: 30 derniers tirs) (impacts : dynamique)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q8 — Bonus « précision » : quand attribuer le bonus ?

- [ ] Option A — À la fin de partie seulement (impacts : simple)
- [ ] Option B — Périodiquement (ex: toutes les 30s) (impacts : plus fun, plus complexe)
- [ ] Option C — À chaque kill (impacts : complexe, potentiellement trop généreux)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q9 — Bonus « précision » : barème chiffré (1..1000)

- [ ] Option A — Paliers (ex: ≥90%: **_ ; ≥80%: _** ; ≥70%: \_\_\_ ; sinon 0)
- [ ] Option B — Formule linéaire (ex: maxBonus=\_\_\_ ; bonus = clamp(0..maxBonus, f(précision)))
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q10 — Règles transverses : cumul et limites ?

- [ ] Option A — Les bonus s’additionnent (type + streak + précision)
- [ ] Option B — Certains bonus exclusifs (à préciser)
- [ ] Option C — Cap global par ennemi / par tick / par partie (à préciser)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q11 — Interaction bonus vs multiplicateurs (définis ailleurs) ?

- [ ] Option A — Les multiplicateurs s’appliquent sur (ennemis + bonus)
- [ ] Option B — Les multiplicateurs s’appliquent uniquement sur les points "ennemis" (hors bonus)
- [ ] Option C — Les multiplicateurs s’appliquent uniquement sur les bonus
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

## Options proposées & impacts (récap)

- Barème simple (peu de types/paliers) : implémentation rapide, équilibrage facile.

## Décision attendue

À partir des réponses, produire un barème final :

- tableaux/fonctions chiffrées,
- 3–5 exemples de calcul (scénarios) pour vérifier la cohérence.

## Réponses (à compléter)

- Réponses utilisateur :

Fais quelque chose de simple. Une fois les tests utilisateurs finals realise, on se permettra eventuellement de revenir pour faire evoluer ces aspects.

## Décision (IA) — barème simple et testable

Tu as coché “Laisse l’IA choisir pour toi (avec justification)” sur toutes les questions, avec la contrainte “faire quelque chose de simple”.

Objectifs de ce barème :

- Très peu de paramètres.
- Bonus bornés et lisibles (1..1000), sans formules complexes.
- Implémentation directe dans un module de scoring (fonctions pures) + tests unitaires simples.

### Choix retenus (résumé)

- Types d’ennemis : 3 types (Standard / Rapide / Tank).
- Bonus type d’ennemi : bonus fixe par kill selon le type.
- Bonus streak : paliers simples (bonus déclenché quand on atteint certains comptes de kills consécutifs).
- Bonus précision : paliers à la fin de partie.
- Cumul : tous les bonus s’additionnent.
- Interaction multiplicateurs : le multiplicateur (défini dans id003) s’applique aux points “par kill” (ennemi + bonus type + bonus streak) ; le bonus de précision (fin de partie) n’est pas multiplié.

## Barème final (valeurs chiffrées)

### 1) Bonus « type d’ennemi » (par kill)

Ajouter ce bonus à chaque ennemi détruit, en plus des points “ennemi tué” (définis ailleurs).

| Type d’ennemi | Bonus (points) |
| ------------- | -------------: |
| Standard      |            +10 |
| Rapide        |            +25 |
| Tank          |            +50 |

Règle de mapping : si un autre type apparaît plus tard, le mapper à l’un de ces 3 (par défaut : Standard).

### 2) Bonus « streak » (paliers)

Définition de la streak : **nombre d’ennemis tués consécutivement sans que le joueur ne soit touché**.

- `streakKills` démarre à 0 en début de partie.
- À chaque kill : `streakKills += 1`.
- Si le joueur est touché (perte de vie, hit confirmé, etc.) : `streakKills = 0`.

Bonus accordé **au moment où on atteint** les paliers suivants :

| Palier atteint (streakKills) | Bonus (points) |
| ---------------------------: | -------------: |
|                            3 |            +50 |
|                            5 |           +100 |
|                           10 |           +250 |
|                           20 |           +600 |

Notes :

- Les bonus de paliers sont **cumulatifs** sur une même partie (ex: atteindre 10 implique avoir aussi eu 3 et 5 auparavant).
- Si, exceptionnellement, plusieurs paliers sont franchis sur un même tick/frame, attribuer tous les paliers nouvellement atteints.

### 3) Bonus « précision » (fin de partie)

Définition de la précision :

- `shots` = nombre de projectiles tirés par le joueur (un tir = un projectile spawn).
- `hits` = nombre de projectiles joueur qui touchent un ennemi.
- Si `shots = 0`, alors précision = 0%.
- Sinon, précision = `hits / shots`.

Le bonus de précision est calculé **une seule fois à la fin de la partie** :

| Précision | Bonus (points) |
| --------: | -------------: |
|     ≥ 90% |           +500 |
|     ≥ 80% |           +250 |
|     ≥ 70% |           +100 |
|     < 70% |             +0 |

## Cumul et ordre de calcul (règles transverses)

### Par kill

Quand un ennemi est détruit, calculer les points “par kill” ainsi :

1. `pointsKillBase` = points attribués pour “ennemi tué” (hors scope de cette clarification).
2. `pointsKillBonusEnemyType` = bonus type d’ennemi (table ci-dessus).
3. `pointsKillBonusStreak` = bonus de palier si (et seulement si) un palier est atteint sur ce kill.
4. `pointsKillSubtotal = pointsKillBase + pointsKillBonusEnemyType + pointsKillBonusStreak`.
5. `pointsKillFinal = floor(pointsKillSubtotal * activeMultiplier)` où `activeMultiplier` vient des règles de multiplicateurs (id003). S’il n’y a pas de multiplicateur actif, `activeMultiplier = 1`.

### Fin de partie

- Calculer `bonusPrecision` selon les paliers.
- Ajouter `bonusPrecision` **tel quel** au score final (non multiplié).

## Exemples (bonus uniquement, puis exemple complet)

### Exemple A — Bonus type d’ennemi

- Kill d’un Tank : bonus = +50.
- Kill d’un Rapide : bonus = +25.

### Exemple B — Bonus streak (paliers)

Si le joueur fait 6 kills consécutifs sans être touché :

- Au 3e kill : +50
- Au 5e kill : +100
- Total bonus streak sur cette séquence = +150

### Exemple C — Bonus précision (fin de partie)

- `shots = 120`, `hits = 102` → précision = 85% → bonus précision = +250.

### Exemple D — Exemple complet (illustratif)

Hypothèses illustratives (uniquement pour l’exemple) :

- `pointsKillBase` (ennemi tué) = 100 quel que soit le type.
- `activeMultiplier = 2` sur un kill (multiplicateur temporaire).

Kill n°5 d’une streak (donc palier 5 atteint), sur un Tank :

- Base : 100
- Bonus type Tank : +50
- Bonus streak palier 5 : +100
- Subtotal : 250
- Multiplicateur x2 : `floor(250 * 2) = 500`

## Conséquences attendues / why this is “simple”

- 3 tables (type, streak, précision), pas de formule d’équilibrage.
- Streak basée sur “être touché” (évite d’introduire une règle de miss/timeout).
- Bonus de précision à la fin (évite un recalcul constant).
