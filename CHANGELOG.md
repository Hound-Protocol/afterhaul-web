# Changelog

All notable changes to the AFTERHAUL website. Pre-release versions are `0.0.x-pre`; the site is offline until launch.

## 0.3.3-pre · About titles · 2026-10-28
- About sections renamed: About AFTERHAUL, Character classes, The world of AFTERHAUL, Design choices, Current State of AFTERHAUL. The navigation bar uses the same names.

## 0.3.2-pre · Frontline pacing · 2026-10-28
- The dark clods now rise and fall at the same slow pace as the mud pillar.
- Shells fall twice as fast, each at a slightly different angle.

## 0.3.1-pre · Videos stop when you leave About · 2026-10-28
- Leaving About (back to the choices, or another section) removes any playing video and brings back its preview.

## 0.3.0-pre · Wiki, changelog, community, press · 2026-10-28
- Pick a section: the chosen button glides to the centre, the others fade away and the content rolls out below. A larger All sections button on the right brings the choices back. Each button has its own frame, and there is more space between the buttons and the content.
- About is now one loose page with a navigation bar on top (What it is, The crew, The land, Design choices, Where we are). The collapsible sections are gone.
- Documentation became the Wiki, "Documentation of AFTERHAUL": a pillar of coloured folders on the left, document cards on the right with a document count, and a reader that opens the chosen document in the centre. Every step is animated. Built by tools/build_docs.py.
- Dev log became Changelog: the website log on the left and a selected, player-facing game log on the right, each laid out as a document with its own colour (tools/build_changelog.py).
- Community lists Discord (held until the prototype), Instagram and YouTube (links to come). Press lists the contact address.

## 0.2.1-pre · Sound text · 2026-10-27
- The in-cab sound design video text and the crash sound text now use the owner's wording.

## 0.2.0-pre · Explore tabs, documentation, collapsible sections · 2026-10-27
- New tab row under the hero: About, Documentation, then three placeholder tabs (Dev log, Community, Press), each with its own colour and texture. The three are marked Soon.
- About holds the game, crew, land and design sections as collapsible sections (sound and visual design are nested inside Design). Expand all and Collapse all buttons on every panel. Deep links such as #land and #docs open the right tab and section.
- Documentation holds the player guide, built from the game repo by tools/build_docs.py (decision 0018).
- The work-in-progress pop-up has a new animation: striped bar, drawn warning triangle, staggered text, animated close.
- Land cards are no longer selectable and do not react to the mouse. Northern wild wind is now constant. Frontline impacts gently shake the scene. Timber country has a sawmill with a spinning saw, sawdust, and smoke.

## 0.1.20-pre · Visits counter (prepared) · 2026-10-27
- The dashboard bar shows a visits counter in place of Idling / Under load. It counts one visit per browser session through GoatCounter and stays at ---- until the site code is put in the goatcounter meta tag.

## 0.1.19-pre · Discord on hold · 2026-10-27
- The Join the Discord button is no longer a link. It is crossed out on a red striped background, with a red note: Discord opens once the game has a prototype.

## 0.1.18-pre · Link preview text · 2026-10-27
- New description for search, Discord and other link previews (also set as Open Graph and Twitter card text).

## 0.1.17-pre · Progress text · 2026-10-27
- "Where we are" now says the game is in early development stages and that updates will be posted here and at the BETA launch on Steam.

## 0.1.16-pre · Operators text · 2026-10-27
- "Heavy Cargo Operator" is now "Heavy Ordnance Operator". The talk paragraph is replaced by the line about operators being capable alone while specialists outperform at their specialty.

## 0.1.15-pre · Warzone firefight · 2026-10-27
- Frontline: tanks and soldiers stand still in the far background behind the rocks (no wobble) and shoot at each other: rifle bursts with muzzle flashes and tracers, tank shells with impact flashes.

## 0.1.14-pre · Warzone units and placeholder figure · 2026-10-27
- Frontline: tanks (two driving, one parked that fires with a muzzle flash when a shell is launched) and kneeling soldiers sit in the background, behind the ruins.
- Visual design: the owner's placeholder character picture is shown, with the placeholder notice. Listed in THIRD_PARTY_NOTICES.md; source and licence to confirm.

## 0.1.13-pre · City traffic · 2026-10-27
- The city card shows a skyline with lit windows, street lights and two lanes of moving traffic (headlights and tail lights). No weather.

## 0.1.12-pre · Mud pillar and debris · 2026-10-27
- Frontline: the mud pillar is now made of particles that rise slowly, get smaller and more scattered toward the top, then fall back as the pillar sinks. Six times more flying debris.

## 0.1.11-pre · Story · 2026-10-27
- About section: the twist (illicit cargo, choices shape each region), the country at war and the recovery task force, campaign and side quests, and the characters you meet.

## 0.1.10-pre · Video previews · 2026-10-27
- Each sound-design video shows its YouTube preview picture (linked from YouTube, not copied). Footer and note now say previews and videos come from YouTube.

