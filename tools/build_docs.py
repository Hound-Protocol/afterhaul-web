#!/usr/bin/env python3
"""Builds the Documentation panel of index.html from the player guide source in the game repo (decision 0018).
Usage: python3 tools/build_docs.py /path/to/Afterhaul/docs/player
Only the player guide is read. Nothing is written by hand in the panel: edit the source and run this again."""
import datetime, html, json, re, sys
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

FOLDER_COLORS = {"start": "#f0a202", "driver": "#e5604d", "truck": "#3ecf8e", "reference": "#4aa3ff", "modding": "#b57bff"}

def summary(body):
    m = re.search(r"<p>(.*?)</p>", body, flags=re.S)
    t = re.sub(r"<[^>]+>", "", m.group(1)) if m else ""
    t = html.unescape(t).strip()
    return html.escape(t if len(t) <= 130 else t[:127].rsplit(" ", 1)[0] + "...", quote=False)

def main():
    root = Path(sys.argv[1]); idx = json.loads((root / "index.json").read_text(encoding="utf-8"))
    folders, cards, docs, n = [], [], [], 0
    total = sum(len(sec["pages"]) for sec in idx["sections"])
    folders.append(f'<button type="button" class="wf" data-folder="all" style="--fc:#e8e1d0" aria-pressed="true"><span class="wf-tab"></span><b>All documents</b><em>{total}</em></button>')
    for sec in idx["sections"]:
        col = FOLDER_COLORS.get(sec["id"], "#8aa")
        folders.append(f'<button type="button" class="wf" data-folder="{sec["id"]}" style="--fc:{col}" aria-pressed="false"><span class="wf-tab"></span><b>{html.escape(sec["title"])}</b><em>{len(sec["pages"])}</em></button>')
        for pg in sec["pages"]:
            n += 1; code = f"AH-PG-{n:03d}"
            body = md((root / pg["file"]).read_text(encoding="utf-8")); pid = "doc-" + pg["id"]
            words = len(re.sub(r"<[^>]+>", " ", body).split()); mins = max(1, round(words / 200))
            title = html.escape(pg["title"])
            cards.append(f'<button type="button" class="wc" data-doc="{pid}" data-folder="{sec["id"]}" style="--fc:{col}"><span class="wc-code">{code}</span><b>{title}</b><span class="wc-sum">{summary(body)}</span><span class="wc-meta">{html.escape(sec["title"])} &middot; {mins} min read</span></button>')
            docs.append(f'<article class="wdoc" id="{pid}" data-folder="{sec["id"]}" data-code="{code}" data-title="{title}" data-meta="{html.escape(sec["title"])} &middot; {mins} min read" data-eff="{datetime.date.today().isoformat()}" data-folder-name="{html.escape(sec["title"])}" style="--fc:{col}" hidden>\n<div class="wbody">\n{body}\n</div>\n</article>')
    block = f'''<div class="wiki" id="wiki">
<header class="wiki-head"><h2>Documentation of AFTERHAUL</h2><p>The player guide, kept in folders. It is a draft: it describes the game as planned, and the game is not playable yet.</p></header>
<div class="wiki-main">
<nav class="wf-col" aria-label="Folders">
{chr(10).join(folders)}
</nav>
<div class="wstage" id="wstage">
<p class="wcount" id="wcount" aria-live="polite"><b id="wnum">{total}</b> <span id="wlabel">documents</span><i id="wfname">All documents</i></p>
<div class="wgrid" id="wgrid">
{chr(10).join(cards)}
</div>
</div>
</div>
<div class="wread" id="wread" hidden aria-hidden="true"><div class="wback"></div>
<div class="wsheet" role="dialog" aria-modal="true" aria-labelledby="wtitle" tabindex="-1"><div class="wsh-bar"><span id="wcode"></span><span id="wmeta"></span><button type="button" class="wclose" aria-label="Close document">Close</button></div>
<div class="wsh-body"><div class="page paper"><span class="holes" aria-hidden="true"><i></i><i></i><i></i></span><span class="pg-stamp" aria-hidden="true">Draft</span>
<div class="pg-run r1"><span>AFTERHAUL &middot; Hound Protocol</span><span id="wfolder"></span></div>
<h2 id="wtitle" class="r2"></h2>
<dl class="pg-meta r3"><div><dt>Code</dt><dd id="wm-code"></dd></div><div><dt>Version</dt><dd>Draft</dd></div><div><dt>Effective</dt><dd id="wm-eff"></dd></div><div><dt>Owner</dt><dd>Design team</dd></div><div><dt>For</dt><dd>Players</dd></div></dl>
<div id="wcontent" class="r4"></div>
<div class="pg-foot r5"><span id="wm-foot"></span><span>Written in plain words. No tuned numbers.</span></div></div></div></div></div>
<div class="wstore" hidden>
{chr(10).join(docs)}
</div>
</div>'''
    p = Path(__file__).resolve().parent.parent / "index.html"; h = p.read_text(encoding="utf-8")
    new = re.sub(r"<!-- DOCS:START -->.*<!-- DOCS:END -->", lambda m: "<!-- DOCS:START -->\n" + block + "\n<!-- DOCS:END -->", h, flags=re.S)
    if new == h: print("docs panel already up to date")
    p.write_text(new, encoding="utf-8"); print("docs panel built:", total, "documents")
main()
