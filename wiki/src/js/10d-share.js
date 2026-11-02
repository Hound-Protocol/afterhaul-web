  /* ---------------- Share and download buttons (every document) ----------------
     Share copies the document's own link (on phones it opens the system share sheet). Download saves the text as a .md file. */
  var ICO_SHARE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>';
  var ICO_DOWN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>';
  function docUrl(kind, id) { return location.href.split("#")[0].split("?")[0] + "#/" + kind + "/" + id; }
  function docActions(kind, id) {
    return '<span class="doc-act" data-kind="' + esc(kind) + '" data-id="' + esc(id) + '">' +
      '<button type="button" class="da-share" title="Copy the link to this document">' + ICO_SHARE + "<b>Share</b></button>" +
      '<button type="button" class="da-down" title="Download this document as a .md file">' + ICO_DOWN + "<b>Download</b></button></span>";
  }
  /* getText returns the document as Markdown; filename is without extension */
  function wireDocActions(root, getText, filename, title) {
    var box = $(".doc-act", root); if (!box) return;
    var url = docUrl(box.getAttribute("data-kind"), box.getAttribute("data-id"));
    function flash(btn, txt) { var b = $("b", btn), old = b.textContent; b.textContent = txt; btn.classList.add("done"); setTimeout(function () { b.textContent = old; btn.classList.remove("done"); }, 1400); }
    $(".da-share", box).addEventListener("click", function () {
      var btn = this;
      if (navigator.share && window.matchMedia && matchMedia("(pointer: coarse)").matches) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
      copyText(url).then(function () { flash(btn, "Link copied"); status("Link copied"); }, function () { flash(btn, "Press Ctrl+C"); window.prompt && 0; });
    });
    $(".da-down", box).addEventListener("click", function () {
      var btn = this, blob;
      try {
        blob = new Blob([getText()], { type: "text/markdown;charset=utf-8" });
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename + ".md";
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        flash(btn, "Saved");
      } catch (e) { flash(btn, "Failed"); }
    });
  }
