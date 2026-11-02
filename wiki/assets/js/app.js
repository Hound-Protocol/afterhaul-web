/* AFTERHAUL · Wiki
 *
 * The documentation system (zones, folders, search, reader, A4 print, motion) was written for Hound Protocol's
 * Joint Operations site and is reused here with the owner's permission. AFTERHAUL's own documents are the content.
 *
 * Data (written by tools/build_wiki.py from the AFTERHAUL game repository, never by hand)
 *   data/config.json   site name, version
 *   data/docs.json     Library manifest
 *   data/guides.json   Handbook index (guides, policies, procedures)
 *   content/...        the documents, as Markdown
 */

(function () {
  "use strict";

  /* ---------------- Utilities ---------------- */
  // Browsers too old for the app get the plain page from index.html instead
  if (window.WIKI_LEGACY) return;
  // Hide the interface until the first screen is ready (20b-ready.js); never longer than 3 s, even if something fails
  document.documentElement.classList.add("booting");
  setTimeout(function () { document.documentElement.classList.remove("booting"); }, 3000);
  // Small polyfills for older browsers (Safari 9, old Chromium on older systems)
  if (typeof Object.assign !== "function") {
    Object.assign = function (t) { for (var i = 1; i < arguments.length; i++) { var s = arguments[i]; if (s) for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) t[k] = s[k]; } return t; };
  }
  if (window.Element && !Element.prototype.matches) Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  if (window.Element && !Element.prototype.closest) Element.prototype.closest = function (s) { var el = this; while (el && el.nodeType === 1) { if (el.matches(s)) return el; el = el.parentNode; } return null; };
  if (window.Element && !Element.prototype.remove) Element.prototype.remove = function () { if (this.parentNode) this.parentNode.removeChild(this); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmtBytes(n) { if (!n && n !== 0) return "—"; var u = ["B", "KB", "MB", "GB"], i = 0; while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; } return n.toFixed(i ? 1 : 0) + " " + u[i]; }
  function fmtDate(s) { if (!s) return "—"; var d = new Date(s); return isNaN(d) ? "—" : d.toISOString().slice(0, 10); }
  function plural(n, a, b) { return n + " " + (n === 1 ? a : (b || a + "s")); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  var session = {
    get: function (k) { try { var v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    clear: function (prefix) { try { Object.keys(sessionStorage).forEach(function (k) { if (k.indexOf(prefix) === 0) sessionStorage.removeItem(k); }); } catch (e) { /* storage unavailable */ } }
  };

  // fetch() fallback for older browsers: same result, through XMLHttpRequest
  function xhrGet(url, headers) {
    return new Promise(function (ok, fail) {
      var x = new XMLHttpRequest(), h = headers || {};
      x.open("GET", url, true); x.timeout = 9000;
      Object.keys(h).forEach(function (k) { x.setRequestHeader(k, h[k]); });
      x.onload = function () { if (x.status < 200 || x.status > 299) fail(new Error("HTTP " + x.status)); else ok(x.responseText); };
      x.onerror = x.ontimeout = function () { fail(new Error("Network error")); };
      x.send();
    });
  }
  function fetchJSON(url, opts) {
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 9000);
    if (typeof fetch !== "function") { clearTimeout(timer); return xhrGet(url, opts && opts.headers).then(JSON.parse); }
    return fetch(url, Object.assign({ signal: ctl ? ctl.signal : undefined, cache: /^https?:/.test(url) ? "default" : "no-cache" }, opts || {})).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }, function (e) { clearTimeout(timer); throw e; });
  }
  function fetchText(url) {
    if (typeof fetch !== "function") return xhrGet(url);
    return fetch(url, { cache: /^https?:/.test(url) ? "default" : "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); });
  }

  /* ---------------- LED lines ---------------- */
  function led(el, text) {
    if (!el) return;
    el.textContent = "";
    var s = String(text || "");
    for (var k = 0; k < s.length; k++) {
      var span = document.createElement("span");
      if (s[k] === " ") { span.className = "gap"; span.textContent = "\u00a0"; }
      else { span.className = "ch"; span.textContent = s[k]; span.style.animationDelay = (k * 8) + "ms"; }
      el.appendChild(span);
    }
    el.setAttribute("aria-label", s);
  }
  var statusTimer;
  function status(text, keep) {
    led($("#ledStatus"), text);
    clearTimeout(statusTimer);
    if (text && !keep) statusTimer = setTimeout(function () { led($("#ledStatus"), ""); }, 6000);
  }

  /* ---------------- Config and state ---------------- */
  var cfg = { project: "AFTERHAUL", team: "AFTERHAUL", branch: "main", cacheMinutes: 10, siteUrl: "" };
  var data = { docs: null, guides: null };
  var docCache = {};
  var OPT_KEY = "afterhaul-wiki-options";
  var PREFERS_LESS_MOTION = (function () { try { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } })();
  var DEFAULT_OPTS = { glitch: !PREFERS_LESS_MOTION, grid: true, motion: !PREFERS_LESS_MOTION, ledFx: true, emblem: true, contrast: false, size: "1" };
  var opts = Object.assign({}, DEFAULT_OPTS, store.get(OPT_KEY, {}));
  function applyOpts() {
    var c = document.body.classList;
    c.toggle("no-glitch", !opts.glitch);
    c.toggle("no-grid", !opts.grid);
    c.toggle("no-motion", !opts.motion);
    c.toggle("no-led", !opts.ledFx);
    c.toggle("hi-contrast", !!opts.contrast);
    document.documentElement.style.setProperty("--fs", opts.size);
  }
  /* The wiki has no sign-in, records or interface sounds: these stubs keep the shared modules working */
  function blip() {}
  var SI = { user: null };
  function siIn() { return false; }
  function sgIn() { return false; }
  function siLevel() { return 1; }
  var EMBED = null;

  /* ---------------- Data ----------------
     data/docs.json and data/guides.json are written by tools/build_wiki.py. Text is read from content/<path>. */
  function loadLocal(name) {
    if (data[name]) return Promise.resolve(data[name]);
    function get() { return fetchJSON("data/" + name + ".json").then(function (v) { data[name] = v; return v; }); }
    return get().catch(function () { return new Promise(function (ok) { setTimeout(ok, 700); }).then(get); }).catch(function () { return null; });
  }
  function loadDoc(doc) {
    if (docCache[doc.path]) return Promise.resolve(docCache[doc.path]);
    return fetchText("content/" + doc.path).then(function (t) { docCache[doc.path] = t; return t; });
  }

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

  /* ---------------- Compatibility layer ----------------
   * Detects the browser engine, input type and platform, adds classes to <html>
   * for CSS hooks, applies fallbacks, and exposes the result as JO.env.
   * Targets: Chrome, Edge, Brave, Opera, Vivaldi (Blink), Firefox (Gecko),
   * Safari on macOS and iOS (WebKit), Chrome and Samsung Internet on Android.
   */
  var ENV = (function () {
    var ua = navigator.userAgent || "", mm = function (q) { try { return window.matchMedia && matchMedia(q).matches; } catch (e) { return false; } };
    var touch = mm("(pointer: coarse)") || ("ontouchstart" in window && !mm("(pointer: fine)"));
    var ios = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var css = function (p, v) { try { return window.CSS && CSS.supports(p, v); } catch (e) { return false; } };
    var engine = css("-moz-appearance", "none") ? "gecko" : (window.chrome || /Chrom(e|ium)|Edg\//.test(ua)) ? "blink" : /AppleWebKit/.test(ua) ? "webkit" : "other";
    return {
      engine: engine,
      brave: !!(navigator.brave),
      ios: ios,
      android: /Android/.test(ua),
      touch: !!touch,
      hover: mm("(hover: hover)"),
      standalone: mm("(display-mode: standalone)") || navigator.standalone === true,
      reducedMotion: mm("(prefers-reduced-motion: reduce)"),
      features: {
        intersectionObserver: "IntersectionObserver" in window,
        clipPath: css("clip-path", "inset(0 0 0 0)"),
        dvh: css("height", "100dvh"),
        backdrop: css("backdrop-filter", "blur(2px)") || css("-webkit-backdrop-filter", "blur(2px)"),
        fetch: "fetch" in window,
        abort: "AbortController" in window,
        audio: !!(window.AudioContext || window.webkitAudioContext),
        storage: (function () { try { localStorage.setItem("_t", "1"); localStorage.removeItem("_t"); return true; } catch (e) { return false; } })()
      }
    };
  })();
  (function applyEnv() {
    var c = document.documentElement.classList, f = ENV.features;
    c.add("eng-" + ENV.engine);
    c.toggle("is-touch", ENV.touch);
    c.toggle("is-ios", ENV.ios);
    c.toggle("is-android", ENV.android);
    c.toggle("no-clip", !f.clipPath);
    c.toggle("no-dvh", !f.dvh);
    c.toggle("no-io", !f.intersectionObserver);
    // Older mobile browsers: 100vh includes the address bar. Keep a --vh unit in sync.
    function vh() { document.documentElement.style.setProperty("--vh", (window.innerHeight * 0.01) + "px"); }
    vh(); window.addEventListener("resize", vh, { passive: true }); window.addEventListener("orientationchange", vh, { passive: true });
  })();
  function compact() { try { return matchMedia("(max-width: 700px)").matches || ENV.touch; } catch (e) { return ENV.touch; } }

  /* ---------------- Views ---------------- */
  var currentView = "";
  function shell(kicker, title, body) {
    return '<div class="vh"><div><span class="kicker">' + esc(kicker) + '</span><h2>' + esc(title) + '</h2></div><a class="btn" href="../">AFTERHAUL</a></div><div id="vb">' + body + "</div>";
  }
  function milestone() { return ""; }
  function loading(t) { return '<p class="sub"><span class="spin"></span>' + esc(t) + "</p>"; }

  /* ---------------- Click to copy ----------------
   * Anything players are meant to copy (code in documents, guides, steps and cards) copies to the
   * clipboard with one click. Pointing at it types "click to copy this text" beside the pointer.
   * Works by keyboard too: copyable text is focusable, Enter or Space copies.
   */
  var COPY_SEL = "#view code, #view pre";
  function copyTarget(el) {
    while (el && el !== document) {
      if (el.nodeType === 1 && (el.tagName === "CODE" || el.tagName === "PRE") && el.closest && el.closest("#view")) {
        if (el.tagName === "CODE" && el.parentNode && el.parentNode.tagName === "PRE") return el.parentNode;
        if (el.closest("a, button, .sw, .field")) return null;
        return el;
      }
      el = el.parentNode;
    }
    return null;
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, fail) {
      // Older browsers: copy through a hidden text area
      var t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy") ? ok() : fail(); } catch (e) { fail(e); }
      document.body.removeChild(t);
    });
  }
  var copyTip = null, copyTipFor = null;
  function tipEl() {
    if (!copyTip) { copyTip = document.createElement("div"); copyTip.className = "copytip"; copyTip.setAttribute("aria-hidden", "true"); document.body.appendChild(copyTip); }
    return copyTip;
  }
  function typeTip(text, cls) {
    var t = tipEl();
    t.className = "copytip on" + (cls ? " " + cls : "");
    t.innerHTML = String(text).split("").map(function (ch, i) {
      return '<span class="ch" style="animation-delay:' + (opts.motion ? i * 18 : 0) + 'ms">' + (ch === " " ? "&nbsp;" : esc(ch)) + "</span>";
    }).join("");
  }
  function placeTip(x, y) {
    var t = tipEl(), w = t.offsetWidth || 180;
    t.style.left = Math.min(window.innerWidth - w - 8, x + 14) + "px";
    t.style.top = Math.max(8, y + 18) + "px";
  }
  function hideTip() { if (copyTip) copyTip.className = "copytip"; copyTipFor = null; }
  function doCopy(el, x, y) {
    var text = (el.innerText || el.textContent || "").replace(/\s+$/, "");
    copyText(text).then(function () {
      el.classList.add("copied"); setTimeout(function () { el.classList.remove("copied"); }, 900);
      typeTip("copied to clipboard", "ok"); if (x != null) placeTip(x, y);
      status("Copied: " + (text.length > 40 ? text.slice(0, 39) + "…" : text));
      if (typeof blip === "function") blip("go");
    }, function () { typeTip("press Ctrl+C to copy", "bad"); });
  }
  // Mark copyable text so it can be reached by keyboard and is announced as a button
  function markCopyable(root) {
    $$(COPY_SEL, root).forEach(function (el) {
      var t = copyTarget(el);
      if (!t || t.getAttribute("data-copy")) return;
      t.setAttribute("data-copy", "");
      t.setAttribute("tabindex", "0");
      t.setAttribute("role", "button");
      t.setAttribute("aria-label", "Copy: " + (t.textContent || "").trim().slice(0, 80));
    });
  }
  if (window.MutationObserver) {
    new MutationObserver(function () { var v = $("#view"); if (v && !v.hidden) markCopyable(v); }).observe(document.getElementById("view") || document.body, { childList: true, subtree: true });
  }
  document.addEventListener("mouseover", function (e) {
    var t = copyTarget(e.target);
    if (t === copyTipFor) return;
    if (!t) { hideTip(); return; }
    copyTipFor = t; typeTip("click to copy this text"); placeTip(e.clientX, e.clientY);
  });
  document.addEventListener("mousemove", function (e) { if (copyTipFor) placeTip(e.clientX, e.clientY); });
  document.addEventListener("click", function (e) {
    var t = copyTarget(e.target);
    if (!t) return;
    var sel = window.getSelection && String(window.getSelection());
    if (sel && sel.length > 0 && t.contains(window.getSelection().anchorNode)) return; // let people select part of it
    doCopy(t, e.clientX, e.clientY);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target && e.target.hasAttribute && e.target.hasAttribute("data-copy")) {
      e.preventDefault(); var r = e.target.getBoundingClientRect(); doCopy(e.target, r.left, r.bottom - 10);
    }
  });
  document.addEventListener("scroll", hideTip, true);

  /* ---------------- Modal window ----------------
     A centered window in the site's own design, used for sign-in and confirmations. Esc or the backdrop cancels. */
  function hpModal(o) {
    var old = $("#hpModal"); if (old) old.remove();
    document.body.insertAdjacentHTML("beforeend", '<div class="hm" id="hpModal" role="dialog" aria-modal="true" aria-labelledby="hmTitle"><div class="hm-back"></div>' +
      '<div class="hm-win' + (o.tone ? " hm-" + o.tone : "") + '"><div class="hm-bar"><span>' + esc(o.kicker || "AFTERHAUL") + '</span><button type="button" class="hm-x" aria-label="Close">✕</button></div>' +
      '<div class="hm-body"><h3 id="hmTitle">' + esc(o.title || "") + '</h3><div class="hm-content">' + (o.html || "") + '</div></div><div class="hm-act"></div></div></div>');
    var el = $("#hpModal"), act = $(".hm-act", el), done = null, prev = document.activeElement, stage = $("#stage");
    /* While a window is open, the page behind it is out of reach for the keyboard and screen readers */
    if (stage) stage.setAttribute("inert", "");
    var m = {
      el: el,
      body: function (html) { $(".hm-content", el).innerHTML = html; },
      actions: function (list) {
        act.innerHTML = (list || []).map(function (a, i) { return '<button type="button" class="btn' + (a.primary ? " primary" : "") + (a.danger ? " danger" : "") + '" data-i="' + i + '">' + esc(a.label) + "</button>"; }).join("");
        $$("button", act).forEach(function (b) { b.addEventListener("click", function () { var a = list[+b.getAttribute("data-i")]; if (a.run) a.run(m); else m.close(a.value); }); });
        var f = $(".primary, .danger", act) || $("button", act); if (f) f.focus();
      },
      close: function (v) {
        document.removeEventListener("keydown", key);
        el.classList.add("out");
        setTimeout(function () {
          el.remove();
          if (stage && !document.querySelector(".hm:not(.out)")) stage.removeAttribute("inert");
          if (prev && prev.focus && document.body.contains(prev) && !document.querySelector(".hm:not(.out)")) prev.focus();
        }, opts.motion ? 220 : 0);
        if (done) { var d = done; done = null; d(v); }
      },
      result: new Promise(function (ok) { done = ok; })
    };
    function key(e) {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (o.cancel) o.cancel(); m.close(null); return; }
      /* Tab stays inside the window */
      if (e.key === "Tab") {
        var f = $$("button:not([disabled]), a[href], input:not([disabled]), textarea, select, [tabindex]:not([tabindex='-1'])", el).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", key);
    $(".hm-x", el).addEventListener("click", function () { if (o.cancel) o.cancel(); m.close(null); });
    $(".hm-back", el).addEventListener("click", function () { if (o.cancel) o.cancel(); m.close(null); });
    m.actions(o.actions);
    blip();
    return m;
  }
  /* A yes-or-no question in a modal window; resolves true when confirmed */
  function hpConfirm(title, text, yes, no, tone) {
    var m = hpModal({ kicker: "Confirm", title: title, html: "<p>" + esc(text) + "</p>", tone: tone, actions: [{ label: no || "Cancel", value: false }, { label: yes || "OK", value: true, danger: tone === "danger", primary: tone !== "danger" }] });
    return m.result.then(function (v) { return !!v; });
  }
  /* Broken pictures (a GitHub avatar that does not load): one handler for the whole page instead of inline onerror
     attributes, which the Content Security Policy does not allow. data-err says what to do. */
  document.addEventListener("error", function (e) {
    var t = e.target; if (!t || t.tagName !== "IMG" || !t.hasAttribute("data-err")) return;
    var how = t.getAttribute("data-err");
    if (how === "hide") t.style.visibility = "hidden";
    else if (how === "photo") { var box = t.parentNode, card = box && box.parentNode; if (card && card.classList) card.classList.remove("has-photo"); if (box) box.remove(); }
    else t.remove();
  }, true);

  /* ---------------- Position marker ----------------
     The browser's own scrollbar is hard to see against the frame, so a marker rides beside the right-hand ruler, like the
     depth gauge on a Metal Gear radar: an orange chevron pointing at the ruler, with how far down the page you are.
     It sits just left of the ruler (never over its lines) and between the corner brackets, and hides when the page fits. */
  function scrollMarkBoot() {
    var stage = $("#stage"), ce = $("#center");
    if (!stage || !ce || $("#posMark")) return;
    stage.insertAdjacentHTML("beforeend", '<div class="pos-mark" id="posMark" aria-hidden="true"><i class="pm-track"></i><i class="pm-fill"></i><span class="pm-k"><b>000</b><i class="pm-chev"></i></span></div>');
    var mk = $("#posMark"), k = $(".pm-k", mk), fill = $(".pm-fill", mk), num = $("b", mk), raf = 0;
    function draw() {
      raf = 0;
      var room = ce.scrollHeight - ce.clientHeight;
      /* Never over the content: with a narrow margin only the chevron shows, with less than that nothing does */
      var host = $("#view:not([hidden])") || $("#menuView"), free = host ? stage.getBoundingClientRect().right - host.getBoundingClientRect().right : 99;
      mk.classList.toggle("slim", free < 80);
      /* Start below the section bar's full-width line, so the track never crosses it */
      var sw = $("#view:not([hidden]) .secwrap"), st = stage.getBoundingClientRect().top;
      mk.style.top = Math.max(104, sw ? Math.round(sw.getBoundingClientRect().bottom - st + 16) : 0) + "px";
      var on = room > 24 && free >= 44 && !document.body.classList.contains("print");
      mk.classList.toggle("on", on);
      if (!on) return;
      var f = Math.min(1, Math.max(0, ce.scrollTop / room));
      k.style.top = fill.style.height = (f * 100).toFixed(2) + "%";
      num.textContent = ("00" + Math.round(f * 100)).slice(-3);
      mk.classList.toggle("end", f > 0.995);
    }
    function later() { if (!raf) raf = requestAnimationFrame(draw); }
    ce.addEventListener("scroll", later, { passive: true });
    window.addEventListener("resize", later);
    /* Pages grow as documents and data arrive: watch the content, not only the window */
    if (typeof ResizeObserver === "function") { var ro = new ResizeObserver(later); ro.observe(ce); $$("#center > *").forEach(function (c) { ro.observe(c); }); }
    if (typeof MutationObserver === "function") new MutationObserver(later).observe(ce, { childList: true, subtree: true });
    window.addEventListener("hashchange", function () { setTimeout(later, 60); });
    later();
  }

  /* ---------------- Documentation ----------------
     The Docs section is the dossier cabinet (17b-cabinet.js). loadDoc reads a document from the bundled copy,
     the deployed site or GitHub. */
  /* #/docs asks first: Library or Handbook. #/docs/library opens the Library on its Overview; #/docs/<id> opens a document. */
  function viewDocs(id) { if (!id) return viewDocPick(); return viewCabinet(id === "library" ? "" : id); }
  /* The two zones' own icons: a filing cabinet for the Library, a ring binder for the Handbook */
  var ZONE_ICO = {
    lib: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="4" width="30" height="40" rx="1.5"/><path d="M9 17.5h30M9 31h30"/><rect class="zi-f" x="19" y="8.5" width="10" height="4"/><rect class="zi-f" x="19" y="22" width="10" height="4"/><rect class="zi-f" x="19" y="35.5" width="10" height="4"/><path d="M12 47h4M32 47h4"/></svg>',
    hb: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 4h26v40H13z"/><path class="zi-f" d="M13 4h6v40h-6z"/><circle cx="16" cy="13" r="2.4"/><circle cx="16" cy="24" r="2.4"/><circle cx="16" cy="35" r="2.4"/><path d="M24 14h10M24 19h10M24 24h7"/><path class="zi-s" d="M25 34l9-6"/></svg>'
  };
  function docCounts() {
    var all = (data.docs && data.docs.docs) || [], hb = ((data.guides && data.guides.guides) || []).length || all.filter(function (d) { return d.group === "Handbook"; }).length;
    return { lib: all.filter(function (d) { return d.group !== "Handbook"; }).length, hb: hb };
  }
  /* The first step of Docs: two large doors, each with its texture, icon and a clear way in */
  function viewDocPick() {
    var v = $("#view");
    function door(id, href, name, kick, sub, go) {
      var n = docCounts()[id];
      return '<a class="door d-' + id + '" href="' + href + '"><span class="door-tex" aria-hidden="true"></span><span class="door-ico">' + ZONE_ICO[id] + '</span>' +
        '<span class="door-t"><small>' + kick + "</small><b>" + name + '</b><span class="door-n">' + (n ? n + " documents" : "&nbsp;") + "</span><span>" + sub + "</span></span>" +
        '<span class="door-go">' + go + '<i aria-hidden="true">→</i></span></a>';
    }
    v.innerHTML = shell("Documentation", "Choose a zone",
      '<p class="sub">Documentation has two zones. Pick one; you can switch at any time from the bar at the top.</p>' +
      '<div class="doors">' +
      door("lib", "#/docs/library", "Library", "Zone 1 · Reference", "What AFTERHAUL is, where it stands, how it is made, terms and legal. Start here to understand the project.", "Open the Library") +
      door("hb", "#/guides", "Handbook", "Zone 2 · How to", "Guides, policies and procedures: how to play, make and test AFTERHAUL. Printable on A4.", "Open the Handbook") +
      "</div>");
    Promise.all([loadLocal("docs"), loadLocal("guides")]).then(function () {
      if (currentView !== "docs" || !$(".doors")) return;
      var c = docCounts(); $$(".door").forEach(function (a) { var n = c[a.classList.contains("d-lib") ? "lib" : "hb"]; $(".door-n", a).textContent = n ? n + " documents" : ""; });
    }, function () {});
  }
  /* Documentation has two zones: the Library (plans, decisions, research, the Dev Log…) and the Handbook (guides, policies, procedures) */
  function docZones(active) {
    var all = (data.docs && data.docs.docs) || [], hb = ((data.guides && data.guides.guides) || []).length || all.filter(function (d) { return d.group === "Handbook"; }).length;
    var lib = all.filter(function (d) { return d.group !== "Handbook"; }).length;
    function z(id, href, name, sub) {
      return '<a class="zone z-' + id + (active === id ? " on" : "") + '" href="' + href + '"' + (active === id ? ' aria-current="page"' : "") + '><span class="door-tex" aria-hidden="true"></span><span class="z-ico" aria-hidden="true">' + ZONE_ICO[id] + "</span><b>" + name + "</b><small>" + sub + '</small><i class="z-go" aria-hidden="true">' + (active === id ? "You are here" : "Switch →") + "</i></a>";
    }
    return '<nav class="zones" aria-label="Documentation zones">' +
      z("lib", "#/docs/library", "Library", (lib ? lib + " documents · " : "") + "overview, roadmap, process, terms and legal") +
      z("hb", "#/guides", "Handbook", (hb ? hb + " documents · " : "") + "guides, policies and procedures, printable on A4") + "</nav>";
  }
  function addZones(active) { var vh = $(".vh"); if (vh && !$(".zones")) vh.insertAdjacentHTML("afterend", docZones(active)); }
  function loadDoc(doc) {
    if (docCache[doc.path]) return Promise.resolve(docCache[doc.path]);
    if (EMBED && EMBED.content && EMBED.content[doc.path] != null) return Promise.resolve(docCache[doc.path] = EMBED.content[doc.path]);
    var raw = "https://raw.githubusercontent.com/" + cfg.repo + "/" + cfg.branch + "/" + doc.path;
    return fetchText("content/" + doc.path).catch(function () { return fetchText(raw); }).then(function (t) { docCache[doc.path] = t; return t; });
  }

  /* ---------------- Docs: dossier cabinet ----------------
     Every library group is a drawer of folders. Opening a folder lays the document on the desk beside the cabinet:
     a typed page clipped into a kraft folder, with paper and colour that show its class (policy, procedure, guide,
     decision record, research, technical, community, project, legal).
     Search (Ctrl+K or /) filters the folders themselves, Library only: every word must match the file number, the title
     or the text. Matching folders stay in their drawers, best first; arrow keys move between them, Enter opens one, and
     the opened page highlights and scrolls to the first match. */
  var CAB_GROUPS = {
    "Player guide": ["PLY", "#f0a202", "#9a5f00"],
    Handbook: ["HB", "#c9a24a", "#7d5f15"], Decisions: ["ADR", "#e0453f", "#a3352b"], Research: ["RES", "#5aa7d6", "#1d6a8a"],
    Technical: ["TEC", "#f28c28", "#a8560f"], Community: ["COM", "#7fbf8a", "#3b7446"], Project: ["PRJ", "#c9d0d2", "#4d5a60"], Legal: ["LEG", "#b07cd6", "#6e4a96"],
    Staff: ["LV3", "#7fbf8a", "#3b7446"], Leads: ["LV5", "#f28c28", "#a8560f"], Administration: ["LV6", "#a77de0", "#5e3d8f"]
  };
  var CAB_CLASS = { Decisions: ["decision", "Decision record"], Research: ["research", "Research"], Technical: ["technical", "Technical"],
    Community: ["community", "Community"], Project: ["project", "Project"], Legal: ["legal", "Legal"],
    Staff: ["restricted", "Restricted"], Leads: ["restricted", "Restricted"], Administration: ["restricted", "Restricted"] };
  var CAB_ORDER = ["Player guide", "Project", "Handbook", "Decisions", "Research", "Technical", "Community", "Legal", "Staff", "Leads", "Administration"];
  /* Clearance. Everything in the public repository is LV1: anyone can read it. Restricted documents live in private
     repositories, one per clearance (config.signin.areas); GitHub itself decides who can read them (ADR 0011, 0017).
     Each restricted area is a drawer: its files when your card and GitHub both allow it, otherwise one locked file. */
  var cabX = {}, cabDocs = [];
  /* Search by name or by content: a small switch under each search box (Library and Handbook) */
  function smSwitch(id, mode) {
    return '<div class="sm" role="group" aria-label="Search by" id="' + id + 'Sm"><span>Search by</span>' +
      [["name", "Name"], ["text", "Content"]].map(function (m) { return '<button type="button" data-sm="' + m[0] + '" aria-pressed="' + (mode === m[0]) + '">' + m[1] + "</button>"; }).join("") + "</div>";
  }
  function smWire(id, on) {
    $$("#" + id + "Sm [data-sm]").forEach(function (b) {
      b.addEventListener("click", function () { $$("#" + id + "Sm [data-sm]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); blip(); on(b.getAttribute("data-sm")); });
    });
  }
  function cabLvl() { return siIn() || sgIn() ? siLevel() : 1; }
  function cabSlug(p) { return p.replace(/\.md$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase(); }
  function cabXDocs(onChange) {
    var areas = (cfg.signin && cfg.signin.areas) || [], out = [], lvl = cabLvl(), who = typeof siIn === "function" && siIn() ? SI.user.id : (sgIn() ? "guest" : 0);
    areas.forEach(function (a, i) {
      var need = +String(a.card).slice(2), st = cabX[i];
      if (st && st.who !== who) st = cabX[i] = null;
      var base = { group: a.title, restricted: { area: i, repo: a.repo, card: a.card, need: need } };
      function lock(why) { return [Object.assign({ id: "r" + i + "-restricted", title: a.title + " files", locked: why }, base)]; }
      if (lvl < need) { out = out.concat(lock("level")); return; }
      if (!st) {
        st = cabX[i] = { who: who, state: "loading", docs: [] };
        Promise.resolve([]).then(function (paths) {
          st.state = "open";
          st.docs = paths.map(function (pth) { return Object.assign({ id: "r" + i + "-" + cabSlug(pth), title: pth, path: pth }, base); });
          if (onChange) onChange();
        }, function () { st.state = "github"; if (onChange) onChange(); });
      }
      if (st.state === "open") out = out.concat(st.docs.length ? st.docs : lock("empty"));
      else if (st.state === "github") out = out.concat(lock("github"));
      else out = out.concat([Object.assign({ id: "r" + i + "-loading", title: "Checking clearance…", locked: "loading" }, base)]);
    });
    return out;
  }
  var cabMode = "name", cabOpen = {}, cabQ = "", cabJump = false, cabHL = null, cabIdx = null, cabIdxP = null, cabSel = 0, cabRes = [];
  function cabGroup(g) { return CAB_GROUPS[g] || ["DOC", "#c9d0d2", "#4d5a60"]; }
  /* File number and plain title: HP-POL-009, ADR-0012, or the group prefix and position */
  function cabCode(d, docs) {
    var m = /^(HP-[A-Z]{3}-\d{3})\s+(.*)$/.exec(d.title);
    if (m) return [m[1], m[2]];
    m = /^(\d{4})\s+(.*)$/.exec(d.title);
    if (m) return ["ADR-" + m[1], m[2]];
    var same = docs.filter(function (x) { return x.group === d.group; }), n = same.indexOf(d) + 1;
    return [cabGroup(d.group)[0] + "-" + (n < 10 ? "0" : "") + n, d.title];
  }
  /* The document's class: the handbook type from its code, otherwise its library group */
  /* Classification stamp, in the middle of a Library document's header: public documents are not classified,
     LV3 to LV5 are low-clearance classified, LV6 and LV7 high-clearance classified */
  function cabStamp(x) {
    if (!x) return '<span class="ds-cls c-open"><b>Not classified</b><small>Public</small></span>';
    return '<span class="ds-cls ' + (x.need >= 6 ? 'c-high"><b>Classified</b><small>High clearance</small>' : 'c-low"><b>Classified</b><small>Low clearance</small>') + "</span>";
  }
  function cabWarn(x) {
    return x ? '<p class="ds-warn"><b>Classified LV' + esc(x.need) + ".</b> Do not share this document, or anything in it, with anyone below LV" + esc(x.need) + ".</p>" : "";
  }
  function cabClass(d, code) {
    if (/-POL-/.test(code)) return ["policy", "Policy"];
    if (/-SOP-/.test(code)) return ["procedure", "Procedure"];
    if (/-GDE-/.test(code)) return ["guide", "Guide"];
    return CAB_CLASS[d.group] || ["project", d.group];
  }

  function viewCabinet(id) {
    var v = $("#view");
    if (!$("#cab")) { v.innerHTML = shell("Documentation", "Library", loading("Opening the cabinet")); addZones("lib"); }
    Promise.all([loadLocal("docs"), loadLocal("guides")]).then(function (res) {
      if (currentView !== "docs") return;
      var man = res[0], all = (man && man.docs) || [];
      function xChanged() {
        if (currentView !== "docs" || !$("#cab")) return;
        cabDocs = all.concat(cabXDocs(xChanged)); drawDrawers(cabDocs);
        var want = (location.hash.split("/")[2] || ""), cur = $("#docBody").getAttribute("data-id");
        if (/^r\d+-/.test(want) && cur !== want) { var d2 = cabDocs.filter(function (d) { return d.id === want; })[0]; if (d2) openDossier(d2, cabDocs); else { var ph = cabDocs.filter(function (d) { return d.restricted && d.locked && want.indexOf("r" + d.restricted.area + "-") === 0; })[0]; if (ph) openDossier(ph, cabDocs); } }
      }
      var docs = cabDocs = all.concat(cabXDocs(xChanged));
      var zn = $(".zones"); if (zn) zn.outerHTML = docZones("lib");
      if (!docs.length) { $("#vb").innerHTML = '<div class="empty">No documents<small>data/docs.json could not be loaded.</small></div>'; return; }
      var doc = docs.filter(function (d) { return d.id === id; })[0];
      /* A restricted link before its drawer is read: show that drawer's placeholder until it is */
      if (!doc && /^r\d+-/.test(id || "")) doc = docs.filter(function (d) { return d.restricted && id.indexOf("r" + d.restricted.area + "-") === 0; })[0];
      /* Handbook documents live in the Handbook zone */
      if (doc && doc.group === "Handbook") { location.replace("#/guides/" + doc.id); return; }
      /* Docs always opens on the Overview, however you arrive */
      doc = doc || docs.filter(function (d) { return d.id === "overview"; })[0] || docs.filter(function (d) { return d.group !== "Handbook"; })[0];
      /* One drawer open at a time: the one holding the open document */
      cabOpen = {}; cabOpen[doc.group] = true;
      if (!$("#cab")) {
        $("#vb").innerHTML = '<div class="cab" id="cab"><div class="cab-side">' +
          '<label class="cab-q"><span aria-hidden="true">⌕</span><input id="cq" type="search" placeholder="' + (cabMode === "text" ? "Search inside the Library\'s documents" : "Search the Library: numbers and titles") + '" aria-label="Search the Library" aria-controls="cabDrawers" autocomplete="off" spellcheck="false"><kbd>Ctrl K</kbd><i class="cab-scan" aria-hidden="true"></i></label>' + smSwitch("cab", cabMode) +
          '<div class="cab-count" id="cabCount" aria-live="polite"></div><div class="cab-drawers" id="cabDrawers"></div></div>' +
          '<article class="dossier" id="docBody" tabindex="-1"></article></div>';
        var dw = $("#cabDrawers"); dw.classList.add("first"); setTimeout(function () { dw.classList.remove("first"); }, 1400);
        var q = $("#cq");
        q.value = cabQ;
        q.addEventListener("input", function () { cabQ = q.value; cabSel = 0; cabFind(docs); });
        smWire("cab", function (m) { cabMode = m; cabSel = 0; q.placeholder = m === "text" ? "Search inside the Library's documents" : "Search the Library: numbers and titles"; cabFind(cabDocs); q.focus(); });
        q.addEventListener("keydown", function (e) {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") { if (!cabRes.length) return; e.preventDefault(); cabSel = (cabSel + (e.key === "ArrowDown" ? 1 : -1) + cabRes.length) % cabRes.length; cabMark(true); }
          else if (e.key === "Enter") { var id = cabRes[cabSel]; if (id) { e.preventDefault(); cabGo(id); } }
          else if (e.key === "Escape" && q.value) { e.preventDefault(); e.stopPropagation(); q.value = ""; cabQ = ""; cabFind(docs); }
        });
      }
      drawDrawers(docs, doc.id, true);
      openDossier(doc, docs);
      if (cabQ.trim() && !cabIdx) cabFind(docs);
    });
  }
  /* Query words, lightly stemmed so "appeals" finds "appeal" and "signing" finds "sign" */
  function cabWords() { return cabQ.trim().toLowerCase().split(/\s+/).filter(Boolean).map(function (w) { var s = w.replace(/(ing|ed|es|s)$/, ""); return s.length >= 3 ? s : w; }); }
  function cabRe(words) { return new RegExp("(" + words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")[a-z]*", "ig"); }
  /* A word matches a file number by prefix or by number: "pol 9" finds HP-POL-009, "12" finds ADR-0012 */
  function cabCodeHit(w, code) {
    return code.toLowerCase().split("-").some(function (s) { return s.indexOf(w) === 0 || (/^\d+$/.test(w) && /^\d+$/.test(s) && +s === +w); });
  }
  function cabTitleHit(words, d, code) {
    var t = (code[0] + " " + code[1] + " " + d.group).toLowerCase();
    return words.every(function (w) { return t.indexOf(w) > -1 || cabCodeHit(w, code[0]); });
  }
  /* Which Library folders match the search, with a score: file number and title count most, then headings, then the text.
     Before the text index is ready only numbers and titles are searched; the folders update when it is. */
  function cabMatch(docs) {
    var words = cabWords();
    if (!words.length || cabQ.trim().length < 2) return null;
    var by = {}, whole = cabQ.trim().toLowerCase();
    if (cabIdx && cabMode === "text") cabIdx.forEach(function (e) { by[e.d.id] = e; });
    var out = {};
    docs.forEach(function (d) {
      if (d.group === "Handbook") return;
      var c = cabCode(d, docs), title = (c[0] + " " + c[1] + " " + d.group).toLowerCase(), e = by[d.id], score = 0, inName = true;
      var ok = words.every(function (w) {
        var t = title.indexOf(w) > -1, k = cabCodeHit(w, c[0]), at = e ? e.low.indexOf(w) : -1, n = 0, j = at;
        if (!t && !k) inName = false;
        if (!t && !k && at < 0) return false;
        while (j > -1 && n < 10) { n++; j = e.low.indexOf(w, j + w.length); }
        score += (k ? 30 : 0) + (t ? 20 : 0) + (e && e.hlow.indexOf(w) > -1 ? 6 : 0) + n;
        return true;
      });
      if (!ok) return;
      if (title.indexOf(whole) > -1) score += 25;
      out[d.id] = { score: score, text: !inName };
    });
    return out;
  }
  /* Runs the search: numbers and titles at once, the text as soon as the index is read */
  function cabFind(docs) {
    var cab = $("#cab"), live = !!(cabQ.trim().length >= 2);
    if (!cab) return;
    cab.classList.toggle("searching", live);
    drawDrawers(docs);
    if (live && !cabIdx && cabMode === "text") {
      cab.classList.add("indexing");
      var q = cabQ;
      cabIndex(docs).then(function () { if (currentView !== "docs" || !$("#cab")) return; $("#cab").classList.remove("indexing"); if (cabQ === q) drawDrawers(docs); });
    }
  }
  function drawDrawers(docs, active, follow) {
    var on = $(".fold.on");
    active = active || (on ? on.getAttribute("data-id") : "");
    var words = cabWords(), hits = cabMatch(docs), by = {}, total = 0;
    docs.forEach(function (d) { (by[d.group] = by[d.group] || []).push(d); });
    delete by.Handbook;
    var re = hits ? cabRe(words) : null;
    function hl(t) { return re ? esc(t).replace(re, function (m) { return "<mark>" + m + "</mark>"; }) : esc(t); }
    var groups = CAB_ORDER.filter(function (g) { return by[g]; }).concat(Object.keys(by).filter(function (g) { return CAB_ORDER.indexOf(g) < 0; }));
    /* While searching, the drawer with the best match comes first */
    if (hits) {
      var best = {};
      groups.forEach(function (g) { best[g] = Math.max.apply(null, [0].concat(by[g].map(function (d) { return hits[d.id] ? hits[d.id].score : 0; }))); });
      groups = groups.slice().sort(function (a, b) { return best[b] - best[a]; });
    }
    $("#cabDrawers").innerHTML = groups.map(function (g, gi) {
      var gc = cabGroup(g), list = by[g];
      if (hits) list = list.filter(function (d) { return hits[d.id]; }).sort(function (a, b) { return hits[b.id].score - hits[a.id].score; });
      if (hits && !list.length) return "";
      total += list.length;
      var open = hits ? true : !!cabOpen[g];
      var rx = list[0] && list[0].restricted, rlock = rx && list[0].locked && list[0].locked !== "loading";
      return '<section class="drawer' + (open ? " open" : "") + (rx ? " rx" : "") + (rlock ? " rlock" : "") + '" style="--g:' + gc[1] + "; --d:" + gi + '">' +
        '<button class="dr-head" data-g="' + esc(g) + '" aria-expanded="' + open + '"><span class="dr-handle" aria-hidden="true"></span><b>' + esc(g) + "</b>" + (rx ? '<em class="dr-lv">' + esc(rx.card) + (rlock ? " · locked" : "") + "</em>" : "<small>" + plural(list.length, "file") + "</small>") + '<i aria-hidden="true"></i></button>' +
        '<div class="dr-body"><div class="dr-files">' + list.map(function (d, n) {
          var c = cabCode(d, docs), h = hits && hits[d.id];
          return '<a class="fold' + (d.id === active ? " on" : "") + (h ? " hit" : "") + (d.locked ? " locked" : "") + '" data-id="' + esc(d.id) + '" href="#/docs/' + esc(d.id) + '" style="--k:' + n + "; --tx:" + ((n % 3) * 30) + 'px"><span class="f-tab">' + hl(c[0]) + '</span><span class="f-t">' + hl(c[1]) + "</span>" +
            (h && h.text ? '<span class="f-in">In text</span>' : "") + "</a>";
        }).join("") + "</div></div></section>";
    }).join("") || (hits ? '<div class="cab-none"><b>No match</b>No file in the Library matches every word of “' + esc(cabQ.trim()) + '”.<small>Guides, policies and procedures are searched in the Handbook.</small></div>' : "");
    cabRes = hits ? $$("#cabDrawers .fold").map(function (f) { return f.getAttribute("data-id"); }) : [];
    if (follow && hits && cabRes.indexOf(active) > -1) cabSel = cabRes.indexOf(active);
    if (cabSel >= cabRes.length) cabSel = 0;
    var cnt = $("#cabCount");
    if (cnt) cnt.innerHTML = hits ? '<span class="n">' + plural(total, "file") + '</span> match' + (cabIdx || cabMode !== "text" ? "" : '<span class="cab-wait"> · reading the text…</span>') + '<span class="cab-keys">↑↓ select · ↵ open · Esc clear</span>' : "";
    cabMark(false);
    $$(".fold").forEach(function (f) { f.addEventListener("click", function () { cabJump = true; cabHL = cabWords().length ? cabWords() : null; }); });
    /* Open and close in place, so only that drawer slides */
    $$(".dr-head").forEach(function (b) {
      b.addEventListener("click", function () {
        if (cabRes.length || cabWords().length) return;
        var s = b.parentNode, open = !s.classList.contains("open");
        /* Opening a drawer closes the others */
        if (open) $$("#cabDrawers .drawer.open").forEach(function (o) { o.classList.remove("open"); $(".dr-head", o).setAttribute("aria-expanded", "false"); });
        cabOpen = {}; if (open) cabOpen[b.getAttribute("data-g")] = true;
        s.classList.toggle("open", open); b.setAttribute("aria-expanded", String(open)); blip();
        if (open) { s.classList.add("opening"); setTimeout(function () { s.classList.remove("opening"); }, 1200); }
      });
    });
  }
  /* The clearance line above every document */
  function cabClr(ok, x, need) {
    return '<div class="clr ' + (ok ? "ok" : "no") + '" style="--hk:#8b9599"><i aria-hidden="true"></i><b>' + (ok ? "Open" : "Closed") + "</b><span>Public document</span></div>";
  }
  /* A document you may not open: a greyed-out draft behind an access-denied screen */
  function cabDenied(body, doc, c) {
    var x = doc.restricted, why = doc.locked, signed = typeof siIn === "function" && siIn();
    if (why === "loading") { body.innerHTML = cabClr(true, x).replace("Access granted", "Checking clearance") + loading("Checking your clearance with GitHub"); return; }
    if (why === "empty") { body.innerHTML = cabClr(true, x) + '<div class="empty">No documents here yet<small>' + esc(x.repo) + " is empty.</small></div>"; return; }
    var lines = ""; for (var n = 0; n < 14; n++) lines += '<span style="width:' + (55 + (n * 37) % 40) + '%"></span>';
    var msg = why === "level" ? "LV" + x.need + " clearance required." : why === "github" ? "Your card allows it, but GitHub has not given your account access yet." : "Could not reach GitHub to check your clearance.";
    body.innerHTML = cabClr(false, x, x.card) +
      '<div class="ds-tab"><b>' + esc(c[0]) + "</b>" + esc(doc.group) + '</div><div class="ds-folder denied"><div class="ds-page">' +
      '<header class="ds-head"><span>AFTERHAUL</span>' + cabStamp(x) + '<span class="ds-class">Restricted · ' + esc(x.card) + "</span></header>" +
      '<div class="ad-draft" aria-hidden="true"><b></b>' + lines + "</div>" +
      '<div class="ad" role="alert"><div class="ad-box"><small>Security</small><strong>Access denied</strong><em>' + esc(msg) + "</em>" +
        "<p>Please contact Administration.</p>" +
        '<div class="ad-act">' + (signed ? "" : '<a class="btn small primary" href="#/profile">Sign in</a>') +
        '<a class="btn small" href="#/guides/hp-gde-009">How clearance works</a><a class="btn small" href="#/team">Contact Administration</a></div></div></div>' +
      "</div></div>";
    body.classList.add("is-denied"); body.classList.remove("in"); void body.offsetWidth; body.classList.add("in");
    blip();
  }
  function openDossier(doc, docs) {
    var body = $("#docBody"), gc = cabGroup(doc.group), c = cabCode(doc, docs), k = cabClass(doc, c[0]);
    $$(".fold").forEach(function (f) { f.classList.toggle("on", f.getAttribute("data-id") === doc.id); });
    body.style.setProperty("--g", gc[1]); body.style.setProperty("--gd", gc[2]);
    body.className = "dossier k-" + k[0];
    body.setAttribute("data-id", doc.id);
    var x = doc.restricted;
    if (x && doc.locked) return cabDenied(body, doc, c);
    body.innerHTML = loading("Opening " + c[0]);
    var src = loadDoc(doc);
    src.then(function (md) {
      if (currentView !== "docs") return;
      var html = markdown(md.replace(/^# .*\n/, "").replace(/^Code: .*\n/, ""), doc.path);
      var url = location.href.split("#")[0] + "#/docs/" + doc.id;
      body.innerHTML = cabClr(true, x) +
        '<div class="ds-tab"><b>' + esc(c[0]) + "</b>" + esc(doc.group) + "</div>" +
        '<div class="ds-folder"><div class="ds-page">' +
          '<span class="ds-clip" aria-hidden="true"></span><span class="ds-holes" aria-hidden="true"></span>' +
          '<header class="ds-head"><span>AFTERHAUL</span>' + cabStamp(x) + '<span class="ds-class">Class: ' + esc(k[1]) + "</span></header>" + cabWarn(x) +
          '<h1 class="ds-title">' + esc(c[1]) + "</h1>" +
          '<div class="ds-meta"><span>' + esc(c[0]) + " · " + esc(doc.path) + "</span>" +
            (/^HP-/.test(c[0]) ? '<a href="#/guides/' + esc(doc.id) + '">Printable sheet</a>' : "") +
            '<button type="button" class="ds-link" data-url="' + esc(url) + '">Copy link</button></div>' +
          '<div class="sh-body ds-body">' + html + "</div>" +
          '<footer class="ds-foot"><span>' + esc(c[0]) + " · " + esc(k[1]) + " · " + esc(doc.path) + "</span><span>" + (x ? "Restricted to " + esc(x.card) + " and up. Do not copy it to public places." : "AFTERHAUL Wiki") + "</span></footer>" +
        "</div></div>";
      body.classList.remove("in"); void body.offsetWidth; body.classList.add("in");
      var cl = $(".ds-link", body);
      cl.addEventListener("click", function () {
        var u = cl.getAttribute("data-url");
        (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { cl.textContent = "Copied"; status("Link copied"); }, function () { cl.textContent = u; });
      });
      led($("#ledInfo"), doc.title);
      var first = cabHL ? cabHighlight($(".ds-body", body), cabHL) : null;
      cabHL = null;
      if (first && first.scrollIntoView) setTimeout(function () { first.scrollIntoView({ behavior: opts.motion ? "smooth" : "auto", block: "center" }); }, opts.motion ? 260 : 0);
      else if (cabJump && window.innerWidth <= 900 && body.scrollIntoView) body.scrollIntoView({ behavior: opts.motion ? "smooth" : "auto", block: "start" });
      cabJump = false;
    }, function (e) {
      if (currentView !== "docs") return;
      if (x) return cabDenied(body, Object.assign({}, doc, { locked: e && (e.status === 404 || e.status === 403) ? "github" : "offline" }), c);
      body.innerHTML = '<div class="empty">Could not open this document<small>Check your connection and try again.</small></div>';
    });
  }
  /* Marks every search word in the opened page and returns the first mark */
  function cabHighlight(root, words) {
    /* Only real words: a one- or two-letter word would light up half the page */
    words = (words || []).filter(function (w) { return w.length >= 3; });
    if (!root || !words.length) return null;
    var re = new RegExp("(" + words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + "[a-z]*)", "ig"), first = null, nodes = [];
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false), n;
    while ((n = walk.nextNode())) if (n.nodeValue.trim() && !/^(SCRIPT|STYLE|MARK)$/.test(n.parentNode.nodeName)) nodes.push(n);
    nodes.forEach(function (t) {
      re.lastIndex = 0;
      if (!re.test(t.nodeValue)) return;
      var frag = document.createDocumentFragment(), parts = t.nodeValue.split(re);
      parts.forEach(function (p, i) {
        if (!p) return;
        if (i % 2) { var m = document.createElement("mark"); m.className = "hl"; m.textContent = p; frag.appendChild(m); if (!first) first = m; }
        else frag.appendChild(document.createTextNode(p));
      });
      t.parentNode.replaceChild(frag, t);
    });
    return first;
  }
  /* The search index: plain text, headings and their positions, built once on the first search */
  function cabIndex(docs) {
    if (cabIdx) return Promise.resolve(cabIdx);
    if (cabIdxP) return cabIdxP;
    return (cabIdxP = Promise.all(docs.filter(function (d) { return d.group !== "Handbook" && !d.restricted; }).map(function (d) { return loadDoc(d).then(function (t) { return [d, t]; }, function () { return [d, ""]; }); })).then(function (all) {
      cabIdx = all.map(function (p) {
        var lines = p[1].split("\n"), heads = [], text = "", pos = [];
        lines.forEach(function (l) {
          var h = /^#{2,4}\s+(.*)$/.exec(l);
          var clean = l.replace(/^#+\s+/, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*`|>_]+/g, " ").replace(/\s+/g, " ").trim();
          if (h) heads.push({ at: text.length, t: clean });
          if (clean) { pos.push(text.length); text += clean + " "; }
        });
        return { d: p[0], text: text, low: text.toLowerCase(), heads: heads, hlow: heads.map(function (h) { return h.t.toLowerCase(); }).join(" ") };
      });
      return cabIdx;
    }));
  }
  /* The selected result: a ring around that folder */
  function cabMark(scroll) {
    $$("#cabDrawers .fold").forEach(function (f) {
      var on = cabRes.length && f.getAttribute("data-id") === cabRes[cabSel];
      f.classList.toggle("sel", !!on);
      if (on && scroll && f.scrollIntoView) f.scrollIntoView({ block: "nearest", behavior: opts.motion ? "smooth" : "auto" });
    });
  }
  function cabGo(id) {
    if (!id) return;
    cabHL = cabWords(); cabJump = true;
    var to = "#/docs/" + id;
    if (location.hash === to) { route(); return; }
    location.hash = to;
  }
  /* Ctrl+K or / jumps to the search on the Docs page */
  document.addEventListener("keydown", function (e) {
    if (currentView !== "docs") return;
    var tag = (e.target && e.target.tagName) || "", q = $("#cq");
    if (!q) return;
    if (((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) || (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag))) { e.preventDefault(); q.focus(); q.select(); }
  });

  /* Guides: the handbook (guides, policies, procedures) as A4 documents */
  /* The type stripe: a band 20% in from the right edge, in the type colour, with the type written along it */
  function typeStripe(type, n) { var w = "<b>" + esc(type) + "</b>", out = ""; for (var k = 0; k < n; k++) out += w; return '<span class="stripe" aria-hidden="true">' + out + "</span>"; }
  var GUIDE_AUD = ["All", "Players", "Makers", "Quality", "Owner"];
  var guideAud = "All";
  function viewGuides(id) {
    var v = $("#view");
    v.innerHTML = shell("Documentation", "Handbook", loading("Loading the handbook")); addZones("hb");
    Promise.all([loadLocal("guides"), loadLocal("docs")]).then(function (res) {
      if (currentView !== "guides") return;
      var list = (res[0] && res[0].guides) || [];
      if (id) return drawGuide(list, id);
      /* The Handbook always opens on its folders; Return to Handbook Library reopens the folder you came from */
      guideOpen = hbBack; hbBack = null;
      drawGuideList(list);
    });
  }
  /* Handbook filter: every word must appear (whole or in part) in the code, title, summary, type, audience, owner or text.
     A few everyday words also find their handbook terms, so "ban" finds suspensions and "linux" finds Proton. */
  var guideQ = "", guideMode = "name", guideIdx = null, guideIdxP = null;
  var GUIDE_RELATED = {
    login: ["sign-in", "sign in", "github", "keycard"], signin: ["sign-in", "github"], account: ["security", "two-factor", "github"],
    password: ["security", "two-factor", "passkey"], "2fa": ["two-factor"], hack: ["security", "incident"], leak: ["incident", "secret"],
    ban: ["suspension", "infraction", "moderation"], kick: ["moderation", "suspension"], punish: ["infraction", "suspension"], warn: ["infraction"],
    rule: ["policy", "conduct"], behaviour: ["conduct", "moderation"], behavior: ["conduct", "moderation"], toxic: ["conduct", "moderation"],
    linux: ["proton", "bazzite"], deck: ["proton"], bazzite: ["proton"], install: ["installing", "player guide"], play: ["player"],
    bug: ["report", "triage", "testing"], crash: ["report", "triage"], problem: ["report"], issue: ["report", "issue"],
    test: ["quality", "testing", "tester", "benchmark"], benchmark: ["tester", "lighthouse", "frame"], performance: ["benchmark", "lighthouse"], qa: ["quality"], pr: ["pull request", "review"], pull: ["pull request"], merge: ["review", "pull request"],
    code: ["contributor", "pull request"], contract: ["contract", "claim"], job: ["contract"], task: ["contract"],
    money: ["funding", "donation"], donate: ["funding", "donation"], pay: ["funding"],
    rank: ["grade"], level: ["grade", "keycard"], clearance: ["keycard"], boss: ["chain of command"], leader: ["chain of command", "lead"],
    join: ["onboarding", "contributor", "discord"], leave: ["offboarding"], quit: ["offboarding"], new: ["quick start", "basics"],
    chat: ["discord"], server: ["discord"], logo: ["brand"], art: ["brand", "media"], license: ["licensing"], copyright: ["licensing", "clean-room"],
    ai: ["ai", "agent"], bot: ["agent"], backup: ["backup", "restore"], version: ["release"], update: ["release"], website: ["website"], site: ["website"]
  };
  function guideWords() {
    return guideQ.trim().toLowerCase().split(/\s+/).filter(Boolean).map(function (w) {
      var stem = w.replace(/(ing|ed|es|s)$/, ""); if (stem.length < 3) stem = w;
      return [w, stem].concat(GUIDE_RELATED[w] || GUIDE_RELATED[stem] || []);
    });
  }
  function guideHay(g) { return [g.code, g.title, g.summary, g.type, g.audience, g.owner, guideIdx && guideMode === "text" ? guideIdx[g.id] || "" : ""].join(" ").toLowerCase(); }
  function guideMatch(g, words) {
    var h = guideHay(g);
    return words.every(function (alts) { return alts.some(function (a) { return h.indexOf(a) > -1 || (a.length > 3 && h.replace(/-/g, " ").indexOf(a) > -1); }); });
  }
  function guideIndex(list) {
    if (guideIdx) return Promise.resolve(guideIdx);
    return guideIdxP || (guideIdxP = Promise.all(list.map(function (g) { return loadDoc({ path: g.path }).then(function (t) { return [g.id, t]; }, function () { return [g.id, ""]; }); })).then(function (all) {
      guideIdx = {}; all.forEach(function (p) { guideIdx[p[0]] = p[1].replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*`#|>_]+/g, " ").replace(/\s+/g, " "); }); return guideIdx;
    }));
  }
  function drawGuideList(list) {
    $("#vb").innerHTML =
      '<p class="sub">Everything you need to play, make and test AFTERHAUL, written down. Every document is versioned, has an owner and prints on A4.</p>' +
      '<div class="hb-tools"><label class="cab-q hb-q"><span aria-hidden="true">⌕</span><input id="hq" type="search" placeholder="' + (guideMode === "text" ? "Filter by what the documents say" : "Filter by name: a word, part of one, or a topic") + '" aria-label="Filter the Handbook" aria-controls="hbList" autocomplete="off" spellcheck="false"><kbd>Ctrl K</kbd><i class="cab-scan" aria-hidden="true"></i></label>' + smSwitch("hb", guideMode) +
      '<div class="tabs" role="tablist">' + GUIDE_AUD.map(function (a) { return '<button role="tab" data-aud="' + a + '" aria-selected="' + (guideAud === a) + '">' + a + "</button>"; }).join("") + "</div></div>" +
      '<div class="cab-count" id="hbCount" aria-live="polite"></div><div class="hb-folders" id="hbFolders"></div><div id="hbList"></div>' ;
    var q = $("#hq");
    q.value = guideQ;
    function needText() { if (guideQ.trim() && !guideIdx && guideMode === "text") { $(".hb-q").classList.add("busy"); var at = guideQ; guideIndex(list).then(function () { var b = $(".hb-q"); if (b) b.classList.remove("busy"); if (currentView === "guides" && guideQ === at && $("#hbList")) drawGuideSheets(list); }); } }
    smWire("hb", function (m) { guideMode = m; q.placeholder = m === "text" ? "Filter by what the documents say" : "Filter by name: a word, part of one, or a topic"; drawGuideSheets(list); needText(); q.focus(); });
    q.addEventListener("input", function () {
      guideQ = q.value; drawGuideSheets(list);
      if (guideQ.trim() && !guideIdx && guideMode === "text") { $(".hb-q").classList.add("busy"); var at = guideQ; guideIndex(list).then(function () { var b = $(".hb-q"); if (b) b.classList.remove("busy"); if (currentView === "guides" && guideQ === at && $("#hbList")) drawGuideSheets(list); }); }
    });
    q.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && q.value) { e.preventDefault(); e.stopPropagation(); q.value = ""; guideQ = ""; drawGuideSheets(list); }
      else if (e.key === "Enter") { var a = $("#hbList .mini"); if (a) { e.preventDefault(); a.click(); } }
    });
    $$("[data-aud]").forEach(function (b) { b.addEventListener("click", function () { guideAud = b.dataset.aud; $$("[data-aud]").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); }); drawGuideSheets(list); }); });
    drawGuideSheets(list, true);
    if (guideQ.trim() && !guideIdx && guideMode === "text") guideIndex(list).then(function () { if (currentView === "guides" && $("#hbList")) drawGuideSheets(list); });
  }
  function drawGuideSheets(list, fly) {
    var words = guideWords(), filtering = !!words.length;
    var shown = list.filter(function (g) { return (guideAud === "All" || g.audience === guideAud) && (!filtering || guideMatch(g, words)); });
    var re = filtering ? new RegExp("(" + words.map(function (a) { return a[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")", "ig") : null;
    function hl(t) { return re ? esc(t).replace(re, "<mark>$1</mark>") : esc(t); }
    var byType = { Guide: [], Policy: [], Procedure: [] };
    shown.forEach(function (g) { (byType[g.type] = byType[g.type] || []).push(g); });
    /* Folders: one per type. The open folder lays its sheets out below; switching folders sends the sheets back in first */
    if (guideOpen ? !(byType[guideOpen] || []).length : filtering) { var first = HB_FOLDERS.filter(function (f) { return byType[f[0]].length; })[0]; if (first) guideOpen = first[0]; }
    var bar = $("#hbFolders");
    bar.innerHTML = HB_FOLDERS.map(function (f, k) {
      var n = byType[f[0]].length;
      return '<button type="button" class="hbf t-' + f[0].toLowerCase() + (f[0] === guideOpen ? " open" : "") + (n ? "" : " empty") + '" data-t="' + f[0] + '" style="--k:' + k + '" aria-expanded="' + (f[0] === guideOpen) + '"' + (n ? "" : " disabled") + '>' +
        '<span class="hbf-tab">' + esc(f[1]) + '</span><span class="hbf-body"><b>' + n + "</b><small>" + esc(f[2]) + '</small></span><span class="hbf-papers" aria-hidden="true"><i></i><i></i><i></i></span></button>';
    }).join("");
    $$("#hbFolders .hbf").forEach(function (b) { b.addEventListener("click", function () { var t = b.getAttribute("data-t"); if (t !== guideOpen) hbSwitch(list, t); }); });
    var l = byType[guideOpen] || [];
    $("#hbList").innerHTML = (l.length ? '<div class="sheets">' + l.map(function (g, n) {
        return '<a class="mini t-' + esc(g.type.toLowerCase()) + '" style="--i:' + n + '" href="#/guides/' + esc(g.id) + '"><span class="m-top"><b>' + hl(g.code) + "</b><i>v" + esc(g.version) + "</i></span>" +
          '<span class="m-title">' + hl(g.title) + '</span><span class="m-sum">' + hl(g.summary) + "</span>" +
          '<span class="m-foot">' + esc(g.owner) + "</span>" + typeStripe(g.type, 3) + "</a>";
      }).join("") + "</div>" : "") +
      (!guideOpen && shown.length ? '<p class="hb-pick">Select a folder to display content</p>' : "") +
      (shown.length ? "" : filtering ? '<div class="cab-none"><b>No match</b>No handbook document matches “' + esc(guideQ.trim()) + '”' + (guideAud !== "All" ? " for " + esc(guideAud) : "") + '.<small>Try fewer words, part of a word, or the All tab.</small></div>' : '<div class="empty">No documents for this audience yet</div>');
    if (fly) hbFly(true);
    $("#hbCount").innerHTML = filtering ? '<span class="n">' + plural(shown.length, "document") + "</span> match" + (guideIdx || guideMode !== "text" ? "" : '<span class="cab-wait"> · reading the text…</span>') + '<span class="cab-keys">↵ open the first · Esc clear</span>' : "";
    $("#hbList").classList.toggle("filtering", filtering);
    $$("#hbList .mini").forEach(function (a) { a.addEventListener("click", function (e) { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return; if (hbZoom(a)) e.preventDefault(); }); });
  }
  var HB_FOLDERS = [["Guide", "Guides", "How to build, play and work on AFTERHAUL"], ["Policy", "Policies", "Rules & Standards"], ["Procedure", "Procedures", "How AFTERHAUL handles the process"]];
  var guideOpen = null, hbBack = null, hbBusy = false;
  /* Sheets fly between the open folder and the grid (Web Animations; without it, they simply appear) */
  function hbFly(out, done) {
    var f = $("#hbFolders .hbf.open"), sheets = $$("#hbList .mini");
    if (!f || !sheets.length || !opts.motion || !sheets[0].animate) { if (done) done(); return; }
    var fr = f.getBoundingClientRect(), fx = fr.left + fr.width / 2, fy = fr.top + fr.height / 2, left = sheets.length;
    sheets.forEach(function (m, i) {
      var r = m.getBoundingClientRect(), dx = fx - (r.left + r.width / 2), dy = fy - (r.top + r.height / 2);
      var away = { transform: "translate(" + dx + "px," + dy + "px) scale(.18) rotate(" + (i % 2 ? 8 : -8) + "deg)", opacity: 0 }, home = { transform: "none", opacity: 1 };
      var a = m.animate(out ? [away, home] : [home, away], { duration: out ? 520 : 320, delay: out ? i * 40 : (sheets.length - 1 - i) * 22, easing: out ? "cubic-bezier(.2,.8,.2,1)" : "cubic-bezier(.5,0,.8,.4)", fill: "both" });
      a.onfinish = function () { if (out) a.cancel(); if (--left === 0 && done) done(); };
    });
  }
  /* Opening a sheet takes 1 second in all, swift but smooth: the others and the Handbook controls fade while the chosen sheet glides to the middle
     and, in the same motion, zooms up into the reading view, which grows in from the same spot. */
  var hbZoomIn = false;
  function hbZoom(a) {
    if (!opts.motion || !a.animate || hbBusy) return false;
    hbBusy = true; if (typeof hbpHide === "function") hbpHide(true);
    var href = a.getAttribute("href"), fade = { duration: 320, fill: "forwards", easing: "cubic-bezier(.4,0,.2,1)" };
    $$("#hbList .mini").forEach(function (m) { if (m !== a) m.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(.96)" }], fade); });
    [".zones", ".hb-tools", "#hbCount", "#hbFolders", "#vb > p.sub", ".vh"].forEach(function (sel) { $$(sel).forEach(function (el) { el.animate([{ opacity: 1 }, { opacity: 0 }], fade); }); });
    var r = a.getBoundingClientRect(), dx = window.innerWidth / 2 - (r.left + r.width / 2), dy = window.innerHeight / 2 - (r.top + r.height / 2);
    a.style.position = "relative"; a.style.zIndex = 5;
    var mid = "translate(" + dx + "px," + dy + "px) scale(1.3)";
    /* One continuous move: glide to the middle, then straight on into the zoom (no pause) */
    var z = a.animate([
      { transform: "none", opacity: 1, easing: "cubic-bezier(.33,0,.2,1)" },
      { offset: 0.55, transform: mid, opacity: 1, easing: "cubic-bezier(.55,0,.7,.4)" },
      { transform: "translate(" + dx + "px," + dy + "px) scale(3.2)", opacity: 0 }
    ], { duration: 650, fill: "forwards" });
    z.onfinish = function () { hbZoomIn = true; hbBusy = false; location.hash = href; };
    blip();
    return true;
  }
  function hbAim() {
    var run = function () { var ce = $("#center"), vh = $(".vh"); if (!ce || !vh) return; ce.style.scrollBehavior = "auto"; ce.scrollTop += vh.getBoundingClientRect().top - ce.getBoundingClientRect().top; ce.style.scrollBehavior = ""; };
    run(); if (window.requestAnimationFrame) requestAnimationFrame(run);
  }
  function hbSwitch(list, t) {
    if (hbBusy) return; hbBusy = true; blip();
    hbFly(false, function () { guideOpen = t; drawGuideSheets(list, true); hbBusy = false; });
  }
  /* Ctrl+K or / jumps to the Handbook filter */
  document.addEventListener("keydown", function (e) {
    if (currentView !== "guides") return;
    var tag = (e.target && e.target.tagName) || "", q = $("#hq");
    if (!q) return;
    if (((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) || (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag))) { e.preventDefault(); q.focus(); q.select(); }
  });
  function drawGuide(list, id) {
    var g = list.filter(function (x) { return x.id === id; })[0];
    if (!g) { $("#vb").innerHTML = '<div class="empty">No document ' + esc(id) + '<small><a href="#/guides">Back to the handbook</a></small></div>'; return; }
    $("#vb").innerHTML = loading("Opening " + g.code);
    loadDoc({ path: g.path }).then(function (src) {
      if (currentView !== "guides") return;
      // The sheet header carries the title and metadata, so drop them from the body
      var body = src.replace(/^# .*\n/, "").replace(/^Code: .*\n/, "");
      var html = markdown(body, g.path).replace(/href="#\/docs\/(hp-(?:pol|sop|gde)-\d{3})"/g, 'href="#/guides/$1"');
      var url = location.href.split("#")[0] + "#/guides/" + g.id;
      $("#vb").innerHTML =
        cabClr(true, null).replace('class="clr ok"', 'class="clr ok hb-clr"') +
        '<div class="toolbar sheet-bar"><button class="btn small sb-print" id="gprint">Print</button>' +
        '<a class="btn small sb-back" href="#/guides"><span aria-hidden="true">◂</span> Return to Handbook Library</a></div>' +
        '<article class="sheet t-' + esc(g.type.toLowerCase()) + '" aria-label="' + esc(g.code + " " + g.title) + '">' +
          typeStripe(g.type, 6) +
          '<header class="sh-head"><div class="sh-org"><img src="assets/img/afterhaul-mark.svg" alt="" width="34" height="34"><span><b>AFTERHAUL</b><i>Hound Protocol Handbook</i></span></div>' +
          '<div class="sh-code"><b>' + esc(g.code) + "</b><i>" + esc(g.type) + "</i></div></header>" +
          '<h1 class="sh-title">' + esc(g.title) + "</h1>" +
          '<dl class="sh-meta"><div><dt>Version</dt><dd>' + esc(g.version) + "</dd></div><div><dt>Effective</dt><dd>" + esc(g.effective) + "</dd></div>" +
          "<div><dt>Owner</dt><dd>" + esc(g.owner) + "</dd></div><div><dt>For</dt><dd>" + esc(g.for) + "</dd></div><div><dt>Classification</dt><dd>Public</dd></div></dl>" +
          '<div class="sh-body">' + html + "</div>" +
          '<footer class="sh-foot"><span>' + esc(g.code) + " · v" + esc(g.version) + " · " + esc(g.effective) + '</span><span>Uncontrolled when printed. Current version: ' + esc(url) + "</span></footer>" +
        "</article>";
      $("#gprint").addEventListener("click", function () { printSheet(); });
      $(".sb-back").addEventListener("click", function () { hbBack = g.type; });
      /* Opening a sheet puts the "Documentation · Handbook" heading on the top line of the page (the camera moves; the layout does not) */
      hbAim();
      if (hbZoomIn) {
        hbZoomIn = false;
        var sh = $("#vb .sheet"), bar = $("#vb .sheet-bar");
        if (sh && sh.animate) sh.animate([{ transform: "scale(.55)", opacity: 0, filter: "blur(3px)" }, { transform: "none", opacity: 1, filter: "none" }], { duration: 350, easing: "cubic-bezier(.16,1,.3,1)" });
        if (bar && bar.animate) bar.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: 100, fill: "backwards" });
      }
      /* Opened from a Documentation search: mark the words and scroll to the first */
      if (cabHL) { var hit = cabHighlight($(".sh-body"), cabHL); cabHL = null; if (hit && hit.scrollIntoView) setTimeout(function () { hit.scrollIntoView({ behavior: opts.motion ? "smooth" : "auto", block: "center" }); }, opts.motion ? 260 : 0); }
      // The PDF exists on the deployed site (built by tools/guides_pdf.py); show the button only when it is there
      document.title = g.code + " " + g.title + " · " + cfg.project;
    }, function () {
      $("#vb").innerHTML = '<div class="empty">Could not load ' + esc(g.code) + '<small><a href="#/guides">Back to the handbook</a></small></div>';
    });
  }

  // Print with a fallback: some browsers (for example Flatpak browsers without a print portal) never open the dialog
  function printSheet() {
    var opened = false;
    function mark() { opened = true; }
    window.addEventListener("beforeprint", mark);
    try { window.focus(); window.print(); } catch (e) { /* handled below */ }
    setTimeout(function () {
      window.removeEventListener("beforeprint", mark);
      if (opened) return;
      var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");
      status("No print dialog? Press " + (mac ? "Cmd+P" : "Ctrl+P") + ($("#gpdf") && !$("#gpdf").hidden ? ", or use Download PDF" : ""), true);
    }, 600);
  }

  /* ---------------- Handbook previews ----------------
     Hovering or focusing any button that links to a Handbook document shows a small preview of that sheet, as wide
     as the button: its code, type, title and summary. The Handbook is the source of truth, so buttons point there. */
  var hbpT = null, HBP_SEL = 'a.btn[href^="#/' + 'guides/hp-"], a.hb-link';
  function hbpFor(el) {
    var m = /#\/guides\/(hp-(?:gde|pol|sop)-\d{3})/.exec(el.getAttribute("href") || "");
    var list = (data.guides && data.guides.guides) || [];
    return m && list.filter(function (g) { return g.id === m[1]; })[0];
  }
  function hbpShow(el) {
    var g = hbpFor(el); if (!g) return;
    hbpHide(true);
    var r = el.getBoundingClientRect(), w = Math.max(r.width, 200);
    document.body.insertAdjacentHTML("beforeend", '<div class="hbp t-' + esc(g.type.toLowerCase()) + '" id="hbp" role="tooltip"><span class="hbp-top"><b>' + esc(g.code) + "</b><i>" + esc(g.type) + " · v" + esc(g.version) + '</i></span><span class="hbp-t">' + esc(g.title) + '</span><span class="hbp-s">' + esc(g.summary) + '</span><span class="hbp-go">Open in the Handbook →</span></div>');
    var p = $("#hbp"), left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8), below = r.bottom + 10 + 170 < window.innerHeight;
    p.style.width = w + "px"; p.style.left = left + "px";
    if (below) p.style.top = (r.bottom + 8) + "px"; else { p.style.top = (r.top - 8) + "px"; p.classList.add("up"); }
  }
  function hbpHide(now) { clearTimeout(hbpT); var p = $("#hbp"); if (!p) return; if (now || !opts.motion) { p.remove(); return; } p.classList.add("out"); setTimeout(function () { if (p.parentNode) p.remove(); }, 160); }
  function hbpTarget(e) { var t = e.target && e.target.closest ? e.target.closest(HBP_SEL) : null; return t && hbpFor(t) ? t : null; }
  document.addEventListener("mouseover", function (e) { var t = hbpTarget(e); if (!t) return; clearTimeout(hbpT); hbpT = setTimeout(function () { hbpShow(t); }, 180); });
  document.addEventListener("mouseout", function (e) { if (hbpTarget(e)) { clearTimeout(hbpT); hbpHide(); } });
  document.addEventListener("focusin", function (e) { var t = hbpTarget(e); if (t) hbpShow(t); });
  document.addEventListener("focusout", function (e) { if (hbpTarget(e)) hbpHide(); });
  window.addEventListener("hashchange", function () { hbpHide(true); });
  document.addEventListener("scroll", function () { hbpHide(true); }, true);

  /* ---------------- Router ---------------- */
  var VIEWS = { docs: viewDocs, guides: viewGuides };
  var goTimer;
  function flash() {
    var st = $("#stage");
    st.classList.remove("going"); void st.offsetWidth; st.classList.add("going");
    clearTimeout(goTimer); goTimer = setTimeout(function () { st.classList.remove("going"); }, 450);
  }
  /* Light background glitch at a random interval of 5 to 20 seconds */
  function scheduleGlitch() {
    setTimeout(function () {
      var st = $("#stage");
      if (opts.glitch && opts.motion && !document.hidden && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        $$(".gl i").forEach(function (b) { b.style.setProperty("--y", (Math.random() * 90 + 5).toFixed(1) + "%"); b.style.setProperty("--h", (Math.random() * 10 + 2).toFixed(0) + "px"); });
        st.style.setProperty("--d", (0.16 + Math.random() * 0.12).toFixed(2) + "s");
        st.classList.add("glitch");
        setTimeout(function () { st.classList.remove("glitch"); }, 320);
      }
      scheduleGlitch();
    }, 5000 + Math.random() * 15000);
  }
  var booted = false;
  function route() {
    if (booted) flash();
    booted = true;
    var parts = (location.hash || "").replace(/^#\/?/, "").split("/"), name = parts[0];
    if (!VIEWS[name]) { location.replace("#/docs"); return; }
    var view = $("#view"), same = currentView === name;
    currentView = name;
    view.hidden = false; view.dataset.v = name;
    if (!same || name !== "docs") { view.innerHTML = ""; var ce = $("#center"); ce.style.scrollBehavior = "auto"; ce.scrollTop = 0; ce.style.scrollBehavior = ""; }
    var title = name === "guides" ? "Handbook" : "Library";
    led($("#ledInfo"), "AFTERHAUL Wiki · " + title);
    document.title = title + " · " + cfg.project + " Wiki";
    VIEWS[name](parts[1]);
    if (!same) {
      var h2 = $("#view .vh h2"); if (h2 && document.activeElement !== h2 && !$("#hpModal")) { h2.setAttribute("tabindex", "-1"); try { h2.focus({ preventScroll: true }); } catch (e) { h2.focus(); } }
      readyView();
    }
  }

  /* ---------------- Ready, then reveal ----------------
     A page stays hidden behind a thin loading line until its content is in place: the loading placeholder has been
     replaced, web fonts are ready and the images inside have loaded (or 2.5 s have passed). Then it fades in at once,
     so nothing pops in piece by piece. The first screen after a cold start is revealed the same way. */
  var readyObs = null, readyTimer = 0;
  function waitAssets(root) {
    var imgs = Array.prototype.slice.call(root.querySelectorAll("img")).filter(function (i) { return !i.complete && i.loading !== "lazy"; });
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var all = Promise.all([fonts].concat(imgs.map(function (i) { return new Promise(function (ok) { i.addEventListener("load", ok); i.addEventListener("error", ok); }); })));
    return Promise.race([all, new Promise(function (ok) { setTimeout(ok, 2500); })]);
  }
  function readyView() {
    var view = $("#view");
    if (!view) return;
    if (readyObs) { readyObs.disconnect(); readyObs = null; }
    clearTimeout(readyTimer);
    view.classList.remove("vw-ready"); view.classList.add("vw-wait");
    var done = false, waiting = false;
    function reveal() {
      if (done) return; done = true;
      if (readyObs) { readyObs.disconnect(); readyObs = null; }
      clearTimeout(readyTimer);
      requestAnimationFrame(function () { view.classList.remove("vw-wait"); view.classList.add("vw-ready"); bootDone(); });
    }
    function check() {
      if (done || waiting) return;
      var vb = $("#vb");
      if (!vb || !vb.children.length || $(".spin", vb)) return;
      waiting = true;
      waitAssets(vb).then(reveal);
    }
    if (window.MutationObserver) { readyObs = new MutationObserver(check); readyObs.observe(view, { childList: true, subtree: true }); }
    readyTimer = setTimeout(reveal, 4000);
    check();
  }
  /* The whole interface fades in once, after the config, the first screen and the fonts are ready */
  var booting = true;
  function bootDone() {
    if (!booting) return;
    booting = false;
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise(function (ok) { setTimeout(ok, 1500); })]).then(function () {
      requestAnimationFrame(function () { document.documentElement.classList.remove("booting"); });
    });
  }

  /* ---------------- Keyboard ---------------- */
  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    if ($("#hpModal")) return;
    if (e.key === "Escape") {
      if (/INPUT|SELECT|TEXTAREA/.test(tag) && e.target.value) return;
      if (currentView && location.hash !== "#/docs") { location.hash = "#/docs"; e.preventDefault(); }
    }
  });

  /* ---------------- Boot ---------------- */
  applyOpts();
  scheduleGlitch();
  led($("#build"), "");
  $("#build").textContent = "AFTERHAUL Wiki";
  Promise.all([loadLocal("docs"), loadLocal("guides")]).then(function () { route(); });
  route();
  window.addEventListener("hashchange", route);
})();
