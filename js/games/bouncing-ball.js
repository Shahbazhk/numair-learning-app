(function (window) {
  "use strict";

  /**
   * Bouncing Ball — steer a red ball over bumpy terrain.
   * Collect coins & diamonds. Fall into a pit or water = game over.
   */
  function BouncingBallGame(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.w = canvas.width;
    this.h = canvas.height;
    this.onOver = opts && opts.onGameOver;
    this.keys = { left: false, right: false, jump: false };
    this.running = false;
    this._raf = null;
    this.reset();
  }

  BouncingBallGame.prototype.reset = function () {
    this.camX = 0;
    this.score = 0;
    this.coins = 0;
    this.diamonds = 0;
    this.distance = 0;
    this.over = false;
    this.running = false;
    this.reason = "";
    this.ball = {
      r: 14,
      x: 80,
      y: 120,
      vx: 0,
      vy: 0,
      onGround: false
    };
    this.segments = [];
    this.pickups = [];
    this.genCursor = 0;
    this._jumpLatch = false;
    this.seedTerrain(28);
  };

  BouncingBallGame.prototype.setInput = function (key, down) {
    if (key in this.keys) this.keys[key] = !!down;
  };

  /** type: land | slope | pit | water */
  BouncingBallGame.prototype.seedTerrain = function (count) {
    var x = 0;
    // Safe start runway
    this.segments.push({ x: 0, w: 220, top: this.h - 90, type: "land" });
    x = 220;
    for (var i = 0; i < count; i++) {
      x = this.addChunk(x, i);
    }
    this.genCursor = x;
  };

  BouncingBallGame.prototype.addChunk = function (x, i) {
    var roll = Math.random();
    var hard = Math.min(0.55, 0.12 + i * 0.018);
    var w;
    var top;
    var type;

    if (roll < hard * 0.45) {
      // Pit
      w = 48 + Math.random() * 42;
      this.segments.push({ x: x, w: w, top: this.h + 40, type: "pit" });
      x += w;
    } else if (roll < hard) {
      // Water
      w = 70 + Math.random() * 55;
      this.segments.push({ x: x, w: w, top: this.h - 52, type: "water" });
      this.maybePickup(x, w, this.h - 120, i);
      x += w;
    } else if (roll < hard + 0.25) {
      // Bumpy high/low land
      w = 70 + Math.random() * 90;
      top = this.h - (70 + Math.random() * 90);
      type = Math.random() < 0.4 ? "slope" : "land";
      this.segments.push({ x: x, w: w, top: top, type: type });
      this.maybePickup(x, w, top - 28, i);
      x += w;
    } else {
      w = 90 + Math.random() * 100;
      top = this.h - (85 + Math.random() * 35);
      this.segments.push({ x: x, w: w, top: top, type: "land" });
      this.maybePickup(x, w, top - 28, i);
      x += w;
    }
    return x;
  };

  BouncingBallGame.prototype.maybePickup = function (x, w, y, i) {
    if (Math.random() > 0.62) return;
    var count = 1 + (Math.random() < 0.35 ? 1 : 0);
    for (var n = 0; n < count; n++) {
      var kind = Math.random() < 0.78 ? "coin" : "diamond";
      this.pickups.push({
        kind: kind,
        x: x + 20 + Math.random() * Math.max(20, w - 40),
        y: y - Math.random() * 35,
        r: kind === "diamond" ? 11 : 9,
        taken: false,
        value: kind === "diamond" ? 25 : 10
      });
    }
    // Extra diamond on harder stretches
    if (i > 8 && Math.random() < 0.2) {
      this.pickups.push({
        kind: "diamond",
        x: x + w * 0.5,
        y: y - 50,
        r: 11,
        taken: false,
        value: 25
      });
    }
  };

  BouncingBallGame.prototype.extendWorld = function () {
    while (this.genCursor < this.camX + this.w + 400) {
      var i = this.segments.length;
      this.genCursor = this.addChunk(this.genCursor, i);
    }
  };

  BouncingBallGame.prototype.groundAt = function (wx) {
    for (var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      if (wx >= s.x && wx < s.x + s.w) {
        var top = s.top;
        if (s.type === "slope") {
          var t = (wx - s.x) / s.w;
          top = s.top + (t - 0.5) * 28;
        }
        return { top: top, type: s.type, seg: s };
      }
    }
    return { top: this.h + 80, type: "pit", seg: null };
  };

  BouncingBallGame.prototype.start = function () {
    this.reset();
    this.running = true;
    var self = this;
    function loop() {
      self.update();
      self.draw();
      if (self.running || self.over) self._raf = requestAnimationFrame(loop);
    }
    this._raf = requestAnimationFrame(loop);
  };

  BouncingBallGame.prototype.stop = function () {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  };

  BouncingBallGame.prototype.gameOver = function (reason) {
    if (this.over) return;
    this.over = true;
    this.running = false;
    this.reason = reason || "fall";
    if (this.onOver) {
      this.onOver({
        score: this.score,
        coins: this.coins,
        diamonds: this.diamonds,
        distance: Math.floor(this.distance / 10),
        reason: this.reason
      });
    }
  };

  BouncingBallGame.prototype.update = function () {
    if (!this.running || this.over) return;
    var b = this.ball;
    var speed = 3.1 + Math.min(2.4, this.distance / 2500);

    // Steer
    if (this.keys.left) b.vx = Math.max(-4.2, b.vx - 0.45);
    else if (this.keys.right) b.vx = Math.min(4.8, b.vx + 0.5);
    else b.vx *= 0.9;

    // Auto forward drift for adventure feel
    b.vx += 0.08;
    if (b.vx > speed) b.vx = speed;
    if (b.vx < -2.5) b.vx = -2.5;

    // Jump / higher bounce when on ground
    if (this.keys.jump && b.onGround && !this._jumpLatch) {
      b.vy = -9.2;
      b.onGround = false;
      this._jumpLatch = true;
    }
    if (!this.keys.jump) this._jumpLatch = false;

    b.vy += 0.38; // gravity
    if (b.vy > 12) b.vy = 12;

    b.x += b.vx;
    b.y += b.vy;

    this.extendWorld();

    var g = this.groundAt(b.x);
    var feet = b.y + b.r;

    // Hazard: water surface or pit void
    if (g.type === "pit") {
      if (b.y > this.h - 20) this.gameOver("pit");
    } else if (g.type === "water") {
      if (feet >= g.top + 6) this.gameOver("water");
    } else {
      // Land / slope bounce
      if (feet >= g.top && b.vy >= 0 && b.y < g.top + 24) {
        b.y = g.top - b.r;
        // Bounce!
        var bounce = Math.min(-5.5, -Math.abs(b.vy) * 0.72 - 1.2);
        if (this.keys.jump) bounce -= 1.5;
        b.vy = bounce;
        b.onGround = true;
      } else {
        b.onGround = false;
      }
    }

    // Fell off bottom
    if (b.y - b.r > this.h + 10) {
      this.gameOver(g.type === "water" ? "water" : "pit");
      return;
    }

    // Camera follows
    var targetCam = b.x - 90;
    if (targetCam > this.camX) this.camX += (targetCam - this.camX) * 0.12;
    if (this.camX < 0) this.camX = 0;

    this.distance = Math.max(this.distance, b.x);

    // Collect pickups
    for (var i = 0; i < this.pickups.length; i++) {
      var p = this.pickups[i];
      if (p.taken) continue;
      var dx = b.x - p.x;
      var dy = b.y - p.y;
      if (dx * dx + dy * dy < (b.r + p.r) * (b.r + p.r)) {
        p.taken = true;
        this.score += p.value;
        if (p.kind === "coin") this.coins++;
        else this.diamonds++;
      }
    }

    // Distance points trickle
    if (Math.floor(b.x / 80) > Math.floor((b.x - b.vx) / 80)) {
      this.score += 1;
    }
  };

  BouncingBallGame.prototype.draw = function () {
    var ctx = this.ctx;
    var w = this.w;
    var h = this.h;
    var cam = this.camX;

    // Sky
    var sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#81d4fa");
    sky.addColorStop(0.55, "#e1f5fe");
    sky.addColorStop(1, "#fff9c4");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (var c = 0; c < 5; c++) {
      var cx = ((c * 160 - cam * 0.3) % (w + 120)) + 40;
      ctx.beginPath();
      ctx.ellipse(cx, 40 + (c % 3) * 18, 28, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 20, 44 + (c % 3) * 18, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Terrain segments
    for (var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      if (s.x + s.w < cam - 20 || s.x > cam + w + 20) continue;
      var sx = s.x - cam;

      if (s.type === "pit") {
        ctx.fillStyle = "#3e2723";
        ctx.fillRect(sx, h - 36, s.w, 36);
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(sx + 4, h - 28, s.w - 8, 28);
        // Cracks
        ctx.strokeStyle = "#5d4037";
        ctx.beginPath();
        ctx.moveTo(sx + 8, h - 20);
        ctx.lineTo(sx + s.w / 2, h - 8);
        ctx.lineTo(sx + s.w - 8, h - 22);
        ctx.stroke();
      } else if (s.type === "water") {
        var waterTop = s.top;
        ctx.fillStyle = "#29b6f6";
        ctx.fillRect(sx, waterTop, s.w, h - waterTop);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        var wave = Math.sin(Date.now() / 200 + s.x) * 3;
        ctx.beginPath();
        ctx.moveTo(sx, waterTop);
        for (var wx = 0; wx <= s.w; wx += 10) {
          ctx.lineTo(sx + wx, waterTop + Math.sin(wx / 10 + Date.now() / 180) * 3 + wave);
        }
        ctx.lineTo(sx + s.w, h);
        ctx.lineTo(sx, h);
        ctx.closePath();
        ctx.fill();
        // Danger buoy
        ctx.fillStyle = "#ffeb3b";
        ctx.fillRect(sx + s.w / 2 - 4, waterTop - 18, 8, 18);
        ctx.fillStyle = "#e53935";
        ctx.beginPath();
        ctx.arc(sx + s.w / 2, waterTop - 22, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        var top = s.top;
        ctx.fillStyle = s.type === "slope" ? "#8d6e63" : "#66bb6a";
        ctx.beginPath();
        ctx.moveTo(sx, h);
        ctx.lineTo(sx, top + (s.type === "slope" ? -14 : 0));
        if (s.type === "slope") {
          ctx.lineTo(sx + s.w * 0.5, top + 14);
          ctx.lineTo(sx + s.w, top - 14);
        } else {
          ctx.lineTo(sx + s.w, top);
        }
        ctx.lineTo(sx + s.w, h);
        ctx.closePath();
        ctx.fill();
        // Grass cap
        ctx.fillStyle = "#43a047";
        ctx.fillRect(sx, top - 6, s.w, 8);
        if (s.type === "slope") {
          ctx.fillStyle = "#6d4c41";
          ctx.fillRect(sx, top + 8, s.w, 10);
        }
      }
    }

    // Pickups
    for (var p = 0; p < this.pickups.length; p++) {
      var pk = this.pickups[p];
      if (pk.taken) continue;
      var px = pk.x - cam;
      if (px < -20 || px > w + 20) continue;
      var bob = Math.sin(Date.now() / 200 + pk.x) * 3;
      if (pk.kind === "coin") {
        ctx.fillStyle = "#ffc107";
        ctx.beginPath();
        ctx.arc(px, pk.y + bob, pk.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff8f00";
        ctx.beginPath();
        ctx.arc(px, pk.y + bob, pk.r - 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff59d";
        ctx.font = "bold 10px Nunito,sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("$", px, pk.y + bob + 3);
        ctx.textAlign = "left";
      } else {
        ctx.save();
        ctx.translate(px, pk.y + bob);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "#40c4ff";
        ctx.fillRect(-pk.r * 0.7, -pk.r * 0.7, pk.r * 1.4, pk.r * 1.4);
        ctx.fillStyle = "#e1f5fe";
        ctx.fillRect(-pk.r * 0.35, -pk.r * 0.35, pk.r * 0.5, pk.r * 0.5);
        ctx.restore();
      }
    }

    // Ball
    var bx = this.ball.x - cam;
    var by = this.ball.y;
    var br = this.ball.r;
    var shadowY = this.groundAt(this.ball.x).top;
    if (shadowY < h) {
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(bx, Math.min(h - 8, shadowY - 2), br * 0.7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    var grad = ctx.createRadialGradient(bx - 4, by - 5, 2, bx, by, br);
    grad.addColorStop(0, "#ff8a80");
    grad.addColorStop(0.5, "#e53935");
    grad.addColorStop(1, "#b71c1c");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(bx - 4, by - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // HUD
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    roundRect(ctx, 8, 8, 150, 58, 10);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Nunito,sans-serif";
    ctx.fillText("Score " + this.score, 18, 28);
    ctx.fillText("🪙 " + this.coins + "   💎 " + this.diamonds, 18, 48);

    if (!this.running && !this.over) {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "bold 20px Fredoka,sans-serif";
      ctx.fillText("Bouncing Ball", w / 2, h / 2 - 16);
      ctx.font = "bold 14px Nunito,sans-serif";
      ctx.fillText("Press Start!", w / 2, h / 2 + 14);
      ctx.textAlign = "left";
    }

    if (this.over) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "bold 22px Fredoka,sans-serif";
      var msg =
        this.reason === "water" ? "Splash! Into the water!" : "Oh no! Into the pit!";
      ctx.fillText(msg, w / 2, h / 2 - 28);
      ctx.font = "bold 16px Nunito,sans-serif";
      ctx.fillText("Score: " + this.score, w / 2, h / 2 + 4);
      ctx.fillText("🪙 " + this.coins + "  💎 " + this.diamonds, w / 2, h / 2 + 28);
      ctx.textAlign = "left";
    }
  };

  BouncingBallGame.prototype.drawIdle = function () {
    this.running = false;
    this.over = false;
    this.draw();
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  window.BouncingBallGame = BouncingBallGame;
})(window);
