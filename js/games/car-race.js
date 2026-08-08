(function (window) {
  "use strict";

  function CarRace(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.w = canvas.width;
    this.h = canvas.height;
    this.keys = { left: false, right: false, accel: false };
    this.running = false;
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
    this.player = {
      x: this.laneXs[1] - 18,
      y: this.h - 100,
      w: 36,
      h: 64,
      speed: 0,
      vx: 0,
      shake: 0
    };
    this.obstacles = [];
    this.particles = [];
    this.roadOffset = 0;
    this.distance = 0;
    this.spawnTimer = 45;
    this.crashed = false;
    this.crashFlash = 0;
    this.running = false;
    this._raf = null;
    this.skyScroll = 0;
  };

  CarRace.prototype.setInput = function (key, down) {
    if (key in this.keys) this.keys[key] = !!down;
  };

  CarRace.prototype.start = function () {
    this.reset();
    this.running = true;
    var self = this;
    function loop(t) {
      self.update();
      self.draw();
      if (self.running || self.crashFlash > 0) {
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

  CarRace.prototype.update = function () {
    if (this.crashed) {
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

    var p = this.player;
    var maxSpeed = 11;
    if (this.keys.accel) p.speed = Math.min(maxSpeed, p.speed + 0.14);
    else p.speed = Math.max(2.2, p.speed - 0.06);

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

    this.roadOffset = (this.roadOffset + p.speed * 3.2) % 48;
    this.skyScroll = (this.skyScroll + p.speed * 0.15) % this.w;
    this.distance += p.speed * 0.45;

    this.spawnTimer--;
    if (this.spawnTimer <= 0) {
      var lane = this.laneXs[Math.floor(Math.random() * 3)];
      var colors = ["#e53935", "#fb8c00", "#8e24aa", "#43a047", "#fdd835"];
      this.obstacles.push({
        x: lane - 18,
        y: -80,
        w: 36,
        h: 64,
        vy: 2.2 + Math.random() * 1.8 + p.speed * 0.28,
        color: colors[Math.floor(Math.random() * colors.length)],
        wheelPhase: Math.random() * Math.PI
      });
      this.spawnTimer = Math.max(22, 55 - p.speed * 2.5 + Math.random() * 18);
    }

    for (var i = this.obstacles.length - 1; i >= 0; i--) {
      var o = this.obstacles[i];
      o.y += o.vy;
      o.wheelPhase += 0.3;
      if (o.y > this.h + 90) this.obstacles.splice(i, 1);
      else if (this.aabb(p, o, 4)) {
        this.triggerCrash();
        break;
      }
    }
  };

  CarRace.prototype.triggerCrash = function () {
    this.crashed = true;
    this.running = false;
    this.crashFlash = 90;
    this.player.shake = 12;
    var cx = this.player.x + this.player.w / 2;
    var cy = this.player.y + this.player.h / 2;
    for (var i = 0; i < 28; i++) {
      var ang = Math.random() * Math.PI * 2;
      var sp = 1 + Math.random() * 4;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 2,
        life: 25 + Math.random() * 20,
        color: i % 2 ? "#ff7043" : "#ffca28"
      });
    }
    var score = Math.floor(this.distance + this.player.speed * 12);
    if (this.onGameOver) this.onGameOver(score);
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
    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 2, w * 0.45, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.fillStyle = crashed ? "#b71c1c" : color;
    roundRect(ctx, x + 4, y + 10, w - 8, h - 18, 8);
    ctx.fill();

    // cabin
    ctx.fillStyle = crashed ? "#eceff1" : "#e3f2fd";
    roundRect(ctx, x + 8, y + 16, w - 16, 20, 5);
    ctx.fill();

    // hood line
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 40);
    ctx.lineTo(x + w - 6, y + 40);
    ctx.stroke();

    // headlights
    ctx.fillStyle = "#fff59d";
    ctx.fillRect(x + 7, y + h - 16, 8, 5);
    ctx.fillRect(x + w - 15, y + h - 16, 8, 5);

    // wheels
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

    // sky
    var sky = ctx.createLinearGradient(0, 0, 0, h * 0.35);
    sky.addColorStop(0, "#81d4fa");
    sky.addColorStop(1, "#e1f5fe");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.38);

    // sun
    ctx.fillStyle = "#ffe082";
    ctx.beginPath();
    ctx.arc(w - 48, 36, 18, 0, Math.PI * 2);
    ctx.fill();

    // hills
    ctx.fillStyle = "#a5d6a7";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.38);
    ctx.quadraticCurveTo(w * 0.25, h * 0.28, w * 0.5, h * 0.36);
    ctx.quadraticCurveTo(w * 0.75, h * 0.42, w, h * 0.34);
    ctx.lineTo(w, h * 0.42);
    ctx.lineTo(0, h * 0.42);
    ctx.fill();

    // grass
    ctx.fillStyle = "#66bb6a";
    ctx.fillRect(0, h * 0.38, w, h);

    // roadside
    ctx.fillStyle = "#8d6e63";
    ctx.fillRect(this.roadL - 14, 0, 14, h);
    ctx.fillRect(this.roadR, 0, 14, h);

    // road
    var roadGrad = ctx.createLinearGradient(this.roadL, 0, this.roadR, 0);
    roadGrad.addColorStop(0, "#37474f");
    roadGrad.addColorStop(0.5, "#455a64");
    roadGrad.addColorStop(1, "#37474f");
    ctx.fillStyle = roadGrad;
    ctx.fillRect(this.roadL, 0, this.roadR - this.roadL, h);

    // lane dashes
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

    // edge lines
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.roadL + 2, 0);
    ctx.lineTo(this.roadL + 2, h);
    ctx.moveTo(this.roadR - 2, 0);
    ctx.lineTo(this.roadR - 2, h);
    ctx.stroke();

    var self = this;
    this.obstacles.forEach(function (o) {
      self.drawCar(o.x, o.y, o.w, o.h, o.color, false);
    });

    var px = this.player.x;
    var py = this.player.y;
    if (this.player.shake > 0) {
      px += (Math.random() - 0.5) * this.player.shake;
      py += (Math.random() - 0.5) * this.player.shake;
      this.player.shake *= 0.9;
    }
    this.drawCar(px, py, this.player.w, this.player.h, this.crashed ? "#c62828" : "#0277bd", this.crashed);

    this.particles.forEach(function (p) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // HUD
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    roundRect(ctx, 8, 8, 140, 54, 10);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px Nunito, sans-serif";
    ctx.fillText("Score " + Math.floor(this.distance), 18, 30);
    ctx.fillText("Speed " + Math.round(this.player.speed * 18) + " km/h", 18, 50);

    if (this.crashed) {
      ctx.fillStyle = "rgba(183, 28, 28, 0.35)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      roundRect(ctx, w / 2 - 120, h / 2 - 40, 240, 80, 16);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 26px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CRASH!", w / 2, h / 2 - 4);
      ctx.font = "bold 16px Nunito, sans-serif";
      ctx.fillText("Game Over — try again", w / 2, h / 2 + 24);
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
