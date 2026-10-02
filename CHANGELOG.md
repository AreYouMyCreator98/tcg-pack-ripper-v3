# Changelog

## 0.251.0 — 2026-10-02

- Hardened modular startup with retryable, versioned UI/runtime loading.
- Kept multiplayer, ranked and Binder artwork outside the startup critical path.
- Added a modular Binder/artwork facade around the legacy V241 cache runtime.
- Added Binder warm-up on first interaction without blocking Rip Packs.
- Added in-browser UI health diagnostics exposed as `TCG_HEALTH`.
- Added UI contract, runtime syntax, runtime-boundary, Binder-artwork and boot-order tests.
- Preserved save schema, pack odds, economy, card ownership and backend data.

## 0.250.0 — 2026-10-02

- Established modular/future-proof source tree around the playable V245-compatible runtime.
- Added central build/config and feature flags.
- Added non-destructive save schema/migration foundation.
- Added asset hashing, runtime integrity checks and Node tests.
- Added backend baseline metadata and dedicated Supabase source folders.
- Added CI checks before deployment.
- Added PWA update signalling and safer runtime chunk timeouts.
- Preserved existing player state format and production backend behavior.
