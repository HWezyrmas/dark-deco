# Dark Deco: full project documentation

Everything needed to pick this project up in Claude Code (or anywhere else) without the original chat history.
Last updated: 28 November 2026 (the Godot port starts from here: see `docs/PORT_KICKOFF.md`). Companion files: `CLAUDE.md` (the short working rules Claude Code loads automatically) and `docs/ability-matrix.html`.

- **Live game:** https://hwezyrmas.github.io/dark-deco/
- **Repo:** https://github.com/HWezyrmas/dark-deco (branch `main`, deployed to GitHub Pages by Actions on every push)
- **Owner:** Hamza (GitHub `HWezyrmas`). Plays it on an iPhone with his partner.
- **What it is for:** a personal experiment in how a complex product like a game is structured and run, built with AI as the engineering partner. Not a commercial launch.

---

## 1. The game in one page

Dark Deco is a **two-player online co-op survivors-like for phones**, played in the browser with no install. The setting is a foggy noir Art Deco city seen from the rooftops at night. Two heroes, the **Warden** (a big axe fighter) and the **Lamplighter** (a lantern-carrying caster), must survive **12 minutes until dawn** against waves of shadows, then beat the boss, the **Foreman**.

- You move with a floating joystick. Basic attacks fire on their own; you dash and cast skills with buttons.
- Combat runs on a **beat**: each hero takes one action every 0.5 seconds, and basic attacks are **3-step cycles** with a distinct third hit.
- Killing enemies drops XP (scrap). Each level-up both players pick a card: the next step of one of their **ability paths**, an upgrade, a passive or a team bonus.
- Staying close fills a shared **Bond**; being apart drains it. Reuniting **Rekindles** (heals and empowers both).
- Twice per run **the Divide** burns the bridges between the two rooftops: the heroes fight apart for 35 seconds. Each carries one **Memory** that saves the partner from going down ("Not Without You").
- One phone **hosts** (runs the whole game), the other **joins** with a 4-letter code. There is no game server.

---

## 2. Playing it (player's view)

### Main menu
- **Record strip:** runs played, dawns reached, best survival time (stored per phone in `localStorage.dd_rec`).
- **Co-op panel:** Host a game (gets a 4-letter code) or type a code and Join.
- **Mode tiles:** Solo (with a bot partner, or alone with "Bot off"), Training (the ability sandbox, `?dummy`), Heroes (the in-game guide, "the Gazette"), Intro (the story intro).

### Lobby
Each player picks a hero (Warden or Lamplighter) and a spec. In Solo you also pick the bot's spec, and can switch the bot off to play one hero alone. A tutorial checkbox runs the guided first run.

### Controls
- **Phone:** floating joystick anywhere on the left; skill buttons bottom right (Q, E, R slots per spec); the Memory icon appears during a Divide.
- **Keyboard:** WASD/arrows move, Q/Space/Shift = skill 1, E = skill 2, R/F = skill 3, Tab = swap, 1/2/3 pick level-up cards. Mouse: left = skill 1, right = skill 2.

### The 12-minute run

| Time | Event |
|---|---|
| 0:00 | Prologue dialogue (first run), run starts |
| every ~48 s | **Altar** lights up somewhere: stand in it to fill it (heal 35%, Empowered 6 s, XP). Every 3rd one is a **twin altar** that needs both heroes, one on each |
| every ~95 s | **Guarded chest** with brutes and shadows around it |
| 2:00, 7:00 | **The Muse**: a gift card for each player (Strong Heart +25% max HP, Restoration heal 60%, Spotlight +12% damage) |
| 4:00, 8:00 | **Gatekeeper** (elite) arrives; drops a chest and 6 big gems |
| 4:50, 8:35 | **The Divide**: bridges burn, heroes split for 35 s, then must find each other |
| 5:30, 9:30 | **The Broker**: a pact card (an ability +2 levels, or +30% damage) that costs 20% max health, or walk away |
| 11:00 | **The Foreman** (boss) arrives. Divides stop once he is out |
| 12:00 | **Dawn**: victory |

**Losing:** a hero at 0 HP goes **down** for 20 s. The partner revives them by standing next to them (2.5 s, longer after each down). If not revived they are **out** for 20 s and then respawn beside the partner. The run is lost when both heroes are down or out at the same time.

### Bond and Rekindle
The Bond bar fills when the heroes are close and drains when apart. Below 30% the game says "Apart, your bond fades" and the screen edges darken slightly. Coming back together above 55% **Rekindles**: both heal 20 and get Empowered for 3 s. Several cards and the healer's abilities only work at range of the partner.

