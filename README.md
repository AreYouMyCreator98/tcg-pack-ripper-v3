# TCG Pack Ripper+ — modular/future-proof build

Version **0.250.0**.

This repository keeps the proven V245-compatible game runtime playable while providing the structure needed to develop it safely as a real web app.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production validation

```bash
npm run release:check
```

## Important folders

- `src/` — all new development
- `public/runtime/` — compatibility runtime inherited from the single-file game
- `public/assets/` — real cacheable image/audio assets
- `supabase/` — backend migration/function home
- `tests/` — automated regression/integrity tests
- `scripts/` — build/asset/release tooling
- `docs/` — architecture and release notes
- `legacy/` — rollback reference only

The production account/save backend remains Supabase and existing player progress is intentionally preserved.
