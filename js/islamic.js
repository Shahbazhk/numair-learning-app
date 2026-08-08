(function (window, $) {
  "use strict";

  function esc(s) {
    return NumairApp.escapeAttr(s);
  }

  function listenBtn(text, lang, kidIntro) {
    var spoken = kidIntro ? kidIntro + " " + text : text;
    return (
      '<div class="actions"><button type="button" class="btn js-speak" data-lang="' +
      esc(lang || "en-US") +
      '" data-text="' +
      esc(spoken) +
      '">🔊 Listen</button></div>'
    );
  }

  function cardHtml(title, bodyHtml, source, extraActions) {
    return (
      '<article class="card"><h3>' +
      title +
      "</h3>" +
      bodyHtml +
      (source ? '<div><span class="source">' + source + "</span></div>" : "") +
      (extraActions || "") +
      "</article>"
    );
  }

  function loadSeerah(data) {
    var html = '<div class="card-grid">';
    data.cards.forEach(function (c) {
      html += cardHtml(
        c.title,
        "<p>" + c.body + "</p>",
        "Source: " + c.source,
        listenBtn(c.body, "en-US", "Here is a short Seerah story for Numair.")
      );
    });
    html += "</div>";
    $("#seerahLearn").html(html);
    $("#seerahPlay").html(
      '<div class="card"><p>Match the story idea to its source style — tap the best answer!</p><button class="btn primary" id="startSeerahQuiz">Start quiz</button></div>'
    );
    $("#startSeerahQuiz").on("click", function () {
      var qs = data.cards.slice(0, 6).map(function (c, i) {
        var wrong = data.cards[(i + 2) % data.cards.length].title;
        return {
          prompt: "Which topic is this about? " + c.body.slice(0, 80) + "…",
          choices: i % 2 === 0 ? [c.title, wrong] : [wrong, c.title],
          answer: i % 2 === 0 ? 0 : 1
        };
      });
      runSimpleQuiz($("#seerahPlay"), qs, "islamic-seerah");
    });
  }

  function loadDuas(data) {
    var html = '<div class="card-grid">';
    data.duas.forEach(function (d) {
      html += cardHtml(
        d.occasion,
        '<p class="arabic" lang="ar">' +
          d.arabic +
          '</p><p class="translit">' +
          d.transliteration +
          "</p><p>" +
          d.meaning +
          "</p>",
        "Source: " + d.source,
        listenBtn(
          "First, say this dua slowly: " +
            d.transliteration +
            ". That means: " +
            d.meaning +
            ". We say this when " +
            d.occasion.toLowerCase() +
            ".",
          "en-US"
        )
      );
    });
    html += "</div>";
    $("#duasLearn").html(html);
    $("#duasPlay").html(
      '<div class="card"><p>When do we say this dua?</p><button class="btn primary" id="startDuaQuiz">Start quiz</button></div>'
    );
    $("#startDuaQuiz").on("click", function () {
      var qs = data.duas.map(function (d, i) {
        var other = data.duas[(i + 3) % data.duas.length].occasion;
        return {
          prompt: d.transliteration,
          choices: i % 2 ? [other, d.occasion] : [d.occasion, other],
          answer: i % 2 ? 1 : 0
        };
      });
      runSimpleQuiz($("#duasPlay"), qs.slice(0, 8), "islamic-duas");
    });
  }

  function loadArabic(data) {
    var html = '<div class="card-grid">';
    data.phrases.forEach(function (p) {
      html += cardHtml(
        p.english,
        '<p class="arabic" lang="ar">' +
          p.arabic +
          '</p><p class="translit">' +
          p.transliteration +
          "</p>" +
          (p.reply ? "<p>Reply: <strong>" + p.reply + "</strong></p>" : ""),
        null,
        listenBtn(
          "In Arabic we say: " +
            p.transliteration +
            ". That means: " +
            p.english +
            (p.reply ? ". A nice reply is: " + p.reply : "") +
            ".",
          "en-US"
        )
      );
    });
    html += "</div>";
    $("#arabicLearn").html(html);
    $("#arabicPlay").html(
      '<div class="card"><p>What does this phrase mean?</p><button class="btn primary" id="startArabicQuiz">Start quiz</button></div>'
    );
    $("#startArabicQuiz").on("click", function () {
      var qs = data.phrases.map(function (p, i) {
        var other = data.phrases[(i + 2) % data.phrases.length].english;
        return {
          prompt: p.arabic + " (" + p.transliteration + ")",
          choices: i % 2 ? [other, p.english] : [p.english, other],
          answer: i % 2 ? 1 : 0
        };
      });
      runSimpleQuiz($("#arabicPlay"), qs, "islamic-arabic");
    });
  }

  function runSimpleQuiz($el, questions, activityId) {
    var i = 0;
    var score = 0;
    function next() {
      if (i >= questions.length) {
        var stars = score >= questions.length - 1 ? 3 : 2;
        $el.html(
          '<div class="card"><h3>Well done!</h3><p>Score: ' +
            score +
            "/" +
            questions.length +
            '</p><button class="btn success" id="claim">Collect stars</button></div>'
        );
        $("#claim").on("click", function () {
          NumairApp.addStars(stars, activityId);
          $(this).prop("disabled", true);
        });
        return;
      }
      var q = questions[i];
      var html = "<div class='card'><h3>" + q.prompt + "</h3>";
      q.choices.forEach(function (c, idx) {
        html += '<button type="button" class="quiz-option" data-i="' + idx + '">' + c + "</button>";
      });
      html += "</div>";
      $el.html(html);
      $el.find(".quiz-option").on("click", function () {
        var ok = Number($(this).data("i")) === q.answer;
        $(this).addClass(ok ? "correct" : "wrong");
        if (ok) {
          score++;
          NumairApp.celebrate("Yes!");
        } else NumairApp.buzz();
        i++;
        setTimeout(next, 650);
      });
    }
    next();
  }

  $(function () {
    NumairApp.loadJSON(NumairApp.dataHref("seerah.json")).done(loadSeerah);
    NumairApp.loadJSON(NumairApp.dataHref("duas.json")).done(loadDuas);
    NumairApp.loadJSON(NumairApp.dataHref("arabic-phrases.json")).done(loadArabic);
  });
})(window, jQuery);
