# Refactor roadmap

1. Keep 0.250.x behavior-compatible with the current live game.
2. Extract account/cloud save code from `runtime/core.js` into `src/state` + `src/services`.
3. Extract Binder/artwork into `src/screens/binder` and `src/artwork`.
4. Extract pack generation/pull rates into `src/systems/packs` + `src/data` with deterministic tests.
5. Extract multiplayer into `src/multiplayer` and mirror Supabase migrations/functions in `supabase/`.
6. Move collection/master-set calculations to Web Workers where useful.
7. Replace compatibility runtime chunks until `public/runtime/` can be removed.
8. Generate Capacitor Android/iOS projects only after the web build is stable.
