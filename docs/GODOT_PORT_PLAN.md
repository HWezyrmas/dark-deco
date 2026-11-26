# Dark Deco: Godot port plan

**Goal:** move Dark Deco from the browser prototype to **Godot 4**, so the game can grow a **storyline and real levels**, then ship on **Steam, the App Store and Google Play** with **cross-play** (PC and phones in the same game).

**Decided (26 Nov 2026):**
- Engine: Godot 4, 2D, keeping the current pixel art and effects. 3D characters are a later art swap, not part of the port.
- Cross-play between Steam and phones: yes.
- **Story and dialogue are placeholders.** The web game's intro, prologue, dialogue lines, the Foreman, the story stills and the portraits were a test and will be fully reworked. Port the dialogue *system* (box, portraits, host-driven pages, triggers) but not the *content* as canon; use the current lines only as stand-in test data. The real story is written with Hamza in phase 3.
- Order: port, then build the level and story tools, then online play, then stabilise and launch. The web version at https://hwezyrmas.github.io/dark-deco/ stays live as the reference build (bug fixes only, no new features).

Read with `docs/DOCUMENTATION.md`, which describes every system being ported.

---

## Ground rules for the port

1. **Parity before improvement.** Port the game as it plays today. If something feels different from the web version, that is a port bug. New features wait until phase 2 is done.
2. **Separate the simulation from the drawing.** All game rules live in plain scripts that know nothing about nodes or sprites (`scripts/sim/`). Scenes and nodes only display the state and play effects (`scripts/view/`). This is what makes host/guest networking, bots, tests and later 3D art all possible.
3. **Data, not code, for content.** Abilities, enemies, events, levels and dialogue come from data files. Adding a level or a story beat should never need new code.
4. **Host-authoritative, always.** One machine runs the simulation; the other sends inputs and draws snapshots. Even offline play goes through the same path (a local "transport"), so online play is not a retrofit.
5. **Phone first.** Every milestone is checked on an iPhone and a mid-range Android, not only on PC.

---

## Project layout (new repo: `HWezyrmas/dark-deco-godot`)

```
project.godot
data/                 JSON exported from the web game (tools/data/export.cjs) and new content data
  abilities.json  classes.json  spec_kits.json  passives.json  mods.json  team_cards.json  duos.json
  enemies.json  meta.json  pfx_manifest.json
  levels/             one file per level: layout scene, duration, timeline, waves, boss, divides, story beats
  dialogue/           one file per scene of dialogue
assets/               copied from the web repo: sprites/ enemies/ props/ floor/ sky/ pfx/ icons/ ui/ title/ lobby/ portraits/ story/
scenes/
  main.tscn  menu.tscn  lobby.tscn  run.tscn  hud.tscn  levelup.tscn  end.tscn  dialogue.tscn
  levels/             one .tscn per level (TileMapLayer rooftops, bridges, spawn zones, trigger areas)
scripts/
  sim/                rules only: world.gd, hero.gd, enemy.gd, abilities/*.gd, cards.gd, events.gd, divide.gd, story_flags.gd
  view/               drawing: hero_view.gd, enemy_view.gd, fx.gd (PixelFX player), camera.gd, hud.gd
  net/                transport.gd (interface), local_transport.gd, relay_transport.gd, steam_invites.gd, snapshot.gd
  story/              dialogue_runner.gd, triggers.gd
tools/                import scripts (pfx manifest -> SpriteFrames), headless balance sim
tests/                GUT unit tests for the simulation
```

---

## Phase 0: data out of the web game (done)

- `tools/data/export.cjs` in the web repo writes the game's tables to `data/*.json`: classes, spec kits, all 50 abilities with descriptions and levels, ability cooldown bases and colours, passives, skill mods, team and duo cards, enemy names and base health, run timings (720 s run, 0.5 s beat, elites at 240/480, Divides at 290/515 for 35 s, boss at 660, Muse/Broker events), and the PixelFX manifest.
- Re-run it whenever the web game's numbers change: `node tools/data/export.cjs`.
- Still in code and to be ported by hand: per-ability behaviour (`AB` table and the weapon branches), enemy AI, spawn rules, the Divide, Not Without You, Blood Boil.

