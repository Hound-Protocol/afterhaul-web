# Release Procedure and Versioning
Code: HP-SOP-003 · Version 1.1 · Effective 2026-11-02 · Owner: Owner · For: the owner and the AI helpers who prepare a version
Audience: Owner
Summary: How AFTERHAUL numbers its versions, and what to update with every version bump.

AFTERHAUL has not shipped a playable build yet. Every version so far is a **pre-release**.

## Version numbers
The `VERSION` file holds one number. The format is `X.Y.Z` or `X.Y.Z-pre`. A check fails on anything else.

| Number | Meaning |
| --- | --- |
| `0.0.N-pre` | Development pre-release. N counts up with each version. Not playable as a game |
| `0.1` | First playable slice. Planned. The exact scope is not decided yet |
| `1.0` | First stable release. Not planned in detail yet |

The website has its own version and changelog. A number always says which one it means.

## What every version bump needs
Do these together, in the same commit or pull request:
1. **`VERSION`:** set the new number.
2. **`CHANGELOG.md`:** add a new section at the top, headed `## <version>`. The check fails if the section for the current version is missing. Mark code that has not run in Unity as unverified.
3. **Status:** update the project state file when status changes.
4. **Design:** if a design decision changed, edit its section first, rebuild the design document and run its check ([HP-SOP-002](HP-SOP-002-pull-request-review.md)).
5. **Dev log:** add a plain-English entry at the top of the dev log entries (below).

## Checklist for a bump
- [ ] `VERSION` changed (format `X.Y.Z` or `X.Y.Z-pre`)
- [ ] New `## <version>` section at the top of the changelog; unverified code marked
- [ ] Project state file updated if status changed
- [ ] Design section edited first, if a design decision changed
- [ ] Dev log entry written, log built, check passes
- [ ] Website repository committed and pushed

Example: going from `0.0.N-pre` to the next number means `VERSION` says `0.0.(N+1)-pre` and the changelog gets a new top section with that heading.

## Dev log entry
Each version gets one entry. The dev log is a public page that is reachable only by its address. Nothing on the site links to it.
- Write **results only**: what was done and what it achieved. No plans, schedules or process.
- Keep it public-safe: no numbers, no tool or file names, no internals, no licence details, no asset names.
- Put pictures and clips on their own version. Use small `.mp4` or `.webp` files with a caption.
- Build the log, run its check, then commit and push the website repository. The site deploys on every push.
- The check fails if the log is behind the version.

## Status signal
At the start of a block of work, the helper sets a short public label ("working"). At the end it sets "idle". The dev log shows it with a 10-minute clock. After 10 quiet minutes it shows Offline. The label is public: a few plain words, no internals.

## Quality gate
The gate is in the [Quality Policy](HP-POL-006-quality-policy.md), section 3. It also needs the checks in [HP-SOP-002](HP-SOP-002-pull-request-review.md) and the bug rules in [HP-SOP-005](HP-SOP-005-bug-triage.md). No version has passed this gate yet.

## Tags and builds
- Tag names for releases are not decided yet.
- Game builds, signing and where players download them are not decided yet.
- Never delete a published release. Publish a fixed version, and say in the changelog that the earlier one was bad.

## Where to read next
- [Quality Policy](HP-POL-006-quality-policy.md)
- [Pull Request and Review](HP-SOP-002-pull-request-review.md) and [Bug Triage](HP-SOP-005-bug-triage.md)
- [Website Maintainer Guide](HP-GDE-012-website-maintainers.md): publishing the website side
- Library: [Changelog](../library/changelog.md), [Roadmap](../library/roadmap.md)
