# Dark Deco: Game and Art Brief

A brief for any artist or AI image tool making assets for this game. It covers what the game is, what each mechanic needs to look like, every asset that already exists, and every asset still wanted, with exact specs.

---

## 1. The game in one paragraph

**Dark Deco** is a 2-player online co-op "survivors-like" for phones: each player uses their own phone, in a browser. Two heroes hold out on art deco rooftops at night against endless swarms for **12 minutes**, then fight the **Foreman** (the boss). Players only **move**; attacks fire **automatically**. Each hero also has two button skills. Killing enemies drops gems, and gems fill a shared XP bar. On every level-up each player picks one of three cards (new abilities, upgrades, passives, evolutions). The core idea is **"better together"**: one hero deals the damage, the other keeps him alive, and standing close makes both stronger.

## 2. Art direction

| Aspect | Direction |
|---|---|
| Mood | Art deco noir at night: gilded rooftops, brass, smoky slate stone, neon skyline |
| Reference feel | Hyper Light Drifter (neon pixel art) crossed with modern mobile roguelites (Archero 2, Undead Slayer) for readability |
| Rendering | Pixel art at low resolution, scaled up with nearest-neighbour, plus a bloom (glow) pass |
| Camera | **Top-down 3/4 view**: you see the tops of things and a little of their front. Characters stand upright; floors and rings are flat ellipses |
| Floor | Mid-tone slate-violet stone tiles (`#47445f` / `#4c4966`) with brass studs. **Not black**, so effects and enemies stay readable |
| Palette anchors | Gold `#d6a84e` / `#f2cf7a`, ink `#07060d`, Warden cyan `#4ff0ff`, Lamplighter amber `#ffc861`, neon pink `#ff4fd8`, danger red `#ff2a5c`, heal green `#7dff9a` |
| Readability rules | 1) Every ability owns **one colour family** (table in section 5). 2) Effects are **solid shapes with a glowing rim**, not formless glow. 3) Signature spells should be **much bigger than the heroes**. 4) Enemies are coloured, outlined bodies on the mid-tone floor |
| UI | Gold art deco frames, dark navy panels, jewel accents (painted UI sheets already exist; see section 7) |
| Fonts | Poiret One (display), Josefin Sans (UI), Press Start 2P (numbers), Playfair Display (the in-game magazine) |

## 3. Heroes

### The Warden (Protector, 140 health)
A human berserker built like an orc: a broad, tattooed fighter with **two axes** and art deco steel and gold armour, glowing cyan. Aggressive posture, axes held forward. Inspired by a mix of Blanka (Street Fighter) and a World of Warcraft orc, but human.
- **Role:** deals most of the damage (about 65–75% in testing) and takes the hits.
- **Automatic attack, Fury Strikes:** a 3-hit axe combo that builds **Rage** (a red bar).
- **Rage:** Whirlwind spends it automatically when he's surrounded. At full Rage the small button becomes **Bladestorm**, a long invulnerable spin.
- **Small button, Heroic Leap:** jumps the way he's moving and slams down.
- **Big button, Dome:** a cyan shield bubble both heroes can stand in. It pushes enemies out, blocks bullets and reduces damage taken.

### The Lamplighter (Healer, 90 health)
A cute, Lulu-like girl: long auburn hair, a violet and pink dress with a white collar, and a **crook staff with a hanging lantern**. Warm amber light.
- **Role:** support. She deals less damage, moves slowly, heals a lot and powers him up.
- **Automatic attack, Light Bolts:** homing bolts of lantern light. Bolts that pass through the Warden heal him.
- **Small button, Step:** a short blink that leaves a healing pool of light.
- **Big button, Solar Lance:** a huge beam. Fired through the Warden, it heals 35% and **Empowers** him. Fired through the Dome, it **splits into a rainbow**.

### Shared mechanics
- **Bond:** a gold bar that fills while the heroes stand close. They hit harder, attack faster and slowly heal. Apart, it fades and the screen cools blue. Reuniting sets off a **Rekindle** blast.
- **Reviving:** a fallen hero is revived by the partner standing next to them. If nobody does, they're out for 20 seconds.
- **Duo abilities:** when the right pair of abilities is owned across both players, a duo card can appear. Duos only work while the heroes are close.
- **Planned, not built yet:** levels where the heroes are forced onto **separate paths**. Each can summon a **"memory"**: a weaker ghost copy of the other hero that helps until they reunite.

## 4. Run structure and enemies

- **Run:** 12 minutes on two large rooftops joined by two bridges, with a neon skyline below.
- **Events:**

  | Time | Event |
  |---|---|
  | 2:00 and 7:00 | The **Muse** appears and offers gifts |
  | 5:30 and 9:30 | The **Broker** offers deals: power in exchange for 20% max health |
  | 4:00 and 8:00 | A **Gatekeeper** elite arrives and drops a gold **treasure chest** |
  | 11:00 | **The Foreman** (boss) arrives |

- **Enemies** (currently drawn in code as simple outlined blobs):

  | Kind | Look now | Behaviour |
  |---|---|---|
  | Shadow (basic) | Small round ghost blob with yellow eyes. Colour changes every 2.5 minutes: plum, then teal, rust, rose and indigo | Swarms toward you |
  | Brute | Large crimson blob with horns | Slow, tanky |
  | Gunman | Teal figure in a fedora with a gun; shows a red aim laser | Keeps distance and shoots |
  | Bomber | Orange round blob with a fuse | Runs in and explodes |
  | Gatekeeper (elite) | Large violet blob with a gold crown and a health bar | Elite; drops a chest |
  | The Foreman (boss) | Huge red blob with a crown and three eyes | Boss |

## 5. All 44 abilities

Each ability has a level 3 upgrade and evolves at level 5 if the player owns the passive listed. **Colour** is the ability's identity colour and must be respected in its icon and effects.

### Warden (22)

| # | Name | What it does | Evolves into | Needs | Colour |
|---|---|---|---|---|---|
| 1 | Fury Strikes | 3-hit axe combo; executes enemies under 25% health; builds Rage | Rampage | Might | cyan / white |
| 2 | Whirlwind | Spends Rage to spin through everything, then Enraged | Maelstrom | Duration | cyan |
| 3 | Thunder Clap | Shockwave that launches crowds | Fault Line | Reach | electric yellow `#ffe14a` |
| 4 | Hurled Axe | A spare axe bounces between enemies | Axe Storm | Volley | orange `#ff9a3c` |
| 5 | Iron Skin | A shield blocks one hit, then strikes back | Bulwark | Armor | silver-white |
| 6 | Ravager | A ghostly axe orbits him | Twin Reapers | Haste | ice cyan |
| 7 | Bloodthirst | Every 12 kills, a blood axe bounces and heals him | Crimson Feast | Regeneration | blood red |
| 8 | Phantom Charge | A ghost copy charges the toughest enemy | Stampede | Armor | violet `#b88cff` |
| 9 | Earthsplitter | The ground splits toward an enemy and erupts | Rift | Reach | molten orange `#ff7a3a` |
| 10 | Chain Hook | Hooks the farthest enemy and yanks it in | Reel | Lodestone | steel blue-white |
| 11 | War Banner | Plants a banner; allies nearby attack faster | Royal Standard | Duration | gold |
| 12 | Battle Shout | A roar blasts enemies away in fear | Warcry | Haste | coral |
| 13 | Guillotine | A giant ghost axe hangs, then drops on a crowd | Executioner's Row | Might | lilac steel `#b8a8ff` |
| 14 | Blade Vortex | A tornado of axes spirals outward | Cyclone | Duration | mint `#5fffd0` |
| 15 | Titan's Grip | A giant ghost fist grabs, lifts and smashes a crowd | Colossus | Armor | jade `#7dffb0` |
| 16 | Carnage | Kills burst into rings of red-hot shrapnel | Massacre | Haste | hot pink-red `#ff3a7a` |
| 17 | Hellchains | Burning chains yank enemies into a fiery collision | Chain Reaction | Lodestone | fire orange `#ff7a1a` |
| 18 | Wyrm Breath | A spectral dragon breathes a cone of ghostfire | Elder Wyrm | Might | teal `#3fffe0` |
| 19 | Deco Spires | A ring of gilded obelisks erupts from the roof | Skyline | Reach | gold `#f2cf7a` |
| 20 | Thunderlord | Violet lightning strikes enemies one after another | Storm King | Volley | violet `#d8b0ff` |
| 21 | Blood Moon | A red moon rises: enemies bleed, kills heal him | Crimson Eclipse | Regeneration | crimson `#ff2a4a` |
| 22 | Ghost Legion | Spectral copies of him charge in formation | Army of Night | Duration | ghost blue `#9fb8ff` |

