# Website Maintainer Guide
Code: HP-GDE-012 · Version 1.1 · Effective 2026-11-02 · Owner: Website · For: team members who change the AFTERHAUL website
Audience: Makers
Summary: How the website is built, where its content lives and how to change it safely.

## How it works
- The site is static: HTML, CSS and plain JavaScript, served by GitHub Pages. It has no server of its own.
- Every push to `main` deploys the site.
- The pages carry `noindex` and `robots.txt` blocks crawlers until launch. The site is **unlisted**, not secret.
- The website repository is public. The game repository is private. Never copy private material across.

## What may go on the site
Marketing content and the player guide only. **No** tuned numbers, system specifications, design document text or decision records. Check every new page against this rule before you push. The player guide is written in plain words with no tuned numbers.

## Where things are
| What | Where |
|---|---|
| Page | `index.html` |
| Styles and script | `assets/css/afterhaul.css`, `assets/js/afterhaul.js` |
| Logo files | `assets/img/brand/` (made by `tools/make_logo.py`; never edit the SVG by hand) |
| Fonts | `assets/fonts/` |
| Roadmap data | `content/roadmap.json` |
| Game changelog | `content/game-changelog.md` |
| Website changelog | `CHANGELOG.md` |
| Wiki documents | `wiki/pages/handbook/` and `wiki/pages/library/` (Markdown) |

## Generated blocks
Some parts are written by scripts. Edit the source, run the script, commit both. Do not edit generated output by hand.

| Block | Command |
|---|---|
| Wiki documents | Edit `wiki/pages/`, then `python3 tools/build_wiki.py`. The player guide: `python3 tools/import_player_guide.py <path to the game's player guide folder>` first. |
| Changelog | `python3 tools/build_changelog.py` |
| Roadmap | `python3 tools/build_roadmap.py` |
| Wiki data | `python3 tools/build_wiki.py` (add `--check` to test) |

## Making a change
1. Edit the source files, then run the matching script if there is one.
2. Preview locally:
   ```
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000`.
3. Run `python3 tools/build_wiki.py --check` when you touched the wiki.
4. Add a line to the website `CHANGELOG.md` and raise its version.
5. Commit with a sign-off (`git commit -s`) and push. The site deploys.

## Worked example: add a roadmap status change
1. Open `content/roadmap.json` and change the item's status to one of the four allowed values.
2. Run `python3 tools/build_roadmap.py`.
3. Preview with `python3 -m http.server 8000` and open the Roadmap section. Check that the status filter counts still add up.
4. Add a line to `CHANGELOG.md`, raise its version, commit with `-s` and push.
5. Wait for the deploy, then reload with Ctrl+Shift+R and look again.

## Common edits
- **New wiki document:** add a Markdown file to `wiki/pages/handbook/` (name `HP-XXX-NNN-slug.md`) or `wiki/pages/library/` and run the wiki build. The first lines follow the format in [Documentation Style](HP-GDE-005-documentation-style.md).
- **Roadmap status:** edit `content/roadmap.json`, then run the roadmap script. Statuses are Complete, In Progress, Planned and Abandoned.
- **Game changelog line:** add it to `content/game-changelog.md`. Player-facing wording only.
- **Logo change:** edit `tools/make_logo.py` and run it ([Brand and Media](HP-GDE-011-brand-and-media.md)).

## Rules for site code
- Plain JavaScript and CSS. No frameworks and no build step for the source.
- Respect reduced-motion settings. Nothing flashes.
- Switching sections or tabs must not make the page jump or resize.
- Fonts and scripts are the site's own files. A video loads only when someone presses play.
- Escape any data you put into HTML.
- Keep text short, plain and in the game's terms: Operations Chief, Operators, employers, nuts, crew. The [Glossary](../library/glossary.md) lists them.

## Third-party items
Every font, library, image or video the site uses goes in `THIRD_PARTY_NOTICES.md` with its licence ([Third-Party Assets and IP](HP-POL-003-third-party-and-ip.md)). Placeholders are labelled as placeholders.

## Testing
Check the site by hand before you push, with the [Tester's Field Manual](HP-GDE-020-testers-field-manual.md). Say what you did not test.

## Where to read next
- [Documentation Style](HP-GDE-005-documentation-style.md): format of wiki pages
- [Brand and Media Guide](HP-GDE-011-brand-and-media.md)
- [Using the Website and Wiki](HP-GDE-015-using-the-website.md): what visitors see
- [Tester's Field Manual](HP-GDE-020-testers-field-manual.md), section 4: what to click
- Library: [Development Process](../library/process.md), [Changelog](../library/changelog.md), [Roadmap](../library/roadmap.md)
