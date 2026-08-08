/* Generic Learn + Play with detailed topic sections & tables */
(function (window, $) {
  "use strict";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;").replace(/\r?\n/g, " ");
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

  function normalizeSections(data) {
    if (data.sections && data.sections.length) return data.sections;
    return (data.lessons || []).map(function (L) {
      return {
        id: L.id,
        title: L.title,
        icon: "📘",
        explanation: L.body,
        points: [],
        examples: []
      };
    });
  }

  function renderSectionDetail(section, lang, bodyClass) {
    var speakBits = [section.explanation];
    var html =
      '<article class="card lesson-detail">' +
      '<h3 class="lesson-heading">' +
      (section.icon ? '<span class="lesson-icon">' + escapeHtml(section.icon) + "</span> " : "") +
      escapeHtml(section.title) +
      "</h3>" +
      '<p class="lesson-label">Explanation</p>' +
      '<p class="' +
      (bodyClass || "") +
      '">' +
      escapeHtml(section.explanation) +
      "</p>";

    if (section.points && section.points.length) {
      html += '<p class="lesson-label">Remember</p><ul class="lesson-points">';
      section.points.forEach(function (p) {
        html += "<li class='" + (bodyClass || "") + "'>" + escapeHtml(p) + "</li>";
        speakBits.push(p);
      });
      html += "</ul>";
    }

    if (section.examples && section.examples.length) {
      html += '<p class="lesson-label">Worked examples</p><div class="example-grid">';
      section.examples.forEach(function (ex) {
        html +=
          '<div class="example-card">' +
          "<h4>" +
          escapeHtml(ex.title || "Example") +
          "</h4>" +
          '<p class="example-problem"><strong>Q:</strong> ' +
          escapeHtml(ex.problem || "") +
          "</p>";
        if (ex.steps && ex.steps.length) {
          html += "<ol class='example-steps'>";
          ex.steps.forEach(function (st) {
            html += "<li>" + escapeHtml(st) + "</li>";
            speakBits.push(st);
          });
          html += "</ol>";
        }
        if (ex.answer) {
          html +=
            '<p class="example-answer"><strong>Answer:</strong> ' +
            escapeHtml(ex.answer) +
            "</p>";
          speakBits.push("Answer: " + ex.answer);
        }
        html += "</div>";
      });
      html += "</div>";
    }

    html +=
      '<div class="actions"><button type="button" class="btn js-speak" data-lang="' +
      escapeAttr(lang) +
      '" data-text="' +
      escapeAttr(speakBits.join(". ")) +
      '">🔊 Listen to lesson</button></div></article>';
    return html;
  }

  function renderTopics($el, sections, options) {
    options = options || {};
    var lang = options.lang || "en-US";
    var bodyClass = options.bodyClass || "";
    if (!sections.length) {
      $el.html('<div class="card"><p>No lessons yet.</p></div>');
      return;
    }

    var chips = '<div class="topic-chips" role="tablist">';
    sections.forEach(function (s, i) {
      chips +=
        '<button type="button" class="topic-chip' +
        (i === 0 ? " active" : "") +
        '" data-topic="' +
        escapeAttr(s.id) +
        '">' +
        (s.icon ? escapeHtml(s.icon) + " " : "") +
        escapeHtml(s.title) +
        "</button>";
    });
    chips += '</div><div class="topic-detail"></div>';
    $el.html(chips);

    function show(id) {
      var section =
        sections.find(function (s) {
          return s.id === id;
        }) || sections[0];
      $el.find(".topic-chip").removeClass("active");
      $el.find('.topic-chip[data-topic="' + section.id + '"]').addClass("active");
      $el.find(".topic-detail").html(renderSectionDetail(section, lang, bodyClass));
    }

    $el.off("click.topic").on("click.topic", ".topic-chip", function () {
      show($(this).data("topic"));
    });
    show(sections[0].id);
  }

  function renderTables($el, tables, options) {
    options = options || {};
    if (!tables) {
      $el.html('<div class="card"><p>No tables for this subject.</p></div>');
      return;
    }
    var from = tables.from || 2;
    var to = tables.to || 10;
    var upto = tables.upto || 10;
    var lang = options.lang || "en-US";
    var html =
      '<div class="card"><h3>' +
      escapeHtml(tables.title || "Tables") +
      "</h3><p>" +
      escapeHtml(tables.subtitle || "") +
      '</p><div class="table-picker">';

    for (var n = from; n <= to; n++) {
      html +=
        '<button type="button" class="btn table-pick' +
        (n === from ? " primary" : "") +
        '" data-n="' +
        n +
        '">' +
        n +
        "×</button>";
    }
    html += '</div><div class="times-table" id="timesTableView"></div></div>';
    $el.html(html);

    function showTable(n) {
      var rows = "";
      var speak = "Table of " + n + ". ";
      for (var i = 1; i <= upto; i++) {
        var line = n + " × " + i + " = " + n * i;
        speak += line + ". ";
        rows +=
          '<button type="button" class="times-row js-speak" data-lang="' +
          escapeAttr(lang) +
          '" data-text="' +
          escapeAttr(line) +
          '"><span>' +
          n +
          " × " +
          i +
          '</span><span class="times-eq">' +
          n * i +
          "</span></button>";
      }
      rows +=
        '<div class="actions" style="margin-top:0.75rem"><button type="button" class="btn js-speak" data-lang="' +
        escapeAttr(lang) +
        '" data-text="' +
        escapeAttr(speak) +
        '">🔊 Read whole table</button></div>';
      $el.find("#timesTableView").html(rows);
      $el.find(".table-pick").removeClass("primary");
      $el.find('.table-pick[data-n="' + n + '"]').addClass("primary");
    }

    $el.off("click.table").on("click.table", ".table-pick", function () {
      showTable(Number($(this).data("n")));
    });
    showTable(from);
  }

  function mountPlay($el, questions, activityId) {
    var list = shuffle(questions || []).slice(0, Math.min(10, (questions || []).length));
    var index = 0;
    var score = 0;

    function showQuestion() {
      if (index >= list.length) {
        var stars = score >= list.length - 1 ? 3 : score >= list.length / 2 ? 2 : 1;
        $el.html(
          '<div class="card"><h3>Round complete!</h3><p>You got ' +
            score +
            " of " +
            list.length +
            " correct.</p>" +
            '<div class="actions"><button type="button" class="btn success" id="claimStars">Collect stars</button>' +
            '<button type="button" class="btn" id="replayQuiz">Play again</button></div></div>'
        );
        $("#claimStars").on("click", function () {
          NumairApp.addStars(stars, activityId);
          $(this).prop("disabled", true);
        });
        $("#replayQuiz").on("click", function () {
          mountPlay($el, questions, activityId);
        });
        return;
      }

      var q = list[index];
      var html =
        '<div class="card"><p><strong>Question ' +
        (index + 1) +
        " / " +
        list.length +
        "</strong></p><h3>" +
        escapeHtml(q.prompt) +
        "</h3><div class='q-body'></div></div>";
      $el.html(html);
      var $body = $el.find(".q-body");

      if (q.type === "truefalse") {
        ["True", "False"].forEach(function (label, i) {
          var val = i === 0;
          $("<button/>", { type: "button", class: "quiz-option", text: label })
            .appendTo($body)
            .on("click", function () {
              check($(this), val === q.answer);
            });
        });
      } else {
        (q.choices || []).forEach(function (c, i) {
          $("<button/>", { type: "button", class: "quiz-option", text: c })
            .appendTo($body)
            .on("click", function () {
              check($(this), i === q.answer);
            });
        });
      }

      function check($btn, ok) {
        $body.find(".quiz-option").prop("disabled", true);
        if (ok) {
          $btn.addClass("correct");
          score++;
          NumairApp.celebrate("Yes!");
        } else {
          $btn.addClass("wrong");
          NumairApp.buzz();
        }
        setTimeout(function () {
          index++;
          showQuestion();
        }, 700);
      }
    }

    showQuestion();
  }

  function mount(rootSelector, data, options) {
    options = options || {};
    var $root = $(rootSelector);
    var activityId = options.activityId || "learn-play";
    var sections = normalizeSections(data);

    renderTopics($root.find("[data-role=learn]"), sections, options);

    if ($root.find("[data-role=tables]").length) {
      renderTables($root.find("[data-role=tables]"), data.tables || null, options);
    }

    $root.find("[data-role=play]").html(
      '<div class="card"><p>Tap <strong>Start quiz</strong> to play and earn stars!</p>' +
        '<button type="button" class="btn primary" data-role="play-start">Start quiz</button></div>'
    );
    $root
      .off("click.playstart", "[data-role=play-start]")
      .on("click.playstart", "[data-role=play-start]", function () {
        mountPlay($root.find("[data-role=play]"), data.questions || [], activityId);
      });
  }

  window.LearnPlay = { mount: mount, renderTables: renderTables };
})(window, jQuery);
