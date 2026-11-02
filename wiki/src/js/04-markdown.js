  /* ---------------- Markdown (small, safe renderer for project docs) ---------------- */
  function resolvePath(base, rel) {
    var parts = base.split("/"); parts.pop();
    rel.split("/").forEach(function (p) { if (p === "..") parts.pop(); else if (p !== ".") parts.push(p); });
    return parts.join("/");
  }
  function linkTarget(url, basePath) {
    if (/^(https?:|mailto:)/i.test(url)) return { href: url, ext: true };
    if (url.charAt(0) === "#") return { href: url, ext: false };
    if (/^[a-z]+:/i.test(url)) return null;
    var clean = url.split("#")[0], p = resolvePath(basePath || "", clean);
    var hit = (data.docs && data.docs.docs || []).filter(function (d) { return d.path === p; })[0];
    if (hit) return { href: "#/docs/" + hit.id, ext: false };
    return null;
  }
  function inline(src, basePath) {
    var out = "", parts = String(src).split(/(`[^`]+`)/);
    parts.forEach(function (part) {
      if (/^`[^`]+`$/.test(part)) { out += "<code>" + esc(part.slice(1, -1)) + "</code>"; return; }
      var h = esc(part);
      h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, u) {
        var raw = u.replace(/&amp;/g, "&"), tg = linkTarget(raw, basePath);
        if (!tg) return t;
        return '<a href="' + esc(tg.href) + '"' + (tg.ext ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + t + "</a>";
      });
      h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      h = h.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
      out += h;
    });
    return out;
  }
  function markdown(md, basePath) {
    // Raw HTML lines (the README's centered banner and badges) are skipped: this renderer never emits raw HTML.
    // HTML comments are dropped too, except our own markers such as <!-- hp:join-discord -->.
    var lines = String(md).replace(/\r\n?/g, "\n").split("\n")
      .filter(function (l) { return !/^\s*<\/?[a-z][^>]*>/i.test(l) && !/^\s*<!--.*-->\s*$/.test(l); }), html = "", i = 0, para = [];
    function flush() { if (para.length) { html += "<p>" + inline(para.join(" "), basePath) + "</p>"; para = []; } }
    function cells(l) { return l.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(function (c) { return c.trim(); }); }
    while (i < lines.length) {
      var l = lines[i];
      if (/^```/.test(l)) {
        var lang = l.replace(/^```\s*/, "").trim();
        flush(); var code = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
        i++;
        /* ```pyramid: one tier per line, "Name | Role, Name | Role"; the first line is the top */
        if (lang === "pyramid") {
          html += '<div class="pyr" role="list">' + code.filter(function (t) { return t.trim(); }).map(function (t, k) {
            return '<div class="pyr-t" role="listitem" style="--n:' + k + '">' + t.split(",").map(function (c) {
              var b = c.split("|"); return '<span class="pyr-n"><b>' + esc(b[0].trim()) + "</b><i>" + esc((b[1] || "").trim()) + "</i></span>";
            }).join("") + "</div>";
          }).join("") + "</div>";
          continue;
        }
        html += "<pre><code>" + esc(code.join("\n")) + "</code></pre>"; continue;
      }
      var h = /^(#{1,4})\s+(.*)$/.exec(l);
      if (h) { flush(); var lv = h[1].length; html += "<h" + lv + ">" + inline(h[2], basePath) + "</h" + lv + ">"; i++; continue; }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { flush(); html += "<hr>"; i++; continue; }
      if (/^\s*\|/.test(l) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        flush(); var head = cells(l); i += 2; var rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(cells(lines[i++]));
        html += '<div class="tw"><table><tr>' + head.map(function (c) { return "<th>" + inline(c, basePath) + "</th>"; }).join("") + "</tr>" +
          rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + inline(c, basePath) + "</td>"; }).join("") + "</tr>"; }).join("") + "</table></div>";
        continue;
      }
      if (/^>\s?/.test(l)) {
        flush(); var q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ""));
        html += "<blockquote>" + inline(q.join(" "), basePath) + "</blockquote>"; continue;
      }
      if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
        flush(); var stack = [];
        while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
          var m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]), ind = m[1].length, tag = /\d/.test(m[2]) ? "ol" : "ul";
          while (stack.length && ind < stack[stack.length - 1].ind) { html += "</li></" + stack.pop().tag + ">"; }
          if (!stack.length || ind > stack[stack.length - 1].ind) { html += "<" + tag + ">"; stack.push({ ind: ind, tag: tag }); }
          else html += "</li>";
          var text = m[3], cls = "", t = /^\[([ xX])\]\s+(.*)$/.exec(text);
          if (t) { cls = ' class="task' + (t[1] === " " ? "" : " done") + '"'; text = t[2]; }
          html += "<li" + cls + ">" + inline(text, basePath);
          i++;
        }
        while (stack.length) html += "</li></" + stack.pop().tag + ">";
        continue;
      }
      if (/^\s*$/.test(l)) { flush(); i++; continue; }
      para.push(l.trim()); i++;
    }
    flush();
    return html;
  }
