# Quality Guide: Testing and Bug Reports
## Your job
Make sure what ships works on real machines. Nothing ships because it is finished. It ships because it is checked. Every test result you write down saves someone hours.

**Hands-on:** what to click, what to try to break and how to measure are in the [Tester's Field Manual](HP-GDE-020-testers-field-manual.md).

## What "done" means
1. Every acceptance criterion of the module is met.
2. The data checks pass, and the Unity edit-mode tests pass once Unity is set up.
3. The code compiles and has run in the module's test scene.
4. The docs and the changelog are updated.
5. The change says whether AI helped.

## Status of the code
Code written before it has run in Unity is **unverified**. It stays unverified until it compiles and its test scene runs. Say so in the changelog. A compile check outside Unity proves syntax and logic only. It says nothing about how Unity behaves.

## Test rig
| Item | Record |
|---|---|
| Build | Version number |
| Platform | Windows version, or distro + Steam build + Proton version |
| Hardware | CPU, GPU, driver, RAM |
| Extra content | Names and versions of mods (ideally none for clean tests) |

Keep the rig the same between tests. If something changes, note it.

## Kinds of tests
- **Smoke test:** the game starts and the main menu appears. Every build.
- **Checklist test:** the release checklist, step by step, on Windows and on Linux with Proton.
- **Session test:** two or more players, joins and leaves, 30 minutes of play. Note desyncs.
- **Soak test:** a long session (2+ hours) to find slow leaks and drift.
- **Bad network:** the same with the standard profiles in the [Field Manual](HP-GDE-020-testers-field-manual.md).
- **Benchmark:** frame time and physics time on Windows and on Proton.

Sessions and the first playable build do not exist yet. These tests start when they do.

## Severity
| Level | Meaning | Example |
|---|---|---|
| S1 Critical | Data loss, crash on start, security issue | A save is corrupted; a key leaks |
| S2 Major | A core feature fails | A truck cannot drive |
| S3 Minor | Works with a workaround | Wrong marker colour |
| S4 Cosmetic | Looks wrong, works | Typo, layout gap |

## Release gate
A build ships only when no S1 or S2 bug is open, and it has been tested on Windows and on Linux (Proton or native), with versions recorded.

## Writing a bug report
```
Title: <what breaks>, short
Severity: S1 to S4
Build: version / platform / Proton version
Steps:
1.
2.
Expected:
Actual:
Logs: attach the game log (never secrets)
Video or screenshot: if it helps
```
One bug per report. Search first for duplicates.

## Reviewing a change
Check every acceptance criterion yourself, not from the description. If one fails, say what you saw and ask for changes. See [Pull Request and Review](HP-SOP-002-pull-request-review.md).

## Signing off a release
Follow [Release Procedure](HP-SOP-003-release-and-versioning.md) and the gates in the [Quality Policy](HP-POL-006-quality-policy.md). Write the release's quality report: tests run, platforms, open bugs, what was not tested.
