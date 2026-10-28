# Changelog

All notable changes to the AFTERHAUL website. Pre-release versions are `0.0.x-pre`; the site is offline until launch.

## 0.7.1-pre · Hero button wording · 2026-10-28
- The first hero button now reads "More about AFTERHAUL".

## 0.7.0-pre · Reader and hero actions · 2026-10-28
- Wiki documents open in a new reader: a contents list that follows your place, a reading progress line, tidier typography and previous/next links between guides. The paper-and-stamp look is gone.
- The first screen has two actions: Read the guide and See the roadmap. The section buttons still fit on one screen on common laptop and desktop sizes.
- On phones the reader fills the screen from the bottom.

## 0.6.2-pre · Link preview, in-progress icon, phone fixes · 2026-10-28
- Shared links now show the square AFTERHAUL logo as their preview image (also used as the home-screen icon on iPhone).
- In Progress items on the roadmap use a new icon that cycles through writing, drawing and designing.
- Phones: the top bar is solid so page text no longer slides under the logo, and the unavailable Community cards are easier to read.

## 0.6.1-pre · About button · 2026-10-28
- Removed the animated dashed line from the About button.

## 0.6.0-pre · Wiki makeover · 2026-10-28
- The wiki has a new look: a calmer dark surface, a folder list with document counts, and cleaner cards with the folder colour and read time.
- New search box filters the guide as you type, with a message when nothing matches.
- On phones the folders become a row of chips above the cards.

## 0.5.8-pre · Stage label wording · 2026-10-28
- The current stage is now labelled "Currently in progress" on the roadmap and in the release stages.

## 0.5.7-pre · Roadmap plans and smoother changelog · 2026-10-28
- Every roadmap item lists up to five planned work points, drawn from the game design.
- The changelog scrolls more smoothly: lighter film grain, isolated scroll areas, and version entries that are not drawn until they come into view.

## 0.5.6-pre · Roadmap filter tidy-up · 2026-10-28
- Filtering the roadmap by a status hides stages with no matching items, and shows one message when nothing has that status, instead of one in every stage.

## 0.5.5-pre · Roadmap redesign · 2026-10-28
- The roadmap is rebuilt for players. Every item carries one of four statuses: Complete, In Progress, Planned or Abandoned. Status chips filter the list and show counts, each stage has a progress bar, and the page shows when it was last updated.
- Items are written for people outside the project: no tools or setup details.
- The road draws in, bars fill and cards rise in one after another as you scroll. In Progress items spin. Reduced-motion settings turn the motion off.
- The roadmap is generated from content/roadmap.json by tools/build_roadmap.py, so changing a status is a one-line edit.

## 0.5.4-pre · Section buttons · 2026-10-28
- The row of section buttons is about 20% wider (as far as the window allows) and each button is about 10% shorter. The icons are about 20% smaller, and each icon and its text sit centred in the button with free space around them.
- The Roadmap button now reads "The future of AFTERHAUL".

## 0.5.3-pre · No sideways jump · 2026-10-28
- Fixed: opening a wiki document moved the whole page a few pixels to the right, because the page scrollbar disappeared while the document was open. The scrollbar space is now kept, so nothing moves.

## 0.5.2-pre · Smaller update notice · 2026-10-28
- The new-version notice is now a small one-line pill, centred under the red bar, with Reload and Later. It is about half the size and takes no focus from the page.

## 0.5.1-pre · Sound text · 2026-10-28
- In the in-cab sound design note, the last sentence now reads: "Hit the gas at 100%, and the truck will respond in a full spectrum."

## 0.5.0-pre · Roadmap · 2026-10-28
- New Roadmap button and section: the plan from Concept through Alpha and Beta to Release, with what is happening now and what comes next. It is a draft, with no dates until a stage is close.
- "The world of AFTERHAUL" now says the moving scenes are placeholders that real gameplay will replace when the game enters Alpha.

## 0.4.12-pre · Straighter road · 2026-10-28
- The hero road leans less to the right. Its vanishing point moved toward the middle and the road is now symmetric around its centre line, so the yellow dashes sit in the road with correct perspective. Narrow screens use their own, slightly more central, values.

