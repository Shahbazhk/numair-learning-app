(function (window) {
  "use strict";

  var LAP_DIST = 1600;
  var RACER_NAMES = ["Numair", "Sammy", "Blaze"];
  var RACER_COLORS = ["#0277bd", "#e53935", "#43a047"];

  function CarRace(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.w = canvas.width;
    this.h = canvas.height;
    this.keys = { left: false, right: false, accel: false };
    this.running = false;
    this.onFinish = opts && opts.onFinish;
    this.onGameOver = opts && opts.onGameOver;
    this.laneXs = [];
    this.reset();
  }

  CarRace.prototype.reset = function () {
    var roadL = 56;
    var roadR = this.w - 56;
    var laneW = (roadR - roadL) / 3;
    this.roadL = roadL;
    this.roadR = roadR;
    this.laneXs = [
      roadL + laneW * 0.5,
      roadL + laneW * 1.5,
      roadL + laneW * 2.5
    ];
    this.racers = [
      {
        id: 0,
        name: RACER_NAMES[0],
        color: RACER_COLORS[0],
        x: this.laneXs[1] - 18,
        y: this.h - 100,
        w: 36,
        h: 64,
        speed: 0,
        vx: 0,
        progress: 0,
        finished: false,
        finishTime: null,
        place: null,
        isPlayer: true,
        shake: 0
      },
      {
        id: 1,
        name: RACER_NAMES[1],
        color: RACER_COLORS[1],
        x: this.laneXs[0] - 18,
        y: this.h - 150,
        w: 36,
        h: 64,
        speed: 3.2,
        vx: 0,
        progress: 0,
        finished: false,
        finishTime: null,
        place: null,
        isPlayer: false,
        base: 3.4 + Math.random() * 0.6,
        wobble: Math.random() * 10
      },
      {
        id: 2,
        name: RACER_NAMES[2],
        color: RACER_COLORS[2],
        x: this.laneXs[2] - 18,
        y: this.h - 180,
        w: 36,
        h: 64,
        speed: 3.1,
        vx: 0,
        progress: 0,
        finished: false,
        finishTime: null,
        place: null,
        isPlayer: false,
        base: 3.2 + Math.random() * 0.7,
        wobble: Math.random() * 10
      }
    ];
    this.player = this.racers[0];
    this.obstacles = [];
    this.particles = [];
    this.roadOffset = 0;
    this.spawnTimer = 50;
    this.crashed = false;
    this.crashFlash = 0;
    this.running = false;
    this.raceOver = false;
    this.elapsed = 0;
    this._raf = null;
    this.nextPlace = 1;
  };

  CarRace.prototype.setInput = function (key, down) {
    if (key in this.keys) this.keys[key] = !!down;
  };

  CarRace.prototype.start = function () {
    this.reset();
    this.running = true;
    var self = this;
    function loop() {
      self.update();
      self.draw();
      if (self.running || self.crashFlash > 0 || self.raceOver) {
        if (self.crashFlash > 0) self.crashFlash--;
        self._raf = requestAnimationFrame(loop);
      }
    }
    this._raf = requestAnimationFrame(loop);
  };

  CarRace.prototype.stop = function () {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  };

  CarRace.prototype.markFinish = function (racer) {
    if (racer.finished) return;
    racer.finished = true;
    racer.progress = LAP_DIST;
    racer.finishTime = this.elapsed;
    racer.place = this.nextPlace++;
  };

  CarRace.prototype.endRace = function (reason) {
    if (this.raceOver) return;
    this.raceOver = true;
    this.running = false;

    // Anyone not finished gets place by remaining progress
    var unfinished = this.racers.filter(function (r) {
      return !r.finished;
    });
    unfinished.sort(function (a, b) {
      return b.progress - a.progress;
    });
    unfinished.forEach(function (r) {
      if (!r.place) r.place = this.nextPlace++;
    }, this);

    var standings = this.racers.slice().sort(function (a, b) {
      return a.place - b.place;
    });

    if (this.onFinish) {
      this.onFinish({
        reason: reason || "finish",
        standings: standings.map(function (r) {
          return {
            name: r.name,
            place: r.place,
            progress: Math.round((r.progress / LAP_DIST) * 100),
            isPlayer: r.isPlayer,
            crashed: reason === "crash" && r.isPlayer
          };
        }),
        playerPlace: this.player.place
      });
    }
    if (this.onGameOver && reason === "crash") {
      this.onGameOver(Math.floor(this.player.progress));
    }
  };

  CarRace.prototype.triggerCrash = function () {
    this.crashed = true;
    this.crashFlash = 50;
    this.player.shake = 12;
    var cx = this.player.x + this.player.w / 2;
    var cy = this.player.y + this.player.h / 2;
    for (var i = 0; i < 24; i++) {
      var ang = Math.random() * Math.PI * 2;
      var sp = 1 + Math.random() * 4;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 2,
        life: 20 + Math.random() * 18,
        color: i % 2 ? "#ff7043" : "#ffca28"
      });
    }
    // Crash = player finishes last; other racers ranked by progress
    var bots = this.racers
      .filter(function (r) {
        return !r.isPlayer;
      })
      .sort(function (a, b) {
        return b.progress - a.progress;
      });
    this.nextPlace = 1;
    bots.forEach(function (r) {
      r.finished = true;
      r.place = this.nextPlace++;
      r.finishTime = this.elapsed;
    }, this);
    this.player.finished = true;
    this.player.place = this.nextPlace; // last
    this.player.finishTime = this.elapsed;
    this.endRace("crash");
  };

  CarRace.prototype.update = function () {
    if (this.raceOver) {
      this.particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life--;
      });
      this.particles = this.particles.filter(function (p) {
        return p.life > 0;
      });
      return;
    }
    if (!this.running) return;

    this.elapsed++;
    var p = this.player;

    if (this.keys.accel) p.speed = Math.min(10.5, p.speed + 0.14);
    else p.speed = Math.max(2.4, p.speed - 0.06);

    if (this.keys.left) p.vx = Math.max(-5.5, p.vx - 0.55);
    else if (this.keys.right) p.vx = Math.min(5.5, p.vx + 0.55);
    else p.vx *= 0.82;

    p.x += p.vx;
    var minX = this.roadL + 4;
    var maxX = this.roadR - p.w - 4;
    if (p.x < minX) {
      p.x = minX;
      p.vx = 0;
    }
    if (p.x > maxX) {
      p.x = maxX;
      p.vx = 0;
    }

    if (!p.finished) {
      p.progress += p.speed * 0.9;
      if (p.progress >= LAP_DIST) this.markFinish(p);
    }

    // AI racers
    for (var i = 1; i < this.racers.length; i++) {
      var bot = this.racers[i];
      if (bot.finished) continue;
      bot.wobble += 0.04;
      bot.speed = bot.base + Math.sin(bot.wobble) * 0.55 + (Math.random() - 0.5) * 0.15;
      bot.progress += bot.speed * 0.9;
      // visual lane sway
      var target = this.laneXs[i === 1 ? 0 : 2] - 18;
      bot.x += (target - bot.x) * 0.05;
      bot.y = this.h - 140 - i * 28 - Math.min(40, (bot.progress / LAP_DIST) * 40);
      if (bot.progress >= LAP_DIST) this.markFinish(bot);
    }

    this.roadOffset = (this.roadOffset + p.speed * 3.2) % 48;

    // light traffic obstacles near player
    this.spawnTimer--;
    if (this.spawnTimer <= 0) {
      var lane = this.laneXs[Math.floor(Math.random() * 3)];
      this.obstacles.push({
        x: lane - 16,
        y: -70,
        w: 32,
        h: 56,
        vy: 2 + Math.random() * 1.6 + p.speed * 0.25,
        color: "#8e24aa"
      });
      this.spawnTimer = Math.max(28, 60 - p.speed * 2 + Math.random() * 20);
    }

    for (var o = this.obstacles.length - 1; o >= 0; o--) {
      var obs = this.obstacles[o];
      obs.y += obs.vy;
      if (obs.y > this.h + 80) this.obstacles.splice(o, 1);
      else if (!p.finished && this.aabb(p, obs, 5)) {
        this.triggerCrash();
        break;
      }
    }

    // End when everyone finished, or player finished and bots catch up briefly
    var allDone = this.racers.every(function (r) {
      return r.finished;
    });
    if (allDone) this.endRace("finish");
    else if (p.finished) {
      // give bots a short moment then close race
      this._finishWait = (this._finishWait || 0) + 1;
      if (this._finishWait > 90) {
        this.racers.forEach(function (r) {
          if (!r.finished) this.markFinish(r);
        }, this);
        this.endRace("finish");
      }
    }
  };

  CarRace.prototype.aabb = function (a, b, pad) {
    pad = pad || 0;
    return (
      a.x + pad < b.x + b.w - pad &&
      a.x + a.w - pad > b.x + pad &&
      a.y + pad < b.y + b.h - pad &&
      a.y + a.h - pad > b.y + pad
    );
  };

  CarRace.prototype.drawCar = function (x, y, w, h, color, crashed) {
    var ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 2, w * 0.45, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = crashed ? "#b71c1c" : color;
    roundRect(ctx, x + 4, y + 10, w - 8, h - 18, 8);
    ctx.fill();
    ctx.fillStyle = crashed ? "#eceff1" : "#e3f2fd";
    roundRect(ctx, x + 8, y + 16, w - 16, 20, 5);
    ctx.fill();
    ctx.fillStyle = "#fff59d";
    ctx.fillRect(x + 7, y + h - 16, 8, 5);
    ctx.fillRect(x + w - 15, y + h - 16, 8, 5);
    ctx.fillStyle = "#212121";
    ctx.fillRect(x - 1, y + 18, 6, 14);
    ctx.fillRect(x + w - 5, y + 18, 6, 14);
    ctx.fillRect(x - 1, y + h - 28, 6, 14);
    ctx.fillRect(x + w - 5, y + h - 28, 6, 14);
    ctx.restore();
  };

  CarRace.prototype.draw = function () {
    var ctx = this.ctx;
    var w = this.w;
    var h = this.h;
    var sky = ctx.createLinearGradient(0, 0, 0, h * 0.35);
    sky.addColorStop(0, "#81d4fa");
    sky.addColorStop(1, "#e1f5fe");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.38);
    ctx.fillStyle = "#ffe082";
    ctx.beginPath();
    ctx.arc(w - 48, 36, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#66bb6a";
    ctx.fillRect(0, h * 0.38, w, h);
    ctx.fillStyle = "#8d6e63";
    ctx.fillRect(this.roadL - 14, 0, 14, h);
    ctx.fillRect(this.roadR, 0, 14, h);
    var roadGrad = ctx.createLinearGradient(this.roadL, 0, this.roadR, 0);
    roadGrad.addColorStop(0, "#37474f");
    roadGrad.addColorStop(0.5, "#455a64");
    roadGrad.addColorStop(1, "#37474f");
    ctx.fillStyle = roadGrad;
    ctx.fillRect(this.roadL, 0, this.roadR - this.roadL, h);

    // finish banner near top when close
    var playerPct = this.player.progress / LAP_DIST;
    if (playerPct > 0.85) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(this.roadL, 40, this.roadR - this.roadL, 14);
      ctx.fillStyle = "#c62828";
      ctx.font = "bold 12px Nunito,sans-serif";
      ctx.fillText("FINISH", this.w / 2 - 22, 52);
    }

    ctx.strokeStyle = "#fff9c4";
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 22]);
    ctx.lineDashOffset = -this.roadOffset;
    var mid1 = (this.laneXs[0] + this.laneXs[1]) / 2;
    var mid2 = (this.laneXs[1] + this.laneXs[2]) / 2;
    ctx.beginPath();
    ctx.moveTo(mid1, 0);
    ctx.lineTo(mid1, h);
    ctx.moveTo(mid2, 0);
    ctx.lineTo(mid2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    var self = this;
    this.obstacles.forEach(function (o) {
      self.drawCar(o.x, o.y, o.w, o.h, o.color, false);
    });

    // draw bots then player
    this.racers
      .slice()
      .sort(function (a, b) {
        return a.y - b.y;
      })
      .forEach(function (r) {
        var px = r.x;
        var py = r.isPlayer ? r.y : r.y;
        if (r.isPlayer && r.shake > 0) {
          px += (Math.random() - 0.5) * r.shake;
          py += (Math.random() - 0.5) * r.shake;
          r.shake *= 0.9;
        }
        self.drawCar(px, py, r.w, r.h, r.color, self.crashed && r.isPlayer);
      });

    this.particles.forEach(function (pt) {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // HUD lap + places
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    roundRect(ctx, 8, 8, 150, 70, 10);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Nunito, sans-serif";
    ctx.fillText("Lap " + Math.min(100, Math.floor(playerPct * 100)) + "%", 18, 28);
    ctx.fillText("Speed " + Math.round(this.player.speed * 18) + " km/h", 18, 48);
    var live = this.racers
      .slice()
      .sort(function (a, b) {
        return b.progress - a.progress;
      });
    ctx.fillText("P" + (live.findIndex(function (r) { return r.isPlayer; }) + 1) + " now", 18, 68);

    // mini standings
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    roundRect(ctx, w - 118, 8, 108, 64, 10);
    ctx.fill();
    ctx.font = "bold 11px Nunito,sans-serif";
    live.forEach(function (r, i) {
      ctx.fillStyle = r.color;
      ctx.fillText(i + 1 + ". " + r.name.slice(0, 7), w - 108, 26 + i * 16);
    });

    if (this.raceOver) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px Fredoka, sans-serif";
      ctx.textAlign = "center";
      var title = this.crashed ? "Crash! Race Over" : "Lap Finished!";
      ctx.fillText(title, w / 2, h / 2 - 50);
      var order = this.racers.slice().sort(function (a, b) {
        return a.place - b.place;
      });
      var medals = ["🥇 1st", "🥈 2nd", "🥉 3rd"];
      order.forEach(function (r, i) {
        ctx.font = "bold 16px Nunito,sans-serif";
        ctx.fillStyle = r.isPlayer ? "#ffeb3b" : "#fff";
        ctx.fillText(medals[i] + "  " + r.name, w / 2, h / 2 - 10 + i * 26);
      });
      ctx.textAlign = "left";
    }
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

  window.CarRace = CarRace;
})(window);
