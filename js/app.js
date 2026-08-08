/* Shared helpers for Numair's Learning World */
(function (window, $) {
  "use strict";

  var PREFIX = "numairApp.";
  var toastTimer = null;

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }

  function getStars() {
    var n = read("stars", 0);
    return typeof n === "number" ? n : 0;
  }

  function setStars(n) {
    write("stars", Math.max(0, n | 0));
    refreshStarBadge();
  }

  function addStars(n, activityId) {
    n = n | 0;
    if (n <= 0) return getStars();
    if (activityId) {
      var prog = getProgress(activityId);
      if (prog.starred) {
        celebrate("You already earned stars here — keep practicing!");
        return getStars();
      }
      setProgress(activityId, { starred: true, starsEarned: n });
    }
    setStars(getStars() + n);
    celebrate("+" + n + " star" + (n > 1 ? "s" : "") + "! Great job!");
    return getStars();
  }

  function getNickname() {
    return read("nickname", "Numair") || "Numair";
  }

  function setNickname(name) {
    write("nickname", String(name || "Numair").slice(0, 20));
  }

  function getProgress(activityId) {
    var all = read("progress", {});
    return all[activityId] || {};
  }

  function setProgress(activityId, partial) {
    var all = read("progress", {});
    all[activityId] = Object.assign({}, all[activityId] || {}, partial || {});
    write("progress", all);
  }

  function getRankings(gameKey) {
    var all = read("rankings", {});
    return Array.isArray(all[gameKey]) ? all[gameKey] : [];
  }

  function saveRanking(gameKey, entry) {
    var all = read("rankings", {});
    var list = Array.isArray(all[gameKey]) ? all[gameKey].slice() : [];
    list.push({
      name: entry.name || getNickname(),
      score: entry.score | 0,
      date: entry.date || new Date().toISOString().slice(0, 10)
    });
    list.sort(function (a, b) {
      return b.score - a.score;
    });
    list = list.slice(0, 10);
    all[gameKey] = list;
    write("rankings", all);
    return list;
  }

  function refreshStarBadge() {
    var el = document.getElementById("starCount");
    if (el) el.textContent = String(getStars());
  }

  function celebrate(message) {
    var $t = $("#appToast");
    if (!$t.length) {
      $t = $('<div id="appToast" class="toast" role="status"></div>').appendTo("body");
    }
    $t.text(message).addClass("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      $t.removeClass("show");
    }, 2200);
  }

  function buzz() {
    celebrate("Almost — try again!");
  }

  function loadJSON(path) {
    return $.getJSON(path).then(null, function () {
      celebrate("Could not load content. Use a local server (see README).");
      return $.Deferred().reject().promise();
    });
  }

  var speakToken = 0;
  var voicesReady = false;
  var preferredVoiceName = null;

  function warmVoices() {
    if (!window.speechSynthesis) return;
    var list = window.speechSynthesis.getVoices();
    if (list && list.length) voicesReady = true;
  }

  if (window.speechSynthesis) {
    warmVoices();
    window.speechSynthesis.addEventListener("voiceschanged", function () {
      voicesReady = true;
      warmVoices();
    });
  }

  // Prefer soft, natural, female / kid-teacher voices; avoid robotic defaults
  function scoreVoice(v, langPrefix) {
    var name = (v.name || "").toLowerCase();
    var lang = (v.lang || "").toLowerCase();
    var score = 0;

    if (lang.indexOf(langPrefix) === 0) score += 30;
    else if (lang.indexOf("en") === 0 && langPrefix === "hi") score += 5;
    else if (lang.indexOf("en") !== 0 && langPrefix === "en") score -= 40;

    // Boost natural / neural / online voices
    if (/natural|neural|online|premium|enhanced|studio/.test(name)) score += 45;
    // Gentle female / teacher-like names common on Windows/macOS/Chrome
    if (/zira|aria|jenny|sara|sara|samantha|karen|moira|victoria|susan|hazel|emma|linda|helen|catherine|woman|female|girl/.test(name))
      score += 50;
    if (/google.*english|google us|google uk/.test(name)) score += 35;
    if (/microsoft.*(aria|jenny|zira|sara)/.test(name)) score += 40;

    // Penalize harsh/robotic male defaults kids dislike
    if (/david|mark|george|daniel|alex|fred|ravi|male|guy|james|thomas/.test(name)) score -= 35;
    if (/compact|mobile|robot|dummy/.test(name)) score -= 25;

    // Prefer local high-quality when available
    if (v.localService) score += 5;

    return score;
  }

  function pickVoice(lang) {
    var voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    var useLang = String(lang || "en-US");
    var prefix = useLang.slice(0, 2).toLowerCase();

    // Remember last good voice for this session
    if (preferredVoiceName) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].name === preferredVoiceName) return voices[i];
      }
    }

    var saved = null;
    try {
      saved = localStorage.getItem("numairApp.kidVoice");
    } catch (e) {}
    if (saved) {
      for (var s = 0; s < voices.length; s++) {
        if (voices[s].name === saved) {
          preferredVoiceName = saved;
          return voices[s];
        }
      }
    }

    var best = null;
    var bestScore = -9999;
    for (var j = 0; j < voices.length; j++) {
      var sc = scoreVoice(voices[j], prefix);
      if (sc > bestScore) {
        bestScore = sc;
        best = voices[j];
      }
    }

    if (best) {
      preferredVoiceName = best.name;
      try {
        localStorage.setItem("numairApp.kidVoice", best.name);
      } catch (e2) {}
    }
    return best;
  }

  function decodeAttrText(raw) {
    if (raw == null || raw === "") return "";
    return $("<textarea/>").html(String(raw)).val();
  }

  function speakTextFromButton($btn) {
    var raw = $btn.attr("data-text");
    var text = decodeAttrText(raw);
    if (!text) {
      var $card = $btn.closest(".card");
      var translit = ($card.find(".translit").first().text() || "").trim();
      var meaning = ($card.find("p").not(".arabic").not(".translit").first().text() || "").trim();
      if (translit && meaning) {
        text = "Let's say it slowly. " + translit + ". That means: " + meaning;
      } else {
        text =
          translit ||
          meaning ||
          ($card.find("p").first().text() || "").trim();
      }
    }
    return text;
  }

  // Make text easier for a 6-year-old ear: slower pacing cues, clearer wording
  function kidifyText(text) {
    var t = String(text || "").replace(/\s+/g, " ").trim();
    if (!t) return "";

    // Soften symbols kids hear poorly
    t = t
      .replace(/₹/g, "rupees ")
      .replace(/×/g, " times ")
      .replace(/÷/g, " divided by ")
      .replace(/\+/g, " plus ")
      .replace(/−|–/g, " minus ")
      .replace(/=/g, " equals ")
      .replace(/→/g, ". Next, ")
      .replace(/ﷺ/g, " peace be upon him ")
      .replace(/\bRA\b/g, " radiyallahu anha ")
      .replace(/\bQ:/gi, "Question. ")
      .replace(/\bA:/gi, "Answer. ");

    // Short pause markers between sentences
    t = t.replace(/([.!?])\s+/g, "$1 ... ");
    // Pause after commas a little
    t = t.replace(/,\s+/g, ", ");

    return t.trim();
  }

  // Lookbehind can fail on older browsers — use a safer split
  function splitIntoChunks(text) {
    var parts = text
      .split(/\s*\.\.\.\s*|\n+/)
      .map(function (p) {
        return p.replace(/\s+/g, " ").trim();
      })
      .filter(Boolean);

    var chunks = [];
    parts.forEach(function (part) {
      if (part.length <= 140) {
        chunks.push(part);
        return;
      }
      var sentences = part.split(/([.!?])\s+/);
      var buf = "";
      for (var i = 0; i < sentences.length; i++) {
        var piece = sentences[i];
        if (!piece) continue;
        if (/^[.!?]$/.test(piece)) {
          buf += piece;
          continue;
        }
        var next = (buf + " " + piece).trim();
        if (next.length > 140 && buf) {
          chunks.push(buf.trim());
          buf = piece;
        } else {
          buf = next;
        }
      }
      if (buf) chunks.push(buf.trim());
    });
    return chunks.length ? chunks : [text];
  }

  function speak(text, lang) {
    text = kidifyText(text);
    if (!text) {
      celebrate("Nothing to read on this card");
      return;
    }
    if (!window.speechSynthesis) {
      celebrate("Read-aloud not available on this device");
      return;
    }

    var useLang = lang || "en-US";
    if (useLang === "en-IN") useLang = "en-US";

    var token = ++speakToken;
    warmVoices();
    var chunks = splitIntoChunks(text);

    function doSpeak() {
      if (token !== speakToken) return;
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}

      var voice = pickVoice(useLang);
      var voiceLabel = voice ? voice.name.split(" - ")[0] : "kid voice";

      setTimeout(function () {
        if (token !== speakToken) return;

        var idx = 0;
        function speakNext() {
          if (token !== speakToken) return;
          if (idx >= chunks.length) return;

          var chunk = chunks[idx++];
          try {
            var u = new SpeechSynthesisUtterance(chunk);
            u.lang = useLang;
            // Gentle classroom pace for age 6
            u.rate = 0.78;
            u.pitch = 1.18;
            u.volume = 1;
            if (voice) {
              u.voice = voice;
              if (voice.lang) u.lang = voice.lang;
            }
            if (idx === 1) {
              u.onstart = function () {
                celebrate("🔊 " + voiceLabel + " is reading…");
              };
            }
            u.onerror = function () {
              if (token !== speakToken) return;
              celebrate("Could not speak — check volume & voice settings");
            };
            u.onend = function () {
              if (token !== speakToken) return;
              // Small gap between chunks = more natural / less robotic
              setTimeout(speakNext, 220);
            };
            window.speechSynthesis.speak(u);
            setTimeout(function () {
              if (token !== speakToken) return;
              if (window.speechSynthesis.paused) window.speechSynthesis.resume();
            }, 80);
          } catch (err) {
            celebrate("Could not speak — try again");
          }
        }

        speakNext();
      }, 60);
    }

    if (!voicesReady && !(window.speechSynthesis.getVoices() || []).length) {
      var waited = false;
      var onVoices = function () {
        if (waited) return;
        waited = true;
        window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
        doSpeak();
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoices);
      setTimeout(onVoices, 400);
      window.speechSynthesis.getVoices();
    } else {
      doSpeak();
    }
  }

  function bindSpeakButtons() {
    $(document)
      .off("click.numairSpeak", ".js-speak")
      .on("click.numairSpeak", ".js-speak", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $btn = $(this);
        var lang = $btn.attr("data-lang") || "en-US";
        speak(speakTextFromButton($btn), lang);
      });
  }

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\r?\n/g, " ");
  }

  function bindTabs($root) {
    $root = $root || $(document);
    $root.on("click", ".tab-btn", function () {
      var $btn = $(this);
      var target = $btn.data("tab");
      if (!target) return;
      var $tabsRow = $btn.closest(".tabs");
      // Prefer immediate parent when it owns the panels (nested Learn/Play tabs);
      // otherwise use the closest .tabbed (e.g. Games header wraps the tabs).
      var $wrap = $tabsRow.parent();
      if (!$wrap.children("#" + target).length) {
        $wrap = $btn.closest(".tabbed");
      }
      if (!$wrap.length || !$wrap.children("#" + target).length) return;
      $tabsRow.find(".tab-btn").removeClass("active");
      $btn.addClass("active");
      $wrap.children(".panel").removeClass("active");
      $wrap.children("#" + target).addClass("active");
    });
  }

  function homeHref() {
    var path = window.location.pathname.replace(/\\/g, "/");
    if (path.indexOf("/pages/") !== -1) return "../index.html";
    return "index.html";
  }

  function dataHref(file) {
    var path = window.location.pathname.replace(/\\/g, "/");
    if (path.indexOf("/pages/") !== -1) return "../data/" + file;
    return "data/" + file;
  }

  $(function () {
    refreshStarBadge();
    bindTabs();
    bindSpeakButtons();
    $(".js-home").attr("href", homeHref());
    // Prime voices on first user gesture (browser requirement)
    $(document).one("click keydown touchstart", function () {
      warmVoices();
      if (window.speechSynthesis) window.speechSynthesis.getVoices();
    });
  });

  window.NumairApp = {
    getStars: getStars,
    addStars: addStars,
    setStars: setStars,
    getNickname: getNickname,
    setNickname: setNickname,
    getProgress: getProgress,
    setProgress: setProgress,
    getRankings: getRankings,
    saveRanking: saveRanking,
    loadJSON: loadJSON,
    celebrate: celebrate,
    buzz: buzz,
    speak: speak,
    escapeAttr: escapeAttr,
    refreshStarBadge: refreshStarBadge,
    dataHref: dataHref,
    homeHref: homeHref
  };
})(window, jQuery);
