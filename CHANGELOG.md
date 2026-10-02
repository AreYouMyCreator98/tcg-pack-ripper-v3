# Changelog

## 0.253.1
- Fixed session value reconciliation so completed openings use resolved market values instead of generation-time $0.10 fallbacks.
- Moved the V253 live HUD out from behind the mobile set shelf and anchored FAST / SESSION / SIR+ below the clock row.
- Changed Reveal All helper copy from `CARDS LEFT` to `TO COLLECT`, matching its behavior of collecting the currently displayed card plus the remainder.
- Unified the mobile pack-complete screen: removed duplicate legacy stat tiles, kept the card fan, added compact XP/card metadata, hid the nav under the summary, and made the summary scroll safely on short screens.
- Reduced Reset Session Stats to a secondary pill action while keeping Open Another as the primary CTA.
- Pull rates, rewards, routing and save schema remain unchanged.

## 0.253.0
- Added modular Pack Engine, generator contract, session tracking, recap and rate snapshot modules.
- Added Reveal 2.0 rarity profiles and card-specific reveal keys.
- Added Fast Reveal mode for shorter hit animations without changing rewards or odds.
- Added guarded Reveal All for 10-pack mode, routing remaining cards exactly once.
- Added session HUD, best-pull recap, rarity breakdown, payment summary and collector streaks.
- Added persistent packs-since-SIR+, packs-since-God-Pack and hit-streak stats.
- Added tiny `runtime/pack-bridge.js`; V253 failures fall back to the proven legacy pack flow.
- Pull-rate constants and save schema remain unchanged.

## 0.252.0
- Replaced legacy Binder artwork facade with real ES-module artwork cache/resolver/queue/database services.
- Added modular Binder renderer, inspector, status/repair UI and pure Binder model.
- Added a tiny lazy-loaded Binder compatibility bridge for existing economy/grading/save hooks.
- Removed `runtime/artwork.js` from all loaded runtime groups.
- Preserved V239 IndexedDB cache keys for existing player artwork caches.
- Added current-page priority, adjacent-page prefetch and idle whole-collection prefetch.
- Added iOS/Android-aware artwork concurrency limits.
- Extracted ranked-frame IMG hydration into a source module.
- Expanded automated coverage from 11 to 19 tests.
- Save schema remains unchanged.

## 0.251.0
- Hardened startup and optional runtime loading.
- Added Binder/artwork facade boundaries and post-migration checks.

## 0.250.0
- Introduced the future-proof modular project structure.
