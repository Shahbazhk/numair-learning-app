(function (window, $) {
  "use strict";

  var data = null;
  var current = null;
  var reciterKey = "luhaidan";
  var audio = new Audio();

  function pad(n) {
    return String(n).padStart(3, "0");
  }

  function audioUrl(surahNumber) {
    var r = data.reciters[reciterKey];
    return r.base + pad(surahNumber) + ".mp3";
  }

  function renderList() {
    var html = "";
    data.surahs.forEach(function (s) {
      html +=
        '<button type="button" class="surah-chip" data-num="' +
        s.number +
        '">' +
        s.number +
        ". " +
        s.englishName +
        "</button>";
    });
    $("#surahList").html(html);
  }

  function selectSurah(num) {
    current = data.surahs.find(function (s) {
      return s.number === Number(num);
    });
    if (!current) return;
    $(".surah-chip").removeClass("active");
    $('.surah-chip[data-num="' + num + '"]').addClass("active");
    $("#surahTitle").text(current.englishName + " — " + current.name);
    $("#surahMeta").text(current.numberOfAyahs + " ayahs · " + current.englishNameTranslation);
    var ayahHtml = "";
    current.ayahs.forEach(function (a) {
      ayahHtml +=
        '<div class="ayah-item"><strong>' +
        a.numberInSurah +
        '.</strong> <span class="arabic" lang="ar">' +
        a.text +
        "</span></div>";
    });
    $("#ayahList").html(ayahHtml);
    audio.pause();
    audio.src = audioUrl(current.number);
    $("#audioStatus").text("Ready: " + data.reciters[reciterKey].name);
  }

  $(function () {
    NumairApp.loadJSON(NumairApp.dataHref("surahs.json")).done(function (json) {
      data = json;
      renderList();
      selectSurah(114);
    });

    $("#surahList").on("click", ".surah-chip", function () {
      selectSurah($(this).data("num"));
    });

    $(".reciter-btn").on("click", function () {
      reciterKey = $(this).data("reciter");
      $(".reciter-btn").removeClass("active");
      $(this).addClass("active");
      if (current) {
        var wasPlaying = !audio.paused;
        var t = audio.currentTime;
        audio.src = audioUrl(current.number);
        audio.currentTime = t;
        $("#audioStatus").text("Reciter: " + data.reciters[reciterKey].name);
        if (wasPlaying) audio.play().catch(function () {});
      }
    });

    $("#btnPlay").on("click", function () {
      if (!current) return;
      audio.play().then(function () {
        $("#audioStatus").text("Playing… (repeat after the Qari)");
      }).catch(function () {
        NumairApp.celebrate("Tap Play again — audio needs a click & internet");
      });
    });

    $("#btnPause").on("click", function () {
      audio.pause();
      $("#audioStatus").text("Paused — your turn to recite!");
    });

    $("#btnPracticed").on("click", function () {
      if (!current) return;
      NumairApp.setProgress("surah-" + current.number, { practiced: true });
      NumairApp.addStars(1, "surah-" + current.number + "-practice");
    });

    audio.addEventListener("ended", function () {
      $("#audioStatus").text("Finished — mark practiced if you recited along!");
    });
  });
})(window, jQuery);
