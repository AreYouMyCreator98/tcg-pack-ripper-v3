# TCG Pack Ripper+ — V252

The playable game is now maintained as a modular Vite/static-Pages project while preserving compatibility with existing player saves and the current Supabase backend.

## V252 focus
Binder and card artwork are now real source modules rather than another compatibility patch inside the legacy artwork runtime. `runtime/artwork.js` remains in the repository only as rollback/reference history and is not loaded by the game.

### Binder architecture
- `src/screens/binder/` — renderer, inspector, model, status and bridge adapter.
- `src/artwork/` — card identity, IndexedDB cache, resolver, priority queue and high-level cache service.
- `public/runtime/binder-bridge.js` — the only Binder-specific bridge into legacy state/economy/grading globals.

The Binder opens from local game state immediately. Visible art is highest priority, neighboring pages prefetch next, and the rest of the collection caches during idle time.

## Development
```bash
npm install
npm run dev
```

## Validation
```bash
npm run test
npm run validate
```

## Production
GitHub Actions builds Vite `dist/` and deploys it to GitHub Pages. `npm run deploy:static` also creates a directly servable static build for diagnostics.

Existing save schema: **1**. V252 does not migrate or reset existing player data.