## Phase 1: Godot vertical slice

Tasks:
- Create the Godot 4 project and repo; copy assets; set pixel-perfect settings (nearest filtering, integer scaling, low internal resolution upscaled like the web game).
- Import pipeline: a tool script that turns `pfx/manifest.json` + `.webp` sheets into SpriteFrames, keeping `hit` times for melee sync; hero strips into AnimatedSprite2D frames.
- One rooftop from the current map as a TileMapLayer, the floating joystick and skill buttons, the smoothed camera with look-ahead.
- The Warden (Berserker) with beat combat (one action per 0.5 s beat), the 3-hit Fury Strikes cycle with its PixelFX swings and hit-stop, Heroic Leap, shadows chasing and dying, XP gems.

Done when: on your iPhone and on PC, moving and fighting feels the same as the web version side by side.

## Phase 2: full parity (offline, with the bot)

Tasks:
- Both heroes, all four specs and their kits (Verdict and Grand Verdict with the PixelLab slam animation, Dome, Step, Solar Lance, Ward, Flashfire, Kindle, Meteor, Sunburst, Bladestorm, Reckless Charge), resources (Rage, Spark, Blood Boil).
- All 50 abilities with levels 3 and 5; level-up cards (new, upgrade, passive, mod, team, duo), Muse gifts, Broker pacts.
- All six enemy types with their telegraphs, the Gatekeepers and the Foreman.
- Altars and twin altars, guarded chests, hearts, Bond and Rekindle, down/revive/out, the Divide and Not Without You, dawn victory.
- Bot partner, effects (New and Classic), atmosphere (fog, storm, dawn light, bats), HUD, menus, lobby, record strip, Training ground, and the dialogue system (current prologue lines as placeholder test data only).
- Balance check: a headless simulation of bot runs matching the web `sim.cjs` results.

Done when: a full 12-minute solo run with the bot plays start to dawn on phone and PC, and the balance numbers match the web game.

## Phase 3: level and story framework (the reason for the port)

The web game has one map and a timeline hard-coded in `game.js`. Here it becomes content.

**Levels**
- A level is a scene (`scenes/levels/*.tscn`) plus a data file (`data/levels/*.json`).
- The scene holds the art and geometry: TileMapLayers for roofs, bridges and walls, props, spawn zones (named Marker2D/Area2D), event points (altar spots, chest spots, boss entrance), and named bridges that a Divide can burn.
- The data file holds the rules: duration, win condition (survive until dawn, beat a boss, escort, hold points), enemy pools and pacing over time, scheduled events (Muse, Broker, elites, Divides, boss), modifiers (darkness, rain, narrow roofs), and which story beats play where.
- A level select and progression: finishing a level unlocks the next; endless mode stays as the current 12-minute run.

**Story (full rework, from scratch)**
- Start with a story session with Hamza before building content: premise, world, who the two heroes are and why they are together, villains, chapter outline, tone, how Divide / Not Without You fit the story. Offer options, he decides. Nothing from the web game's story is fixed (heroes' names and the noir Art Deco setting included, unless he says so).
- Then write the dialogue with him and plan the art it needs (portraits, story stills, new characters), with prompts.
- Dialogue files: lines with speaker, portrait (the existing `portraits/` set is placeholder; new portraits come with the new story), optional choices, and conditions (story flags, which spec, partner present).
- Triggers: run time, entering an area, an event (boss arrives, Divide starts, partner goes down, reunite), level start and end.
- Story scenes between levels (art style decided with the new story; `story/s1-s5.jpg` are placeholders).
- Both players always see the same line at the same time (the host turns the pages, as now).
- Save file: unlocked levels, story flags, record, settings.

Done when: two different levels exist, each with its own layout, timeline and dialogue, and adding a third needs only a scene and data files.

## Phase 4: online co-op with cross-play

