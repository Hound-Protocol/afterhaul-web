# Game Dev Trainee Guide
## How to use this guide
Work through the steps in order. Take your time. Ask when stuck. Nobody expects you to know Unity yet.

## Step 1. Git and signed-off commits
1. Make a GitHub account. Follow [GitHub Basics](HP-GDE-014-github-basics.md) and turn on two-factor authentication ([Account Security](HP-GDE-010-account-security.md)).
2. Learn five words: repository, branch, commit, pull request, review.
3. Make small commits with a sign-off: `git commit -s -m "Short, clear message"`. The sign-off says you wrote the work or have the right to submit it.
4. Say when an AI tool helped. See [Working with AI Assistants](HP-GDE-018-working-with-ai-assistants.md).

## Step 2. Read the rules
Read these once, slowly:
- [Contributor Policy](HP-POL-001-contributor-policy.md)
- [Quality Policy](HP-POL-006-quality-policy.md) and [Quality and Testing](HP-GDE-004-quality-testing.md)
- [Pull Request Review](HP-SOP-002-pull-request-review.md)

The key ideas:
- Work is "done" only when it is checked, not when it is written.
- Code that has not run in Unity is **unverified**. Say so.
- Bugs have four levels, from S1 (critical) to S4 (cosmetic).

## Step 3. Set up Unity
Follow [Unity Setup and First Steps](HP-GDE-027-unity-setup-and-first-steps.md). It covers the panels you will use and the habits that save hours.

## Step 4. Small first tasks
Pick one. Do one at a time.
1. Fix a typo in a guide and open a pull request.
2. Run the project's data check and read what it says.
3. Open the test scene, press Play, walk the test character around, and report what you saw. See [Reporting a Problem](HP-GDE-016-reporting-a-problem.md).
4. Set up a Humanoid character and play a clip on it. See the [Animation and Rig Guide](HP-GDE-029-animation-and-rig-guide.md).

Write down what you tried and what happened. Wrong guesses are useful when you record them.

## What to ask
- Which file or panel should I look at?
- Is this already decided?
- What would make this task "done"?
- Can you check my pull request before I go on?

Ask early. A short question costs less than a day lost.

## What not to touch
- Values the owner has already tested and approved. Do not change a default.
- Sound. The owner supplies every sound. See the [Audio and Sound Guide](HP-GDE-028-audio-and-sound-guide.md).
- The private design document. Ask the owner for what you need.
- Third-party assets in the repository. Each person downloads their own copy.
- Anything with generated art, music, sound or voices. Not allowed ([AI Use Policy](HP-POL-002-ai-use-policy.md)).
- Secrets. Never paste a key or password into a tool or a commit.

## Habits
- One change at a time.
- Small pull requests.
- Plain English in comments and documents ([Documentation Style](HP-GDE-005-documentation-style.md)).
- Do not fix unrelated problems on the side. Mention them.
