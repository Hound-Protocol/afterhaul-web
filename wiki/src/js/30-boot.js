  /* ---------------- Boot ---------------- */
  applyOpts();
  scheduleGlitch();
  led($("#build"), "");
  $("#build").textContent = "AFTERHAUL Wiki";
  Promise.all([loadLocal("docs"), loadLocal("guides")]).then(function () { route(); });
  route();
  window.addEventListener("hashchange", route);

  /* Inside the main page's Wiki tab: report the page height so the frame fits it (see assets/js/afterhaul.js) */
  var IN_FRAME = window.parent !== window && /[?&]embed=1/.test(location.search);
  function pageHeight() { return Math.ceil($("#stage").getBoundingClientRect().height); }
  function tellParent(kind) {
    if (!IN_FRAME) return;
    try { window.parent.postMessage({ ah: "wiki-" + kind, h: pageHeight() }, location.origin); } catch (e) { /* parent not reachable */ }
  }
  if (IN_FRAME) {
    var hLast = 0;
    setInterval(function () { var h = pageHeight(); if (h !== hLast) { hLast = h; tellParent("height"); } }, 200);
    window.addEventListener("resize", function () { hLast = 0; });
  }
