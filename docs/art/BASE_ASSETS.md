# Base mode and environment: art asset list (ChatGPT prompts)

For the zombie pivot (`docs/ROADMAP.md`). Hamza generates these in ChatGPT; Claude cleans, downsizes and wires them in.
**Claude:** when work reaches base mode or the environment pass, tell Hamza which of these are still missing and give him the prompts from this file.

## How to generate
- One chat for the whole set, so the style stays consistent. Start with the style prompt (0) and attach a style reference from the live site: https://hwezyrmas.github.io/dark-deco/props/hut.png (open on the phone, save the image, attach it).
- One object per image unless the prompt asks for a grid. Ask for a **transparent background** every time; if one comes back with a background, ask "same image, transparent background".
- Generate at the default size (1024). Claude downsizes to game size (props are 128 px source, about 22-58 px in game) and fixes the pixel grid.
- ChatGPT can't animate reliably: zombies are generated as one still pose here, then animated in PixelLab from that image (walk 8 frames, attack 6 frames).
- Send files with the number and name, e.g. `04-barricade-intact.png`. Claude puts them in `art/base/`.

## Prompts
0 style setup, then A buildings (1-18), B zombies (19-24), C pickups and icons (25-28), D ground and decals (29-32), E ruins and props (33-42), F sky (43-44), G effects (45-46).

### 0. Style setup (send first, with hut.png attached)
I'm making sprites for a top-down pixel-art game. Match the style of the attached image exactly: painted pixel art, top-down 3/4 view, dark noir Art Deco city, brass-gold trim, rust, charcoal and moss green, crisp pixel edges, strong readable silhouette. Setting: a 1930s Art Deco city abandoned after a zombie outbreak and now overgrown by nature (ivy, moss, grass, small trees). For every sprite I ask for: one object, centered, fully visible, transparent background, soft contact shadow under it only, no text, no letters, no frame, no ground under it. Reply "ready".

### A. Base buildings
1. Generator shack (the core), intact: a small Art Deco brick shack housing a humming brass generator, thick cables running out, warm amber light glowing from a round window, ivy creeping over the roof edge, footprint of 2x2 floor tiles. Transparent background, same style.
2. Same generator shack, damaged: cracked bricks, one window broken, a cable sparking, scorch marks, light flickering dimmer. Same angle and size. Transparent background.
3. Same generator shack, nearly destroyed: roof caved in on one side, sparks and smoke, the generator still barely glowing. Same angle and size. Transparent background.
4. Barricade wall, intact: a chest-high barricade of nailed wooden planks, a corrugated scrap metal sheet and a wooden crate, fits one square floor tile. Transparent background, same style.
5. Same barricade, damaged: planks split, metal sheet bent, nails sticking out. Same angle and size. Transparent background.
6. Same barricade, broken: a low heap of splintered planks and twisted metal. Same angle and size. Transparent background.
7. Reinforced wall (upgrade): a steel-plated barricade with brass Art Deco rivets and a row of sandbags, fits one square floor tile. Transparent background, same style.
8. Spike trap, new: a flat square trap of sharpened rebar and broken iron railings pointing up, fits one floor tile, seen from above. Transparent background, same style.
9. Same spike trap, worn: half the spikes bent or snapped, rust and green stains. Same angle and size. Transparent background.
10. Arc Pylon turret, idle: an Art Deco tesla pylon on a brass base, a glass tube with a soft magenta electric glow, a copper coil on top, about as tall as a person. Transparent background, same style.
11. Same Arc Pylon, firing: bright magenta arcs crackling from the top coil, glass tube blazing. Same angle and size. Transparent background.
12. Floodlight lamp: an Art Deco street lamp rewired as a floodlight, cold cyan-white glow, ivy climbing the pole, cables taped to it. Transparent background, same style.
13. Barricade gate, closed: two plank doors on brass hinges set in a short scrap wall, a chain across them, fits two floor tiles wide. Transparent background, same style.
14. Same gate, open: doors swung inward. Same angle and size. Transparent background.
15. Salvage workbench (armory): a heavy workbench with a vise, wrenches, gears, an axe being sharpened and a small brass lamp. Transparent background, same style.
16. Infirmary tent: a small canvas field tent with a faded medical cross, a cot and a hanging lantern visible inside. Transparent background, same style.
17. Radio mast: a rooftop radio mast made of scrap pipe and an old Art Deco radio cabinet at its base, a blinking red light on top. Transparent background, same style.
18. Supply stockpile: stacked supply crates, fuel cans and a scrap pile under a weathered tarp. Transparent background, same style.

