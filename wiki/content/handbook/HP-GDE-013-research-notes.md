# Writing Research Notes
Research notes record what we learn about tools, licences, platforms and real-world facts. The game is built on them, so they must be accurate and sourced ([Documentation Style](HP-GDE-005-documentation-style.md)).

## File and header
- One topic per file, with a short lowercase name, for example `proton-microphone.md`.
- Start with a title and one line of facts:
```
# Proton Microphone Support
Author: YourName, with Claude (AI agent) · Date: 2026-11-02 · Status: desk research
```
- Name any AI tool you used, the same way as in commits.
- **Status** is one of: desk research (read, not tested), tested on a rig (name the rig and build), or verified (checked by a second person).

## Confidence
Mark every claim:

| Mark | Meaning |
|---|---|
| **Confirmed** | You tested it, or an official source says so, and you opened that source |
| **Likely** | Several reasonable sources agree, or an unofficial source says so |
| **Unknown** | No source yet, or sources disagree |

A guess is never written as a fact. Where a licence or a platform claim is only from a forum or a FAQ, say so ("Adobe community FAQ, not the official terms").

## What goes in
1. **Question:** what we want to know and why.
2. **Findings:** short sections, facts first. Mark guesses as guesses.
3. **Evidence:** how you know: a test you ran, a document you read, a log you captured. Enough for someone else to repeat it.
4. **Open questions:** what is still unknown.
5. **Sources:** links to public pages, with what you took from each and the date you read it.

## Worked example
```
# Proton Microphone Support
Author: YourName, with Claude (AI agent) · Date: 2026-11-02 · Status: desk research

## Question
Does microphone input work in a Unity game under Proton? We need it for voice commands.

## Findings
- Microphone capture under Proton: unknown. No test has been run.
- A fallback exists in the plan: keyboard shortcuts instead of voice.

## Evidence
None yet. A 5-second capture test on a real Linux PC would settle it.

## Open questions
Which Proton versions? Does a headset behave differently from a built-in mic?

## Sources
(Add public pages here, with what you took from each and the date you read it.)
```
The note says "unknown" and names the test that would settle it. That is a good note.

## Rules
- Write in **your own words**. Do not paste long quotes or other people's text. AI summaries must not copy others' text either ([AI Use Policy](HP-POL-002-ai-use-policy.md)).
- Open every source yourself. An AI tool may point you to a page, but you read the page.
- Read licences from the official terms. Say when you could not.
- Do not put secrets, keys or private messages in a note.
- Keep research notes that touch private design out of the public wiki.

## Quality bar
- Short sentences, simple words.
- Numbers with units and the version they were measured on.
- Tables for comparisons, numbered steps for procedures.
- Update the note when a later test changes the answer, and say what changed and when.

## Where to read next
- [Documentation Style](HP-GDE-005-documentation-style.md): wording and confidence rules
- [Working with AI Assistants](HP-GDE-018-working-with-ai-assistants.md): checking what an AI tells you
- [Linux and Proton Guide](HP-GDE-002-linux-proton.md): claims that are still unknown
- [Third-Party Assets and IP](HP-POL-003-third-party-and-ip.md): reading licences
