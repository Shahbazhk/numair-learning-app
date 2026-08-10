/**
 * generate-curriculum.js
 * Creates CBSE-aligned original learning JSON for grades 1–10.
 *
 * Usage (from numair-app):
 *   node scripts/generate-curriculum.js
 *
 * Output: data/grade-{N}/{subject}.json
 * Subjects: maths, science, english, hindi, telugu, social-studies, gk
 *
 * Safety: never overwrite existing files under data/grade-2/ except telugu.json
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const SUBJECTS = [
  "maths",
  "science",
  "english",
  "hindi",
  "telugu",
  "social-studies",
  "gk",
];
const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function isDeep(grade) {
  return grade <= 5;
}

function depthLabel(grade) {
  return isDeep(grade) ? "deep" : "outline";
}

function tablesFor(grade) {
  if (grade === 1) {
    return {
      title: "Multiplication Tables",
      subtitle: "Start with tables 1 to 5 — each table goes up to ×10. Say them aloud every day!",
      from: 1,
      to: 5,
      upto: 10,
    };
  }
  if (grade <= 5) {
    return {
      title: "Multiplication Tables",
      subtitle: `Practice tables 1 to ${grade === 2 ? 10 : 12} — each table goes up to ×12.`,
      from: 1,
      to: grade === 2 ? 10 : 12,
      upto: 12,
    };
  }
  return {
    title: "Multiplication Tables",
    subtitle: "Keep fluent: tables 1 to 12 up to ×12 — useful for fractions, algebra and speed.",
    from: 1,
    to: 12,
    upto: 12,
  };
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\u0c00-\u0c7f\u0900-\u097f]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "topic";
}

function mcq(id, prompt, choices, answer) {
  return { id, type: "mcq", prompt, choices, answer };
}

function ex(title, problem, steps, answer) {
  return { title, problem, steps, answer };
}

function section(id, icon, title, explanation, points, examples) {
  return { id, icon, title, explanation, points, examples };
}

/** Build deep content from outline nodes */
function expandDeep(grade, subject, nodes) {
  const sections = nodes.map((n, i) => {
    const pts = padPoints(n.points, n.title, grade, subject, 3);
    const examples =
      n.examples ||
      defaultExamples(n.title, grade, subject, i);
    return section(
      n.id || slug(n.title),
      n.icon || pickIcon(subject, i),
      n.title,
      n.explanation || defaultExplain(n.title, grade, subject),
      pts.slice(0, 5),
      examples.slice(0, 2)
    );
  });
  const questions = (nodes.flatMap((n, i) => n.questions || []) || [])
    .concat(defaultQuestions(grade, subject, sections))
    .slice(0, 15);
  while (questions.length < 8) {
    questions.push(
      mcq(
        `q-fill-${questions.length}`,
        `Which topic helps us learn about "${sections[questions.length % sections.length].title}"?`,
        [
          sections[questions.length % sections.length].title,
          "Skipping school",
          "Ignoring practice",
          "Giving up",
        ],
        0
      )
    );
  }
  return { sections, questions: questions.slice(0, Math.min(15, Math.max(8, questions.length))) };
}

function padPoints(points, title, grade, subject, min) {
  const pts = (points || []).slice();
  const fallback = defaultPoints(title, grade, subject);
  let i = 0;
  while (pts.length < min) {
    pts.push(fallback[i % fallback.length] || `Practise key ideas from "${title}"`);
    i += 1;
  }
  return pts;
}

function expandOutline(grade, subject, nodes) {
  const sections = nodes.map((n, i) =>
    section(
      n.id || slug(n.title),
      n.icon || pickIcon(subject, i),
      n.title,
      n.explanation || defaultExplain(n.title, grade, subject),
      padPoints(n.points, n.title, grade, subject, 3).slice(0, 3),
      (n.examples || []).slice(0, 1)
    )
  );
  let questions = (nodes.flatMap((n) => n.questions || []) || []).concat(
    defaultQuestions(grade, subject, sections)
  );
  questions = questions.slice(0, 10);
  while (questions.length < 6) {
    const s = sections[questions.length % sections.length];
    questions.push(
      mcq(
        `oq${questions.length + 1}`,
        `Grade ${grade}: What is a key idea in "${s.title}"?`,
        [s.points[0] || s.title, "Forget homework", "Never revise", "Avoid reading"],
        0
      )
    );
  }
  return { sections, questions };
}

function pickIcon(subject, i) {
  const map = {
    maths: ["🔢", "➕", "➖", "✖️", "➗", "📐", "📏", "🧮", "💰", "⏰", "📊", "🔷", "📈", "🧩", "🌡️"],
    science: ["🌱", "🔬", "⚡", "🧪", "🌍", "🦴", "💧", "🌬️", "☀️", "🧲", "🧬", "🔭", "🌡️", "🫀", "🌿"],
    english: ["📖", "✏️", "🗣️", "📝", "📚", "🔤", "💬", "✍️", "🎭", "📰", "🧩", "🌟", "📜", "🎯", "💡"],
    hindi: ["🔠", "📝", "📖", "🗣️", "✍️", "📘", "🌟", "🎯", "💬", "📚", "🧩", "✨", "🖊️", "🔤", "📗"],
    telugu: ["తె", "📖", "🗣️", "✍️", "🌟", "📚", "🔤", "💬", "🎯", "✨", "📝", "🧩", "📘", "🖊️", "💫"],
    "social-studies": ["🏠", "🏫", "🇮🇳", "🗺️", "🏛️", "⚖️", "🌏", "🚂", "👥", "📜", "🗳️", "💰", "🌐", "🏞️", "🧭"],
    gk: ["🌍", "🇮🇳", "🏆", "🌳", "📅", "⚽", "🔬", "🎨", "🛰️", "🏅", "🌈", "🚩", "📚", "🔭", "💡"],
  };
  const arr = map[subject] || ["📘"];
  return arr[i % arr.length];
}

function defaultExplain(title, grade, subject) {
  return `In CBSE Grade ${grade} ${subjectLabel(subject)}, we explore "${title}" with clear ideas you can use in class and daily life. Read the points, try an example, then check yourself with the quiz.`;
}

function subjectLabel(subject) {
  const labels = {
    maths: "Maths",
    science: "Science",
    english: "English",
    hindi: "Hindi",
    telugu: "Telugu",
    "social-studies": "Social Studies",
    gk: "General Knowledge",
  };
  return labels[subject] || subject;
}

function defaultPoints(title, grade, subject) {
  if (subject === "telugu") {
    return [
      `"${title}" — చదవండి మరియు అర్థం చేసుకోండి (read and understand)`,
      "కొత్త పదాలు గమనించండి (notice new words)",
      "సాధనతో నమ్మకం పెరుగుతుంది (practice builds confidence)",
    ];
  }
  if (subject === "hindi") {
    return [
      `"${title}" को ध्यान से पढ़ें`,
      "उदाहरण वाक्य बनाकर समझें",
      "रोज़ थोड़ी साधना करें",
    ];
  }
  return [
    `Understand the main idea of "${title}" for Grade ${grade}`,
    "Use everyday examples to remember key facts",
    "Practise with short questions after each topic",
  ];
}

function defaultExamples(title, grade, subject, i) {
  if (subject === "maths") {
    const a = 2 + (i % 5);
    const b = 3 + (i % 4);
    return [
      ex(
        "Try it",
        `A Grade ${grade} warm-up for "${title}": what is ${a} + ${b}?`,
        [`Add ones carefully: ${a} + ${b}`],
        String(a + b)
      ),
      ex(
        "Check",
        `If you have ${a} pencils and get ${b} more, how many in all?`,
        ["Altogether means add"],
        String(a + b)
      ),
    ];
  }
  if (subject === "telugu") {
    return [
      ex(
        "పదం",
        `"${title}" లో ఒక సాధారణ పదం ఏమిటి?`,
        ["పాఠం చదవండి", "ఉదాహరణ పదం గుర్తుంచుకోండి"],
        "సాధనతో నేర్చుకుందాం"
      ),
    ];
  }
  return [
    ex(
      "Think",
      `Give one real-life example of "${title}".`,
      ["Link the idea to home, school or nature"],
      `Something you can observe related to ${title}`
    ),
    ex(
      "Remember",
      `What is one key point from "${title}"?`,
      ["Re-read the points list"],
      "The first point in the lesson"
    ),
  ];
}

function defaultQuestions(grade, subject, sections) {
  const qs = [];
  sections.forEach((s, i) => {
    if (qs.length >= 12) return;
    qs.push(
      mcq(
        `${subject[0]}${grade}q${i + 1}`,
        `Which topic are we learning?`,
        [s.title, "Random games only", "Ignoring books", "Sleeping in class"],
        0
      )
    );
    if (s.points && s.points[0] && qs.length < 12) {
      qs.push(
        mcq(
          `${subject[0]}${grade}q${i + 1}b`,
          `A useful idea from "${s.title}" is:`,
          [
            s.points[0],
            "Never ask questions",
            "Skip revision",
            "Copy without understanding",
          ],
          0
        )
      );
    }
  });
  return qs;
}

/* -------------------------------------------------------------------------- */
/* Curriculum outlines by grade & subject (original kid-friendly wording)     */
/* -------------------------------------------------------------------------- */

