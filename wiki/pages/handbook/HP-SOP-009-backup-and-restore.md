# Backup and Restore
Code: HP-SOP-009 · Version 1.0 · Effective 2026-11-02 · Owner: Owner · For: the owner
Audience: Owner
Summary: What to back up, how to keep a copy away from GitHub, and how to restore it.

**Status:** AFTERHAUL has no automatic backup yet. This page is the manual procedure. A weekly automatic backup is not built yet. Nothing here has been tested as a restore, so treat the steps as unverified until you run one.

## Why
An account can be taken over. A repository can be damaged or deleted. A copy that GitHub cannot reach keeps the project safe.

## What to save
| Item | How |
| --- | --- |
| All code, branches, tags and history of each repository | A git mirror, plus a dated bundle file you can clone from |
| Issues, pull requests and comments | Export them from the GitHub interface or API |
| Art, audio and other source files that are not in the repository | Copy them to the same place, with a dated folder name |
| Unity project settings and local scaffold | Include them. They are not all in the repository yet |

Not covered: passwords and two-factor recovery codes. Keep those in a password manager and on an encrypted USB stick ([HP-POL-004](HP-POL-004-security-policy.md)).

## Make a copy
For each repository:
```
git clone --mirror <repository address> repo.git
git -C repo.git bundle create repo-YYYY-MM-DD.bundle --all
```
Put the bundle in a dated folder. Then copy the folder to storage that you control.

## Off-site copy
Keep one copy away from the computer that did the work. **Encrypt it before it leaves the machine.** Where the copy goes, and how often, is not decided yet. Keep the encryption passwords in your password manager. Without them nobody can read the copy.

## Check it works
Every three months, restore into a temporary folder:
```
git clone repo-YYYY-MM-DD.bundle repo-restored
```
Open the result. Check the latest `VERSION` and a few files.

## Restore onto GitHub
For a new or emptied repository:
```
cd repo.git
git remote set-url origin <new repository address>
git push --mirror origin
```
Issues and pull requests are not restored by this. The exports keep them as an archive.

## If an account is compromised
1. Follow [HP-SOP-006](HP-SOP-006-security-incident.md) and secure the accounts first.
2. Do not make a new backup until the accounts are safe. It may copy the damage.
3. Restore from the last copy made before the incident.
