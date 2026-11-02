# Linux and Proton Guide
Code: HP-GDE-002 · Version 1.1 · Effective 2026-11-02 · Owner: Quality · For: players and testers on Linux
Audience: Players
Summary: How AFTERHAUL is meant to run on Linux through Proton, what is tested and what is not.

## Status
AFTERHAUL is not playable yet. There is no build to install. This page says how Linux support is planned and how early testers will run builds when they exist. Every item below is **unknown** until it is tested on a real Linux PC (Bazzite).

## The plan
- Until 1.0 there is **one Windows build**. It must run on Linux through Proton (Steam Play).
- A native Linux build is planned after 1.0. Other platforms depend on how the game does.
- The build avoids kernel-level anti-cheat, launchers with their own browser and Windows-only tricks. This keeps Proton working.
- The team tests every milestone on Linux with Proton, not only on Windows.

| Claim | Confidence |
|---|---|
| Proton runs most Unity games built for Windows | likely |
| Audio libraries work under Proton | likely, to be checked |
| Microphone input works under Proton | unknown, to be tested early |
| Best graphics API for Proton (Vulkan or Direct3D 11) | unknown, to be tested |
| Audio middleware, speech recognition, Steam features and controller input under Proton | unknown, each to be tested (microphone is the highest risk) |

## What the build must avoid
These rules keep Proton working. They apply to everyone who changes game code.
| Rule | Why |
|---|---|
| One Windows build, no kernel-level anti-cheat, no launcher with its own browser | Proton cannot run them |
| No Windows-only calls (registry, drive-letter paths, shell tricks) | They fail on Linux |
| Use the engine's own save-folder and path helpers | Paths differ between systems |
| Keep file names in the right upper and lower case | Linux tells `Truck.json` from `truck.json`, Windows does not |

## Setup for testers (when a build exists)
1. Copy the Windows build to your PC.
2. In Steam, choose **Add a Game → Add a Non-Steam Game** and pick the build's `.exe`.
3. Open its **Properties → Compatibility**. Tick "Force the use of a specific Steam Play compatibility tool". Choose **Proton Experimental** or a recent **GE-Proton**.
4. Start the game. Write down the Proton version you used.
5. If the game does not start, try the other Proton version, then report it.

Whether a special launch option is needed: unknown until a build is tested. The plan is that none is needed. Do not add one unless a report says so.

## Bazzite
These points come from general Bazzite use, not from AFTERHAUL tests (confidence: likely).
- Steam and Proton come installed.
- Install GE-Proton with **ProtonUp-Qt** (KDE images) or **ProtonPlus** (GNOME images).
- Firefox is a Flatpak. Links such as `steam://` open through the desktop portal. Allow them when asked.

## Checks at every milestone
1. Build for Windows and copy the build to the Linux PC.
2. Add it as a non-Steam game and force one Proton version (see above).
3. Run the milestone's acceptance tests. Log frame time and physics time.
4. Note crashes, missing audio, input problems and microphone problems.
5. Record the result and the Proton version in the quality records ([Quality Guide](HP-GDE-004-quality-testing.md)).

If the microphone fails under Proton, the plan is a clear message, voice commands off and keyboard shortcuts working. This fallback is not built yet.

## Known issues
None yet. Nothing has been run under Proton. This table fills in as tests happen.

| Problem | Fix |
|---|---|
| (none recorded) | |

## Reporting
Always include: distro and version, Steam client build, Proton version, GPU and driver. Testers follow [Quality Guide](HP-GDE-004-quality-testing.md) and [Reporting a Problem](HP-GDE-016-reporting-a-problem.md).

## Where to read next
- [Quality Guide](HP-GDE-004-quality-testing.md): rig table and test kinds
- [Tester's Field Manual](HP-GDE-020-testers-field-manual.md): how to benchmark on MangoHud
- [Reporting a Problem](HP-GDE-016-reporting-a-problem.md): what to send
- [Frequently asked questions](../library/faq.md) and [Roadmap](../library/roadmap.md)
