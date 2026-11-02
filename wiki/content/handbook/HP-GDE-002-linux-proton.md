# Linux and Proton Guide
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

## Setup for testers (when a build exists)
1. Copy the Windows build to your PC.
2. In Steam, choose **Add a Game → Add a Non-Steam Game** and pick the build's `.exe`.
3. Open its **Properties → Compatibility**. Tick "Force the use of a specific Steam Play compatibility tool". Choose **Proton Experimental** or a recent **GE-Proton**.
4. Start the game. Write down the Proton version you used.
5. If the game does not start, try the other Proton version, then report it.

No special launch option is needed. The game does not load extra files next to it.

## Bazzite
These points come from general Bazzite use, not from AFTERHAUL tests (confidence: likely).
- Steam and Proton come installed.
- Install GE-Proton with **ProtonUp-Qt** (KDE images) or **ProtonPlus** (GNOME images).
- Firefox is a Flatpak. Links such as `steam://` open through the desktop portal. Allow them when asked.

## Known issues
None yet. Nothing has been run under Proton. This table fills in as tests happen.

| Problem | Fix |
|---|---|
| (none recorded) | |

## Reporting
Always include: distro and version, Steam client build, Proton version, GPU and driver. Testers follow [Quality Guide](HP-GDE-004-quality-testing.md) and [Reporting a Problem](HP-GDE-016-reporting-a-problem.md).
