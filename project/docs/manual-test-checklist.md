# Checklist de tests manuels — avant démo (MVP)

## 1) But et périmètre

Objectif : vérifier en 5–10 minutes que le jeu est présentable (rendu, contrôles, états, classement, erreurs réseau non bloquantes).

Périmètre : desktop, clavier, audio, API / leaderboard du jour.

## 2) Pré-requis

- Ordinateur desktop avec clavier.
- Un navigateur moderne (Chrome / Edge / Firefox).
- Audio activé (volume non à zéro).
- Lancer l’app en local.

Commandes (depuis `project/`) :

- `bun install`
- `bun run dev`

## 3) Démarrage / chargement

- [ ] Ouvrir l’URL locale fournie par le dev server.
  - Attendu : l’écran d’accueil s’affiche.
- [ ] Vérifier qu’un état de chargement est visible pendant l’initialisation.
  - Attendu : pas d’écran noir “silencieux”.
- [ ] Vérifier le cas “WebGL indisponible”.
  - Attendu : si WebGL ne peut pas démarrer, un message clair s’affiche (pas de jargon), et l’app ne reste pas bloquée sur un écran noir.

## 4) Contrôles (en jeu) + HUD

- [ ] Démarrer une partie.
  - Attendu : rendu 3D visible, HUD lisible.

Déplacement :

- [ ] Déplacer le vaisseau avec les flèches.
  - Attendu : déplacement réactif, sans latence anormale.
- [ ] Déplacer le vaisseau avec WASD.
  - Attendu : mêmes effets que les flèches.

Tir :

- [ ] Tirer avec la barre espace.
  - Attendu : tir déclenché, feedback visuel ; feedback audio si non mute.

## 5) Pause (P)

- [ ] En pleine partie, appuyer une fois sur `P`.
  - Attendu : la partie se met en pause (le jeu est figé).
- [ ] Appuyer une fois sur `P` pour reprendre.
  - Attendu : reprise normale.
- [ ] Maintenir `P` appuyé (ou répéter rapidement).
  - Attendu : pas de clignotement pause/reprise incontrôlé.

## 6) Mute (M)

- [ ] En jeu, appuyer sur `M`.
  - Attendu : les sons sont coupés immédiatement + indication visuelle cohérente.
- [ ] Appuyer à nouveau sur `M`.
  - Attendu : les sons reviennent + indication visuelle cohérente.
- [ ] Maintenir `M` appuyé (ou répéter rapidement).
  - Attendu : pas d’oscillation mute/unmute incontrôlée.

## 7) Fin de partie (game over)

- [ ] Perdre une partie (se faire toucher / condition de fin).
  - Attendu : écran de fin de partie visible avec le score final.
- [ ] Depuis l’écran de fin, choisir l’option de rejouer.
  - Attendu : une nouvelle partie démarre correctement.

## 8) Leaderboard — top 10 du jour

- [ ] Ouvrir l’écran “Classement” / “Leaderboard”.
  - Attendu : la liste du top 10 du jour s’affiche.
- [ ] Vérifier l’affichage de l’identité.
  - Attendu : le pseudo est affiché ; si aucun pseudo, “Anonyme” est affiché.

## 9) Mode “API down” (démo dégradée)

But : s’assurer que la démo reste jouable si l’API est indisponible.

- [ ] Démarrer une partie, puis aller jusqu’à l’écran de fin.
- [ ] Simuler une API indisponible : arrêter le process serveur (terminal) tout en laissant le client ouvert.
  - Attendu : l’app reste utilisable côté client.
- [ ] Tenter d’enregistrer un score.
  - Attendu : un message clair indique que l’enregistrement est impossible.
  - Attendu : l’utilisateur peut rejouer (l’erreur ne bloque pas la navigation).
- [ ] Rétablir l’API (relancer `bun run dev`).
  - Attendu : l’enregistrement refonctionne.

## 10) Notes (problèmes fréquents)

- Si aucun son : vérifier volume système, mute (M), et effectuer une interaction (clic/touche) pour “débloquer” l’audio.
- Si écran noir : vérifier accélération matérielle / drivers GPU / essayer un autre navigateur.
- Si leaderboard vide : vérifier que l’API tourne et qu’au moins un score a été enregistré aujourd’hui.