### Lamplighter (22)

| # | Name | What it does | Evolves into | Needs | Colour |
|---|---|---|---|---|---|
| 1 | Light Bolts | Homing lantern bolts; heal the Warden on pass-through | Sunthread | Haste | warm cream |
| 2 | Prism | Each bolt hit splits into a smaller bolt | Kaleidoscope | Volley | lilac |
| 3 | Lighthouse | A sweeping beam circles her | Twin Lights | Duration | pale gold |
| 4 | Fireflies | Fireflies orbit her and burn enemies | Halo | Reach | lime |
| 5 | Moth Swarm | Homing moths chase distant enemies | Night Bloom | Volley | lavender `#d8a8ff` |
| 6 | Spark Chain | Light jumps between enemies | Storm Lantern | Might | electric blue `#7ab8ff` |
| 7 | Star Fall | Stars rain down on enemies | Meteor Shower | Might | pale yellow |
| 8 | Paper Lanterns | Lanterns drift over enemies, drop and burst | Lantern Festival | Duration | rose pink |
| 9 | Glow Garden | Glowing flowers bloom where she walks; heal and slow | Eden | Regeneration | mint green |
| 10 | Halo Pulse | A ring of light expands and knocks enemies back | Corona | Reach | gold |
| 11 | Candle Wards | Candles that explode when enemies come close | Vigil | Lodestone | teal `#4fe8d0` |
| 12 | Sun Kite | A light kite floats above the Warden and shoots | Sky Lantern | Haste | amber |
| 13 | Constellation | Stars mark enemies, link up, then explode | Zodiac | Volley | pink-white `#ffd6f0` |
| 14 | Aurora | A curtain of northern lights sweeps the field | Northern Lights | Duration | green, cyan, violet, pink |
| 15 | Rose Window | A stained-glass window forms, spins and shatters | Cathedral | Reach | jewel tones |
| 16 | Fox Wisp | A fox of lantern light hops between enemies | Kitsune | Haste | amber `#ffb05a` |
| 17 | Phoenix | A phoenix loops around her, burning enemies | Rebirth | Duration | fire orange `#ffa03a` |
| 18 | Heaven's Pillars | Columns of holy light slam down | Sanctum | Might | holy gold-white `#fff3b0` |
| 19 | Paper Cranes | Origami cranes dive and burst into confetti | Thousand Cranes | Haste | blush pink `#ffc0dc` |
| 20 | Starwell | A galaxy pulls enemies in, then collapses | Supernova | Reach | purple `#9a7aff` |
| 21 | Clockwork Halt | A giant deco clock freezes time, then shatters enemies | Midnight | Lodestone | ice cyan `#8fe6ff` and gold |
| 22 | Grand Finale | Fireworks streak up and burst over enemies | Encore | Volley | multicolour |

### Passives (8), each shared by both heroes
Might (+damage), Haste (faster recharge), Reach (bigger area), Duration (longer effects), Volley (+projectiles), Lodestone (gem pickup range), Armor (less damage taken), Regeneration (healing over time).

### Duos (4)

| Duo | Combines | Effect |
|---|---|---|
| Ember Storm | Whirlwind + Fireflies | Whirlwind sets everything on fire |
| Lightning Rod | Thunder Clap + Spark Chain | Thunder Clap chains lightning through the crowd |
| Prismatic Axe | Hurled Axe + Prism | Axe hits split into rainbow bolts |
| Sanctuary | War Banner + Glow Garden | The banner heals both heroes and blooms with flowers |

### Other cards
- **Skill changes:**
  - Warden: Mirror Dome, Long Watch, Burning Leap, Quick Leap.
  - Lamplighter: Second Dawn, Bright Lance, Twin Step, Light Feet.
- **Pair cards (both heroes):** Lit Steel, Lantern Ward, Bond of Light.
- **Stat cards:** Iron Will, Sharpened, Quick Feet, Clockwork, Lodestone.
- **Muse gifts:** max health, heal, power.
- **Broker:** a pact card, or decline.

## 6. Technical specs for new art

| Asset type | Size | Background | Notes |
|---|---|---|---|
| Ability or passive icon | Square, 64×64 in game (paint at 256+) | Each icon has its own dark navy backdrop; the sheet background is solid black | Painterly pixel art, rich lighting, **no text, borders or frames** (the game adds the frame) |
| Hero sprites | 84×84 cells in 8 directions (E, SE, S, SW, W, NW, N, NE); horizontal strips | Transparent | Same 3/4 camera; feet at the bottom centre |
| Spell VFX objects | One object per square cell with lots of empty space | **Pure solid black** (glow is added on top, so black disappears) | Single clean frame; the game animates it (drop, spin, flap, scale, fade) |
| Impact animation strips | 6 frames in a horizontal row | Pure solid black | Effect centred in the **same spot** every frame |
| Enemy sprites | About 32–48 px tall in game; 4-direction walk, 4–6 frames | Transparent | Coloured, readable silhouettes with a dark outline |
| UI | Already done | n/a | n/a |

Layouts that work best: **2 rows of 5** icons per sheet, or **2 rows of 3** VFX objects per sheet, with even spacing. More than 10 per sheet degrades quality.

## 7. Assets that exist now

### Hero sprites (PixelLab, 64×64 frames, horizontal strips)

| Hero | Animation | Directions |
|---|---|---|
| Warden | Standing poses (`rot`) | All 8 |
| Warden | Walk, 8 frames | All 8 |
| Warden | Spin (Whirlwind) | All 8 |
| Warden | Three attack swings, 7 frames each | East and south-east |
| Warden | Cast | South-east |
| Lamplighter | Standing poses (`rot`) | All 8 |
| Lamplighter | Walk, 9 frames | East, north and south |
| Lamplighter | Shoot, 7 frames | East, north and south |

Directions that are missing are filled in by mirroring or borrowing the nearest one.

### Painted icons (64×64)
- **24 original abilities:** cleave, whirl, slam, shield, riposte, ravager, blood, charge, earth, hook, banner, shout, beam, prism, lighthouse, flies, moths, chain, starfall, lanterns, garden, halo, candle, kite.
- **8 passives:** might, haste, reach, dur, volley, lode, armor, regen.
- **Duos and pair cards:** ember, rod, pax, sanct, litsteel, ward, bond.
- **Skill changes:** mirror, longwatch, firebash, quickbash, dawn, brightflare, twinstep, quickstep.
- **Stats:** hp, dmg, spd, cdr.
- **Gifts:** g_maxhp, g_heal, g_power.
- **Broker:** b_pact, b_decline.
- **Other:** chest.

### Painted UI (cut from 6 sheets)
- **Panels:** big panel, wide panel, plate, info row, slot, tooltip.
- **Level-up card frames:** common, rare, epic, legendary, passive, gift, pact, duo.
- **Bars, each with a frame and a fill:** health, rage, XP, bond, boss.
- **Buttons:** gold (and pressed), ghost, square, big and small skill buttons, cyan ring, joystick base and knob, class card on and off.
- **18 symbols:** leap, storm, dome, step, lance, skills, sound, mute, leave, swap, heart, rage, bond, gem, skull, clock, crown, warn.
- **Banners and plates:** Level Up, Treasure, Muse, Broker, Danger, Victory, Defeat, timer plate, level plate, combo plate.

### Drawn in code (no painted art yet)
- Every spell effect.
- All enemies and the boss.
- The rooftop floor, buildings, skyline, props (neon pylons and vents) and bridges.
- Gems, chests, the Dome, the Solar Lance and the hero rings.

## 8. Wanted assets, in priority order

