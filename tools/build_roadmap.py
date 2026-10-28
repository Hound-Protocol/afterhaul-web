#!/usr/bin/env python3
"""Builds the Roadmap panel of index.html from content/roadmap.json. Run after editing the JSON.
Statuses: complete, in-progress, planned, abandoned. Keep items player-facing: no internal tools or setup."""
import datetime, html, json, re
from pathlib import Path
root = Path(__file__).resolve().parent.parent
d = json.loads((root / "content" / "roadmap.json").read_text(encoding="utf-8"))
LABEL = {"complete": "Complete", "in-progress": "In Progress", "planned": "Planned", "abandoned": "Abandoned"}
ICON = {
 "complete": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7 12.5l3.2 3.2L17 9"/></svg>',
 "in-progress": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" class="trk"/><path d="M12 2a10 10 0 0 1 10 10" class="spin"/></svg>',
 "planned": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-dasharray="3 3.2"/></svg>',
 "abandoned": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 8l8 8M16 8l-8 8"/></svg>'}
esc = html.escape
counts = {k: 0 for k in LABEL}
for s in d["stages"]:
    for i in s["items"]: counts[i["status"]] += 1
total = sum(counts.values())
chips = f'<button type="button" class="rm-f on" data-f="all" aria-pressed="true">All <b>{total}</b></button>' + "".join(
    f'<button type="button" class="rm-f s-{k}" data-f="{k}" aria-pressed="false">{LABEL[k]} <b>{counts[k]}</b></button>' for k in ("complete", "in-progress", "planned", "abandoned"))
upd = datetime.date.fromisoformat(d["updated"]).strftime("%-d %B %Y")
out = [f'<p class="rm-intro">{esc(d["intro"])}</p>',
       f'<div class="rm-top"><div class="rm-filters" role="group" aria-label="Filter by status">{chips}</div><p class="rm-upd">Last updated {upd}</p></div>',
       '<ol class="rm">']
for n, s in enumerate(d["stages"]):
    its = s["items"]; done = sum(1 for i in its if i["status"] == "complete"); pct = round(100 * done / len(its))
    here = ' <em>We are here</em>' if s.get("here") else ""
    cards = "".join(
        f'<li class="rm-card s-{i["status"]}" data-status="{i["status"]}" style="--i:{k}"><span class="rm-ic">{ICON[i["status"]]}</span><div><b>{esc(i["title"])}</b><p>{esc(i["text"])}</p></div><span class="rm-chip">{LABEL[i["status"]]}</span></li>'
        for k, i in enumerate(its))
    out.append(f'<li class="rm-st{" here" if s.get("here") else ""}" data-stage="{s["id"]}"><div class="rm-hd"><h3>{esc(s["name"])}{here}</h3><p class="rm-lead">{esc(s["lead"])}</p>'
               f'<div class="rm-prog"><span class="rm-bar" role="img" aria-label="{done} of {len(its)} complete"><i style="--p:{pct}%"></i></span><span class="rm-pt">{done} of {len(its)} complete</span></div></div>'
               f'<ul class="rm-list">{cards}</ul></li>')
out.append('</ol><p class="rm-none" hidden>Nothing has this status yet.</p>')
block = "\n".join(out)
p = root / "index.html"; h = p.read_text(encoding="utf-8")
if "<!-- ROADMAP:START -->" not in h:
    h = re.sub(r'(<p class="lede">The plan from today to release.*?</p>)\s*<ol class="rm">.*?</ol>', "<!-- ROADMAP:START -->\n<!-- ROADMAP:END -->", h, flags=re.S)
h = re.sub(r"<!-- ROADMAP:START -->.*<!-- ROADMAP:END -->", lambda m: "<!-- ROADMAP:START -->\n" + block + "\n<!-- ROADMAP:END -->", h, flags=re.S)
p.write_text(h, encoding="utf-8"); print("roadmap built:", counts)
