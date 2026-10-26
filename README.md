# AFTERHAUL website

The public website for **AFTERHAUL**, a heavy-haul convoy game for crews of up to eight, by Hound Protocol.

**Status: unlisted.** The repository is public and the site deploys on every push to `main`, but it carries `noindex` and is not linked from anywhere, so search engines skip it until launch.

## What goes on this site
Marketing-level content only: the pitch, the atmosphere, the crew, the regions, progress news. **Never** mechanics, numbers, system designs, specifications or the design document. Those stay in the private game repository, so nobody can rebuild the game from what is public.

## Files
| Path | What |
| --- | --- |
| `index.html` | The page |
| `assets/css/afterhaul.css` | Styles |
| `assets/js/afterhaul.js` | The cold-start interaction |
| `assets/fonts/` | Barlow Semi Condensed and Share Tech Mono (SIL Open Font License) |
| `CHANGELOG.md` | Site versions |

No build step. Preview: `python3 -m http.server 8000`, then open http://localhost:8000.

## Versions
Pre-release versions are `0.0.x-pre`. The version is shown in the footer (`#siteVersion`) and recorded in `CHANGELOG.md`.

## Going live
1. Settings → Pages → Source: **GitHub Actions** (once).
2. Pushes to `main` deploy automatically.
3. At launch, remove `<meta name="robots" content="noindex">` from `index.html` and the `Disallow` line in `robots.txt`.

## AI disclosure (HP-POL-002)
Code, copy and the SVG favicon and mark were written or drawn in code with Claude and reviewed by the owner. No generative AI images, music or voices are used.

## License
Proprietary. Copyright (C) 2026 Hound Protocol. All rights reserved. See [LICENSE](LICENSE).
