# Dark Deco — Production Roadmap

Repository: https://github.com/HWezyrmas/dark-deco  
Working branch: `production/dark-deco-art-and-gameplay`  
Source brief: `DARK_DECO_ART_BRIEF.md`

## Production principles
- Preserve the existing playable `main` branch; all implementation work happens on the production branch until reviewed.
- The source of truth for design is `DARK_DECO_ART_BRIEF.md`; reconcile contradictions with the live code before changing behaviour.
- Keep the game browser-first, mobile-first, two-player co-op, host-authoritative and compatible with the current vanilla JS/canvas architecture unless inspection proves a migration is necessary.
- New artwork must be delivered as individually usable assets, not merely a concept collage. Slice, clean, size, name and verify each asset before integration.
- Use nearest-neighbour scaling for pixel art. Maintain readable contrast on the specified slate-violet rooftop floor.
- Do not replace existing assets or rewrite large gameplay systems without a focused change and regression check.

## Change-control rules — explicit user instruction (2026-10-31)

**Do not change existing game code or existing assets unless Hamza explicitly authorizes that specific implementation work.** Planning, inspection, documentation and reporting are allowed. No code edits, asset replacements, generated-asset imports, deletions, or gameplay changes are authorized by a general "go ahead" to the project.

Whenever any change is authorized and made:
- Update this Markdown documentation in the same work session/commit.
- Record every added, modified, moved or deleted file by exact repository path.
- State whether it is code, art/asset, documentation, or configuration.
- Explain what changed, why it changed, and which brief requirement it addresses.
- For assets, include dimensions, frame count/format/transparency where applicable, and the source or generation method.
- For code, identify affected systems and the tests/checks performed, plus any checks not performed.
- Include the branch, commit SHA, and date in the change log.
- Clearly distinguish proposed/planned work from work actually completed. Never mark a planned item complete.
- If a change cannot be documented accurately, do not make it.

**Default operating mode: read-only audit and Markdown documentation.** Do not merge to `main` or publish/deploy without separate explicit approval.

## Repository baseline discovered
- Root app is a vanilla HTML/JS canvas game (`index.html`, `game.js`, `icons.js`) with bundled PeerJS.
- `game.js` is the large host-authoritative game implementation.
- Existing asset folders include `icons/`, `sprites/warden/`, `sprites/lamp/`, and `ui/`.
- Existing icon code contains procedural fallback drawings for the newer ability identifiers; painted icon files for all new abilities still need to be checked and completed.
- Existing hero sprite strips cover many idle/walk/spin/attack directions, but several action animations and Lamplighter directions remain missing per the art brief.
- README and art brief differ on some presentation details (e.g. Warden weapon wording and Lamplighter ultimate naming). The art brief is the current design reference; verify the actual implementation before changing labels or mechanics.

## Workstreams and order

### P0 — Baseline audit and asset pipeline
- [ ] Inventory all tracked assets, dimensions, alpha/background treatment and references in code.
- [ ] Map every ability ID to its icon file and fallback drawing.
- [ ] Map every animation ID/direction to its sprite strip and frame count.
- [ ] Identify runtime-drawn placeholder art and the functions that render it.
- [ ] Establish repeatable asset import, slicing, naming and validation scripts.
- Acceptance: a generated asset manifest reports present/missing files, dimensions and usage; no runtime references are broken.

### P1 — 20 missing ability icons
- [ ] Warden: guillotine, vortex, grip, carnage, hellchain, wyrm, obelisk, thunder, bloodmoon, legion.
- [ ] Lamplighter: constellation, aurora, rose, wisp, phoenix, heaven, cranes, starwell, clock, fireworks.
- [ ] Export individual square icon PNGs at 256px+ source resolution and 64px game-ready resolution.
- [ ] Preserve each ability's identity colour from section 5 of the brief.
- Acceptance: each file is an isolated icon with its own dark navy backing, no UI frame, no lettering, consistent visual scale, and valid PNG dimensions.

### P2 — Spell objects
- [ ] Warden objects: spectral executioner's axe; open and clenched jade fist; gilded obelisk; teal dragon head; blood moon.
- [ ] Lamplighter objects: phoenix wings-up and wings-down; running fox wisp; stained-glass rose window; deco clock; origami crane.
- Acceptance: isolated single-frame objects on pure black, spaced in 2x3 sheets, ready for engine-side movement/rotation/scale/fade animation.

### P3 — Impact animation strips
- [ ] Fire explosion, violet lightning, holy pillar, fireworks, ground shockwave, stained-glass shatter.
- Acceptance: six frames per effect in a horizontal strip, same centre/origin in every frame, pure black background, consistent frame dimensions.

### P4 — Enemy and boss art
- [ ] Shadow imp, Brute, Gunman, Bomber, Gatekeeper, Foreman.
- [ ] Create 4-direction walk cycles and death-pop animation; boss gets readable attack telegraphs and phase states.
- Acceptance: transparent backgrounds, 32–48px in-game silhouette target, dark outline, readable on rooftop floor, no frame-to-frame foot sliding.

