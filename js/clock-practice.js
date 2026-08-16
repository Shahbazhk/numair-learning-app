(function (window, $) {
  "use strict";

  var hour = 3;
  var minute = 0;

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function digitalLabel() {
    return pad(hour) + ":" + pad(minute);
  }

  function spoken() {
    if (minute === 0) return hour + " o’clock";
    if (minute === 15) return "quarter past " + hour;
    if (minute === 30) return "half past " + hour;
    if (minute === 45) {
      var next = hour === 12 ? 1 : hour + 1;
      return "quarter to " + next;
    }
    return minute + " minutes past " + hour;
  }

  function draw() {
    var canvas = document.getElementById("clockCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;
    var r = Math.min(w, h) / 2 - 12;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff8e1";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0277bd";
    ctx.lineWidth = 6;
    ctx.stroke();

    for (var n = 1; n <= 12; n++) {
      var a = (Math.PI / 6) * n - Math.PI / 2;
      var tx = cx + Math.cos(a) * (r - 28);
      var ty = cy + Math.sin(a) * (r - 28);
      ctx.fillStyle = "#01579b";
      ctx.font = "bold 18px Fredoka,sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(n), tx, ty);
      // minute ticks
      for (var t = 0; t < 5; t++) {
        var aa = a - Math.PI / 6 + (Math.PI / 30) * t;
        var inner = r - 8;
        var outer = r - 2;
        ctx.strokeStyle = t === 0 ? "#0277bd" : "#90caf9";
        ctx.lineWidth = t === 0 ? 3 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(aa) * inner, cy + Math.sin(aa) * inner);
        ctx.lineTo(cx + Math.cos(aa) * outer, cy + Math.sin(aa) * outer);
        ctx.stroke();
      }
    }

    // hour hand (short)
    var hourAngle = ((hour % 12) + minute / 60) * (Math.PI / 6) - Math.PI / 2;
    ctx.strokeStyle = "#e53935";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hourAngle) * (r * 0.45), cy + Math.sin(hourAngle) * (r * 0.45));
    ctx.stroke();

    // minute hand (long)
    var minAngle = (minute / 60) * (Math.PI * 2) - Math.PI / 2;
    ctx.strokeStyle = "#1565c0";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minAngle) * (r * 0.72), cy + Math.sin(minAngle) * (r * 0.72));
    ctx.stroke();

    // center
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    $("#clockDigital").text(digitalLabel());
    $("#clockSpoken").text(spoken());
    var afternoon = $("#clockPm").is(":checked");
    var h24v = afternoon ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;
    $("#clock24").text(
      pad(h24v) + ":" + pad(minute) + (afternoon ? " · p.m. on 12-hour clock" : " · a.m. on 12-hour clock")
    );
  }

  function init() {
    if (!$("#clockCanvas").length) return;
    draw();
    $("#clockHourMinus").on("click", function () {
      hour = hour <= 1 ? 12 : hour - 1;
      draw();
    });
    $("#clockHourPlus").on("click", function () {
      hour = hour >= 12 ? 1 : hour + 1;
      draw();
    });
    $("#clockMinMinus").on("click", function () {
      minute = (minute + 55) % 60;
      if (minute % 5 !== 0) minute = Math.floor(minute / 5) * 5;
      draw();
    });
    $("#clockMinPlus").on("click", function () {
      minute = (minute + 5) % 60;
      draw();
    });
    $("#clockPm").on("change", draw);
    $("#clockQuiz").on("click", function () {
      var opts = [
        { h: 3, m: 0, say: "3 o’clock" },
        { h: 7, m: 30, say: "half past 7" },
        { h: 2, m: 15, say: "quarter past 2" },
        { h: 4, m: 45, say: "quarter to 5" },
        { h: 9, m: 0, say: "9 o’clock" },
        { h: 6, m: 30, say: "half past 6" }
      ];
      var pick = opts[Math.floor(Math.random() * opts.length)];
      hour = pick.h;
      minute = pick.m;
      draw();
      NumairApp.celebrate("Show me: " + pick.say + " → " + pad(hour) + ":" + pad(minute));
    });
  }

  window.ClockPractice = { init: init, draw: draw };
})(window, jQuery);
