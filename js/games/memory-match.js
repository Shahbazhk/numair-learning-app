(function (window, $) {
  "use strict";

  var EMOJIS = ["🍎", "🐱", "⭐", "🚗", "⚽", "🌸", "🦋", "🍋", "🎂", "🧩", "🌈", "🦕"];
  var pairCount = 6;
  var first = null;
  var lock = false;
  var moves = 0;
  var matched = 0;
  var startedAt = 0;
  var bound = false;

  function levelPairs(level) {
    if (level === "easy") return 4;
    if (level === "hard") return 8;
    return 6;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function updateHud() {
    $("#memMoves").text("Moves: " + moves);
    $("#memPairs").text("Pairs: " + matched + " / " + pairCount);
  }

  function endGame() {
    var secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    var score = Math.max(10, pairCount * 200 - moves * 8 - secs);
    var list = NumairApp.saveRanking("memoryMatch", {
      name: NumairApp.getNickname(),
      score: score
    });
    renderRanks(list);
    $("#memMsg").text("Great memory! Score " + score + " in " + secs + "s");
    NumairApp.celebrate("Memory win! ★");
    NumairApp.addStars(2, "memory-" + pairCount + "-" + Date.now());
  }

  function renderRanks(list) {
    var html = "";
    (list || NumairApp.getRankings("memoryMatch")).forEach(function (r, i) {
      html += "<li><span>#" + (i + 1) + " " + r.name + "</span><span>" + r.score + "</span></li>";
    });
    $("#memRanks").html(html || "<li>No scores yet</li>");
  }

  function start(level) {
    if (!$("#memBoard").length) return;
    pairCount = levelPairs(level || "medium");
    first = null;
    lock = false;
    moves = 0;
    matched = 0;
    startedAt = Date.now();
    var picks = shuffle(EMOJIS).slice(0, pairCount);
    var deck = shuffle(picks.concat(picks));
    var cols = pairCount <= 4 ? 4 : 4;
    var html = "";
    deck.forEach(function (emoji, i) {
      html +=
        '<button type="button" class="mem-card" data-i="' +
        i +
        '" data-v="' +
        emoji +
        '" aria-label="Memory card">' +
        '<span class="mem-face mem-back">?</span>' +
        '<span class="mem-face mem-front">' +
        emoji +
        "</span></button>";
    });
    $("#memBoard")
      .attr("data-cols", cols)
      .css("grid-template-columns", "repeat(" + cols + ", minmax(0, 1fr))")
      .html(html);
    $("#memMsg").text("Tap a card — find matching pairs!");
    updateHud();
  }

  function flip($card) {
    if (lock || $card.hasClass("matched") || $card.hasClass("flipped")) return;
    $card.addClass("flipped");
    if (!first) {
      first = $card;
      return;
    }
    moves++;
    updateHud();
    var a = String(first.attr("data-v"));
    var b = String($card.attr("data-v"));
    if (a === b) {
      first.addClass("matched");
      $card.addClass("matched");
      first = null;
      matched++;
      updateHud();
      NumairApp.celebrate("Match!");
      if (matched >= pairCount) endGame();
    } else {
      lock = true;
      var prev = first;
      first = null;
      setTimeout(function () {
        prev.removeClass("flipped");
        $card.removeClass("flipped");
        lock = false;
      }, 650);
    }
  }

  function init() {
    if (!$("#memBoard").length) return;
    renderRanks();
    start("medium");
    if (bound) return;
    bound = true;
    $(document).on("click", ".mem-level", function () {
      $(".mem-level").removeClass("active");
      $(this).addClass("active");
      start($(this).data("level"));
    });
    $(document).on("click", "#memRestart", function () {
      var lvl = $(".mem-level.active").data("level") || "medium";
      start(lvl);
    });
    $(document).on("click", "#memBoard .mem-card", function () {
      flip($(this));
    });
    // When Memory tab opens, ensure board is filled (display:none can confuse some browsers)
    $(document).on("click", '.tab-btn[data-tab="panelMemory"]', function () {
      setTimeout(function () {
        if (!$("#memBoard .mem-card").length) {
          var lvl = $(".mem-level.active").data("level") || "medium";
          start(lvl);
        }
      }, 50);
    });
  }

  window.MemoryMatch = { init: init, start: start };
})(window, jQuery);