### Priority 1: icons for the 20 newest abilities
**Sheet A (Warden):** Guillotine, Blade Vortex, Titan's Grip, Carnage, Hellchains, Wyrm Breath, Deco Spires, Thunderlord, Blood Moon, Ghost Legion.
**Sheet B (Lamplighter):** Constellation, Aurora, Rose Window, Fox Wisp, Phoenix, Heaven's Pillars, Paper Cranes, Starwell, Clockwork Halt, Grand Finale.

### Priority 2: painted spell objects (the game animates them)
**Sheet C (Warden):**
1. Spectral executioner's axe, blade down, lilac glow with gold deco engraving.
2. Giant jade ghost fist, open.
3. The same fist, clenched.
4. Black-and-gold art deco obelisk with a glowing tip.
5. Spectral teal dragon head in side view, mouth open.
6. Blood-red full moon with a halo.

**Sheet D (Lamplighter):**
1. Fire phoenix, wings up.
2. The same phoenix, wings down.
3. Lantern-light fox, running.
4. Stained-glass rose window.
5. Gold art deco clock face with a cyan minute hand.
6. Origami paper crane.

### Priority 3: impact animation strips (6 frames each)
**Sheet E:**
1. Fire explosion.
2. Violet lightning strike.
3. Holy light pillar.
4. Firework burst.
5. Ground shockwave ring.
6. Shattering stained glass.

### Priority 4: enemies (currently simple coloured blobs)
Animated sprites (4-direction walk and a death pop) for:
- **Shadow imp:** small, round, ghostly, with yellow eyes.
- **Brute:** hulking and horned.
- **Gunman:** noir fedora gangster with a tommy gun.
- **Bomber:** round, with a lit fuse.
- **Gatekeeper:** armoured elite with a gold crown.
- **The Foreman:** a huge art deco industrial boss with a crown.

### Priority 5: hero animations still missing
- **Warden:** hurt, down/revive, leap, the three attack swings in all 8 directions, and the Dome cast.
- **Lamplighter:** hurt, down/revive, Step blink, Solar Lance cast, and walk and shoot in the remaining 5 directions.

### Priority 6: environment
- **Tileset:** art deco rooftop tiles (slate stone with brass inlay), roof edges with gold trim, building facades with lit windows.
- **Bridges:** two bridges between the rooftops.
- **Skyline:** a parallax neon skyline in two layers.
- **Props:** neon pylons, vents, water towers, gargoyles, an art deco spire and a rooftop sign.

### Later (design not final)
- Separate-path levels, the "memory" ghost-hero effect, story portraits, and a second biome.

## 9. Prompt template

Every prompt should follow this pattern so the assets stay consistent:

> *[What it is and the layout]*, on a solid black background with even spacing. The style is dark art deco noir with neon accents and painterly pixel art, matching a premium mobile RPG icon set. Seen from a top-down 3/4 game camera. Rich lighting and glow. No text, borders or frames. *[Numbered list of items, each with its identity colour from section 5.]*

---

## 10. Instructions for AI collaborators (ChatGPT and others)

This section exists because the first batch of AI-made assets couldn't be used as delivered. Read it before making or committing anything. The game is maintained by Claude, who wires assets into the code. Your job is to make assets that meet the contract below exactly, so they can be dropped in without rework.

### 10.1 Review of the first batch (`assets/ability-icons/`, branch `production/dark-deco-art-and-gameplay`)

| Problem | Detail | Fix |
|---|---|---|
| Corrupted file | `hellchain.png` is cut off partway through and won't open | Re-export it and run the validation in 10.6 before committing |
| Wrong style | 6–12 flat colours, about 500 bytes each. The existing set is painterly pixel art with thousands of colours and soft lighting (see `icons/cleave.png`, `icons/starfall.png`) | Redo all 20 as painted icons in the existing style (10.2) |
| Built-in frame | Every icon has its own rounded border | No frame: the game draws the frame. Fill the square with the icon's own dark navy backdrop |
| Wrong colours | Guillotine is blue-white (should be lilac steel `#b8a8ff`), Titan's Grip is mint (should be jade `#7dffb0`), Ghost Legion is cyan (should be ghost blue `#9fb8ff`) | Use the identity colour from section 5 for every ability |
| Wrong folder | `assets/ability-icons/` is never read by the game | Icons go in `icons/<id>.png` (10.2) |
| Mislabelled | The logs call them "painted image candidates" | Describe assets accurately. Call flat pixel drafts "flat drafts" |
| Montage concepts | Overview montages were made but never sliced | Never commit a montage or contact sheet as a game asset (10.5) |

**Status:** the 20 icons in `assets/ability-icons/` are **rejected**. Leave them in place as reference, or delete them in a commit that says so. Don't build on them.

### 10.2 Ability, passive and card icons
- **Path:** `icons/<id>.png`, where `<id>` is the exact ability ID from section 5 (lowercase): `guillotine`, `vortex`, `grip`, `carnage`, `hellchain`, `wyrm`, `obelisk`, `thunder`, `bloodmoon`, `legion`, `constellation`, `aurora`, `rose`, `wisp`, `phoenix`, `heaven`, `cranes`, `starwell`, `clock`, `fireworks`.
- **Size:** 64×64 PNG for the game. Paint at 256×256 or larger and downscale with a high-quality filter (Lanczos), not nearest-neighbour. Optionally keep the source at `icons/src/<id>@256.png`.
- **Background:** fully opaque. The subject sits on its own dark navy backdrop (around `#0d0b1c`–`#1a1530`) with soft lighting. No transparent corners, no border, no frame, no text.
- **Style:** must sit next to `icons/cleave.png`, `whirl.png`, `starfall.png` and `garden.png` without looking out of place. Painterly pixel art: rich gradients, rim light, glow in the identity colour, and one clear silhouette that reads at 32 px.
- **Colour:** the dominant glow is the identity colour from section 5.
- **Making them:** generate a sheet of 10 (2 rows of 5) on solid black with wide, even gaps, then **slice each icon into its own file**. Crop each to a centred square on the icon's own backdrop, then downscale to 64×64.
- **Wiring:** Claude adds the IDs to the icon override list in `icons.js`. Don't edit code unless Hamza has authorised it.

### 10.3 Spell objects (single frames, animated by code)
- **Path:** `vfx/<name>.png`. Names: `guillotine_axe`, `fist_open`, `fist_closed`, `obelisk`, `wyrm_head`, `blood_moon`, `phoenix_up`, `phoenix_down`, `fox`, `rose_window`, `clock_face`, `crane`.
- **Size:** 256×256 PNG; the object fills about 70% of the square and is centred.
- **Background:** **pure black `#000000`**, no transparency needed. The game draws these with additive blending, so black disappears. Don't add a floor, shadow, frame or vignette.
- **Orientation:**
  - Side-view creatures (`wyrm_head`, `phoenix_*`, `fox`, `crane`) face **right**; the game mirrors them.
  - `guillotine_axe` points straight down.
  - `obelisk` stands upright, with its base at the bottom centre of the image.
- **Matching pairs:** `phoenix_up` and `phoenix_down` must be the same bird in the same position and scale; only the wings change. The same applies to `fist_open` and `fist_closed`.

### 10.4 Impact animation strips
- **Path:** `vfx/impact_<name>.png`. Names: `fire`, `lightning`, `holy`, `firework`, `shockwave`, `glass`.
- **Format:** a horizontal strip of 6 frames, each 128×128, so the file is 768×128. Frame 1 is the first moment of impact; frame 6 is almost faded out.
- **Background:** pure black `#000000`.
- **Anchor:** the impact point stays at the same pixel in every frame (the centre, or the bottom centre for `holy` and `lightning`). Don't let the effect drift between frames.
- **Recommended tool:** PixelLab's animation tool. A general image generator usually produces frames that don't match. If you use one anyway, check the frames line up before committing.

### 10.5 Hero and enemy sprites
These are the existing conventions; match them exactly.

**Heroes:**
- **Path:** `sprites/<warden|lamp>/<anim>/<direction>.png`.
- **Directions:** `east`, `south-east`, `south`, `south-west`, `west`, `north-west`, `north`, `north-east`.
- **Animation strips** (walk, attack, attack2, attack3, shoot, cast, hurt, down, leap, twirl): one row of square frames, **84×84 per frame**. For example, the Warden's 8-frame walk is 672×84.
- **Single poses** (`rot`, `spinrot`): one 64×64 image per direction.
- **Background:** transparent (RGBA). Feet at the bottom centre of every frame, at the same height in every frame and every direction.
- **Character design:** the same character, outfit, colours and proportions as the existing `rot` images. Never redesign the heroes.
- **Still wanted:**
  - Warden: `attack`, `attack2` and `attack3` in the 6 missing directions; `cast`, `hurt`, `down` and `leap` in all 8.
  - Lamplighter: `walk` and `shoot` in the 5 missing directions; `cast`, `hurt`, `down` and `twirl` in all 8.

