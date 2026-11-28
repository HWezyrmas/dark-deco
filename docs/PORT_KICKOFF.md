# Dark Deco: Godot port kickoff (hand-off brief for Claude Code)

Written 28 November 2026, when Hamza decided to start the Godot migration.
This is the first file to read in a new Claude Code session about the port. It says what state the web game is in, what changed since the port plan was written, and exactly what the first sessions do.

**Read in this order:**
1. This file.
2. `docs/GODOT_PORT_PLAN.md`: ground rules, project layout, phases, setup, things Hamza must provide.
3. `docs/DOCUMENTATION.md`: every system in the web game (the thing being ported).
4. `docs/ROADMAP.md`: order of work and the zombie pivot.
5. `CLAUDE.md`: working rules and the most recent system notes (the newest details live there).
6. `data/*.json`: the exported numbers (re-run `node tools/data/export.cjs` if game.js changes).

---

## 1. Decision and status

- **28 Nov 2026, Hamza: start the Godot port now.** The roadmap had the port after Phase 1 playtests and Phase 2 fixes. Phase 2 readability and performance work is largely done (see section 2). Phase 1 playtests with outside pairs have not happened yet; they can still run on the live web build while the port is built, and their findings feed port phase 2.
- **The web build is now the frozen reference.** https://hwezyrmas.github.io/dark-deco/ (repo `HWezyrmas/dark-deco`, branch `main`). Bug fixes only. If something plays differently in Godot, the web build is right unless Hamza says otherwise.
- **New repo for the port:** `HWezyrmas/dark-deco-godot` (layout in the port plan). Hamza creates it (section 5).
- **Story and dialogue are still placeholders.** Port the dialogue system, not the content as canon.
- **Zombie pivot** (Raid + Base modes) is confirmed; it shapes port phases 3 and later, not the parity port.

## 2. What changed in the web game since the port plan was written (port all of it)

All of these are live and described in `CLAUDE.md` (Architecture section) and `docs/DOCUMENTATION.md`.

| Area | What it is now | Where in game.js | Data |
|---|---|---|---|
| Ability paths | Each spec has 3-4 paths of 2-4 abilities; a run follows at most 2. Next step unlocks when the previous ability is level 2. Evolution at level 5 without passives. +30% damage per level. Executioner path abilities x1.45 (`SPECB`). | `PATHS`, `BASICS`, `pathNext`, `genOffers`, `chestOffers`, `cardInfo`, `lvm`, `AP` | `data/ability_paths.json` |
| Level-up and skills UI | Framed tall cards with level pips, the exact next change, the path step; select then Confirm. Skills screen grouped by path. Segmented Rage/Spark and Blood Boil meters, framed ability chips. | `showOffers`, `openSkills`, CSS `#offers.v2` in index.html | Hamza's two reference images (Echo System HUD, Honkai card screen) set the style |
| Pace | Smaller packs (x0.55), tougher normal enemies (HP x1.4), slower walk (x0.85). XP per kill at original values; runs end around level 21-22. | `EPACK`, `ETOUGH`, `EPACE` | `data/pace.json` |
| Executioner E: **Headsman's Throw** (replaces the Judgement Dome) | Hold to charge (1.2 s to full), drag to aim, release. Charge scales range, axe size, damage and the impact radius. The axe flies in an arc and passes through enemies; the impact Executes under 35% and leaves a **lava pool** that is a judgement zone (slow, +30% damage, Execute under 30%, extra Blood Boil). Charging plays the Grand Verdict lift frames 0-4 mapped to the charge; release plays frames 10-12. Charge aura, peak burst, neon trail. | `axeThrow`, `axeAim`, `updLava`, `drawLava`, `drawAxeFlight`, `inJudge`, `AXCH` | `data/headsmans_throw.json`; art `icons/headsman.png`, `ui/sym_throw.png`, `pfx/lavaimp.webp`, `pfx/lavapool.webp`, `fx/axe.png` |
| Berserker | Kill/crowd triggers rescaled to the slower pace. | `AB.blood`, `bloodmoon`, `shout`, `carnage` | |
| Feel (fluidity) | Wider view (345 game px on the short side), sub-pixel camera and enemy motion, hit-stop only on big hits, screen shake only on big moments, casting slows movement only slightly. | `ZOOMV`, `rq()`, `FXF.hs`, `FXF.shake`, `moveChar` | `data/feel.json` |
| Readability | Soft clear zone around your own hero (effects fade there), dark halo and class-coloured ring under your hero, ability effects at 50% alpha, effect and damage-number caps, enemy sprites drawn 25% bigger (hitboxes unchanged). | `effectsL`, `FXME`, `FXQ`, `pfxPush`, `ESZ` | `data/feel.json` |
| **Partner dimming** | On each phone the other hero's effects, numbers, flashes and zooms draw at 35% (bot included), so you see your own abilities clearly. Every effect carries an owner. | `FXO`, `fxTag`, `oa()`, `ALM`, `PFA`, owner in fx messages and in projectile snapshots | `data/feel.json` |
| Performance | World draws straight to the screen canvas; auto quality drops bloom/atmosphere, then effect counts, when fps falls; fps logged per run. | `perfTick`, `AQ`, `render` | `data/feel.json` |
| Effect memory | Effect sheets load on first use and the least recently used are dropped above 140 MB decoded. Loading all 93 at once (~400 MB) made iPhones kill the page around 5 minutes. **In Godot, budget texture memory the same way on mobile.** | `pfxOne`, `PFXU`, `PFXMB` | |
| Run log | Every run saved on the phone, including unfinished runs and frame rate; "Copy test log" on the menu. | `RL` block at the end | |
| Training ground | `?dummy` with a Stress test (every ability evolved, ~70 enemies + boss). | end of game.js | |

