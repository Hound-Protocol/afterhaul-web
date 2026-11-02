# Audio and Sound Guide
Code: HP-GDE-028 · Version 1.0 · Effective 2026-11-02 · Owner: Audio · For: anyone who touches sound in AFTERHAUL
Audience: Makers
Summary: The owner supplies every sound. This guide says what you may and may not do, and how code plays sound.

Status: draft. Sound code is unverified in Unity. Some sound features are planned and not built.

## The main rule
**The owner supplies every sound.** Code never creates, synthesizes or generates audio. That means no tones, no noise, no clicks and no placeholder sounds. If a sound is missing, the game stays silent until the file arrives.

No generative sound, music or voices, from anyone. See the [AI Use Policy](HP-POL-002-ai-use-policy.md).

## What you may do
- Write code that plays a sound **by event name**.
- Write code that sets **parameters** the sound designer reads.
- Process sounds the owner supplied: filters, reverb sends, ducking. The in-game walkie-talkie, for example, is a filter on a supplied voice. The squelch and static are supplied audio.
- Reference a truck's sounds by event name in that truck's data. The sound banks live inside the truck's own folder.

## What you may not do
- Make or add a sound of your own, even a quick test beep.
- Download sounds and add them. Third-party sound needs the owner's yes and a licence check ([Third Party and IP](HP-POL-003-third-party-and-ip.md)).
- Use generated speech or music.

## How it works
The code talks to an audio middleware through one small interface. It does two things: play an event by name, and set a named parameter. The sound designer builds the sounds and decides how the parameters change them. The code does not know what a sound is.

## Parameters the code drives
In general terms:
| Group | What the code sends |
|---|---|
| Engine | Engine speed, engine load |
| Movement | Vehicle speed, wind |
| Truck body | How open the exhaust is, how much the cab muffles outside sound |
| Room | Room size, openness, reverb time, reverb amount, a low-pass setting |

Values and ranges are tuned and are not public.

## Rooms without ray-traced sound
A small probe casts a few rays around the listener and estimates how big and how open the space is. It sends the room parameters to the middleware. The sound designer builds one reverb and one low-pass that follow them. Special volumes can override the estimate for tunnels, caves and buildings. It costs a few ray casts per frame. Unverified in Unity.

## Planned: war sound and crash feel
Not built yet. The plan has events for artillery (shot, whistle, impact), debris passing the truck and crash impacts. Parameters would include distance to the artillery, a pitch tied to truck speed, and crash strength. The owner supplies every sound. Code only schedules events and sets parameters.

## Voices
Voice lines are recorded by people. See the [Voice Recording Guide](HP-GDE-024-voice-recording-guide.md).

## Related
[Contributor Policy](HP-POL-001-contributor-policy.md) · [Quality and Testing](HP-GDE-004-quality-testing.md)