## 0.1.9-pre · Design choices · 2026-10-27
- New "Design choices" section: sound design (three click-to-play YouTube videos with the team's notes) and visual design (with a placeholder image frame and the "not actual in-game graphics" notice).
- Videos use youtube-nocookie.com and load only after you press play. Footer wording updated to say so.

## 0.1.8-pre · Howitzer frontline · 2026-10-27
- Frontline: one shell every 5 to 10 seconds, falling very fast. Each impact raises a thin column of mud that climbs slowly high above the ground, then collapses.

## 0.1.7-pre · Work-in-progress pop-up · 2026-10-27
- A pop-up on first load says the site and game are a work in progress with placeholders and incomplete features. It shows once per visit; the red bar stays.

## 0.1.6-pre · Cache busting · 2026-10-27
- Stylesheet and script links carry a version, so browsers load new files straight after a deploy instead of showing an old copy for up to 10 minutes.

## 0.1.5-pre · Tighter spacing · 2026-10-27
- Section padding cut from 120 px to 48-80 px top and bottom, which removes the large empty bands between sections.

## 0.1.4-pre · Plain hero text · 2026-10-27
- Hero tagline now describes the game: a co-op offroad trucking game for up to eight players.

## 0.1.3-pre · Work-in-progress notice · 2026-10-27
- Red notice at the top: work in progress, placeholders and incomplete features. Nav link "The game" renamed "About".

## 0.1.2-pre · Operators and living regions · 2026-10-27
- "A team you can count on": eight operator classes with icons drawn in code (no generated art) and one-line roles.
- Frontline is a warzone: falling shells, mud thrown high, smoke, passing tracers. Timber country has wind and swaying trees. The northern wild has near-horizontal storm rain. The desert has an intense sun. The deep cold is now the arctic, with snow, aurora and an icy road.

## 0.1.1-pre · Simpler · 2026-10-27
- Removed the cold-start key and the strain line. Replaced "You feel the load" with a short description of the game ("What is AFTERHAUL?").
- Kept the region cards with their weather, the road, and the dashboard bar.

## 0.1.0-pre · Scrolling is driving · 2026-10-27
- Full overhaul. A fixed instrument cluster follows you down the page: odometer (km 0 to 1,000), rev needle and engine state.
- Hero: perspective road that moves with your scroll, four code-drawn ridges with parallax, dust, headlights and engine shake after the cold start. Heat haze on the wordmark while the engine runs.
- "The feel" has a live strain trace that reacts to scroll speed. "The crew" lights eight seats in sequence. "The land" has six regions, each with its own code-drawn weather (ash, sawdust, rain, embers, dust, snow).
- Respects reduced motion (everything holds still). No audio, no generated art, no libraries.

## 0.0.6-pre · Fence breaks on contact · 2026-10-27
- The fence now breaks the moment the truck's nose touches it ("Break on contact", with a Truck nose setting), not when the truck's centre arrives. Pieces start moving at once.
- New Push setting (how much of the truck's speed pieces take) and a wider, stronger default burst.

## 0.0.5-pre · Scene editor, camera fixes · 2026-10-27
- **Camera bug fixed:** while time is frozen, the camera you move stays where you put it. Sway and push-in are applied only while drawing and never move the real camera (push-in is also limited so it cannot reach the aimed object).
- **Pan, Tilt and Roll** for the shot camera (keyed with K). They work with Look at. With Free aim, use the rotate gizmo.
- Wheels turn at half speed while frozen (6 m/s by default).

## 0.0.4-pre · Scene editor, second pass · 2026-10-27
- **Camera preview:** the shot camera's view in a corner of the free view (click it to look through the camera).
- **Hill:** long ridge with rolling bumps and a smoother lane for the road. Fence follows the slope. Truck follows the ground (height, pitch, roll) until a set time, then flies on its keys.
- **Road and forest:** a road drawn along the truck path, and trees and rocks scattered by seed, kept clear of the whole route.
- **Freeze:** pieces keep spinning and drifting very slowly, and the wheels keep turning, while time is frozen.
- **New demo scene** button. The old demo scene is replaced (saved scenes from version 1 are not loaded).

## 0.0.3-pre · Scene editor · 2026-10-27
- **Scene editor** (`tools/scene-editor/`, not deployed): spawn objects, move and rotate with gizmos, shot camera with FOV and look-at, keyframe timeline, a baked fence break, and a freeze with slow-down. Saves a scene JSON. Stand-in truck; load the real GLB with Add GLB.
- Public page unchanged.

## 0.0.2-pre · Unlisted · 2026-10-25
- Repository is public; site deploys on push, stays unlisted (`noindex`, `robots.txt`).

## 0.0.1-pre · Cold start · 2026-10-25
- **First skeleton:** one page in four legs of a haul, marked like a route (km 0 to km 1,000): the feel, the crew, the land, and where the project is.
- **Cold start:** press the key, the glow plug heats, the engine cranks and the page settles into an idle shake. Press again to shut it down. With reduced motion the lamp works and the shake is skipped.
- **Look:** the Hound Protocol type family with AFTERHAUL's own ground: soot, road dust, frost and the amber of a glow-plug lamp.
- **Offline:** `noindex`, no deploy until launch. Marketing-level content only.