### The Divide and "Not Without You"
At 4:50 and 8:35 the two bridges burn (3-2-1 countdown first). The Warden is placed on the west roof and the Lamplighter on the east roof; enemies only chase the hero on their side, damage taken is reduced (x0.65) and healing does not cross the gap. After 35 s the bridges return and the heroes must reunite (within 30 s) for a big reunion: both Empowered 8 s and healed 35%.
During the Divide each hero carries **one Memory** (glowing two-hands icon, labelled HER on his screen and HIM on hers). It is never pressed: if the partner takes a hit that would down them while apart, the Memory spends itself. The partner stays up at 30% health, is untouchable for 2 s, nearby enemies are blasted back and stunned and nearby bullets vanish, with a "NOT WITHOUT YOU" banner. One save each per Divide.

### Level-up cards
XP needed per level: `9 + 7*level + floor(0.4*level^2)`. Each level both players pick from their own offers:
- **New ability** (rare) or **ability upgrade** (common). Abilities level 1 to 5: level 3 adds an extra effect, level 5 evolves it.
- **Passives** (Might, Haste, Reach, Duration, Volley, Lodestone, Armor, Regeneration).
- **Skill mods** (epic), e.g. Swift Judgement, Heavy Head, Burning Leap, Second Dawn.
- **Team cards** (legendary), including **Duo** cards that combine one ability from each hero while they stand close.
- Muse **gifts** and Broker **pacts** use the same card screen.
A run reaches about level 21 to 22.

**Ability paths (27 Nov 2026).** Each spec's abilities are grouped into 3-4 themed paths of 2-4 abilities (`PATHS`; data in `data/ability_paths.json`). A run follows at most 2 paths. A path's next ability unlocks once the previous one is level 2; after that the card raises the lowest. Level-up offers: the next step of each started path, path starts while under 2 paths, and one card from basics, passives, mods or team cards. Each level adds +30% damage; level 5 evolves the ability without needing a passive. The level-up screen shows tall framed cards with level pips, the exact change and the path step, then a Confirm button. The skills screen is grouped by path with what comes next.

| Spec | Paths (abilities in order) |
|---|---|
| Berserker | Storm (shield, ravager, vortex) · Blood (blood, carnage, bloodmoon) · Thunder (slam, charge, thunder) · Warcry (shout, banner, wyrm) |
| Executioner | Judgement (rites, guillotine, knell) · Chains (hook, hellchain, grip) · Earth (earth, obelisk) · Iron (riposte, legion) |
| Healer | Prism (prism, chain, constellation) · Sanctuary (garden, halo, kite, clock) · Heaven (starfall, heaven, starwell) · Radiance (lighthouse, cranes, rose, aurora) |
| Firebrand | Swarm (flies, moths, wisp) · Snare (candle, firewall, pyre) · Sky (lanterns, phoenix, fireworks) |

---

## 3. Heroes and specs

| | Warden | Lamplighter |
|---|---|---|
| Role | The protector, front line | The light, support and damage at range |
| Base HP / speed | 140 / 68 | 90 / 71 |
| Resource | Rage (from hitting; full Rage upgrades skill 1) | Spark (fills over time and from hits; full Spark upgrades skill 1) |

**Berserker (Warden): "Two axes. No brakes."**
- AUTO Fury Strikes: forehand, lunging backhand, overhead slam that heals; builds Rage.
- Q Heroic Leap: jump and slam (ground pound effect on landing). At full Rage: **Bladestorm**, a long untouchable spin.
- E Reckless Charge (Phantom Charge): dash through the crowd, untouchable, resets on every kill.

**Executioner (Warden): "One axe. Holds the line."** +40 HP, 25% less damage while standing still.
- AUTO Headsman's Axe: long narrow chop, wide sweep, heavy drop. Executes enemies under 22% health.
- Q Verdict: plant feet and cleave a wide arc, Executes under 35% (earth stomp effect).
- RAGE **Grand Verdict**: a 1.15 s untouchable wind-up (custom PixelLab animation), then a slam all around him that Executes under 50%.
- **Blood Boil**: kills stack it (+1, Execute +2, big enemies +3 more), cap 50, drains 2/s after 6 s without a kill. Grand Verdict spends all stacks: up to x2.5 damage, up to 45% wider, a ring of earth spikes at 15+, a dark blast at 35+, a burning explosion at 50. A red steam aura grows with the stacks; counter under the Rage bar.
- E **Headsman's Throw** (28 Nov 2026, replaced the Dome): hold to charge (1.2 s), drag to aim, release. He lifts the axe as it charges (a burst of flame when full), then throws it in an arc with a neon trail. It passes through enemies, lands with an explosion (bigger with charge, a flame pillar at full charge) that Executes under 35%, and leaves a sunk **lava pool** for 3.5-6 s. The lava is a judgement zone: enemies are slowed, take 30% more damage and are Executed under 30%; kills there give extra Blood Boil, Last Rites and Death Knell reach 10% higher, Iron Skin recharges twice as fast. Cooldown 8 s. Numbers in `data/headsmans_throw.json`.
- Executioner path abilities deal x1.45 damage (`SPECB`).

