# Character Modelling Guide: Body, Rig, Clothes and Face
Code: HP-GDE-022 · Version 1.0 · Effective 2026-11-02 · Owner: Art · For: anyone modelling the driver, clothes or faces
Audience: Makers
Summary: The parts a character needs, the rig contract, body types, clothing slots, face shapes and how to check them.

Status: draft. The rig contract is written and checked by a script. It has not been run on a finished character in Unity. All counts and limits are draft.

Read [Art Contributor Start](HP-GDE-021-art-contributor-start.md) first. It covers set-up, rules and export.

## How the character works
The driver is an active ragdoll: a body of physical parts that code steers with targets (decision 0007). Your mesh and skeleton come from Blender. **The movement does not.** There are no baked animation clips in the design. The game sets poses from code, such as "hand on the wheel" or "foot on the pedal".

For testing only, an animated walk from Mixamo plays on a hidden copy of the body, so a tester can see the character move while the physical body is still being tuned. That clip is not part of the design and is not distributed.

What this means for you: build a clean, correctly named, correctly weighted body. Do not spend time on animation.

## The parts you build
| Part | What it is | Notes |
| --- | --- | --- |
| Base body | Neutral, undergarment-level body with no anatomical detail | Recommended for store ratings and moderation. Not final until the owner confirms. |
| Head | Head mesh with face blend shapes | Seven shapes, named exactly (below). |
| Hair, eyes, nose, mouth, head shape | Creation options | Fixed options with a small adjustable range. Counts and ranges are in the game data. |
| Clothing | One modular, skinned piece per slot | Ten slots (below). |
| Hand and foot targets | Four empties | Where code aims the hands and feet. |

## Rig contract
The skeleton has 11 bones. Names match exactly, in lower case.

| Bone | Covers |
| --- | --- |
| `pelvis` | Hips |
| `torso` | Spine and chest |
| `head` | Neck and head |
| `upper_arm_l`, `upper_arm_r` | Upper arms |
| `forearm_l`, `forearm_r` | Forearms **and hands** |
| `thigh_l`, `thigh_r` | Thighs |
| `shin_l`, `shin_r` | Shins **and feet** |

Rules:
- **One bone per body part.** Hands belong to the forearms. Feet belong to the shins. No finger or toe bones in the contract skeleton.
- **Skin weights:** only to these bones, at most four per vertex.
- **Rest pose and limits:** set rest pose and joint limits (ball or hinge, swing, twist) as a guide. Unity reads the real limits and masses from a data file, not from your mesh.
- **Scale and axes:** one unit is one metre. Standing height is 1.8 m at the default body type. After import, +Z is forward and +Y is up.
- **No baked animation** in the file. A reference pose (seated, standing, reach, crouch) is allowed as a single static pose. It is never played as a clip.
- **Target empties:** `hand_target_l`, `hand_target_r` at the grip centre of each hand, and `foot_target_l`, `foot_target_r` at the sole of each foot. These names are a proposal. The checker uses them, and the owner has not confirmed them.

### About the test character
The current test character is a free Asset Store pack with a Rigify-style rig. It has more bones than the contract. In Unity it maps fully to the Humanoid avatar, and the physical body is built from a bone map that merges the extra bones into the 11 parts. A model you build for the game should follow the contract directly, so no merge is needed. If you want to use a Rigify rig, keep the contract bones as your deform bones and say so in your note.

## Body types
There are five body types: Regular, Athletic, Brawny, Thin and Fat. Each has its own speed, stamina, needs and resistances (set in game data, not in your mesh).

For you, the rule is simple: **all five share the same bone names and the same rest layout.** Make each type by reshaping the same base, so one clothing piece can fit all five. Test every clothing piece on every type.

## Clothing
Ten slots, one modular skinned piece each.

| Slot | Tips |
| --- | --- |
| Hat, mask | Keep masks open at the back so they work with every head shape. |
| Inner chest layer, outer chest layer, jacket | Build from the inside out. Each layer sits slightly outside the one below, with no poke-through. |
| Gloves, pants, shoes | Gloves follow the forearm bone. Shoes follow the shin bone. |
| Beltpack, backpack | Rigid parts parented to `pelvis` or `torso`. |

- **Hidden skin zones.** When a piece covers part of the body, the game hides that skin zone. Name or group your body mesh so zones can be hidden (chest, arms, legs, feet, hands, head). Ask the owner for the zone list before you split the body.
- **Little physical parts.** A hood, strap or loose edge may have a few extra secondary bones, kept cheap and switched off at a distance. Keep it to a handful per character.
- **Wind.** Cloth flutter in the wind is a shader effect, so do not model it. Use vertex colours or a mask only if the owner asks.
- **Colour.** Tint comes from a shared palette. Use flat, palette-friendly colours.
- **Test:** dress the base body in every slot and check no skin pokes through. Repeat on all five body types.

## Face
Face expression follows the player's voice, if the player turns it on (decision 0017, proposed). The head mesh carries seven shape keys. Names are exact and case-sensitive.

| Shape key | Used for |
| --- | --- |
| `browDown` | Anger |
| `browInnerUp` | Worry, crying |
| `smile` | Laugh |
| `frown` | Sadness |
| `eyeSquint` | Laugh, anger |
| `eyeClosed` | Blink, rest |
| `mouthOpen` | Speech (the jaw follows loudness) |

Each runs from 0 to 1. The game drives these seven and nothing else. Keep them readable at low polygon counts: big, clear shapes beat fine detail. Also design a neutral face that reads well when none of them are active.

## Look and budget
- Low poly with a little extra detail. The art style guide still has open choices, so ask the owner before locking a style.
- A per-character triangle budget is **not set yet.** Keep the mesh light, since many characters can be near each other.
- Materials: few, palette-based.

## Step by step
1. Block out the base body at 1.8 m. Apply scale.
2. Build the 11-bone skeleton and name the bones exactly.
3. Add the four target empties.
4. Skin with weights to those bones only, four per vertex at most.
5. Check bending: arms and legs should bend at the elbow and knee without tearing.
6. Add the seven shape keys on the head.
7. Build the other four body types from the same base.
8. Build the clothing slots and test them on every type.
9. Export `.glb` with Animation off and run `python3 tools/check_character.py model.glb`.
10. Fix every FAIL. Send the hand-off pack.

## Mistakes we have seen
- Humanoid clips need an Animator and an Avatar in Unity. A character stuck in a T-pose is usually missing one. That is a Unity step, not a model fault.
- A rig with no avatar and generic bones still works for the physical body, but it cannot play clips.
- A pack character with clothes painted into the body has no body underneath. Ask the owner for a base body.

## Where to read next
- [Truck and Prop Modelling Guide](HP-GDE-023-truck-and-prop-modelling.md)
- [Third-Party Assets and IP](HP-POL-003-third-party-and-ip.md)
