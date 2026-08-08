(function (window, $) {
  "use strict";

  var COLORS = ["#ef5350", "#42a5f5", "#66bb6a", "#ffca28"];
  var LABELS = ["Red", "Blue", "Green", "Yellow"];
  var sequence = [];
  var playerStep = 0;
  var playingBack = false;
  var round = 0;
  var best = 0;
  var difficulty = "medium";

  function speedMs() {
    if (difficulty === "easy") return 700;
    if (difficulty === "hard") return 380;
    return 520;
  }

  function updateHud() {
    $("#seqRound").text("Round: " + round);
    $("#seqBest").text("Best: " + best);
  }

  function renderRanks(list) {
    var html = "";
    (list || NumairApp.getRankings("patternSeq")).forEach(function (r, i) {
      html += "<li><span>#" + (i + 1) + " " + r.name + "</span><span>" + r.score + "</span></li>";
    });
    $("#seqRanks").html(html || "<li>No scores yet</li>");
  }

  function lightPad(i, on) {
    var $p = $('.seq-pad[data-i="' + i + '"]');
    $p.toggleClass("lit", !!on);
  }

  function playSequence() {
    playingBack = true;
    $("#seqMsg").text("Watch carefully…");
    $(".seq-pad").prop("disabled", true);
    var i = 0;
    var gap = speedMs();

    function step() {
      if (i >= sequence.length) {
        playingBack = false;
        $(".seq-pad").prop("disabled", false);
        playerStep = 0;
        $("#seqMsg").text("Your turn — tap the same order!");
        return;
      }
      var idx = sequence[i];
      lightPad(idx, true);
      setTimeout(function () {
        lightPad(idx, false);
        i++;
        setTimeout(step, 160);
      }, gap);
    }
    setTimeout(step, 350);
  }

  function nextRound() {
    sequence.push(Math.floor(Math.random() * 4));
    round = sequence.length;
    updateHud();
    playSequence();
  }

  function gameOver() {
    playingBack = true;
    $(".seq-pad").prop("disabled", true);
    $("#seqMsg").text("Oops! Pattern broke at round " + round);
    var score = Math.max(0, round - 1);
    if (score > best) best = score;
    updateHud();
    var list = NumairApp.saveRanking("patternSeq", {
      name: NumairApp.getNickname(),
      score: score
    });
    renderRanks(list);
    if (score >= 3) NumairApp.addStars(2, "pattern-best-" + score);
    else if (score >= 1) NumairApp.addStars(1, "pattern-try-" + score);
    NumairApp.buzz();
  }

  function onPad(i) {
    if (playingBack || !sequence.length) return;
    lightPad(i, true);
    setTimeout(function () {
      lightPad(i, false);
    }, 180);

    if (sequence[playerStep] !== i) {
      gameOver();
      return;
    }
    playerStep++;
    if (playerStep >= sequence.length) {
      $("#seqMsg").text("Yes! Next pattern…");
      NumairApp.celebrate("Correct!");
      setTimeout(nextRound, 550);
    }
  }

  function start() {
    sequence = [];
    playerStep = 0;
    round = 0;
    playingBack = false;
    updateHud();
    $("#seqMsg").text("Get ready…");
    $(".seq-pad").prop("disabled", true);
    setTimeout(nextRound, 400);
  }

  function init() {
    var html = "";
    COLORS.forEach(function (c, i) {
      html +=
        '<button type="button" class="seq-pad" data-i="' +
        i +
        '" style="--pad:' +
        c +
        '" aria-label="' +
        LABELS[i] +
        '"></button>';
    });
    $("#seqBoard").html(html);
    renderRanks();
    updateHud();
    $("#seqMsg").text("Tap Start, watch the lights, then repeat!");

    $("#seqBoard").on("click", ".seq-pad", function () {
      onPad(Number($(this).data("i")));
    });
    $(".seq-level").on("click", function () {
      difficulty = $(this).data("level");
      $(".seq-level").removeClass("active");
      $(this).addClass("active");
    });
    $("#seqStart").on("click", start);
  }

  window.PatternSeq = { init: init, start: start };
})(window, jQuery);