**Requirement:** a Steam player and a phone player can play together, and phone-to-phone and PC-to-PC work too.

**Approach**
- A `Transport` interface with three implementations: local (offline and bot, already used since phase 1), relay (online for everyone), and Steam invites (friends list and "Join game" on Steam, which hands over a room code).
- **Relay first:** both players connect to a relay service with a room code; the relay forwards messages. It works on every platform and every network (mobile data included) with no NAT problems. Candidates to evaluate in a short spike at the start of this phase:
  - a managed Godot relay service (for example GD-Sync, which also links to GodotSteam for "Join friend"),
  - a small self-hosted WebSocket relay (cheap server, full control),
  - Godot's WebRTC with our own signalling and TURN (closest to the current web game, but more moving parts on native platforms).
  Pick by: works on Windows, macOS, Linux, iOS and Android; latency within a region; cost at small scale; how much code to maintain.
- Same protocol as the web game: guest sends inputs about 30 times a second; host sends snapshots about 30 times a second plus effect events. Guest smooths positions between snapshots.
- Pause when a player leaves the app, host drives dialogue, reconnect within a grace period, the remaining player continues if the partner quits.

Done when: you and your partner finish a run on two phones over mobile data, and one run PC (Steam) to phone.

## Phase 5: stable

- GUT tests for the simulation (damage, cards, Divide, Not Without You, Blood Boil, saves), headless balance runs, automated smoke test of menus.
- Performance: 60 fps (30 in battery saver) on a mid-range Android and an iPhone, no heat problems over 30 minutes.
- Crash reporting, logs a player can send.
- A closed group of playtesters for at least a week with no blocking bugs.

## Phase 6: launch-ready

- Controls: gamepad, keyboard and mouse, touch; Steam Deck layout.
- Settings: audio, effects (New/Classic), battery saver, damage numbers, screen shake, language later.
- Real music and sound effects (the web game synthesises its sounds in code).
- Achievements (Steam, Game Center, Google Play Games are optional).
- Store pages, trailer, screenshots, privacy policy (online play means player connections), age ratings.
- Steam AI disclosure for player-facing AI-generated art (PixelLab sprites, portraits, story stills). Confirm commercial licences for every AI tool used.
- Accounts: Steam Direct fee ($100 per game, recouped after $1,000 revenue), Apple Developer Program ($99 a year), Google Play ($25 once; new personal accounts must run a closed test with at least 12 testers for 14 days before production).

## Phase 7: launch

- Steam first: a free demo (Steam Next Fest is the usual launchpad), then the full game or Early Access.
- iPhone through TestFlight, then the App Store; Android through the closed test, then Google Play.
- After launch: 3D character swap test (one character through AI 3D, rig, animate, render to sprites), more levels and story chapters.

---

## Setup (Hamza's MacBook Pro + cloud sessions)

Hamza ports on his **MacBook Pro** with Claude Code, and also works from his iPhone through cloud sessions. Both must work.

