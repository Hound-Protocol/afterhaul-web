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
