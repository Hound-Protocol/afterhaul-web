#!/usr/bin/env python3
"""Build wiki/assets/js/app.js from the module sources in wiki/src/js/.

The sources are fragments of one script: they share a single scope, so they are concatenated in file-name
order inside one function wrapper (the same way the Joint Operations site was built; the docs system comes from there).
Usage: python3 tools/build_wiki_js.py [--check]"""
import pathlib, sys

root = pathlib.Path(__file__).resolve().parent.parent
src = root / "wiki" / "src" / "js"
out = root / "wiki" / "assets" / "js" / "app.js"

parts = sorted(p for p in src.glob("*.js") if not p.name.startswith("_"))
body = "\n".join(p.read_text(encoding="utf-8").rstrip() + "\n" for p in parts)
text = (src / "_header.js").read_text(encoding="utf-8") + "(function () {\n  \"use strict\";\n\n" + body + "})();\n"

if "--check" in sys.argv:
    if not out.exists() or out.read_text(encoding="utf-8") != text:
        print("wiki/assets/js/app.js is out of date. Run: python3 tools/build_wiki_js.py")
        sys.exit(1)
    print("wiki app.js is up to date.")
else:
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")
    print(f"Wrote {out.relative_to(root)} from {len(parts)} modules")
