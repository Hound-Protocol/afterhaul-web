# Account Security Setup
Code: HP-GDE-010 · Version 1.1 · Effective 2026-11-02 · Owner: Owner · For: team members and anyone with access
Audience: Makers
Summary: Step by step setup for two-factor login, signed commits and a password manager.

Step by step setup for the rules in the [Security Policy](HP-POL-004-security-policy.md). About 20 minutes.

## What to do
| Step | Needed? |
|---|---|
| 1. Two-factor login on GitHub | Required for everyone ([Security Policy](HP-POL-004-security-policy.md)) |
| 2. Passkey | Recommended |
| 3. Signed commits | Recommended |
| 4. Two-factor on chat accounts | Required if you use them for the project |
| 5. Password manager | Required for shared credentials |

## 1. GitHub two-factor authentication (everyone)
1. GitHub → **Settings → Password and authentication**.
2. Turn on **two-factor authentication** with an authenticator app (Aegis, 2FAS, Google Authenticator, or your password manager).
3. Save the **recovery codes** in your password manager.

## 2. Passkeys (recommended)
1. Same page → **Passkeys → Add a passkey**.
2. Use a hardware key or your device's passkey storage. Add a second one as a backup.

## 3. Signed commits (recommended)
1. Create an SSH key if you have none: `ssh-keygen -t ed25519 -C "you@example.com"`
2. GitHub → **Settings → SSH and GPG keys → New SSH key**, type **Signing key**, paste the contents of `~/.ssh/id_ed25519.pub`.
3. Tell git to sign:
```
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```
4. Make a test commit and push it. On GitHub, the commit shows **Verified**. If it does not, check that the key was added as a *Signing key*, not only an *Authentication key*.

This is separate from the sign-off (`git commit -s`), which every commit also needs.

Keep the private key (the file without `.pub`) on your own computer only. Never send it to anyone.

## 4. Chat accounts
Turn on two-factor login on any chat account you use for the project. Never paste a token or webhook address in any channel. If one leaks, follow [Security Incident and Leaked Secret Response](HP-SOP-006-security-incident.md) at once.

## 5. Password manager
Use one (Bitwarden, KeePassXC, 1Password). Shared team credentials live only there, never in chat or in the repository.

## 6. AI tools
Never paste tokens, keys, passwords or private messages into an AI tool ([HP-GDE-018](HP-GDE-018-working-with-ai-assistants.md)).

## Check yourself
- [ ] Two-factor works and the recovery codes are in the password manager.
- [ ] A second passkey or key is saved as a backup.
- [ ] A test commit shows Verified.
- [ ] No token or key sits in a file in your project folder.

## If something goes wrong
Lost device, leaked token or a strange login: tell the owner right away and follow [HP-SOP-006](HP-SOP-006-security-incident.md). Reporting fast is never held against you.

## Where to read next
- [Security Policy for Team Members](HP-POL-004-security-policy.md)
- [Security Incident and Leaked Secret Response](HP-SOP-006-security-incident.md)
- [GitHub Basics](HP-GDE-014-github-basics.md)
- [Security page](../library/security.md): how outsiders report a problem