## 0.4.11-pre · Patch names, update window · 2026-10-28
- Every changelog entry now carries a named patch type: Overhaul, Feature, Content, Polish, Fix, Optimization, Tools, Brand or Foundation for the website, plus Systems, World, Story and Documentation for the game. Types are kept in content/patch-types.json.
- The new-version notice is now a small window in the corner with Reload and Later buttons, instead of a line under the red bar.
- Removed the "Drive on" scroll cue from the first screen.

## 0.4.10-pre · Release stages · 2026-10-28
- "Current State of AFTERHAUL" now shows the four release stages as a road with stops: Concept (marked as the current stage), Alpha, Beta and Release. Each says what the stage means. Dates read "to be announced" until they are set.

## 0.4.9-pre · Changelog times · 2026-10-28
- Each changelog document shows the time of its newest entry in red under its name. The time appears in your own time zone.
- Added a square logo (1024 px, the slashes above the name, safe for a round crop) for GitHub and other profile pictures.

## 0.4.8-pre · Logo files · 2026-10-28
- The header mark becomes the AFTERHAUL logo: the two slashes (amber and sand) and the name in Barlow Semi Condensed Medium with wide spacing, letters turned into outlines so no font is needed. Files in assets/img/brand/: logo (transparent, for dark backgrounds), logo on dark, logo for light backgrounds, and the slash mark alone, each as SVG and PNG. Made by tools/make_logo.py. The page itself looks the same.

## 0.4.7-pre · Compact first screen · 2026-10-28
- On desktop the first screen is more compact: the heading is sized to the window height and the spacing is tighter, so the section buttons show without scrolling on a 16:9 monitor.
- The section buttons now grow about 10% when pointed at. They no longer lift, and the grid texture on the Wiki button no longer shifts.
- Fixed: pressing All sections no longer scrolls the page. The view stays where it was while the section folds away.

## 0.4.6-pre · New-version notice, tilt, even dashes · 2026-10-28
- A pulsing "New website version available" bar with a Reload button appears under the red bar when a newer version is live. The page checks every few minutes and when you return to the tab.
- On phones the hills move as you tilt the device, like they do with the mouse on a computer. iPhones ask for motion permission on the first tap. Reduced-motion settings turn it off. The hills never slide far enough to show an edge.
- Fixed: the road dashes on the About button now run at an even spacing with no jump.

## 0.4.5-pre · Wiki description · 2026-10-28
- The Wiki button's description now reads "Learn more about AFTERHAUL".

## 0.4.4-pre · Faster loading · 2026-10-28
- No visible change. The deployed copy now has minified CSS and JavaScript, losslessly recompressed images and smaller woff2 fonts. The source files stay readable. Built by tools/optimize.py.
- Fixed: the Road closed page was not included in the deploy.

## 0.4.3-pre · Fuller wiki · 2026-10-28
- The wiki grows from five to eleven documents: Your driver, Clothing, Food, drink, sleep and stamina, Customizing your truck, Questions and answers, and a Glossary. Two new folders: Your driver and Your truck.
- Added a Road closed page for addresses that do not exist (404).

## 0.4.2-pre · Twice as fast · 2026-10-28
- The document open and close sequence runs at double speed. The order of the steps is unchanged.

## 0.4.1-pre · Document sequence in order · 2026-10-28
- Opening: the folders, count and other cards fade out first, the chosen card glides to the middle of the empty area, then the document zooms open from exactly that spot.
- Closing runs the same steps in reverse: the document shrinks back into the card in the middle, the card glides to its own place, then the rest fades back in.
- Fixed: the document scaled from its top-left corner, so it started and finished away from the card. It now scales about its centre.

## 0.4.0-pre · Documents on paper · 2026-10-28
- Opening a wiki document is now a sequence: the chosen card slides to the right, waits a moment, and the document grows out of the card's own place. Closing reverses it, back into the same card, which then slides back.
- Documents look like documents: textured paper with a margin rule, punched holes, fold creases, a running header, a details table (code, version, effective date, owner, audience), numbered headings, a footer and a DRAFT stamp that lands once the page has opened. Parts of the page write in one after another.
- The two changelog documents use the same paper.
- Fixed: choosing another section right after pressing All sections could hide the new section.

## 0.3.4-pre · Country in conflict · 2026-10-28
- The setting is now described as a country in conflict (page text, link preview, wiki, game changelog).

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