**Healer (Lamplighter): "Keep his light burning."**
- AUTO Light Bolts: one fast bolt, twin bolts, then a fan of five piercing bolts. Bolts that pass through the Warden heal him.
- Q Step: blink, leaving healing light. Full Spark: **Sunburst**.
- E Solar Lance: hold and aim; through the Warden it heals and empowers him.
- R Guardian Ward: shields him; a blocked hit is blasted back (a "Perfect Ward").

**Firebrand (Lamplighter): "Set the night on fire."**
- AUTO Cinders: one cinder, two flanking cinders, then a firebomb that leaves burning ground. Burning kills heal both heroes.
- Q Flashfire: blink through fire. Full Spark: **Meteor**.
- E Kindle: sets his weapons ablaze (his hits burn and deal 30% more).
- R Guardian Ward.

### Ability catalog (from `WDEF` in game.js)

### Berserker (Warden)

| id | Name | What it does | Level 3 | Evolution (level 5) |
|---|---|---|---|---|
| `cleave` | Fury Strikes | A fast 3-hit axe combo; the third hit heals you. Enemies under 25% health are Executed for triple damage. Every hit builds Rage. | The finisher hits all the way around you. | **Rampage**: Every finisher unleashes 4 extra lightning-fast strikes. |
| `whirl` | Whirlwind | Spends Rage to spin through everything around you, then you become Enraged: attacks 30% faster for 4 seconds. | Costs only 20 Rage. | **Maelstrom**: Spins longer and drags enemies into the blades. |
| `slam` | Thunder Clap | A shockwave that launches crowds of enemies around you. | Stuns everything it hits. | **Fault Line**: Leaves a burning crack that keeps hurting. |
| `shield` | Hurled Axe | Hurls a spare axe that bounces between enemies. | Throws two axes at once. | **Axe Storm**: Every axe bounces 5 times. |
| `ravager` | Ravager | A ghostly axe circles you and cuts everything it touches. | A second axe joins the orbit. | **Twin Reapers**: A third axe; they spin faster and hit harder. |
| `blood` | Bloodthirst | Every 12 kills you hurl a blood axe that bounces between enemies and heals you on every hit. | Every 10 kills, and the axe bounces once more. | **Crimson Feast**: Every 8 kills, and it heals more. |
| `charge` | Phantom Charge | A ghost of you charges the toughest enemy nearby, trampling everything in its path. | A wider charge that stuns. | **Stampede**: Two phantoms charge side by side. |
| `banner` | War Banner | Plants a banner that hurts enemies around it. Standing near it makes both of you attack 25% faster. | Bigger, lasts longer and slows enemies. | **Royal Standard**: The banner also heals you both. |
| `shout` | Battle Shout | When surrounded, a roar blasts enemies away and makes them flee in fear. | Also gives you both +20% damage for 4 seconds. | **Warcry**: Each roar grants 30 Rage and heals you both. |
| `vortex` | Blade Vortex | Hurls a spinning tornado of axes that spirals outward, dragging enemies into the blades. | A bigger tornado that lasts longer. | **Cyclone**: Two tornadoes spiral out at once. |
| `carnage` | Carnage | Enemies you kill can burst into a ring of red-hot shrapnel, and shrapnel kills can burst again. | Twice as many shards. | **Massacre**: Bursts happen far more often and the shards cut through everything. |
| `wyrm` | Wyrm Breath | A spectral dragon rises behind you and breathes a cone of ghostfire at the crowd in front of you. | A wider, longer blast. | **Elder Wyrm**: The breath lasts longer and leaves the ground burning. |
| `thunder` | Thunderlord | Violet lightning crashes down from the sky onto enemies around you, one strike after another. | Two more strikes. | **Storm King**: Every strike forks into nearby enemies. |
| `bloodmoon` | Blood Moon | When you are swarmed, a red moon rises: every enemy near you bleeds, and every kill heals you. | The moon stays up longer. | **Crimson Eclipse**: Enemies under the moon are also slowed. |

### Executioner (Warden)