function mathsNodes(grade) {
  const deep = {
    1: [
      {
        id: "count-20",
        icon: "🔢",
        title: "Counting 1 to 20",
        explanation:
          "Numbers tell how many. We count objects in a line, clap as we say each number, and write the numeral beside a set of pictures.",
        points: [
          "Say numbers in order without skipping",
          "Match groups of objects to the correct number",
          "Find before and after numbers",
          "Zero means none left",
        ],
        examples: [
          ex("Apples", "Numair has 7 apples. What comes after 7?", ["Count one more"], "8"),
          ex("Fingers", "Show 5 on one hand. What number is that?", ["Count each finger"], "5"),
        ],
        questions: [
          mcq("m1q1", "What comes after 9?", ["8", "10", "11", "7"], 1),
          mcq("m1q2", "How many fingers on one hand?", ["4", "5", "6", "10"], 1),
        ],
      },
      {
        id: "more-less",
        icon: "⚖️",
        title: "More, Less and Same",
        explanation:
          "Compare two groups. The group with extra objects has more; the other has less. Same means both groups match.",
        points: [
          "Line up objects to compare easily",
          "Use words more / less / equal",
          "Draw circles under each group to check",
        ],
        examples: [
          ex("Crayons", "3 crayons and 5 crayons — which has more?", ["5 is bigger than 3"], "5 crayons"),
          ex("Biscuits", "4 and 4 biscuits — more, less or same?", ["Both match"], "Same"),
        ],
        questions: [
          mcq("m1q3", "Which is more: 2 or 6?", ["2", "6", "Same", "0"], 1),
        ],
      },
      {
        id: "add-10",
        icon: "➕",
        title: "Addition within 10",
        explanation:
          "Addition finds the total. Put groups together and count all. The signs + and = help write number sentences.",
        points: [
          "Join two groups then count",
          "Start with the larger number and count on",
          "Order can change: 2+3 = 3+2",
        ],
        examples: [
          ex("Toys", "2 cars and 3 cars. How many in all?", ["2+3"], "5"),
          ex("Stars", "4 + 1 = ?", ["Count on from 4"], "5"),
        ],
        questions: [
          mcq("m1q4", "3 + 2 = ?", ["4", "5", "6", "1"], 1),
          mcq("m1q5", "1 + 6 = ?", ["5", "6", "7", "8"], 2),
        ],
      },
      {
        id: "sub-10",
        icon: "➖",
        title: "Subtraction within 10",
        explanation:
          "Subtraction finds how many are left. Take some away, or find the difference between two numbers.",
        points: [
          "Cross out pictures you take away",
          "Keywords: left, remain, how many more",
          "Check by adding the answer back",
        ],
        examples: [
          ex("Balloons", "5 balloons, 2 fly away. Left?", ["5−2"], "3"),
          ex("Mangoes", "8 − 3 = ?", ["Count back 3 from 8"], "5"),
        ],
        questions: [
          mcq("m1q6", "7 − 2 = ?", ["4", "5", "6", "9"], 1),
        ],
      },
      {
        id: "shapes-1",
        icon: "🔷",
        title: "Shapes Around Us",
        explanation:
          "Circles are round, squares have 4 equal sides, triangles have 3 sides, and rectangles have opposite sides equal.",
        points: [
          "Circle: wheels, bangles",
          "Square: tiles, windows",
          "Triangle: road signs, sandwiches cut that way",
          "Rectangle: books, doors",
        ],
        examples: [
          ex("Home", "A round plate looks like which shape?", ["No corners, round edge"], "Circle"),
          ex("Book", "A book cover is usually a…", ["Longer sides opposite equal"], "Rectangle"),
        ],
        questions: [
          mcq("m1q7", "A triangle has how many sides?", ["2", "3", "4", "5"], 1),
        ],
      },
      {
        id: "patterns-1",
        icon: "🌈",
        title: "Simple Patterns",
        explanation:
          "Patterns repeat in a rule. Spot what comes next by looking at colour, shape or size order.",
        points: [
          "Find the repeating unit",
          "Say the pattern aloud: red-blue-red-blue",
          "Continue the next 2 terms",
        ],
        examples: [
          ex("Beads", "Red, blue, red, blue, ___?", ["Alternating colours"], "Red"),
          ex("Shapes", "○ □ ○ □ ___?", ["Circle then square repeats"], "○"),
        ],
        questions: [
          mcq("m1q8", "In ★ ♥ ★ ♥, what comes next?", ["★", "♥", "◆", "●"], 0),
        ],
      },
      {
        id: "measure-1",
        icon: "📏",
        title: "Long and Short",
        explanation:
          "We compare length by placing objects side by side. Longer sticks past the end; shorter ones stop earlier.",
        points: [
          "Start from the same line",
          "Use words longer / shorter / taller",
          "Hands and footsteps are informal measures",
        ],
        examples: [
          ex("Pencils", "A new pencil and a stub — which is longer?", ["Compare tips"], "New pencil"),
        ],
        questions: [
          mcq("m1q9", "To compare length, start from…", ["Different ends", "The same line", "The middle", "Anywhere"], 1),
        ],
      },
      {
        id: "money-1",
        icon: "💰",
        title: "Coins We Know",
        explanation:
          "India uses rupees. Small coins help us buy snacks. Counting coins builds number sense for shopping.",
        points: [
          "1 rupee coins add up",
          "Know common coin values you see with family",
          "Saving small amounts is a useful habit",
        ],
        examples: [
          ex("Shop", "Two ₹1 coins make how many rupees?", ["1+1"], "₹2"),
        ],
        questions: [
          mcq("m1q10", "Two ₹1 coins equal…", ["₹1", "₹2", "₹5", "₹10"], 1),
        ],
      },
      {
        id: "time-1",
        icon: "🌅",
        title: "Day and Night Time Words",
        explanation:
          "Morning, afternoon, evening and night help us talk about when things happen in a day.",
        points: [
          "Morning: wake up, breakfast",
          "Afternoon: school and play",
          "Night: sleep and rest",
        ],
        examples: [
          ex("Routine", "We usually sleep at…", ["Dark and quiet time"], "Night"),
        ],
        questions: [
          mcq("m1q11", "Breakfast is usually in the…", ["Night", "Morning", "Midnight only", "Never"], 1),
        ],
      },
      {
        id: "data-1",
        icon: "📊",
        title: "Sorting and Pictographs Intro",
        explanation:
          "Sorting puts like things together. A simple pictograph uses pictures to show how many in each group.",
        points: [
          "Sort by colour, size or type",
          "One picture can stand for one object",
          "Count pictures to answer questions",
        ],
        examples: [
          ex("Buttons", "3 red and 2 blue buttons — how many red?", ["Count red only"], "3"),
        ],
        questions: [
          mcq("m1q12", "Sorting means…", ["Mixing randomly", "Grouping alike things", "Throwing away", "Hiding objects"], 1),
        ],
      },
    ],
    3: [
      {
        id: "numbers-10000",
        title: "Numbers up to 10000",
        explanation: "Read, write and compare 4-digit numbers. Place value now includes thousands.",
        points: ["Thousands-hundreds-tens-ones", "Expanded form", "Compare digit by digit from the left", "Skip count by 50s and 100s"],
        examples: [
          ex("Compare", "Which is greater: 3456 or 3546?", ["Thousands same; hundreds 4 < 5"], "3546"),
          ex("Expand", "Expand 5027", ["5 thousands, 0 hundreds, 2 tens, 7 ones"], "5000+20+7"),
        ],
      },
      {
        id: "add-sub-4",
        title: "Addition & Subtraction (4-digit)",
        explanation: "Add and subtract large numbers column-wise with carrying and borrowing.",
        points: ["Align place values", "Carry when ≥10", "Borrow when needed", "Estimate first for sense-check"],
        examples: [
          ex("Add", "1234 + 2567", ["Ones to thousands carefully"], "3801"),
          ex("Sub", "5000 − 1284", ["Borrow across zeros"], "3716"),
        ],
      },
      {
        id: "multiply-intro",
        title: "Multiplication Basics",
        explanation: "Multiplication is repeated addition. Tables make products faster.",
        points: ["a×b means a groups of b", "Order can swap", "Use tables daily", "Word problems: each / times"],
        examples: [
          ex("Boxes", "4 boxes with 6 pencils each", ["4×6"], "24"),
          ex("Table", "7 × 8 = ?", ["Know table of 7"], "56"),
        ],
      },
      {
        id: "divide-intro",
        title: "Division Basics",
        explanation: "Division shares equally or groups into equal sets. Relate to multiplication.",
        points: ["÷ means equal share", "Remainder when not exact", "Check: quotient×divisor + remainder = dividend"],
        examples: [
          ex("Share", "12 sweets among 3 children", ["12÷3"], "4 each"),
          ex("Remain", "17 ÷ 5", ["3 groups of 5, remainder 2"], "3 R2"),
        ],
      },
      {
        id: "fractions-half",
        title: "Fractions: Halves and Quarters",
        explanation: "A fraction names equal parts of a whole. Half is 1 of 2 equal parts; quarter is 1 of 4.",
        points: ["Equal parts matter", "1/2 + 1/2 = 1", "Shade shapes to show fractions"],
        examples: [
          ex("Pizza", "Pizza cut into 2 equal parts: one part is…", ["Two equal shares"], "1/2"),
        ],
      },
      {
        id: "geometry-3",
        title: "2D and 3D Shapes",
        explanation: "Flat shapes (2D) and solid shapes (3D) appear all around school and home.",
        points: ["2D: square, rectangle, circle, triangle", "3D: cube, cuboid, sphere, cylinder, cone", "Faces, edges, corners on solids"],
        examples: [
          ex("Ball", "A football looks like a…", ["Round solid"], "Sphere"),
        ],
      },
      {
        id: "measure-3",
        title: "Length, Weight and Capacity",
        explanation: "We measure with standard units: centimetre/metre, gram/kilogram, millilitre/litre.",
        points: ["cm and m for length", "g and kg for weight", "ml and L for liquids", "Choose suitable units"],
        examples: [
          ex("Bottle", "A water bottle often holds about…", ["Roughly 1 litre sense"], "1 L (approx)"),
        ],
      },
      {
        id: "money-time-3",
        title: "Money and Time",
        explanation: "Rupees and paise; reading clock hours and half hours supports daily planning.",
        points: ["Convert paise when needed", "Hour and half-past", "Calendar: days and months"],
        examples: [
          ex("Clock", "Clock shows 3:30. It is half past…", ["Minute hand on 6"], "3"),
        ],
      },
      {
        id: "data-3",
        title: "Pictographs and Bar Sense",
        explanation: "Pictures or simple bars show data. Always read the key (what one symbol means).",
        points: ["Read the title and key", "Count symbols carefully", "Answer how many more/less"],
        examples: [
          ex("Fruits", "If ★ = 2 apples and you see 3 stars, apples = ?", ["3×2"], "6"),
        ],
      },
      {
        id: "patterns-symm",
        title: "Patterns and Symmetry",
        explanation: "Continue number and shape patterns. Line symmetry mirrors halves of a shape.",
        points: ["Find the rule", "Fold test for symmetry", "Nature shows many symmetries"],
        examples: [
          ex("Seq", "2, 4, 6, 8, ___", ["Add 2 each time"], "10"),
        ],
      },
    ],
    4: [
      {
        id: "large-numbers",
        title: "Large Numbers & Indian Place Value",
        explanation: "Indian system uses ones, tens, hundreds, thousands, ten thousands, lakhs. Commas help reading.",
        points: ["Read numbers in Indian system", "Compare and order large numbers", "Roman numerals basics (I–XX and beyond as needed)"],
        examples: [
          ex("Read", "Write 45027 in words (Indian)", ["Forty-five thousand twenty-seven"], "45027 → forty-five thousand twenty-seven"),
        ],
      },
      {
        id: "ops-4",
        title: "Operations with Larger Numbers",
        explanation: "Fluent + − × ÷ with multi-digit numbers and sensible estimation.",
        points: ["Estimate before exact answer", "Multiplication by 2-digit numbers", "Long division steps"],
        examples: [
          ex("Est", "Estimate 48 × 21", ["≈50×20=1000"], "About 1000"),
        ],
      },
      {
        id: "factors-multiples",
        title: "Factors and Multiples",
        explanation: "Factors divide a number exactly. Multiples are products of a number with whole numbers.",
        points: ["List factors in pairs", "Common factors", "Multiples never end for counting numbers"],
        examples: [
          ex("Factors", "Factors of 12?", ["1×12, 2×6, 3×4"], "1,2,3,4,6,12"),
        ],
      },
      {
        id: "fractions-4",
        title: "Fractions: Like and Unlike",
        explanation: "Like fractions share denominators. Compare, add and subtract like fractions; introduce equivalents.",
        points: ["Numerator / denominator", "Equivalent fractions", "Add like fractions by adding numerators"],
        examples: [
          ex("Add", "1/5 + 2/5", ["Same denominator"], "3/5"),
        ],
      },
      {
        id: "decimals-intro",
        title: "Decimals Introduction",
        explanation: "Tenths and hundredths extend place value to the right of the decimal point.",
        points: ["0.1 is one tenth", "Money uses two decimal places", "Compare decimals carefully"],
        examples: [
          ex("Money", "₹12.50 means 12 rupees and…", ["50 paise"], "50 paise"),
        ],
      },
      {
        id: "geometry-4",
        title: "Angles, Circles and Perimeter",
        explanation: "Angles are turns; perimeter is the boundary length around a shape.",
        points: ["Right, acute, obtuse ideas", "Radius and diameter of circle", "Perimeter of rectangle = 2(l+b)"],
        examples: [
          ex("Perim", "Rectangle 5 cm by 3 cm perimeter?", ["2(5+3)"], "16 cm"),
        ],
      },
      {
        id: "area-4",
        title: "Area of Rectangles",
        explanation: "Area covers the inside. Count unit squares or use length × breadth.",
        points: ["Unit squares", "Area = l × b for rectangles", "Same perimeter can give different areas"],
        examples: [
          ex("Tile", "4 by 3 unit square tiles cover…", ["4×3"], "12 square units"),
        ],
      },
      {
        id: "measure-4",
        title: "Measurement Conversions",
        explanation: "Convert between common metric units for length, mass and capacity.",
        points: ["100 cm = 1 m", "1000 g = 1 kg", "1000 ml = 1 L"],
        examples: [
          ex("Conv", "3 m = ? cm", ["×100"], "300 cm"),
        ],
      },
      {
        id: "data-4",
        title: "Bar Graphs",
        explanation: "Bar graphs compare quantities with a clear scale on an axis.",
        points: ["Read scale", "Compare tallest/shortest bars", "Create a simple bar chart from a tally"],
        examples: [
          ex("Scale", "If scale is 1 cm = 5 books and bar is 4 cm, books = ?", ["4×5"], "20"),
        ],
      },
      {
        id: "symmetry-patterns-4",
        title: "Symmetry and Number Patterns",
        explanation: "Explore reflection symmetry and growing number patterns for problem solving.",
        points: ["Lines of symmetry", "Odd/even patterns", "Rules with × and +"],
        examples: [
          ex("Rule", "3, 6, 12, 24… rule?", ["×2 each time"], "Multiply by 2"),
        ],
      },
    ],
    5: [
      {
        id: "place-value-5",
        title: "Numbers to Lakhs and Beyond",
        explanation: "Confident reading/writing of large numbers; rounding for estimation.",
        points: ["Indian place-value chart", "Round to nearest 10, 100, 1000", "Roman numerals review"],
        examples: [
          ex("Round", "Round 4782 to nearest 100", ["Look at tens digit 8 ≥5"], "4800"),
        ],
      },
      {
        id: "ops-5",
        title: "All Four Operations Fluently",
        explanation: "Apply + − × ÷ in multi-step word problems with sensible checking.",
        points: ["BODMAS intro for simple cases", "Inverse operations check", "Multi-step stories"],
        examples: [
          ex("Story", "A school has 24 rows of 35 seats. Total seats?", ["24×35"], "840"),
        ],
      },
      {
        id: "hcf-lcm",
        title: "HCF and LCM",
        explanation: "HCF is the greatest shared factor; LCM is the least shared multiple — useful for sharing and scheduling.",
        points: ["Prime factorization idea", "HCF for greatest common share", "LCM for repeating events"],
        examples: [
          ex("HCF", "HCF of 12 and 18", ["Common factors; greatest is 6"], "6"),
        ],
      },
      {
        id: "fractions-5",
        title: "Fraction Operations",
        explanation: "Add/subtract unlike fractions using common denominators; multiply a fraction by a whole number.",
        points: ["Common denominator", "Simplify answers", "Mixed numbers intro"],
        examples: [
          ex("Add", "1/3 + 1/6", ["1/3=2/6; 2/6+1/6"], "1/2"),
        ],
      },
      {
        id: "decimals-5",
        title: "Decimals and Percent Sense",
        explanation: "Operate with decimals; connect fractions, decimals and simple percentages.",
        points: ["Add/subtract decimals", "Multiply decimals by 10/100", "50% = 1/2"],
        examples: [
          ex("%", "50% of 20", ["Half of 20"], "10"),
        ],
      },
      {
        id: "geometry-5",
        title: "Triangles, Circles and Nets",
        explanation: "Classify triangles; circle terms; nets fold into solid shapes.",
        points: ["Equilateral, isosceles, scalene", "Radius, diameter, circumference idea", "Cube/cuboid nets"],
        examples: [
          ex("Diam", "If radius is 4 cm, diameter is…", ["2×radius"], "8 cm"),
        ],
      },
      {
        id: "perimeter-area-5",
        title: "Perimeter and Area",
        explanation: "Perimeter for fencing; area for flooring — choose formulas carefully.",
        points: ["Rectangle and square formulas", "Composite shapes by split", "Units: cm², m²"],
        examples: [
          ex("Area", "Square side 9 cm area?", ["9×9"], "81 cm²"),
        ],
      },
      {
        id: "volume-intro",
        title: "Volume of Cuboids",
        explanation: "Volume fills space: length × breadth × height for a cuboid.",
        points: ["Cubic units", "V = l×b×h", "Compare capacity ideas"],
        examples: [
          ex("Box", "2×3×4 cuboid volume?", ["Multiply three dimensions"], "24 cubic units"),
        ],
      },
      {
        id: "data-5",
        title: "Average and Graphs",
        explanation: "Mean (average) summarises data; graphs display information clearly.",
        points: ["Average = sum ÷ count", "Read double bar ideas lightly", "Interpret pie-chart quarters"],
        examples: [
          ex("Avg", "Average of 4, 6, 8", ["(4+6+8)/3"], "6"),
        ],
      },
      {
        id: "patterns-integers-intro",
        title: "Patterns and Integer Warm-up",
        explanation: "Growing patterns prepare algebra; negative numbers appear on thermometer/timeline stories.",
        points: ["Find nth term feelings (simple)", "Above/below zero intro", "Map patterns to rules"],
        examples: [
          ex("Thermo", "Temperature −2°C is… zero", ["Negative means below"], "Below"),
        ],
      },
    ],
  };

  if (deep[grade]) return deep[grade];

  // Grade 2 deep exists on disk — outline used only if regenerating; provide structure for completeness
  if (grade === 2) {
    return [
      { title: "Numbers up to 1000", points: ["Count, compare, order", "Before/after/between", "Skip counting"] },
      { title: "Place Value", points: ["Ones tens hundreds", "Expanded form", "Face value vs place value"] },
      { title: "Addition", points: ["With and without carry", "Word problems"] },
      { title: "Subtraction", points: ["With and without borrow", "Check by addition"] },
      { title: "Multiplication", points: ["Repeated addition", "Tables practice"] },
      { title: "Division", points: ["Equal sharing", "Relate to ×"] },
      { title: "Fractions 1/2 and 1/4", points: ["Equal parts", "Shade halves and quarters"] },
      { title: "Shapes and Patterns", points: ["2D shapes", "Simple repeating patterns"] },
      { title: "Measurement", points: ["Length weight capacity informal/standard"] },
      { title: "Money", points: ["Rupees", "Simple bills"] },
      { title: "Time", points: ["Hours and half hours", "Calendar"] },
      { title: "Data Handling", points: ["Pictographs", "Tally"] },
    ];
  }

  const outlines = {
    6: [
      { title: "Knowing Our Numbers", points: ["Indian & international systems", "Estimation", "Large number operations"] },
      { title: "Whole Numbers", points: ["Number line", "Properties of + and ×"] },
      { title: "Playing with Numbers", points: ["Factors multiples", "Primes composites", "Divisibility tests"] },
      { title: "Basic Geometrical Ideas", points: ["Point line ray", "Angles", "Polygons intro"] },
      { title: "Understanding Elementary Shapes", points: ["Measuring angles", "Triangles classification", "3D shapes"] },
      { title: "Integers", points: ["Opposite numbers", "Add/subtract integers", "Number line moves"] },
      { title: "Fractions", points: ["Types of fractions", "Compare & operate"] },
      { title: "Decimals", points: ["Place value", "Operations", "Word problems"] },
      { title: "Data Handling", points: ["Pictograph bar graph", "Mean idea"] },
      { title: "Mensuration", points: ["Perimeter", "Area of rectangle/square"] },
      { title: "Algebra Intro", points: ["Variables", "Simple expressions", "Patterns to rules"] },
      { title: "Ratio and Proportion Intro", points: ["Compare quantities", "Unitary method"] },
      { title: "Symmetry", points: ["Line symmetry", "Reflection"] },
      { title: "Practical Geometry", points: ["Construct angles & shapes with tools"] },
    ],
    7: [
      { title: "Integers", points: ["Multiply/divide integers", "Properties"] },
      { title: "Fractions and Decimals", points: ["All four operations", "Word problems"] },
      { title: "Data Handling", points: ["Mean median mode intro", "Bar graphs"] },
      { title: "Simple Equations", points: ["Balance idea", "Solve linear equations"] },
      { title: "Lines and Angles", points: ["Complementary supplementary", "Transversals"] },
      { title: "The Triangle and Its Properties", points: ["Angle sum", "Exterior angle", "Inequality"] },
      { title: "Congruence of Triangles", points: ["SSS SAS ASA RHS ideas"] },
      { title: "Comparing Quantities", points: ["Ratio percentage", "Profit loss simple", "Simple interest intro"] },
      { title: "Rational Numbers", points: ["Number line", "Operations"] },
      { title: "Practical Geometry", points: ["Construct triangles"] },
      { title: "Perimeter and Area", points: ["Parallelogram triangle circles intro"] },
      { title: "Algebraic Expressions", points: ["Terms coefficients", "Add/subtract expressions"] },
      { title: "Exponents and Powers", points: ["Laws of exponents", "Standard form"] },
      { title: "Symmetry and Visualising Solids", points: ["Rotational symmetry", "Nets of solids"] },
    ],
    8: [
      { title: "Rational Numbers", points: ["Properties", "Operations on rationals"] },
      { title: "Linear Equations in One Variable", points: ["Solve & apply", "Word problems"] },
      { title: "Understanding Quadrilaterals", points: ["Parallelogram properties", "Special quads"] },
      { title: "Practical Geometry", points: ["Construct quadrilaterals"] },
      { title: "Data Handling", points: ["Grouped data", "Probability basics", "Pie charts"] },
      { title: "Squares and Square Roots", points: ["Perfect squares", "Find square roots"] },
      { title: "Cubes and Cube Roots", points: ["Perfect cubes", "Cube roots"] },
      { title: "Comparing Quantities", points: ["Compound interest intro", "Discounts taxes"] },
      { title: "Algebraic Expressions and Identities", points: ["(a+b)² etc.", "Factorisation start"] },
      { title: "Visualising Solid Shapes", points: ["Views", "Euler’s formula intro"] },
      { title: "Mensuration", points: ["Surface area volume of cuboid cylinder"] },
      { title: "Exponents and Powers", points: ["Negative exponents", "Scientific notation"] },
      { title: "Direct and Inverse Proportions", points: ["Tables graphs", "Applications"] },
      { title: "Factorisation & Introduction to Graphs", points: ["Factor methods", "Linear graphs"] },
    ],
    9: [
      { title: "Number Systems", points: ["Irrationals", "Real numbers", "Decimal expansions"] },
      { title: "Polynomials", points: ["Degree zeros", "Factor & remainder theorems intro"] },
      { title: "Coordinate Geometry", points: ["Cartesian plane", "Plotting points"] },
      { title: "Linear Equations in Two Variables", points: ["Solutions as lines", "Graph"] },
      { title: "Introduction to Euclid’s Geometry", points: ["Axioms postulates", "History sense"] },
      { title: "Lines and Angles", points: ["Parallel lines proofs ideas"] },
      { title: "Triangles", points: ["Congruence", "Inequalities"] },
      { title: "Quadrilaterals", points: ["Mid-point theorem", "Properties"] },
      { title: "Circles", points: ["Chords angles", "Cyclic ideas"] },
      { title: "Heron’s Formula", points: ["Area from 3 sides"] },
      { title: "Surface Areas and Volumes", points: ["Cube cuboid cylinder cone sphere"] },
      { title: "Statistics", points: ["Mean median mode", "Presentation"] },
      { title: "Probability", points: ["Classical probability", "Simple experiments"] },
    ],
    10: [
      { title: "Real Numbers", points: ["Euclid’s division", "Fundamental theorem of arithmetic", "Irrational proofs idea"] },
      { title: "Polynomials", points: ["Zeros & coefficients", "Division algorithm"] },
      { title: "Pair of Linear Equations", points: ["Graphical algebraic methods", "Consistency"] },
      { title: "Quadratic Equations", points: ["Factorisation formula", "Nature of roots"] },
      { title: "Arithmetic Progressions", points: ["nth term", "Sum of n terms"] },
      { title: "Triangles", points: ["Similarity", "Pythagoras applications"] },
      { title: "Coordinate Geometry", points: ["Distance section formula", "Area of triangle"] },
      { title: "Trigonometry", points: ["Ratios identities", "Heights & distances"] },
      { title: "Circles", points: ["Tangent theorems"] },
      { title: "Areas Related to Circles", points: ["Sector segment"] },
      { title: "Surface Areas and Volumes", points: ["Combination of solids", "Conversion"] },
      { title: "Statistics", points: ["Mean median mode grouped", "Ogive idea"] },
      { title: "Probability", points: ["Theoretical probability", "Complementary events"] },
    ],
  };
  return outlines[grade] || outlines[6];
}

