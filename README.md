# Numair’s Learning World

A bright, kid-friendly HTML + jQuery + CSS portal for **CBSE Grades 1–10** (default Grade 2). Pick a name and grade on first visit.

## Live site (GitHub Pages)

**https://shahbazhk.github.io/numair-learning-app/**

## Quick start

1. Open a terminal in this folder (`numair-app`).
2. Serve with any static server (recommended — browsers block JSON on `file://`):

```bash
npx --yes serve .
```

Or with Python:

```bash
python -m http.server 8080
```

3. Open the URL shown (e.g. `http://localhost:3000`) and start from **index.html**.

## Deploy

This repo is set up for **GitHub Pages** from the `main` branch (root).

You can also upload this folder to Netlify / Cloudflare Pages / any static host — no build step required.

## What’s inside

| Section | Features |
|---------|----------|
| Profile | Name + **CBSE grade 1–10** (default Grade 2); change anytime from home |
| Islamic Education | Seerah, duas (Arabic listen), Arabic phrases |
| Juz Amma | Surahs **78–114**, reciters Luhaidan / Shuraim / Dosari |
| School subjects | Maths, English, Hindi, **Telugu**, Science/EVS, Social Studies, GK — content loads from `data/grade-{N}/` |
| Depth | **Grades 1–5:** richer Learn + Play · **Grades 6–10:** NCERT-aligned topic outlines + quizzes |
| Grade 2 focus | Deep CBSE topics with real-world Indian examples (Maths 16, English/Science 14, Hindi/Telugu/SS/GK 13 sections each) |
| Games | Car lap race, Football, Memory, Pattern, kids UNO |

Stars and rankings are stored in the browser (`localStorage`). Quiz stars are keyed by grade.

## Curriculum notes

- Lessons are **original summaries** aligned to public **NCERT / CBSE topic lists** — not copied textbooks.
- Regenerate curriculum JSON (skips existing Grade 2 deep files except Telugu):

```bash
node scripts/generate-curriculum.js
```

## Audio & text sources

- Qur’an audio:
  - Shaikh Muhammad Al-Luhaidan via [QuranicAudio](https://quranicaudio.com): `https://download.quranicaudio.com/quran/muhammad_alhaidan/`
  - Saud Al-Shuraim & Yasser Al-Dosari via [mp3quran.net](https://www.mp3quran.net/) CDNs
- Arabic ayah text via AlQuran Cloud API
- Duas from **Hisnul Muslim** with citations

## Folders

```
numair-app/
  index.html
  css/style.css
  js/…                 # app, learn-play, islamic, surahs, games
  data/
    grade-1/ … grade-10/   # per-grade subject JSON
    surahs.json, duas.json, …
  pages/…
  scripts/generate-curriculum.js
```

Made with love for Numair — and classmates in every grade.
