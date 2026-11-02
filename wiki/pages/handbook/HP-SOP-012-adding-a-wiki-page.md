# Adding or Changing a Wiki Page
Code: HP-SOP-012 · Version 1.0 · Effective 2026-11-02 · Owner: Website · For: anyone who writes or edits wiki documents
Audience: Makers
Summary: Where wiki pages live, the header lines they need, how to build, check links and push.

The wiki is public. Check every page against the rules in [Website Maintainers](HP-GDE-012-website-maintainers.md): no tuned numbers, no design document text, no decision records, no secrets. Write in the style of the [Documentation Style Guide](HP-GDE-005-documentation-style.md).

## Where pages live
| Kind | Folder |
|---|---|
| Handbook (guides, policies, procedures) | `wiki/pages/handbook/` |
| Library (overview, glossary and similar) | `wiki/pages/library/` |

Edit only these folders. The build writes the rest. Never edit generated output by hand.

## Handbook page
Name the file `HP-XXX-NNN-slug.md`. XXX is GDE (guide), POL (policy) or SOP (procedure). The first lines must look exactly like this:

```
# Title
Code: HP-SOP-012 · Version 1.0 · Effective 2026-11-02 · Owner: Website · For: who it is for
Audience: Makers
Summary: One sentence, under 120 characters.
```
Then a blank line and the text. Owner is one of Owner, Quality, Art, Code, Website. Audience is Players, Makers, Quality or Owner. Use the next free number for the type. A bad Code line stops the build.

## Library page
```
# Title
Group: Project
```
Group is Project, Technical, Community or Legal. The file name is the page id.

## Links
Use relative file links, such as `[Glossary](../library/glossary.md)` from a handbook page, or `HP-GDE-005-documentation-style.md` between handbook pages. Link only to pages that exist. External links go only to real public addresses.

## Steps
1. Write or edit the Markdown file.
2. In the website folder run `python3 tools/build_wiki.py`. It lists any broken links.
3. Fix every broken link and run it again.
4. Run `python3 tools/build_wiki.py --check`. It says "wiki data is current" when the written files match.
5. Preview with `python3 -m http.server 8000` and open the page.
6. Add a line to the website changelog and raise its version.
7. Commit with a sign-off (`git commit -s`), commit the generated files with the source, and push. The site deploys.

## Changing an existing page
Edit the file, raise the version if the meaning changed, and run the same steps. Do not rename a file: links and the page address use its name.

## Do not
- Publish game design text, tuned numbers or decision records.
- Link the wiki from the game's private notes or copy private material across.
- Make claims without a source and a confidence: confirmed, likely or unknown.

## Adding pictures, clips and videos
Put the file in `wiki/pages/media/` (a sub-folder per topic) and run the build. Then use one of these lines on its own line in a document:

| You want | Write |
| --- | --- |
| A picture or GIF-like image | `![Caption](../media/art/name.png)` |
| A small inline icon | `![Name](../media/ops/name.svg "icon")` |
| A short clip (mp4 or webm) | `![Caption](../media/clips/name.mp4)` |
| A YouTube video | `![Title](youtube:VIDEOID)` or `youtube:VIDEOID?start=34` |

Rules: only our own work, or media with a recorded licence ([Third-Party Assets and IP](HP-POL-003-third-party-and-ip.md)). Keep clips short. AI-generated pictures must say so in the caption. A YouTube video loads only after a visitor presses play. Never copy a store pack's pictures here.
