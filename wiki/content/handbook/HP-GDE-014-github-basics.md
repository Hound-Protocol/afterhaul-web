# GitHub Basics
GitHub is where AFTERHAUL's code, documents and website live. You need a free account to be invited to the team, to report a problem on the public website repository, or to propose a change. This guide takes you from no account to your first pull request. No programming is needed for most of it.

## 1. Words you will see
| Word | What it means here |
|---|---|
| **Repository (repo)** | A project folder with its full history. The website repo is public. The game repo is private |
| **Issue** | A numbered discussion: a bug report or a question |
| **Fork** | Your own copy of a repository, where you can change anything |
| **Branch** | A line of work inside a repository, so changes stay separate until they are ready |
| **Commit** | One saved set of changes, with a message saying what changed |
| **Pull request (PR)** | A request to bring your changes into the project. It is where review happens |
| **Review** | Someone checks your pull request and either approves it or asks for changes |
| **Merge** | The pull request is accepted and its changes become part of the project |
| **Checks** | Automatic tests that run on every pull request. A red cross means something needs fixing |
| **Release** | A published version with notes |

## 2. Create your account (5 minutes)
1. Go to **github.com** and choose **Sign up**. Use an email address you will keep.
2. Pick a user name. It is public and it is how the project credits you.
3. Turn on **two-factor authentication**: your picture (top right) → **Settings** → **Password and authentication** → **Enable two-factor authentication**. Use an authenticator app or a passkey, and save the recovery codes somewhere safe and offline. Step by step in [Account Security](HP-GDE-010-account-security.md); the rule is in the [Security Policy](HP-POL-004-security-policy.md).
4. Optional: add a picture and a display name in **Settings → Public profile**.

## 3. Find your way around a repository
- **Code** tab: the files.
- **Issues** tab: bug reports and questions.
- **Pull requests** tab: work being reviewed.
- **Actions** tab: the automatic checks, and the job that publishes the website.
- **Releases** (right side of the Code tab): published versions with notes.

The game repository is private. You see it only after an invitation. Whether it can be opened to more people: not decided yet ([Contributor Quick Start](HP-GDE-003-contributor-quick-start.md)).

## 4. Report a problem or ask a question
1. **Issues** → **New issue**. Fill in every field the template asks for. For bugs, see [Reporting a Problem](HP-GDE-016-reporting-a-problem.md).
2. Search the existing issues first: someone may have reported it already. Add a 👍 reaction instead of a "me too" comment.
3. Never paste passwords, tokens or keys ([Security Policy](HP-POL-004-security-policy.md)).

## 5. Change a document in the browser (no tools needed)
Good for fixing a typo or improving a guide.
1. Open the file on GitHub.
2. Click the **pencil** (Edit this file). GitHub offers to **fork** the repository: accept.
3. Make your change. Check it with the **Preview** tab.
4. **Commit changes** → write a short message, for example `Fix a typo in the Proton guide`. Choose **Create a new branch** and **Propose changes**.
5. On the next page, **Create pull request**. Explain what you changed and why.
6. Watch the **checks**. If one fails, open **Details** to see why, fix it with the pencil again, and the pull request updates itself.
7. A reviewer approves and merges it, or asks for changes. That is normal. Reply on the pull request.

## 6. Work on your own computer (for code and bigger changes)
1. Install **git** and **Python 3**. On Bazzite, both are already there. On Windows use the official installers.
2. Fork the repository (**Fork** button), then clone your fork:
   ```
   git clone https://github.com/<your-name>/<repository>.git
   cd <repository>
   ```
3. Make a branch for your work: `git switch -c docs/short-topic`.
4. Change files, then save the change with a sign-off. The sign-off says the work is yours or you have the right to submit it ([Contributor Policy](HP-POL-001-contributor-policy.md)):
   ```
   git add .
   git commit -s -m "Short, clear message"
   git push -u origin docs/short-topic
   ```
5. GitHub shows a **Compare & pull request** button on your fork. Open the pull request against `main`.
6. Run the project's checks before you push: see the [Contributor Quick Start](HP-GDE-003-contributor-quick-start.md).
7. To bring your fork up to date later: on your fork's page, **Sync fork** → **Update branch**, then `git pull` on your computer.

Prefer buttons to commands? **GitHub Desktop** does the same on Windows and macOS. On Linux, most editors (for example VS Code) have git built in.

## 7. When something goes wrong
| You see | Try this |
|---|---|
| A red cross on a check | Open **Details**, read the first error, fix it, push again |
| `git push` is rejected | Someone changed the branch. Run `git pull`, then push again |
| "This branch is out of date" | Use **Update branch** on the pull request page |
| You committed to the wrong branch | Do not panic. Ask the owner before you rewrite anything |
| You pasted a secret into a commit or issue | Stop. Follow [Security Incident Response](HP-SOP-006-security-incident.md) |

## 8. Good habits
- One pull request per topic. Small pull requests are reviewed faster.
- Say in the pull request if you used AI tools ([AI Use Policy](HP-POL-002-ai-use-policy.md)).
- Be kind in reviews and comments. Disagree with the work, never with the person.
- Stuck? Ask in the issue or ask the owner. Nobody is penalized for being slow or asking questions ([Accountability](HP-POL-009-accountability.md)).

## Where to read next
- [Contributor Quick Start](HP-GDE-003-contributor-quick-start.md)
- [Pull Request and Review](HP-SOP-002-pull-request-review.md): what reviewers look for
- [Account Security](HP-GDE-010-account-security.md): signed commits
- [Reporting a Problem](HP-GDE-016-reporting-a-problem.md)
