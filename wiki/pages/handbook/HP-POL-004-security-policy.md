# Security Policy for Team Members
Code: HP-POL-004 · Version 1.0 · Effective 2026-11-02 · Owner: Owner · For: everyone with access to AFTERHAUL
Audience: Makers
Summary: How team members protect accounts, secrets and access.

To report a security problem, see the [Security page](../library/security.md).

## 1. Accounts
- Turn on **two-factor authentication** on GitHub and every account that touches the project. Use an authenticator app or a passkey or hardware key. Text-message codes are the weakest choice.
- Use a password manager. Never reuse the project's passwords elsewhere.
- Nobody from the project will ever ask for your password or codes.

## 2. Secrets
- **Never** paste a token, key or password into chat, an issue, a commit or an AI tool. This includes temporary ones.
- Create a token for one job, read it from an environment variable, and reset it afterwards.
- Never commit passwords, tokens, keys or personal data.
- Keep GitHub secret scanning on where it is available.

## 3. Access
- Give people the access their work needs and nothing more.
- Grant and remove access on the same day.
- The repository is private. Only invited members can read it.

## 4. Code and releases
- Check changes before they are merged ([HP-POL-006](HP-POL-006-quality-policy.md)).
- Keep dependencies up to date. Merge security updates first.
- Not decided yet: automated release builds.

## 5. Backups
Keep a backup of the repositories and your own copies of asset files. Not decided yet: where and how often.

## 6. If something leaks
Tell the owner at once. Revoke the secret first, clean up second, report third. Deleting it from the history is not enough.
