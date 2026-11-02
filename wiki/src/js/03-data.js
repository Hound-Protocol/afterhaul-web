  /* ---------------- Data ----------------
     data/docs.json and data/guides.json are written by tools/build_wiki.py. Text is read from content/<path>. */
  function loadLocal(name) {
    if (data[name]) return Promise.resolve(data[name]);
    function get() { return fetchJSON("data/" + name + ".json").then(function (v) { data[name] = v; return v; }); }
    return get().catch(function () { return new Promise(function (ok) { setTimeout(ok, 700); }).then(get); }).catch(function () { return null; });
  }
  function loadDoc(doc) {
    if (docCache[doc.path]) return Promise.resolve(docCache[doc.path]);
    return fetchText("content/" + doc.path).then(function (t) { docCache[doc.path] = t; return t; });
  }
