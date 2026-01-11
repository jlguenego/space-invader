# Prompt — id002 (P1) (S) — Clarifier le barème des bonus (valeurs chiffrées)

## Role

Tu es un Product Owner + Game Designer orienté "règles chiffrées testables", avec une forte rigueur de spécification (règles explicites, cas limites, exemples calculés), afin que l’équipe puisse implémenter le scoring sans décisions arbitraires.

## Objectif

Produire une spécification chiffrée et exploitable du **barème des bonus** du score :

- bonus par **type d’ennemi**,
- bonus de **série de kills (streak)**,
- bonus de **précision**,
  conforme aux docs, et assez précise pour être implémentée et testée.

⚠️ Les docs sources indiquent que les **valeurs exactes** ne sont pas définies aujourd’hui (seulement un ordre de grandeur 1..1000). Il faut donc **obtenir une décision explicite** (via clarifications) avant de figer des chiffres.

## Format de sortie

### Livrable principal (gate obligatoire)

1. Créer un fichier de clarification :

- `clarifications/08-bareme-bonus.md`

2. Le remplir avec :

- contexte + rappel de la todo **id002**,
- **questions fermées** sous forme de QCM à cocher (`- [ ]`),
- options proposées + impacts,
- décision attendue,
- section "Réponses" vide.

### Important (arrêt après le gate)

Après création du fichier `clarifications/08-bareme-bonus.md`, **arrête-toi** et demande explicitement à l’utilisateur de répondre dans ce document.

- Ne crée pas d’implémentation.
- Ne modifie pas d’autres fichiers.
- Ne coche pas la todo.

## Contraintes

- Ne réalise PAS l’implémentation du scoring.
- Ne choisis pas de chiffres "au hasard" : tout chiffre doit être **décidé** via réponses utilisateur dans la clarification.
- Respecte le cadre :
  - Bonus existants : **type d’ennemi / streak / précision**.
  - Ordre de grandeur : **1 à 1000 points** selon importance.
- Utilise du Markdown simple, lisible, sans jargon.
- Chaque question doit proposer :
  - au moins 2 options + `Autre : ____`,
  - l’option `- [ ] Laisse l’IA choisir pour toi (avec justification)`,
  - si pertinent `- [ ] Je ne sais pas / besoin d’une recommandation`.

## Contexte technique

### Tâche TODO

- ID : **id002**
- Priorité : **(P1)**
- Taille : **(S)**
- Titre : **Clarifier le barème des bonus (valeurs chiffrées)**
- But : éviter un scoring arbitraire non conforme.
- Livrable : table de valeurs (type d’ennemi, streak, précision) + exemples.
- Acceptation : les règles du score peuvent être implémentées sans “choisir au hasard”.
- Dépendances : Aucune.

### Docs sources (sources de vérité)

- `docs/04-specification-fonctionnelle.md` → section **7.3 Bonus (définition)** + **8. Points à préciser**
- `docs/03-user-stories-et-flux.md` → section **Rappel des décisions** + **Points à préciser plus tard**

### Clarifications existantes utiles

- `clarifications/04-details-score-et-sensibilite.md` (acte déjà : types de bonus + ordre de grandeur + multiplicateurs).

### Impacts / tâches aval

- Cette clarification débloque la tâche de scoring (ex: id029) et doit rester compatible avec la notion de **multiplicateurs** (définis séparément dans id003).

## Étapes proposées (à exécuter)

1. Lire les sections pertinentes des docs sources.
2. Constater explicitement ce qui est **déjà acté** vs **manquant** (valeurs chiffrées).
3. Créer `clarifications/08-bareme-bonus.md` en utilisant le template ci-dessous.
4. S’arrêter et demander les réponses utilisateur dans ce fichier.

## Template à utiliser — `clarifications/08-bareme-bonus.md`

