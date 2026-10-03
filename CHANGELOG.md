# Changelog

## 0.254.1
- Added a full-screen TCG Pack Ripper+ launch experience with animated pearlescent booster/card stack, real boot stages and progress.
- App UI remains hidden until critical UI, pack runtime, first-frame assets and layout are ready, preventing partially assembled controls on launch.
- Binder, ranked and multiplayer runtime now begin warming behind the launch screen instead of visibly loading after entry.
- Achievement unlock bursts are suppressed during boot reconciliation so old achievements no longer reappear on every reload. Genuine achievements earned after boot still show normally.
- Updated service-worker cache to 0.254.1 and added current launch/reveal assets to core precache, removing stale 0.253.2 shell behavior.
- Pull rates, economy, rewards, collection ownership and save schema remain unchanged.

## 0.254.0
- Full rarity-based pack reveal overhaul with lighting, particles and chase-tier lightning effects.
