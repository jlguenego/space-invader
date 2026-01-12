# Clarifications — Assets audio mp3/ogg (id033)

## Contexte

La todo **id033** demande d’intégrer des assets audio **mp3 + ogg** côté front pour rendre audibles les sons clés (tir, impact/explosion, game over), via Howler.

Docs sources :

- /docs/05-decisions-structurantes.md → D-15
- /docs/03-user-stories-et-flux.md → US-05

## Questions

- Q1 — Source des assets audio ?

  - [x] Je fournis moi-même les fichiers mp3/ogg (et leurs noms) à placer dans `project/client/public/assets/audio/`
  - [ ] Utiliser un pack d’assets explicitement libre de droits que je fournis (fichiers inclus dans le repo)
  - [ ] Laisse l’IA choisir pour toi (avec justification)
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Autre : \_\_\_\_

- Q2 — Nommage des fichiers (recommandation : un fichier par SFX, avec mp3+ogg pour le même son) ?

  - [x] Conserver une convention dérivée des clés SfxKey (ex: `player-shot.(mp3|ogg)`)
  - [ ] Je fournis ma propre convention de noms
  - [ ] Laisse l’IA choisir pour toi (avec justification)
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [ ] Autre : \_\_\_\_

- Q3 — Ajout d’un document de licence/crédits pour les sons ?
  - [ ] Oui — ajouter `project/client/public/assets/audio/ATTRIBUTION.md`
  - [ ] Non
  - [ ] Laisse l’IA choisir pour toi (avec justification)
  - [ ] Je ne sais pas / besoin d’une recommandation
  - [x] Autre : Ce sont MES fichiers que j'ai cree moi-meme. Je veux une licence open source attachee, mais qui respecte mon nom (Jean-Louis GUENEGO).

## Options proposées (si pertinent) + impacts

- Fournir les fichiers : implémentation rapide, aucun risque de droits.
- Laisser l’IA choisir : nécessite une validation explicite de la source/licence.

## Décision attendue / critères de décision

- Les sons doivent être utilisables en prod (droits clairs) et compatibles desktop.

## Réponses

### Tableau des fichiers à fournir (mp3 + ogg)

Placer les sons dans : `project/client/public/assets/audio/`

| Clé (`SfxKey`)    | Fichiers à fournir (mp3 + ogg)                | Événement qui déclenche le son                                            |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| `ui-click`        | `ui-click.mp3` + `ui-click.ogg`               | Clic “valider / action principale” dans l’UI (bouton, item de menu, etc.) |
| `ui-back`         | `ui-back.mp3` + `ui-back.ogg`                 | Action “retour / annuler / fermer” dans l’UI                              |
| `player-shot`     | `player-shot.mp3` + `player-shot.ogg`         | Tir du joueur (touche Espace) quand un tir est effectivement émis         |
| `enemy-explosion` | `enemy-explosion.mp3` + `enemy-explosion.ogg` | Destruction d’un ennemi (impact final / explosion)                        |
| `game-over`       | `game-over.mp3` + `game-over.ogg`             | Passage à l’état “Game Over”                                              |

### Licence / attribution

Tu as indiqué que ce sont tes fichiers et que tu veux une licence open source attachée avec ton nom (Jean-Louis GUENEGO).

Proposition : ajouter un fichier `project/client/public/assets/audio/ATTRIBUTION.md` (ou `LICENSE.txt`) qui précise la licence choisie + le crédit.

(à compléter)

---

Après réponse dans ce fichier (ou assets ajoutés), tu peux reprendre l’exécution de id033.
