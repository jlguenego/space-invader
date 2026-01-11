# Prompt — **id004** **(P1)** _(S)_ Clarifier les paramètres des difficultés (facile/normal/difficile)

## Role

Tu es **Product Owner + Game Designer** (Space Invaders) avec une sensibilité **gameplay** (équilibrage), **UX** (lisibilité) et **implémentabilité** (paramètres chiffrés testables).

## Objectif

Produire une **spécification chiffrée** des paramètres de difficulté du MVP (facile / normal / difficile), afin que l’implémentation côté jeu puisse être faite **sans choix arbitraires**.

- Difficulté = impact global sur le jeu (exemples attendus dans les docs : vitesse ennemis, fréquence tirs, nombre de vies, etc.)
- Le résultat doit être **observable** : changer de difficulté modifie clairement le comportement.

## Format de sortie

⚠️ **Gate clarifications obligatoire (arrêt de l’exécution)**

1. Créer un fichier de clarifications :

- `/clarifications/10-parametres-difficulte.md`

2. **S’arrêter immédiatement après** et demander explicitement à l’utilisateur de répondre dans ce fichier.

- Ne pas poursuivre la todo id004 tant que les réponses ne sont pas renseignées.

> Note : la todo id004 vise à “Clarifier les paramètres”. Ici, les docs sources ne donnent pas les valeurs chiffrées ; on doit donc solliciter une décision documentée via clarifications.

## Contraintes

- Ne pas implémenter le jeu.
- Ne pas inventer des règles “au hasard” : toute valeur doit être **décidée** (par l’utilisateur ou via l’option “Laisse l’IA choisir”).
- Rester MVP : **2–4 paramètres** maximum suffisent si bien choisis, mais ils doivent être concrets et testables.
- Les paramètres doivent être formulés de manière compatible avec un futur module de règles (ex: `difficultyPresets`), et utilisables autant côté gameplay que tests.
- Ne pas modifier ni cocher `TODO.md` dans cette passe (tu t’arrêtes après le fichier de clarifications).

## Contexte technique

### Tâche source

- **id004** **(P1)** _(S)_ Clarifier les paramètres des difficultés (facile/normal/difficile)
  - **But :** traduire “impact global” en paramètres de jeu concrets.
  - **Livrable :** tableau des paramètres par difficulté (ex: vitesse ennemis, cadence tirs, vies…).
  - **Acceptation :** un changement de difficulté entraîne un comportement observable et cohérent.
  - **Dépendances :** Aucune.

### Docs sources (sources de vérité)

- `docs/04-specification-fonctionnelle.md` → section “5.1 Difficulté” (définit les niveaux mais pas les valeurs)
- `docs/02-parcours-et-experience.md` → “Cadre d’expérience (acté)” (donne l’intention : impact global)

## Étapes proposées (dans cette exécution)

1. Créer `/clarifications/10-parametres-difficulte.md` avec le template ci-dessous.
2. Indiquer clairement à l’utilisateur qu’il doit répondre.
3. **Stop**.

## Template à écrire dans `/clarifications/10-parametres-difficulte.md`

```markdown
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
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q2 — Valeurs de référence : on définit « normal » comme base 1.0 ?

- [ ] Oui : normal = 1.0 et facile/difficile sont des multiplicateurs
- [ ] Non : je veux des valeurs absolues (ex: px/s, tirs/s, etc.)
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q3 — Vitesse ennemis (si retenu)

Choisir un triplet (facile / normal / difficile) :

- [ ] 0.85 / 1.00 / 1.15 (écart léger)
- [ ] 0.75 / 1.00 / 1.30 (écart marqué)
- [ ] 0.70 / 1.00 / 1.40 (très marqué)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q4 — Fréquence tirs ennemis (si retenu)

Exprimer comme multiplicateur d’un cooldown (plus petit = plus difficile) :

- [ ] 1.20 / 1.00 / 0.85 (léger)
- [ ] 1.35 / 1.00 / 0.75 (marqué)
- [ ] 1.50 / 1.00 / 0.70 (très marqué)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q5 — Vies joueur (si retenu)

- [ ] 5 / 3 / 2
- [ ] 4 / 3 / 2
- [ ] 3 / 3 / 2 (facile identique mais autres paramètres changent)
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

### Q6 — Objectif d’équilibrage (global)

- [ ] Facile : accessible, pardonne les erreurs
- [ ] Normal : challenge “par défaut”
- [ ] Difficile : exigeant, top10 plus rare
- [ ] Autre : \_\_\_\_
- [ ] Je ne sais pas / besoin d’une recommandation
- [ ] Laisse l’IA choisir pour toi (avec justification)

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

- Q1 :
- Q2 :
- Q3 :
- Q4 :
- Q5 :
- Q6 :

## Spécification résultante (à remplir après réponses)

| Paramètre | Facile | Normal | Difficile | Commentaire |
| --------- | -----: | -----: | --------: | ----------- |
| ...       |    ... |    ... |       ... | ...         |
```

## Critères de validation

Pour cette exécution (gate) :

- [ ] Le fichier `/clarifications/10-parametres-difficulte.md` est créé avec le template.
- [ ] L’IA s’arrête et demande explicitement des réponses utilisateur.

## Clôture (pour l’exécution complète de la todo plus tard)

Quand (et seulement quand) la clarification est répondue et qu’une table finale est produite (et éventuellement répercutée dans la doc si demandé), alors :

- Cocher la case de **id004** dans `TODO.md` : `- [ ]` → `- [x]`.
- Ne cocher aucune autre tâche.