function scienceNodes(grade) {
  if (grade <= 5) {
    const map = {
      1: [
        { title: "Myself and My Body", explanation: "EVS starts with me: body parts help us work, play and stay safe.", points: ["Name main body parts", "Five senses explore the world", "Clean habits keep us healthy"], examples: [ex("Sense", "We see with our…", ["Sight"], "Eyes")] },
        { title: "My Family", explanation: "Families care for each other. Members help with different jobs at home.", points: ["Parents caregivers siblings", "Helping at home", "Love and respect"], examples: [ex("Help", "Setting plates is a way to…", ["Family help"], "Help at home")] },
        { title: "Plants Near Me", explanation: "Plants need soil, water, air and sunlight. Leaves, flowers and fruits look different.", points: ["Big trees and small plants", "Do not pluck carelessly", "Plants give shade and food"], examples: [ex("Need", "Plants need water and…", ["Sunlight"], "Sunlight")] },
        { title: "Animals Around Us", explanation: "Pet, farm and wild animals live in different places and eat different food.", points: ["Pets need care", "Animals move in different ways", "Be kind to animals"], examples: [ex("Pet", "A common pet that barks is a…", ["Pet"], "Dog")] },
        { title: "Food We Eat", explanation: "Food gives energy. Meals can include grains, vegetables, fruits and water.", points: ["Eat fresh food", "Wash fruits", "Drink clean water"], examples: [ex("Energy", "Food helps us…", ["Energy"], "Grow and play")] },
        { title: "Water and Air", explanation: "We need clean air and water every day. Saving water is everyone’s job.", points: ["Do not waste water", "Air is around us", "Keep surroundings clean"], examples: [ex("Save", "Turn off the tap to…", ["Save"], "Save water")] },
        { title: "Houses and Clothes", explanation: "Houses shelter us; clothes suit weather and culture.", points: ["Types of houses", "Cotton in summer ideas", "Keep home tidy"], examples: [ex("Rain", "Umbrella helps in…", ["Weather"], "Rain")] },
        { title: "Safety and Hygiene", explanation: "Simple rules protect us on roads, at home and while playing.", points: ["Look before crossing", "Wash hands", "Tell an adult if hurt"], examples: [ex("Road", "Cross at the zebra…", ["Safety"], "Crossing")] },
        { title: "Seasons We Feel", explanation: "Hot, cold and rainy seasons change what we wear and do.", points: ["Summer heat", "Monsoon rain", "Winter sweaters"], examples: [ex("Cold", "In winter we wear…", ["Warm clothes"], "Woollens")] },
        { title: "Our Neighbourhood Helpers", explanation: "Helpers keep community life running — teacher, doctor, cleaner, driver and more.", points: ["Respect all jobs", "Say thank you", "Helpers keep us safe and healthy"], examples: [ex("Teach", "Who helps us learn at school?", ["Helper"], "Teacher")] },
      ],
      3: [
        { title: "Living and Non-living", explanation: "EVS sorting: living things grow and need food/air/water; non-living do not.", points: ["Growth and response", "Examples all around", "Plants are living too"] },
        { title: "Parts of a Plant", explanation: "Roots, stem, leaves, flowers and fruits each have a job.", points: ["Roots absorb water", "Leaves make food", "Seeds grow new plants"] },
        { title: "Animals and Habitats", explanation: "Animals live where they find food, water and shelter — land, water or both.", points: ["Habitat means home", "Adaptations simple ideas", "Food chains start gently"] },
        { title: "Birds", explanation: "Beaks and claws suit food and lifestyle. Birds build nests carefully.", points: ["Different beaks", "Flight feathers", "Do not disturb nests"] },
        { title: "Our Body Systems Intro", explanation: "Bones support; muscles move; sense organs collect information.", points: ["Skeleton support", "Exercise", "Rest and sleep"] },
        { title: "Food and Nutrition Basics", explanation: "Energy foods, body-building foods and protective foods (fruits/veg).", points: ["Balanced thali idea", "Avoid too much junk", "Clean drinking water"] },
        { title: "Water Cycle Story", explanation: "Water evaporates, forms clouds, rains down and reaches rivers again.", points: ["Evaporation", "Condensation", "Rain and collection"] },
        { title: "Weather and Climate Lightly", explanation: "Daily weather changes; climate is the longer pattern of a place.", points: ["Sunny rainy windy", "Clothes match weather", "Farmers watch weather"] },
        { title: "Soil and Rocks", explanation: "Soil holds plants; rocks and minerals appear in many forms around us.", points: ["Soil layers idea", "Hard rocks", "Do not waste fertile soil"] },
        { title: "Safety First Aid Light", explanation: "Basic first responses: cool a burn with water, clean a scrape, call adult.", points: ["Adult help", "Do not panic", "Know emergency contacts"] },
      ],
      4: [
        { title: "Plants: Reproduction Basics", explanation: "Seeds, flowers and dispersal help new plants grow in new places.", points: ["Pollination simple", "Seed dispersal by wind/animals", "Germination needs"] },
        { title: "Food from Plants & Animals", explanation: "Trace food back to farms, dairies and gardens.", points: ["Crops", "Milk eggs", "Food miles idea lightly"] },
        { title: "Digestive Journey", explanation: "Food travels from mouth to stomach and beyond; chewing starts digestion.", points: ["Teeth care", "Fibre and water", "Hygiene of food"] },
        { title: "Teeth and Microbes", explanation: "Useful and harmful microbes; brush to keep teeth strong.", points: ["Milk & permanent teeth", "Bacteria can cause cavities", "Wash hands"] },
        { title: "States of Matter", explanation: "Solids keep shape; liquids flow; gases spread. Heating/cooling can change states.", points: ["Ice-water-vapour story", "Examples at home", "Safe experiments with adult"] },
        { title: "Force and Friction Light", explanation: "Pushes and pulls move objects; rough surfaces slow sliding.", points: ["Push pull", "Friction helps walking", "Oiling reduces friction"] },
        { title: "Energy in Daily Life", explanation: "We use muscle energy, fuels and electricity carefully.", points: ["Save electricity", "Sunlight energy", "Safe handling of sockets"] },
        { title: "Our Environment", explanation: "Reduce, reuse, recycle; protect green spaces and water.", points: ["Pollution types simple", "Plant trees", "Say no to litter"] },
        { title: "Maps and Directions Linked to EVS", explanation: "Locate school and neighbourhood features using simple maps and directions.", points: ["N E S W", "Symbols on maps", "Local landmarks"] },
        { title: "Community Health", explanation: "Clean surroundings and vaccination awareness keep communities healthier.", points: ["Sanitation", "Clean water", "Respect health workers"] },
      ],
      5: [
        { title: "Life Cycles", explanation: "Plants and animals pass through stages: seed to plant; egg to adult.", points: ["Frog & butterfly examples", "Metamorphosis word", "Observe carefully"] },
        { title: "Skeletal & Muscular Care", explanation: "Bones and muscles work together; posture and calcium matter.", points: ["Joints allow movement", "Exercise", "Balanced food"] },
        { title: "Respiratory Basics", explanation: "We breathe oxygen; smoking and dusty air harm lungs.", points: ["Inhale exhale", "Clean air", "Exercise deep breathing safely"] },
        { title: "Water: Precious Resource", explanation: "Sources, scarcity and conservation — every drop counts in India.", points: ["Rainwater harvesting idea", "Leaky taps waste litres", "Clean rivers"] },
        { title: "Natural Disasters Awareness", explanation: "Know safety ideas for floods, earthquakes and storms without fearmongering.", points: ["Listen to alerts", "Emergency kit idea", "Help neighbours calmly"] },
        { title: "Simple Machines", explanation: "Levers, wheels, inclined planes and pulleys make work easier.", points: ["See tools as machines", "Fulcrum idea", "Safety first"] },
        { title: "Shadows and Light", explanation: "Opaque objects cast shadows; light travels in straight lines in simple demos.", points: ["Transparent translucent opaque", "Shadow length changes", "Sun safety"] },
        { title: "Earth Moon Sun", explanation: "Day/night from Earth’s spin; moon shapes change across the month.", points: ["Rotation", "Phases of moon", "No living on moon like Earth"] },
        { title: "Forests and Wildlife", explanation: "Forests protect soil, climate and animals; national parks guard biodiversity.", points: ["Food chains", "Do not feed wild animals", "Project Tiger awareness"] },
        { title: "Solid Waste Sorting", explanation: "Separate wet and dry waste; compost kitchen scraps when possible.", points: ["Bin colours idea", "Plastic reduction", "Compost"] },
      ],
    };
    if (grade === 2) {
      return [
        { title: "Living and Non-living Things" },
        { title: "Plants Around Us" },
        { title: "Animals and Their Food" },
        { title: "Our Body and Senses" },
        { title: "Food We Eat" },
        { title: "House and Clothes" },
        { title: "Water, Air and Weather" },
        { title: "Seasons" },
        { title: "Materials Around Us" },
        { title: "Hygiene and Safety" },
      ];
    }
    return map[grade] || map[1];
  }

  const mid = {
    6: [
      { title: "Food: Components & Sources", points: ["Nutrients", "Balanced diet", "Food habits"] },
      { title: "Fibre to Fabric", points: ["Plant & animal fibres", "Spinning weaving"] },
      { title: "Sorting Materials", points: ["Properties", "Soluble insoluble"] },
      { title: "Separation of Substances", points: ["Filtration sedimentation", "Evaporation"] },
      { title: "Changes Around Us", points: ["Reversible irreversible"] },
      { title: "Getting to Know Plants", points: ["Herbs shrubs trees", "Root stem leaf"] },
      { title: "Body Movements", points: ["Joints", "Animal locomotion"] },
      { title: "The Living Organisms & Surroundings", points: ["Habitat", "Adaptations"] },
      { title: "Motion and Measurement of Distances", points: ["SI units", "Types of motion"] },
      { title: "Light, Shadows and Reflections", points: ["Opaque objects", "Mirrors"] },
      { title: "Electricity and Circuits", points: ["Cell bulb", "Open closed circuit", "Conductors"] },
      { title: "Fun with Magnets", points: ["Poles", "Attraction repulsion"] },
      { title: "Water & Air Around Us", points: ["Cycle", "Composition of air"] },
      { title: "Garbage In, Garbage Out", points: ["Vermicomposting", "Recycling"] },
    ],
    7: [
      { title: "Nutrition in Plants", points: ["Photosynthesis", "Other modes"] },
      { title: "Nutrition in Animals", points: ["Human digestion", "Different animals"] },
      { title: "Fibre to Fabric (Animal)", points: ["Wool silk"] },
      { title: "Heat", points: ["Conduction convection radiation", "Thermometers"] },
      { title: "Acids, Bases and Salts", points: ["Indicators", "Neutralisation"] },
      { title: "Physical and Chemical Changes", points: ["Rusting crystallisation"] },
      { title: "Weather, Climate and Adaptations", points: ["Climate vs weather", "Polar & tropical"] },
      { title: "Winds, Storms and Cyclones", points: ["Air pressure", "Safety"] },
      { title: "Soil", points: ["Profiles", "Types suitability"] },
      { title: "Respiration in Organisms", points: ["Breathing", "Aerobic idea"] },
      { title: "Transportation in Animals and Plants", points: ["Circulatory", "Xylem phloem"] },
      { title: "Reproduction in Plants", points: ["Asexual sexual", "Seed dispersal"] },
      { title: "Motion and Time", points: ["Speed", "Distance-time graphs"] },
      { title: "Electric Current and Its Effects", points: ["Heating magnetic effects", "Electromagnet"] },
      { title: "Light", points: ["Reflection", "Spherical mirrors lenses intro"] },
    ],
    8: [
      { title: "Crop Production and Management", points: ["Agricultural practices", "Manure fertiliser"] },
      { title: "Microorganisms", points: ["Friends & foes", "Food preservation", "Nitrogen fixation"] },
      { title: "Synthetic Fibres and Plastics", points: ["Types", "Responsible use"] },
      { title: "Materials: Metals and Non-metals", points: ["Properties", "Reactions"] },
      { title: "Coal and Petroleum", points: ["Fossil fuels", "Conservation"] },
      { title: "Combustion and Flame", points: ["Types of combustion", "Fire control"] },
      { title: "Conservation of Plants and Animals", points: ["Biodiversity", "Protected areas"] },
      { title: "Cell — Structure and Functions", points: ["Plant vs animal cell", "Organelles"] },
      { title: "Reproduction in Animals", points: ["Modes", "Lifecycle"] },
      { title: "Reaching the Age of Adolescence", points: ["Hormones", "Health & hygiene"] },
      { title: "Force and Pressure", points: ["Effects of force", "Pressure fluids"] },
      { title: "Friction", points: ["Factors", "Increasing decreasing"] },
      { title: "Sound", points: ["Production propagation", "Human ear"] },
      { title: "Chemical Effects of Electric Current", points: ["Electrolysis idea", "LED"] },
      { title: "Some Natural Phenomena & Light/Stars", points: ["Lightning earthquakes", "Laws of reflection", "Solar system"] },
    ],
    9: [
      { title: "Matter in Our Surroundings", points: ["States", "Diffusion", "Evaporation"] },
      { title: "Is Matter Around Us Pure?", points: ["Mixtures solutions", "Separation"] },
      { title: "Atoms and Molecules", points: ["Laws of chemical combination", "Mole idea intro"] },
      { title: "Structure of the Atom", points: ["Electrons protons neutrons", "Valency"] },
      { title: "The Fundamental Unit of Life", points: ["Cell organelles", "Cell membrane"] },
      { title: "Tissues", points: ["Plant & animal tissues"] },
      { title: "Diversity in Living Organisms", points: ["Classification hierarchy"] },
      { title: "Motion", points: ["Distance displacement", "Graphs", "Equations of motion"] },
      { title: "Force and Laws of Motion", points: ["Newton’s laws", "Momentum"] },
      { title: "Gravitation", points: ["Universal law", "Floatation"] },
      { title: "Work and Energy", points: ["Work power", "KE PE", "Conservation"] },
      { title: "Sound", points: ["Wave nature", "SONAR"] },
      { title: "Why Do We Fall Ill?", points: ["Health disease", "Prevention"] },
      { title: "Natural Resources & Improvement of Food Resources", points: ["Air water soil", "Crop improvement"] },
    ],
    10: [
      { title: "Chemical Reactions and Equations", points: ["Types of reactions", "Balancing"] },
      { title: "Acids, Bases and Salts", points: ["pH", "Important compounds"] },
      { title: "Metals and Non-metals", points: ["Properties", "Extraction idea", "Corrosion"] },
      { title: "Carbon and Its Compounds", points: ["Bonding", "Ethanol ethanoic acid", "Soaps"] },
      { title: "Periodic Classification", points: ["Modern periodic table", "Trends"] },
      { title: "Life Processes", points: ["Nutrition respiration", "Transport excretion"] },
      { title: "Control and Coordination", points: ["Nervous system", "Hormones"] },
      { title: "How Do Organisms Reproduce?", points: ["Asexual sexual", "Reproductive health"] },
      { title: "Heredity and Evolution", points: ["Mendel ideas", "Speciation"] },
      { title: "Light — Reflection and Refraction", points: ["Mirrors lenses", "Human eye"] },
      { title: "Human Eye and Colourful World", points: ["Defects", "Dispersion scattering"] },
      { title: "Electricity", points: ["Ohm’s law", "Series parallel", "Heating effect"] },
      { title: "Magnetic Effects of Electric Current", points: ["Field", "Motor", "EMI idea"] },
      { title: "Sources of Energy & Our Environment / Management", points: ["Conventional renewable", "Ecosystems", "Sustainability"] },
    ],
  };
  return mid[grade] || mid[6];
}

