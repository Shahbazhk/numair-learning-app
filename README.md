# Numair’s Learning World

A bright, kid-friendly HTML + jQuery + CSS portal for **Numair** (age 6, CBSE Grade 2).

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
| Islamic Education | Seerah (Qur’an & Hadith cited), duas (Hisnul Muslim / authentic Hadith), Arabic phrases + quizzes |
| Last 20 Surahs / Juz Amma | Surahs **78–114** (full Juz Amma / Part 30), Arabic text, audio: **Shaikh Muhammad Al-Luhaidan**, **Shaikh Saud Al-Shuraim**, **Yasser Al-Dosari** |
| Maths / Science / Hindi / English | Learn + Play quizzes for Grade 2 |
| Games | Car lap race (1st/2nd/3rd), Football, Memory, Pattern, simple kids UNO |

Stars and rankings are stored in the browser (`localStorage`).

## Audio & text sources

- Qur’an audio:
  - Shaikh Muhammad Al-Luhaidan via [QuranicAudio](https://quranicaudio.com): `https://download.quranicaudio.com/quran/muhammad_alhaidan/`
  - Saud Al-Shuraim & Yasser Al-Dosari via [mp3quran.net](https://www.mp3quran.net/) CDNs
- Arabic ayah text loaded into `data/surahs.json` via AlQuran Cloud API at build time
- Duas curated primarily from **Hisnul Muslim** with classic hadith citations on each card
- Seerah cards cite Qur’an / authentic Hadith — intended for gentle age-6 learning; consult a scholar for deeper study

## Folders

```
numair-app/
  index.html
  css/style.css
  js/…          # app, learn-play, islamic, surahs, games
  data/…        # JSON lessons & surah text
  pages/…       # section pages
```

Made with love for Numair.

## School subjects (CBSE Grade 2)

| Subject | Coverage highlight |
|---------|-------------------|
| Maths | Numbers to 1000, place value, + − × ÷, fractions 1/2 & 1/4, shapes, measurement, money, time, pictographs, tables 1–10 up to ×12 |
| English | Phonics, sight words, nouns/pronouns/verbs/adjectives, articles, prepositions, sentences, comprehension |
| Hindi | स्वर, व्यंजन, मात्रा, शब्द, वाक्य, संज्ञा, क्रिया, विलोम, पढ़ना-लिखना |
| Science / EVS | Living things, plants, animals, body, food, house/clothes, water-air-weather, seasons, materials, hygiene/safety |
| Social Studies | Family, neighbourhood, school, helpers, transport, directions, festivals, India basics, rules, Earth care |
| General Knowledge | Habits, calendar, colours/shapes, nature, India symbols, monuments, sky, helpers, environment, sports |
