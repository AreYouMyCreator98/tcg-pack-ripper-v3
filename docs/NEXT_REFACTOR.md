# Recommended next refactor order

The migration makes the project maintainable immediately without changing game behavior. Replace legacy chunks in this order:

1. Binder/artwork (`runtime/artwork.js`) -> `src/systems/binder/*`
2. Profile/ranked (`runtime/ranked.js`) -> modern profile components
3. Multiplayer (`runtime/multiplayer.js`) -> Supabase service + room modules
4. Pack animation controllers (`runtime/packs.js`) -> animation state machine
5. Core game (`runtime/core.js`) last

Do not change the persisted state schema until a versioned migration layer exists.
