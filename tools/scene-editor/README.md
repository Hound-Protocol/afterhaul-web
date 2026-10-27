# Scene editor

A small tool to build the fence-break animation for the AFTERHAUL site (and to plan the main menu scene). It is **not deployed**: the Pages workflow copies only `index.html`, `robots.txt` and `assets/`.

## Run
`python3 -m http.server 8000` in the repo root, then open http://localhost:8000/tools/scene-editor/index.html. It autosaves to the browser; use Save for a JSON file.

## Use
- **Spawn** (left): click a button, move over the ground, click to place. Shift-click keeps spawning. Esc cancels.
- **Gizmo**: red, green and blue arrows. W move, E rotate, R scale. Snap is optional.
- **Views**: Free view (left drag orbit, right drag pan, wheel zoom) and Shot view (through the shot camera). "Shot camera from view" copies the free view into the shot camera.
- **Camera**: FOV slider with a lens in mm, Look at (aims at an object), 2.39:1 bars, and Sway and Push-in that only run while time is frozen.
- **Timeline**: select an object, move the playhead, press K to key it. Drag diamonds to retime. Delete removes a key. Position follows a smooth curve between keys; rotation interpolates by quaternion.
- **Freeze**: "Freeze here" sets a freeze point with a slow-down ramp. The Freeze button (H) holds time by hand while playing.
- **Fence break**: baked from the truck's path at the impact time. Burst, Lift, Spin, Reach and Seed shape it. The same seed always gives the same break. Pieces follow a recorded path, so freezing is just stopping the playhead.
- **Model**: Add GLB loads your truck as a new object. Keep the GLB in the repo for the public page; the scene JSON stores only its file name.

## Also
- **Camera preview** in the free view. **Road** follows the truck path. **Forest and rocks** keep clear of the route. The **truck follows the ground** until its Airborne time. While frozen, wheels keep turning and broken pieces drift and spin slowly (Pieces spin, Pieces drift on the fence).

## Not built yet
Mud and dust particles, a public-page player for the JSON, cargo boxes that burst, easing per key, and a render of the frozen frame as the phone screenshot.

## Notes
- Written with Claude and reviewed by the owner (HP-POL-002). three.js is MIT; see `THIRD_PARTY_NOTICES.md`.
- Tested in a headless browser with screenshots. Not tested on a real GPU or by hand yet.