**Enemies (new folder):**
- **Path:** `sprites/enemy/<kind>/<anim>/<direction>.png`.
- **Kinds:** `shadow`, `brute`, `gunman`, `bomber`, `gatekeeper`, `foreman`.
- **Animations:** `walk` (4–6 frames) and `death` (4–6 frames).
- **Directions:** 4 only: `east`, `south`, `west`, `north`.
- **Frame size:** 48×48 for `shadow`, `gunman` and `bomber`; 64×64 for `brute`; 96×96 for `gatekeeper`; 128×128 for `foreman`.
- **Background:** transparent.
- **Look:** a dark 1 px outline and the colours from section 4. Regular shadows also change colour every 2.5 minutes in the game (plum, teal, rust, rose, indigo), so make `shadow` in plum and Claude will tint it.

### 10.6 Validation before every commit
Run this and fix every failure before committing:

```python
# validate_assets.py: run from the repo root: python3 validate_assets.py <files...>
import sys
from PIL import Image
RULES={'icons/':(64,64,False),'vfx/impact_':(768,128,False),'vfx/':(256,256,False)}
bad=0
for f in sys.argv[1:]:
    try:
        im=Image.open(f);im.load()
    except Exception as e:
        print('BROKEN',f,e);bad+=1;continue
    for pre,(w,h,alpha) in RULES.items():
        if f.startswith(pre):
            if im.size!=(w,h):print('SIZE',f,im.size,'expected',(w,h));bad+=1
            break
    if f.startswith('icons/'):
        n=len(im.convert('RGB').getcolors(1<<20) or [])
        if n<200:print('FLAT',f,n,'colours: not painted');bad+=1
    if f.startswith('sprites/') and f.split('/')[-2] not in('rot','spinrot'):
        if im.width%im.height:print('STRIP',f,im.size,'width is not a whole number of square frames');bad+=1
        if im.mode!='RGBA':print('ALPHA',f,'sprites need transparency');bad+=1
print('OK' if not bad else f'{bad} problem(s)')
```

Then also:
- **Look at every asset** at game size (icons at 64 px, sprites at their frame size) next to the existing ones. If it looks like a different game, it fails.
- **Check the identity colour** against section 5.

### 10.7 Committing and documenting
- **Branch:** commit to `production/dark-deco-art-and-gameplay`. Never push to `main` and never edit `game.js`, `icons.js` or `index.html` unless Hamza explicitly authorises it. Claude merges and wires assets in after review.
- **Commit size:** one asset family per commit, e.g. "icons: painted Warden batch (10)".
- **Log:** in the commit body and in `ASSET_AUDIT.md`, list each file with its path, size, frame count and the tool used. Name the problems honestly; don't call flat drafts "painted".
- **Don't commit** zips, montages, contact sheets, concept boards or anything that failed validation.
- **When in doubt, deliver files to Hamza instead.** If a requirement can't be met, send the files to Hamza to pass to Claude, rather than committing something that will need redoing.

### 10.8 Priority order
1. The 20 painted icons (10.2): **top priority, replaces the rejected batch.**
2. The 12 spell objects (10.3).
3. The 6 impact strips (10.4).
4. Enemy sprites (10.5).
5. The missing hero directions and animations (10.5).
6. The environment: tiles, bridges, skyline and props. Its exact specs will be added to this brief before that work starts; don't start without them.

---

## 11. Required working method for ChatGPT (added after batches 02–04)

**To ChatGPT, read this first.** Batches 02–04 (everything in `assets/drafts/` and `assets/spell-objects/spell_objects_4x3.png`) were made by **writing SVG or code that draws rectangles, polygons and circles**. That method can never produce this game's art. The heroes came out as a grey box on a red box, and the spell objects as generic shapes. They are all **rejected**, as you already noted in commit `057682b`. The problem is not the details; it is the method.

### 11.1 The rule
1. **Do not write SVG, canvas code, Python drawing code or any other code to create art.** No `<rect>`, `<polygon>`, PIL `draw.*` or similar, for any asset, ever.
2. **Use your image generation tool** (the built-in image model) to create **painted raster images** from the prompts in this brief. That's the same kind of tool that made the painted UI sheets and the existing icons in `icons/`.
3. **Show every generated image to Hamza in the chat first.** Do not commit anything to GitHub until Hamza has looked at that specific image and approved it.
4. **After approval, hand the full-resolution image to Hamza as is.** Claude cuts, keys, sizes, validates and wires assets into the game. Don't slice, shrink or convert the images yourself, because that's where the quality was lost.
5. Code is fine only for checking files, e.g. the validation script in 10.6. Never use it to make pixels.

### 11.2 Your next task, exactly
1. Generate **icon sheet A (Warden)** with the image generator. Use this prompt word for word:

   > A single sprite sheet of 10 square game ability icons in 2 rows of 5, on a solid black background with even spacing. The style is dark art deco noir with neon accents and painterly pixel art, matching a premium mobile RPG icon set. Each icon has a dark navy background, rich lighting and glow, and no text, borders or frames. Row 1: 1) a giant spectral executioner's axe falling from above, steel blade glowing lilac; 2) a mint-green tornado made of spinning battle axes; 3) a giant jade-green ghostly stone fist bursting up through cracked ground; 4) a hot pink-red explosion bursting into radiating shards of shrapnel; 5) glowing orange burning chains wrapped around each other with fiery links. Row 2: 6) a spectral teal dragon head breathing a cone of ghostfire; 7) three tall black-and-gold art deco obelisks erupting from the ground; 8) a violet lightning bolt striking down from a stormy sky; 9) a huge blood-red full moon with crimson drops beneath it; 10) three ghostly blue warrior silhouettes charging forward in a row.

2. Show it to Hamza and wait for approval or changes.
3. Then do **icon sheet B (Lamplighter)** the same way, then spell-object sheets C and D, then impact sheet E. The prompts for B to E are the ones Hamza has; ask him for them if you don't have them.
4. One sheet per message. Don't batch, and don't move on until the current sheet is approved.

### 11.3 What not to do
- No new asset categories that aren't in this brief (loot, portals, shrines, status icons and so on). They aren't in the game.
- No commits of drafts, concepts, atlases, SVG, JSON manifests or zips.
- No "automatic upload" of new files. Every commit needs Hamza's approval of that specific asset first.
- Don't redesign the heroes. They already exist as sprites in `sprites/warden/` and `sprites/lamp/`. Any new hero animation must look exactly like them, so hero animation is best made in PixelLab from those sprites, not with your image generator.

### 11.4 Cleaning up
You may delete `assets/drafts/`, `assets/spell-objects/` and `assets/ability-icons/` from the production branch in one commit titled "remove rejected draft assets", once Hamza approves the deletion. Don't touch anything else.

---

## 12. Remaining image requests for ChatGPT (status and exact prompts)

**To ChatGPT:** this is your work queue. It's the method that produced icon sheets A and B, which are in the live game: **image generator only, one sheet per message, show Hamza, wait for approval.** Don't slice, resize, convert or commit anything. Hamza passes the approved full-resolution image to Claude, who cuts it and wires it in.

### 12.1 Status

| Sheet | Contents | Status |
|---|---|---|
| A | 10 Warden ability icons | **Done:** approved and live in the game |
| B | 10 Lamplighter ability icons | **Done:** approved and live in the game |
| C | 6 Warden spell objects | **Done:** approved and live in the game |
| D | 6 Lamplighter spell objects | **Done:** approved and live in the game |
| E | 6 impact animations | **Done:** approved and live in the game |
| F | 6 enemy characters | **Done:** approved and live in the game |
| G | 12 rooftop props | **Done:** approved and live in the game |
| H | Rooftop floor texture | **Done:** approved and live in the game |
| I | Night skyline (2 layers) | **Done:** approved and live in the game |

