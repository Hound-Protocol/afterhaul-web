# Designer Guide
Code: HP-GDE-025 · Version 1.0 · Effective 2026-11-02 · Owner: Owner · For: the designer and anyone proposing a design change
Audience: Makers
Summary: How to propose a design change, how to write a one-page proposal, and what the owner decides.

## The design document
AFTERHAUL has one design document. It is private and the owner holds it. It is the source of truth for what the game is. Do not copy it, quote it or describe it outside the team. The game is proprietary (see the [Contributor Policy](HP-POL-001-contributor-policy.md)).

You get the parts you need from the owner. Ask for them; do not search for them.

## Other kinds of document
| Audience | What it is | Public? |
|---|---|---|
| Players | The player guide | Yes, at launch |
| Makers | Guides like this one, and modding notes | Yes |
| The team | Design document, decision records, module specs, research | No |

Public pages use plain English and no tuned numbers. See [Documentation Style](HP-GDE-005-documentation-style.md).

## The rule for changes
When a design decision is made or changed, the design document changes in the same piece of work. A decision that lives only in a chat or a code file is not a decision. The owner keeps the private copies in step. This rule exists because, once, many decisions were made and the design document fell behind.

## How to propose a change
1. Check the idea is not already decided. Ask the owner.
2. Write a one-page proposal (below).
3. Send it to the owner.
4. Wait for the answer. Do not start building on a proposal.

## One-page proposal
Keep it to one page. Plain English, short sentences.
| Part | Say |
|---|---|
| Title | What the change is, in a few words |
| Problem | What is wrong or missing, and who feels it |
| Idea | What you propose. One paragraph |
| Why | What gets better. Name any source and mark it confirmed, likely or unknown |
| Cost | What else changes: art, sound, code, other design |
| Risks | What could go wrong |
| Open questions | What you do not know |

Leave tuned numbers out. If a number matters, say "needs testing" and let the owner and testers set it.

## What the owner decides
- Anything that changes what the game is, how it plays or what it costs.
- Anything that touches sound, voices or art style.
- Any use of third-party material or AI help. See the [AI Use Policy](HP-POL-002-ai-use-policy.md) and [Third Party and IP](HP-POL-003-third-party-and-ip.md).
- The final wording of a decision.

You advise. The owner decides.

## How decisions are recorded
Each significant decision gets a short private record: the context, the decision and what follows from it. Records are never deleted. A changed decision gets a new record that replaces the old one. Each record has a status: Proposed, Accepted, Superseded or Rejected. The records are private, so this guide does not list them.

## Related guides
- [Contributor Quick Start](HP-GDE-003-contributor-quick-start.md)
- [Working with AI Assistants](HP-GDE-018-working-with-ai-assistants.md)
- [Chain of Command](HP-POL-007-chain-of-command.md)
