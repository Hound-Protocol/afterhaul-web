# Working with AI Assistants
AI is an organisational assistant on AFTERHAUL: it helps plan, take notes, tidy documents and keep work organised, and people decide and make everything creative. Used well, it makes work faster. Used badly, they produce work that looks right and is not. The rules are in the [AI Use Policy](HP-POL-002-ai-use-policy.md). This guide is the practice.

## 1. The rules that never change
1. **You are responsible.** The owner reviews and understands every change. "The AI wrote it" is never an answer. Code is run and tested before it is merged.
2. **No generative art, music, sound or voices.** All art and all audio are made or licensed by people. The owner supplies the audio. Code never generates sound. AI may operate tools (layout, SVG drawn in code, resizing). It may not generate images, textures, icons, logos, music or voices. Placeholder art is plain shapes, never AI images.
3. **Nothing private goes in.** Never paste tokens, keys, passwords, private messages or players' personal data into an AI tool ([Security Policy](HP-POL-004-security-policy.md)).
4. **Original and licensed only.** No code, assets or audio copied from other games or leaked sources, and no AI reproduction of them ([Third-Party Assets and IP](HP-POL-003-third-party-and-ip.md)).

## 2. Which tool for what
Any capable assistant works. What matters is how you check the result.

| Tool | Good at | Watch out for |
|---|---|---|
| **Claude** (claude.ai, Claude Code) | Long documents, careful changes across several files, following project rules you give it | Give it the project rules. Check facts against sources |
| **ChatGPT** | Explaining concepts, quick drafts, rewriting text | Confident answers on niche topics that may be invented |
| **Gemini** | Searching and summarizing public pages, long inputs | Summaries that blend sources. Open the source and check |

For anything niche, such as Proton behaviour or a licence, every assistant can guess. Treat every claim as **unknown** until a real source or a test confirms it ([Research Notes](HP-GDE-013-research-notes.md)).

## 3. Helper AI for simple text
Simple text work (lists of names, short descriptions) may go to a helper AI. The brief is text only. Never send it the design document, code or tuned numbers. Check what comes back, and log every result you merge. Where a helper's output may not go (art, music, sound, voices) is set by the [AI Use Policy](HP-POL-002-ai-use-policy.md), section 5.

## 4. A good working loop
1. **State the task and the rules.** "Plain English, cite sources, no generated art, no secrets."
2. **Give context, not secrets.** Paste the relevant file or error, or the [style guide](HP-GDE-005-documentation-style.md).
3. **Ask for small steps.** One function, one section, one test at a time.
4. **Ask it to explain.** "Why this approach? What did you assume?" If you cannot follow the answer, you are not ready to merge.
5. **Check every result** (section 5). Then iterate.
6. **Write the final version yourself where it matters:** decision text, public claims, the summary of a research note.

### Prompts that work
- *"Propose a plan in steps before writing code. List what you are unsure about."*
- *"Review this change. Point out bugs, missing tests and unclear names. Do not rewrite it."*
- *"Rewrite this section in plain English, short sentences, active voice. Keep every fact and link. Add no new claims."*
- *"Summarize this public page in your own words, with the URL, and mark each claim confirmed, likely or unknown."*

## 5. Checking the work
| You made | Check before you merge |
|---|---|
| **Code** | It builds, you ran it, the project's checks pass, and no code is copied or secret. Code not run in Unity is called unverified |
| **Documentation** | Every link works, facts match the sources, it follows the style guide, and no feature or number is invented |
| **Research** | Every claim has a source you opened yourself, in your own words, with confidence marked |
| **Tests and reports** | Steps reproduce on your machine. Versions and logs are real, not generated |

**Worked example: a disclosure line.** In a pull request: "AI help: Claude drafted the first version of this guide. I checked every link and fact against the sources." In a commit, the `Co-Authored-By` trailer stays as the tool wrote it.

Common AI mistakes: invented functions, links to pages that do not exist, wrong version numbers, "fixes" that hide an error, and text that sounds right but says nothing.

## 6. Disclosing AI work
1. Say in the commit or pull request that AI helped, and name the tool and its part in one line.
2. **Keep the commit trailers** such as `Co-Authored-By`. Removing them on purpose breaks the policy.
3. Answer review comments yourself. The reply and the fix are yours.

Disclosure never lowers credit.

## 7. Quick checklist
- [ ] I understand every line and can explain it.
- [ ] I ran it and the checks pass.
- [ ] No secrets, personal data or copied material went into the tool or the change.
- [ ] No AI-generated images, music, sound or voices.
- [ ] Facts are checked against real sources.
- [ ] AI help is disclosed and the trailers are kept.

## Where to read next
- [AI Use Policy](HP-POL-002-ai-use-policy.md): the rules behind this guide
- [Writing Research Notes](HP-GDE-013-research-notes.md)
- [Documentation Style](HP-GDE-005-documentation-style.md)
- [Pull Request and Review](HP-SOP-002-pull-request-review.md): the AI disclosure field
- [Security Incident Response](HP-SOP-006-security-incident.md): if a secret reached an AI tool
