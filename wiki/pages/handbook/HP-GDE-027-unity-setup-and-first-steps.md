# Unity Setup and First Steps
Code: HP-GDE-027 · Version 1.0 · Effective 2026-11-02 · Owner: Code · For: anyone setting up Unity for AFTERHAUL
Audience: Makers
Summary: Set up Unity 6.3 LTS on Linux (Bazzite) and Windows, with each step marked worked or unverified.

Status: draft. Written 2026-11-02 from the owner's notes. "Worked" means the owner did it and confirmed it. "Unverified" means nobody has confirmed it yet.

## What we use
Unity 6.3 LTS (editor version 6000.3.27f1) with the Universal 3D (URP) template. The owner develops on Bazzite Linux. AFTERHAUL is planned as a Windows build that runs on Proton. See the [Linux and Proton Guide](HP-GDE-002-linux-proton.md).

## Install
| Step | Linux (Bazzite) | Windows |
|---|---|---|
| 1. Install Unity Hub | Worked | Unverified |
| 2. Install Editor 6000.3.27f1 from the Hub | Worked | Unverified |
| 3. Activate the Editor licence | Worked | Unverified |
| 4. Create a project from the **Universal 3D (URP)** template | Worked | Unverified |

## Bring in the game files
The game's repository root is **not** a complete Unity project. It lacks the project settings and package list. So:
1. Create the URP project as above.
2. Copy the game's two content folders into the new project's `Assets` folder. Worked on Linux. Unverified on Windows.
3. Keep Unity's generated settings out of the repository for now. How to bring a validated project into version control: not decided yet.

## The window
| Panel | What it does |
|---|---|
| **Hierarchy** (left) | The objects in the open scene. Click one to select it |
| **Inspector** (right) | The settings of what is selected |
| **Project** (bottom) | The files. If hidden: **Window > General > Project** |
| **Console** (next to Project) | Errors in red. Press **Clear**, then act |
| **Scene** and **Game** views | The editor view and the player's view |

The small spinner at bottom right means Unity is importing or compiling. Wait for it before pressing Play.

## Habits that save hours
1. Changes made while Play is on are lost when you stop. Set fields with Play stopped, then press **Ctrl+S**. Worked.
2. After copying a file in, click into the Unity window so it imports.
3. Press Play to test, press Play again to stop. A blue tint means Play is on.
4. If the Inspector stays stuck on an asset, click the **padlock** at its top right. Worked.
5. A greyed-out **Apply** button means nothing is left to apply. Worked.
6. Drag a file from your file manager into the **Project** panel to import it. Worked.

## Set up the test bench (once)
1. Open the map scene and save it as a new scene.
2. Add an empty object named **Bench**. Click **Add Component** and choose the test bench script. Worked.
3. Drag the character prefab into the **Characters** field. Press Play. W A S D walk, Shift runs, right mouse looks, R restarts. Worked.

## Pink objects
Pink means the material is for the old render pipeline. Select the materials, then **Edit > Rendering > Materials > Convert Selected Built-in Materials to URP**. Worked.

## Run the tests
On Linux, floating windows such as the Test Runner can show blank. Run tests from a terminal in batch mode instead (Edit Mode, no graphics). Worked: 100 of 100 passed on the owner's machine on 2026-10-31. Exit code 0 plus no failures in the results file means pass. On Windows: unverified.

## Errors you can ignore
- A message about "generators.ai.unity.com" comes from Unity's own AI Assistant package, which is not licensed for the account. Likely harmless.
- "No cameras rendering" outside Play mode is normal.

## Not verified yet
- A Windows player build.
- A Proton test.
- A runtime entry scene that boots the game. Passing tests does not prove the game starts.
- Code is unverified in Unity until it compiles and its test scene runs ([Quality and Testing](HP-GDE-004-quality-testing.md)).

## Next
[Animation and Rig Guide](HP-GDE-029-animation-and-rig-guide.md) · [Game Dev Trainee Guide](HP-GDE-026-game-dev-trainee-guide.md)