Hero animations are **not** on this list. They must match the existing PixelLab hero sprites exactly, so Hamza makes them in PixelLab.

### 12.2 Backgrounds (important)
- **Glowing things (C, D, E):** solid pure black. The game adds them as light, so black disappears.
- **Solid things (F, G):** solid pure magenta `#FF00FF`. Claude removes the magenta. Don't use black for these, because dark enemies would vanish into it. No shadows on the ground and no magenta inside the objects.
- **H and I:** filled edge to edge, as described in their prompts.

### 12.3 Prompts, to be used word for word

**Sheet C: Warden spell objects**
```
A sprite sheet of 6 separate glowing magic VFX objects in 2 rows of 3, each centred in its own square cell with lots of empty space, on a pure solid black background. The style is painterly pixel art with neon glow and dark art deco fantasy, seen from a top-down 3/4 game camera. No text, no frames, no ground or shadows. 1) a giant spectral executioner's axe, blade pointing down, steel with a lilac ghost glow and gold art deco engraving on the head; 2) a giant ghostly jade-green stone fist, open, fingers spread, rising upward; 3) the same jade fist clenched shut; 4) a tall black-and-gold art deco obelisk with a glowing gold tip; 5) a spectral teal dragon head in side view facing right, mouth open, breathing; 6) a huge blood-red full moon with dark crimson craters and a soft red halo.
```

**Sheet D: Lamplighter spell objects**
```
A sprite sheet of 6 separate glowing magic VFX objects in 2 rows of 3, each centred in its own square cell with lots of empty space, on a pure solid black background. The style is painterly pixel art with warm neon glow and cute art deco fantasy, seen from a top-down 3/4 game camera. No text, no frames, no ground. 1) a phoenix made of orange and gold fire in side view facing right, wings raised; 2) the same phoenix with wings lowered; 3) a small fox made of amber lantern light in side view facing right, running, flame tail; 4) a circular stained-glass rose window in jewel colours with gold leading; 5) an ornate gold art deco clock face with Roman numerals and a glowing cyan minute hand; 6) a white and pink origami paper crane in side view facing right, wings spread.
```

**Sheet E: impact animations**
```
A VFX sprite sheet with 6 horizontal rows, each row a 6-frame animation strip of the same effect playing from start to finish, left to right, on a pure solid black background. The style is painterly pixel art with bright neon glow, readable on a phone, seen from a top-down 3/4 game camera. Keep each effect centred in the same position in every frame. No text. Row 1: an orange fire explosion bursting and fading into smoke. Row 2: a violet lightning bolt striking the ground with an impact flash. Row 3: a column of golden holy light slamming down and fading. Row 4: a firework bursting into coloured sparks. Row 5: a shockwave ring expanding outward from a ground impact, flat on the floor. Row 6: shattering rainbow stained glass flying apart.
```

**Sheet F: enemies** (one pose each; Claude animates them with bobbing, squash and flashes)
```
A sprite sheet of 6 separate enemy characters for a top-down 3/4 view mobile action game, in 2 rows of 3, each centred in its own square cell with lots of empty space, on a solid flat pure magenta #FF00FF background. Each character faces the viewer, three-quarters toward the right, standing, full body visible. The style is painterly pixel art with a crisp dark outline, dark art deco noir with neon accents, cute-menacing and readable at small size, matching a premium mobile roguelite. No ground, no shadow, no text, no frames, and no magenta inside the characters. 1) a small round shadow imp, plum-purple ghostly body with wispy bottom and two glowing yellow eyes; 2) a hulking horned brute, crimson with a dark iron belt and glowing yellow eyes; 3) a noir gangster gunman, teal suit, fedora hat, holding a tommy gun, glowing red eyes; 4) a round orange bomber creature carrying a lit fuse on its head, sparks at the tip; 5) an armoured violet elite knight with an art deco gold crown and glowing eyes, larger and imposing; 6) a huge art deco industrial boss called the Foreman, red and black iron body like a walking furnace, gold crown, three glowing eyes, much larger than the others.
```

**Sheet G: rooftop props**
```
A sprite sheet of 12 separate rooftop props for a top-down 3/4 view mobile game, in 3 rows of 4, each centred in its own square cell with lots of empty space, on a solid flat pure magenta #FF00FF background. The style is painterly pixel art, art deco noir rooftops at night with neon accents, matching a premium mobile roguelite. No ground, no shadow, no text, no frames, and no magenta inside the objects. Row 1: 1) a neon pylon lamp post glowing cyan; 2) the same pylon glowing pink; 3) a metal rooftop air vent with grille; 4) a wooden water tower on iron legs. Row 2: 5) a stone gargoyle crouching; 6) a small art deco spire with gold trim; 7) a rooftop neon sign frame with blank glowing border; 8) a stack of wooden crates. Row 3: 9) a brass chimney with smoke; 10) a satellite-style radio antenna with a blinking red light; 11) an art deco stone planter with a small dead tree; 12) a rooftop access door hut with a lit window.
```

**Sheet H: rooftop floor texture**
```
A single seamless tileable square texture of an art deco rooftop floor seen from directly above, filling the whole image edge to edge. Slate-violet stone tiles in two alternating subtle shades around #47445f and #4c4966, thin dark grout lines, small brass inlay studs at some tile corners, light wear and a few hairline cracks. Painterly pixel art, mid-tone and low contrast so characters and effects stand out on top of it. No objects, no shadows, no lighting gradient, no text, no border. The left edge must continue seamlessly into the right edge and the top into the bottom.
```

**Sheet I: night skyline, 2 layers** (two separate images, one message each)

I-1, far layer:
```
A wide panoramic image, about 3 times wider than tall, of a distant art deco city skyline at night for a parallax game background, horizontally seamless so the left edge continues into the right edge. Painterly pixel art, dark noir. Hazy skyscraper silhouettes in deep violet with a few tiny lit windows in cyan, pink and gold, purple fog glowing along the bottom, a dark indigo night sky with faint stars filling the top. No text, no characters, no frames.
```

I-2, near layer:
```
A wide panoramic image, about 3 times wider than tall, of closer, taller art deco skyscrapers at night for the front parallax layer of a game background, horizontally seamless so the left edge continues into the right edge. The buildings fill the bottom two thirds and the sky above and between them is solid flat pure magenta #FF00FF with no gradient, so it can be cut out. Painterly pixel art, dark noir. Dark near-black violet silhouettes with stepped crowns, antenna spires with red lights, small neon signs and lit windows in cyan, pink and gold. No magenta on the buildings, no text, no characters, no frames.
```

### 12.4 Order and turnaround
1. Do C → D → E first. These lift the most visible spells.
2. Then F (enemies), then G, H and I (environment).
3. One sheet per message. If Hamza asks for changes, change only that sheet.
4. When a sheet is approved, just reply "Approved: sheet X". Don't commit to GitHub. Claude handles the repository.

---

## 13. Enemy animations (sheets J1 to J6)

**To ChatGPT:** one enemy per image. **Attach that enemy's existing painted sprite (the file in brackets, from the repo) as the reference** so the animation matches it exactly. Same rules as before: image generator only, show Hamza, wait for approval, no commits. Start with J2 (the brute) as a test.

Character consistency between frames is the hard part. Reject a sheet if the character changes design, colour or size between frames, if frames touch, or if a row doesn't have exactly 4 frames.

**J1 Shadow imp (enemies/src/shadow.png)**
```
A pixel art animation sprite sheet of ONE character, matching the attached reference image exactly: same design, colours, proportions, outline and painterly pixel-art style. 2 rows of 4 frames on a solid flat pure magenta #FF00FF background, every frame the same size, the character the same size in every frame, facing right in a 3/4 top-down game view, feet on the same baseline in every frame, evenly spaced with clear gaps between frames. No ground, no shadow, no text, no frames or borders, no magenta inside the character. Row 1: a 4-frame floating loop, the wispy tail and tendrils swaying, body bobbing gently. Row 2: a 4-frame lunge-bite: rear back, stretch forward with claws out and jaws open, snap, settle back.
```