### B. Zombies (one still pose each, facing right; animate later in PixelLab)
19. Walker: a zombie in a torn 1930s pinstripe suit and fedora, grey-green rotting skin, glowing yellow eyes, slow shambling pose, arms reaching forward, full body, facing right. Transparent background, same style.
20. Runner: a thin fast zombie flapper in a torn beaded dress and headband, mid-sprint lunge, glowing yellow eyes, full body, facing right. Transparent background, same style.
21. Brute: a huge zombie dockworker with rolled sleeves, swollen arms and a chain wrapped around one fist, hunched, full body, facing right. Transparent background, same style.
22. Bloater: a swollen zombie in a stained waiter's uniform, belly covered in glowing green pustules about to burst, full body, facing right. Transparent background, same style.
23. Rot Knight: a zombie 1930s riot policeman with a dented helmet, a cracked riot shield and a baton, armored and slow, full body, facing right. Transparent background, same style.
24. Rot King (boss): a giant zombie crime boss in a rotting fur coat with a brass crown, vines, moss and fungus growing from his back and shoulders, glowing green eyes, twice the size of the others, full body, facing right. Transparent background, same style.

### C. Pickups and icons
25. Scrap pickup: a small pile of scrap metal, bolts, gears and a bent pipe, readable at very small size. Transparent background, same style.
26. Parts pickup: a glowing cyan vacuum tube lying on a copper coil, readable at very small size. Transparent background, same style.
27. Build icons: a 3 by 2 grid of six square icons with clear empty space between them, each a gold Art Deco frame on a dark background: barricade, spike trap, tesla pylon, floodlight, hammer (repair), crossed-out crate (remove). No text.
28. Gate marker: a red painted warning chevron on the floor pointing inward, Art Deco style, flat on the ground, seen from above. Transparent background, same style.

### D. Ground and decals
29. Ground tile: a seamless tileable square texture seen straight from above, old Art Deco rooftop tiles in charcoal and dull brass, cracked, with moss and grass growing in the cracks. Edges must tile seamlessly. No objects.
30. Ground tile variant: a seamless tileable square texture seen straight from above, cracked concrete with small puddles, leaves and weeds. Edges must tile seamlessly. No objects.
31. Overgrowth decals: a 4 by 4 grid of separate small ground decals seen from above with space between them: moss patches, grass tufts, fallen leaves, small flowers, vine clumps. Transparent background.
32. Damage decals: a 4 by 4 grid of separate ground decals seen from above with space between them: cracks, puddles, scorch marks, green zombie splats, scattered bricks. Transparent background.

### E. Ruins and environment props (blocking obstacles)
33. Rubble pile: a wide heap of collapsed bricks and concrete chunks with weeds and a small sapling growing out of it, about three floor tiles wide. Transparent background, same style.
34. Collapsed water tower: a rooftop wooden water tower toppled on its side, broken staves, ivy covering it. Transparent background, same style.
35. Fallen neon sign: a large Art Deco neon sign frame lying broken, dead glass tubes, no readable letters, vines through it. Transparent background, same style.
36. Rusted machinery: a rooftop air-conditioning unit rusted through, ivy pouring out of its grille. Transparent background, same style.
37. Overgrown gargoyle: an Art Deco stone gargoyle on a plinth, cracked and covered in ivy and moss. Transparent background, same style.
38. Tree through a skylight: a young tree growing up through a smashed Art Deco skylight frame. Transparent background, same style.
39. Abandoned car: a rusted 1930s sedan with flat tyres, plants growing out of the open windows. Transparent background, same style.
40. Laundry line: two poles with a sagging line of tattered sheets, faded colours. Transparent background, same style.
41. Barrels and junk: a cluster of rusty oil drums, a broken chair and a birdcage. Transparent background, same style.
42. Dead street clock: a tall Art Deco street clock with a cracked face and no numbers, ivy up the post. Transparent background, same style.

### F. Sky and background
43. Night background: a wide 16:9 painting of an abandoned Art Deco skyline reclaimed by jungle, towers wrapped in vines, no lights in any window, a large moon behind clouds, deep blue-green palette, painted pixel art. No text.
44. Same skyline at dusk: warm orange sky fading to violet, mist between the towers, birds. Same composition. No text.

### G. Effects (optional, the PixelFX library covers most)
45. Zombie death burst: a 4 by 2 grid of frames of a green-black splatter bursting outward and fading, seen from above, transparent background.
46. Build dust: a 4 by 2 grid of frames of a small puff of dust and wood chips rising and fading, transparent background.
