/* AFTERHAUL website. Plain JavaScript, no build step.
   The cold start: press the key, the glow plug heats, the engine cranks and settles into an idle shake.
   Press again to shut it down. Reduced motion keeps the lamp and skips the shake. */
(function () {
  "use strict";
  document.documentElement.className = document.documentElement.className.replace("no-js", "js");
  var key = document.getElementById("key"), lamp = document.getElementById("lamp"), state = document.getElementById("keyState");
  if (!key) return;
  var body = document.body, running = false, timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function say(text, on) { state.textContent = text; state.className = "state" + (on ? " on" : ""); }

  key.addEventListener("click", function () {
    clear();
    if (running) {
      running = false;
      body.className = body.className.replace(/\b(idle|crank)\b/g, "").trim();
      lamp.className = "lamp";
      key.textContent = "Start the engine";
      say("Engine off");
      return;
    }
    key.disabled = true;
    lamp.className = "lamp heat";
    say("Heating the glow plugs", true);
    later(function () {
      lamp.className = "lamp";
      say("Cranking", true);
      body.className += " crank";
      later(function () {
        body.className = body.className.replace(/\bcrank\b/, "").trim() + " idle";
        running = true;
        key.disabled = false;
        key.textContent = "Shut it down";
        say("Running", true);
      }, 900);
    }, 1600);
  });
})();
