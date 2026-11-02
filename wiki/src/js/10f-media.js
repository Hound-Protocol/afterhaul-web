  /* ---------------- Videos: a play button that loads the YouTube player only when pressed (no third-party request before) ---------------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".yt-play"); if (!b) return;
    var f = document.createElement("iframe"), t = +b.getAttribute("data-start") || 0;
    f.src = "https://www.youtube-nocookie.com/embed/" + b.getAttribute("data-yt") + "?autoplay=1&rel=0" + (t ? "&start=" + t : "");
    f.title = b.getAttribute("aria-label").replace(/^Play video: /, ""); f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true; f.className = "yt-frame";
    b.parentNode.replaceChild(f, b);
  });
