# Quality Guide: Testing and Bug Reports
## Your job
Make sure what ships works on real machines. Nothing ships because it is finished. It ships because it is checked. Every test result you write down saves someone hours.

**Hands-on:** what to click, what to try to break and how to measure are in the [Tester's Field Manual](HP-GDE-020-testers-field-manual.md).

## What "done" means
The five conditions are in the [Quality Policy](HP-POL-006-quality-policy.md), section 2. In short: acceptance criteria met, checks pass, code has run in its test scene, docs and changelog updated, AI help disclosed. When you check a change, tick them one by one.

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

## Severity and the release gate
Four levels, S1 (critical) to S4 (cosmetic), with examples, and the release gate (no open S1 or S2 bug; tested on Windows and Linux) are in the [Quality Policy](HP-POL-006-quality-policy.md). Rate a bug by what a player loses, not by how hard the fix is.

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

**Worked example** (a website bug, because no game build exists yet):
```
Title: Roadmap filter "Planned" shows nothing
Severity: S3
Build: site 1.2.3 / Firefox 130 on Fedora / 1920x1080
Steps:
1. Open Roadmap.
2. Choose the status filter "Planned".
Expected: the planned items.
Actual: an empty list. Other filters work.
Logs: console shows no error
```
(The numbers are made up to show the layout.)

## Reviewing a change
Check every acceptance criterion yourself, not from the description. If one fails, say what you saw and ask for changes. See [Pull Request and Review](HP-SOP-002-pull-request-review.md).

## Signing off a release
Follow [Release Procedure](HP-SOP-003-release-and-versioning.md) and the gates in the [Quality Policy](HP-POL-006-quality-policy.md). Write the release's quality report: tests run, platforms, open bugs, what was not tested.

## Where to read next
- [Tester's Field Manual](HP-GDE-020-testers-field-manual.md): the hands-on routine
- [Bug Triage](HP-SOP-005-bug-triage.md): what happens to your report
- [Linux and Proton Guide](HP-GDE-002-linux-proton.md): the Linux rig
- [Reporting a Problem](HP-GDE-016-reporting-a-problem.md): the version for players
