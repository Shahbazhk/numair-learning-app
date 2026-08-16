const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "data", "grade-2", "maths.json");
const j = JSON.parse(fs.readFileSync(file, "utf8"));

const meas = j.sections.find((s) => s.id === "measurement");
if (meas) {
  meas.title = "Measurement (Length, Weight & Capacity)";
  meas.explanation =
    "We measure length with centimetres and metres, weight with grams and kilograms, and liquids with millilitres and litres. Choosing a sensible unit stops silly answers — like measuring a pencil in kilometres! Time and clocks have their own special lessons next.";
  meas.points = [
    "100 cm = 1 metre",
    "1000 g = 1 kilogram",
    "1000 ml = 1 litre",
    "Choose units that fit the object",
    "Compare longer/shorter and heavier/lighter"
  ];
  meas.examples = (meas.examples || []).filter((e) => e.title !== "School start");
  if (meas.examples.length < 3) {
    meas.examples.push({
      title: "School bag",
      problem: "Is a school bag nearer 3 g or 3 kg?",
      steps: [
        "A bag full of books is heavy",
        "Grams are for tiny things like a crayon"
      ],
      answer: "About 3 kg"
    });
  }
}

const clockSection = {
  id: "reading-clock",
  icon: "🕒",
  title: "Reading the Clock (Hours, Minutes & Seconds)",
  explanation:
    "A clock helps us know when to wake up, catch the school bus, eat lunch and go to bed. Look at a round (analogue) clock: the face has numbers 1 to 12. The short hand is the hour hand — it moves slowly. The long hand is the minute hand — it moves faster. Some clocks also have a thin second hand that ticks around once every minute. Digital clocks show numbers like 8:30. We practise simple times first: o’clock, half past, quarter past and quarter to.",
  points: [
    "Short hand = hours; long hand = minutes; thin hand (if any) = seconds",
    "60 seconds = 1 minute; 60 minutes = 1 hour; 24 hours = 1 day",
    "When the long hand is on 12, we say “o’clock” (for example 3:00 is 3 o’clock)",
    "Long hand on 6 = half past (30 minutes); on 3 = quarter past (15 minutes); on 9 = quarter to (45 minutes)",
    "Count minutes in jumps of 5 around the clock: 5, 10, 15 … 60",
    "Morning and afternoon: we often say a.m. (before noon) and p.m. (after noon) on a 12-hour clock"
  ],
  examples: [
    {
      title: "Find 4 o’clock",
      problem: "School ends near 4 o’clock. Where are the hands?",
      steps: [
        "Short hour hand points to 4",
        "Long minute hand points straight up to 12",
        "We write 4:00"
      ],
      answer: "Short hand on 4, long hand on 12 → 4:00"
    },
    {
      title: "Half past 7",
      problem: "Breakfast is at half past 7. What does the clock look like?",
      steps: [
        "Half past means 30 minutes",
        "Long hand points to 6",
        "Short hand is halfway between 7 and 8"
      ],
      answer: "7:30 (half past 7)"
    },
    {
      title: "Quarter past 2",
      problem: "Story time starts at quarter past 2. Show it on a clock.",
      steps: [
        "Quarter past = 15 minutes",
        "Long hand points to 3 (because 3 × 5 = 15)",
        "Short hand just after 2"
      ],
      answer: "2:15 (quarter past 2)"
    },
    {
      title: "Minutes by fives",
      problem: "The long hand is on 4. How many minutes past the hour?",
      steps: [
        "Each number is a jump of 5 minutes",
        "4 jumps of 5 → 4 × 5 = 20"
      ],
      answer: "20 minutes past"
    },
    {
      title: "Seconds are tiny",
      problem: "How many seconds are in 1 minute?",
      steps: [
        "A second is a quick tick — say “one elephant”",
        "It takes 60 seconds to fill one minute"
      ],
      answer: "60 seconds"
    }
  ]
};

const twelveTwentyFour = {
  id: "twelve-twenty-four-hour",
  icon: "🌙",
  title: "12-Hour and 24-Hour Time (Simple)",
  explanation:
    "Most home clocks are 12-hour clocks: the hands go around twice each day — once from midnight to noon, and once from noon to midnight. To tell morning from evening we use a.m. and p.m. Example: 8:00 a.m. is school time; 8:00 p.m. is bedtime story time. A 24-hour clock (often on phones, buses or railway boards) counts from 0 to 23 and does not need a.m./p.m. Afternoon and night times are bigger numbers: 15:00 means 3:00 p.m. For Grade 2 we only learn easy matches.",
  points: [
    "12-hour clock uses numbers 1–12 plus a.m. (morning) or p.m. (afternoon/evening)",
    "a.m. = after midnight until before noon; p.m. = after noon until before midnight",
    "Noon is 12:00 in the middle of the day; midnight starts a new day",
    "24-hour time: morning looks similar (8:00 → 08:00); afternoon adds 12 to the hour (3 p.m. → 15:00)",
    "Easy memory: school morning ≈ a.m.; after-lunch play ≈ p.m.",
    "Same moment can be written two ways: 4:00 p.m. = 16:00"
  ],
  examples: [
    {
      title: "School morning",
      problem: "The bus comes at 8 o’clock in the morning. Write it with a.m. or p.m.",
      steps: ["Morning is before noon", "Use a.m."],
      answer: "8:00 a.m."
    },
    {
      title: "Bedtime",
      problem: "Lights out at 9 o’clock at night. a.m. or p.m.?",
      steps: ["Night is after noon", "Use p.m."],
      answer: "9:00 p.m."
    },
    {
      title: "Match 24-hour",
      problem: "A railway board shows 14:00. What time is that on a home clock?",
      steps: [
        "14 is bigger than 12, so it is afternoon",
        "14 − 12 = 2",
        "So it is 2:00 p.m."
      ],
      answer: "2:00 p.m."
    },
    {
      title: "Write 24-hour",
      problem: "Football practice is at 5:00 p.m. Write 24-hour time.",
      steps: ["p.m. afternoon → add 12 to the hour", "5 + 12 = 17"],
      answer: "17:00"
    },
    {
      title: "Same time?",
      problem: "Is 7:00 a.m. the same as 19:00?",
      steps: [
        "7:00 a.m. is morning",
        "19:00 = 7:00 p.m. (evening)",
        "Different parts of the day"
      ],
      answer: "No — morning vs evening"
    }
  ]
};

