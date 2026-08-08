(function (window, $) {
  "use strict";

  var difficulty = "easy";
  var saveChance = { easy: 0.28, medium: 0.52, hard: 0.78 };
  var reactionMs = { easy: 420, medium: 280, hard: 160 };
  var selectedZone = null;
  var goals = 0;
  var shots = 0;
  var maxShots = 5;
  var busy = false;
  var canvas, ctx, w, h;
  var anim = null;

  function zoneCenters() {
    // 3x3 inside goal mouth
    var goalX = w * 0.18;
    var goalY = h * 0.12;
    var goalW = w * 0.64;
    var goalH = h * 0.38;
    var centers = [];
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        centers.push({
          x: goalX + (c + 0.5) * (goalW / 3),
          y: goalY + (r + 0.5) * (goalH / 3),
          r: r,
          c: c
        });
      }
    }
    return centers;
  }

  function zoneLabel(i) {
    var rows = ["High", "Mid", "Low"];
    var cols = ["Left", "Centre", "Right"];
    return rows[Math.floor(i / 3)] + " " + cols[i % 3];
  }

  function resetRound() {
    goals = 0;
    shots = 0;
    selectedZone = null;
    busy = false;
    $("#fbScore").text("Goals: 0 / Shots: 0");
    $("#fbMsg").text("Tap a corner of the goal, then Shoot!");
    $(".goal-zone").removeClass("selected");
    cancelAnim();
    drawScene();
  }

  function cancelAnim() {
    if (anim) {
      cancelAnimationFrame(anim);
      anim = null;
    }
  }

  function drawScene(state) {
    state = state || {};
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    // pitch
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#43a047");
    g.addColorStop(1, "#2e7d32");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // mowing stripes
    for (var i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
      ctx.fillRect(0, (h / 8) * i, w, h / 8);
    }

    // penalty arc hint
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.92, w * 0.28, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // goal frame
    var gx = w * 0.18;
    var gy = h * 0.12;
    var gw = w * 0.64;
    var gh = h * 0.38;

    // net
    ctx.fillStyle = "rgba(236, 239, 241, 0.35)";
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    for (var nx = 0; nx <= 8; nx++) {
      ctx.beginPath();
      ctx.moveTo(gx + (gw / 8) * nx, gy);
      ctx.lineTo(gx + (gw / 8) * nx, gy + gh);
      ctx.stroke();
    }
    for (var ny = 0; ny <= 5; ny++) {
      ctx.beginPath();
      ctx.moveTo(gx, gy + (gh / 5) * ny);
      ctx.lineTo(gx + gw, gy + (gh / 5) * ny);
      ctx.stroke();
    }

    // posts
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(gx - 6, gy - 6, 6, gh + 12);
    ctx.fillRect(gx + gw, gy - 6, 6, gh + 12);
    ctx.fillRect(gx - 6, gy - 8, gw + 12, 8);

    // zone highlights
    var centers = zoneCenters();
    centers.forEach(function (z, idx) {
      var zw = gw / 3 - 8;
      var zh = gh / 3 - 8;
      var zx = gx + (idx % 3) * (gw / 3) + 4;
      var zy = gy + Math.floor(idx / 3) * (gh / 3) + 4;
      ctx.strokeStyle = selectedZone === idx ? "#ffee58" : "rgba(255,255,255,0.45)";
      ctx.lineWidth = selectedZone === idx ? 3 : 1.5;
      ctx.setLineDash(selectedZone === idx ? [] : [6, 4]);
      ctx.strokeRect(zx, zy, zw, zh);
      ctx.setLineDash([]);
      if (selectedZone === idx) {
        ctx.fillStyle = "rgba(255, 238, 88, 0.22)";
        ctx.fillRect(zx, zy, zw, zh);
      }
    });

    // keeper
    var kx = state.keeperX != null ? state.keeperX : w / 2;
    var ky = state.keeperY != null ? state.keeperY : gy + gh * 0.55;
    drawKeeper(kx, ky, state.keeperPose || "idle");

    // ball
    var bx = state.ballX != null ? state.ballX : w / 2;
    var by = state.ballY != null ? state.ballY : h * 0.82;
    var br = state.ballR != null ? state.ballR : 12;
    drawBall(bx, by, br);
  }

  function drawKeeper(x, y, pose) {
    ctx.save();
    ctx.translate(x, y);
    if (pose === "left") ctx.rotate(-0.35);
    if (pose === "right") ctx.rotate(0.35);

    // body
    ctx.fillStyle = "#1565c0";
    roundRect(ctx, -14, -18, 28, 36, 8);
    ctx.fill();
    // head
    ctx.fillStyle = "#ffcc80";
    ctx.beginPath();
    ctx.arc(0, -28, 10, 0, Math.PI * 2);
    ctx.fill();
    // gloves
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-20, -4, 7, 0, Math.PI * 2);
    ctx.arc(20, -4, 7, 0, Math.PI * 2);
    ctx.fill();
    // legs
    ctx.fillStyle = "#0d47a1";
    ctx.fillRect(-12, 16, 9, 18);
    ctx.fillRect(3, 16, 9, 18);
    ctx.restore();
  }

  function drawBall(x, y, r) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.9, r * 0.8, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#212121";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function roundRect(ctx, x, y, rw, rh, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + rw, y, x + rw, y + rh, r);
    ctx.arcTo(x + rw, y + rh, x, y + rh, r);
    ctx.arcTo(x, y + rh, x, y, r);
    ctx.arcTo(x, y, x + rw, y, r);
    ctx.closePath();
  }

  function shoot() {
    if (busy) return;
    if (selectedZone === null) {
      NumairApp.celebrate("Choose a spot on the goal first!");
      return;
    }
    if (shots >= maxShots) return;
    busy = true;

    var centers = zoneCenters();
    var target = centers[selectedZone];
    var startX = w / 2;
    var startY = h * 0.82;

    // Keeper aims near selected zone based on difficulty
    var aim = selectedZone;
    if (Math.random() > saveChance[difficulty] + 0.15) {
      aim = Math.floor(Math.random() * 9);
    }
    // easy: often wrong side
    if (difficulty === "easy" && Math.random() < 0.55) {
      aim = (selectedZone + 3 + Math.floor(Math.random() * 5)) % 9;
    }
    var keeperTarget = centers[aim];
    var pose = keeperTarget.c === 0 ? "left" : keeperTarget.c === 2 ? "right" : "idle";

    var duration = 520;
    var start = performance.now();
    var saved = false;

    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var ease = 1 - Math.pow(1 - t, 3);
      var ballX = startX + (target.x - startX) * ease;
      var ballY = startY + (target.y - startY) * ease - Math.sin(Math.PI * t) * 50;
      var ballR = 12 - 4 * ease;

      var diveT = Math.max(0, (now - start - reactionMs[difficulty]) / (duration - reactionMs[difficulty]));
      diveT = Math.min(1, Math.max(0, diveT));
      var kx = w / 2 + (keeperTarget.x - w / 2) * diveT;
      var ky = h * 0.12 + h * 0.38 * 0.55 + (keeperTarget.y - (h * 0.12 + h * 0.38 * 0.55)) * diveT * 0.6;

      drawScene({
        ballX: ballX,
        ballY: ballY,
        ballR: ballR,
        keeperX: kx,
        keeperY: ky,
        keeperPose: pose
      });

      if (t < 1) {
        anim = requestAnimationFrame(frame);
      } else {
        // decide save: if keeper landed close to ball zone
        var dist = Math.abs(aim - selectedZone);
        var base = saveChance[difficulty];
        if (aim === selectedZone) saved = Math.random() < base + 0.2;
        else if (dist === 1) saved = Math.random() < base * 0.55;
        else saved = Math.random() < base * 0.2;
        if (difficulty === "hard" && aim === selectedZone) saved = true;
        if (difficulty === "easy" && dist >= 4) saved = false;

        shots++;
        if (saved) {
          $("#fbMsg").text("Brilliant save! 🧤");
          NumairApp.buzz();
        } else {
          goals++;
          $("#fbMsg").text("GOOOAL!!! ⚽");
          NumairApp.celebrate("GOOOAL!");
        }
        $("#fbScore").text("Goals: " + goals + " / Shots: " + shots);
        selectedZone = null;
        $(".goal-zone").removeClass("selected");
        busy = false;
        setTimeout(function () {
          drawScene();
          if (shots >= maxShots) endRound();
        }, 700);
      }
    }
    anim = requestAnimationFrame(frame);
  }

  function endRound() {
    var list = NumairApp.saveRanking("football." + difficulty, {
      name: NumairApp.getNickname(),
      score: goals
    });
    renderRankings(list);
    $("#fbMsg").text("Round over! Goals: " + goals + "/" + maxShots);
    if (goals >= 3) NumairApp.addStars(2, "football-" + difficulty + "-round");
    else if (goals >= 1) NumairApp.addStars(1, "football-" + difficulty + "-try");
  }

  function renderRankings(list) {
    var html = "";
    (list || NumairApp.getRankings("football." + difficulty)).forEach(function (r, i) {
      html += "<li><span>#" + (i + 1) + " " + r.name + "</span><span>" + r.score + " goals</span></li>";
    });
    $("#fbRanks").html(html || "<li>No scores yet — be the first!</li>");
  }

  function init() {
    canvas = document.getElementById("fbCanvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    var g = "";
    for (var i = 0; i < 9; i++) {
      g += '<button type="button" class="goal-zone" data-z="' + i + '">' + zoneLabel(i) + "</button>";
    }
    $("#goalGrid").html(g);
    resetRound();
    renderRankings();

    $("#goalGrid").on("click", ".goal-zone", function () {
      if (busy) return;
      selectedZone = Number($(this).data("z"));
      $(".goal-zone").removeClass("selected");
      $(this).addClass("selected");
      drawScene();
    });

    canvas.addEventListener("click", function (e) {
      if (busy) return;
      var rect = canvas.getBoundingClientRect();
      var mx = ((e.clientX - rect.left) / rect.width) * w;
      var my = ((e.clientY - rect.top) / rect.height) * h;
      var gx = w * 0.18;
      var gy = h * 0.12;
      var gw = w * 0.64;
      var gh = h * 0.38;
      if (mx < gx || mx > gx + gw || my < gy || my > gy + gh) return;
      var c = Math.min(2, Math.floor(((mx - gx) / gw) * 3));
      var r = Math.min(2, Math.floor(((my - gy) / gh) * 3));
      selectedZone = r * 3 + c;
      $(".goal-zone").removeClass("selected");
      $('.goal-zone[data-z="' + selectedZone + '"]').addClass("selected");
      drawScene();
    });

    $(".level-btn").on("click", function () {
      difficulty = $(this).data("level");
      $(".level-btn").removeClass("active");
      $(this).addClass("active");
      resetRound();
      renderRankings();
    });

    $("#btnShoot").on("click", shoot);
    $("#btnFbRestart").on("click", resetRound);
  }

  window.FootballGame = { init: init, resetRound: resetRound };
})(window, jQuery);
