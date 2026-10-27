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

  /* ---------- Strain trace (the feel section) ---------- */
  var strain = $("#strain"), sctx = strain && strain.getContext("2d"), sw = 0, sh = 0, strainOn = false;
  function sizeStrain() { if (!strain) return; var dpr = Math.min(window.devicePixelRatio || 1, 2), b = strain.getBoundingClientRect(); sw = b.width; sh = b.height; strain.width = Math.round(sw * dpr); strain.height = Math.round(sh * dpr); sctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function drawStrain(t) {
    sctx.clearRect(0, 0, sw, sh);
    var run = E.state !== "off", amp = 2 + (run ? 6 : 0) + S.strain * 34, f = 0.02 + E.rpm * 0.06, x, y, k;
    [{ c: "rgba(200,183,150,.28)", a: 0.6, p: 0 }, { c: "rgba(240,162,2,.95)", a: 1, p: 1.7 }].forEach(function (L) {
      sctx.strokeStyle = L.c; sctx.lineWidth = L.a === 1 ? 2 : 1.4; sctx.beginPath();
      for (x = 0; x <= sw; x += 3) {
        k = Math.sin(x * f + t * 0.012 * (1 + E.rpm * 3) + L.p) * amp * L.a + Math.sin(x * 0.31 + t * 0.03) * amp * 0.25 * (run ? 1 : 0.2);
        y = sh / 2 + k; x === 0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y);
      }
      sctx.stroke();
    });
  }

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
    var cfg = { city: 46, timber: 38, wild: 90, front: 56, desert: 70, cold: 90 }[type];
    (function () { var s = SIL[type], rr = rng(type.charCodeAt(0) * 31); sil.setAttribute("viewBox", "0 0 400 300");
      sil.innerHTML = '<path d="' + s[1](rr) + '" fill="' + s[0] + '" opacity=".55" transform="translate(0,-26)"/><path d="' + s[1](rng(type.charCodeAt(1) * 17)) + '" fill="' + s[0] + '"/>'; })();
    function spawn(p, init) {
      p.x = r() * w; p.y = init ? r() * h : (type === "front" ? h + 6 : -8); p.s = 1 + r() * 2.2; p.ph = r() * 6.28; p.a = 0.25 + r() * 0.5; p.k = 0.5 + r() * 1;
      if (type === "desert") { p.x = init ? r() * w : -10; p.y = h * (0.3 + r() * 0.65); }
      return p;
    }
    function size() { var dpr = Math.min(window.devicePixelRatio || 1, 2); w = el.clientWidth; h = el.clientHeight; c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); parts = []; for (var i = 0; i < cfg; i++) parts.push(spawn({}, true)); }
    function step(t, still) {
      ctx.clearRect(0, 0, w, h);
      var gs = 1 + gust * 2.2, i, p;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        if (!still) {
          if (type === "city") { p.y += (0.3 + p.k * 0.5) * gs; p.x += 0.15 * gs; }
          else if (type === "timber") { p.y += (0.4 + p.k * 0.6) * gs; p.x += Math.sin(t * 0.002 + p.ph) * 0.5 + 0.1; }
          else if (type === "wild") { p.y += (8 + p.k * 6) * gs; p.x -= 2 * gs; }
          else if (type === "front") { p.y -= (0.5 + p.k * 1.1) * gs; p.x += Math.sin(t * 0.003 + p.ph) * 0.6; }
          else if (type === "desert") { p.x += (3 + p.k * 4) * gs; p.y += Math.sin(t * 0.002 + p.ph) * 0.3; }
          else { p.y += (0.6 + p.k) * gs; p.x += Math.sin(t * 0.0015 + p.ph) * 0.7 - 0.2 * gust; }
          if (p.y > h + 12 || p.y < -14 || p.x > w + 12 || p.x < -14) spawn(p, false);
        }
        if (type === "wild") { ctx.strokeStyle = "rgba(190,210,220," + (p.a * 0.7) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 2, p.y - 10 - p.k * 6); ctx.stroke(); }
        else if (type === "front") { ctx.fillStyle = "rgba(255," + (110 + p.k * 60 | 0) + ",40," + (p.a * (0.6 + 0.4 * Math.sin(t * 0.01 + p.ph))) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.8, 0, 6.283); ctx.fill(); }
        else if (type === "desert") { ctx.fillStyle = "rgba(235,200,140," + (p.a * 0.5) + ")"; ctx.fillRect(p.x, p.y, 2 + p.k * 7, 1); }
        else if (type === "cold") { ctx.fillStyle = "rgba(240,248,250," + (0.4 + p.a * 0.6) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.9, 0, 6.283); ctx.fill(); }
        else if (type === "timber") { ctx.fillStyle = "rgba(200,150,70," + (p.a * 0.8) + ")"; ctx.fillRect(p.x, p.y, p.s + 1, p.s); }
        else { ctx.fillStyle = "rgba(210,205,195," + (p.a * 0.6) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.7, 0, 6.283); ctx.fill(); }
      }
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

  /* ---------- The cold start ---------- */
  var key = $("#key"), lamp = $("#lamp"), state = $("#keyState"), timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function say(text, on) { state.textContent = text; state.className = "state" + (on ? " on" : ""); }
  function setEngine(s) { E.state = s; body.classList.toggle("running", s === "idle"); }
  if (key) key.addEventListener("click", function () {
    timers.forEach(clearTimeout); timers = [];
    if (E.state === "idle") { setEngine("off"); lamp.className = "lamp"; key.textContent = "Start the engine"; say("Engine off"); return; }
    key.disabled = true; lamp.className = "lamp heat"; say("Heating the glow plugs", true);
    later(function () {
      lamp.className = "lamp"; say("Cranking", true); setEngine("crank");
      later(function () { setEngine("idle"); key.disabled = false; key.textContent = "Shut it down"; say("Running", true); }, 900);
    }, reduce ? 300 : 1600);
  });

  /* ---------- One loop ---------- */
  var last = 0, mx = 0, frameN = 0, heatEl = $("#heat feDisplacementMap"), heatNoise = $("#heatNoise"), lastLabel = "";
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
      var amp = E.state === "crank" ? 3 : E.state === "idle" ? 0.5 + S.strain * 1.6 : 0;
      root.style.setProperty("--shake-x", (amp ? (Math.random() - 0.5) * amp * 2 : 0).toFixed(2) + "px");
      root.style.setProperty("--shake-y", (amp ? (Math.random() - 0.5) * amp * 1.4 : 0).toFixed(2) + "px");
      if (heatEl && E.state === "idle" && frameN % 3 === 0) { heatEl.setAttribute("scale", (2.5 + S.strain * 5).toFixed(1)); heatNoise.setAttribute("baseFrequency", (0.004 + 0.0008 * Math.sin(t * 0.001)).toFixed(5) + " 0.03"); }
    }
    // hero parallax, road and dust
    if (heroOn) {
      if (!reduce) layers.forEach(function (l) { l.el.style.transform = "translate(" + (mx * -40 * l.k * 10).toFixed(1) + "px," + (S.y * l.k).toFixed(1) + "px)"; });
      if (rctx && (!reduce || frameN < 3)) drawRoad(t);
    }
    if (strainOn && sctx && (!reduce || frameN < 3)) drawStrain(t);
    for (var i = 0; i < weather.length; i++) if (weather[i].vis && !reduce) weather[i].draw(t);
    requestAnimationFrame(frame);
  }
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { measure(); sizeStrain(); weather.forEach(function (w) { w.size(); if (reduce && w.vis) w.vis = true; }); }, 120); });
  window.addEventListener("load", function () { measure(); sizeStrain(); });
  measure(); sizeStrain();
  requestAnimationFrame(frame);
})();
