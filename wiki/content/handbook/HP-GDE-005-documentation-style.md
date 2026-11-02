# Documentation Style Guide
## Principles
1. **Write for a newcomer.** Assume they are smart, but new to the project.
2. **Plain English.** Short sentences, active voice, common words. Explain jargon once, or link the [glossary](../library/glossary.md).
3. **One topic per document.** Link rather than repeat.
4. **Facts with sources.** Research claims carry a source and a confidence: confirmed, likely or unknown.
5. **Honest status.** Say what is not done. "Planned for 0.1" beats silence.

## Structure
- Start with a one-line purpose.
- Headings that say what the section is about.
- Tables for comparisons and lists of facts. Numbered lists for steps.
- Code blocks for commands, exactly as typed.
- End research notes with a **Sources** list.

## Handbook documents
| Type | Code | Use for |
|---|---|---|
| Policy | HP-POL-NNN | Rules everyone must follow |
| SOP | HP-SOP-NNN | Step-by-step procedures |
| Guide | HP-GDE-NNN | How-to help for an audience |

Each starts with a title, then metadata lines in this order: `Code`, `Audience`, `Summary`. The Code line reads `Code: HP-GDE-NNN · Version 1.0 · Effective 2026-11-02 · Owner: <role> · For: <who>`. Put the file in `wiki/pages/handbook/` and run `python3 tools/build_wiki.py`: it writes the wiki data, and the document appears in the Handbook and prints on A4. Raise the version when the meaning changes (1.0 → 1.1 for small changes, 2.0 for rewrites).

## Words we use
| Use | Not |
|---|---|
| host, client | server, player-host |
| driver (in-game character) | avatar, soldier |
| owner, team | boss, staff |
| Documentation, Library, Handbook | Docs page, Guides page |
| early draft, not yet playable | beta, released |

## Never
Paste game text or files, copy other projects' docs, promise dates, or name and criticize other mods.
