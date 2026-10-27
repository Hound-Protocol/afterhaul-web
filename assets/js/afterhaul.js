/* AFTERHAUL website. Plain JavaScript, no build step, no libraries.
   Scrolling is driving: the road moves with your scroll, the rev needle and odometer follow it, and the cold-start key
   brings the engine up. Each region card has its own weather. Reduced motion keeps everything still. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  root.className = root.className.replace("no-js", "js");
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  var E = { state: "off", rpm: 0 };            // engine
  var S = { y: 0, dy: 0, strain: 0, road: 0, progress: 0, docH: 1, vh: 1 }; // scroll
  var body = doc.body;

  /* ---------- Ridges (hero): four layers drawn in code, with parallax ---------- */
  var ridgeBox = $("#ridges"), layers = [];
  (function () {
    if (!ridgeBox) return;
    var cfg = [
      { h: 64, c: "#3a2a17", amp: 90, seed: 11, k: 0.04 }, { h: 54, c: "#2a1f13", amp: 80, seed: 23, k: 0.07 },
      { h: 42, c: "#1d160e", amp: 70, seed: 37, k: 0.1 }, { h: 30, c: "#130f0a", amp: 56, seed: 51, k: 0.14 }
    ];
    cfg.forEach(function (l) {
      var r = rng(l.seed), d = "M0 400 L0 " + (200 + r() * 40), x;
      for (x = 40; x <= 1600; x += 40) d += " L" + x + " " + (260 - l.amp * (0.5 + 0.5 * Math.sin(x * 0.004 + l.seed) ) - r() * l.amp * 0.55);
      d += " L1600 400 Z";
      var s = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
      s.setAttribute("viewBox", "0 0 1600 400"); s.setAttribute("preserveAspectRatio", "none"); s.style.height = l.h + "%";
      s.innerHTML = '<path d="' + d + '" fill="' + l.c + '"/>';
      ridgeBox.appendChild(s); layers.push({ el: s, k: l.k });
    });
  })();

  /* ---------- Hero road and dust (canvas) ---------- */
  var road = $("#road"), rctx = road && road.getContext("2d"), rw = 0, rh = 0, heroOn = true, motes = [];
  function sizeRoad() {
    if (!road) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), b = road.getBoundingClientRect();
    rw = b.width; rh = b.height; road.width = Math.round(rw * dpr); road.height = Math.round(rh * dpr); rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var r = rng(5); motes = [];
    for (var i = 0; i < 70; i++) motes.push({ x: r() * rw, y: r() * rh, s: 0.6 + r() * 1.8, vx: 0.15 + r() * 0.5, vy: -0.05 + r() * 0.2, a: 0.1 + r() * 0.3 });
  }
  function drawRoad(t) {
    rctx.clearRect(0, 0, rw, rh);
    var vx = rw * 0.72, vy = rh * 0.6, bl = rw * 0.1, br = rw * 1.08;
    rctx.fillStyle = "#15100a"; rctx.beginPath(); rctx.moveTo(vx - 5, vy); rctx.lineTo(vx + 5, vy); rctx.lineTo(br, rh); rctx.lineTo(bl, rh); rctx.closePath(); rctx.fill();
    rctx.strokeStyle = "rgba(200,183,150,.16)"; rctx.lineWidth = 2;
    rctx.beginPath(); rctx.moveTo(vx - 5, vy); rctx.lineTo(bl, rh); rctx.moveTo(vx + 5, vy); rctx.lineTo(br, rh); rctx.stroke();
    var cx = rw * 0.59, n = 14, i, p, q;
    for (i = 0; i < n; i++) {
      p = ((i + S.road) % n) / n; q = Math.min(1, p + 0.03);
      var y1 = vy + (rh - vy) * p * p, y2 = vy + (rh - vy) * q * q, x1 = vx + (cx - vx) * p * p, x2 = vx + (cx - vx) * q * q;
      rctx.strokeStyle = "rgba(240,162,2," + (0.12 + 0.5 * p) + ")"; rctx.lineWidth = 1 + 9 * p * p;
      rctx.beginPath(); rctx.moveTo(x1, y1); rctx.lineTo(x2, y2); rctx.stroke();
    }
    if (E.state !== "off") { // headlights
      var flick = 0.85 + 0.15 * Math.sin(t * 0.04) * (E.state === "crank" ? 1 : 0.2), g;
      rctx.globalCompositeOperation = "lighter";
      [0.42, 0.62].forEach(function (fx) {
        g = rctx.createRadialGradient(rw * fx, rh * 0.98, 0, rw * fx, rh * 0.98, rw * 0.55);
        g.addColorStop(0, "rgba(255,196,96," + (0.2 * flick) + ")"); g.addColorStop(1, "rgba(255,196,96,0)");
        rctx.fillStyle = g; rctx.fillRect(0, 0, rw, rh);
      });
      rctx.globalCompositeOperation = "source-over";
    }
    var spd = 1 + S.strain * 6;
    for (i = 0; i < motes.length; i++) {
      var m = motes[i];
      if (!reduce) { m.x += m.vx * spd; m.y += m.vy * spd; if (m.x > rw + 4) { m.x = -4; m.y = Math.random() * rh; } if (m.y < -4) m.y = rh + 4; if (m.y > rh + 4) m.y = -4; }
      rctx.fillStyle = "rgba(240,200,140," + m.a + ")"; rctx.beginPath(); rctx.arc(m.x, m.y, m.s, 0, 6.283); rctx.fill();
    }
  }

  /* ---------- Instrument cluster ---------- */
  var odo = $("#odo"), needle = $("#needle"), eng = $("#eng"), rail = $("#rail"), railDot = $("#railDot"), hero = $(".hero"), heroIn = $("#heroIn");
  (function ticks() {
    var g = $("#ticks"); if (!g) return;
    for (var i = 0; i <= 10; i++) {
      var a = Math.PI * (1 - i / 10), x1 = 60 + Math.cos(a) * 41, y1 = 64 - Math.sin(a) * 41, x2 = 60 + Math.cos(a) * 46, y2 = 64 - Math.sin(a) * 46;
      var l = doc.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", x1.toFixed(1)); l.setAttribute("y1", y1.toFixed(1)); l.setAttribute("x2", x2.toFixed(1)); l.setAttribute("y2", y2.toFixed(1));
      if (i >= 9) l.setAttribute("class", "hot"); g.appendChild(l);
    }
  })();
  function measure() { S.vh = window.innerHeight; S.docH = Math.max(1, doc.documentElement.scrollHeight - S.vh); sizeRoad(); }

  /* ---------- Reveal on scroll ---------- */
  var seatsOn = false;
  function reveal(el) {
    el.classList.add("in");
    if (el.id === "convoy" && !seatsOn) { seatsOn = true; $$(".seat", el).forEach(function (s, i) { setTimeout(function () { s.classList.add("on"); }, reduce ? 0 : 160 * i); }); }
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }); }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else $$(".rv").forEach(reveal);

  /* ---------- Crew seats ---------- */
  (function () {
    var box = $("#convoy"); if (!box) return;
    for (var i = 0; i < 8; i++) {
      var s = doc.createElement("div"); s.className = "seat";
      s.innerHTML = '<svg viewBox="0 0 40 40"><circle cx="20" cy="13" r="7"/><path d="M6 38c0-10 6-15 14-15s14 5 14 15z"/></svg>'; box.appendChild(s);
    }
  })();

  /* ---------- Regions: silhouettes and weather ---------- */
  var SIL = {
    city: ["#0d0c0a", function (r) { var d = "M0 300 L0 220", x = 0; while (x < 400) { var w = 22 + r() * 30, h = 90 + r() * 120; d += " L" + x + " " + (300 - h) + " L" + (x + w) + " " + (300 - h) + (r() < 0.4 ? " L" + (x + w) + " " + (300 - h * 0.7) : ""); x += w; } return d + " L400 300 Z"; }],
    timber: ["#0a120c", function (r) { var d = "M0 300 L0 240", x = 0; while (x < 410) { var w = 18 + r() * 14, h = 70 + r() * 90; d += " L" + x + " 250 L" + (x + w / 2) + " " + (300 - h) + " L" + (x + w) + " 250"; x += w * 0.75; } return d + " L400 300 Z"; }],
    wild: ["#0d1210", function (r) { var d = "M0 300 L0 220"; for (var x = 0; x <= 400; x += 20) d += " L" + x + " " + (205 + Math.sin(x * 0.02) * 22 + r() * 14); return d + " L400 300 Z"; }],
    front: ["#0b0605", function (r) { var d = "M0 300 L0 230", x = 0; while (x < 400) { var w = 14 + r() * 26, h = 40 + r() * 140; d += " L" + x + " " + (300 - h) + " L" + (x + w * 0.5) + " " + (300 - h * (0.55 + r() * 0.4)) + " L" + (x + w) + " " + (300 - h * 0.5); x += w; } return d + " L400 300 Z"; }],
    desert: ["#5a3b16", function (r) { var d = "M0 300 L0 230"; for (var x = 0; x <= 400; x += 10) d += " L" + x + " " + (222 + Math.sin(x * 0.018 + 1) * 28 + Math.sin(x * 0.05) * 6); return d + " L400 300 Z"; }],
    cold: ["#3a4a51", function (r) { var d = "M0 300 L0 240", x = 0; while (x < 410) { var w = 50 + r() * 60, h = 90 + r() * 120; d += " L" + (x + w / 2) + " " + (300 - h) + " L" + (x + w) + " 250"; x += w * 0.85; } return d + " L400 300 Z"; }]
  };
  var weather = [];
  function Weather(el) {
    var type = el.getAttribute("data-w"), c = $("canvas", el), ctx = c.getContext("2d"), sil = $(".sil", el), r = rng(type.length * 977 + type.charCodeAt(0)), parts = [], w = 0, h = 0, gust = 0, gustT = 0, vis = false;
    var cfg = { city: 0, timber: 34, wild: 190, front: 26, desert: 70, cold: 170 }[type];
    (function () { var s = SIL[type], rr = rng(type.charCodeAt(0) * 31); sil.setAttribute("viewBox", "0 0 400 300");
      if (type === "timber" || type === "cold" || type === "city") { sil.innerHTML = ""; return; }
      sil.innerHTML = '<path d="' + s[1](rr) + '" fill="' + s[0] + '" opacity=".55" transform="translate(0,-26)"/><path d="' + s[1](rng(type.charCodeAt(1) * 17)) + '" fill="' + s[0] + '"/>'; })();
    function spawn(p, init) {
      p.x = r() * w; p.y = init ? r() * h : (type === "front" ? h + 6 : -8); p.s = 1 + r() * 2.2; p.ph = r() * 6.28; p.a = 0.25 + r() * 0.5; p.k = 0.5 + r() * 1;
      if (type === "wild" && !init) { p.x = w + 10; p.y = r() * h; }
      if (type === "desert") { p.x = init ? r() * w : -10; p.y = h * (0.3 + r() * 0.65); }
      return p;
    }
    function size() { var dpr = Math.min(window.devicePixelRatio || 1, 2); w = el.clientWidth; h = el.clientHeight; c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); trees = null; parts = []; for (var i = 0; i < cfg; i++) parts.push(spawn({}, true)); }
    var now = 0, nextShell = 1200, mud = [], cols = [], trees = null, shells = [], blasts = [], clods = [], smoke = [], tracers = [], flash = 0;
    function mkTrees() { trees = []; var rr = rng(99), L, n, i; for (L = 0; L < 2; L++) { n = Math.ceil(w / (L ? 38 : 30)); for (i = 0; i < n; i++) trees.push({ L: L, x: (i + rr() * 0.8) * (w / n), hh: (L ? 120 : 90) + rr() * 80, ww: (L ? 34 : 26) + rr() * 16, ph: rr() * 6.28 }); } trees.sort(function (a, b) { return a.L - b.L; }); }
    function drawTrees(t) {
      if (!trees) mkTrees();
      var wind = 1 + gust * 1.6, base = h * 0.9, i, k, tr, sw, tx, ty, y0, tier;
      for (i = 0; i < trees.length; i++) {
        tr = trees[i]; ctx.fillStyle = tr.L ? "#0a120c" : "#122017";
        sw = reduce ? 0 : (Math.sin(t * 0.0012 * wind + tr.ph + tr.x * 0.012) * 0.07 + Math.sin(t * 0.0031 + tr.ph) * 0.02 + 0.05 * wind) * tr.hh;
        tx = tr.x + sw; ty = base - tr.hh + (tr.L ? 0 : -10);
        y0 = base + (tr.L ? 0 : -10);
        for (tier = 0; tier < 3; tier++) {
          var f0 = tier / 3, f1 = (tier + 1.35) / 3, yt = ty + (y0 - ty) * f0, yb = ty + (y0 - ty) * Math.min(1, f1), wd = tr.ww * (0.35 + 0.65 * f1) / 2;
          var bx = tr.x + sw * (1 - f0) * 0.4, tipx = tr.x + sw * (1 - f0) * 1.0;
          ctx.beginPath(); ctx.moveTo(tipx + (tx - tr.x) * 0, yt); ctx.lineTo(tr.x + sw * (1 - Math.min(1, f1)) + wd, yb); ctx.lineTo(tr.x + sw * (1 - Math.min(1, f1)) - wd, yb); ctx.closePath(); ctx.fill();
        }
        ctx.fillRect(tr.x - 2, y0 - 6, 4, h - y0 + 6);
      }
      ctx.fillStyle = "#0a120c"; ctx.fillRect(0, base - 2, w, h - base + 2);
      ctx.strokeStyle = "rgba(220,235,210,.10)"; ctx.lineWidth = 1;
      for (k = 0; k < 7; k++) { var yy = (k * 47 + t * 0.05 * wind * (1 + k % 3 * 0.3)) % (h * 0.8), xx = (t * 0.35 * wind * (1 + k * 0.2) + k * 133) % (w + 120) - 60; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 40 + k * 5, yy + 3); ctx.stroke(); }
    }
    function boom(x, y) {
      var i;
      var vmax = 3.2, v, k; flash = 0.6;
      for (i = 0; i < 170; i++) { v = 0.5 + vmax * Math.pow(r(), 1.7); k = v / vmax; mud.push({ x: x + (r() - 0.5) * 7, y: y, vx: (r() - 0.5) * 0.45 * (0.35 + k), vy: -v, s: (6.5 * (1 - 0.82 * k) + 1) * (0.7 + 0.6 * r()), d: r() * 24, gy: y + r() * 5, k: k }); }
      blasts.push({ x: x, y: y, a: 0 });
      for (i = 0; i < 48; i++) clods.push({ x: x + (r() - 0.5) * 10, y: y, vx: (r() - 0.5) * 7, vy: -(3 + r() * 8), s: 1.5 + r() * 4.5, rot: 0 });
      for (i = 0; i < 5; i++) smoke.push({ x: x + (r() - 0.5) * 30, y: y - r() * 6, vx: (r() - 0.5) * 0.6, vy: -0.25 - r() * 0.3, s: 9 + r() * 10, a: 0.4 });
    }
    function drawCols() {
      var i, p, a;
      for (i = mud.length - 1; i >= 0; i--) {
        p = mud[i];
        if (p.d > 0) { p.d--; continue; }
        p.x += p.vx; p.y += p.vy; p.vy += 0.021; p.vx *= 0.998;
        if (p.vy > 0 && p.y >= p.gy) { mud.splice(i, 1); continue; }
        a = p.vy > 0 ? Math.min(1, (p.gy - p.y) / 40 + 0.35) : 1;
        ctx.globalAlpha = a; ctx.fillStyle = "#5a3d26"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
        if (p.k < 0.6) { ctx.fillStyle = "rgba(255,150,60," + (0.3 * (1 - p.k)) + ")"; ctx.beginPath(); ctx.arc(p.x - p.s * 0.3, p.y, p.s * 0.5, 0, 6.283); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }
    var lastShot = -9999;
    function tank(x, y, s, dir, t, mv) {
      var bob = mv ? Math.sin(t * 0.02 + x * 0.05) * 0.5 * s : 0, yy = y + bob;
      ctx.fillStyle = "#1c110c";
      ctx.fillRect(x - 21 * s, yy - 5 * s, 42 * s, 6 * s);
      ctx.beginPath(); ctx.moveTo(x - 18 * s, yy - 5 * s); ctx.lineTo(x + 18 * s, yy - 5 * s); ctx.lineTo(x + 14 * s, yy - 11 * s); ctx.lineTo(x - 14 * s, yy - 11 * s); ctx.closePath(); ctx.fill();
      ctx.fillRect(x - 8 * s, yy - 17 * s, 16 * s, 7 * s);
      ctx.fillRect(dir > 0 ? x + 6 * s : x - 26 * s, yy - 15 * s, 20 * s, 2.2 * s);
      ctx.strokeStyle = "rgba(255,140,60,.28)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 14 * s, yy - 11 * s); ctx.lineTo(x + 14 * s, yy - 11 * s); ctx.moveTo(x - 8 * s, yy - 17 * s); ctx.lineTo(x + 8 * s, yy - 17 * s); ctx.stroke();
    }
    function soldier(x, y, s, dir) {
      ctx.fillStyle = "#1c110c";
      ctx.fillRect(x - 5 * s, y - 4 * s, 11 * s, 4 * s);
      ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 4 * s); ctx.lineTo(x + 2 * s * dir, y - 12 * s); ctx.lineTo(x + 5 * s * dir, y - 12 * s); ctx.lineTo(x + 4 * s, y - 4 * s); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 4 * s * dir, y - 15 * s, 2.6 * s, 0, 6.283); ctx.fill();
      ctx.fillRect(dir > 0 ? x + 2 * s : x - 12 * s, y - 10 * s, 10 * s, 1.3 * s);
      ctx.strokeStyle = "rgba(255,140,60,.25)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + 4 * s * dir, y - 15 * s, 2.6 * s, 3.6, 5.6); ctx.stroke();
    }
    function drawWar(t) {
      var yb = h * 0.6, i, tx, g, soldiersAt = [0.14, 0.2, 0.43, 0.49, 0.58, 0.86];
      tx = (t * 0.014) % (w + 160) - 80; tank(tx, yb, 1, 1, t, true);
      ctx.fillStyle = "rgba(70,40,24,.35)"; for (i = 1; i < 6; i++) { ctx.beginPath(); ctx.arc(tx - 24 - i * 7, yb - 2 - i * 0.7 + Math.sin(t * 0.01 + i) * 1.5, 3 + i * 1.3, 0, 6.283); ctx.fill(); }
      tx = w - ((t * 0.009 + 200) % (w + 160)) + 80; tank(tx, yb - 12, 0.7, -1, t, true);
      tank(w * 0.66, yb + 4, 1.3, -1, t, false);
      var since = t - lastShot; if (since < 140) { g = ctx.createRadialGradient(w * 0.66 - 30, yb - 12, 0, w * 0.66 - 30, yb - 12, 22); g.addColorStop(0, "rgba(255,230,160," + (1 - since / 140) + ")"); g.addColorStop(1, "rgba(255,120,30,0)"); ctx.fillStyle = g; ctx.fillRect(w * 0.66 - 56, yb - 40, 52, 52); }
      for (i = 0; i < soldiersAt.length; i++) soldier(w * soldiersAt[i], yb + 2 + (i % 2) * 5, 1.4, i % 3 === 2 ? -1 : 1);
    }
    function drawFront(t) {
      var i, p, g;
      drawWar(t);
      now = t; if (t >= nextShell) { lastShot = t; nextShell = t + 5000 + r() * 5000; shells.push({ x: w * (0.15 + r() * 0.7), y: -20, vx: (r() - 0.5) * 0.5, vy: 26, gy: h * (0.66 + r() * 0.1) }); }
      if (r() < 0.008) { var dir = r() < 0.5 ? 1 : -1; tracers.push({ x: dir > 0 ? -50 : w + 50, y: h * (0.12 + r() * 0.5), vx: dir * (26 + r() * 10), vy: (r() - 0.5) * 1.2 }); }
      flash *= 0.88;
      if (flash > 0.02) { ctx.fillStyle = "rgba(255,170,80," + (flash * 0.16) + ")"; ctx.fillRect(0, 0, w, h); }
      for (i = shells.length - 1; i >= 0; i--) {
        p = shells[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.05;
        ctx.strokeStyle = "rgba(230,200,150,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3); ctx.stroke();
        if (p.y >= p.gy) { boom(p.x, p.gy); shells.splice(i, 1); }
      }
      for (i = smoke.length - 1; i >= 0; i--) { p = smoke[i]; p.x += p.vx; p.y += p.vy; p.s += 0.35; p.a -= 0.006; if (p.a <= 0) { smoke.splice(i, 1); continue; } ctx.fillStyle = "rgba(40,30,26," + p.a + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill(); }
      drawCols();
      for (i = blasts.length - 1; i >= 0; i--) {
        p = blasts[i]; p.a += 0.045; if (p.a >= 1) { blasts.splice(i, 1); continue; }
        g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 20 + p.a * 60); g.addColorStop(0, "rgba(255,240,190," + (1 - p.a) + ")"); g.addColorStop(0.4, "rgba(255,140,40," + (0.8 * (1 - p.a)) + ")"); g.addColorStop(1, "rgba(120,40,10,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 20 + p.a * 60, 0, 6.283); ctx.fill();
        ctx.strokeStyle = "rgba(255,210,150," + (0.5 * (1 - p.a)) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p.x, p.y + 4, p.a * 120, p.a * 18, 0, 0, 6.283); ctx.stroke();
      }
      for (i = clods.length - 1; i >= 0; i--) { p = clods[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.vx *= 0.995; if (p.y > h * 0.9) { clods.splice(i, 1); continue; } ctx.fillStyle = "#2a1c12"; ctx.fillRect(p.x, p.y, p.s, p.s * 0.8); ctx.fillStyle = "rgba(255,150,60,.35)"; ctx.fillRect(p.x, p.y, p.s * 0.4, p.s * 0.3); }
      for (i = tracers.length - 1; i >= 0; i--) {
        p = tracers[i]; p.x += p.vx; p.y += p.vy; if (p.x < -80 || p.x > w + 80) { tracers.splice(i, 1); continue; }
        g = ctx.createLinearGradient(p.x, p.y, p.x - p.vx * 2.2, p.y - p.vy * 2.2); g.addColorStop(0, "rgba(255,245,200,1)"); g.addColorStop(1, "rgba(255,170,60,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); ctx.stroke();
      }
    }
    function drawSun(t) {
      var sx = w * 0.7, sy = h * 0.26, pul = 1 + 0.03 * Math.sin(t * 0.002), g, i;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      g = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.9); g.addColorStop(0, "rgba(255,240,190,.75)"); g.addColorStop(0.15, "rgba(255,200,100,.4)"); g.addColorStop(0.5, "rgba(255,140,40,.14)"); g.addColorStop(1, "rgba(255,120,30,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,235,170,.10)"; ctx.lineWidth = 3;
      for (i = 0; i < 14; i++) { var a = i * 0.449 + t * 0.00006; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * 40, sy + Math.sin(a) * 40); ctx.lineTo(sx + Math.cos(a) * w, sy + Math.sin(a) * w); ctx.stroke(); }
      ctx.restore();
      g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 34 * pul); g.addColorStop(0, "#fffdf0"); g.addColorStop(0.7, "#fff4c0"); g.addColorStop(1, "rgba(255,230,150,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 34 * pul, 0, 6.283); ctx.fill();
    }
    var bld = null, cars = null;
    function drawCity(t, still) {
      var i, k, b, c, x, y, rr, g, ry = h * 0.58, rh = h * 0.15;
      if (!bld) {
        rr = rng(41); bld = []; x = -10; while (x < w + 20) { b = { x: x, w: 26 + rr() * 38, h: h * (0.22 + rr() * 0.3), lit: [] }; for (k = 0; k < 60; k++) b.lit.push(rr() < 0.38); bld.push(b); x += b.w + 2 + rr() * 6; }
        cars = []; for (i = 0; i < 11; i++) { var dir = i % 2 ? 1 : -1; cars.push({ dir: dir, x: rr() * w, v: (0.9 + rr() * 1.6) * dir, len: rr() < 0.2 ? 34 : 18 + rr() * 6, big: 0 }); cars[i].big = cars[i].len > 30; }
      }
      g = ctx.createLinearGradient(0, 0, 0, ry); g.addColorStop(0, "rgba(40,36,30,0)"); g.addColorStop(1, "rgba(120,95,60,.35)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, ry);
      for (i = 0; i < bld.length; i++) {
        b = bld[i]; ctx.fillStyle = "#0e0d0b"; ctx.fillRect(b.x, ry - b.h, b.w, b.h + 4);
        var cols = Math.max(2, Math.floor(b.w / 9)), n = 0;
        for (y = ry - b.h + 8; y < ry - 8; y += 10) for (k = 0; k < cols; k++) { if (b.lit[n++ % 60]) { ctx.fillStyle = "rgba(255,200,110," + (0.55 + 0.25 * Math.sin(t * 0.0008 + n)) + ")"; ctx.fillRect(b.x + 4 + k * 9, y, 4, 5); } }
      }
      ctx.fillStyle = "#17140f"; ctx.fillRect(0, ry, w, h - ry);
      ctx.fillStyle = "#0c0a08"; ctx.fillRect(0, ry + 2, w, rh);
      ctx.fillStyle = "rgba(200,183,150,.35)"; for (x = (still ? 0 : -(t * 0.02) % 28); x < w; x += 28) ctx.fillRect(x, ry + 2 + rh / 2 - 1, 14, 2);
      for (x = 30; x < w; x += 110) { ctx.fillStyle = "#26211a"; ctx.fillRect(x, ry - 34, 2, 36); g = ctx.createRadialGradient(x + 1, ry - 36, 0, x + 1, ry - 36, 30); g.addColorStop(0, "rgba(255,210,140,.35)"); g.addColorStop(1, "rgba(255,210,140,0)"); ctx.fillStyle = g; ctx.fillRect(x - 32, ry - 68, 66, 66); }
      for (i = 0; i < cars.length; i++) {
        c = cars[i]; if (!still) { c.x += c.v; if (c.x > w + 50) c.x = -50; if (c.x < -50) c.x = w + 50; }
        y = ry + 2 + (c.dir > 0 ? rh * 0.58 : rh * 0.12); var bh = c.big ? 10 : 7, fx = c.dir > 0 ? c.x + c.len : c.x, bx = c.dir > 0 ? c.x : c.x + c.len;
        ctx.fillStyle = c.big ? "#2a2218" : "#1e1b16"; ctx.fillRect(c.x, y, c.len, bh); ctx.fillStyle = "#3a3126"; ctx.fillRect(c.x + 3, y - 2, c.len * 0.5, 3);
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        g = ctx.createRadialGradient(fx, y + bh - 2, 0, fx, y + bh - 2, 14); g.addColorStop(0, "rgba(255,240,200,.5)"); g.addColorStop(1, "rgba(255,240,200,0)"); ctx.fillStyle = g; ctx.fillRect(fx - 16, y - 12, 32, 32);
        g = ctx.createRadialGradient(bx, y + bh - 2, 0, bx, y + bh - 2, 10); g.addColorStop(0, "rgba(255,40,30,.8)"); g.addColorStop(1, "rgba(255,40,30,0)"); ctx.fillStyle = g; ctx.fillRect(bx - 10, y - 8, 20, 20);
        ctx.restore();
      }
    }
    var peaks = null;
    function drawArctic(t) {
      var hz = h * 0.42, g, i, cx = w * 0.5;
      g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, "rgba(10,30,40,.0)"); g.addColorStop(1, "rgba(200,235,245,.18)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, hz);
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (i = 0; i < 3; i++) { g = ctx.createLinearGradient(0, h * 0.05, 0, h * 0.4); g.addColorStop(0, "rgba(80,255,170,0)"); g.addColorStop(0.5, "rgba(80,255,170," + (0.10 + 0.04 * Math.sin(t * 0.0006 + i)) + ")"); g.addColorStop(1, "rgba(80,160,255,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, h * 0.4); for (var x = 0; x <= w; x += 20) ctx.lineTo(x, h * (0.18 + i * 0.05) + Math.sin(x * 0.012 + t * 0.0005 * (i + 1) + i * 2) * 14); ctx.lineTo(w, h * 0.4); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      if (!peaks) { var rr = rng(7); peaks = []; for (i = 0; i <= 16; i++) peaks.push(i % 2 ? 0.07 + rr() * 0.15 : 0.02 + rr() * 0.05); }
      ctx.fillStyle = "#5a7480"; ctx.beginPath(); ctx.moveTo(0, hz); for (i = 0; i < peaks.length; i++) ctx.lineTo(i * w / 16, hz - peaks[i] * h); ctx.lineTo(w, hz); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(235,246,250,.55)"; ctx.beginPath(); ctx.moveTo(0, hz); for (i = 0; i < peaks.length; i++) ctx.lineTo(i * w / 16, hz - peaks[i] * h * 0.99 + (i % 2 ? 0 : 0)); for (i = peaks.length - 1; i >= 0; i--) ctx.lineTo(i * w / 16, hz - peaks[i] * h * 0.55); ctx.closePath(); ctx.fill();
      g = ctx.createLinearGradient(0, hz, 0, h); g.addColorStop(0, "#c9dde5"); g.addColorStop(1, "#7f9aa6"); ctx.fillStyle = g; ctx.fillRect(0, hz, w, h - hz);
      g = ctx.createLinearGradient(0, hz, 0, h); g.addColorStop(0, "#9fd0e6"); g.addColorStop(0.5, "#5f93ad"); g.addColorStop(1, "#2f5870");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - 6, hz); ctx.lineTo(cx + 6, hz); ctx.lineTo(w * 0.86, h); ctx.lineTo(w * 0.14, h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1.4;
      for (i = 0; i < 5; i++) { var q = (i + 0.5) / 5, y = hz + (h - hz) * q * q, hw = 6 + (w * 0.36 - 6) * q * q; ctx.beginPath(); ctx.moveTo(cx - hw * 0.8, y); ctx.lineTo(cx - hw * 0.2, y + 3 * q); ctx.lineTo(cx + hw * 0.4, y - 2 * q); ctx.lineTo(cx + hw * 0.85, y + 4 * q); ctx.stroke(); }
      ctx.fillStyle = "rgba(255,255,255,.55)"; var gl = Math.sin(t * 0.004) * 0.5 + 0.5;
      for (i = 0; i < 6; i++) { var qq = 0.25 + i * 0.13, gy = hz + (h - hz) * qq * qq, gx = cx + Math.sin(i * 2.3) * (w * 0.3 * qq * qq); ctx.globalAlpha = (0.3 + 0.7 * ((gl + i * 0.3) % 1)) ; ctx.fillRect(gx - 8 * qq, gy, 16 * qq, 2); }
      ctx.globalAlpha = 1;
    }
    function step(t, still) {
      ctx.clearRect(0, 0, w, h);
      if (type === "timber") drawTrees(t);
      var gs = 1 + gust * 2.2, i, p;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        if (!still) {
          if (type === "city") { p.y += (0.3 + p.k * 0.5) * gs; p.x += 0.15 * gs; }
          else if (type === "timber") { p.x += (2.2 + p.k * 2.2) * gs; p.y += Math.sin(t * 0.004 + p.ph) * 0.8 + 0.25; }
          else if (type === "wild") { var sg = 1 + 0.45 * Math.sin(t * 0.0016 + p.y * 0.004) + 0.35 * Math.sin(t * 0.0047); p.x -= (15 + p.k * 12) * gs * sg; p.y += (1.5 + p.k * 2.5) * sg; }
          else if (type === "front") { p.y -= (0.5 + p.k * 1.1) * gs; p.x += Math.sin(t * 0.003 + p.ph) * 0.6; }
          else if (type === "desert") { p.x += (3 + p.k * 4) * gs; p.y += Math.sin(t * 0.002 + p.ph) * 0.3; }
          else { p.y += (0.9 + p.k * 1.2) * gs; p.x -= (1.4 + p.k) * gs + Math.sin(t * 0.0015 + p.ph) * 0.5; }
          if (p.y > h + 12 || p.y < -14 || p.x > w + 12 || p.x < -14) spawn(p, false);
        }
        if (type === "wild") { ctx.strokeStyle = "rgba(200,218,228," + (p.a * 0.75) + ")"; ctx.lineWidth = 1 + p.k * 0.6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 22 + p.k * 20, p.y - 3 - p.k * 3); ctx.stroke(); }
        else if (type === "front") { ctx.fillStyle = "rgba(255," + (110 + p.k * 60 | 0) + ",40," + (p.a * (0.6 + 0.4 * Math.sin(t * 0.01 + p.ph))) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.8, 0, 6.283); ctx.fill(); }
        else if (type === "desert") { ctx.fillStyle = "rgba(235,200,140," + (p.a * 0.5) + ")"; ctx.fillRect(p.x, p.y, 2 + p.k * 7, 1); }
        else if (type === "cold") { ctx.fillStyle = "rgba(240,248,250," + (0.4 + p.a * 0.6) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.9, 0, 6.283); ctx.fill(); }
        else if (type === "timber") { ctx.fillStyle = "rgba(200,150,70," + (p.a * 0.8) + ")"; ctx.fillRect(p.x, p.y, p.s + 1, p.s); }
        else { ctx.fillStyle = "rgba(210,205,195," + (p.a * 0.6) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.7, 0, 6.283); ctx.fill(); }
      }
      if (type === "desert") drawSun(t);
      if (type === "cold") drawArctic(t);
      if (type === "city") drawCity(t, still);
      if (type === "wild") { var sv = 0.5 + 0.5 * Math.sin(t * 0.0016) * Math.sin(t * 0.0047 + 1); ctx.fillStyle = "rgba(150,170,180," + (0.05 + 0.09 * sv) + ")"; ctx.fillRect(0, 0, w, h); }
      if (type === "front" && !still) drawFront(t);
      if (type === "desert") { ctx.strokeStyle = "rgba(255,232,170,.14)"; ctx.lineWidth = 1.4; for (i = 0; i < 3; i++) { ctx.beginPath(); for (var x = 0; x <= w; x += 6) { var yy = h * (0.5 + i * 0.09) + Math.sin(x * 0.04 + t * 0.003 * (i + 1)) * 3; x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); } }
    }
    function hot(on) { gustT = on ? 1 : 0; }
    el.addEventListener("mouseenter", function () { hot(true); }); el.addEventListener("mouseleave", function () { hot(false); });
    size();
    var o = { el: el, size: size, draw: function (t) { gust += (gustT - gust) * 0.06; step(t, reduce); }, set vis(v) { vis = v; if (v && reduce) step(0, true); }, get vis() { return vis; } };
    return o;
  }
  $$(".reg").forEach(function (el) { weather.push(Weather(el)); });
  if ("IntersectionObserver" in window) {
    var wio = new IntersectionObserver(function (es) { es.forEach(function (e) { weather.forEach(function (w) { if (w.el === e.target) w.vis = e.isIntersecting; }); }); }, { rootMargin: "80px" });
    weather.forEach(function (w) { wio.observe(w.el); });
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.target === strain) strainOn = e.isIntersecting; if (e.target === hero) heroOn = e.isIntersecting; }); });
    if (strain) sio.observe(strain); if (hero) sio.observe(hero);
  } else weather.forEach(function (w) { w.vis = true; });

  var strain = null, sctx = null, strainOn = false, sizeStrain = function () {};
  E.state = "idle";

  /* ---------- One loop ---------- */
  var last = 0, mx = 0, frameN = 0, lastLabel = "";
  window.addEventListener("mousemove", function (e) { mx = e.clientX / window.innerWidth - 0.5; }, { passive: true });
  function frame(t) {
    frameN++;
    var y = window.pageYOffset; S.dy = y - S.y; S.y = y; S.progress = clamp(y / S.docH, 0, 1);
    S.strain += (clamp(Math.abs(S.dy) / 45, 0, 1) - S.strain) * 0.14;
    if (!reduce) S.road += S.dy * 0.006;
    // engine
    var target = E.state === "off" ? 0 : E.state === "crank" ? 0.42 + 0.1 * Math.sin(t * 0.05) : 0.2 + 0.01 * Math.sin(t * 0.02);
    if (E.state !== "off" && E.state !== "crank") target += Math.min(0.62, S.strain * 0.9);
    E.rpm += (target - E.rpm) * 0.12;
    if (needle) needle.style.transform = "rotate(" + (-80 + E.rpm * 160).toFixed(1) + "deg)";
    var label = E.state === "off" ? "Engine off" : E.state === "crank" ? "Cranking" : S.strain > 0.25 ? "Under load" : "Idling";
    if (label !== lastLabel && eng) { eng.textContent = label; eng.className = "eng" + (E.state === "off" ? "" : " on"); lastLabel = label; }
    if (odo) odo.textContent = ("0000" + Math.round(S.progress * 1000)).slice(-4);
    if (rail) { rail.classList.toggle("on", y > S.vh * 0.4); railDot.style.top = (S.progress * (rail.clientHeight - 22)).toFixed(1) + "px"; }
    // shake and heat haze
    if (!reduce && heroIn) {
      var amp = S.strain * 1.2;
      root.style.setProperty("--shake-x", (amp ? (Math.random() - 0.5) * amp * 2 : 0).toFixed(2) + "px");
      root.style.setProperty("--shake-y", (amp ? (Math.random() - 0.5) * amp * 1.4 : 0).toFixed(2) + "px");
    }
    // hero parallax, road and dust
    if (heroOn) {
      if (!reduce) layers.forEach(function (l) { l.el.style.transform = "translate(" + (mx * -40 * l.k * 10).toFixed(1) + "px," + (S.y * l.k).toFixed(1) + "px)"; });
      if (rctx && (!reduce || frameN < 3)) drawRoad(t);
    }
    for (var i = 0; i < weather.length; i++) if (weather[i].vis && !reduce) weather[i].draw(t);
    requestAnimationFrame(frame);
  }
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { measure(); sizeStrain(); weather.forEach(function (w) { w.size(); if (reduce && w.vis) w.vis = true; }); }, 120); });
  window.addEventListener("load", function () { measure(); sizeStrain(); });
  measure(); sizeStrain();
  requestAnimationFrame(frame);

  /* ---------- Work-in-progress pop-up (once per visit) ---------- */
  (function () {
    var d = $("#wip"); if (!d || !d.showModal) return;
    try { if (sessionStorage.getItem("wipSeen")) return; } catch (e) {}
    d.addEventListener("close", function () { try { sessionStorage.setItem("wipSeen", "1"); } catch (e) {} });
    setTimeout(function () { try { d.showModal(); } catch (e) {} }, 400);
  })();

  /* ---------- Click-to-play videos (nothing loads from YouTube until pressed) ---------- */
  $$(".video").forEach(function (box) {
    var b = $("button", box);
    b.addEventListener("click", function () {
      var f = doc.createElement("iframe"), st = box.getAttribute("data-start");
      f.src = "https://www.youtube-nocookie.com/embed/" + box.getAttribute("data-yt") + "?autoplay=1&rel=0" + (st && st !== "0" ? "&start=" + st : "");
      f.title = b.getAttribute("aria-label").replace("Play video: ", ""); f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true; f.referrerPolicy = "strict-origin-when-cross-origin";
      box.replaceChild(f, b);
    });
  });
})();