| id | Name | What it does | Level 3 | Evolution (level 5) |
|---|---|---|---|---|
| `reaper` | Headsman's Axe | A slow, crushing greataxe swing at enemies in front of you. Anything left under 22% health is Executed. Every hit builds Rage. | Every third swing goes all the way around you. | **Headsman**: Swings 25% faster and Executes anything under 35% health. |
| `riposte` | Iron Skin | Every few seconds a shield forms that blocks one hit, then strikes back all around you. | Holds two shields and recharges faster. | **Bulwark**: Breaking a shield stuns nearby enemies and heals you. |
| `earth` | Earthsplitter | Splits the ground toward the nearest enemy; it erupts a moment later and launches them. | Three cracks in a fan. | **Rift**: The cracks keep burning. |
| `hook` | Chain Hook | Hooks the farthest enemy (gunmen first) and yanks it to your axes. | Two hooks at once. | **Reel**: Drags in everything along the chain. |
| `rites` | Last Rites | On your beat, every wounded enemy close to you under 20% health is Executed at once, and each one heals you a little. | Reaches farther and Executes under 25%. | **Final Sentence**: Executes anything nearby under 30% health and ignites a crimson shockwave. |
| `knell` | Death Knell | When a crowd closes in, a great bell tolls: every enemy on screen under 30% health dies, and the rest are stunned. | Tolls more often. | **Midnight Bell**: Executes under 40% and the stun lasts twice as long. |
| `guillotine` | Guillotine | A giant ghostly axe appears over the thickest crowd, hangs for a heartbeat, then drops like a guillotine. | The impact sends out a second, wider shockwave. | ****: Three axes fall one after another in a line. |
| `hellchain` | Hellchains | Burning chains burst out of the ground, hook a group of enemies and yank them together into a fiery collision. | Chains grab two more enemies. | **Chain Reaction**: The chains yank and explode a second time. |
| `obelisk` | Deco Spires | A ring of gilded obelisks erupts out of the roof around you, launching everything they hit. | A second, wider ring follows. | **Skyline**: Three rings of spires, each taller than the last. |
| `legion` | Ghost Legion | Three spectral copies of you charge forward in formation, cutting through everything in their path. | Five ghosts charge instead of three. | **Army of Night**: The legion charges twice, out and back. |

### Healer (Lamplighter)

| id | Name | What it does | Level 3 | Evolution (level 5) |
|---|---|---|---|---|
| `beam` | Light Bolts | Fires bolts of lantern light at the nearest enemy, faster the longer you keep shooting. Bolts that fly through your partner heal them. | Bolts pierce through one enemy. | **Sunthread**: Bolts fire faster and pierce through 3 enemies. |
| `prism` | Prism | Each bolt that hits splits into a smaller bolt toward another enemy. | Splits into two bolts. | **Kaleidoscope**: Splits into 4 bolts. |
| `lighthouse` | Lighthouse | A beam slowly sweeps around you like a lighthouse. | Two beams sweep around you. | **Twin Lights**: Three longer beams. |
| `chain` | Spark Chain | Light jumps between nearby enemies. | The sparks briefly stun. | **Storm Lantern**: Jumps 9 times and stuns longer. |
| `starfall` | Star Fall | Stars rain down on enemies around you. | Five stars at a time. | **Meteor Shower**: Bigger stars that set enemies on fire. |
| `garden` | Glow Garden | Glowing flowers bloom where you walk. They heal you both and slow and hurt enemies. | Flowers bloom faster and last longer. | **Eden**: Fading flowers burst into cutting petals. |
| `halo` | Halo Pulse | A ring of light expands from you and knocks enemies back. | Two rings, one after the other. | **Corona**: Rings stun enemies and heal your partner. |
| `constellation` | Constellation | Marks enemies with stars, draws a constellation between them, then the whole shape explodes. | Two more stars in every constellation. | **Zodiac**: Bigger constellations that stun everything they touch. |
| `aurora` | Aurora | A shimmering curtain of northern lights sweeps across the field, burning and slowing everything it passes. | The curtain sweeps back a second time. | **Northern Lights**: A wider curtain that heals the Warden as it passes over him. |
| `rose` | Rose Window | A stained-glass rose window forms above you, spins, then shatters into a storm of rainbow glass. | More panes, more shards. | **Cathedral**: The window rebuilds and shatters a second time. |
| `cranes` | Paper Cranes | A flock of origami cranes takes off, circles up, then dives onto enemies and bursts into confetti. | A bigger flock. | **Thousand Cranes**: Every crane splits into two on impact. |
| `starwell` | Starwell | Opens a swirling galaxy in the middle of a crowd that drags enemies in, then collapses in a burst of stars. | A bigger, stronger pull. | **Supernova**: The collapse hits much harder and stuns survivors. |
| `clock` | Clockwork Halt | A giant deco clock appears over a crowd and freezes time inside it. When it strikes twelve, the frozen enemies shatter. | A larger clock face. | **Midnight**: The shatter hits much harder and leaves enemies slowed. |
| `kite` | Sun Kite | A kite of light floats above your partner and shoots at enemies near them. | Shoots faster. | **Sky Lantern**: Every few seconds the kite fires a piercing ray. |

### Firebrand (Lamplighter)

