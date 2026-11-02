# Development Process
How AFTERHAUL is built. This is a public summary. Internal specifications and design detail stay private.

## 1. The shape of the project
- One owner leads the project. AI assistants help with code and text. The owner reviews and understands every change.
- The game and the website live in separate repositories. The game repository is private. The website is public and holds marketing content and the player guide only.
- Work moves in small modules, one at a time. Each module has a written goal and a test.

## 2. Flow of work
1. Pick the next module from the plan.
2. Write the design change first. The design document is the source of truth.
3. Write the code and its tests.
4. Run the checks (section 3).
5. Commit in small, signed-off steps (`git commit -s`). AI help is disclosed in the commit trailers.
6. Update the version and the changelog together.

## 3. Checks
| Check | What it covers | Status |
| --- | --- | --- |
| Data check | Game data files have the right shape | Run before each commit |
| Compile check | Game code compiles against small stand-ins for Unity | Runs on every push. It proves syntax, not engine behaviour |
| Edit Mode tests in Unity | Game logic tests inside the real engine | Run by hand. The first run passed on 2026-10-31 |
| Documentation check | The player guide matches the game data | Runs on every push |
| Play tests on Windows and on Linux (Proton) | The real game | Not done yet |

Code that has not run in Unity is **unverified**. We say so in the changelog. See the [Quality Guide](../handbook/HP-GDE-004-quality-testing.md).

## 4. Platforms
- Engine: Unity 6.3 LTS.
- One Windows build must run on Linux through Proton. We test on a Linux PC (Bazzite). Details: [Linux and Proton Guide](../handbook/HP-GDE-002-linux-proton.md).
- A native Linux build is planned after release.

## 5. Documents
- The player guide has one source. The website builds from it. Pages about game content are generated from the game data, with tuned numbers left out.
- Documents follow the [Documentation Style Guide](../handbook/HP-GDE-005-documentation-style.md).

## 6. Versions and releases
Pre-release versions use `0.0.x-pre`. See [Release and Versioning](../handbook/HP-SOP-003-release-and-versioning.md).

## 7. Rules that always apply
- No generative art, music, sound or voices ([AI Use Policy](../handbook/HP-POL-002-ai-use-policy.md)).
- The owner supplies every sound. Code only plays sounds and sets their parameters.
- Third-party material needs a checked licence ([Third-party and IP](../handbook/HP-POL-003-third-party-and-ip.md)).

## Where to read next
- [Contributor Quick Start](../handbook/HP-GDE-003-contributor-quick-start.md)
- [Quality Guide](../handbook/HP-GDE-004-quality-testing.md)
- [Working with AI assistants](../handbook/HP-GDE-018-working-with-ai-assistants.md)
- [Glossary](glossary.md) for the terms used here
- [Overview](overview.md)

*Status: draft. Source: project notes, 2026-11-02. Confidence: confirmed.*
