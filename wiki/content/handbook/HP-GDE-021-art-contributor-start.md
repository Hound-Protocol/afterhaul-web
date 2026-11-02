# Art Contributor Start: Blender, Rules and Hand-off
Status: draft. The art style is not fixed yet, and no model has passed through the whole pipeline in Unity. Where a step is a plan, this guide says so.

## Who this is for
You want to build a character, a clothing piece, a truck or a prop for AFTERHAUL in Blender. You do not need to know Unity. You do need to follow the rules below, because the game reads your model with scripts and breaks if names, scale or limits are wrong.

Two companion guides go deeper:
- [Character Modelling Guide](HP-GDE-022-character-modelling.md): body, rig, clothes, face.
- [Truck and Prop Modelling Guide](HP-GDE-023-truck-and-prop-modelling.md): trucks, parts, tires, damage zones.

## The rules that come first
1. **People make the art.** No models, textures, music, sounds or voices generated from prompts ([AI Use Policy](HP-POL-002-ai-use-policy.md)). An AI assistant may operate Blender for you to build a design you supplied. Say so in your hand-off note.
2. **Know where every asset comes from.** Everything you did not make yourself needs a source and a licence, written down ([Third-Party Assets and IP](HP-POL-003-third-party-and-ip.md)). Store packs are for use inside the game only. Never put them in a public place.
3. **Real brands stay out.** Our trucks are our own designs with our own fictional makers. A real truck, logo or product is a reference for the look, never a model to copy.
4. **Agree terms first.** Written terms for outside artists do not exist yet. Talk to the owner before you start work you want credit or payment for.
5. **The owner decides the look.** The style guide has open choices (shape language, palette, wear). Ask before you commit to a direction.

## Set up
| Item | What to do |
| --- | --- |
| Blender | Install Blender. On Linux the Flatpak from Flathub is the usual way (likely, not confirmed on every system). Use one version for the whole project and write it in your hand-off note. |
| Units | Scene units: Metric, unit scale 1.0. One Blender unit is one metre. |
| Scale | Model at real size. A standing character is about 1.8 m. |
| Rig add-on | Rigify (ships with Blender) was used for the test character. The rig contract in the character guide is what counts. |
| Texture tools | Any tool you own. Keep textures small; the game uses a shared colour palette first. |
| Version control | Keep your `.blend` files out of public repositories. Send them to the owner. |

## The route from Blender to the game
1. Model and rig in Blender, following the contract in the matching guide.
2. Export to glTF (`.glb`). It is the contract format and the one our checker reads.
3. Run the checker on your file (see below). Fix every FAIL.
4. Send the `.blend`, the `.glb`, the checker output and a short note to the owner.
5. The owner or a team member imports it into Unity. The import step runs the same checks again and builds the physical body from data.
6. You get feedback from the import. Not run in Unity yet means not proven: expect a round or two.

## Export settings (Blender glTF exporter)
These are the starting settings. They have not been proven on a full AFTERHAUL model yet.

| Setting | Value |
| --- | --- |
| Format | glTF Binary (`.glb`) |
| Transform | +Y Up (the default) |
| Apply Modifiers | On |
| Include: Custom Properties | Off |
| Mesh: Normals, Tangents | Normals on. Tangents only if your normal maps need them. |
| Shape Keys | On for the head mesh (face blend shapes). Off for everything else. |
| Skinning | On for characters. Off for rigid truck parts. |
| Animation | **Off.** Movement never comes from baked clips (decision 0007). |

Before you export: apply scale and rotation (`Ctrl+A`, All Transforms) on every object, delete unused materials and hidden objects, and check the model faces forward in Blender's front view (the exporter turns that into the game's +Z).

## Check your file
The repository ships a checker for characters:

```
python3 tools/check_character.py your_model.glb
```
It reports bones, blend shapes, weight limits, baked animation, height, target empties and triangle counts. Exit code 0 means no failure. The checker has passed its own self-test and has not yet been run on a finished character, so treat a pass as likely, not confirmed. A truck checker does not exist yet.

## What to hand over
- The `.blend` file, saved with textures packed or in a named folder.
- The `.glb` export.
- Checker output (characters).
- A note: Blender version, add-ons used, every outside asset with its source and licence, and whether an AI assistant operated any tool.
- Anything you are unsure about. Say it plainly. "Unsure: hand pivot" is more useful than silence.

## Quality bar
- Clean names. No `Cube.001`.
- No loose geometry, no flipped normals, no overlapping duplicate faces.
- One material per palette group. Few materials.
- Pivots at the real joint (door hinge, axle centre).
- Every number in a guide marked draft may change. Ask before you spend days optimising to it.

## Where to read next
- [Character Modelling Guide](HP-GDE-022-character-modelling.md)
- [Truck and Prop Modelling Guide](HP-GDE-023-truck-and-prop-modelling.md)
- [Documentation Style Guide](HP-GDE-005-documentation-style.md)
