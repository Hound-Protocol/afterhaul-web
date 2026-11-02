#!/usr/bin/env python3
"""Copy the player guide from the game repo into wiki/pages/library/ (decision 0018: the player guide is public).
Usage: python3 tools/import_player_guide.py /path/to/Afterhaul/docs/player
Then run tools/build_wiki.py. Pages are named player-<id>.md and carry the group "Player guide"."""
import json, re, sys, pathlib

src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/home/claude/afterhaul/docs/player")
out = pathlib.Path(__file__).resolve().parent.parent / "wiki" / "pages" / "library"
idx = json.loads((src / "index.json").read_text(encoding="utf-8"))
pages = [p for s in idx["sections"] for p in s["pages"]]
by_file = {p["file"]: p["id"] for p in pages}
by_name = {pathlib.Path(p["file"]).name: p["id"] for p in pages}

def fix(m):
    url = m.group(2)
    base = url.split("#")[0]
    pid = by_file.get(base) or by_name.get(pathlib.Path(base).name)
    return f"[{m.group(1)}](player-{pid}.md)" if pid else m.group(1)

for p in pages:
    t = (src / p["file"]).read_text(encoding="utf-8")
    t = re.sub(r"<!--.*?-->", "", t, flags=re.S)
    t = re.sub(r"^# .*\n", "", t, count=1).lstrip("\n")
    t = re.sub(r"\[([^\]]+)\]\(([^)\s]+\.md[^)]*)\)", fix, t)
    (out / f"player-{p['id']}.md").write_text(f"# {p['title']}\nGroup: Player guide\n\n{t}", encoding="utf-8")
print(f"Wrote {len(pages)} player guide pages")
