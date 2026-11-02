# Bug Triage
AFTERHAUL is in early development, so reports come from the owner, helpers and invited testers. Public bug intake is not open yet. The AFTERHAUL community space is on hold.

## Intake
Reports come through the repository's bug report template. Testers use the steps in [HP-GDE-004](HP-GDE-004-quality-testing.md).

## Triage steps
1. **Check it is ours.** Not an engine bug, not a bug in a third-party tool, not a modified copy.
2. **Reproduce** on Windows or on Linux (Proton or native). Record the game version, the Unity version, the Proton version and the hardware.
3. **Rate the severity** (table below).
4. **Label** it: `bug`, the module, the severity, and `needs-info` if the reporter must answer.
5. **Route** it to the owner of the module. S1 goes to the project owner at once.

## Severity
Use the four levels in the [Quality Policy](HP-POL-006-quality-policy.md): S1 critical, S2 major, S3 minor, S4 cosmetic. A build ships only when no S1 or S2 bug is open ([HP-SOP-003](HP-SOP-003-release-and-versioning.md)).

**Worked example:** a report says "the wiki filter shows nothing for one word". You reproduce it in Firefox only. It has a workaround (use another word), so it is S3. Labels: `bug`, `website`, `S3`. Route it to the owner of the website module.

## Response times
Targets are not decided yet, because there is no public build. Until there is one, the order is simple: S1 first, then S2, then S3 and S4 in batches.

## Closing
Close a report as one of:
- **Fixed**, with a link to the change.
- **Duplicate**, with a link.
- **Cannot reproduce**, after 14 days in `needs-info`.
- **Not ours**, with a pointer to where it belongs.

A security issue never goes in a public report. Follow [HP-SOP-006](HP-SOP-006-security-incident.md).

## Where to read next
- [Quality Guide](HP-GDE-004-quality-testing.md): the bug report template
- [Reporting a Problem](HP-GDE-016-reporting-a-problem.md): what reporters are told
- [Security Incident Response](HP-SOP-006-security-incident.md)
- [Release Procedure](HP-SOP-003-release-and-versioning.md)
