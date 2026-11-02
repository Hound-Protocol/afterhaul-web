# Truck and Prop Modelling Guide: Parts, Tires, Pivots and Damage Zones
Code: HP-GDE-023 · Version 1.0 · Effective 2026-11-02 · Owner: Art · For: anyone modelling trucks, truck parts or props
Audience: Makers
Summary: How a truck is split into parts, which pivots and scale to use, how tires and damage zones work, and what to deliver.

Status: draft. Every number here is a first guess. No truck has been through the full pipeline in Unity, and there is no truck checker yet.

Read [Art Contributor Start](HP-GDE-021-art-contributor-start.md) first.

## The idea
A truck is a real physical machine: a frame, axles, wheels, a driveshaft and a cab. The game simulates the parts, so your model must be built as separate parts with correct pivots. One welded mesh cannot be simulated.

## One truck, one folder
Everything about one truck lives in one folder. Nothing about it lives anywhere else.

```
<truck_id>/
  truck.json      manifest (the only file the game reads first)
  README.md
  mesh/           models (glTF), with a full underbody
  textures/       albedo, normal, dent, scratch and height maps
  parts/          engine, gearbox, tire definitions when split out
  audio/          sound banks supplied by the owner
```
The same layout is the modding format. A script checks that the subfolders exist and that `truck.json` is valid.

## Split the model into parts
Use separate objects, named clearly:

| Part | Notes |
| --- | --- |
| Frame (chassis) | Main body of the truck. A simple collision shape goes with it. |
| Axles, differentials, links | **Full underbody.** The game shows and simulates the driveshaft, axles and diffs. |
| Driveshaft | Own object, pivot on its spin axis. |
| Wheels and tires | One object per wheel, **pivot at the axle centre.** |
| Cab | Own object. It moves on a spring, so it must be separable from the frame. |
| Doors | One object each, **pivot at the hinge.** |
| Windows | Own object per window, or per door. |
| Cargo area (bed) | Own object. |
| Damage zones | About eight areas (bumper, hood, doors, bed and so on). See below. |

### Mount points
Parts such as a winch, a rack or a toolbox attach to **mount points** on the truck. A truck has about eight. A mount point has a kind and a size. Put an empty at each one and name it clearly. Ask the owner for the current mount list before you place them.

### Anchors
Empties for the driver seat, fuel cap, hitch and winch points. Name them clearly: `seat`, `fuel_cap`, `hitch`, `winch_front`.

## Scale, axes and pivots
- One unit is one metre. Apply scale and rotation on every object.
- Forward is +Z in the game. Model facing Blender's front view and let the exporter convert (likely correct, not yet verified on a real truck).
- **Pivots sit at the real joint:** axle centre for wheels, hinge line for doors.
- Delete anything you cannot see and no part uses.

## Budget (draft)
| Item | Value |
| --- | --- |
| Triangles per truck | 15,000 to 25,000 (a guess) |
| Levels of detail | 3 steps; the lowest keeps the silhouette |
| Materials | A shared palette atlas, few materials, no big textures |
| Collision | Simple shapes on a separate layer |

## Tires
Tires squash and bulge by pressure and load, so the mesh needs room to move.
- Add **3 to 4 extra rings around the sidewall** so it deforms cleanly.
- About **500 to 800 triangles** per tire at the highest level of detail.
- Make **three shapes** per tire: rated pressure, low pressure and flat contact patch. The game blends between them. Use shape keys or three meshes with the same vertex order, and ask the owner which the import expects.
- Tread belongs in the texture or the normal map, not in the mesh, except on hero tires.

## Damage zones
A truck has about eight zones. Each zone has its own mesh. A hit pushes vertices inward up to a capped depth, so a mesh cannot collapse. So:
- Give each zone enough vertices to dent: avoid long thin triangles.
- Keep each zone as its own object, so its vertex buffer is separate.
- Scratches, dirt and paint loss are not geometry. They are shader values, so UV-map each zone cleanly and leave room on the texture for scratch, dent and paint-loss maps.
- Which zone affects which function (a crushed radiator overheats) is set in data, not in your mesh.

## Props and cargo
- Props follow the same rules: real scale, clear names, pivots at their handle or hinge.
- Anything the driver grabs (a wheel, a gear knob, a handle) needs a grip point. Place an empty at the grip centre.
- Cargo needs a simple collision shape and a real-world size. Mass comes from game data.

## Reference rules
- Reference is for the look only. A real maker's truck is never copied, and its model is never used.
- Record every outside model, texture or pack with its source and licence ([Third-Party Assets and IP](HP-POL-003-third-party-and-ip.md)).

## Hand-off
Send the truck folder, the `.blend`, and a note listing: Blender version, parts list, mount points, triangle counts per level of detail, outside assets with licences, and anything you are unsure about.

## Where to read next
- [Character Modelling Guide](HP-GDE-022-character-modelling.md)
- [Art Contributor Start](HP-GDE-021-art-contributor-start.md)
