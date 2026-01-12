# Clarification 14 — Score : points de base et types d’ennemis

- Date : 2026-01-12
- Contexte : todo **id029** — Implémenter le scoring (ennemis + bonus + multiplicateurs)
- Docs sources :
  - `docs/04-specification-fonctionnelle.md`
  - `clarifications/08-bareme-bonus.md`
  - `clarifications/09-multiplicateurs-declencheurs-durees.md`

## Contexte

Le barème des bonus et la table des multiplicateurs sont actés, mais l’implémentation nécessite :

- une valeur non arbitraire pour les **points de base par ennemi tué** (les “points ennemis”),
- une règle claire pour **typer les ennemis** dans le code (Standard/Rapide/Tank/Elite), afin de :
  - appliquer le bonus “type d’ennemi”,
  - déclencher les multiplicateurs selon le type.

## Questions (à cocher)

### Q1 — Points de base par ennemi tué (points “ennemis”) ?

- [ ] Option A — **100** points par ennemi tué (simple, lisible)
- [ ] Option B — **50** points par ennemi tué (score global plus bas)
- [ ] Option C — Points variables par type (nécessite un tableau)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q2 — Si points variables par type (si Q1 Option C), valeurs proposées ?

- [ ] Standard = 60, Rapide = 80, Tank = 120, Elite = 150 (progressif)
- [ ] Standard = 50, Rapide = 75, Tank = 125, Elite = 200 (Elite très rentable)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q3 — Quels types d’ennemis existent réellement dans le gameplay MVP ?

- [ ] Option A — 1 type (Standard seulement) (implémentation plus simple, mais multiplicateurs moins variés)
- [ ] Option B — 3 types (Standard / Rapide / Tank) (aligné bonus, Elite absent)
- [ ] Option C — 4 types (Standard / Rapide / Tank / Elite) (aligné multiplicateurs)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q4 — Répartition des types d’ennemis dans la formation (si plusieurs types) ?

- [ ] Option A — Par rangée (row) : rangée 0=Standard, 1=Rapide, 2=Tank, 3=Elite (déterministe, facile à tester)
- [ ] Option B — Par colonne (col) (plus varié visuellement)
- [ ] Option C — Aléatoire mais seedée (plus complexe)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q5 — Bonus “type d’ennemi” (clarif 08) ne définit que Standard/Rapide/Tank : que faire pour Elite ?

- [ ] Option A — Elite utilise le bonus Standard (+10)
- [ ] Option B — Elite utilise le bonus Tank (+50)
- [ ] Option C — Ajouter un bonus Elite spécifique (⚠️ hors clarif 08)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

### Q6 — Streak (bonus) : “être touché” correspond à quel événement concret ?

- [ ] Option A — À chaque fois qu’un projectile ennemi touche le vaisseau (quand `playerLives` diminue)
- [ ] Option B — À chaque fois que le vaisseau subit n’importe quel dommage (futur)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [x] Laisse l’IA choisir pour toi (avec justification)

## Options proposées & impacts (résumé)

- Rangées typées (Option A de Q4) : déterministe, facile à implémenter et tester.
- 4 types (Option C de Q3) : permet d’utiliser la table multiplicateurs telle quelle.

## Décision attendue

Avoir des règles explicites pour :

- points de base par kill,
- types d’ennemis existants,
- mapping de la formation vers les types,
- traitement du type Elite vis-à-vis du bonus type.

## Réponses

Tu as coché **"Laisse l’IA choisir pour toi (avec justification)"** pour toutes les questions.

Objectif retenu : **règles simples, déterministes, testables**, et cohérentes avec :

- `clarifications/08-bareme-bonus.md` (bonus type/streak/précision)
- `clarifications/09-multiplicateurs-declencheurs-durees.md` (multiplicateurs, dont Elite)

## Décision (IA) — points de base + types d’ennemis

### Q1 — Points de base par ennemi tué

- Décision : **100 points** par ennemi tué.
- Justification : valeur lisible, compatible avec les bonus (10..600) et les multiplicateurs (jusqu’à x2) sans exploser trop vite.

### Q2 — Points variables par type

- Décision : **N/A** (Q1 n’est pas “points variables”).

### Q3 — Types d’ennemis du MVP

- Décision : **4 types** : Standard / Rapide / Tank / Elite.
- Justification : aligne le gameplay avec la table de multiplicateurs (`clarifications/09-...`) sans devoir “dégrader” la règle.

### Q4 — Règle de typing dans la formation

- Décision : **par rangée (row)** (déterministe).
- Mapping :
  - row 0 → Standard
  - row 1 → Rapide
  - row 2 → Tank
  - row 3 → Elite
  - si `rows > 4` : `row >= 3` → Elite
- Justification : simple, stable, facile à tester.

### Q5 — Bonus “type d’ennemi” pour Elite

- Décision : **Elite utilise le bonus Tank** (+50).
- Justification : la clarification 08 fige 3 bonus (Standard/Rapide/Tank) ; mapper Elite sur Tank est simple et cohérent (ennemi “dur/valeur élevée”).

### Q6 — Streak : définition de “être touché”

- Décision : **à chaque fois qu’un projectile ennemi touche le vaisseau** (quand `playerLives` diminue).
- Justification : événement déjà présent implicitement dans la sim (décrément de vies) ; rend la streak testable sans inventer d’autres sources de dégâts.

---

## Critères de validation

### Phase A (clarifications)

- Le fichier `clarifications/14-score-base-et-types-ennemis.md` existe et contient les questions en QCM ci-dessus.
- Tu t’arrêtes après création et tu demandes à l’utilisateur de répondre.

### Phase B (implémentation, après réponses)

- Le scoring “en jeu” incrémente sur les kills selon : points ennemis + bonus (type + streak) puis multiplicateur actif (arrondi `floor`).
- Le multiplicateur respecte l’ordre : appliquer l’actif sur le kill courant, puis activer/remplacer celui déclenché par l’ennemi tué (pour les kills suivants).
- Le bonus précision est calculé à la fin de partie et ajouté tel quel (non multiplié).
- Tests unitaires couvrent :
  - barème bonus type/streak/précision,
  - logique de multiplicateur (activation, expiration, remplacement, refresh, ordre sur kill),
  - au moins 2 scénarios de bout en bout.
- `bun test` passe.

## Clôture

- Ne cocher la case de **id029** dans `TODO.md` (`- [ ]` → `- [x]`) **que si** tous les livrables et critères de validation Phase B sont satisfaits et que les tests passent.
- Ne cocher aucune autre tâche.
