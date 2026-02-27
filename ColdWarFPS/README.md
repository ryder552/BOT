# Operation Red Winter (Prototype)

A browser-based 3D FPS prototype inspired by Cold War aesthetics, including:

- Loading screen and full-screen main menu
- Playable FPS movement/combat loop with blood hit effects
- Friends panel (add codenames)
- Server browser panel
- Credits + XP economy UI
- Season pass purchase simulation (prototype only; no real transaction processing)

## Run

```bash
cd ColdWarFPS
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Notes

This is a prototype scaffold, not a production-ready full multiplayer game. Networked matchmaking, authoritative servers, anti-cheat, account systems, and compliant payment processing would require a dedicated backend and significantly more implementation work.
