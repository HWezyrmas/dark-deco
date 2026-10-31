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