function englishNodes(grade) {
  const primary = {
    1: [
      { title: "Letters and Sounds", explanation: "Learn letter shapes and the sounds they usually make when reading aloud.", points: ["A–Z recognition", "Beginning sounds", "Trace letters carefully"], examples: [ex("Sound", "Ball starts with sound…", ["b"], "/b/")] },
      { title: "Simple Words (CVC)", explanation: "Consonant-vowel-consonant words like cat, pen, sun are great early readers.", points: ["Blend sounds", "Short vowels", "Picture matching"], examples: [ex("Blend", "c-a-t makes…", ["Blend"], "cat")] },
      { title: "Sight Words", explanation: "Some words we recognise by sight: I, am, the, is, you, we.", points: ["Flashcard practice", "Find in sentences", "Use in speaking"], examples: [ex("Sight", "Complete: ___ am Numair.", ["Sight word"], "I")] },
      { title: "Naming Words", explanation: "Nouns name people, places and things we can talk about.", points: ["Person place thing", "Capital for names", "Point and name"], examples: [ex("Noun", "Delhi is a…", ["Place"], "Place name")] },
      { title: "Action Words", explanation: "Verbs show actions: run, jump, read, eat.", points: ["Act it out", "Present action", "Picture verbs"], examples: [ex("Verb", "Birds ___ in the sky.", ["fly"], "fly")] },
      { title: "This / That / These / Those", explanation: "Pointing words help us talk about near and far things.", points: ["This/these near", "That/those far", "Singular plural"], examples: [ex("Point", "Book in hand: ___ is my book.", ["Near"], "This")] },
      { title: "Simple Sentences", explanation: "A sentence starts with a capital and often ends with a full stop.", points: ["Capital start", "Full stop", "Make sense"], examples: [ex("Write", "Fix: i like mangoes", ["Capital & stop"], "I like mangoes.")] },
      { title: "Rhymes and Listening", explanation: "Rhymes build music of English and memory for young learners.", points: ["Listen carefully", "Clap rhythm", "Guess rhyming words"], examples: [ex("Rhyme", "Cat rhymes with…", ["hat"], "hat")] },
      { title: "Myself — Speaking", explanation: "Introduce yourself politely: name, age, school, favourite colour.", points: ["Eye contact", "Clear voice", "Short sentences"], examples: [ex("Speak", "My name is…", ["Introduction"], "Say your name")] },
      { title: "Picture Reading", explanation: "Talk about what you see in a picture before reading text.", points: ["Who what where", "New words", "Full sentence answers"], examples: [ex("Pic", "If you see a school bus, where might children go?", ["School"], "To school")] },
    ],
    3: [
      { title: "Phonics Revision & Spelling", explanation: "Blend digraphs (sh, ch, th) and practise weekly spellings.", points: ["Digraphs", "Silent e intro", "Dictation"] },
      { title: "Nouns: Common and Proper", explanation: "Proper nouns need capitals; common nouns are general names.", points: ["Capital rules", "Collective nouns intro", "Gender words light"] },
      { title: "Pronouns", explanation: "He, she, it, they replace nouns to avoid repetition.", points: ["Subject pronouns", "Match number", "Clear reference"] },
      { title: "Verbs and Tenses Intro", explanation: "Present and past forms: play/played; is/was.", points: ["Today vs yesterday", "am/is/are", "Simple past -ed"] },
      { title: "Adjectives", explanation: "Describing words make writing colourful: big, soft, brave.", points: ["Size colour feeling", "Order sense", "Opposites"] },
      { title: "Articles a/an/the", explanation: "Use a/an for one non-specific; the for specific things.", points: ["an before vowel sound", "the for unique", "Practice sentences"] },
      { title: "Prepositions", explanation: "in, on, under, behind, between show position.", points: ["Classroom hunt", "Picture placement", "Write 5 sentences"] },
      { title: "Sentence Types", explanation: "Statements, questions and exclamations use different end marks.", points: [". ? !", "Question words", "Excitement mark"] },
      { title: "Comprehension", explanation: "Read a short paragraph and answer who/what/where/why.", points: ["Main idea", "Detail hunt", "Vocabulary in context"] },
      { title: "Creative Writing Seeds", explanation: "Write 4–6 sentences about a festival, pet or picnic.", points: ["Plan then write", "Check capitals", "Add adjectives"] },
    ],
    4: [
      { title: "Reading Fluency", explanation: "Read aloud with expression; notice punctuation pauses.", points: ["Pace", "Expression", "Unknown words: sound out + context"] },
      { title: "Nouns & Possessives", explanation: "Apostrophe shows belonging: Numair’s bag.", points: ["Singular possessive", "Plural nouns", "Concrete abstract light"] },
      { title: "Verb Tenses", explanation: "Present continuous (is playing) and simple past/future will.", points: ["Helping verbs", "Time markers", "Consistency"] },
      { title: "Adverbs", explanation: "Often end in -ly and tell how/when/where an action happens.", points: ["How when where", "Not all -ly", "Modify verbs"] },
      { title: "Conjunctions", explanation: "and, but, or, because join ideas smoothly.", points: ["Compound sentences", "Choose right linker", "Avoid run-ons"] },
      { title: "Homophones", explanation: "Same sound, different meaning/spelling: to/too/two, their/there.", points: ["Context chooses spelling", "Mnemonic tricks", "Proofread"] },
      { title: "Punctuation Toolkit", explanation: "Commas in lists, quotation marks for speech, apostrophes.", points: ["List commas", "Dialogue marks", "Contractions forms"] },
      { title: "Paragraph Writing", explanation: "Topic sentence, supporting details, closing line.", points: ["One idea per paragraph", "Order ideas", "Edit spelling"] },
      { title: "Story Elements", explanation: "Characters, setting, problem and ending.", points: ["Beginning middle end", "Interesting start", "Moral optional"] },
      { title: "Letter & Diary", explanation: "Friendly letter layout and short diary entries about your day.", points: ["Date greeting", "Body closing", "Honest voice"] },
    ],
    5: [
      { title: "Advanced Vocabulary", explanation: "Prefixes/suffixes and synonyms/antonyms expand word power.", points: ["un- re- -ful -less", "Thesaurus carefully", "Use in sentences"] },
      { title: "Subject–Verb Agreement", explanation: "Singular subjects need singular verbs: He runs; They run.", points: ["Watch for is/are", "Collective nouns care", "Nearby nouns trap"] },
      { title: "Perfecting Tenses", explanation: "Present perfect idea (have/has + V3) for experiences; revise all simple tenses.", points: ["Time expressions", "Irregular verbs list", "Mixed practice"] },
      { title: "Active Voice Clarity", explanation: "Clear who does what; keep sentences direct for primary writing.", points: ["Doer + action + object", "Cut fluff", "Strong verbs"] },
      { title: "Figurative Language Intro", explanation: "Simile (as/like) and simple metaphors brighten descriptions.", points: ["as brave as…", "Do not overdo", "Picture the image"] },
      { title: "Reading Strategies", explanation: "Skim for gist, scan for details, infer from clues.", points: ["Main idea", "Inference", "Author’s purpose light"] },
      { title: "Report & Notice Writing", explanation: "Short school notices and factual event reports with headings.", points: ["Who what when where", "Formal tone", "Clear format"] },
      { title: "Essay Building", explanation: "Plan introduction, 2–3 body points, conclusion for 150–200 words.", points: ["Outline first", "Linkers firstly finally", "Revise"] },
      { title: "Dialogue Writing", explanation: "Natural conversations with correct speech punctuation.", points: ["New speaker new line", "Quotation marks", "Keep short"] },
      { title: "Listening & Speaking Skills", explanation: "Summarise a classmate’s talk; ask polite follow-up questions.", points: ["Active listening", "Notes", "Courteous phrases"] },
    ],
  };
  if (primary[grade]) return primary[grade];
  if (grade === 2) {
    return [
      { title: "Phonics" }, { title: "Sight Words" }, { title: "Nouns and Pronouns" }, { title: "Verbs" },
      { title: "Adjectives" }, { title: "Articles" }, { title: "Prepositions" }, { title: "Sentences" },
      { title: "Comprehension" }, { title: "Creative Expression" },
    ];
  }
  const upper = {
    6: [
      { title: "Reading Literature & Informational Texts", points: ["Theme", "Summary", "Vocabulary in context"] },
      { title: "Grammar: Tenses Mastery", points: ["All major tenses", "Consistency"] },
      { title: "Determiners & Modals Intro", points: ["a/an/the/some", "can could may"] },
      { title: "Active and Passive Voice", points: ["Form changes", "When to use"] },
      { title: "Reported Speech Basics", points: ["Statements", "Backshift idea"] },
      { title: "Writing: Formal Letters", points: ["Format", "Tone"] },
      { title: "Story and Diary Writing", points: ["Plot", "Reflection"] },
      { title: "Notice and Message", points: ["Concise facts", "Layout"] },
      { title: "Listening Speaking", points: ["Debate light", "Recitation"] },
      { title: "Integrated Grammar Practice", points: ["Editing", "Omission gap fills"] },
    ],
    7: [
      { title: "Prose Poetry Appreciation", points: ["Imagery", "Rhyme rhythm"] },
      { title: "Clauses Intro", points: ["Main subordinate", "Relative who which"] },
      { title: "Voice and Narration", points: ["Practice transforms"] },
      { title: "Prepositions & Conjunctions Advanced", points: ["Complex joiners"] },
      { title: "Writing Articles", points: ["Headline", "Opinion balanced"] },
      { title: "Emails and Formal Letters", points: ["Digital format", "Politeness"] },
      { title: "Story Completion", points: ["Hints based writing"] },
      { title: "Reading Unseen Passages", points: ["Factual discursive"] },
      { title: "Vocabulary Builder", points: ["Idioms phrases"] },
      { title: "Speaking: Extempore Skills", points: ["1-minute talks"] },
    ],
    8: [
      { title: "Literary Devices", points: ["Metaphor simile personification", "Alliteration"] },
      { title: "Grammar Consolidation", points: ["Non-finites", "Conditionals intro"] },
      { title: "Reported Speech Extended", points: ["Questions commands"] },
      { title: "Writing: Report & Speech", points: ["Event reports", "Speech format"] },
      { title: "Debate and Argument", points: ["For against", "Evidence"] },
      { title: "Diary Travelogue", points: ["Descriptive detail"] },
      { title: "Unseen Poetry", points: ["Central idea", "Poetic devices"] },
      { title: "Editing & Transformation", points: ["Error correction"] },
      { title: "Project Presentation English", points: ["Slides talk", "Q&A"] },
      { title: "Media Literacy Light", points: ["Ads bias awareness"] },
    ],
    9: [
      { title: "Literature Deep Dive", points: ["Characterisation", "Theme conflict"] },
      { title: "Advanced Grammar", points: ["Clauses", "Modals precision"] },
      { title: "Writing Skills Board Pattern", points: ["Descriptive analytical"] },
      { title: "Letter to Editor / Application", points: ["Formal register"] },
      { title: "Story Writing with Twists", points: ["Plot structure"] },
      { title: "Reading: Note Making", points: ["Abbreviations", "Summary"] },
      { title: "Listening ASL Prep", points: ["Comprehension oral"] },
      { title: "Vocabulary Academic Word List Light", points: ["Subject words"] },
      { title: "Integrated Grammar", points: ["Gap filling cloze"] },
      { title: "Speaking Seminars", points: ["Cite sources simply"] },
    ],
    10: [
      { title: "First Flight / Footprints Style Skills", points: ["Extract based Qs", "Long answers"] },
      { title: "Grammar for Board Exams", points: ["Determiners tenses", "Reported speech voice"] },
      { title: "Writing: Formal Letters & Applications", points: ["Complaints enquiry"] },
      { title: "Analytical Paragraph", points: ["Data interpretation"] },
      { title: "Story / Diary as per Latest Pattern", points: ["Creativity + accuracy"] },
      { title: "Reading Discursive Factual", points: ["Inference vocabulary"] },
      { title: "Poetry Explanation", points: ["Central idea devices"] },
      { title: "Error Correction Practice", points: ["Common pitfalls"] },
      { title: "ASL / Speaking Confidence", points: ["Articulation", "Listening notes"] },
      { title: "Revision Strategies", points: ["Timed practice", "Self-edit checklist"] },
    ],
  };
  return upper[grade] || upper[6];
}