### P5 — Hero animation completion
- [ ] Warden: hurt, down/revive, leap, Dome cast, and three attack swings in all eight directions.
- [ ] Lamplighter: hurt, down/revive, Step blink, Solar Lance cast, and walk/shoot in remaining directions.
- Acceptance: 84x84 cells per the brief (or explicit compatibility adapter if current 64x64 strips are retained); feet anchored consistently; direction ordering documented.

### P6 — Environment and world props
- [ ] Rooftop slate/brass tileset and roof edges.
- [ ] Building facades with lit windows.
- [ ] Two connecting bridges.
- [ ] Two parallax skyline layers.
- [ ] Neon pylons, vents, water towers, gargoyles, art-deco spire and rooftop sign.
- Acceptance: modular tile dimensions, collision/placement guidance, seamless edges, foreground/background separation and readable gameplay lanes.

### P7 — Runtime integration and polish
- [ ] Replace placeholder spell drawings with loaded assets where assets are ready.
- [ ] Replace enemy/boss blobs with sprite animations.
- [ ] Integrate rooftop tiles, bridges, props and parallax skyline.
- [ ] Integrate impact strips with frame timing and pooling.
- [ ] Add/verify shared Bond, revive, duo, Muse/Broker/Gatekeeper events and Foreman encounter against brief.
- [ ] Verify mobile touch controls, safe areas, performance and reconnect behaviour.
- Acceptance: two devices can host/join, complete a 12-minute run, level up, use both hero skills, revive, receive timed events and fight the Foreman without blocking defects.

## QA checklist
- [ ] Syntax checks for modified JavaScript.
- [ ] No missing network requests or asset 404s.
- [ ] Test desktop and mobile viewport sizes.
- [ ] Test touch input and keyboard fallback.
- [ ] Test host and joining client separately.
- [ ] Test disconnect/reconnect and host leave behaviour.
- [ ] Verify sprite frame bounds and animation origin.
- [ ] Verify image alpha/background and nearest-neighbour rendering.
- [ ] Compare final visuals against palette and floor contrast in the art brief.

## Immediate next actions
1. Complete baseline code and asset inventory.
2. Validate the existing icon fallback/file map and close the 20-icon gap.
3. Build the asset processing pipeline before importing large sprite sheets.
4. Work in small commits on this branch and keep `main` untouched until acceptance checks pass.

## Progress log
- 2026-10-31: Located repository and confirmed write permissions.
- 2026-10-31: Created `production/dark-deco-art-and-gameplay` from `main`.
- 2026-10-31: Initial repository inspection confirms vanilla canvas/JS architecture and existing icon/sprite/UI directories.

## Change log
- 2026-10-31 — Documentation-only update: added explicit change-control rules at Hamza's request. Files changed: `PRODUCTION_ROADMAP.md` only. No game code or art assets changed.


## Audit findings and updated execution notes (2026-10-31)
- The 20 new ability icons already have procedural 32×32 fallback drawings in `icons.js`; what is missing is the separate painted PNG override for each. Do not describe them as absent from the game.
- Warden has complete 8-direction walk/rot/spinrot sheets, but attack1/2/3 have only east and south-east, and cast has only south-east. Lamplighter has 8-direction rot, but only east/north/south walk and shoot strips.
- The runtime asks for additional hero animations (Warden spin/hurt/down/leap; Lamplighter cast/hurt/down/twirl) whose files were not present in the tracked sprite tree.
- Enemy and boss sprites, spell-object sprites, impact strips and rooftop tiles/props are not present as dedicated image assets; the current game draws these procedurally.
- UI directory has the expected families, but has not had visual QA.
- **Do not start asset production by importing a montage.** Every delivered asset must be an individual validated PNG or a deliberately specified sprite strip with documented frame bounds and anchor points.
- **Current work mode:** read-only code and existing assets; documentation-only updates are allowed. Additive new files are not to be committed until the user explicitly authorizes that work. Existing files remain untouched.


## Work log — 2026-10-31
- Completed a source-to-asset coverage audit by reading the art brief, `game.js`, `icons.js`, README, sprite README and tracked asset tree.
- Confirmed the 20 new ability icons already have procedural 32×32 fallback drawings; the missing part is their painted standalone PNG overrides.
- Confirmed current hero directional gaps: Warden attack sets only have 2/8 directions each and cast 1/8; Lamplighter walk/shoot have 3/8 each. Several requested action folders are absent.
- Confirmed dedicated enemy/boss sprites, spell-object sprites, impact strips and modular rooftop environment assets are absent; current visuals are primarily procedural.
- Created 20 new 64×64 PNG ability-icon drafts locally under `/mnt/data/dark_deco_new_icons/` and packaged them as `/mnt/data/dark_deco_20_ability_icons.zip`. These are new-file drafts only; they have **not** been uploaded to GitHub, visually approved, or connected to runtime code. Existing repo files remain unchanged.
- No game code, existing assets, or published `main` branch were modified.