const calendarSection = {
  id: "calendar-days",
  icon: "📅",
  title: "Calendar, Days and Months",
  explanation:
    "A calendar shows days, weeks and months. Knowing the date helps us plan holidays, birthdays and school tests. Seven days make one week. About four weeks make one month. Twelve months make one year. We use calendars and clocks together: the calendar says which day, the clock says what time.",
  points: [
    "7 days = 1 week; 12 months = 1 year",
    "Days: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday",
    "Months have 28, 29, 30 or 31 days",
    "Yesterday → today → tomorrow",
    "Festivals and birthdays are marked on calendars"
  ],
  examples: [
    {
      title: "Week length",
      problem: "How many days are in one week?",
      steps: ["Count Sunday to Saturday", "There are 7 day names"],
      answer: "7 days"
    },
    {
      title: "Tomorrow",
      problem: "If today is Friday, what day is tomorrow?",
      steps: ["Days follow a fixed order", "After Friday comes Saturday"],
      answer: "Saturday"
    },
    {
      title: "Months in a year",
      problem: "How many months are in one year?",
      steps: ["A full year has 12 months", "January to December"],
      answer: "12 months"
    }
  ]
};

j.sections = j.sections.filter(
  (s) => !["reading-clock", "twelve-twenty-four-hour", "calendar-days", "time-calendar"].includes(s.id)
);
const mIdx = j.sections.findIndex((s) => s.id === "measurement");
j.sections.splice(mIdx + 1, 0, clockSection, twelveTwentyFour, calendarSection);

const newQs = [
  {
    id: "mq-clock-1",
    type: "mcq",
    prompt: "Which hand shows the hours?",
    choices: ["Long hand", "Short hand", "Second hand", "Both the same"],
    answer: 1
  },
  {
    id: "mq-clock-2",
    type: "mcq",
    prompt: "When the long hand is on 12, the time is ___",
    choices: ["half past", "o’clock", "quarter to", "20 minutes past"],
    answer: 1
  },
  {
    id: "mq-clock-3",
    type: "mcq",
    prompt: "Half past 3 is written as",
    choices: ["3:15", "3:30", "3:45", "3:00"],
    answer: 1
  },
  {
    id: "mq-clock-4",
    type: "mcq",
    prompt: "60 minutes = ?",
    choices: ["1 second", "1 hour", "1 day", "1 week"],
    answer: 1
  },
  {
    id: "mq-clock-5",
    type: "mcq",
    prompt: "How many seconds are in 1 minute?",
    choices: ["10", "30", "60", "100"],
    answer: 2
  },
  {
    id: "mq-clock-6",
    type: "mcq",
    prompt: "Long hand on 3 means how many minutes past?",
    choices: ["3", "15", "30", "45"],
    answer: 1
  },
  {
    id: "mq-clock-7",
    type: "mcq",
    prompt: "School at 8 in the morning is written as",
    choices: ["8:00 p.m.", "8:00 a.m.", "20:00 a.m.", "8:30 p.m."],
    answer: 1
  },
  {
    id: "mq-clock-8",
    type: "mcq",
    prompt: "14:00 on a 24-hour clock means",
    choices: ["2:00 a.m.", "4:00 p.m.", "2:00 p.m.", "12:00 noon"],
    answer: 2
  },
  {
    id: "mq-clock-9",
    type: "mcq",
    prompt: "5:00 p.m. in 24-hour time is",
    choices: ["5:00", "15:00", "17:00", "20:00"],
    answer: 2
  },
  {
    id: "mq-clock-10",
    type: "mcq",
    prompt: "Quarter to 5 is the same as",
    choices: ["5:15", "4:45", "5:45", "4:15"],
    answer: 1
  }
];

const existingIds = new Set(j.questions.map((q) => q.id));
for (const q of newQs) {
  if (!existingIds.has(q.id)) j.questions.push(q);
}

j.grade = 2;
j.depth = "deep";

fs.writeFileSync(file, JSON.stringify(j, null, 2));
console.log(
  "OK sections=" +
    j.sections.length +
    " questions=" +
    j.questions.length +
    " | " +
    j.sections
      .filter((s) => /clock|calendar|Measurement|12-Hour/i.test(s.title))
      .map((s) => s.title)
      .join(" || ")
);
