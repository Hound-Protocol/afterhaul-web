# Security Incident and Leaked Secret Response
Code: HP-SOP-006 · Version 1.1 · Effective 2026-11-02 · Owner: Owner · For: anyone who finds an incident; the owner leads
Audience: Makers
Summary: What to do in the first 15 minutes, first day and first week after a leaked secret or security problem.

A secret is a password, token, key or private personal data. If you find one in the wrong place, act at once.

## First 15 minutes: contain
1. **Revoke** the secret first. Reset the token, rotate the key, remove the access. Do this before anything else.
2. Remove the exposed text. Edit or delete the message, or close the issue. Deleting does not undo exposure, which is why step 1 comes first.
3. Tell the project owner privately. Do not open a public issue.

## Within a day: clean up
- Look for misuse: the account's audit log and recent activity on the service.
- If a secret reached git history, treat it as public forever. Rotating it is the fix. Rewriting history is not.
- If you pasted a secret into an AI tool, revoke it too. See [HP-POL-002](HP-POL-002-ai-use-policy.md).

## Within a week: learn
Write a short note: what happened, the impact, what was done, what changes. No blame. Update the guide that failed.

## Problems reported by outsiders
Acknowledge the report. Fix it privately. Credit the reporter if they want. A public reporting address is not decided yet. Until then, reporters contact the owner directly.

## Common cases
| Case | Action |
| --- | --- |
| Token committed to a repository | Revoke it at the service, then check the audit log |
| Key or password pasted in chat | Reset it, then remove the message |
| Secret sent to an AI tool | Revoke it and make a new one |
| Account takeover | Recover with the 2FA codes, remove the account's access until it is safe, change passwords |
| Personal data exposed | Remove it, tell the person, tell the owner |

Setting up two-factor sign-in is covered in [HP-GDE-010](HP-GDE-010-account-security.md).

## Worked example
A token is committed to the website repository at 10:00.
1. 10:05: you reset the token at the service. The old one is now dead.
2. 10:10: you tell the owner privately, then remove the file in a new commit.
3. Same day: check the service's audit log for use between 10:00 and 10:05.
4. Within a week: write the short note. Add a check or a habit so it does not repeat.

## Where to read next
- [Security Policy for Team Members](HP-POL-004-security-policy.md)
- [Account Security Setup](HP-GDE-010-account-security.md)
- [Backup and Restore](HP-SOP-009-backup-and-restore.md): if an account is compromised
- [Security page](../library/security.md): how outsiders report
