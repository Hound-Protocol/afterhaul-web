# Changelog

All notable changes to the AFTERHAUL website. Pre-release versions are `0.0.x-pre`; the site is offline until launch.

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