**J2 Brute (enemies/src/brute.png)**
```
A pixel art animation sprite sheet of ONE character, matching the attached reference image exactly: same design, colours, proportions, outline and painterly pixel-art style. 2 rows of 4 frames on a solid flat pure magenta #FF00FF background, every frame the same size, the character the same size in every frame, facing right in a 3/4 top-down game view, feet on the same baseline in every frame, evenly spaced with clear gaps between frames. No ground, no shadow, no text, no frames or borders, no magenta inside the character. Row 1: a 4-frame heavy walk cycle, stomping, shoulders rolling (left foot down, passing, right foot down, passing). Row 2: a 4-frame ground slam: raise both fists overhead, peak of the wind-up, smash down onto the ground, recover.
```

**J3 Gunman (enemies/src/gunman.png)**
```
A pixel art animation sprite sheet of ONE character, matching the attached reference image exactly: same design, colours, proportions, outline and painterly pixel-art style. 2 rows of 4 frames on a solid flat pure magenta #FF00FF background, every frame the same size, the character the same size in every frame, facing right in a 3/4 top-down game view, feet on the same baseline in every frame, evenly spaced with clear gaps between frames. No ground, no shadow, no text, no frames or borders, no magenta inside the character. Row 1: a 4-frame walk cycle holding the tommy gun, coat swinging. Row 2: a 4-frame shooting sequence: raise and aim, fire with a bright muzzle flash, second shot with recoil, lower the gun.
```

**J4 Bomber (enemies/src/bomber.png)**
```
A pixel art animation sprite sheet of ONE character, matching the attached reference image exactly: same design, colours, proportions, outline and painterly pixel-art style. 2 rows of 4 frames on a solid flat pure magenta #FF00FF background, every frame the same size, the character the same size in every frame, facing right in a 3/4 top-down game view, feet on the same baseline in every frame, evenly spaced with clear gaps between frames. No ground, no shadow, no text, no frames or borders, no magenta inside the character. Row 1: a 4-frame bouncy hopping walk on its little legs, fuse spark flickering. Row 2: a 4-frame about-to-explode sequence: fuse burns down, body swells and glows brighter, cracks of light, maximum swell with a white-hot glow. No explosion.
```

**J5 Elite knight (enemies/src/elite.png)**
```
A pixel art animation sprite sheet of ONE character, matching the attached reference image exactly: same design, colours, proportions, outline and painterly pixel-art style. 2 rows of 4 frames on a solid flat pure magenta #FF00FF background, every frame the same size, the character the same size in every frame, facing right in a 3/4 top-down game view, feet on the same baseline in every frame, evenly spaced with clear gaps between frames. No ground, no shadow, no text, no frames or borders, no magenta inside the character. Row 1: a 4-frame armoured walk cycle, cape flowing. Row 2: a 4-frame overhead sword slam: raise the blade, peak of the wind-up, strike down into the ground, recover.
```

**J6 The Foreman (enemies/src/boss.png)**
```
A pixel art animation sprite sheet of ONE character, matching the attached reference image exactly: same design, colours, proportions, outline and painterly pixel-art style. 2 rows of 4 frames on a solid flat pure magenta #FF00FF background, every frame the same size, the character the same size in every frame, facing right in a 3/4 top-down game view, feet on the same baseline in every frame, evenly spaced with clear gaps between frames. No ground, no shadow, no text, no frames or borders, no magenta inside the character. Row 1: a 4-frame slow, heavy walk cycle, furnace glow pulsing, chimneys puffing. Row 2: a 4-frame double-fist slam: raise both fists, peak with the furnace blazing, smash down, recover.
```

---

## 14. Spec art: Executioner and Firebrand (sheets K and L, plus PixelLab)

The Warden now has a second spec, the **Executioner** (one huge greataxe, crimson and bone-white accents), and the Lamplighter has the **Firebrand** (fire magic, orange and ember accents). **Status: sheets K and L and the four button symbols are done and live.** Only the PixelLab hero sprites remain. Same rules as before: image generator only, one sheet per message, show Hamza, no commits.

**Sheet K: Executioner icons** (2 rows of 3, black background like sheets A and B)
```
A set of 6 square game ability icons in one image, in 2 rows of 3, each icon on its own dark navy rounded tile with clear space between tiles, on a plain flat dark background. Painterly pixel art with neon glow, dark art deco fantasy, bold readable silhouettes that read at 48 pixels, matching a premium mobile roguelite. No text, no letters, no numbers. 1) a giant executioner's greataxe mid-swing with a crimson motion arc; 2) a crushing downward greataxe strike splitting the ground in a wide crimson arc (Verdict); 3) the same strike as a full blazing white circle around a figure (Grand Verdict); 4) a red crosshair sigil of judgement hovering over a skull (Condemn); 5) a gold hourglass with a crimson axe blade (Swift Judgement); 6) three red crosshair sigils marking shadows (Doom Mark).
```

**Sheet L: Firebrand icons** (2 rows of 3, black background)
```
A set of 6 square game ability icons in one image, in 2 rows of 3, each icon on its own dark navy rounded tile with clear space between tiles, on a plain flat dark background. Painterly pixel art with neon glow, dark art deco fantasy, bold readable silhouettes that read at 48 pixels, matching a premium mobile roguelite. No text, no letters, no numbers. 1) three burning cinders arcing through the air and splashing into flame (Cinders); 2) a pool of fire spreading on the ground under falling cinders (Inferno); 3) a glowing girl's silhouette blinking forward and leaving a line of fire behind (Flashfire); 4) a lantern pouring a ribbon of flame onto a raised axe, setting it ablaze (Kindle); 5) a long burning trail that keeps blazing (Wildfire); 6) a warm hearth flame cupped in two hands with a small heart (Hearth).
```

**Skill button symbols** (one image, black background, 4 symbols in a row)
```
Four separate simple glowing game button symbols in a row, each centred with clear space between them, on a pure solid black background. Painterly pixel art, bold single-colour neon glyphs with a soft glow, readable at 32 pixels, art deco style. No text. 1) a downward greataxe with a crimson arc (Verdict); 2) a red crosshair sigil (Condemn); 3) a running flame streak (Flashfire, orange); 4) a lantern flame jumping to a blade (Kindle, orange).
```

**Hero animations (PixelLab, not ChatGPT).** In PixelLab, start from the existing Warden and Lamplighter sprites so the faces and bodies match:
- **Executioner Warden:** the same Warden carrying one huge two-handed greataxe instead of two axes, darker armour with crimson trim. Animations: 8-direction walk, a slow overhead greataxe chop, and a planted wide sweeping swing (Verdict).
- **Firebrand Lamplighter:** the same Lamplighter with an ember-orange lantern, flame-tipped hair and a scorched-hem dress. Animations: 8-direction walk, a lob throw (Cinders), and a two-handed cast with a burst of fire (Kindle).

---

## 15. Title screen (sheets S1 to S5)

**Status: S1 to S5 are done and live.**

Hamza wants a cinematic, animated title screen like a World of Warcraft expansion launch. Claude builds the animation in code: the camera slowly pushes in through the layers, the towers and heroes shift with the phone's tilt or a finger drag, fog drifts, neon flickers, rain and embers fall, lightning flashes, and the logo reveals with a light sweep before the menu buttons slide in.

The title screen is the one place the art is NOT pixel art: it should look like epic painted key art. For that, the picture has to come in separate layers that line up. Use the same tall portrait framing (2:3) for S1 to S3. Attach `sprites/hero_reference.png` for S3. Same rules as before: image generator only, one image per message, show Hamza, no commits.

**S1 Splash sky (far layer)**
```
A tall portrait game key art background, 2:3 aspect ratio, for the title screen of a dark art deco noir game. A night sky with a huge pale moon half behind drifting clouds, faint stars, two searchlight beams crossing the sky, and a distant hazy art deco skyline along the bottom third with tiny lit windows in cyan, pink and gold, purple fog glowing at the base. No foreground buildings, no characters, no text, no frame. Epic cinematic fantasy key art like a AAA MMO expansion launch screen: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting and atmosphere, deep violet and indigo palette with neon accents.
```

