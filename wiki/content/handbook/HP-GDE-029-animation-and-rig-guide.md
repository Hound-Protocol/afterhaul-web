# Animation and Rig Guide
Status: draft. Steps marked "worked" were done and confirmed by the owner on Linux. The animation design is not final.

## Test clips are not the design
AFTERHAUL's design is a body driven by code-driven poses. Ready-made clips are used only as a **test**, to see how a character moves. A test clip is not a design decision. Do not build anything on the assumption that clips ship in the game.

## Where clips come from
| Source | Use | Licence note |
|---|---|---|
| [Mixamo](https://www.mixamo.com) (Adobe) | Test only | An Adobe community FAQ (2022, not the official terms) says commercial use in games is allowed, raw files must not be redistributed and the clips may not be used to train machine learning. Whether clips shipped inside a game count as distribution: unknown. Read Adobe's current terms before release. |

Rules:
- Keep clip files **out of git** and out of any public repository.
- Each person downloads their own copy.
- When a source is imported for real use, add it to the third-party list ([Third Party and IP](HP-POL-003-third-party-and-ip.md)).
- Nothing generated from prompts ([AI Use Policy](HP-POL-002-ai-use-policy.md)).

## Set up the character (Humanoid)
1. Click the character model in the **Project** panel and open the **Rig** tab.
2. Change **Generic** to **Humanoid** and click **Apply**. Worked. (Generic cannot share animations.)
3. Click **Configure** next to the Avatar row to see the bone map. Green circles are mapped bones. Red means a problem. Our test character mapped fully by itself. Worked.
4. In Configure, at the bottom, use **Pose > Enforce T-Pose** or **Reset** to set the reference pose. **Muscles & Settings** lets you test how a joint bends. Click **Done** to leave. While Configure is open you cannot select scene objects. Worked.
5. The model has a sub-item called **Avatar** (a small person icon). Drag it into the `Character Avatar` field on the test bench. Worked.

If the character stays in a T-pose, it has no Animator or no Avatar. The model's Rig must be Humanoid, and the Avatar must be in that field.

## Set up a clip
1. Do the same Humanoid step on the clip file.
2. Under the **Animation** tab, tick **Loop Time**. Worked.
3. Find the clip under the arrow on the file. Drag it into the **Walk Clip** or **Idle Clip** field. Worked.

Mixamo download settings that worked:
| Setting | Value |
|---|---|
| Format | FBX for Unity |
| Skin | Without Skin |
| Frames per second | 30 |
| Keyframe reduction | none |
| In Place | ticked |

**In Place** keeps the clip from walking away from its start. The game moves the body, not the clip.

## Save your work
Changes made while Play is on are lost. Set fields with Play stopped, then press **Ctrl+S**.

## Common problems
| Symptom | Likely cause and fix |
|---|---|
| Feet slide | Body speed and clip foot speed differ. Match the walk speed to the clip, do not tune two speeds by hand |
| Character hovers | Character controller skin width is too large. Set it small |
| Toes point up, knees bend backwards | Check the avatar mapping, then **Pose > Reset** or **Enforce T-Pose**, then the muscle sliders. Change one thing at a time |
| Nothing visible happens | Show the state on screen first, then change one thing at a time |

These causes come from the owner's own sessions. Confidence: likely, since they were fixed in the owner's Unity and not tested elsewhere.

## Physical reactions
Clips drive the visible body. A physical ragdoll takes over for hits and falls. A fully physical walk is a later goal and is not built. Unverified in Unity beyond the owner's tests.

## Related
[Unity Setup and First Steps](HP-GDE-027-unity-setup-and-first-steps.md) · [Character Modelling Guide](HP-GDE-022-character-modelling.md) · [Art Contributor Start](HP-GDE-021-art-contributor-start.md)
