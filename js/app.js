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

  function hasChosenName() {
    return !!read("nameChosen", false);
  }

  function getGrade() {
    var g = read("grade", 2);
    g = parseInt(g, 10);
    if (isNaN(g) || g < 1 || g > 10) g = 2;
    return g;
  }

  function setGrade(n) {
    var g = parseInt(n, 10);
    if (isNaN(g) || g < 1 || g > 10) g = 2;
    write("grade", g);
    applyNameToUI();
    return g;
  }

  function setNickname(name) {
    var clean = String(name || "Numair")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 20);
    if (!clean) clean = "Numair";
    write("nickname", clean);
    write("nameChosen", true);
    applyNameToUI();
    return clean;
  }

  function gradeActivityId(base) {
    return "g" + getGrade() + "-" + base;
  }

  function applyNameToUI() {
    var name = getNickname();
    var grade = getGrade();
    var first = (name.charAt(0) || "N").toUpperCase();
    $(".js-kid-name").text(name);
    $(".js-kid-name-possessive").text(name + "’s");
    $(".js-grade").text(String(grade));
    $(".js-grade-label").text("Grade " + grade);
    $(".brand-mark").each(function () {
      $(this).text(first);
    });
    if (
      $("body").hasClass("home-page") ||
      /\/index\.html?$/i.test(location.pathname.replace(/\\/g, "/")) ||
      /\/numair-learning-app\/?$/i.test(location.pathname.replace(/\\/g, "/"))
    ) {
      document.title = name + "'s Learning World · Grade " + grade;
    }
  }

  function gradeSelectHtml(selected) {
    var html = '<select id="gradeSelect" class="grade-select" aria-label="CBSE Grade">';
    for (var i = 1; i <= 10; i++) {
      html +=
        '<option value="' +
        i +
        '"' +
        (i === selected ? " selected" : "") +
        ">Grade " +
        i +
        (i === 2 ? " (default)" : "") +
        "</option>";
    }
    html += "</select>";
    return html;
  }

  function showNameDialog(opts) {
    opts = opts || {};
    var isFirst = !!opts.firstTime;
    var current = getNickname();
    var currentGrade = getGrade();
    $("#nameDialog").remove();
    var $dlg = $(
      '<div id="nameDialog" class="name-overlay" role="dialog" aria-modal="true" aria-labelledby="nameDialogTitle">' +
        '<div class="name-dialog">' +
        "<h2 id=\"nameDialogTitle\">" +
        (isFirst ? "What’s your name &amp; grade?" : "Change name / grade") +
        "</h2>" +
        "<p>" +
        (isFirst
          ? "Welcome! Pick your name and CBSE grade. Defaults are Numair and Grade 2."
          : "Update your name or CBSE grade anytime.") +
        "</p>" +
        '<label class="name-label" for="nameInput">Your name</label>' +
        '<input type="text" id="nameInput" class="name-input" maxlength="20" autocomplete="nickname" />' +
        '<label class="name-label" for="gradeSelect">CBSE grade</label>' +
        gradeSelectHtml(currentGrade) +
        '<div class="name-actions">' +
        (isFirst
          ? '<button type="button" class="btn" id="nameKeepDefault">Keep Numair · Grade 2</button>'
          : "") +
        '<button type="button" class="btn primary" id="nameSave">Save</button>' +
        "</div></div></div>"
    );
    $("body").append($dlg);
    $("#nameInput").val(current).trigger("focus").select();

    function save(val, gradeVal) {
      setGrade(gradeVal);
      setNickname(val);
      $("#nameDialog").remove();
      celebrate("Hi, " + getNickname() + "! Grade " + getGrade());
      if (typeof opts.onSaved === "function") opts.onSaved();
    }

    $("#nameSave").on("click", function () {
      save($("#nameInput").val(), $("#gradeSelect").val());
    });
    $("#nameKeepDefault").on("click", function () {
      save("Numair", 2);
    });
    $("#nameInput").on("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        save($(this).val(), $("#gradeSelect").val());
      }
    });
    if (!isFirst) {
      $dlg.on("click", function (e) {
        if (e.target === $dlg[0]) $dlg.remove();
      });
    }
  }

  function ensureNamePrompt() {
    if ($("#btnChangeName").length) {
      $("#btnChangeName")
        .off("click.numairName")
        .on("click.numairName", function () {
          showNameDialog({
            firstTime: false,
            onSaved: function () {
              // If user is on a subject page, reload so new grade content loads
              if (location.pathname.replace(/\\/g, "/").indexOf("/pages/") !== -1) {
                location.reload();
              }
            }
          });
        });
    }
    applyNameToUI();
    if (!hasChosenName()) {
      setTimeout(function () {
        showNameDialog({ firstTime: true });
      }, 280);
    }
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

  var preferredByLang = {};

  // Prefer soft, natural, female / kid-teacher voices; avoid robotic defaults
  function scoreVoice(v, langPrefix) {
    var name = (v.name || "").toLowerCase();
    var lang = (v.lang || "").toLowerCase();
    var score = 0;

    if (lang.indexOf(langPrefix) === 0) score += 80;
    else if (lang.indexOf("en") === 0 && langPrefix === "hi") score += 5;
    else if (langPrefix === "ar" && lang.indexOf("ar") === 0) score += 80;
    else if (lang.indexOf("en") !== 0 && langPrefix === "en") score -= 40;
    else if (langPrefix === "ar" && lang.indexOf("ar") !== 0) score -= 60;

    // Boost natural / neural / online voices
    if (/natural|neural|online|premium|enhanced|studio/.test(name)) score += 45;

    if (langPrefix === "ar") {
      if (/arabic|naayf|hoda|maged|salma|laith|tarik|google.*العربية|google.*arabic/.test(name))
        score += 55;
      if (v.localService) score += 8;
      return score;
    }

    // Gentle female / teacher-like names common on Windows/macOS/Chrome
    if (/zira|aria|jenny|sara|samantha|karen|moira|victoria|susan|hazel|emma|linda|helen|catherine|woman|female|girl/.test(name))
      score += 50;
    if (/google.*english|google us|google uk/.test(name)) score += 35;
    if (/microsoft.*(aria|jenny|zira|sara)/.test(name)) score += 40;

    // Penalize harsh/robotic male defaults kids dislike
    if (/david|mark|george|daniel|alex|fred|ravi|male|guy|james|thomas/.test(name)) score -= 35;
    if (/compact|mobile|robot|dummy/.test(name)) score -= 25;

    if (v.localService) score += 5;

    return score;
  }

  function pickVoice(lang) {
    var voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    var useLang = String(lang || "en-US");
    var prefix = useLang.slice(0, 2).toLowerCase();

    var remembered = preferredByLang[prefix];
    if (remembered) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].name === remembered && (voices[i].lang || "").toLowerCase().indexOf(prefix) === 0) {
          return voices[i];
        }
      }
    }

    if (prefix === "en") {
      var saved = null;
      try {
        saved = localStorage.getItem("numairApp.kidVoice");
      } catch (e) {}
      if (saved) {
        for (var s = 0; s < voices.length; s++) {
          if (voices[s].name === saved) {
            preferredByLang.en = saved;
            preferredVoiceName = saved;
            return voices[s];
          }
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
      preferredByLang[prefix] = best.name;
      if (prefix === "en") {
        preferredVoiceName = best.name;
        try {
          localStorage.setItem("numairApp.kidVoice", best.name);
        } catch (e2) {}
      }
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
    var useLang = lang || "en-US";
    if (useLang === "en-IN") useLang = "en-US";
    var isArabic = String(useLang).toLowerCase().indexOf("ar") === 0;

    // Arabic duas: speak the Arabic script as-is (no English kidify)
    text = isArabic ? String(text || "").replace(/\s+/g, " ").trim() : kidifyText(text);
    if (!text) {
      celebrate("Nothing to read on this card");
      return;
    }
    if (!window.speechSynthesis) {
      celebrate("Read-aloud not available on this device");
      return;
    }

    var token = ++speakToken;
    warmVoices();
    var chunks = isArabic ? [text] : splitIntoChunks(text);

    function doSpeak() {
      if (token !== speakToken) return;
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}

      var voice = pickVoice(useLang);
      var voiceLabel = voice ? voice.name.split(" - ")[0] : isArabic ? "Arabic" : "kid voice";

      setTimeout(function () {
        if (token !== speakToken) return;

        var idx = 0;
        function speakNext() {
          if (token !== speakToken) return;
          if (idx >= chunks.length) return;

          var chunk = chunks[idx++];
          try {
            var u = new SpeechSynthesisUtterance(chunk);
            u.lang = isArabic ? "ar-SA" : useLang;
            // Gentle pace; Arabic a touch slower for clarity
            u.rate = isArabic ? 0.72 : 0.78;
            u.pitch = isArabic ? 1.0 : 1.18;
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
              celebrate(
                isArabic
                  ? "No Arabic voice found — install Arabic TTS or try Chrome"
                  : "Could not speak — check volume & voice settings"
              );
            };
            u.onend = function () {
              if (token !== speakToken) return;
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

  function subjectHref(file) {
    return dataHref("grade-" + getGrade() + "/" + file);
  }

  $(function () {
    refreshStarBadge();
    bindTabs();
    bindSpeakButtons();
    $(".js-home").attr("href", homeHref());
    ensureNamePrompt();
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
    getGrade: getGrade,
    setGrade: setGrade,
    gradeActivityId: gradeActivityId,
    hasChosenName: hasChosenName,
    showNameDialog: showNameDialog,
    applyNameToUI: applyNameToUI,
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
    subjectHref: subjectHref,
    homeHref: homeHref
  };
})(window, jQuery);