**S2 Splash towers (middle layer, cut out)**
```
A tall portrait image, 2:3 aspect ratio, of two tall art deco skyscrapers framing the left and right edges, seen from a low angle looking up, with stepped crowns, gold trim, gargoyles, glowing windows and a vertical neon sign on each in cyan and pink. The centre of the image between the towers is empty. Everything that is not a building is solid flat pure magenta #FF00FF with no gradient, so it can be cut out. No magenta on the buildings, no characters, no text. Epic cinematic fantasy key art like a AAA MMO expansion launch screen: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting and atmosphere, dark noir, neon glow.
```

**S3 Splash heroes (front layer, cut out)**
```
A tall portrait image, 2:3 aspect ratio, of the two heroes from the attached reference standing side by side on the edge of an art deco rooftop ledge at night, seen from slightly below, full bodies in the lower half of the image: the bearded armoured Warden with his two axes, braced and ready, and the small brown-haired Lamplighter girl in her purple dress raising her glowing lantern staff. Wind blows her hair and his cape, the lantern casts warm light on both. The rooftop ledge with gold art deco trim runs across the bottom edge. Paint them as heroic, fully rendered illustrated characters, NOT pixel art, keeping their designs, colours and outfits from the reference: his black hair and beard, dark gold-trimmed armour with teal glow and two axes; her long brown hair with a gold star clip, purple dress with pink bow and golden lantern staff. Everything above and around them is solid flat pure magenta #FF00FF with no gradient. No magenta on the characters, no text. Epic cinematic fantasy key art like a AAA MMO expansion launch screen: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting and atmosphere, dramatic rim lighting in cyan and amber.
```

**S4 Logo**
```
A game logo with the exact text "DARK DECO" in two words on one line, spelled exactly D-A-R-K space D-E-C-O, centred on a pure solid black background. Epic AAA fantasy game logo, NOT pixel art: bold geometric art deco capital letters in polished, beveled metallic gold with engraved lines and realistic reflections, a thin inner neon glow in cyan and pink, small art deco sunburst ornaments and a horizontal line flourish under the letters. Crisp and readable, wide with lots of black space around it. No other text, no characters, no frame.
```

**S5 Fog band**
```
A wide horizontal strip, 3:1 aspect ratio, of soft wispy drifting night fog in violet and lavender, glowing faintly, smooth and high resolution, NOT pixel art, filling the middle of the image and fading to nothing at the top and bottom, on a pure solid black background. The left edge must continue seamlessly into the right edge. Painterly, no objects, no text.
```

**Sheet K2: Reaper's Stride** (replaces Condemn; one image, black background)
```
A set of 3 game art pieces in one row on a pure solid black background, with clear space between them. 1) and 2) are square ability icons, each on its own dark navy rounded tile with a thin gold art deco frame; 3) is a simple glowing button symbol with no tile. Epic painted fantasy style with neon glow, crimson and bone-white, bold readable silhouettes. No text. 1) an armoured warrior blurring forward in a crimson dash streak, greataxe trailing, shadows cut apart behind him (Reaper's Stride); 2) the same dash streak twice as long, splitting through a line of shadows (Long Stride); 3) a single crimson forward-dash glyph: a greataxe head with three speed lines behind it, glowing.
```

**Sheet L2: Lamplighter active kit** (one image, black background)
```
A set of 6 game art pieces in one row on a pure solid black background, with clear space between them. 1) to 3) are square ability icons, each on its own dark navy rounded tile with a thin gold art deco frame; 4) to 6) are simple glowing button symbols with no tile. Epic painted fantasy style with warm neon glow, gold, amber and soft white, bold readable silhouettes. No text. 1) a golden hexagonal light shield snapping over an armoured warrior, a red blow shattering against it (Guardian Ward); 2) a small girl raising her lantern as a huge golden sunburst explodes outward with healing light (Sunburst); 3) a flaming meteor crashing down onto a rooftop in a ring of fire (Meteor); 4) a glowing gold hexagon shield glyph; 5) a radiant sun glyph with long rays; 6) a falling meteor glyph with a fire trail.
```

**Sheet M: new spec abilities** (done and live) (one image, 2 rows of 2, dark background like sheets A and B)
```
A set of 4 square game ability icons in one image, in 2 rows of 2, each icon on its own dark navy rounded tile with a thin gold art deco frame and clear space between tiles, on a plain flat dark background. Epic painted fantasy style with neon glow, bold readable silhouettes that read at 48 pixels. No text, no letters, no numbers. 1) Last Rites: a crimson executioner's sigil on the ground with wounded shadows collapsing into red smoke around an armoured figure; 2) Death Knell: a giant tarnished brass bell tolling in the night sky, pale shockwave rings rolling out from it; 3) Firewall: a tall wall of orange flame rising across a rooftop between a girl with a lantern and a crowd of shadows; 4) Pyre: several burning shadows erupting into fireballs one after another in a chain.
```

---

## 16. Intro cinematic (sheets I1 to I6) · done and live

A short story intro that plays before the title screen the first time, and from a "Watch the intro" button. Claude animates it in code: slow camera pushes, parallax between plate and cutout, fog, embers, lightning, captions and music. Same painted, NOT pixel art style as the title screen. Plates are full images; cutouts go on magenta. Attach `title/src/heroes.png` for the hero cutouts and `enemies/src/boss.png` / `enemies/src/shadow.png` for the Foreman and the imps.

Story captions: 1) "Once, the city of Lumen never slept." 2) "Then the Foreman came, and his furnaces swallowed the sky." 3) "One by one, the lights went out." 4) "All but one." 5) "And the one who would not let it fall." 6) "Twelve minutes to dawn. Hold the roof."

**I1 · plate: The city before**
```
A tall portrait image, 2:3 aspect ratio, of a vast art deco city at night seen from high above the rooftops: hundreds of glowing windows, neon signs in cyan and pink, golden street lamps lining the avenues, stepped skyscrapers with gold crowns, searchlights in a clear starry sky, a peaceful, glittering city. No characters, no text. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting, dark art deco noir city at night, deep violet and indigo palette with cyan, pink and gold neon.
```

**I2 · plate: The Foreman's furnace**
```
A tall portrait image, 2:3 aspect ratio, of a colossal black-iron art deco furnace factory rising over the edge of the city at night, giant smokestacks pouring thick black smoke and violet fog that rolls down over the skyline, furnace glow in red and orange from its windows, the sky turning dark and starless. Leave the top third of the image open for a giant figure to be placed in front. No characters, no text. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting, dark art deco noir city at night, deep violet and indigo palette with cyan, pink and gold neon.
```

**I2 · cutout: The Foreman, giant**
```
A tall portrait image, 2:3 aspect ratio, of the Foreman from the attached reference painted as a towering giant seen from below: a walking furnace of red and black iron with a gold art deco crown, three burning eyes, smokestacks on his back pouring smoke, one huge fist raised over the city. Paint him as a fully rendered illustrated villain, NOT pixel art, keeping his design and colours from the reference. Upper body and raised fist fill most of the image. Everything that is not the subject is solid flat pure magenta #FF00FF with no gradient, so it can be cut out. No magenta on the subject, no ground shadow, no text. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting, dark art deco noir city at night, deep violet and indigo palette with cyan, pink and gold neon.
```

**I3 · plate: The lights go out**
```
A tall portrait image, 2:3 aspect ratio, of a narrow art deco city street at night seen from street level, a row of ornate golden street lamps going dark one after another into the distance, the nearest lamps already out and smoking, violet fog creeping along the ground, neon signs flickering off. No characters, no text. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting, dark art deco noir city at night, deep violet and indigo palette with cyan, pink and gold neon.
```

**I3 · cutout: Shadow imps on a lamp**
```
A tall portrait image, 2:3 aspect ratio, of a single ornate golden art deco street lamp post with a swarm of the shadow imps from the attached reference crawling up it and smothering the lamp, plum-purple ghostly bodies with wispy tails and glowing yellow eyes, the lamp glass cracking as its light dies. Paint them as fully rendered illustrated creatures, NOT pixel art, matching their design from the reference. Everything that is not the subject is solid flat pure magenta #FF00FF with no gradient, so it can be cut out. No magenta on the subject, no ground shadow, no text. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting, dark art deco noir city at night, deep violet and indigo palette with cyan, pink and gold neon.
```

