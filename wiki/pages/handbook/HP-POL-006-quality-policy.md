# Quality Policy
Code: HP-POL-006 · Version 1.1 · Effective 2026-11-02 · Owner: Quality · For: every change and every release
Audience: Quality
Summary: Nothing ships because it is finished. It ships because it is checked.

## 1. Principle
Nothing ships because it is finished. It ships because it is **checked**.

## 2. Definition of done
A module is done when all of these are true:
1. Every acceptance criterion in the module is met.
2. The data checks pass, and the Unity edit-mode tests pass once Unity is set up.
3. The code compiles and has been run in the module's test scene.
4. Documents and the changelog are updated.
5. AI help is disclosed ([HP-POL-002](HP-POL-002-ai-use-policy.md)).

## 3. Release gate
A build ships only when:
- No S1 or S2 bug is open.
- It has been tested on Windows and on Linux (Proton or native), with versions recorded.

## 4. Severity
| Level | Meaning | Example |
|---|---|---|
| S1 Critical | Data loss, crash on start, security issue | A save is corrupted; a key leaks |
| S2 Major | A core feature fails | A truck cannot drive |
| S3 Minor | Works with a workaround | Wrong marker colour |
| S4 Cosmetic | Looks wrong, works | Typo, layout gap |

## 5. Status of the code
Code written before it has run in Unity is **unverified**. Mark it so in the changelog. A pass in the compile check proves syntax and logic only. It proves nothing about Unity behaviour.

## 6. Who checks what
| Moment | Who | What they check |
|---|---|---|
| Before a merge | Reviewer | The acceptance criteria and the checklist in [HP-SOP-002](HP-SOP-002-pull-request-review.md) |
| Before a release | Quality | Tests run, platforms, open bugs ([HP-SOP-003](HP-SOP-003-release-and-versioning.md)) |
| After a report | Whoever triages | Severity and routing ([HP-SOP-005](HP-SOP-005-bug-triage.md)) |

## 7. Measuring
Not decided yet: the release report format. At least record the tests run, the platforms, open bugs by severity, and what was not tested.

## Where to read next
- [Quality Guide](HP-GDE-004-quality-testing.md): rig, tests and the bug report template
- [Tester's Field Manual](HP-GDE-020-testers-field-manual.md)
- [Bug Triage](HP-SOP-005-bug-triage.md) and [Release Procedure](HP-SOP-003-release-and-versioning.md)
- [Linux and Proton Guide](HP-GDE-002-linux-proton.md)
- Library: [Development Process](../library/process.md)