function hindiNodes(grade) {
  const primary = {
    1: [
      {
        title: "स्वर पहचान",
        explanation: "हिंदी के स्वर अ आ इ ई उ ऊ ए ऐ ओ औ अं अः से पढ़ना शुरू करते हैं।",
        points: ["स्वर स्वतंत्र ध्वनियाँ हैं", "चित्र देखकर बोलें", "लिखने का अभ्यास धीरे-धीरे"],
        examples: [ex("स्वर", "आ से शुरू होने वाला शब्द?", ["आम"], "आम")],
      },
      {
        title: "व्यंजन परिचय",
        explanation: "क ख ग जैसी ध्वनियाँ व्यंजन हैं। स्वर मिलाकर शब्द बनते हैं।",
        points: ["क वर्ग आदि क्रम से", "हवा छोड़कर बोलें", "जोड़कर दो अक्षर शब्द"],
        examples: [ex("अक्षर", "क + अ = ?", ["क"], "क")],
      },
      {
        title: "मात्राएँ प्रारम्भ",
        explanation: "मात्रा से व्यंजन की ध्वनि बदलती है — का, कि, की जैसे रूप।",
        points: ["आ की मात्रा ा", "इ/ई मात्रा", "उ/ऊ मात्रा"],
        examples: [ex("मात्रा", "म् + आ = ?", ["मा"], "मा")],
      },
      {
        title: "दो और तीन अक्षर शब्द",
        explanation: "सरल शब्द पढ़ें: कलम, पानी, घर, आम।",
        points: ["चित्र से जोड़ें", "ज़ोर से पढ़ें", "वाक्य में बोलें"],
        examples: [ex("शब्द", "पीने वाली वस्तु?", ["पानी"], "पानी")],
      },
      {
        title: "मेरा परिचय",
        explanation: "अपना नाम, उम्र और कक्षा सरल वाक्यों में बताएँ।",
        points: ["मैं … हूँ", "मेरा नाम …", "नमस्ते कहना"],
        examples: [ex("वाक्य", "नमस्ते के बाद क्या कहते हैं?", ["अपना नाम"], "अपना नाम")],
      },
      {
        title: "संज्ञा शुरुआत",
        explanation: "व्यक्ति, वस्तु और जगह के नाम संज्ञा कहलाते हैं।",
        points: ["लड़का पुस्तक दिल्ली", "नाम की पहचान", "चित्रों से छाँटें"],
        examples: [ex("संज्ञा", "किताब है एक…", ["वस्तु"], "संज्ञा")],
      },
      {
        title: "क्रिया शुरुआत",
        explanation: "करना, खाना, दौड़ना जैसी क्रियाओं से हम काम बताते हैं।",
        points: ["काम के शब्द", "आओ दिखाओ", "आज क्या कर रहे हो"],
        examples: [ex("क्रिया", "राम फल … है।", ["खा"], "खा रहा")],
      },
      {
        title: "छोटी कविता / बाल गीत",
        explanation: "तुक वाले बाल गीत सुनकर दोहराएँ — याददाश्त और लय बढ़ती है।",
        points: ["ताल से ताली", "नये शब्द", "अर्थ सरल भाषा में"],
        examples: [ex("लय", "कविता में तुक क्यों?", ["सुनने में अच्छा"], "लय/तुक")],
      },
      {
        title: "सदाचार शब्द",
        explanation: "धन्यवाद, क्षमा कीजिए, कृपया — शिष्टाचार के शब्द।",
        points: ["कृपया बोलें", "बड़ों का आदर", "माफ़ी माँगना"],
        examples: [ex("शिष्टाचार", "मदद पर क्या कहें?", ["धन्यवाद"], "धन्यवाद")],
      },
      {
        title: "चित्र वर्णन",
        explanation: "एक चित्र देखकर दो-तीन सरल वाक्य बोलें या लिखें।",
        points: ["कौन क्या कहाँ", "रंग बताएँ", "पूरा वाक्य"],
        examples: [ex("चित्र", "बगीचे में फूल हैं — यह वाक्य क्या करता है?", ["वर्णन"], "वर्णन")],
      },
    ],
    3: [
      { title: "मात्राओं का अभ्यास", explanation: "सभी मात्राओं से शब्द बनाएँ और शुद्ध उच्चारण करें।", points: ["ए ऐ ओ औ", "चंद्रबिंदु अनुस्वार", "शुद्ध वर्तनी"] },
      { title: "संज्ञा के भेद", explanation: "व्यक्तिवाचक जातिवाचक भाववाचक — नामों के प्रकार।", points: ["उदाहरण छाँटना", "वाक्य बनाएँ", "भेद याद रखें"] },
      { title: "सर्वनाम", explanation: "मैं तुम वह वे — संज्ञा की जगह आने वाले शब्द।", points: ["पुरुष के अनुसार", "एकवचन बहुवचन", "दोहराव कम करें"] },
      { title: "विशेषण", explanation: "गुण बताने वाले शब्द: सुंदर तेज़ मीठा।", points: ["रंग आकार स्वभाव", "संज्ञा के पास", "विलोम जोड़ें"] },
      { title: "क्रिया और काल परिचय", explanation: "वर्तमान भूतकाल — आज और कल के काम।", points: ["खाता है / खाया", "समय के संकेत", "वाक्य बदलो"] },
      { title: "वचन और लिंग", explanation: "एक-अनेक और पुल्लिंग-स्त्रीलिंग की पहचान।", points: ["लड़का-लड़के", "लड़का-लड़की", "मिलान करें"] },
      { title: "विलोम और पर्याय", explanation: "उल्टे और समान अर्थ वाले शब्द याद करें।", points: ["दिन-रात", "நீர்-पानी", "खेल से याद"] },
      { title: "अनुच्छेद लेखन", explanation: "४–६ वाक्यों में मेरा विद्यालय / मेरा मित्र।", points: ["शीर्षक", "क्रम से विचार", "पूर्ण विराम"] },
      { title: "पत्र लेखन प्रारम्भ", explanation: "मित्र को छोटा पत्र — शुरुआत मध्य अंत।", points: ["दिनांक संबोधन", "समाप्ति", "शुद्ध भाषा"] },
      { title: "अपठित गद्यांश", explanation: "छोटा पाठ पढ़कर प्रश्नों के उत्तर ढूँढें।", points: ["मुख्य बात", "कठिन शब्द अर्थ", "अपने शब्दों में"] },
    ],
    4: [
      { title: "वर्तनी शुद्धि", explanation: "आम गलतियाँ सुधारें — मात्रा और संयुक्त अक्षर।", points: ["श्रुतलेख", "शब्द भंडार", "सूची बनाएँ"] },
      { title: "कारक चिह्न", explanation: "ने को से के लिए आदि — संबंध बताते हैं।", points: ["उदाहरण वाक्य", "प्रश्न कौन किसको", "अभ्यास"] },
      { title: "काल की पहचान", explanation: "वर्तमान भूत भविष्य — क्रिया रूप बदलना।", points: ["समय शब्द", "रूप बदलो", "कहानी में काल"] },
      { title: "मुहावरे शुरुआत", explanation: "दिनचर्या के सरल मुहावरे अर्थ सहित।", points: ["अर्थ याद", "वाक्य प्रयोग", "चित्र से जोड़"] },
      { title: "कहानी लेखन", explanation: "आरंभ समस्या समाधान — छोटी मौलिक कहानी।", points: ["पात्र स्थान", "घटना क्रम", "शिक्षा वैकल्पिक"] },
      { title: "निबंध (१२० शब्द)", explanation: "वृक्षारोपण स्वच्छता त्योहार जैसे विषय।", points: ["भूमिका निष्कर्ष", "३ बिंदु", "शुद्ध विराम"] },
      { title: "संवाद लेखन", explanation: "दो पात्रों की बातचीत नाटकीय लेकिन विनम्र।", points: ["नाम लिखें", "प्रश्न उत्तर", "छोटे वाक्य"] },
      { title: "पत्र: परिवार व मित्र", explanation: "औपचारिक नहीं — स्नेहपूर्ण भाषा।", points: ["प्रस्थान समाप्ति", "समाचार", "बधाई/धन्यवाद"] },
      { title: "काव्य पंक्तियाँ", explanation: "छोटी कविता का भावार्थ अपने शब्दों में।", points: ["केंद्रीय भाव", "अलंकार हल्का", "रस आनंद"] },
      { title: "श्रवण एवं मौखिक", explanation: "कक्षा में सुनाकर सार बताना।", points: ["ध्यान", "नोट्स", "स्पष्ट उच्चारण"] },
    ],
    5: [
      { title: "व्याकरण समेकन", explanation: "संज्ञा सर्वनाम विशेषण क्रिया कारक — मिश्रित अभ्यास।", points: ["पहचान प्रश्न", "त्रुटि सुधार", "तालिका बनाएँ"] },
      { title: "समास परिचय", explanation: "दो शब्दों के मेल का सरल परिचय।", points: ["उदाहरण", "विग्रह हल्का", "याद रखने के खेल"] },
      { title: "अलंकार छंद हल्का", explanation: "अनुप्रास उपमा की पहचान काव्य में।", points: ["उदाहरण पंक्ति", "तुलना", "भाषा सौंदर्य"] },
      { title: "औपचारिक पत्र", explanation: "प्रधानाचार्य को आवेदन — विनयी भाषा।", points: ["विषय पंक्ति", "उद्देश्य", "प्रार्थना वाक्य"] },
      { title: "अनुच्छेद व निबंध", explanation: "विषय विस्तार — उदाहरण और निष्कर्ष।", points: ["रूपरेखा", "संयोजक शब्द", "पुनर्लेखन"] },
      { title: "अपठित काव्यांश", explanation: "भाव और प्रश्न — कक्षा परीक्षा शैली।", points: ["कवि क्या कहना चाहता", "शब्दार्थ", "शीर्षक सुझाव"] },
      { title: "मुहावरे लोकोक्तियाँ", explanation: "अर्थ व वाक्य प्रयोग सूची बढ़ाना।", points: ["१० नए", "जोड़ी मिलाएँ", "कहानी में डालें"] },
      { title: "नाटक अंश वाचन", explanation: "भाव सहित संवाद पढ़ना।", points: ["स्वर उतार-चढ़ाव", "विराम", "समूह अभ्यास"] },
      { title: "रचनात्मक लेखन", explanation: "डायरी यात्रावृत्तांत विज्ञापन जैसे रूप।", points: ["रूप चुनें", "मौलिकता", "भाषा शुद्धता"] },
      { title: "परियोजना: भाषा सर्वेक्षण", explanation: "घर के शब्दों की सूची — क्षेत्रीय व मानक हिंदी।", points: ["तालिका", "प्रस्तुति", "सम्मान विविधता"] },
    ],
  };
  if (primary[grade]) return primary[grade];
  if (grade === 2) {
    return [
      { title: "स्वर" }, { title: "व्यंजन" }, { title: "मात्रा" }, { title: "शब्द" },
      { title: "वाक्य" }, { title: "संज्ञा" }, { title: "क्रिया" }, { title: "विलोम" },
      { title: "पढ़ना" }, { title: "लिखना" },
    ];
  }
  const upper = {
    6: [
      { title: "गद्य व पद्य परिचय", points: ["मुख्य भाव", "शब्दार्थ"] },
      { title: "व्याकरण: संधि परिचय", points: ["स्वर संधि उदाहरण"] },
      { title: "समास व उपसर्ग प्रत्यय", points: ["पहचान अभ्यास"] },
      { title: "काल व वाच्य परिचय", points: ["रूप परिवर्तन"] },
      { title: "पत्र व प्रार्थना पत्र", points: ["औपचारिक ढाँचा"] },
      { title: "निबंध लेखन", points: ["विषय विस्तार"] },
      { title: "अपठित गद्यांश", points: ["प्रश्न अभ्यास"] },
      { title: "मुहावरे लोकोक्ति", points: ["प्रयोग"] },
      { title: "संवाद एवं वार्तालाप", points: ["शिष्ट भाषा"] },
      { title: "परियोजना कार्य", points: ["साक्षात्कार / संग्रह"] },
    ],
    7: [
      { title: "साहित्य बोध", points: ["पात्र चरित्र", "संदेश"] },
      { title: "संधि समास गहन", points: ["भेद उदाहरण"] },
      { title: "रस छंद अलंकार परिचय", points: ["सरल पहचान"] },
      { title: "वाक्य रचना अशुद्धि शोधन", points: ["त्रुटि सुधार"] },
      { title: "औपचारिक लेखन", points: ["पत्र सूचना"] },
      { title: "कहानी निबंध", points: ["मौलिकता"] },
      { title: "अपठित काव्य", points: ["भावार्थ"] },
      { title: "शब्द भंडार", points: ["पर्याय विलोम अनेक शब्दों के लिए एक"] },
      { title: "वाद-विवाद कौशल", points: ["तर्क शिष्टाचार"] },
      { title: "मीडिया लेखन हल्का", points: ["समाचार सार"] },
    ],
    8: [
      { title: "गद्य पद्य समीक्षा कौशल", points: ["मूल्यांकन प्रश्न"] },
      { title: "व्याकरण समेकन", points: ["संधि समास काल वाच्य"] },
      { title: "अलंकार रस", points: ["उदाहरण सहित"] },
      { title: "निबंध व रिपोर्ट", points: ["तथ्यात्मक शैली"] },
      { title: "पत्र सम्पादक के नाम", points: ["औपचारिक टोन"] },
      { title: "विज्ञापन व सूचना", points: ["संक्षिप्त प्रभाव"] },
      { title: "अपठित मिश्रित", points: ["गद्य काव्य"] },
      { title: "अनुवाद कौशल हल्का", points: ["अंग्रेज़ी-हिंदी सरल"] },
      { title: "नाट्य वाचन", points: ["अभिव्यक्ति"] },
      { title: "परियोजना प्रस्तुति", points: ["भाषा सर्वे"] },
    ],
    9: [
      { title: "क्षितिज कृतिका शैली पठन", points: ["पाठ आधारित प्रश्न"] },
      { title: "व्याकरण बोर्ड पैटर्न", points: ["रचना व प्रयोग"] },
      { title: "लेखन: अनुच्छेद पत्र", points: ["औपचारिक अनौपचारिक"] },
      { title: "संदेश विज्ञापन डायरी", points: ["रूप एवम् भाषा"] },
      { title: "अपठित बोध", points: ["शीर्षक सार"] },
      { title: "काव्य बोध", points: ["उपमा अनुप्रास"] },
      { title: "मौखिक परीक्षा तैयारी", points: ["वाचन चर्चा"] },
      { title: "शब्द शक्ति मुहावरे", points: ["प्रयोग शुद्धता"] },
      { title: "रचनात्मक लेखन", points: ["कथा पटकथा हल्का"] },
      { title: "संशोधन रणनीति", points: ["समय प्रबंधन"] },
    ],
    10: [
      { title: "क्षितिज कृतिका गहन अध्ययन", points: ["दीर्घ उत्तर कौशल"] },
      { title: "व्याकरण अनुप्रयोग", points: ["वाक्य रूपांतर", "अशुद्धि शोधन"] },
      { title: "लेखन कौशल बोर्ड", points: ["पत्र अनुच्छेद"] },
      { title: "विज्ञापन सूचना संदेश", points: ["प्रारूप"] },
      { title: "अपठित गद्य काव्य", points: ["बोध प्रश्न"] },
      { title: "काव्य खंड व्याख्या", points: ["संदर्भ प्रसंग"] },
      { title: "स्पर्श संचयन शैली कौशल", points: ["पाठ के अनुसार सार"] },
      { title: "मौखिक परीक्षा", points: ["प्रस्तुति"] },
      { title: "पूर्व वर्षों की शैली अभ्यास", points: ["नमूना प्रश्न"] },
      { title: "अंतिम पुनरावृत्ति", points: ["चेकलिस्ट"] },
    ],
  };
  return upper[grade] || upper[6];
}

