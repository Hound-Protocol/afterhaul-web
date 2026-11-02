  /* ---------------- Views ---------------- */
  var currentView = "";
  function shell(kicker, title, body) {
    return '<div class="vh"><div><span class="kicker">' + esc(kicker) + '</span><h2>' + esc(title) + '</h2></div><a class="btn" href="../">AFTERHAUL</a></div><div id="vb">' + body + "</div>";
  }
  function milestone() { return ""; }
  function loading(t) { return '<p class="sub"><span class="spin"></span>' + esc(t) + "</p>"; }
