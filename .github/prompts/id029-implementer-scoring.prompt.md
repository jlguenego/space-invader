# Prompt — id029 — Implémenter le scoring (ennemis + bonus + multiplicateurs)

## Role

Tu es un ingénieur TypeScript senior spécialisé en gameplay (boucle de jeu), code testable (fonctions pures) et règles de scoring. Tu implémentes de bout en bout (code + tests + validations) dans un monorepo Bun.

## Objectif

Implémenter le scoring du jeu conforme aux règles MVP :

- score calculé à partir des ennemis tués + bonus + multiplicateurs,
- score affiché en jeu et score final,
- règles chiffrées provenant des clarifications.

⚠️ **Gate obligatoire (blocage actuel)** : les règles chiffrées existent pour les bonus/multiplicateurs, mais il manque une décision explicite et non arbitraire pour :

1. les **points de base “ennemi tué”** (`pointsKillBase` / “points ennemis”),
2. la **définition opérationnelle des types d’ennemis dans le code** (comment un ennemi du monde est typé Standard/Rapide/Tank/Elite afin de déclencher bonus et multiplicateurs).

Tant que ces points ne sont pas actés, tu dois d’abord créer un fichier de clarifications (voir section « Clarifications (gate) ») et **t’arrêter**.

## Format de sortie

### Phase A — Clarifications (obligatoire avant tout code)

- Créer le fichier : `clarifications/14-score-base-et-types-ennemis.md`
- Remplir le document avec le template fourni ci-dessous (questions en QCM).
- **S’arrêter** après création et demander à l’utilisateur de cocher/compléter les réponses.

### Phase B — Implémentation (uniquement après réponses utilisateur)

Quand les réponses sont disponibles dans le fichier de clarifications :

- Créer/mettre à jour un module de scoring (fonctions pures) côté client.
- Brancher le scoring à la boucle de jeu (réception d’événements “ennemi détruit”, tirs, hit joueur, fin de partie).
- Mettre à jour les tests unitaires Bun, et ajuster les tests existants si nécessaire.

## Contraintes

- Ne pas inventer de règles : tout doit être basé sur les docs et clarifications.
- TypeScript partout, style cohérent avec le repo.
- Préférer des **fonctions pures** et des états explicites (objets immutables) pour le scoring.
- Respecter les règles existantes :
  - Bonus (barème) : `clarifications/08-bareme-bonus.md`
  - Multiplicateurs : `clarifications/09-multiplicateurs-declencheurs-durees.md`
  - Arrondi : `floor` pour l’application des multiplicateurs.
  - Durées en millisecondes entières, temps monotone `nowMs`.
- Ne pas coupler la simulation de jeu aux re-renders React.
- Ajouter/adapter des tests Bun (`bun:test`) au plus près des fonctions.

## Contexte technique

### Tâche TODO

- ID : **id029**
- Priorité : **(P0)**
- Taille : **(M)**
- Titre : Implémenter le scoring (ennemis + bonus + multiplicateurs)
- Dépendances : **id026**, **id002**, **id003**

### Docs sources (sources de vérité)

- `docs/04-specification-fonctionnelle.md` → sections “Score / Bonus / Multiplicateurs”.
- `clarifications/08-bareme-bonus.md` → barème bonus (type d’ennemi, streak, précision) + règles de cumul.
- `clarifications/09-multiplicateurs-declencheurs-durees.md` → table des multiplicateurs (type/valeur/durée) + règle d’ordre (application sur kill courant puis activation pour kills suivants).

### État du code (points d’attention)

- Le moteur actuel `project/client/src/game/game-engine.ts` gère un score via `scorePerSecond` (placeholder) et **ne consomme pas** les événements `ENEMY_DESTROYED`.
- Le monde `project/client/src/game/world-types.ts` expose `WorldEvent` (dont `ENEMY_DESTROYED`), mais :
  - `Enemy` ne porte pas de `type` (Standard/Rapide/Tank/Elite) → indispensable pour bonus/multiplicateurs.
  - aucun événement explicite pour :
    - “le joueur a tiré” (pour `shots`),
    - “le joueur a été touché” (pour reset de streak).
- La simulation `project/client/src/game/world-sim.ts` :
  - décrémente `playerLives` quand un projectile ennemi touche le vaisseau, mais n’émet pas d’événement correspondant.

## Clarifications (gate obligatoire)

Créer `clarifications/14-score-base-et-types-ennemis.md` avec le contenu suivant, puis s’arrêter.

---

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
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q2 — Si points variables par type (si Q1 Option C), valeurs proposées ?

- [ ] Standard = 60, Rapide = 80, Tank = 120, Elite = 150 (progressif)
- [ ] Standard = 50, Rapide = 75, Tank = 125, Elite = 200 (Elite très rentable)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q3 — Quels types d’ennemis existent réellement dans le gameplay MVP ?

- [ ] Option A — 1 type (Standard seulement) (implémentation plus simple, mais multiplicateurs moins variés)
- [ ] Option B — 3 types (Standard / Rapide / Tank) (aligné bonus, Elite absent)
- [ ] Option C — 4 types (Standard / Rapide / Tank / Elite) (aligné multiplicateurs)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q4 — Répartition des types d’ennemis dans la formation (si plusieurs types) ?

- [ ] Option A — Par rangée (row) : rangée 0=Standard, 1=Rapide, 2=Tank, 3=Elite (déterministe, facile à tester)
- [ ] Option B — Par colonne (col) (plus varié visuellement)
- [ ] Option C — Aléatoire mais seedée (plus complexe)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q5 — Bonus “type d’ennemi” (clarif 08) ne définit que Standard/Rapide/Tank : que faire pour Elite ?

- [ ] Option A — Elite utilise le bonus Standard (+10)
- [ ] Option B — Elite utilise le bonus Tank (+50)
- [ ] Option C — Ajouter un bonus Elite spécifique (⚠️ hors clarif 08)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q6 — Streak (bonus) : “être touché” correspond à quel événement concret ?

- [ ] Option A — À chaque fois qu’un projectile ennemi touche le vaisseau (quand `playerLives` diminue)
- [ ] Option B — À chaque fois que le vaisseau subit n’importe quel dommage (futur)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

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

(Section à compléter par l’utilisateur)

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
