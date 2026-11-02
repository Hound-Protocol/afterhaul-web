# Asset Intake Procedure
An outside asset is any model, texture, clip, font, plugin or sound you did not make yourself. Follow these steps in order. The rules behind them are in [Third-Party Assets and IP](HP-POL-003-third-party-and-ip.md).

## Before you start
- People make the art. Nothing generated from prompts comes in ([AI Use Policy](HP-POL-002-ai-use-policy.md)).
- The owner supplies all sound. Do not bring in audio.
- Nobody has to use the current picks. They are starting points and may change.

## Steps
1. **Ask the owner.** Say what you want and why. A purchase needs the owner's yes before you pay anything.
2. **Read the licence.** Open the real licence text, not a summary. Note what it allows: use inside a game, credit, sharing, machine-learning use. Mark your confidence: confirmed, likely or unknown.
3. **Check the contents.** Look at what the asset really contains before you rely on it. A store page may be wrong or thin.
4. **Record the source.** Add a row to the asset list: what it is, where it came from (link), the licence, the date and the status. Keep "not checked" and "unknown" where they are true.
5. **Record the notice.** When the asset is imported, add it to the third-party notices in the same change, with its licence ([Licensing and Attribution](HP-POL-008-licensing-and-attribution.md)).
6. **Keep the files private.** Asset files stay out of git, out of public repositories and out of the mod kit. Standard store licences allow use inside the game, not handing the files out. Each team member downloads their own copy.
7. **Run the character checker (characters only).** Run `python3 tools/check_character.py model.glb` and fix every FAIL. It has passed its own self-test only. A pass is likely, not confirmed. There is no truck checker yet.
8. **Import and test in Unity.** Anything not run in Unity is unverified and is marked so ([Quality](HP-GDE-004-quality-testing.md)).

## Where it is recorded
| What | Where |
|---|---|
| Source, licence, status of each asset | The asset list |
| Licence and credit of each imported item | The third-party notices |

## When a licence is unclear
1. Stop. Do not import, share or build on the asset.
2. Write down what is unclear in the asset list, status "unknown".
3. Ask the owner. The owner may contact the seller or author for written terms.
4. Wait for a clear answer. If none comes, drop the asset and use plain shapes until real art exists.

Nothing here is legal advice.

## Related
- [Art Contributor Start](HP-GDE-021-art-contributor-start.md)
- [Merchandise Policy](HP-POL-010-merchandise-policy.md)