**I4 · plate: The last light**
```
A tall portrait image, 2:3 aspect ratio, of a dark art deco rooftop at night high above a city that has gone almost completely black, only fog and a few dying embers below, the moon hidden behind black smoke, a single small pool of warm golden light in the centre of the rooftop where someone will stand. No characters, no text. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting, dark art deco noir city at night, deep violet and indigo palette with cyan, pink and gold neon.
```

**I4 · cutout: The Lamplighter**
```
A tall portrait image, 2:3 aspect ratio, of the small brown-haired Lamplighter girl from the attached reference, full body, standing alone and holding her glowing lantern staff high above her head with both hands, wind whipping her long brown hair and purple dress with pink bow, the lantern casting warm golden light down on her determined face. Paint her as a fully rendered illustrated character, NOT pixel art, keeping her design, gold star hair clip, colours and outfit from the reference. Everything that is not the subject is solid flat pure magenta #FF00FF with no gradient, so it can be cut out. No magenta on the subject, no ground shadow, no text. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting, dark art deco noir city at night, deep violet and indigo palette with cyan, pink and gold neon.
```

**I5 · cutout: The Warden lands**
```
A tall portrait image, 2:3 aspect ratio, of the bearded armoured Warden from the attached reference crashing down from above in a heroic landing, one knee and one fist striking the ground, a two-handed axe in his other hand, cape flaring up behind him, cracks and dust bursting out under him. Paint him as a fully rendered illustrated hero, NOT pixel art, keeping his black hair and beard, dark gold-trimmed armour with teal glow and axes from the reference. Everything that is not the subject is solid flat pure magenta #FF00FF with no gradient, so it can be cut out. No magenta on the subject, no ground shadow, no text. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting, dark art deco noir city at night, deep violet and indigo palette with cyan, pink and gold neon.
```

**I6 · plate: Surrounded**
```
A tall portrait image, 2:3 aspect ratio, of the same dark art deco rooftop at night now ringed by hundreds of glowing yellow eyes in the fog all around its edges, shadow creatures crowding at the ledges, a red glow from the Foreman's furnace on the horizon, a gap of clear rooftop in the centre. No main characters, no text. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting, dark art deco noir city at night, deep violet and indigo palette with cyan, pink and gold neon.
```

**I6 · cutout: Back to back**
```
A tall portrait image, 2:3 aspect ratio, of the Warden and the Lamplighter from the attached reference standing back to back in the centre, full bodies, ready to fight: he holds his two axes low and braced, she raises her glowing lantern staff, her light and his teal armour glow lighting each other. Paint them as fully rendered illustrated characters, NOT pixel art, keeping their designs, colours and outfits from the reference. Everything that is not the subject is solid flat pure magenta #FF00FF with no gradient, so it can be cut out. No magenta on the subject, no ground shadow, no text. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic volumetric lighting, dark art deco noir city at night, deep violet and indigo palette with cyan, pink and gold neon.
```

---

## 17. Story and dialogue art (D1 to D3, S1 to S5)

The game now has a story: a short intro, a playable prologue that teaches the game one step at a time through dialogue between the Warden, the Lamplighter and the Foreman, and story moments during the run (Gatekeepers, the boss, victory and defeat). Dialogue uses character portraits with expressions, and the key story moments use full painted frames with the characters painted into the scene (not cut out and pasted). Painted style, NOT pixel art. Attach `title/src/heroes.png` for the heroes and `enemies/src/boss.png` for the Foreman. Portrait sheets go on magenta; story frames are full images.

**D1: Lamplighter portraits** (becomes `portraits/lamp_*.webp`)
```
A character portrait sheet of the small brown-haired Lamplighter girl from the attached reference, 2 rows of 2, the same girl in four expressions: 1) worried, eyebrows raised, lips pressed; 2) happy, bright smile, eyes shining; 3) surprised, wide eyes, mouth slightly open; 4) shouting with determination, mouth open. Keep her long brown hair, gold star hair clip, purple dress with pink bow and warm lantern light on her face exactly as in the reference. Each portrait is a head-and-shoulders bust, facing the viewer slightly turned, centred in its own square cell with space between cells, on a solid flat pure magenta #FF00FF background with no gradient. No magenta on the character, no text, no frames. Epic painted fantasy character art like AAA MMO dialogue portraits: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic rim lighting.
```

**D2: Warden portraits** (becomes `portraits/warden_*.webp`)
```
A character portrait sheet of the bearded armoured Warden from the attached reference, 2 rows of 2, the same man in four expressions: 1) stern and calm; 2) confident grin; 3) shouting a battle cry; 4) hurt, gritting his teeth. Keep his black hair with the teal streak, black beard, dark gold-trimmed armour with teal glow exactly as in the reference. Each portrait is a head-and-shoulders bust, facing the viewer slightly turned, centred in its own square cell with space between cells, on a solid flat pure magenta #FF00FF background with no gradient. No magenta on the character, no text, no frames. Epic painted fantasy character art like AAA MMO dialogue portraits: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic rim lighting.
```

**D3: Foreman portraits** (becomes `portraits/foreman_*.webp`)
```
A character portrait sheet of the Foreman from the attached reference, 1 row of 2, the same giant iron furnace head with gold art deco crown and three burning eyes in two moods: 1) menacing, eyes narrowed and glowing; 2) roaring with laughter, furnace mouth blazing open with fire. Each portrait is a head-and-shoulders bust, facing the viewer slightly turned, centred in its own square cell with space between cells, on a solid flat pure magenta #FF00FF background with no gradient. No magenta on the character, no text, no frames. Epic painted fantasy character art like AAA MMO dialogue portraits: a richly detailed digital painting, smooth and high resolution, NOT pixel art, dramatic rim lighting.
```

**S1: The last lamp** (becomes `story/s1.jpg`)
```
A tall portrait image, 2:3 aspect ratio, cinematic key art: the small brown-haired Lamplighter girl from the attached reference stands alone on a dark art deco rooftop at night, reaching up to light a tall ornate golden lamp post with her lantern staff, the lamp flaring to life, while behind her the whole city skyline has gone dark under black smoke and violet fog. Warm gold light on her face, cold darkness everywhere else. Keep her design from the reference. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, NOT pixel art, dramatic volumetric lighting, deep violet and indigo palette with gold.
```

**S2: The meeting** (becomes `story/s2.jpg`)
```
A tall portrait image, 2:3 aspect ratio, cinematic key art: the bearded armoured Warden from the attached reference has just landed on the rooftop between the small Lamplighter girl and a wave of shadow imps with glowing yellow eyes pouring over the ledge; dust and cracked stone around his boots, both axes drawn, cape flaring; she stands behind him holding her lantern up, looking up at him in surprise. Keep both designs from the reference. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, NOT pixel art, dramatic volumetric lighting, teal and gold light against violet darkness.
```

**S3: The Foreman watches** (becomes `story/s3.jpg`)
```
A tall portrait image, 2:3 aspect ratio, cinematic key art: a colossal silhouette of the Foreman from the attached reference looms in the black smoke over the dark city, three burning eyes and a gold crown glowing through the smoke, staring down at one tiny point of golden light on a distant rooftop. Epic cinematic fantasy key art like a AAA MMO expansion cinematic: a richly detailed digital painting, NOT pixel art, dramatic volumetric lighting, red furnace glow and violet smoke.
```

**S4: Dawn (victory)** (becomes `story/s4.jpg`)
```
A tall portrait image, 2:3 aspect ratio, cinematic key art: sunrise over the art deco city of Lumen, golden light spilling across the rooftops and the city lamps lighting up again street by street, the tired Warden and the Lamplighter from the attached reference sitting side by side on the rooftop ledge, seen from behind, watching the sun come up, her lantern resting beside them. Keep both designs from the reference. Epic cinematic fantasy key art: a richly detailed digital painting, NOT pixel art, warm dawn palette of gold, rose and soft blue.
```

**S5: Darkness (defeat)** (becomes `story/s5.jpg`)
```
A tall portrait image, 2:3 aspect ratio, cinematic key art: an empty dark art deco rooftop at night, a fallen golden lantern on the wet stone with its flame guttering out, shadow imps with glowing yellow eyes closing in from the fog, the Foreman's red furnace glow on the horizon. No main characters. Epic cinematic fantasy key art: a richly detailed digital painting, NOT pixel art, cold violet palette with one dying point of gold.
```

