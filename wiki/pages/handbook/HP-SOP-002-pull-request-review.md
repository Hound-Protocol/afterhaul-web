# Pull Request and Review
Code: HP-SOP-002 · Version 1.1 · Effective 2026-11-02 · Owner: Quality · For: everyone who changes the AFTERHAUL repository
Audience: Makers
Summary: How to open, check, review and merge a change to AFTERHAUL.

The AFTERHAUL repository is private. Only invited members work in it. Nothing from it is shared outside the team.

## Opening a change
1. Keep it focused. One module or one topic per change.
2. Sign off every commit: `git commit -s`. The sign-off says you wrote the work or have the right to submit it.
3. Keep the `Co-Authored-By` trailer on work done with an AI helper. See [HP-POL-002](HP-POL-002-ai-use-policy.md).
4. Fill in the pull request template: what changed, which module, how it was tested, AI assistance, checklist.
5. Update `CHANGELOG.md` if the change is worth noting. Update the design section in the same change if you change a design decision ([HP-GDE-003](HP-GDE-003-contributor-quick-start.md)).

## Automatic checks (must be green)
| Check | What it proves |
| --- | --- |
| Version format | `VERSION` is a valid release or pre-release number |
| Changelog section | `CHANGELOG.md` has a section for the current version |
| Data files | Every data file is valid JSON and passes the data checks |
| Player guide | The generated player guide is up to date |
| Mods | Example and test mods follow the mod rules |
| Compile check | Game code compiles against stand-ins for Unity, and its edit-mode tests pass |
| Design document | The design document matches its section files |

Be honest about what these prove. The compile check uses stand-ins for Unity. It proves syntax and logic, not behaviour in the engine. Code not run in Unity is **unverified**. Say so in the pull request. See [HP-GDE-004](HP-GDE-004-quality-testing.md).

**Example pull request text:**
```
What: Fix a wrong link in the Proton guide.
Module: docs
Tested: ran the wiki build check; opened the page.
AI help: Claude found the link; I checked it.
Unverified code: none
```

## Merging
| Change | Merge |
| --- | --- |
| Owner's changes, including work an AI helper does for the owner | Merge once checks pass |
| Anyone else's changes | After the owner or Quality reviews |

Review rules for other roles are not decided yet. AFTERHAUL has one owner and AI helpers, not departments.

## Reviewer checklist
- [ ] The module's acceptance criteria are met
- [ ] Tests exist where needed and were run
- [ ] Unity-only code is marked unverified until it has run in Unity
- [ ] Tested on Windows and on Linux (Proton or native) if a build is involved, with versions recorded
- [ ] Only original or licensed assets ([HP-POL-003](HP-POL-003-third-party-and-ip.md))
- [ ] No generative AI art, music, sound or voices
- [ ] No secrets or personal data
- [ ] AI disclosure is filled in honestly
- [ ] Docs updated
- [ ] A newcomer would understand it

## Review etiquette
- Be specific. Point to the line, say what to change and why.
- Mark small points as "nit". They do not block.
- Approve when it is good enough and safe, not when it matches your taste.
- Answer within 3 days, or say when you will.

## Where to read next
- [Quality Policy](HP-POL-006-quality-policy.md): done, severity and release gate
- [Contributor Quick Start](HP-GDE-003-contributor-quick-start.md) and [GitHub Basics](HP-GDE-014-github-basics.md)
- [Release Procedure](HP-SOP-003-release-and-versioning.md)
- [AI Use Policy](HP-POL-002-ai-use-policy.md)
- Library: [Development Process](../library/process.md)
