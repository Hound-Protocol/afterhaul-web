  /* ---------------- Keyboard ---------------- */
  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    if ($("#hpModal")) return;
    if (e.key === "Escape") {
      if (/INPUT|SELECT|TEXTAREA/.test(tag) && e.target.value) return;
      if (currentView && location.hash !== "#/docs") { location.hash = "#/docs"; e.preventDefault(); }
    }
  });