```md
# Clarification 08 — Barème des bonus (valeurs chiffrées)

- Date : YYYY-MM-DD
- Contexte : todo **id002** + `docs/04-specification-fonctionnelle.md` (Bonus) + `docs/03-user-stories-et-flux.md` (Points à préciser)
- Statut : OUVERTE

## Contexte

Les bonus existent et sont actés au niveau conceptuel (type d’ennemi / streak / précision), mais les **valeurs exactes** ne sont pas chiffrées. Cette clarification vise à figer un barème testable et non arbitraire.

## Questions (à cocher)

### Q1 — Liste des types d’ennemis à considérer pour le bonus « type d’ennemi » ?

- [ ] Option A — 1 seul type (tous les ennemis identiques) → bonus type d’ennemi désactivé (impacts : scoring plus simple)
- [ ] Option B — 3 types (Standard / Rapide / Tank) (impacts : barème simple, variété)
- [ ] Option C — 4 types (Standard / Rapide / Tank / Elite) (impacts : plus de variété, tuning plus long)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q2 — Bonus « type d’ennemi » : forme du barème ?

- [ ] Option A — Bonus fixe par kill selon le type (ex: +X points) (impacts : simple, stable)
- [ ] Option B — Pourcentage du score de base de l’ennemi (ex: +Y%) (impacts : scalable, nécessite score de base)
- [ ] Option C — Les 2 (score de base + bonus fixe) (impacts : plus de paramètres)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q3 — Bonus « type d’ennemi » : valeurs chiffrées (doivent rester dans 1..1000)

> Si Option A de Q2 : propose un tableau type→points.

- [ ] Option A — Standard: **_ ; Rapide: _** ; Tank: **_ ; (Elite: _**)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q4 — Bonus « streak » : comment définir la série ?

- [ ] Option A — Kills consécutifs sans se faire toucher
- [ ] Option B — Kills consécutifs sans rater un tir
- [ ] Option C — Kills consécutifs dans une fenêtre de temps (ex: 5s)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q5 — Bonus « streak » : structure du barème ?

- [ ] Option A — Paliers (ex: 3/5/10 kills) avec bonus fixe par palier
- [ ] Option B — Bonus croissant par kill au-delà d’un seuil (ex: à partir de 3)
- [ ] Option C — Bonus exponentiel doux (impacts : spectaculaire, plus risqué à équilibrer)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q6 — Bonus « streak » : valeurs chiffrées (1..1000)

- [ ] Option A — Paliers : (3 kills: **_), (5 kills: _**), (10 kills: **_), (20 kills: _**)
- [ ] Option B — Seuil=**_ ; +_** points par kill au-delà du seuil
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q7 — Bonus « précision » : comment mesurer la précision ?

- [ ] Option A — hits / shots (impacts : standard)
- [ ] Option B — hits / shots avec exclusions (ex: tirs "charge" ignorés)
- [ ] Option C — précision par fenêtre glissante (ex: 30 derniers tirs) (impacts : dynamique)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q8 — Bonus « précision » : quand attribuer le bonus ?

- [ ] Option A — À la fin de partie seulement (impacts : simple)
- [ ] Option B — Périodiquement (ex: toutes les 30s) (impacts : plus fun, plus complexe)
- [ ] Option C — À chaque kill (impacts : complexe, potentiellement trop généreux)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q9 — Bonus « précision » : barème chiffré (1..1000)

- [ ] Option A — Paliers (ex: ≥90%: **_ ; ≥80%: _** ; ≥70%: \_\_\_ ; sinon 0)
- [ ] Option B — Formule linéaire (ex: maxBonus=\_\_\_ ; bonus = clamp(0..maxBonus, f(précision)))
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q10 — Règles transverses : cumul et limites ?

- [ ] Option A — Les bonus s’additionnent (type + streak + précision)
- [ ] Option B — Certains bonus exclusifs (à préciser)
- [ ] Option C — Cap global par ennemi / par tick / par partie (à préciser)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q11 — Interaction bonus vs multiplicateurs (définis ailleurs) ?

- [ ] Option A — Les multiplicateurs s’appliquent sur (ennemis + bonus)
- [ ] Option B — Les multiplicateurs s’appliquent uniquement sur les points "ennemis" (hors bonus)
- [ ] Option C — Les multiplicateurs s’appliquent uniquement sur les bonus
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

## Options proposées & impacts (récap)

- Barème simple (peu de types/paliers) : implémentation rapide, équilibrage facile.
- Barème riche (plus de types/formules) : plus expressif, mais tuning et tests plus longs.

## Décision attendue

À partir des réponses, produire un barème final :

- tableaux/fonctions chiffrées,
- 3–5 exemples de calcul (scénarios) pour vérifier la cohérence.

## Réponses (à compléter)

- Réponses utilisateur :
```

## Critères de validation

- `clarifications/08-bareme-bonus.md` existe et suit le template (QCM + impacts + section Réponses vide).
- Les questions couvrent au minimum : type d’ennemi, streak, précision, cumul, interaction avec multiplicateurs.
- Le document cite explicitement les docs sources et la todo `id002`.
- Le prompt s’arrête après création du fichier et demande à l’utilisateur de répondre.

## Clôture

Quand (et seulement quand) :

- les réponses utilisateur sont renseignées,
- un barème final chiffré + exemples est validé,
- et que tout est cohérent avec les docs,

alors l’IA qui exécute réellement la todo pourra cocher **uniquement** la case de **id002** dans `TODO.md` (`- [ ]` → `- [x]`). Ne coche aucune autre tâche.