function teluguNodes(grade) {
  const deep = {
    1: [
      {
        title: "అచ్చులు (Vowels అ ఆ …)",
        explanation: "Telugu vowels are called అచ్చులు. We start with అ ఆ ఇ ఈ ఉ ఊ ఋ ఎ ఏ ఐ ఒ ఓ ఔ అం అః — say them aloud with actions.",
        points: [
          "అ is the base open sound",
          "ఆ is a longer ah sound",
          "Practice writing each అచ్చు neatly",
          "Clap once per vowel while chanting",
        ],
        examples: [
          ex("అచ్చు", "Which vowel starts the word ఆమ్ (ām — mango idea)?", ["Long ఆ sound"], "ఆ"),
          ex("Say", "Say అ and ఆ — which is longer?", ["Length"], "ఆ"),
        ],
        questions: [
          mcq("t1q1", "Telugu vowels are called…", ["హల్లులు", "అచ్చులు", "పదాలు", "వాక్యాలు"], 1),
          mcq("t1q2", "Which is a Telugu vowel?", ["క", "అ", "మ్", "ట"], 1),
        ],
      },
      {
        title: "హల్లులు Basics (Consonants)",
        explanation: "Consonants are హల్లులు. Begin with క ఖ గ ఘ ఙ and other familiar classroom letters.",
        points: [
          "కవర్గం: క ఖ గ ఘ ఙ",
          "Combine with అ to say క",
          "Trace letters in sand or air",
          "Match letter to picture cards",
        ],
        examples: [
          ex("అక్షరం", "క + అ sound is spoken as…", ["Base consonant"], "క"),
        ],
        questions: [
          mcq("t1q3", "క belongs to…", ["అచ్చులు", "హల్లులు", "సంఖ్యలు", "రంగులు"], 1),
        ],
      },
      {
        title: "ఒత్తులు & Simple Joint Ideas",
        explanation: "Sometimes letters join. Early grades only notice simple gunintalu (vowel signs) on consonants.",
        points: [
          "క + ా → కా",
          "కి కీ కు కూ patterns",
          "Read with finger under each letter",
        ],
        examples: [
          ex("గుణింతం", "మ్ + ా makes…", ["మా"], "మా"),
        ],
      },
      {
        title: "సాధారణ పదాలు (Simple Words)",
        explanation: "Read two- and three-letter words: అమ్మ, నాన్న, బడి, పుస్తకం ideas in friendly forms.",
        points: [
          "అమ్మ (mother)",
          "నాన్న / తండ్రి (father)",
          "నీరు (water)",
          "బడి (school)",
        ],
        examples: [
          ex("పదం", "మనం నీరు…", ["తాగుతాము"], "తాగుతాము"),
        ],
        questions: [
          mcq("t1q4", "అమ్మ means…", ["School", "Mother", "Book", "Water"], 1),
        ],
      },
      {
        title: "నమస్కారం & Myself",
        explanation: "Greet and introduce: నమస్కారం, నా పేరు …, నేను బడికి వెళ్తాను.",
        points: [
          "నమస్కారం — hello/respect",
          "నా పేరు ___",
          "ధన్యవాదాలు — thank you",
        ],
        examples: [
          ex("పరిచయం", "Complete: నా పేరు ____.", ["Say your name"], "Your name"),
        ],
      },
      {
        title: "రంగులు & సంఖ్యలు Words",
        explanation: "Colour and number words: ఎరుపు, నీలం, పచ్చ; ఒకటి రెండు మూడు…",
        points: [
          "ఎరుపు red; పచ్చ green; నీలం blue",
          "ఒకటి to పది counting words",
          "Point to objects and name them",
        ],
        examples: [
          ex("రంగు", "Leaf is often…", ["పచ్చ"], "పచ్చ"),
        ],
        questions: [
          mcq("t1q5", "పచ్చ refers to…", ["Red", "Green", "Black", "White"], 1),
        ],
      },
      {
        title: "చిన్న వాక్యాలు",
        explanation: "Make tiny sentences: ఇది పుస్తకం. అది బంతి. నేను చదువుతాను.",
        points: [
          "ఇది / అది",
          "Subject + action",
          "End with full stop idea",
        ],
        examples: [
          ex("వాక్యం", "ఇది ___ (book).", ["పుస్తకం"], "పుస్తకం"),
        ],
      },
      {
        title: "పాటలు & Listening",
        explanation: "Listen to a short Telugu rhyme; clap and repeat lines to build ear memory.",
        points: [
          "Listen twice before speaking",
          "New words జాబితా (list)",
          "Sing softly in class",
        ],
        examples: [
          ex("వినికిడి", "Why repeat a పాట?", ["Memory & clear speech"], "To remember words"),
        ],
      },
      {
        title: "మర్యాద పదాలు",
        explanation: "Polite words: దయచేసి, క్షమించండి, ధన్యవాదాలు.",
        points: [
          "దయచేసి — please",
          "క్షమించండి — sorry",
          "ధన్యవాదాలు — thanks",
        ],
        examples: [
          ex("మర్యాద", "After help we say…", ["ధన్యవాదాలు"], "ధన్యవాదాలు"),
        ],
      },
      {
        title: "చిత్రం చూసి చెప్పడం",
        explanation: "Look at a picture and say 2 Telugu words or one short sentence.",
        points: [
          "Name objects in Telugu",
          "Use ఇది/అది",
          "Smile and speak clearly",
        ],
        examples: [
          ex("చిత్రం", "Seeing a పక్షి you may say…", ["ఇది పక్షి"], "ఇది పక్షి"),
        ],
      },
    ],
    2: [
      {
        title: "అచ్చులు సమీక్ష (Vowel Review)",
        explanation: "Grade 2 revises all అచ్చులు fluently — reading order and quick writing.",
        points: [
          "అ ఆ ఇ ఈ ఉ ఊ ఋ ౠ ఎ ఏ ఐ ఒ ఓ ఔ అం అః",
          "Long vs short pairs",
          "Dictation of vowels",
        ],
        examples: [
          ex("జోడి", "ఇ and ఈ differ by…", ["Length of sound"], "Sound length"),
        ],
        questions: [
          mcq("t2q1", "ఆ is a…", ["Short vowel only", "Long vowel", "Consonant", "Number"], 1),
        ],
      },
      {
        title: "హల్లులు వర్గాలు",
        explanation: "Organise consonants in vargas: క చ ట త ప … and practise clear pronunciation.",
        points: [
          "5 vargas + avargulu ideas",
          " aspirated vs unaspirated lightly",
          "Daily 5-minute reading",
        ],
        examples: [
          ex("వర్గం", "చ ఛ జ ఝ ఞ belong to which group idea?", ["చవర్గం"], "చ-varga"),
        ],
      },
      {
        title: "గుణింతాలు (Vowel Signs)",
        explanation: "Attach vowel signs to consonants: కా కి కీ కు కూ కె కే కై కొ కో కౌ.",
        points: [
          "Same base consonant, new melody",
          "Read gunintha charts aloud",
          "Write 10 combinations daily",
        ],
        examples: [
          ex("గుణింతం", "క + ి → ?", ["కి"], "కి"),
        ],
        questions: [
          mcq("t2q2", "కా shows క with which vowel idea?", ["అ", "ఆ", "ఇ", "ఉ"], 1),
        ],
      },
      {
        title: "ఒత్తు Letters",
        explanation: "Ottulu mark consonant clusters in child-friendly words (start simple).",
        points: [
          "Spot ottu marks in textbooks",
          "Slow blending",
          "Ask teacher for tricky clusters",
        ],
        examples: [
          ex("చదవడం", "Why read slowly with ఒత్తు?", ["Blend sounds"], "To blend clearly"),
        ],
      },
      {
        title: "పదాలు: ఇల్లు బడి ఆట",
        explanation: "Theme words for home, school and play in Telugu script.",
        points: [
          "ఇల్లు — house",
          "బడి / పాఠశాల — school",
          "ఆట — game",
          "స్నేహితుడు — friend",
        ],
        examples: [
          ex("పదం", "We learn at…", ["బడి"], "బడి"),
        ],
        questions: [
          mcq("t2q3", "ఇల్లు means…", ["Tree", "House", "River", "Sky"], 1),
        ],
      },
      {
        title: "లింగం & వచనం Light",
        explanation: "Notice masculine/feminine and singular/plural word ideas in examples.",
        points: [
          "బాలుడు / బాలిక",
          "పుస్తకం / పుస్తకాలు",
          "Match pictures to forms",
        ],
        examples: [
          ex("వచనం", "One book పుస్తకం; many books…", ["పుస్తకాలు"], "పుస్తకాలు"),
        ],
      },
      {
        title: "సాధారణ వ్యాకరణం",
        explanation: "Naming words and action words in Telugu sentences.",
        points: [
          "నామవాచకం idea",
          "క్రియ idea",
          "Make 5 short sentences",
        ],
        examples: [
          ex("వాక్యం", "రాము బడికి వెళ్తాడు — action is…", ["వెళ్తాడు"], "వెళ్తాడు"),
        ],
      },
      {
        title: "చదువు & అర్థం",
        explanation: "Read a 3–4 line paragraph and answer who/what questions in Telugu or English.",
        points: [
          "Finger tracking",
          "Underline new words",
          "Answer in full sentences when possible",
        ],
        examples: [
          ex("ప్రశ్న", "If title is నా ఇల్లు, topic is…", ["Home"], "Home / ఇల్లు"),
        ],
      },
      {
        title: "పద్యం / లాలి",
        explanation: "Enjoy a short పద్యం — feel rhythm; explain meaning in simple words.",
        points: [
          "Rhythm clapping",
          "Moral in one line",
          "New vocabulary list",
        ],
        examples: [
          ex("భావం", "Why learn పద్యం?", ["Language + joy"], "Joyful language practice"),
        ],
      },
      {
        title: "వ్రాత సాధన",
        explanation: "Neat four-line writing: letters on lines, even spacing, daily diary one sentence.",
        points: [
          "Correct grip",
          "Even letter size",
          "One diary line: ఈరోజు…",
        ],
        examples: [
          ex("డైరీ", "Start with…", ["ఈరోజు"], "ఈరోజు"),
        ],
      },
    ],
    3: [
      { title: "గుణింతాలు Mastery", explanation: "Speed and accuracy with all vowel signs on common consonants.", points: ["Charts timed", "Dictation", "Peer check"], examples: [ex("కే", "క + ే →", ["కే"], "కే")] },
      { title: "సంయుక్తాక్షరాలు", explanation: "Read conjunct letters carefully in grade-level words.", points: ["Slow blend", "Word list", "Flashcards"] },
      { title: "వాక్య నిర్మాణం", explanation: "SOV comfort: subject–object–verb patterns in simple Telugu.", points: ["తెలుగు order", "Punctuation", "5 sentences/day"] },
      { title: "విశేషణాలు", explanation: "Describing words: పెద్ద చిన్న మంచి సుందరమైన.", points: ["Add to nouns", "Opposites", "Picture describe"] },
      { title: "కాలం Intro", explanation: "Present/past feelings: చేస్తున్నాను / చేశాను.", points: ["Time words", "Transform drills", "Story tense"] },
      { title: "పదబంధాలు", explanation: "Useful daily phrases for school requests and friends.", points: ["దయచేసి సహాయం చేయండి", "నాకు అర్థం కాలేదు", "మళ్లీ చెప్పండి"] },
      { title: "కథ చదవడం", explanation: "Short moral stories — sequence beginning–middle–end.", points: ["Characters", "Problem", "Ending"] },
      { title: "లేఖ రచన", explanation: "Friendly letter to a friend about a festival.", points: ["Address date", "Body", "Closing"] },
      { title: "పద్య భావం", explanation: "Explain 2 lines of a poem in own words (Telugu + English OK).", points: ["Central idea", "Word meanings", "Recitation"] },
      { title: "వ్యతిరేక పదాలు", explanation: "Opposites bank: రాత్రి-పగలు, లాభం-నష్టం…", points: ["Pairs list", "Quiz each other", "Use in sentences"] },
    ],
    4: [
      { title: "సంధి పరిచయం", explanation: "Two sounds meeting may change — gentle intro to సంధి with common school examples.", points: ["Observe textbook examples", "Do not force memorize all rules yet", "Say forms aloud"], examples: [ex("గమనిక", "సంధి means joining of…", ["Sounds/words"], "Sounds")] },
      { title: "సమాసం Light", explanation: "Compound word ideas — see how two words pack into one meaning.", points: ["Spot compounds", "Expand simply", "Notebook list"] },
      { title: "వ్యాకరణ: కర్త కర్మ", explanation: "Who does the action (కర్త) and what receives it (కర్మ).", points: ["Ask ఎవరు/ఏమి", "Colour-code parts", "Rewrite sentences"] },
      { title: "పర్యాయ & వ్యతిరేక", explanation: "Synonyms and antonyms for richer vocabulary.", points: ["10 pairs", "Match games", "Context use"] },
      { title: "వ్యాస రచన", explanation: "Short essay: నా పాఠశాల / ఉగాది / వర్షం.", points: ["Intro 3 points close", "Telugu connectors", "Edit spellings"] },
      { title: "కథ & సంభాషణ", explanation: "Write dialogue between two friends planning homework.", points: ["Names colon", "Polite forms", "Clear ending"] },
      { title: "అపఠిత గద్యం", explanation: "Unseen prose: find answers from the text, not from memory.", points: ["Underline evidence", "Short answers", "New word meanings"] },
      { title: "పద్యం అభ్యాసం", explanation: "Memorise a short పద్యం with meaning and moral.", points: ["Daily 2 lines", "Explain", "Class recital"] },
      { title: "విభక్తి Ideas", explanation: "Case endings lightly — notice how endings mark relationships.", points: ["Textbook charts", "Example sentences", "Teacher model"] },
      { title: "మాట్లాడే నైపుణ్యం", explanation: "1-minute talk: నా ఇష్టమైన పండుగ.", points: ["Notes first", "Eye contact", "Thank listeners"] },
    ],
    5: [
      { title: "సంధి విధాలు (Overview)", explanation: "Meet major సంధి types with kid-friendly examples — pattern spotting over rote dumps.", points: ["స్వర సంధి idea", "హల్లు సంధి idea", "Collect 5 examples"], examples: [ex("ఉదా", "Why learn సంధి?", ["Smooth joining of sounds"], "Clear fluent speech")] },
      { title: "సమాస రకాలు Light", explanation: "Name a few समास kinds seen in class readings.", points: ["Identify", "Expand", "Avoid over-labelling"] },
      { title: "అలంకారాలు Intro", explanation: "Simile-like beauty in Telugu poetry — ఉపమా feel.", points: ["Compare gently", "Find in poem", "Own one line"] },
      { title: "వ్యాకరణ సమీకరణం", explanation: "Revision web: sandhi, gender, number, tense markers.", points: ["Error correction", "Transformation", "Peer quiz"] },
      { title: "వ్యాసం 150 పదాలు", explanation: "Plan → draft → edit for school essay topics.", points: ["Outline", "Facts/examples", "Conclusion"] },
      { title: "ఉపన్యాస లేఖ", explanation: "Formal note/application style for class needs.", points: ["Respectful opening", "Purpose", "Closing"] },
      { title: "అపఠిత పద్యం", explanation: "Unseen poem: central idea + two textual questions.", points: ["Imagery", "Tone", "Vocabulary"] },
      { title: "నాటక పఠనం", explanation: "Read a playlet with expression.", points: ["Character voice", "Pause", "Team practice"] },
      { title: "పదసంపద Project", explanation: "Collect 20 village/city Telugu words vs school Telugu.", points: ["Respect dialects", "Table", "Present"] },
      { title: "పరీక్ష సాధన", explanation: "Timed reading + short writing every weekend.", points: ["Clock practice", "Self checklist", "Revise mistakes"] },
    ],
  };
  if (deep[grade]) return deep[grade];
  const upper = {
    6: [
      { title: "సాహిత్య పఠనం", points: ["Theme", "Characters", "Summary in Telugu"] },
      { title: "సంధి సమాసం", points: ["Rules with examples", "Identify in text"] },
      { title: "అలంకారాలు ఛందస్సు Light", points: ["Basic devices", "Metre feel"] },
      { title: "వ్యాకరణం: విభక్తులు", points: ["Case endings practice"] },
      { title: "లేఖలు & దరఖాస్తులు", points: ["Formal formats"] },
      { title: "వ్యాస రచన", points: ["Structure", "Cohesion"] },
      { title: "అపఠిత గద్య పద్య", points: ["Board-style Qs"] },
      { title: "సంభాషణ & వక్తృత్వం", points: ["Speech skills"] },
      { title: "పదజాలం", points: ["Synonyms idioms"] },
      { title: "ప్రాజెక్ట్", points: ["Local culture report"] },
    ],
    7: [
      { title: "గద్య పద్య హాస్య సాహిత్యం", points: ["Genre awareness"] },
      { title: "సంధి సమాసం లోతు", points: ["More patterns"] },
      { title: "రసాలు అలంకారాలు", points: ["Identify with lines"] },
      { title: "వాక్య దోష నివారణ", points: ["Edit Telugu sentences"] },
      { title: "వార్తా రచన హల్కా", points: ["5W summary"] },
      { title: "వ్యాసం కథ", points: ["Creative accuracy"] },
      { title: "అపఠిత", points: ["Evidence-based answers"] },
      { title: "చర్చా నైపుణ్యం", points: ["Listen refute politely"] },
      { title: "పద్యం కంఠస్థం", points: ["Meaning + recitation"] },
      { title: "భాషా సర్వే", points: ["Community words"] },
    ],
    8: [
      { title: "సాహిత్య విమర్శ నైపుణ్యం", points: ["Justify opinions"] },
      { title: "వ్యాకరణ సమగ్రత", points: ["Sandhi samasa vibhakti"] },
      { title: "ఛందోఅలంకార", points: ["Examples bank"] },
      { title: "నివేదిక & ఎడిటర్ లేఖ", points: ["Formal register"] },
      { title: "ప్రకటన సూచన", points: ["Concise writing"] },
      { title: "అనువాదం Light", points: ["EN↔TE simple paras"] },
      { title: "అపఠిత మిశ్రమ", points: ["Prose poetry"] },
      { title: "నాటకాభినయం", points: ["Expression"] },
      { title: "మాధ్యమ అవగాహన", points: ["Ads bias"] },
      { title: "ప్రాజెక్ట్ ప్రదర్శన", points: ["Slides + talk"] },
    ],
    9: [
      { title: "పాఠ్యభాగ లోతైన అధ్యయనం", points: ["Extract answers"] },
      { title: "వ్యాకరణ బోర్డు నమూనా", points: ["Application focus"] },
      { title: "రచనా నైపుణ్యాలు", points: ["Letters essays"] },
      { title: "సంక్షిప్తీకరణ", points: ["Note making idea"] },
      { title: "అపఠిత", points: ["Inference"] },
      { title: "కవితా వివరణ", points: ["Devices theme"] },
      { title: "మౌఖిక పరీక్ష", points: ["Speaking listening"] },
      { title: "పదసంపద", points: ["Academic + literary"] },
      { title: "సృజనాత్మక రచన", points: ["Story speech"] },
      { title: "సమయ నిర్వహణ", points: ["Revision plan"] },
    ],
    10: [
      { title: "పాఠ్యాంశాల సమగ్ర అవగాహన", points: ["Long answers", "Quotes"] },
      { title: "వ్యాకరణ అనువర్తనం", points: ["Transforms", "Error fix"] },
      { title: "బోర్డు రచనా నైపుణ్యం", points: ["Formats accuracy"] },
      { title: "సంక్షిప్త రచనలు", points: ["Notice message ad"] },
      { title: "అపఠిత గద్య పద్య", points: ["Board pattern"] },
      { title: "కావ్య భాగ వ్యాఖ్య", points: ["Context explanation"] },
      { title: "మౌఖిక విశ్వాసం", points: ["ASL-like practice"] },
      { title: "పూర్వపు ప్రశ్న శైలి", points: ["Timed mocks"] },
      { title: "సంధి సమాస ధారణ", points: ["High-yield lists"] },
      { title: "అంతిమ పునశ్చరణ", points: ["Checklist"] },
    ],
  };
  return upper[grade] || upper[6];
}