**Godot equivalents to plan for (decide in session 1, write the choice into the new repo's README):**
- Pixel look: the web game renders at a fractional game-pixel scale with sub-pixel camera. In Godot use a SubViewport at the game resolution with nearest filtering, camera positions not snapped (or snapped to 1/scale), and the viewport stretched to the screen.
- Partner dimming and the clear zone: an owner id on every effect node; partner effects on their own CanvasLayer (or with `modulate.a = 0.35`); the clear zone as a small shader mask around the local hero.
- Auto quality and memory budget: a quality setting that the frame-time monitor can lower; effects loaded on demand (`ResourceLoader.load_threaded_request`) with an LRU cache.

## 3. Asset inventory (copy into the Godot repo's `assets/`)

| Folder | Size | Notes |
|---|---|---|
| `sprites/` | 0.8 MB | Hero strips, `sprites/<warden|lamp>/<anim>/<dir>.png`. Grand Verdict `warden/grand/east.png` (17 x 128 px, impact frame 12; frames 4-12 have an armour glitch, a fixed strip is pending from Hamza) |
| `enemies/` | 14 MB | Enemy sprites and 8-frame anims |
| `props/`, `floor/`, `sky/` | 8 MB | Rooftop props, tiles, parallax sky |
| `fx/` | 5.6 MB | Classic effect sheets and `fx/axe.png` |
| `pfx/` | 15 MB | 95 PixelFX sheets (`.webp`) + `manifest.json` + MIT `LICENSE.txt`; includes Hamza's `lavaimp`/`lavapool` |
| `icons/`, `ui/` | 12 MB | Ability icons, UI frames, button symbols |
| `title/`, `lobby/`, `portraits/`, `story/`, `intro/` | 53 MB | Title key art and logo (`title/logo.webp`, source `title/src/logo.png`), placeholder story art |
| `art/base/` | 6 MB | Zombie-pivot art for Base mode (ChatGPT batches 1-4, cleaned). See `art/base/README.md` for what is used and missing |
| `proto/base/` | | Base-mode prototype (reference only, not ported as is) |

Not in the repo: the trailers made on 28 Nov (Hamza has the files: `Dark-Deco-Trailer-Take1.mp4`, `Dark-Deco-Trailer-Take3.mp4`, `Dark-Deco-Trailer-HD.mp4`). Keep marketing video out of git.

## 4. First sessions (port plan phase 1: vertical slice)

Session 1, setup (no gameplay yet):
1. Confirm Godot version (latest stable 4.x), pin it in the new repo's README.
2. Create the project layout from the port plan. Add `.gitattributes` with Git LFS for `*.png *.webp *.jpg *.mp3 *.wav` if the repo will exceed ~1 GB later (ask Hamza; GitHub LFS has a free quota).
3. Copy the assets (section 3) and `data/*.json`.
4. Project settings: 2D, nearest filtering, stretch mode for a portrait phone (game resolution about 345 px on the short side, see `data/feel.json`), 60 fps cap, a 30 fps battery saver.
5. A headless check: `godot --headless --import` then run a GUT smoke test, in CI if possible.
6. Write `docs/WEB_PARITY.md` in the new repo: a checklist of every system in section 2 and DOCUMENTATION.md, ticked as each is ported.

Sessions 2+, vertical slice: one rooftop, Warden Executioner + Lamplighter Healer (bot partner), Shadows and Gunmen, basic attack cycles on the beat, Verdict, Headsman's Throw with lava, level-up with paths, 3 minutes of spawns. Compare side by side with the web build at the same moments.

## 5. Hamza: before session 1 (copyable steps)

1. Install Godot on the Mac (one of):
   ```
   brew install --cask godot
   ```
   or download the latest stable Godot 4 (standard, not .NET) from https://godotengine.org/download/macos/
2. Create the empty repo on GitHub: **New repository** → name `dark-deco-godot` → Private → no README → Create.
3. In Claude Code (desktop or https://claude.ai/code), connect both repos: `HWezyrmas/dark-deco` (read) and `HWezyrmas/dark-deco-godot` (write).
4. Start the first session with this prompt:
   ```
   Read docs/PORT_KICKOFF.md in HWezyrmas/dark-deco first, then docs/GODOT_PORT_PLAN.md and docs/DOCUMENTATION.md. We are starting the Godot port today. Do session 1 from PORT_KICKOFF section 4 in the new repo HWezyrmas/dark-deco-godot, and tell me before you need anything from me.
   ```
5. Later needs (art, accounts, devices) are in the port plan's "Things Hamza must provide" table. Claude Code must tell Hamza ahead of time, with copyable steps, whenever one comes up.
