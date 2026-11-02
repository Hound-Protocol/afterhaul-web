  /* ---------------- Boot ---------------- */
  applyOpts();
  scheduleGlitch();
  led($("#build"), "");
  $("#build").textContent = "AFTERHAUL Wiki";
  Promise.all([loadLocal("docs"), loadLocal("guides")]).then(function () { route(); });
  route();
  window.addEventListener("hashchange", route);