function socialNodes(grade) {
  const map = {
    1: [
      { title: "My Family", explanation: "Family members share work, love and festivals. Draw your family tree with names.", points: ["Parents caregivers", "Helping hands", "Respect elders"], examples: [ex("Family", "A mother’s care is part of…", ["Family love"], "Family")] },
      { title: "My School", explanation: "School is where we learn with teachers and friends. Know classroom rules.", points: ["Teachers help us learn", "Share and wait turns", "Care for books"], examples: [ex("School", "We learn reading in…", ["School"], "School")] },
      { title: "My Neighbourhood", explanation: "Shops, parks, roads and neighbours make a neighbourhood.", points: ["Know nearby helpers", "Keep lanes clean", "Greet neighbours kindly"], examples: [ex("Place", "Park is for…", ["Play safely"], "Safe play")] },
      { title: "Helpers Around Us", explanation: "Doctor, teacher, cleaner, police and farmer each help society.", points: ["All jobs matter", "Thank helpers", "Safety first"], examples: [ex("Help", "Who treats the sick?", ["Doctor"], "Doctor")] },
      { title: "Transport we See", explanation: "Land, water and air vehicles move people and goods.", points: ["Bus train car", "Boat ship", "Aeroplane"], examples: [ex("Sky", "Planes travel in…", ["Air"], "Air")] },
      { title: "Festivals We Celebrate", explanation: "India’s festivals show joy, colours and sharing sweets.", points: ["Many religions festivals", "Share calmly", "Safety with crackers"], examples: [ex("Light", "Diwali is a festival of…", ["Lights"], "Lights")] },
      { title: "Our Nation Symbols Intro", explanation: "Flag and national animal/bird are symbols we respect.", points: ["Tiranga colours idea", "Respect the flag", "National bird peacock idea"], examples: [ex("Flag", "Our national flag is the…", ["Tiranga"], "Tiranga")] },
      { title: "Maps: Classroom Plan", explanation: "A simple plan shows where things are — door, board, desks.", points: ["Symbols", "Near far", "Bird’s-eye idea"], examples: [ex("Plan", "A map key explains…", ["Symbols"], "Symbols")] },
      { title: "Good Citizens Habits", explanation: "Queue, honesty, kindness and not littering are early civics.", points: ["Follow rules", "Tell truth", "Help classmates"], examples: [ex("Queue", "Why stand in line?", ["Fairness"], "Fairness")] },
      { title: "Earth Care Beginnings", explanation: "Don’t waste water or electricity; plant and protect trees.", points: ["Save water", "Less plastic", "Love plants"], examples: [ex("Care", "Turning off lights saves…", ["Electricity"], "Electricity")] },
    ],
    2: [
      { title: "Family and Neighbourhood" }, { title: "School and Helpers" }, { title: "Transport and Directions" },
      { title: "Festivals" }, { title: "India Basics" }, { title: "Rules and Safety" }, { title: "Earth Care" },
    ],
    3: [
      { title: "Our Community Services", explanation: "Post, bank, hospital, transport — public services we use.", points: ["Locate on local map", "Why taxes help services", "Polite requests"] },
      { title: "Means of Livelihood", explanation: "Farming, crafts, shops and offices — people earn in many ways.", points: ["Respect all work", "Local products", "Gender fair work idea"] },
      { title: "Early Cities & Travel Stories", explanation: "People travelled for trade and ideas; stories connect places.", points: ["Trade routes idea", "Why rivers mattered", "Travel then vs now"] },
      { title: "India: States Glimpse", explanation: "India has many states and languages — unity in diversity.", points: ["Capital New Delhi", "Your state name", "Celebrate diversity"] },
      { title: "Landforms Light", explanation: "Mountains, plains, deserts, coasts — places look different.", points: ["Himalaya idea", "Plains farming", "Sea shores"] },
      { title: "Water and Rain", explanation: "Rivers, lakes and rain support life and farming.", points: ["Do not pollute", "Seasonal rain", "Save freshwater"] },
      { title: "Local History Memory", explanation: "Old buildings, monuments and elders’ stories are living history.", points: ["Ask elders", "Care for monuments", "Museums"] },
      { title: "Rules Laws Fairness", explanation: "Rules keep games and roads fair; laws protect rights gently introduced.", points: ["School rules", "Road rules", "Equality idea"] },
      { title: "Markets", explanation: "Buyers and sellers meet; price depends on demand and need somehow.", points: ["Local haat", "Expiry dates", "Budget small list"] },
      { title: "Disaster Preparedness Kids", explanation: "Know meeting points and emergency numbers with family.", points: ["Stay calm", "Adult instructions", "Kit idea"] },
    ],
    4: [
      { title: "Indian Geography Overview", explanation: "Locate oceans around India; north mountains, south peninsula idea.", points: ["Neighbours", "Tropic of Cancer idea", "Physical map colours"] },
      { title: "Climate and Lifestyle", explanation: "Clothes, food and houses often match climate.", points: ["Desert vs coast", "Monsoon importance", "Adaptations"] },
      { title: "Agriculture Basics", explanation: "Crops need soil, water and care; India grows many staples.", points: ["Kharif rabi idea light", "Farmers’ hard work", "Food waste less"] },
      { title: "Industries Light", explanation: "Raw materials become goods in factories; cottage industries at home scale.", points: ["Examples local", "Workers safety", "Made in India pride"] },
      { title: "Transport & Communication", explanation: "Roads railways airways and phones connect the nation.", points: ["Choose suitable mode", "Digital kindness", "Address PIN"] },
      { title: "Our History Heritage", explanation: "Forts temples churches mosques tell layered stories — respect all.", points: ["ASI care idea", "No vandalism", "Unity"] },
      { title: "Government Around Us", explanation: "Local bodies help water roads schools; adults vote in democracy.", points: ["Sarpanch/Mayor idea", "Public property", "Rights & duties kids"] },
      { title: "Rights in Daily Life", explanation: "Right to education and equality — treat all genders and castes fairly.", points: ["No discrimination", "Include friends", "Speak up to adult"] },
      { title: "Natural Resources", explanation: "Soil forests minerals water — use wisely for the future.", points: ["Renewable non-renewable idea", "Conservation", "3Rs"] },
      { title: "Mapping Skills", explanation: "Scale, directions, legends on political/physical maps.", points: ["NE SW", "Legend", "Estimate distances lightly"] },
    ],
    5: [
      { title: "Earth as a Globe", explanation: "Globe vs map; continents oceans; India on the globe.", points: ["Axis poles", "Equator idea", "Day night"] },
      { title: "Lat Long Basics", explanation: "Imaginary lines help locate places precisely.", points: ["Latitude heat zones idea", "Longitude time idea", "Find with atlas"] },
      { title: "Major Landforms of India", explanation: "Himalayas, Northern Plains, Peninsular Plateau, Coastal plains, Islands.", points: ["Features", "How people live", "Map labelling"] },
      { title: "Indian Freedom Struggle Stories", explanation: "Age-appropriate heroes and non-violence values — freedom took courage.", points: ["Unity", "Satyagraha idea", "Respect flag"] },
      { title: "Constitution Values Intro", explanation: "Justice liberty equality fraternity — kid meanings with examples.", points: ["Preamble values", "Fundamental duties light", "Respect diversity"] },
      { title: "How Local Government Works", explanation: "Ward issues: garbage streetlights — raise politely with adults.", points: ["Participation", "Public money care", "RTI curiosity later"] },
      { title: "Economic Life Around Us", explanation: "Goods services money banks saving — simple money sense.", points: ["Needs vs wants", "Save share", "Honest trade"] },
      { title: "Agriculture & Food Security Idea", explanation: "Enough food for all needs fair systems and less waste.", points: ["Midday meal idea", "Farmer respect", "Balanced plate"] },
      { title: "India and the World", explanation: "Neighbours, oceans, cooperation — peace matters.", points: ["SAARC idea light", "Trade culture", "Sports links"] },
      { title: "Sustainable Development Kids", explanation: "Meet our needs without spoiling Earth for tomorrow.", points: ["Clean energy idea", "Trees", "Community action"] },
    ],
    6: [
      { title: "What, Where, How and When? (History skills)", points: ["Sources", "Timeline"] },
      { title: "From Hunting-Gathering to Growing Food", points: ["Early societies"] },
      { title: "In the Earliest Cities", points: ["Harappan overview"] },
      { title: "What Books and Burials Tell Us", points: ["Vedas", "Megaliths"] },
      { title: "Kingdoms, Kings and an Early Republic", points: ["Janapadas", "Mahajanapadas"] },
      { title: "New Questions and Ideas", points: ["Buddhism Jainism ideas"] },
      { title: "Ashoka the Emperor", points: ["Dhamma", "Inscriptions"] },
      { title: "Vital Villages, Thriving Towns", points: ["Crafts trade"] },
      { title: "Traders, Kings and Pilgrims", points: ["Silk route ideas"] },
      { title: "New Empires and Kingdoms", points: ["Guptas others overview"] },
      { title: "The Earth in the Solar System / Globe Latitudes", points: ["Geography skills"] },
      { title: "Motions of the Earth & Maps", points: ["Rotation revolution", "Maps"] },
      { title: "Major Domains / Landforms", points: ["Litho hydro atmo bio"] },
      { title: "Diversity and Discrimination / Government", points: ["Civics values", "Levels of government"] },
      { title: "Rural & Urban Livelihoods", points: ["Economic life"] },
    ],
    7: [
      { title: "Tracing Changes Through a Thousand Years", points: ["Manuscripts", "Periodisation"] },
      { title: "New Kings and Kingdoms", points: ["Administration temple"] },
      { title: "The Delhi Sultans", points: ["Expansion", "Administration"] },
      { title: "The Mughal Empire", points: ["Akbar ideas", "Mansabdari light"] },
      { title: "Rulers and Buildings / Towns Traders Crafts", points: ["Architecture economy"] },
      { title: "Tribal Societies & Devotional Paths", points: ["Bhakti Sufi"] },
      { title: "Environment / Inside Earth / Earth Movements", points: ["Geo themes"] },
      { title: "Air Water Natural Vegetation", points: ["Atmosphere", "Water cycle", "Forests"] },
      { title: "Human Environment Settlement Transport", points: ["Settlements"] },
      { title: "Life in Deserts", points: ["Adaptations"] },
      { title: "On Equality / Role of Government", points: ["Health", "Women empowerment ideas"] },
      { title: "How the State Government Works", points: ["MLAs", "Debates"] },
      { title: "Media & Gender Advertising", points: ["Critical viewing"] },
      { title: "Markets Around Us / A Shirt in the Market", points: ["Chains of production"] },
    ],
    8: [
      { title: "How, When and Where / From Trade to Territory", points: ["Colonial arrival"] },
      { title: "Ruling the Countryside / Tribals", points: ["Revenue", "Revolts"] },
      { title: "When People Rebel 1857", points: ["Causes", "Leaders"] },
      { title: "Civilising the Native / Women Caste Reform", points: ["Education reform"] },
      { title: "The Making of the National Movement", points: ["1885–1947 arc"] },
      { title: "India After Independence", points: ["Constitution nation building"] },
      { title: "Resources / Land Soil Water", points: ["Conservation"] },
      { title: "Agriculture / Industries", points: ["Types", "Factors"] },
      { title: "Human Resources", points: ["Population ideas"] },
      { title: "The Indian Constitution / Secularism", points: ["Key features"] },
      { title: "Parliament / Judiciary", points: ["Law making", "Justice"] },
      { title: "Social Justice & Marginalisation", points: ["Adivasis", "Minorities"] },
      { title: "Public Facilities / Law and Social Justice", points: ["Water", "Workers"] },
      { title: "Disaster Management & Mapping Skills", points: ["Preparedness", "Atlas"] },
    ],
    9: [
      { title: "French Revolution", points: ["Causes", "Ideas liberty"] },
      { title: "Socialism in Europe & Russian Revolution", points: ["Industrial society", "1917"] },
      { title: "Nazism and the Rise of Hitler", points: ["Propaganda", "World War II link"] },
      { title: "Forest Society and Colonialism / Pastoralists", points: ["Livelihoods"] },
      { title: "Peasants and Farmers", points: ["Agrarian change"] },
      { title: "India — Size Location / Physical Features", points: ["Geo base"] },
      { title: "Drainage / Climate / Natural Vegetation", points: ["Monsoon", "Biodiversity"] },
      { title: "Population", points: ["Distribution", "Literacy"] },
      { title: "What is Democracy? Why Democracy?", points: ["Features arguments"] },
      { title: "Constitutional Design / Electoral Politics", points: ["Preamble", "Elections"] },
      { title: "Working of Institutions / Democratic Rights", points: ["Parliament courts", "FR"] },
      { title: "The Story of Village Palampur / People as Resource", points: ["Economics intro"] },
      { title: "Poverty / Food Security in India", points: ["Challenges schemes"] },
    ],
    10: [
      { title: "The Rise of Nationalism in Europe", points: ["Nation-states", "1848 ideas"] },
      { title: "Nationalism in India", points: ["Non-cooperation", "Civil disobedience"] },
      { title: "The Making of a Global World / Age of Industrialisation", points: ["Trade empire industry"] },
      { title: "Print Culture and the Modern World", points: ["Print & opinions"] },
      { title: "Resources and Development / Forest & Wildlife", points: ["Planning conservation"] },
      { title: "Water Resources / Agriculture", points: ["Multipurpose", "Cropping"] },
      { title: "Minerals Energy / Manufacturing Industries", points: ["Locations", "Pollution"] },
      { title: "Lifelines of National Economy", points: ["Transport communication trade"] },
      { title: "Power Sharing / Federalism", points: ["Belgium Sri Lanka lessons", "India federal"] },
      { title: "Democracy and Diversity / Gender Religion Caste", points: ["Social divisions politics"] },
      { title: "Popular Struggles / Political Parties / Outcomes of Democracy", points: ["Movements", "Parties", "Evaluation"] },
      { title: "Development / Sectors of Indian Economy", points: ["Indicators", "Primary secondary tertiary"] },
      { title: "Money and Credit / Globalisation", points: ["Banks SHG", "MNCs WTO light"] },
      { title: "Consumer Rights", points: ["COPRA", "Aware consumer"] },
    ],
  };
  return map[grade] || map[6];
}

