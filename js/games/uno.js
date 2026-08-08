(function (window, $) {
  "use strict";

  var COLORS = ["red", "yellow", "green", "blue"];
  var COLOR_HEX = { red: "#e53935", yellow: "#fdd835", green: "#43a047", blue: "#1e88e5" };
  var deck = [];
  var discard = [];
  var playerHand = [];
  var botHand = [];
  var currentColor = null;
  var busy = false;

  function makeDeck() {
    var d = [];
    COLORS.forEach(function (c) {
      for (var n = 0; n <= 9; n++) {
        d.push({ color: c, value: String(n), type: "number" });
        if (n !== 0) d.push({ color: c, value: String(n), type: "number" });
      }
      d.push({ color: c, value: "Skip", type: "skip" });
      d.push({ color: c, value: "+2", type: "draw2" });
    });
    for (var w = 0; w < 4; w++) {
      d.push({ color: "wild", value: "Wild", type: "wild" });
    }
    return shuffle(d);
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

  function drawFromDeck(n) {
    var cards = [];
    for (var i = 0; i < n; i++) {
      if (!deck.length) {
        var top = discard.pop();
        deck = shuffle(discard);
        discard = top ? [top] : [];
      }
      if (deck.length) cards.push(deck.pop());
    }
    return cards;
  }

  function canPlay(card, top) {
    if (!top) return true;
    if (card.type === "wild") return true;
    if (card.color === currentColor) return true;
    if (card.value === top.value) return true;
    return false;
  }

  function cardHtml(card, idx, faceUp) {
    if (!faceUp) {
      return '<div class="uno-card uno-back" aria-hidden="true">UNO</div>';
    }
    var bg = card.type === "wild" ? "#212121" : COLOR_HEX[card.color];
    return (
      '<button type="button" class="uno-card" data-i="' +
      idx +
      '" style="--c:' +
      bg +
      '"><span class="uno-val">' +
      card.value +
      "</span></button>"
    );
  }

  function render() {
    var top = discard[discard.length - 1];
    $("#unoTop").html(top ? cardHtml(top, -1, true) : "");
    $("#unoColor").text("Color: " + (currentColor || "-"));
    $("#unoBotCount").text("Bot cards: " + botHand.length);
    var ph = "";
    playerHand.forEach(function (c, i) {
      ph += cardHtml(c, i, true);
    });
    $("#unoHand").html(ph);
    $("#unoMsg").text($("#unoMsg").data("text") || "Match the color or number!");
  }

  function setMsg(t) {
    $("#unoMsg").data("text", t).text(t);
  }

  function applyCard(card, who) {
      if (card.type === "wild") {
        if (who === "player") {
          $("#unoColorPick").show();
          busy = true;
          window._unoPendingWild = true;
          setMsg("Pick a color!");
          return "wait-color";
        }
        currentColor = COLORS[Math.floor(Math.random() * 4)];
        setMsg("Bot chose " + currentColor + "!");
      } else {
        currentColor = card.color;
      }

    if (card.type === "draw2") {
      var drawn = drawFromDeck(2);
      if (who === "player") {
        botHand = botHand.concat(drawn);
        setMsg("Bot draws 2!");
      } else {
        playerHand = playerHand.concat(drawn);
        setMsg("You draw 2!");
      }
    }

    if (card.type === "skip") {
      setMsg((who === "player" ? "Bot skipped!" : "You are skipped!") + " Go again.");
      return who; // same player again
    }
    return who === "player" ? "bot" : "player";
  }

  function checkWin(who) {
    if (who === "player" && playerHand.length === 0) {
      setMsg("You win! 🎉");
      NumairApp.celebrate("UNO win!");
      NumairApp.addStars(2, "uno-win");
      var list = NumairApp.saveRanking("unoKids", { name: NumairApp.getNickname(), score: 100 });
      renderRanks(list);
      busy = true;
      return true;
    }
    if (who === "bot" && botHand.length === 0) {
      setMsg("Bot wins — try again!");
      NumairApp.buzz();
      busy = true;
      return true;
    }
    return false;
  }

  function botTurn() {
    busy = true;
    setMsg("Bot is thinking…");
    setTimeout(function () {
      var top = discard[discard.length - 1];
      var playIdx = -1;
      for (var i = 0; i < botHand.length; i++) {
        if (canPlay(botHand[i], top)) {
          playIdx = i;
          break;
        }
      }
      if (playIdx === -1) {
        botHand = botHand.concat(drawFromDeck(1));
        setMsg("Bot drew a card.");
        render();
        busy = false;
        return;
      }
      var card = botHand.splice(playIdx, 1)[0];
      discard.push(card);
      var next = applyCard(card, "bot");
      render();
      if (checkWin("bot")) return;
      if (next === "bot") {
        setTimeout(botTurn, 500);
      } else {
        busy = false;
        setMsg("Your turn — tap a matching card!");
      }
    }, 650);
  }

  function start() {
    window._unoPendingWild = false;
    $("#unoColorPick").hide();
    deck = makeDeck();
    discard = [];
    playerHand = drawFromDeck(7);
    botHand = drawFromDeck(7);
    var first = null;
    while (!first || first.type === "wild" || first.type === "draw2" || first.type === "skip") {
      if (first) deck.unshift(first);
      first = deck.pop();
    }
    discard.push(first);
    currentColor = first.color;
    busy = false;
    setMsg("Your turn — match " + currentColor + " or " + first.value + "!");
    render();
    renderRanks();
  }

  function renderRanks(list) {
    var html = "";
    (list || NumairApp.getRankings("unoKids")).forEach(function (r, i) {
      html += "<li><span>#" + (i + 1) + " " + r.name + "</span><span>" + r.score + "</span></li>";
    });
    $("#unoRanks").html(html || "<li>No wins yet</li>");
  }

  function init() {
    start();
    $("#unoRestart").on("click", start);
    $("#unoDraw").on("click", function () {
      if (busy) return;
      playerHand = playerHand.concat(drawFromDeck(1));
      setMsg("You drew a card. Bot’s turn…");
      render();
      setTimeout(botTurn, 400);
    });
    $("#unoHand").on("click", ".uno-card", function () {
      if (busy) return;
      var i = Number($(this).data("i"));
      var card = playerHand[i];
      var top = discard[discard.length - 1];
      if (!canPlay(card, top)) {
        NumairApp.celebrate("Must match color or number!");
        return;
      }
      playerHand.splice(i, 1);
      discard.push(card);
      var next = applyCard(card, "player");
      render();
      if (checkWin("player")) return;
      if (next === "wait-color") return;
      if (next === "player") {
        setMsg("Skip! Play again.");
        busy = false;
      } else {
        setTimeout(botTurn, 400);
      }
    });

    $("#unoColorPick").on("click", ".uno-color-btn", function () {
      if (!window._unoPendingWild) return;
      currentColor = $(this).data("color");
      window._unoPendingWild = false;
      $("#unoColorPick").hide();
      setMsg("Color is " + currentColor + ". Bot’s turn…");
      render();
      busy = false;
      setTimeout(botTurn, 450);
    });
  }

  window.UnoKids = { init: init, start: start };
})(window, jQuery);
