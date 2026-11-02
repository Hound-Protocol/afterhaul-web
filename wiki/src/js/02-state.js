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
