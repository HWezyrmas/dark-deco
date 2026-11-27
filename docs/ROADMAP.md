# Dark Deco: roadmap

Agreed 27 Nov 2026, from the product review in `docs/reviews/2026-11-27-product-review.pdf`, scaled to the real team: Hamza, his partner and Claude.
This file sets the order of work. `docs/GODOT_PORT_PLAN.md` has the port details; where they disagree, this file wins on order.

## Decisions
- **Zombie pivot (confirmed 27 Nov 2026).** The game becomes a co-op zombie game with two modes:
  - **Raid:** the current survivors-like run, reworked as trips into the city or dungeons to gather supplies.
  - **Base:** build defences with those supplies, then fight the hordes with the Warden, the Lamplighter and what you built.
  Look: same pixel-art style, swapped to an overgrown, abandoned city. Base mode is a calm builder (losing a night costs part of the base, not the run).
- **Prototype:** `proto/base/` (live at https://hwezyrmas.github.io/dark-deco/proto/base/). Warden only, placeholder art (enemies tinted as zombies, props as buildings). Self-contained; reads assets from the repo root.
- **No new abilities** until playtests show the current ones are understood and balanced (review: scope control).
- **Before the port:** Phases 1 and 2 run on the web build. This is an exception to "web is bug fixes only": logging, the stress scene and readability fixes are allowed, new content is not.

## What the review gets right / what we cut
- Kept: validate the co-op loop with real pairs, combat readability under max effects, prove each co-op mechanic changes decisions, replayability (scored 6.5, the weakest area), balance tests, parity-first port.
- Cut to size: 3 to 5 test pairs (not 5 to 10), a copyable run log (not dashboards), one-page findings (not formal reports). Store/launch workstreams wait for Phase 6.
- Changed by the pivot: the Foreman and the single rooftop map stop being the focus; replayability comes from the two modes plus varied raid locations.

---

## Phase 1: Evidence (web build, now)
Goal: learn from real players before porting. No new content.
- [x] Run log: every run is recorded on the phone (specs, result, time, level, downs, revives, Divides, Not Without You saves, ability and card picks, boss time, damage dealt/taken/healed, whether they played again). Menu and end screen have **Copy run log**; Hamza pastes it to Claude. Code: `RL` block in game.js, localStorage `dd_log`.
- [x] Max-effects stress scene: Training ground **Stress** toggle floods real enemies plus the boss with every chosen ability evolved, to check readability on a phone.
- [x] Playtest kit: `docs/playtest/SCRIPT.md` (how to run a session), `docs/playtest/FINDINGS.md` (one page to fill per session).
- [x] Base prototype linked from the main menu so testers can try it.
- [ ] **Hamza:** run 3 to 5 pairs, at least 2 pairs of first-time players. Each session: one or two raids, then the base demo. Paste the run log and notes to Claude.
- [ ] **Claude:** turn the logs and notes into a prioritised findings list (comprehension, balance, friction, technical, engagement).

## Phase 2: Core fixes (web build)
- Readability: one visual priority order (telegraphs, own hero, partner state, revive prompts first; ambient effects last); fade effects in crowds; reduced-effects setting; tune shake, damage numbers and telegraph contrast. Re-check with the stress scene.
- Co-op contracts: one paragraph per mechanic (Bond, Rekindle, twin altars, Divide, Not Without You, Duo cards, partner abilities): what it should make players do, and whether the sessions showed it. Cut or redesign what players ignored.
- Fix the top Phase 1 findings.

## Phase 3: Godot port, parity first
- Port plan phases 1 and 2, with the Phase 2 readability rules built in.
- Automated tests: damage, cards, Divide, Not Without You, revives, saves. Headless balance matrix for all four specs (win rate, time to kill, damage taken, healing, revives, pick rates, boss time).
- Performance on Hamza's iPhone and a mid-range Android.

## Phase 4: The two modes (replayability)
- Raid mode: several locations with their own layouts, hazards and enemy pools; randomised events instead of the fixed schedule; extract-or-push-on choice; loot carried home.
- Base mode: building, horde nights, gates that change per night, raid loot as the economy.
- Co-op that matters: natural roles in the base (repair vs hold the breach), split routes in raids. Must stay fair when one player is new or drops out.
- Enemies and bosses: a clear counter for each zombie type, phased bosses that test skill, not just damage.

## Phase 5: Story and online
- Story session with Hamza (now a zombie story), then dialogue and art lists with prompts.
- Cross-play online: relay, reconnect grace period, what happens when the host leaves, pause on app switch.

## Phase 6: Retention and launch
- Meta progression: the base itself carries over (unlocks, upgrades, cosmetics, challenge modifiers) without making new players feel weak.
- Music and sound, settings and accessibility, controller/keyboard/touch.
- Store pages, privacy policy, AI-art disclosure, crash reporting, accounts (see the port plan's "Things Hamza must provide").

## Done when (from the review)
- Core loop: a first-time pair understands the goal with little help, both make real decisions, at least one memorable teamwork moment, and most pairs choose another run.
- Readability: in a max-effects fight testers can spot telegraphs, boss attacks, their hero, the partner's state, revive chances and objectives.
- Co-op: every key co-op mechanic visibly changes decisions; no hero or spec is stuck in a passive role.
- Replayability: runs differ in encounters and decisions, not only upgrade rolls.
- Balance: all four specs viable, no dominant build without a trade-off, changes backed by data.
- Technical: Godot parity, tests pass, frame rate and heat budget met on target phones, reconnect cases handled.