function gkNodes(grade) {
  const map = {
    1: [
      { title: "Good Habits", explanation: "Brush, bathe, pack bag, say sorry — habits make mornings smoother.", points: ["Hygiene", "Greeting", "Sharing toys"], examples: [ex("Habit", "We brush teeth…", ["Twice a day idea"], "Morning and night")] },
      { title: "Days and Months", explanation: "Seven days; twelve months; birthday months are special!", points: ["Week order", "Month names", "Today yesterday tomorrow"], examples: [ex("Week", "Day after Monday?", ["Tuesday"], "Tuesday")] },
      { title: "Colours and Shapes Mix", explanation: "Name colours in clothes and shapes in traffic signs.", points: ["Primary colours idea", "Safety sign shapes", "Art time"], examples: [ex("Stop", "Stop sign is often…", ["Octagon/red"], "Red")] },
      { title: "Animals and Babies", explanation: "Kid, calf, cub, joey — young ones have special names.", points: ["Farm vs wild", "Sounds", "Care for pets"], examples: [ex("Baby", "A baby cat is a…", ["Kitten"], "Kitten")] },
      { title: "Fruits and Vegetables", explanation: "Energy from natural foods; rainbow plate is fun.", points: ["Local seasonal", "Wash before eat", "Try one new weekly"], examples: [ex("Citrus", "Orange is rich in…", ["Vitamin C idea"], "Vitamin C")] },
      { title: "India Flag & Emblem Light", explanation: "Tiranga and the Lion Capital are proud symbols.", points: ["Saffron white green", "Ashoka Chakra", "Respect rules"], examples: [ex("Chakra", "Wheel on flag is…", ["Ashoka Chakra"], "Ashoka Chakra")] },
      { title: "Sky Watch", explanation: "Sun gives day; moon and stars decorate night (safe viewing).", points: ["Never stare at sun", "Moon changes shape", "Clouds bring rain"], examples: [ex("Day", "We see sun mostly in…", ["Day"], "Day")] },
      { title: "Sports We Play", explanation: "Running, cricket, football — play fair and hydrate.", points: ["Teamwork", "Warm-up", "Include everyone"], examples: [ex("Bat", "Cricket uses bat and…", ["Ball"], "Ball")] },
      { title: "Safety GK", explanation: "Emergency: know parent phone; never go with strangers.", points: ["Road look both ways", "Fire: don’t hide", "Tell a trusted adult"], examples: [ex("Cross", "Cross at…", ["Zebra crossing"], "Zebra crossing")] },
      { title: "Our Helpers Quiz Bank", explanation: "Match tools to helpers: stethoscope, chalk, hose, spade.", points: ["Doctor teacher", "Firefighter farmer", "Respect all"], examples: [ex("Tool", "Chalk is for a…", ["Teacher"], "Teacher")] },
    ],
    2: [
      { title: "Habits Calendar" }, { title: "Colours Shapes" }, { title: "Nature" }, { title: "India Symbols" },
      { title: "Monuments" }, { title: "Sky" }, { title: "Helpers" }, { title: "Environment" }, { title: "Sports" },
    ],
    3: [
      { title: "Indian States Capitals (Starter Set)", explanation: "Learn your state capital plus a few neighbours.", points: ["Atlas game", "Flashcards", "5 new weekly"] },
      { title: "National Symbols Full Set", explanation: "Animal, bird, flower, fruit, tree, anthem respect.", points: ["Tiger peacock", "Lotus mango", "Anthem posture"] },
      { title: "Continents and Oceans", explanation: "Seven continents; five oceans — Earth is mostly water.", points: ["Globe spin", "Locate India", "Ocean names"] },
      { title: "Inventions Kids Love", explanation: "Wheel, printing, telephone, bulb — curiosity built tools.", points: ["Who roughly", "How life changed", "Inventor mindset"] },
      { title: "Human Body Quick Facts", explanation: "Heart pumps; lungs breathe; brain thinks; bones support.", points: ["Organs jobs", "Exercise", "Sleep"] },
      { title: "Famous Indian Personalities (Age-fit)", explanation: "Leaders scientists sportspersons who inspire kindness and grit.", points: ["1 fact each", "No rote overload", "Values first"] },
      { title: "Festivals Across India", explanation: "Harvest and light festivals teach gratitude.", points: ["Season link", "Food customs", "Safety"] },
      { title: "Wildlife Wonders", explanation: "Endangered means at risk — parks protect animals.", points: ["Tiger elephant", "Do not buy ivory ideas", "Quiet in sanctuaries"] },
      { title: "Sports Cups & Games", explanation: "Olympics spirit; India’s popular sports.", points: ["Fair play", "Team India pride", "Local games"] },
      { title: "Environment Badges", explanation: "Earn a ‘green badge’ by listing 5 eco actions at home.", points: ["Segregate waste", "Plant", "Save power"] },
    ],
    4: [
      { title: "World: Neighbouring Countries", explanation: "Pakistan Nepal Bhutan Bangladesh China Myanmar Sri Lanka Maldives ideas.", points: ["Map borders", "Peace", "Trade culture"] },
      { title: "Indian Rivers & Mountains", explanation: "Ganga Yamuna Godavari; Himalaya Western Ghats fame.", points: ["Source mouth idea", "Clean rivers", "Map labelling"] },
      { title: "Monuments Trail", explanation: "Taj Red Fort Qutub Charminar — art + history tourism.", points: ["Location state", "Builder era light", "No litter"] },
      { title: "Science in Daily Life GK", explanation: "Why ice melts, why we sweat, magnets on fridge.", points: ["Observe", "Ask why", "Safe trials"] },
      { title: "Books and Authors (Kids)", explanation: "Meet a few classic children’s authors/poets.", points: ["Library visit", "Favourite book talk", "Respect books"] },
      { title: "Currency and Emblems", explanation: "₹ symbol; reserve bank idea lightly; coins eras.", points: ["Money care", "Counterfeit alert with adult", "Saving"] },
      { title: "Space Basics", explanation: "ISRO pride; planets order mnemonic fun.", points: ["Solar system", "Moon landing history light", "Dream big"] },
      { title: "First Aid GK", explanation: "Nosebleed, minor cut, burn cooling — call adult always.", points: ["Clean water", "No panic", "Emergency numbers"] },
      { title: "Computer Awareness Start", explanation: "Monitor keyboard mouse; kind online behaviour.", points: ["Password privacy", "Time limits", "Ask before download"] },
      { title: "Current Affairs Junior", explanation: "Weekly: one national & one sports headline discussed at home.", points: ["Child-safe news", "Ask questions", "Map the place"] },
    ],
    5: [
      { title: "Indian Constitution Preamble Words", explanation: "Sovereign socialist secular democratic republic — kid translations.", points: ["Justice liberty equality", "Fraternity", "Respect document"] },
      { title: "UNESCO & Heritage Ideas", explanation: "World Heritage Sites in India — why preserve?", points: ["Taj value", "Tourism vs care", "Local heritage"] },
      { title: "Awards Padma Overview", explanation: "Civilian awards honour service in many fields.", points: ["Fields of work", "Inspiration", "Hard work"] },
      { title: "Religions of India Harmony", explanation: "Many faiths; shared values of kindness.", points: ["Visit with respect", "No hate speech", "Festival sharing"] },
      { title: "Climate Change Kids", explanation: "Warming trends; small actions add up.", points: ["Less waste", "Trees", "Walk short trips"] },
      { title: "Transport Mega Projects Idea", explanation: "Metros expressways ports connect trade — jobs & travel.", points: ["Public transport", "Safety", "Etiquette"] },
      { title: "Nutrition Labels Light", explanation: "Read sugar salt on packs with an adult.", points: ["Ingredients order", "Expiry", "Water over soda"] },
      { title: "Cyber Safety Level-up", explanation: "Think before share; block report; no meeting strangers.", points: ["Personal info", "Kind comments", "Adult ally"] },
      { title: "Olympic Values & Yoga", explanation: "Excellence respect friendship; yoga for focus.", points: ["Breathing", "Posture", "Daily short practice"] },
      { title: "Quiz Championship Skills", explanation: "Buzz in after thinking; revise notebooks; stay humble in win/lose.", points: ["Categories rotate", "Error log", "Team spirit"] },
    ],
    6: [
      { title: "World Geography Quick Facts", points: ["Continents extremes", "Longest rivers"] },
      { title: "Indian Polity Basics", points: ["Parliament", "President PM roles light"] },
      { title: "Science GK Mix", points: ["SI units", "Human body facts"] },
      { title: "History Timeline Bytes", points: ["Ancient medieval modern markers"] },
      { title: "Sports Records & Events", points: ["Major cups"] },
      { title: "Books & Culture", points: ["Classical arts intro"] },
      { title: "Environment Treaties Light", points: ["Why protect Earth"] },
      { title: "Economy Everyday", points: ["GST idea", "Banks"] },
      { title: "Tech & Innovation India", points: ["Digital public goods idea"] },
      { title: "Quiz Methods", points: ["Spaced revision"] },
    ],
    7: [
      { title: "UN and International Orgs", points: ["UN WHO UNICEF roles light"] },
      { title: "Indian Freedom Icons Extended", points: ["Diverse regions leaders"] },
      { title: "Geography Extremes India/World", points: ["Peaks deserts rains"] },
      { title: "Science Nobel Snapshot", points: ["Curiosity heroes"] },
      { title: "Constitution Articles Awareness", points: ["Fundamental rights feel"] },
      { title: "Business Brands Ethics", points: ["Consumer sense"] },
      { title: "Media Literacy", points: ["Fake news checks"] },
      { title: "Space Missions India", points: ["Chandrayaan style pride facts"] },
      { title: "Health Pandemic Lessons", points: ["Hygiene vaccines science trust"] },
      { title: "Club Quiz Leagues", points: ["Team roles"] },
    ],
    8: [
      { title: "World Wars Overview Bytes", points: ["Causes consequences peace"] },
      { title: "Climate Agreements", points: ["Paris idea", "India’s efforts"] },
      { title: "Financial Literacy Plus", points: ["Interest", "Budget", "Scam alert"] },
      { title: "Legal Literacy Starter", points: ["Rights duties", "Helplines"] },
      { title: "Science Frontier GK", points: ["DNA vaccines AI fairness"] },
      { title: "Sports Governance", points: ["Olympics Commonwealth"] },
      { title: "Cultural Heritage Deep", points: ["Classical languages arts"] },
      { title: "Disaster Protocols", points: ["NDMA awareness"] },
      { title: "Career Awareness Seed", points: ["Skills curiosity"] },
      { title: "Debate Current Topics Safe", points: ["Evidence respect"] },
    ],
    9: [
      { title: "Electoral & Constitutional GK", points: ["Election Commission", "Amendments feel"] },
      { title: "Global Economy Bytes", points: ["GDP HDI ideas"] },
      { title: "Modern History Chronology", points: ["Key years precision"] },
      { title: "Physical Geography Challenge", points: ["Winds currents soils"] },
      { title: "Science Olympiad Style Mix", points: ["Reasoning facts"] },
      { title: "India Yearbook Habit", points: ["Schemes ministries"] },
      { title: "Cyber Law Ethics", points: ["IT Act awareness"] },
      { title: "Awards & Reports", points: ["Index awareness careful"] },
      { title: "Sports Analytics Light", points: ["Records context"] },
      { title: "Research Skills for GK", points: ["Credible sources"] },
    ],
    10: [
      { title: "Board-Ready Static GK", points: ["Polity geography economy mix"] },
      { title: "Contemporary India Capsule", points: ["Schemes dates carefully"] },
      { title: "International Relations Lite", points: ["Neighbours groupings"] },
      { title: "Science & Tech Updates Habit", points: ["Weekly digest"] },
      { title: "Environment & SDGs", points: ["Goals links India"] },
      { title: "Economy Indicators", points: ["Inflation unemployment ideas"] },
      { title: "Legal & Constitutional Cases Feel", points: ["Rights relevance"] },
      { title: "Personality & Books", points: ["Authors reports"] },
      { title: "Exam Smart Revision", points: ["One-pagers", "Weekly tests"] },
      { title: "Ethical Citizenship", points: ["Integrity digital citizenship"] },
    ],
  };
  return map[grade] || map[6];
}

function getNodes(grade, subject) {
  switch (subject) {
    case "maths":
      return mathsNodes(grade);
    case "science":
      return scienceNodes(grade);
    case "english":
      return englishNodes(grade);
    case "hindi":
      return hindiNodes(grade);
    case "telugu":
      return teluguNodes(grade);
    case "social-studies":
      return socialNodes(grade);
    case "gk":
      return gkNodes(grade);
    default:
      return [];
  }
}

function subjectTitle(grade, subject) {
  const deep = isDeep(grade);
  const tag = deep ? "Complete" : "Outline";
  const names = {
    maths: "Maths",
    science: grade <= 5 ? "Science / EVS" : "Science",
    english: "English",
    hindi: "Hindi",
    telugu: "Telugu",
    "social-studies": "Social Studies",
    gk: "General Knowledge",
  };
  return `${names[subject]} — CBSE Grade ${grade} ${tag}`;
}

function enrichNodes(grade, subject, nodes) {
  // Ensure outline grades have enough section titles (8–15)
  let list = nodes.slice();
  if (!isDeep(grade) && list.length < 8) {
    while (list.length < 8) {
      list.push({
        title: `Extension Topic ${list.length + 1} for Grade ${grade}`,
        points: defaultPoints(`Extension ${list.length}`, grade, subject),
      });
    }
  }
  if (isDeep(grade) && list.length < 6) {
    while (list.length < 6) {
      list.push({
        title: `Practice Theme ${list.length + 1}`,
        explanation: defaultExplain(`Practice Theme ${list.length}`, grade, subject),
        points: defaultPoints(`Practice ${list.length}`, grade, subject),
      });
    }
  }
  if (isDeep(grade) && list.length > 12) list = list.slice(0, 12);
  if (!isDeep(grade) && list.length > 15) list = list.slice(0, 15);
  return list;
}

function subjectSpecificQuestions(grade, subject) {
  const bank = {
    maths: [
      mcq(`m${grade}x1`, "7 × 8 = ?", ["54", "56", "63", "48"], 1),
      mcq(`m${grade}x2`, "A square has how many equal sides?", ["3", "4", "5", "6"], 1),
      mcq(`m${grade}x3`, "Perimeter of a rectangle is…", ["l×b", "2(l+b)", "l+b", "l−b"], 1),
      mcq(`m${grade}x4`, "Half of 18 is…", ["6", "8", "9", "12"], 2),
      mcq(`m${grade}x5`, "Place value of 5 in 352 is…", ["5", "50", "500", "35"], 1),
    ],
    science: [
      mcq(`s${grade}x1`, "Plants mainly make food in their…", ["Roots", "Leaves", "Flowers", "Fruits"], 1),
      mcq(`s${grade}x2`, "We inhale which gas more needed by body?", ["Carbon dioxide", "Oxygen", "Nitrogen only", "Smoke"], 1),
      mcq(`s${grade}x3`, "Water boils at (approx at sea level)…", ["50°C", "100°C", "0°C", "200°C"], 1),
      mcq(`s${grade}x4`, "A push or pull is called a…", ["Force", "Meal", "Colour", "Planet"], 0),
      mcq(`s${grade}x5`, "The Earth moves around the…", ["Moon", "Sun", "Mars", "Pole star only"], 1),
    ],
    english: [
      mcq(`e${grade}x1`, "Choose the noun: The cat sleeps.", ["sleeps", "cat", "the", "quickly"], 1),
      mcq(`e${grade}x2`, "Opposite of happy is…", ["glad", "sad", "joyful", "merry"], 1),
      mcq(`e${grade}x3`, "A sentence usually starts with a…", ["comma", "capital letter", "question only", "emoji"], 1),
      mcq(`e${grade}x4`, "She ___ to school daily.", ["go", "goes", "going", "gone"], 1),
      mcq(`e${grade}x5`, "Which is a question word?", ["Because", "Where", "And", "Very"], 1),
    ],
    hindi: [
      mcq(`h${grade}x1`, "‘अ’ है एक…", ["व्यंजन", "स्वर", "विराम", "संख्या"], 1),
      mcq(`h${grade}x2`, "संज्ञा है…", ["दौड़ना", "पुस्तक", "और", "धीरे"], 1),
      mcq(`h${grade}x3`, "धन्यवाद कहना है…", ["शिष्टाचार", "गुस्सा", "शोर", "खेल नहीं"], 0),
      mcq(`h${grade}x4`, "विलोम: दिन का उल्टा?", ["सुबह", "रात", "दोपहर", "साल"], 1),
      mcq(`h${grade}x5`, "क्रिया चुनें", ["लड़का", "खाना", "लाल", "दिल्ली"], 1),
    ],
    telugu: [
      mcq(`te${grade}x1`, "అచ్చులు means…", ["Consonants", "Vowels", "Numbers", "Punctuation"], 1),
      mcq(`te${grade}x2`, "నమస్కారం is used to…", ["Greet respectfully", "Count money", "Measure length", "Draw only"], 0),
      mcq(`te${grade}x3`, "అమ్మ means…", ["Father", "Mother", "School", "Water"], 1),
      mcq(`te${grade}x4`, "కా is క with…", ["అ", "ఆ", "ఇ", "ఉ"], 1),
      mcq(`te${grade}x5`, "ధన్యవాదాలు means…", ["Sorry", "Please", "Thank you", "Go away"], 2),
    ],
    "social-studies": [
      mcq(`ss${grade}x1`, "India’s national capital is…", ["Mumbai", "New Delhi", "Kolkata", "Chennai"], 1),
      mcq(`ss${grade}x2`, "A neighbourhood includes…", ["Only oceans", "Homes shops people nearby", "Other planets", "None"], 1),
      mcq(`ss${grade}x3`, "Democracy values people’s…", ["Silence only", "Participation & votes", "Littering", "Fear"], 1),
      mcq(`ss${grade}x4`, "Maps help us find…", ["Locations", "Recipes only", "Dreams only", "Nothing"], 0),
      mcq(`ss${grade}x5`, "Saving water is part of…", ["Earth care", "Wasting", "Ignoring rules", "Pollution"], 0),
    ],
    gk: [
      mcq(`g${grade}x1`, "How many days in a week?", ["5", "6", "7", "10"], 2),
      mcq(`g${grade}x2`, "National bird of India is…", ["Crow", "Peacock", "Sparrow", "Eagle"], 1),
      mcq(`g${grade}x3`, "We should cross roads at a…", ["Anywhere", "Zebra crossing", "Tunnel only", "Blind bend"], 1),
      mcq(`g${grade}x4`, "Olympics promote…", ["Cheating", "Fair play", "Litter", "Hate"], 1),
      mcq(`g${grade}x5`, "Turning off unused lights helps…", ["Waste power", "Save electricity", "Break bulbs", "None"], 1),
    ],
  };
  return bank[subject] || [];
}

function buildDocument(grade, subject) {
  const nodes = enrichNodes(grade, subject, getNodes(grade, subject));
  const expanded = isDeep(grade)
    ? expandDeep(grade, subject, nodes)
    : expandOutline(grade, subject, nodes);

  // Merge subject-specific quiz items for quality
  const extra = subjectSpecificQuestions(grade, subject);
  let questions = [...extra, ...expanded.questions];
  // Dedupe by id
  const seen = new Set();
  questions = questions.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
  const qMin = isDeep(grade) ? 8 : 6;
  const qMax = isDeep(grade) ? 15 : 10;
  while (questions.length < qMin) {
    questions.push(
      mcq(
        `auto-${subject}-${grade}-${questions.length}`,
        `Grade ${grade} ${subjectLabel(subject)}: pick a true study habit.`,
        ["Revise a little every day", "Never open the book", "Guess without thinking", "Skip all quizzes"],
        0
      )
    );
  }
  questions = questions.slice(0, qMax);

  const doc = {
    title: subjectTitle(grade, subject),
    grade,
    depth: depthLabel(grade),
    sections: expanded.sections,
    questions,
  };
  if (subject === "maths") {
    doc.tables = tablesFor(grade);
  }
  return doc;
}

function shouldSkip(grade, subject, outPath) {
  if (grade !== 2) return false;
  if (subject === "telugu") return false; // always (re)write grade-2 telugu
  if (fs.existsSync(outPath)) return true;
  return false;
}

function main() {
  let written = 0;
  let skipped = 0;
  const writtenList = [];
  const skippedList = [];

  for (const grade of GRADES) {
    const dir = path.join(DATA, `grade-${grade}`);
    fs.mkdirSync(dir, { recursive: true });

    for (const subject of SUBJECTS) {
      const outPath = path.join(dir, `${subject}.json`);
      if (shouldSkip(grade, subject, outPath)) {
        skipped += 1;
        skippedList.push(`grade-${grade}/${subject}.json`);
        continue;
      }
      const doc = buildDocument(grade, subject);
      fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), "utf8");
      written += 1;
      writtenList.push({
        file: `grade-${grade}/${subject}.json`,
        sections: doc.sections.length,
        questions: doc.questions.length,
        depth: doc.depth,
      });
    }
  }

  console.log("=== Curriculum generation complete ===");
  console.log(`Directories ensured: grade-1 .. grade-10 under ${DATA}`);
  console.log(`Files written: ${written}`);
  console.log(`Files skipped: ${skipped}`);
  if (skippedList.length) {
    console.log("Skipped (existing grade-2, except telugu):");
    skippedList.forEach((f) => console.log("  -", f));
  }
  console.log("Written sample (first 5):");
  writtenList.slice(0, 5).forEach((w) =>
    console.log(`  - ${w.file} [${w.depth}] sections=${w.sections} q=${w.questions}`)
  );
  console.log("…");
  const g1 = writtenList.filter((w) => w.file.startsWith("grade-1/"));
  const g10 = writtenList.filter((w) => w.file.startsWith("grade-10/"));
  console.log(`Grade 1 files written: ${g1.length}`);
  console.log(`Grade 10 files written: ${g10.length}`);
  console.log(`Grade 2 telugu written: ${writtenList.some((w) => w.file === "grade-2/telugu.json")}`);
}

main();
