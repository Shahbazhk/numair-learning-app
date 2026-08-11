(function (window) {
  "use strict";

  function BounceBall(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.w = canvas.width;
    this.h = canvas.height;
    this.onOver = opts && opts.onGameOver;
    this.keys = { left: false, right: false };
    this.running = false;
    this._raf = null;
    this.reset();
  }

  BounceBall.prototype.reset = function () {
    this.paddle = {
      w: 78,
      h: 14,
      x: this.w / 2 - 39,
      y: this.h - 36,
      speed: 6.5
    };
    this.ball = {
      r: 12,
      x: this.w / 2,
      y: this.h / 2,
      vx: 2.4 * (Math.random() > 0.5 ? 1 : -1),
      vy: -3.4
    };
    this.score = 0;
    this.lives = 3;
    this.bounces = 0;
    this.running = false;
    this.over = false;
  };

  BounceBall.prototype.setInput = function (key, down) {
    if (key in this.keys) this.keys[key] = !!down;
  };

  BounceBall.prototype.start = function () {
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

  BounceBall.prototype.stop = function () {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  };

  BounceBall.prototype.loseLife = function () {
    this.lives--;
    if (this.lives <= 0) {
      this.over = true;
      this.running = false;
      if (this.onOver) this.onOver(this.score, this.bounces);
      return;
    }
    this.ball.x = this.w / 2;
    this.ball.y = this.h / 2;
    this.ball.vx = 2.4 * (Math.random() > 0.5 ? 1 : -1);
    this.ball.vy = -3.4;
    this.paddle.x = this.w / 2 - this.paddle.w / 2;
  };

  BounceBall.prototype.update = function () {
    if (!this.running || this.over) return;
    var p = this.paddle;
    var b = this.ball;

    if (this.keys.left) p.x -= p.speed;
    if (this.keys.right) p.x += p.speed;
    if (p.x < 6) p.x = 6;
    if (p.x + p.w > this.w - 6) p.x = this.w - 6 - p.w;

    b.x += b.vx;
    b.y += b.vy;

    if (b.x - b.r < 0) {
      b.x = b.r;
      b.vx *= -1;
    }
    if (b.x + b.r > this.w) {
      b.x = this.w - b.r;
      b.vx *= -1;
    }
    if (b.y - b.r < 0) {
      b.y = b.r;
      b.vy *= -1;
    }

    // Paddle hit
    if (
      b.vy > 0 &&
      b.y + b.r >= p.y &&
      b.y + b.r <= p.y + p.h + 8 &&
      b.x >= p.x - 4 &&
      b.x <= p.x + p.w + 4
    ) {
      b.y = p.y - b.r;
      b.vy = -Math.abs(b.vy);
      // Angle based on hit position
      var hit = (b.x - (p.x + p.w / 2)) / (p.w / 2);
      b.vx = hit * 4.2;
      // Speed up gently
      b.vy = -Math.min(7.5, Math.abs(b.vy) + 0.12);
      this.bounces++;
      this.score += 10 + Math.min(20, this.bounces);
    }

    if (b.y - b.r > this.h) this.loseLife();
  };

  BounceBall.prototype.draw = function () {
    var ctx = this.ctx;
    var w = this.w;
    var h = this.h;

    var sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#e1f5fe");
    sky.addColorStop(1, "#fff8e1");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // soft court lines
    ctx.strokeStyle = "rgba(2,119,189,0.15)";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    // paddle
    ctx.fillStyle = "#0277bd";
    roundRect(ctx, this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h, 8);
    ctx.fill();
    ctx.fillStyle = "#4fc3f7";
    roundRect(ctx, this.paddle.x + 6, this.paddle.y + 3, this.paddle.w - 12, 4, 3);
    ctx.fill();

    // red ball
    var bx = this.ball.x;
    var by = this.ball.y;
    var br = this.ball.r;
    var grad = ctx.createRadialGradient(bx - 3, by - 4, 2, bx, by, br);
    grad.addColorStop(0, "#ff8a80");
    grad.addColorStop(0.55, "#e53935");
    grad.addColorStop(1, "#b71c1c");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.arc(bx - 3, by - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // HUD
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    roundRect(ctx, 10, 10, 130, 44, 10);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Nunito,sans-serif";
    ctx.fillText("Score " + this.score, 20, 28);
    ctx.fillText("Lives " + this.lives, 20, 46);

    if (this.over) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "bold 22px Fredoka,sans-serif";
      ctx.fillText("Game Over!", w / 2, h / 2 - 10);
      ctx.font = "bold 16px Nunito,sans-serif";
      ctx.fillText("Score: " + this.score, w / 2, h / 2 + 20);
      ctx.textAlign = "left";
    } else if (!this.running) {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "bold 18px Fredoka,sans-serif";
      ctx.fillText("Press Start!", w / 2, h / 2);
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

  // idle preview
  BounceBall.prototype.drawIdle = function () {
    this.running = false;
    this.over = false;
    this.draw();
  };

  window.BounceBall = BounceBall;
})(window);
