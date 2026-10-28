#!/usr/bin/env python3
"""Builds the Changelog panel of index.html: the website log (CHANGELOG.md) on the left and the
selected, player-facing game log (content/game-changelog.md) on the right. Run after editing either file.
The game's private working log is never published; content/game-changelog.md is curated by hand."""
import html, re
from pathlib import Path
root = Path(__file__).resolve().parent.parent

def parse(text):
    out, cur = [], None
    for l in text.splitlines():
        if l.startswith("## "):
            parts = [x.strip() for x in l[3:].split("·")]
            cur = {"ver": parts[0], "title": parts[1] if len(parts) > 1 else "", "date": parts[2] if len(parts) > 2 else "", "items": []}; out.append(cur)
        elif l.startswith("- ") and cur: cur["items"].append(l[2:].strip())
    return out

def inline(t):
    t = html.escape(t, quote=False); t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t); return re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)

def doc(cls, code, title, intro, entries, owner):
    n = len(entries); latest = entries[0]["ver"] if entries else ""
    rows = []
    for e in entries:
        meta = " · ".join(x for x in (e["title"], e["date"]) if x)
        rows.append(f'<section class="clv"><h4><span>{html.escape(e["ver"])}</span>{("<em>" + html.escape(meta) + "</em>") if meta else ""}</h4><ul>' + "".join(f"<li>{inline(i)}</li>" for i in e["items"]) + "</ul></section>")
    return f'''<article class="cldoc paper {cls}"><span class="holes" aria-hidden="true"><i></i><i></i><i></i></span><header><p class="clcode">Code: {code} · Latest: {html.escape(latest)} · Owner: {owner} · For: players</p><h3>{title}</h3><p class="clint">{intro}</p><p class="clcount"><b>{n}</b> versions</p></header>
<div class="clbody">{"".join(rows)}</div></article>'''

web = parse((root / "CHANGELOG.md").read_text(encoding="utf-8"))
game = parse((root / "content" / "game-changelog.md").read_text(encoding="utf-8"))
block = ('<div class="clgrid">' + doc("cl-web", "AH-CL-001", "Website changelog", "Every change to this website.", web, "Web team")
  + doc("cl-game", "AH-CL-002", "Game changelog", "Selected changes to the game design. The full working log is private.", game, "Design team") + "</div>")
p = root / "index.html"; h = p.read_text(encoding="utf-8")
h = re.sub(r"<!-- LOG:START -->.*<!-- LOG:END -->", lambda m: "<!-- LOG:START -->\n" + block + "\n<!-- LOG:END -->", h, flags=re.S)
p.write_text(h, encoding="utf-8"); print("changelog built:", len(web), "website versions,", len(game), "game versions")
