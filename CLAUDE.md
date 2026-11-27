# Dark Deco: notes for Claude

Two-player online co-op survivors-like for phones (Hamza plays it with his partner). Noir Art Deco rooftops, 12-minute runs.
Live: https://hwezyrmas.github.io/dark-deco/ (GitHub Pages, deployed by Actions on every push to `main`).
**Order of work: `docs/ROADMAP.md`** (zombie pivot, Phase 1 playtests on the web build before the Godot port). Read it first.
Full documentation (gameplay, every system, ability catalog, pipelines, decision log, backlog): `docs/DOCUMENTATION.md`. Read it before bigger changes.

## Working with Hamza
- He tests on an iPhone, mostly away from a computer. Ship to the live site and tell him what to try; he can't run things locally.
- Direct answers, no fluff. When he asks for prompts (PixelLab, image generation) give them in copyable code blocks.
- Standing rule: whenever new abilities are added, give image-generation prompts for every graphic they need (icons, effects).
- Art comes from PixelLab (he generates; uploads are capped at 256x256) and from the PixelFX library (see below).
  Hand-drawn canvas art for big things (weapons, characters) has looked bad; ask him for sprites instead.

## Files
- `index.html`: all CSS, HUD/menu markup, the in-game guide ("Gazette"). Loads `game.js?v=<n>`.
- `game.js`: the whole game in one IIFE `(()=>{'use strict'; ... })();`. Anything appended must go inside, before the final `})();`.
- `dlg.js` dialogue, `intro.js` intro, `title.js` title screen, `icons.js` icon lookup.
- `sprites/<cls>/<anim>/<dir>.png`: horizontal strips of square frames. Must be listed in `SPRHAVE` in game.js or they are not loaded.
- `pfx/*.webp` + `pfx/manifest.json`: baked PixelFX sheets (MIT, see `pfx/LICENSE.txt`). The manifest is also inlined in game.js as `const PFXM=...`.
- `tools/test/`: Playwright scripts (`coop.cjs`, `sweep.cjs`, `sim.cjs`). `tools/pfx/`: effect pipeline. `docs/DOCUMENTATION.md`, `docs/ability-matrix.html`.
- `proto/base/`: base-defense prototype (zombie pivot). `docs/playtest/`: playtest script and findings template. `docs/reviews/`: external product review.
- `v1/`, `v2/`: older prototypes, leave alone. (Hala's Arcade was removed on 2026-11-08; restore it from commit a04d0b9 with `git checkout a04d0b9 -- arcade`.)

## Architecture
- Host-authoritative over PeerJS. The host simulates; the guest renders snapshots and sends inputs.
- `emit(k,...args)` runs `FXF[k](...args)` locally and queues it to the guest. All visible effects go through FXF so both phones see them.
- Snapshot `C` (characters) and `E` (enemies) are positional arrays: append new fields at the END and read them in the guest unpacking line.
- `?local` runs host+guest in two tabs of one browser (BroadcastChannel). `solo` = bot partner; `alone` = one hero ("Bot off").
- Rendering: low-res canvas `LOW` (lg) + emissive `EM` (eg), upscaled pixelated to the screen canvas; `hiQ` draws hero sprites at full res.
  Canvas = 2 pixels per game pixel on 3x phones; the world layers LOW/EM now render at that resolution too (`Q`, set in `resize`; 1 in battery saver) with `lg`/`eg` transformed by Q each frame, and enemy/prop sprites prepared at Q and drawn with explicit sizes. 60 fps cap; `SAVER` battery mode (30 fps, no bloom). Keep full-screen passes to a minimum (phones run hot).
- Fluidity (28 Nov 2026): view is `ZOOMV`=345 game px across the short side (was 300); `PX` is fractional and `Q` = device px / a whole number. Camera and enemy/prop positions snap to 1/Q via `rq()` (sub-pixel motion), not whole game pixels. Hit-stop only for requests >= .05s (Grand Verdict, big hits) and no camera snap during it; `FXF.shake` ignores shakes under 3.5. Casting slows movement less (.8; Verdict .7, Grand .3).
- Readability (28 Nov 2026): effects draw into their own layer (`FXL`/`FXE`, `effectsL`) and a soft hole is cut around your own hero (`FXME`), so you can always see yourself; enemy bullets (`drawEB`) are drawn outside it. Own hero also gets a dark halo and a class-coloured ground ring. `FXQ`=.5, ability-effect cap 70, damage numbers capped at 14 and faded over your hero.
- Combat: one action per hero per beat (`BEAT=.5`), 3-step basic attack cycles (`cmbNext`). Specs: Warden = Berserker / Executioner, Lamplighter = Healer / Firebrand.
- Abilities = weapons in `WDEF` (cls, spec, name, desc, up3, evo); per-ability logic in the `AB` table; levels 1-5 (3 = extra effect, 5 = evolved, no passive needed since 27 Nov).
- **Ability paths** (27 Nov 2026, `PATHS` above `genOffers`): each spec has 3-4 paths of 2-4 abilities; a run follows at most `MAXPATHS`=2. `pathNext` = unlock the next ability once the previous is level 2, else raise the lowest. Level-up offers: next step of each started path, path starts while under 2, one card from basics/passives/mods/team. Basic attacks are in `BASICS`. Level-ups give +30% damage per level (`lvm`). Cards carry lv/nx/path/step fields; the level-up screen is select-then-Confirm (`#lvOk`, tapping the selected card again also confirms; tests double-click). Skills screen groups by path with pips and "next". HUD: segmented Rage/Spark meter and Blood Boil meter, framed ability chips (`.cool` while on cooldown). UI styled after Hamza's references (framed tall cards, banner titles, segmented meters).
- The Divide (T=290 and 515): bridges burn for 35s, heroes split. "Not Without You": each hero holds one Memory per Divide that auto-saves the partner from going down.
- Pace (27 Nov 2026): `EPACK` (pack size x.55), `ETOUGH` (normal enemy HP x1.4), `EPACE` (walk speed x.85) next to `EK`; XP per kill is back to the original values (doubling it made levels come too fast; Hamza 27 Nov), so runs end around level 21-22 instead of 29. Ability effects are faded by `FXQ` (.62) and capped in `pfxPush`; `FXKEEP` lists effects that stay full strength (basic swings, warnings, revives, the `zburst` death burst).
- Zombie-pivot art in the original game: only the scrap pickup sprite (`SCRAP`) and the `zburst` death burst. The ChatGPT props and floor marks were removed (27 Nov): they are isometric and painted, which looks skewed and mushy on the straight-on, low-resolution roofs.
- Executioner: Judgement Dome (27 Nov): enemies may walk into the dome (no more shove); inside they are slowed, take +30% damage, the Executioner executes them under 30% (in `hitE`), kills inside give +2 Blood Boil, Last Rites/Death Knell thresholds +10% inside, Iron Skin recharges 2x inside. Executioner path abilities get x1.45 damage (`SPECB` in `AP`). Blood Boil stacks from kills (cap 50, decays after 6s); Grand Verdict spends them (up to 2.5x damage). Grand Verdict uses `sprites/warden/grand/east.png`.

## Effects (PixelFX)
- `NEWFX` switch (localStorage `dd_fx`, "Effects: New/Classic" button) keeps the classic effects as a fallback.
- `pfxPush(k,x,y,scale,flip,startTime,alpha,rot)` one-shots; `pfxLoop(...)` loops; `swing(k,x,y,sc,angle,delay)` starts a melee effect so its contact frame (`hit` in the manifest) lands `delay` seconds later.
- New sheets: clone https://github.com/patch-gg/pixelfx, `npm install`, add entries to a `tools/pfx/set*.json`, then
  `python3 tools/pfx/render.py tools/pfx/setN.json <pixelfx dir>` and `python3 tools/pfx/process.py tools/pfx/setN.json <pixelfx dir>`,
  then paste `pfx/manifest.json` into `const PFXM=` in game.js. Sheets load lazily, one at a time.
- Avoid side-view effects that paint the stock dummy body; prefer `--no-actor` renders.

## Menu
- Gamified main menu in `#sMenu` (index.html): record strip (`dd_rec`: runs, dawns, best; written in `showEnd`, shown by `recShow` on `go('menu')`), Co-op panel (Host, code + Join), mode tiles (Solo, Training, Heroes, Intro). Button ids are unchanged (`bHost`, `bJoin`, `code`, `bSolo`, `bTrain`, `bGuide`, `bIntro`).
- The menu card covers the middle of the title screen, so tests tap `#title` near the top (`position:{x:190,y:140}`).

## Test pages
- `?fxlab`: effects lab, Classic left vs New right, tap edges to skip.
- `?dummy`: Training ground (also the menu button): pick hero/spec/abilities/level, scarecrow dummies, cooldown/rage toggles.
- `?dummy` **Stress test** toggle: every spec ability evolved, ~70 mixed enemies + the boss (roadmap Phase 1 readability check).
- Run log (`RL` block near the end of game.js): localStorage `dd_log`, last 40 runs; the run in progress is snapshotted to `dd_log_live` every 10s and on app hide, and shows up as "unfinished (app closed)"; hooks `rlStart/rlEv/rlEnd`. Menu "Copy test log" and end-screen "Copy run log" copy a readable summary + RAW JSON. `window.__rl.text()` in scripts.
- `window.__dd` exposes internals (chars, en, T setter, FXF, ...) for scripts.

## Testing and shipping
1. `python3 -m http.server 8767` in the repo root (keep it running).
2. `NODE_PATH=$(npm root -g) node tools/test/coop.cjs` (two-player end to end; must print `ERRORS {"H":[],"G":[]}` and empty MISSING)
   and `node tools/test/sweep.cjs` (menus, guide, all four specs). Screenshots go to `tools/test/out/` (gitignored).
   Balance: `node tools/test/sim.cjs 3 720 '{"warden":"exec","lamp":"heal"}'`.
3. Syntax check: `node -e "new Function(require('fs').readFileSync('game.js','utf8'))"`.
4. Bump the cache-buster: `sed -i -E "s/(game\.js\?v=)[0-9a-z]+/\1$(date +%s)/" index.html`.
5. Commit to `main`, push, and confirm the Pages run succeeded:
   `curl -s "https://api.github.com/repos/HWezyrmas/dark-deco/actions/runs?head_sha=$(git rev-parse HEAD)"`.

## Open items
- **Godot port:** the plan's "Things Hamza must provide" table lists what he has to supply (art, accounts, installs). Tell him ahead of time, with copyable steps, whenever a task will need one.
- **Godot port** (decided 26 Nov 2026, cross-play required): see `docs/GODOT_PORT_PLAN.md`. It starts after roadmap Phases 1-2. Until then the web build takes bug fixes plus Phase 1-2 work (run log, stress scene, readability); no new content. `node tools/data/export.cjs` re-exports the data tables to `data/*.json` for the port.
- Grand Verdict frames 4-12 show him without armor (PixelLab glitch); swap in a regenerated strip when he sends it (17 frames, 128x128, impact on frame 12).
- On hold (roadmap: no new abilities until playtests; new ones must slot into a path): his picks from the "New Spec Abilities to Choose From" doc; build them later with icon prompts.
- **Story and dialogue are placeholders** (intro, prologue, lines, Foreman, portraits, story stills): a test only, to be fully reworked with Hamza. Don't treat them as canon or expand them.
- Base mode and environment art: `docs/art/BASE_ASSETS.md` (ChatGPT prompts 0-46) and `docs/art/CHATGPT_BRIEF.md` (the same list as a self-running brief he uploads to ChatGPT). Hamza sends files named by number; they go in `art/base/`. Tell him which are missing when base or environment work comes up.
- **Zombie pivot** (27 Nov 2026): Raid mode (the current run) + Base mode (prototype in `proto/base/index.html`, standalone, uses repo assets via `../../`). See `docs/ROADMAP.md`.
- Next phase: level design. Real two-phone testing over mobile data is still worth doing.
