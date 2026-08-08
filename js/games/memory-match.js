(function (window, $) {
  "use strict";

  var EMOJIS = ["🍎", "🐱", "⭐", "🚗", "⚽", "🌸", "🦋", "🍋", "🎂", "🧩", "🌈", "🦕"];
  var pairCount = 6;
  var first = null;
  var lock = false;
  var moves = 0;
  var matched = 0;
  var startedAt = 0;

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
    NumairApp.addStars(2, "memory-" + pairCount + "-" + score);
  }

  function renderRanks(list) {
    var html = "";
    (list || NumairApp.getRankings("memoryMatch")).forEach(function (r, i) {
      html += "<li><span>#" + (i + 1) + " " + r.name + "</span><span>" + r.score + "</span></li>";
    });
    $("#memRanks").html(html || "<li>No scores yet</li>");
  }

  function start(level) {
    pairCount = levelPairs(level || "medium");
    first = null;
    lock = false;
    moves = 0;
    matched = 0;
    startedAt = Date.now();
    var picks = shuffle(EMOJIS).slice(0, pairCount);
    var deck = shuffle(picks.concat(picks));
    var html = "";
    deck.forEach(function (emoji, i) {
      html +=
        '<button type="button" class="mem-card" data-i="' +
        i +
        '" data-v="' +
        emoji +
        '" aria-label="Memory card">' +
        '<span class="mem-back">?</span>' +
        '<span class="mem-front" aria-hidden="true">' +
        emoji +
        "</span></button>";
    });
    $("#memBoard")
      .css("--mem-cols", pairCount <= 4 ? 4 : 4)
      .html(html);
    $("#memMsg").text("Find the matching pairs!");
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
    var a = first.data("v");
    var b = $card.data("v");
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
    renderRanks();
    start("medium");
    $(".mem-level").on("click", function () {
      $(".mem-level").removeClass("active");
      $(this).addClass("active");
      start($(this).data("level"));
    });
    $("#memRestart").on("click", function () {
      var lvl = $(".mem-level.active").data("level") || "medium";
      start(lvl);
    });
    $("#memBoard").on("click", ".mem-card", function () {
      flip($(this));
    });
  }

  window.MemoryMatch = { init: init, start: start };
})(window, jQuery);
