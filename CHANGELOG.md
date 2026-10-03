# Changelog

## 0.255.1
- Fixed ranked READY on in-app/mobile browsers with direct pointer/touch wiring plus click fallback.
- Added server polling fallback so ready state syncs even when a realtime event is missed.
- Added a standalone MATCH FOUND cinematic before the ready lobby.
- Preserved the full player-banner VS intro after both players lock READY.
- Bumped service-worker cache to force delivery of the ranked-ready fix.

## 0.255.0
- Added a two-player READY gate to ranked Quick Match. Neither player can start the pack until both are ready.
- Added animated ranked VS intros with Profile photo, equipped ranked frame, selectable showcase badges, banner title/style and server-backed ranked record.
- Added a Profile Battle Banner editor with six banner styles, up to three earned showcase badges and record visibility control.
- Added realtime Global Chat with online presence count, unread messages, local mute controls and server-side spam/length limits.
- Ranked W/L/T/RP public identity is now rebuilt from completed matchmaking rooms on the server for cross-device consistency.
- Added server guards so matchmade battle progress/results cannot be submitted before both players are ready.
- Added stale matchmaking cleanup for paired rooms that never ready.
- Existing private battles, direct trades, player market, saves, cards and pack odds are unchanged.
- Restored V254 reveal-profile compatibility metadata used by SIR+ session/streak stats; reveal FX and pull odds are unchanged.
