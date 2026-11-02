# Reporting a Problem
A good report gets a problem fixed fast. Testers who write reports for the team follow the fuller [Quality Guide](HP-GDE-004-quality-testing.md) and the [Tester's Field Manual](HP-GDE-020-testers-field-manual.md).

**Status:** AFTERHAUL is not playable yet. For now, reports are about the website and the wiki. Game reports start when the first test build exists.

## 1. First, check
- **Is it known?** Read the [Changelog](../library/changelog.md) and the [Roadmap](../library/roadmap.md). The feature may not be built yet.
- **Is it AFTERHAUL?** Try the same thing in another browser, or another Proton version for the game.
- **Is it a security problem** (a leaked password or key, a way to harm other players)? Do not post it in public. Tell the owner privately.

## 2. Where to report
| You have | Report it |
|---|---|
| A problem with the website or wiki | An issue on the public website repository on GitHub ([GitHub Basics](HP-GDE-014-github-basics.md)), or a message to the contact on the Press tab |
| A problem with a game test build | The way your tester invitation says. Where reports go for the public: not decided yet |

The community space (Discord) is on hold.

## 3. What to include
| Field | Example |
|---|---|
| Where | The page and section, or the game build |
| Version | Website version shown on the page, or the game version |
| System | Browser and version, or Windows 11, or Bazzite with a named Proton version |
| Device | Desktop or phone, screen size |
| What happened | The roadmap filter showed no items |
| What you expected | Items for the chosen status |
| Steps to reproduce | 1. Open Roadmap. 2. Choose Planned. |
| How often | Every time / sometimes / once |
| Picture | A screenshot if it helps |

For the game, also add: GPU and driver, and the log file the build tells you about.

**Never attach** passwords, tokens, keys or anyone else's saves.

## Example report
```
Where: Wiki, filter box
Version: shown at the bottom of the page
System: Firefox on Bazzite, desktop, 1920x1080
What happened: I typed "truck" and no document matched.
What I expected: at least one document.
Steps: 1. Open Wiki. 2. Choose Content. 3. Type "truck".
How often: every time
```
Short and exact is better than long and vague.

## 4. What happens next
1. Someone tries to reproduce it ([Bug Triage](HP-SOP-005-bug-triage.md)).
2. It gets a severity, S1 to S4 ([Quality Policy](HP-POL-006-quality-policy.md)). Crashes and anything that damages saves block a release.
3. If more information is needed, someone asks. Answering helps a lot.
4. The fix is noted in the changelog.

## Where to read next
- [Bug Triage](HP-SOP-005-bug-triage.md): what the team does with your report
- [Quality Policy](HP-POL-006-quality-policy.md): severity levels
- [Security page](../library/security.md): how to report a security problem privately
- [Frequently asked questions](../library/faq.md)