| id | Name | What it does | Level 3 | Evolution (level 5) |
|---|---|---|---|---|
| `cinder` | Cinders | Lobs burning cinders that splash and set enemies on fire. | Throws an extra cinder. | **Inferno**: Cinders leave pools of fire where they land. |
| `flies` | Fireflies | Fireflies orbit you and burn what they touch. | More fireflies in a wider ring. | **Halo**: A ring of bright fireflies. |
| `moths` | Ember Moths | Releases moths of living flame that home in on enemies farther away and set them alight. | One more moth. | **Night Bloom**: Six moths, and each hit spawns another. |
| `lanterns` | Paper Lanterns | Paper lanterns float up, drift over the enemies, then drop and burst. | Three lanterns at a time. | **Lantern Festival**: Each burst leaves a pool of fire. |
| `candle` | Candle Wards | Drops candles at your feet that explode when enemies come close. | Drops two candles at a time. | **Vigil**: Blasts pull enemies in and set off nearby candles. |
| `wisp` | Fire Fox | A fox made of living flame darts from enemy to enemy, leaving a glowing trail behind it. | Two foxes hunt at once. | **Kitsune**: A nine-tailed fox that hops further and leaves foxfire where it lands. |
| `firewall` | Firewall | Raises a wall of fire across the path of the nearest enemies. Everything that walks through it burns. | The wall is longer. | **Ring of Fire**: The wall closes into a full ring around the crowd. |
| `pyre` | Pyre | On your beat, every burning enemy near you erupts, hurting and igniting everything around it. | Bigger eruptions. | **Funeral Pyre**: Eruptions leave pools of fire behind. |
| `phoenix` | Phoenix | A phoenix of light circles you in a figure of eight, burning everything it flies through. | A bigger phoenix that flies longer. | **Rebirth**: Its feathers leave burning trails, and it heals the Warden when it passes him. |
| `fireworks` | Grand Finale | Launches fireworks that streak into the sky and burst into showers of colour over enemies. | One more rocket every volley. | **Encore**: Every burst sets off a crackling second explosion. |


