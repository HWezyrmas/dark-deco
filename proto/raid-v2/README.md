# Dark Deco — Raid 2.0 experimental build

This is an isolated comparison prototype. It does not replace or modify the production game.

## Open the build

Development preview:
https://raw.githack.com/HWezyrmas/dark-deco/dark-deco-2.0/proto/raid-v2/index.html

The preview service may show a one-time confirmation before serving HTML. This is a third-party development preview, not the production GitHub Pages host.

## Compare against Version A

- Version A (current live game): https://hwezyrmas.github.io/dark-deco/
- Version B (experimental Raid 2.0): use the preview URL above.
- Keep the same two players, phones, and approximate session length where possible.
- Try each version before discussing preferences. Alternate which version is played first between pairs.
- Record: time to understand the objective, teamwork moments, missed attacks/telegraphs, confusion, enjoyment, and whether they want another run.

## Current prototype scope

- Mobile-first browser canvas with touch movement and keyboard controls.
- Warden and Lamplighter stand-ins, automatic close-range attacks, dash, enemy wind-up telegraphs, health/down states, Bond and Rekindle.
- Scavenging drops, a supply-cache push/extract decision, escalating enemy pressure, and a run summary.
- Host/join room flow using the repository's PeerJS client; multiplayer needs real two-phone testing before it is considered reliable.
- Art is deliberately placeholder geometry at this stage. It is a gameplay experiment, not a final visual replacement.

## Known limitations / not yet implemented

- The new prototype is not feature-parity with the full current Raid.
- It does not yet reuse the full sprite/ability catalogue, four specialisations, complete enemy roster, original boss/event schedule, or full progression systems.
- The Base prototype remains separate and unchanged.
- Multiplayer reconnect, host migration, mobile backgrounding, and network-loss handling are not implemented.
- Treat balance, enemy pressure, and run duration as provisional tuning assumptions.

## Safety boundary

All changes for this experiment belong on `dark-deco-2.0`. Do not merge to `main` or deploy over the live game until Hamza explicitly approves the comparison results.
