#!/usr/bin/env python3
"""Builds the Documentation panel of index.html from the player guide source in the game repo (decision 0018).
Usage: python3 tools/build_docs.py /path/to/Afterhaul/docs/player
Only the player guide is read. Nothing is written by hand in the panel: edit the source and run this again."""
import html, json, re, sys
from pathlib import Path

def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![*\w])\*([^*]+)\*(?![*\w])", r"<em>\1</em>", t)
    def link(m):
        txt, url = m.group(1), m.group(2)
        if url.endswith(".md"):
            return f'<a href="#doc-{Path(url).stem}">{txt}</a>'
        return f'<a href="{url}" target="_blank" rel="noopener noreferrer">{txt}</a>'
    return re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, t)

def md(src):
    src = re.sub(r"<!--.*?-->", "", src, flags=re.S)
    out, lines, i = [], src.split("\n"), 0
    while i < len(lines):
        l = lines[i].rstrip()
        if not l: i += 1; continue
        if l.startswith("# "): i += 1; continue                      # the accordion title replaces the page title
        if l.startswith("## "): out.append(f"<h4>{inline(l[3:])}</h4>"); i += 1; continue
        if l.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "): items.append(f"<li>{inline(lines[i][2:])}</li>"); i += 1
            out.append("<ul>" + "".join(items) + "</ul>"); continue
        if l.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"): rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")]); i += 1
            head, body = rows[0], [r for r in rows[2:]]
            t = "<div class=\"tbl\"><table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead><tbody>"
            t += "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in body) + "</tbody></table></div>"
            out.append(t); continue
        para = [l]; i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"(#|- |\|)", lines[i]): para.append(lines[i].rstrip()); i += 1
        text = " ".join(para)
        if re.fullmatch(r"\*[^*]+\*", text): out.append(f'<p class="status">{inline(text)}</p>')
        else: out.append(f"<p>{inline(text)}</p>")
    return "\n".join(out)

def main():
    root = Path(sys.argv[1]); idx = json.loads((root / "index.json").read_text(encoding="utf-8"))
    parts = ['<p class="lede">The player guide. It is a draft: it describes the game as planned, and the game is not playable yet. Pages are written in words, with no tuned numbers.</p>']
    for sec in idx["sections"]:
        parts.append(f'<h3 class="grp">{html.escape(sec["title"])}</h3>')
        for pg in sec["pages"]:
            body = md((root / pg["file"]).read_text(encoding="utf-8")); pid = "doc-" + pg["id"]
            parts.append(f'''<section class="acc leg" id="{pid}"><h3 class="acc-h"><button type="button" aria-expanded="false" aria-controls="{pid}-b"><span>{html.escape(pg["title"])}</span><i aria-hidden="true"></i></button></h3>
<div class="acc-b" id="{pid}-b"><div class="acc-in"><div class="leg-in doc">
{body}
</div></div></div></section>''')
    block = "\n".join(parts)
    p = Path(__file__).resolve().parent.parent / "index.html"; h = p.read_text(encoding="utf-8")
    new = re.sub(r"<!-- DOCS:START -->.*<!-- DOCS:END -->", lambda m: "<!-- DOCS:START -->\n" + block + "\n<!-- DOCS:END -->", h, flags=re.S)
    if new == h: print("docs panel already up to date")
    p.write_text(new, encoding="utf-8"); print("docs panel built from", root)
main()
