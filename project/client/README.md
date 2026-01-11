# client

Front-end React.

## Outillage

- Build/dev server : **Vite**
- Gestion deps/scripts : **Bun 1.3.5** (verrouillée au niveau repo)

## Organisation (cible)

- `src/ui/` : écrans, overlays, HUD
- `src/game/` : boucle de jeu, règles, input, scoring
- `src/render/` : rendu Three.js (scène/caméra/mesh)
- `src/audio/` : Howler (SFX, mute)
- `src/services/` : appels HTTP vers l’API (`/api/...`)
- `src/storage/` : persistance navigateur (localStorage)

## Assets

- `public/assets/` : sons (mp3/ogg), textures, modèles (si besoin)
