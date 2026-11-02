# Contributor Quick Start
## 1. Can I contribute?
**Not by default.** AFTERHAUL is a closed project. The game repository is private and proprietary. Only invited members work in it, and nothing from it is shared outside the team ([Licensing and Attribution](HP-POL-008-licensing-and-attribution.md)).

What is open today:
- **Reading and playing along.** This wiki, the roadmap and the changelog are public.
- **Feedback.** Early testers will report problems once a build exists ([Reporting a Problem](HP-GDE-016-reporting-a-problem.md)).
- **Mods.** The mod rules are public, and mods are planned. See [Making a mod](../library/player-modding.md).

How to get invited, and which roles are open: not decided yet. The community space is on hold. This page will say when that changes.

No programming skill is needed for most useful work: testing, reading docs for mistakes, and clear writing all count. You need a free GitHub account with two-factor login ([GitHub Basics](HP-GDE-014-github-basics.md)).

## 2. Read first (20 minutes)
- [Contributor Policy](HP-POL-001-contributor-policy.md)
- [AI Use Policy](HP-POL-002-ai-use-policy.md), and the practice in [Working with AI Assistants](HP-GDE-018-working-with-ai-assistants.md)
- [Third-Party Assets and IP](HP-POL-003-third-party-and-ip.md): use only what you made or are licensed to use
- [Security Policy](HP-POL-004-security-policy.md) and [Account Security](HP-GDE-010-account-security.md)
- [Documentation Style](HP-GDE-005-documentation-style.md)

## 3. Set up (30 minutes)
1. A GitHub account with two-factor login.
2. Install git, Python 3 and an editor. Unity 6.3 LTS is needed for game work.
3. Accept the invitation and clone the repository.
4. Run the checks before you push:
   ```
   python3 tools/check_data.py
   python3 tools/check_gdd.py
   tools/compile_check/run.sh
   ```
   The compile check runs the logic tests without Unity. It does not prove the code works in Unity ([Quality Guide](HP-GDE-004-quality-testing.md)).

## 4. Deliver a change
1. Work on a branch. Keep one topic per change.
2. Commit with a sign-off: `git commit -s -m "Short, clear message"`. The sign-off says you wrote the work or have the right to submit it.
3. Keep the `Co-Authored-By` lines if an AI tool made the commit. Removing them breaks the policy.
4. Add a line to the changelog and raise the version when you release a pre-release.
5. Open a pull request, or commit as the owner directs. Say whether AI helped. See [Pull Request and Review](HP-SOP-002-pull-request-review.md).
6. Fix what review asks for. Changes asked in review are normal.

## 5. The rules in short
| Rule | Why |
|---|---|
| Keep it confidential: do not copy, post or describe the design, code, data or assets outside the team | The game is proprietary |
| Original or licensed work only | No assets, code or audio you do not own or have a licence for ([HP-POL-003](HP-POL-003-third-party-and-ip.md)) |
| No generative AI images, art, music, sound or voices | People make the art and the audio ([HP-POL-002](HP-POL-002-ai-use-policy.md)) |
| Design changes go in the design document in the same change | The design document is the source of truth |
| Code that has not run in Unity is called unverified | Honest status |
| Be kind. Disagree with the work, never the person | [Chain of Command and Open Communication](HP-POL-007-chain-of-command.md) |

## 6. If you get stuck
Ask the owner. Nobody is penalized for being slow or for asking. Leaving is fine: write a short handoff note first so someone else can pick the work up.