On the Mac (he runs these himself, once):
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node gh git
brew install --cask godot claude-code
gh auth login
gh repo create HWezyrmas/dark-deco-godot --public --clone
cd dark-deco-godot
git clone https://github.com/HWezyrmas/dark-deco.git ../dark-deco
claude mcp add godot -e GODOT_PATH=/Applications/Godot.app/Contents/MacOS/Godot -- npx @coding-solo/godot-mcp
```
- The web game sits next to the new repo at `../dark-deco` (read its code, docs and assets from there).
- `godot-mcp` (community, MIT) lets Claude launch the editor, run the game and read errors on the Mac. If it breaks, run Godot from the terminal instead.
- Pin one Godot 4 version in the repo. If his installed Godot differs, tell him which version to install. Never upgrade mid-port.

In the repo (first session builds these):
- a session setup script that installs the pinned Godot headless + web export templates, so cloud sessions from his phone can import, test and export;
- GUT for tests;
- a GitHub Action that exports a web build to GitHub Pages on every push (his iPhone test link);
- a `CLAUDE.md` for the new repo that copies the "Things Hamza must provide" and "Visual quality toolkit" sections below.

---

## Visual quality toolkit

Priority order. Lighting first: it does the most for the noir mood.
1. **Lighting:** Godot 2D lights (`PointLight2D`, `CanvasModulate`, `LightOccluder2D`) for a dark scene lit by lamps, neon and fire. Normal maps for sprites from **Laigter** (free) or **SpriteIlluminator** (paid), so lights shade them. Start this in phase 1 with the Berserker.
2. **Pixel editing:** **Aseprite** (or free **Pixelorama**) to fix PixelLab glitches, recolour and export sheets.
3. **One palette:** pick a noir Art Deco palette from **Lospec** and recolour every asset to it.
4. **AI art:** **Midjourney** only for concept and key art (style references, story stills, store capsule art, trailer frames); it has no real pixel grid, sprite sheets or transparency, so never use it directly for in-game sprites. PixelLab for characters (his uploads cap at 256x256); **Retro Diffusion** for tilesets, props and backgrounds; **Scenario** to train on approved art once there are 20 to 30 pieces; **Meshy / Tripo** for the later 3D phase (render to sprites). Everything player-facing goes in the Steam AI disclosure.
5. **Levels:** Godot TileMapLayer + terrains; **LDtk** (free) if he prefers a visual level editor.
6. **Effects:** shaders from **godotshaders.com** (rain, wet reflections, grain, grading, dissolve, outlines), WorldEnvironment glow for neon and fire, GPUParticles2D for ambience (keep PixelFX for big hits), **Phantom Camera** addon for follow, zoom and shake, **Pixel Composer** for custom pixel effects.
7. **Direction:** a reference board (Art Deco skylines, noir film stills, Hyper Light Drifter, Katana Zero) turned into a style guide used in every art prompt.

---

## Things Hamza must provide (tell him when)

Claude cannot do these. **Tell Hamza at the start of the session where one becomes needed, and say exactly what to do** (copyable commands or prompts in code blocks). Don't wait until work is blocked.

| When | What he provides |
|---|---|
| Before session 1 | The Mac setup above; the empty repo; Godot installed |
| Phase 1, lighting | Aseprite + Laigter installed (or approval to generate normal maps another way); a chosen Lospec palette (offer 3 options) |
| Phase 1-2, art fixes | Regenerated PixelLab strips (give the exact PixelLab prompt, size and frame count); the armored Grand Verdict strip (17 frames, 128x128, impact on frame 12) |
| Phase 2, new abilities | Icons and effects art: give an image prompt for every graphic each new ability needs (standing rule) |
| Phase 3, story (before any content) | A story session: premise, characters, chapters, tone, decisions on everything placeholder |
| Phase 3, levels | Tileset and prop art (Retro Diffusion or PixelLab prompts, with the palette); the reference board; story outline and dialogue decisions; portrait or story-still art for new characters |
| Phase 4, online | Choice of relay service and any account or payment it needs; a second phone and his partner for real tests over mobile data |
| Phase 5 | Playtesters (Google Play needs at least 12 for 14 days) |
| Phase 6 | Steam ($100/game), Apple Developer ($99/yr), Google Play ($25) accounts; a Mac with Xcode signed into his Apple account for iOS builds; store page text, trailer choices, privacy policy decisions; music and sound sources; checked commercial licences for each AI tool |

---

## How to work on this with Claude Code

- Keep one phase per milestone and one task per session. Start each session with: "Read docs/GODOT_PORT_PLAN.md and docs/DOCUMENTATION.md, then continue with the next unchecked task in phase N."
- Claude Code can install and run Godot headless to import the project, run tests and export builds; check the exact Godot version before starting and pin it in the repo README.
- Keep the web game running locally for side-by-side comparison (`python3 -m http.server 8767` in the web repo).
- For phone checks during development, export a web build of the Godot project to GitHub Pages (single-threaded web export) or use Android/iOS test builds; confirm the web export runs well on iPhone Safari before relying on it.