### Passives, mods, team cards
- **Passives (`PAS`):** Might +12% damage/level; Haste 7% faster recharge/level; Reach 10% bigger/level; Duration 12% longer/level; Volley +1 projectile at levels 1, 3, 5; Lodestone 40% farther pickup/level; Armor 6% less damage/level; Regeneration 0.4 HP/s per level.
- **Skill mods (`MODS`):** Swift Judgement, Long Charge, Wildfire, Hearth, Heavy Head, Long Burn (both for Headsman's Throw since 28 Nov; keys `mirror`, `longwatch`), Burning Leap, Quick Leap, Second Dawn, Bright Lance, Twin Step, Light Feet.
- **Team cards (`PAIRS`):** Lit Steel, Kindred Flames, Witness, Lantern Ward, Bond of Light.
- **Duo cards (`DUOS`)**, active while standing close: Ember Storm (Whirlwind + Fireflies), Lightning Rod (Thunder Clap + Spark Chain), Prismatic Axe (Hurled Axe + Prism), Sanctuary (War Banner + Glow Garden), Blood Phoenix (Blood Moon + Phoenix), Hellfire (Hellchains + Firewall), Verdict of Light (Guillotine + Rose Window), Doom Clock (Death Knell + Clockwork Halt).

---

## 4. Enemies

| Kind | Name | Notes |
|---|---|---|
| 0 | Shadow | Basic swarm. Colour shifts every 2.5 minutes |
| 1 | Brute | Big, slow, telegraphed charge; guards chests |
| 2 | Gunman | Keeps distance and shoots; capped in number, grows over time |
| 3 | Bomber | Runs in, fuses (red circle), explodes |
| 4 | Gatekeeper | Elite at 4:00 and 8:00: telegraphed slams, drops a chest and big gems |
| 5 | The Foreman | Boss at 11:00: slams, a charge, stone rain. A storm rolls in while he lives |

Enemy HP scales with time (`hpMul = 1 + T/240 + (T/560)^2`) and their damage with `1 + T/540`. Normal enemies (kinds 0-3) have x1.4 HP, packs are 55% size and walk speed is x0.85 (`EPACK`, `ETOUGH`, `EPACE`, 27 Nov: slower, clearer fights). Enemy sprites are drawn 25% bigger than their hitboxes. Packs spawn just off screen around a hero. Red markings on the floor always warn before a big hit.

---

## 5. Technical architecture

### Stack
Plain HTML, CSS and JavaScript, no build step, no framework, no server. Canvas 2D rendering. PeerJS 1.5.4 (bundled as `peerjs.min.js`) for WebRTC. Hosted as static files on GitHub Pages.

### Files

| Path | What it holds |
|---|---|
| `index.html` | All CSS, every screen's markup (title, menu, lobby, HUD, level-up, end, guide), loads the scripts with a `?v=` cache-buster |
| `game.js` | The whole game (about 2,600 long lines) in one IIFE `(()=>{'use strict'; ... })();` |
| `dlg.js` | Dialogue box and host-driven dialogue sync (the lines themselves are placeholder; the whole story will be reworked) |
| `intro.js`, `title.js` | Story intro and animated title screen |
| `icons.js` | Icon lookup for cards |
| `sprites/` | Hero animation strips (`sprites/<warden|lamp>/<anim>/<direction>.png`) |
| `enemies/`, `props/`, `floor/`, `sky/`, `fx/` | Enemy sprites, rooftop props, tiles, sky layers, classic effect sheets |
| `pfx/` | Baked PixelFX effect sheets (`*.webp`) + `manifest.json` + MIT licence |
| `icons/`, `ui/` | Ability icons; UI frames, buttons, bars, symbols |
| `title/`, `lobby/`, `portraits/`, `story/` | Title art and logo, lobby art, dialogue portraits, story stills |
| `tools/test/` | Playwright test scripts |
| `tools/pfx/` | Scripts to render and bake new PixelFX effects |
| `docs/` | This document, the ability matrix |
| `v1/`, `v2/` | Old prototypes, untouched |

### Inside game.js (rough map, search by name)
- **Constants and data:** `RUN` (720 s), `ELITE_T`, `BOSS_T`, `EVENTS`, `DIV_T`, `WDEF`, `PAS`, `MODS`, `PAIRS`, `DUOS`, `CL` (classes), `SPUI` (spec kits for the lobby), `ENAMES`.
- **FXF:** the table of every visual/audio effect handler (`hit`, `slash`, `imp`, `pfx`, `rekindle`, `nwy`, ...).
- **Networking:** `startHost`, `startGuest`, `iceConfig`, `snapshot`, the guest apply function, `evQ`.
- **Simulation (host):** `update` -> `updPlayers`, `updEnemies`, `updProj`, `updAltars`, `divStep`, `echoStep`, `AB[...]` ability functions, `hitE`, `killE`, `hurtP`, `notWithoutYou`, `startLevel`, `applyCard`.
- **Rendering:** `render`, `world`, `drawChar`, `drawEnemy`, `drawSpx`, `drawSpx2`, `atmos`, `drawPfx`, `pfxLoop`.
- **Tools inside the IIFE, at the end:** the effects lab (`?fxlab`) and the training ground (`?dummy`), then `window.__dd`.

### Networking (host-authoritative)
1. The host creates a PeerJS peer with ID `ddeco-<code>` (4-letter room code). The guest connects to that ID through the free PeerJS signalling server.
2. ICE: Google STUN plus Metered Open Relay TURN (time-limited HMAC credentials generated in `iceConfig()`), so it also works over mobile data.
3. Once connected, **only the host simulates**. The guest sends inputs ~30 times a second (movement, skill presses, card picks, dialogue taps) and the host sends a **snapshot** ~30 times a second (`C` characters, `E` enemies, projectiles, gems, timers) plus queued effect events.
4. `emit(k,...)` runs `FXF[k](...)` locally and queues it for the guest, so both phones see the same hits and explosions.
5. Snapshot arrays are **positional**: add new fields at the end of the array and read them at the end of the guest unpacking line, or older fields shift.
6. The guest smooths enemy positions between snapshots. Pausing: if a player switches apps both pause (`away` message). Dialogue pages are turned by the host. If the partner leaves, the remaining player continues.
7. `?local` replaces PeerJS with a BroadcastChannel so two tabs of one browser can play together (used by the tests).

### Rendering and performance
- The view is 345 game pixels across the short side (`ZOOMV`). The world is drawn straight onto the screen canvas through a transform (`lg` = the screen context, `LT` = scale `Q` plus offset), plus an emissive layer (`EM`, `eg`) for glows and bloom. Hero sprites are drawn at full resolution (`hiQ`). Camera and enemies move in sub-pixel steps (`rq()`).
- On 3x phones the canvas is about half the device resolution (`Q` = device pixels / a whole number), upscaled cleanly.
- Readability: a soft clear zone around your own hero, a ring and halo under your hero, ability effects at 50% alpha with caps, the partner's effects at 35% (`PFA`, every effect carries its owner), hit-stop and shake only on big moments.
- **Auto quality** (`AQ`): if fps stays under 80% of the target, it drops bloom and full-screen atmosphere, then effect counts. Frame rate is logged per run.
- **Effect memory:** PixelFX sheets load on first use; above 140 MB decoded the least recently used are dropped. Loading all of them once crashed iPhones around 5 minutes in.
- Frame rate is capped at 60 fps (iPhones refresh at 120 Hz). **Battery saver** (Learned skills screen) caps at 30 fps and turns off bloom.
- Bloom is one full-screen pass; the vignette and light beams are drawn into the small canvas. Rule: avoid adding full-screen passes, the phone heats up.
- **Effects:** two sets. "Classic" (hand-made) and "New" (PixelFX, default). The switch is in Learned skills (`localStorage.dd_fx`).

### Persistence (localStorage keys)
`dd_log` and `dd_log_live` (run log), `dd_intro_seen`, `dd_prologue_done`, `dd_seen` (guide), `dd_div_seen`, `dd_fx` (effects), `dd_saver` (battery saver), `dd_nums` (damage numbers), `dd_tg` (training ground setup), `dd_rec` (record: runs, dawns, best).

---

## 6. Art and effects pipelines

### Hero sprites (PixelLab)
- Hamza generates them in PixelLab (Custom Animation, model V3). Upload limit 256x256 per image.
- Format: a horizontal strip of square frames per direction, e.g. `sprites/warden/attack/east.png`. Missing directions are mirrored or borrowed from the nearest one (`dirFrames`).
- Warden frames are 84 px with a 64 px character (scaled 0.7 in game); the Grand Verdict strip is 17 frames of 128x128, impact on frame 12. The lowest opaque row is treated as the feet, so remove anything below the feet line.
- Every new file must be added to `SPRHAVE` in game.js and to the loader list in `loadDirAnims`.
- Rule: hand-drawn canvas art for weapons and characters looked bad. Ask Hamza for sprites and give him copyable PixelLab prompts (description, negative description, action description, settings).

### PixelFX effects
- Source: https://github.com/patch-gg/pixelfx (MIT, 244 code-generated pixel effects; licence kept in `pfx/LICENSE.txt`).
- Pipeline: add entries to a `tools/pfx/setN.json` (key, effect id, anchor, frame step, skip/tmax, palette), then
  `python3 tools/pfx/render.py tools/pfx/setN.json <pixelfx clone>` and `python3 tools/pfx/process.py tools/pfx/setN.json <pixelfx clone>`, then paste `pfx/manifest.json` into `const PFXM=` in game.js.
- The manifest stores frame size, count, columns, anchor, seconds per frame, `loop`, and `hit` (the contact moment taken from the library's acting data). `swing()` uses `hit` so a melee effect's contact frame lands exactly on the damage.
- Avoid effects that paint the library's stock dummy body; render with `--no-actor`.

### Icons and UI art
Ability icons live in `icons/` (64-96 px). Standing rule: whenever a new ability is added, give Hamza image-generation prompts for every graphic it needs.

---

## 7. Developer tools

| URL | What it does |
|---|---|
| `?local` | Two tabs of one browser play together (no PeerJS) |
| `?fast` | Clock runs faster (testing) |
| `?fxlab` | Effects lab: every effect plays Classic (left) vs New (right); tap edges to step |
| `?dummy` | Training ground (also on the menu): pick hero, spec, abilities, level 1-5, 1/3/6/10 scarecrow dummies, dummy HP, no cooldowns, full Rage, Max Blood Boil, dummies hit back |

`window.__dd` exposes internals for scripts and the console (chars, en, T setter, xp setter, FXF, DIV, bond, sim ...).

### Tests (Playwright, in `tools/test/`)
Start a server first: `python3 -m http.server 8767` in the repo root.
- `NODE_PATH=$(npm root -g) node tools/test/coop.cjs`: two-player run end to end (lobby, prologue sync, level-ups, pause, Divide, boss, dawn, play again). Must end with `ERRORS {"H":[],"G":[]}` and an empty `MISSING`.
- `node tools/test/sweep.cjs`: menus, guide pages, intro, all four specs, skills screen, loss, leave.
- `node tools/test/sim.cjs <runs> <seconds> '{"warden":"exec","lamp":"heal"}'`: bot-vs-bot balance runs with damage breakdowns.
Screenshots go to `tools/test/out/` (gitignored). Needs `npm i -g playwright` and `npx playwright install chromium`.

---

## 8. Working on it with Claude Code

1. Open https://claude.ai/code (phone or desktop), connect GitHub, choose `HWezyrmas/dark-deco`. Or on a computer: `git clone https://github.com/HWezyrmas/dark-deco.git`, `cd dark-deco`, run `claude`.
2. Claude Code reads `CLAUDE.md` automatically; point it at this file for anything deeper ("read docs/DOCUMENTATION.md first").
3. Every change: syntax check -> run `coop.cjs` (and `sweep.cjs` for UI changes) -> bump the cache-buster -> commit to `main` -> push -> confirm the Pages deploy succeeded.
   - Syntax: `node -e "new Function(require('fs').readFileSync('game.js','utf8'))"`
   - Cache-buster: `sed -i -E "s/(game\.js\?v=)[0-9a-z]+/\1$(date +%s)/" index.html`
   - Deploy check: `curl -s "https://api.github.com/repos/HWezyrmas/dark-deco/actions/runs?head_sha=$(git rev-parse HEAD)"`
4. Tell Hamza what to try on his phone, in plain words. He usually can't run things locally.
5. Good first prompt for a new session: *"Read CLAUDE.md and docs/DOCUMENTATION.md, then start the local server and run the co-op test so we know everything works."*

---

## 9. Decision log (why things are the way they are)

- **Beat combat with 3-step cycles:** makes auto-attacks feel deliberate and readable on a phone; each spec's cycle has its own rhythm and a heavier third hit.
- **Host-authoritative networking:** two phones simulating the same fight drift apart within seconds. One referee, one mirror. No server cost.
- **Smooth controls:** exponential acceleration and braking, casting slows instead of rooting, a 0.35 s skill input buffer, floating joystick with a small dead zone, a smoothed camera with look-ahead. Added after feedback that the heroes felt clunky.
- **Memory became "Not Without You":** the first version summoned an echo of the partner for 8 s and half a Rekindle. It never turned a losing moment around, so it was replaced by an automatic save of the partner. The blue screen wash while apart was removed (it was irritating).
- **PixelFX with a Classic fallback:** Hamza wanted richer effects but asked to keep the old ones for rollback. The New/Classic switch stays.
- **Melee effects synced to contact frames, one effect per hit:** the Executioner looked cluttered (old crescent + new effect + dust). Now each hit shows one swing, timed to the damage, with a short freeze on contact.
- **Grand Verdict as a real animation:** a hand-drawn holographic axe looked bad; a PixelLab animation of the character works.
- **Blood Boil:** gives the Executioner a reason to chain kills before spending his ultimate.
- **Performance pass:** the phone got hot. Capped fps, cut full-screen passes, smaller canvas, battery saver.
- **Gamified menu:** a record strip, a co-op panel and mode tiles instead of a plain button list.
- **Zombie pivot (27 Nov):** the game becomes Raid (the current run) + Base (build and defend) in an overgrown abandoned city. Prototype in `proto/base/`, art in `art/base/`.
- **Slower, clearer combat (27 Nov):** levelling came too fast and fights were unreadable, so packs got smaller and tougher, effects quieter, XP back to the original values.
- **Ability paths (27 Nov):** abilities were overflowing with no direction; now a run follows at most 2 themed paths with a visible next step.
- **Executioner: Dome to Headsman's Throw (28 Nov):** the dome and his abilities had no synergy. The judgement-zone idea moved into the lava pool left by a charged axe throw, which is also more fun to aim.
- **Fluidity pass (28 Nov):** compared with another survivors game, ours stuttered: hit-stop on every hit, pixel-stepping, constant shake. Fixed.
- **Readability and partner dimming (28 Nov):** at high levels effects flooded the screen; your own hero gets a clear zone and the partner's effects are dimmed on your phone.
- **Memory crash (28 Nov):** loading every effect sheet (~400 MB decoded) killed the page on iPhones around 5 minutes; now lazy with a budget.
- **Port starts (28 Nov):** Hamza decided to begin the Godot migration now; the web build is the frozen reference.
- **Hala's Arcade removed from this repo** (it lived in `arcade/`); restore with `git checkout a04d0b9 -- arcade`.

---

## 10. Open items and backlog

- **Now: port to Godot 4** (started 28 Nov). Start with `docs/PORT_KICKOFF.md`, then `docs/GODOT_PORT_PLAN.md`. Data tables are exported to `data/*.json` by `tools/data/export.cjs`.
- Phase 1 playtests with outside pairs (roadmap) can still run on the live web build; paste the run log (now with frame rate) to Claude.

- **Grand Verdict frames 4-12** show the Warden without armour (PixelLab glitch). Regenerate with "he keeps his full dark plate armor and pauldrons in every frame" and swap the strip (`sprites/warden/grand/east.png`).
- **Base-mode art still missing:** see `art/base/README.md` (generator half-damaged, riot zombie, floor chevron, top-down roof tile, water tower, AC unit, gargoyle, laundry line).
- **Lava pool sprite** is drawn at about 2x its size; a 256x128 version would be sharper.
- **New spec abilities:** Hamza is choosing from the "New Spec Abilities to Choose From" doc (12 ideas per spec, plus replacing generic stat upgrades with spec-specific ones). Build the picks, with icon prompts.
- **Executioner big axe sprites:** a full Executioner sprite set carrying one big greataxe (walk, idle, 3 attacks, cast, hurt, down) was requested from PixelLab; wire it to the Executioner only.
- **Lamplighter moves:** the PixelFX "moves" that suit casters (fireball throw, ice lance (recoloured gold), lightning call, meteor call, holy smite) are not used yet.
- **Next phase: level design** (distinct areas or stages beyond the two rooftops).
- **Real two-phone testing** over mobile data.
- Balance: Firebrand teams die more often than other combinations in bot simulations.
