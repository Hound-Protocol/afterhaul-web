# AFTERHAUL website

The public website for **AFTERHAUL**, a heavy-haul convoy game for crews of up to eight, by Hound Protocol.

**Status: offline.** The site is built but not published. It goes live when the game model is ready and the name is cleared (trademark). Until then this repository stays private.

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
1. Make the repository public, or move the site to a public repository.
2. Settings → Pages → Source: GitHub Actions.
3. Remove `<meta name="robots" content="noindex">` from `index.html`.
4. Run the **Deploy site** workflow by hand.

## License
Proprietary. Copyright (C) 2026 Hound Protocol. All rights reserved. See [LICENSE](LICENSE).
