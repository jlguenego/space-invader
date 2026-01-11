# Clarification 09 — Multiplicateurs : déclencheurs & durées

- Date : 2026-01-11
- Contexte : TODO **id003 (P1) (S) — Clarifier les déclencheurs/durées des multiplicateurs**
- Docs sources :
  - `docs/04-specification-fonctionnelle.md` (7.4 Multiplicateurs + 8 Points à préciser)
  - `docs/03-user-stories-et-flux.md` (Décisions actées + Points à préciser)
  - `clarifications/04-details-score-et-sensibilite.md` (multiplicateurs : types + principes)
- Statut : CLOTUREE

## Contexte

Les multiplicateurs existent (combo / temps / difficulté / streak). Ils sont déclenchés par la mort de certains types d’ennemis et durent un temps prédéterminé, sans plafond. Cette clarification fixe des règles chiffrées et non ambiguës pour permettre une implémentation et des tests unitaires.

## Réponses (utilisateur)

- Q1 à Q9 : **Laisse l’IA choisir pour toi (avec justification)**
- Intention : **règles simples et intuitives**

## Décision / Spécification finale

### Résumé des choix (avec justification)

- Types d’ennemis : 4 types Standard / Rapide / Tank / Elite (simple, assez varié)
- Déclenchement : tous les types peuvent déclencher, avec effets différents (intuitif et toujours utile)
- Mapping : table fixe (1 type d’ennemi → 1 type de multiplicateur), déterministe et testable
- Valeurs : 4 niveaux (x1.10 / x1.25 / x1.50 / x2.00), lisible et progressif
- Durées : par type de multiplicateur (contrôle fin, reste simple)
- Refresh : le timer repart à la durée pleine (règle simple)
- Cumul : un seul multiplicateur actif à la fois (le plus récent remplace), limite la variance
- Application : le multiplicateur s’applique sur (points ennemis + bonus)
- Temps/arrondi : durées en millisecondes entières ; scoring arrondi à l’entier inférieur

### Définitions (pour implémentation & tests)

- Temps : `nowMs` est un entier (millisecondes) basé sur un temps monotone côté moteur.
- Actif : un multiplicateur est actif si `nowMs < activeUntilMs`.
- Ordre des opérations sur un kill `onEnemyKilled(enemyType, eventPoints, nowMs)` :
  1. Calculer les points du kill courant avec le multiplicateur déjà actif (s’il existe).
  2. Puis activer/remplacer le multiplicateur déclenché par l’ennemi tué (il s’applique aux kills suivants).

### Table « ennemi → multiplicateur (type + valeur) + durée »

| Ennemi tué | Multiplicateur activé | Valeur |    Durée |
| ---------- | --------------------- | -----: | -------: |
| Standard   | streak                |  x1.10 |  6000 ms |
| Rapide     | combo                 |  x1.25 |  4000 ms |
| Tank       | temps                 |  x1.50 | 10000 ms |
| Elite      | difficulte            |  x2.00 |  8000 ms |

### Règles de cumul / refresh

- Un seul multiplicateur actif.
- Déclencher un multiplicateur pendant qu’un autre est actif remplace immédiatement l’actif, et fixe `activeUntilMs = nowMs + durationMs`.
- Déclencher le même multiplicateur pendant qu’il est actif refresh (timer repart).
- Plafond : aucun (comme acté).

### Règle de scoring (testable)

- `eventPoints` = points du kill avant multiplicateur (points ennemis + bonus).
- Si un multiplicateur est actif : `scoredPoints = floor(eventPoints * multiplierValue)`.
- Sinon : `scoredPoints = eventPoints`.

### Exemples (scénarios timeline)

1. Activation puis application sur le kill suivant

- t=0ms : kill Rapide, eventPoints=100, aucun multiplicateur actif → +100, active combo x1.25 jusqu’à 4000ms
- t=500ms : kill Standard, eventPoints=100, combo actif → +125, remplace par streak x1.10 jusqu’à 6500ms

2. Remplacement (pas de cumul)

- t=0ms : kill Tank, eventPoints=200 → +200, active temps x1.50 jusqu’à 10000ms
- t=2000ms : kill Elite, eventPoints=200, temps actif → +300, remplace par difficulte x2.00 jusqu’à 10000ms
- t=3000ms : kill Rapide, eventPoints=80, difficulte actif → +160, remplace par combo x1.25 jusqu’à 7000ms

3. Expiration

- t=0ms : kill Standard, eventPoints=50 → +50, active streak x1.10 jusqu’à 6000ms
- t=6000ms : kill Standard, eventPoints=50, streak expiré → +50, active streak x1.10 jusqu’à 12000ms

4. Refresh du même multiplicateur

- t=0ms : kill Tank, eventPoints=100 → +100, active temps x1.50 jusqu’à 10000ms
- t=9500ms : kill Tank, eventPoints=100, temps actif → +150, refresh temps x1.50 jusqu’à 19500ms

5. Interaction bonus (multiplicateur sur total)

- Hypothèse : un kill vaut base 60 + bonus 40 = eventPoints=100
- t=0ms : kill Elite → +100, active difficulte x2.00 jusqu’à 8000ms
- t=1000ms : kill Rapide, eventPoints=100 → +200 (bonus inclus)
