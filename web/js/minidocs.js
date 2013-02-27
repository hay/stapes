(function() {
    /** Set data-tooltip or title (if useTitles is truthy) of element `el` to string `text`. */
    function setTooltip(el, text, useTitles) {
        if (useTitles || !el.setAttribute) {
            el.title = text;
        } else {
            if (text) {
                el.setAttribute('data-tooltip', text);
            } else {
                el.removeAttribute('data-tooltip');
            }
        }
    }
    /**
     * Mini documentation using titles on code spans created with rainbowco.de or similar.
     * Args: docs object {functionName:documentation_string,...}, optional domElements collection or selector string, optional boolean useTitles to use titles instead of tooltips, optional callback cb.
     * Uses: document.querySelectorAll defined in HTML5. Need a shim for obsolete browsers, or pass in domElements found using other selector such as jQuery sizzle or Zepto.
     */
    function minidocs(docs, domEls, useTitles, cb) {
        try {
          if (typeof domEls === "function") { cb = domEls; domEls = ''; }
          if (typeof domEls === "boolean") { useTitles = domEls; domEls = ''; }
          if (typeof domEls !== "object") domEls = document.querySelectorAll(domEls || 'code span.function,span.method');
          // Could also do 'code span.method'
          var hits = 0, missed = [];
          for (var i = 0, t, len = domEls && domEls.length; i < len; ++i) {
            t = docs[domEls[i].textContent];
            if (null != t) {
              ++hits;
              setTooltip(domEls[i], t, useTitles);
            } else {
              missed.push(domEls[i].textContent);
            }
          }
          var misses = missed.length;
          missed = uniq(missed);
          var results = {
            hits: hits,
            misses: misses,
            perc: 100 * hits / (hits + misses),
            missed: missed,
            toString: asString,
            show: function(str) { return docs[str]; },
            redo: minidocs,
            clear: function(doc,els,titles) { return clearTitles(doc || docs, els || domEls, useTitles || titles); }
          }
          if (cb) cb(null, results);
          return results;
        } catch (err) {
          if (cb) cb(err, null);
          return {error: err, hits:0};
        }
    }
    /** Remove duplicates if ra.filter and ra.sort are defined. Args: array ra */
    function uniq(ra) {
      if (ra.filter) ra = ra.slice().sort().filter(function (cur, n, col) {
        return col[n - 1] != cur; // unique
      });
      return ra;
    }
    /** Erase all titles on for elements in docs. See also: minidocs. Args: object docs, optional domEls collection or selector string */
    function clearTitles(docs, domEls,useTitles) {
      var empty = {};
      for (var key in docs) empty[key] = "";
      return minidocs(empty, domEls,useTitles);
    }
    minidocs.clear = clearTitles;
    /** Convenience function to display returned results as a String. See: minidocs. */
    function asString() {
      return Math.round(this.perc) + "% = " + this.hits + " hits : " + this.misses + " misses. Need: " + this.missed;
    }

    // Can be used as an AMD module, a Node.js module, or a global.
    if (typeof exports !== "undefined") {
        // Server
        var doc = require('doc').doc;
        var addDocs = function addDocs(docs,els) {
            doc: "Adds documentation which will be shown with help(function). Args: object docs {funcName:doc_string,...}, els as module or prototype or array of functions."
            if (null == els || typeof els == "string") els = global;
            var hits = 0, missed = [];
            for (var f in els) {
                if ("function" == typeof els[f]) {
                  if (null != docs[f]) {
                      els[f].doc = docs[f];
                      ++hits;
                  } else {
                      missed.push(f);
                  }
                }
            }
            var misses = missed.length;
            missed = uniq(missed);
            return {
                hits: hits,
                misses: misses,
                perc: 100 * hits / (hits + misses),
                missed: missed,
                toString: asString,
                show: function(str) { return docs[str]; },
                redo: addDocs,
                clear: function(doc,items,titles) { return clearTitles(doc || docs, items || els,titles || useTitles); }
            }
        }; //TODO: combine with dom minidocs using Strategy pattern?
        if (typeof module !== "undefined" && module.exports) {
            exports = module.exports = addDocs;
            exports.docs = exports.help = doc;
            exports.clear = clearTitles;
        }
        minidocs = exports.minidocs = addDocs;
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define(function() {
            return minidocs;
        });
    } else {
        // Global scope
        window.minidocs = minidocs;
    }
})();
