# -*- coding: utf-8 -*-
import json
from pathlib import Path

root = Path(r"numair-app/data")
root.mkdir(parents=True, exist_ok=True)


def sec(sid, icon, title, explanation, points, examples):
    return {
        "id": sid,
        "icon": icon,
        "title": title,
        "explanation": explanation,
        "points": points,
        "examples": examples,
    }


def ex(title, problem, steps, answer):
    return {"title": title, "problem": problem, "steps": steps, "answer": answer}


def mcq(qid, prompt, choices, answer):
    return {"id": qid, "type": "mcq", "prompt": prompt, "choices": choices, "answer": answer}


def tf(qid, prompt, answer):
    return {"id": qid, "type": "truefalse", "prompt": prompt, "answer": answer}


def save(name, data):
    path = root / name
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(name, "sections=", len(data.get("sections", [])), "q=", len(data.get("questions", [])))


science = {
    "title": "Science / EVS — CBSE Grade 2 Complete",
    "sections": [
        sec(
            "living",
            "🌱",
            "Living and Non-living Things",
            "Living things grow, need food, water and air, and can respond. Non-living things do not grow or need food. Sort objects at home and school.",
            [
                "Living: plant, cat, bird, fish, humans",
                "Non-living: chair, toy car, stone, pencil",
                "Living things can reproduce",
            ],
            [
                ex("Classroom", "Is a blackboard living?", ["It does not grow or eat"], "Non-living"),
                ex("Garden", "Is a butterfly living?", ["It moves, eats, grows"], "Living"),
            ],
        ),
        sec(
            "plants",
            "🪴",
            "Plants Around Us",
            "Plants are living. Roots, stem, leaves, flowers and fruits have jobs. Plants need sunlight, air, water and soil.",
            [
                "Roots take water",
                "Stem carries food and water",
                "Leaves make food in sunlight",
                "Flowers lead to fruits and seeds",
                "Trees are tall and woody; herbs are small; climbers need support",
            ],
            [
                ex("Neem", "A neem is a tree because it is tall and woody.", ["Tall woody plant"], "Tree"),
                ex("Needs", "What happens if a plant gets no water?", ["It wilts"], "It dries or wilts"),
            ],
        ),
        sec(
            "animals",
            "🐾",
            "Animals and Their Food",
            "Animals move to find food. Herbivores eat plants, carnivores eat meat, omnivores eat both.",
            [
                "Herbivore: cow, goat, rabbit, deer",
                "Carnivore: lion, tiger, eagle",
                "Omnivore: bear, crow, humans",
                "Pets need food, water, love and a clean place",
            ],
            [
                ex("Zoo", "A tiger eats meat. It is a…", ["Meat eater"], "Carnivore"),
                ex("Farm", "A cow eats grass. It is a…", ["Plant eater"], "Herbivore"),
            ],
        ),
        sec(
            "body",
            "🧍",
            "Our Body and Senses",
            "Our body helps us play and learn. Five senses tell us about the world. Bones support; muscles help us move.",
            [
                "Eyes see, ears hear, nose smells, tongue tastes, skin touches",
                "Wash hands, brush teeth, bathe, sleep well",
                "Exercise and play keep us strong",
            ],
            [
                ex("Kitchen", "You smell biryani with which organ?", ["Smell"], "Nose"),
                ex("Safety", "Should we put things in our ears?", ["Ears are delicate"], "No"),
            ],
        ),
        sec(
            "food",
            "🍎",
            "Food We Eat",
            "Food gives energy to study and play. Eat energy foods, body-building foods and protective foods. Drink clean water.",
            [
                "Energy: rice, bread, potato",
                "Body-building: milk, eggs, dal, meat",
                "Protective: fruits and vegetables",
                "Do not waste food; wash fruits before eating",
            ],
            [
                ex("Breakfast", "Milk and eggs help build the body.", ["Body-building"], "Body-building food"),
                ex("Water", "Why drink water on a hot day?", ["Replace sweat"], "To stay hydrated"),
            ],
        ),
        sec(
            "house",
            "🏠",
            "Houses and Clothes",
            "Houses keep us safe from heat, cold, rain and animals. Clothes protect us and match the weather.",
            [
                "Kutcha and pucca houses",
                "Summer: cotton, light clothes",
                "Winter: woollen, warm clothes",
                "Rainy: raincoat, umbrella",
                "School uniforms",
            ],
            [
                ex("Rain", "What will Numair carry in rain?", ["Keep dry"], "Umbrella or raincoat"),
                ex("Heat", "People wear cotton in hot weather.", ["Cotton is cool"], "Cotton clothes"),
            ],
        ),
        sec(
            "water-air",
            "💧",
            "Water, Air and Weather",
            "Clean air and water keep us healthy. Weather can be sunny, rainy, windy or cloudy. Save water.",
            [
                "Uses of water: drink, cook, bathe, clean",
                "Sources: rain, river, well, tap",
                "Wind is moving air",
                "Dark clouds often mean rain",
            ],
            [
                ex("Tap", "Close the tap after washing hands.", ["Save water"], "Saving water"),
                ex("Kite", "Best weather to fly a kite?", ["Need wind"], "Windy day"),
            ],
        ),
        sec(
            "day-night",
            "🌙",
            "Day, Night and Seasons",
            "The Sun gives light and heat by day. Night is dark. Seasons include summer, winter and rainy season.",
            [
                "Day: Sun in the sky",
                "Night: Moon and stars",
                "Summer is hot; winter is cold; rainy season is wet",
            ],
            [
                ex("Sleep", "We usually sleep at night.", ["Night is dark"], "Night"),
                ex("Mango", "Mangoes are common in Indian summer.", ["Summer fruit"], "Summer"),
            ],
        ),
        sec(
            "materials",
            "🧱",
            "Materials Around Us",
            "Things are made of wood, metal, plastic, glass, rubber or cloth. Choose the right material for the job.",
            [
                "Wood: door, pencil",
                "Metal: spoon, coin",
                "Plastic: bottle, toy",
                "Glass: window (be careful)",
                "Rubber: eraser, tyre",
            ],
            [
                ex("Window", "Windows are often glass to let light in.", ["See-through"], "Glass"),
                ex("Spoon", "Cooking spoons may be metal.", ["Strong material"], "Metal"),
            ],
        ),
        sec(
            "hygiene",
            "🧼",
            "Health, Hygiene and Safety",
            "Good habits keep germs away. Follow safety rules at home, on the road and at school.",
            [
                "Wash hands before eating",
                "Brush teeth twice a day",
                "Cross at zebra crossing with an adult",
                "Do not play with fire, sharp things or medicines",
                "Throw litter in the bin",
            ],
            [
                ex("Road", "Where should we cross the road?", ["Use crossing"], "Zebra crossing with an adult"),
                ex("Hands", "Wash hands before lunch?", ["Remove germs"], "Yes, always"),
            ],
        ),
    ],
    "questions": [
        mcq("sq1", "Which is living?", ["Stone", "Butterfly", "Cup", "Ball"], 1),
        mcq("sq2", "Plants make food mainly in", ["Roots", "Stem", "Leaves", "Flower only"], 2),
        mcq("sq3", "A lion is a", ["Herbivore", "Carnivore", "Plant", "Rock"], 1),
        mcq("sq4", "We smell with our", ["Eyes", "Ears", "Nose", "Skin"], 2),
        mcq("sq5", "Milk is mainly a", ["Energy food only", "Body-building food", "Toy", "Metal"], 1),
        mcq("sq6", "In rain we use a", ["Woollen cap only", "Umbrella", "Heater", "Sun hat only"], 1),
        tf("sq7", "Air is not needed by living things.", False),
        tf("sq8", "We should wash hands before eating.", True),
        mcq("sq9", "A tree is usually", ["A tiny herb", "A tall woody plant", "A stone", "Plastic"], 1),
        mcq("sq10", "Protective foods are mostly", ["TVs", "Fruits and vegetables", "Metals", "Bottles"], 1),
        mcq("sq11", "Bones help to", ["Taste food", "Support the body", "Make rain", "Smell"], 1),
        mcq("sq12", "Crossing the road is safest at", ["Anywhere", "Zebra crossing with adult", "Highway centre", "Behind a bus"], 1),
        mcq("sq13", "Wind is", ["Still water", "Moving air", "Rock", "Plastic"], 1),
        tf("sq14", "A chair is a living thing.", False),
        mcq("sq15", "Cotton clothes are good in", ["Icy weather only", "Hot summer", "Outer space", "Under water"], 1),
        mcq("sq16", "Which animal is a herbivore?", ["Tiger", "Cow", "Lion", "Eagle"], 1),
        mcq("sq17", "We see with our", ["Nose", "Eyes", "Tongue", "Ears"], 1),
        mcq("sq18", "Throw wrappers", ["On road", "In dustbin", "In river", "Under desk"], 1),
        mcq("sq19", "The Sun gives us", ["Plastic", "Light and heat", "Rupees", "Books"], 1),
        mcq("sq20", "Dark clouds often mean", ["Party", "Rain may come", "Snow always", "Night only"], 1),
    ],
}
save("science.json", science)

english = {
    "title": "English — CBSE Grade 2 Complete",
    "sections": [
        sec(
            "alphabet",
            "🔤",
            "Alphabet and Phonics",
            "English has 26 letters in capital and small forms. Phonics means letter sounds. Blend sounds to read words.",
            [
                "A to Z capital and a to z small",
                "Vowels: a e i o u",
                "Other letters are consonants",
                "Blend: c-a-t becomes cat",
            ],
            [
                ex("Blend", "s-u-n becomes?", ["Say each sound, then together"], "sun"),
                ex("Vowel", "Is e a vowel?", ["a e i o u"], "Yes"),
            ],
        ),
        sec(
            "sight",
            "👀",
            "Sight Words and Vocabulary",
            "Sight words appear often in books. Learn them quickly. Grow new words by reading every day.",
            [
                "the, a, and, is, to, you, I, said",
                "here, come, look, play, friend, school",
                "Opposites: big/small, hot/cold, happy/sad",
                "Rhyming: cat-hat, sun-fun",
            ],
            [
                ex("Sight", "Which is a sight word: elephant, the, mountain?", ["High frequency word"], "the"),
                ex("Opposite", "Opposite of hot?", ["Antonym"], "cold"),
            ],
        ),
        sec(
            "nouns",
            "📦",
            "Nouns (Naming Words)",
            "A noun names a person, place, animal or thing. Proper nouns begin with a capital letter.",
            [
                "Person: Numair, teacher",
                "Place: Delhi, school, park",
                "Animal: cat, parrot",
                "Thing: ball, book",
                "Proper noun: India, Monday, Numair",
            ],
            [
                ex("Pick", "Which is a noun: run, school, happy?", ["Names a place"], "school"),
                ex("Proper", "Should delhi start with a capital?", ["City name"], "Yes, Delhi"),
            ],
        ),
        sec(
            "pronouns",
            "🔁",
            "Pronouns",
            "Pronouns replace nouns so we do not repeat names: I, you, he, she, it, we, they.",
            [
                "Numair becomes he",
                "Maya becomes she",
                "The cat becomes it",
                "Numair and Ali become they",
            ],
            [ex("Replace", "Numair is kind. ___ helps others.", ["Boy = he"], "He")],
        ),
        sec(
            "verbs",
            "🏃",
            "Verbs (Action Words)",
            "Verbs show action or being: run, jump, eat, is, are, am.",
            [
                "Action: play, write, sing",
                "Being: is, am, are",
                "He runs / They run",
            ],
            [
                ex("Action", "Which is a verb: blue, jump, soft?", ["Action word"], "jump"),
                ex("Sentence", "The birds ___ in the sky.", ["They fly"], "fly"),
            ],
        ),
        sec(
            "adjectives",
            "🌈",
            "Adjectives (Describing Words)",
            "Adjectives describe nouns: size, colour, feeling or number.",
            [
                "big, small, red, soft, happy, kind, two",
                "In soft pillow, soft describes pillow",
            ],
            [
                ex("Fill", "The ___ mango is sweet (yellow).", ["Colour word"], "yellow"),
                ex("Pick", "Adjective in soft pillow?", ["Describes pillow"], "soft"),
            ],
        ),
        sec(
            "articles",
            "📰",
            "Articles: a, an, the",
            "Use a or an for one thing. Use an before a vowel sound. Use the for a particular thing.",
            [
                "a book, a pen",
                "an apple, an egg, an umbrella",
                "the Sun, the teacher",
            ],
            [
                ex("Choose", "___ elephant (a or an)", ["Vowel sound"], "an elephant"),
                ex("The", "We say the moon because we all know it.", ["Particular"], "the moon"),
            ],
        ),
        sec(
            "prepositions",
            "📍",
            "Prepositions (Position Words)",
            "Prepositions show place: in, on, under, over, behind, between, near.",
            [
                "The ball is under the table",
                "The cat is on the mat",
                "Numair stands between Ali and Omar",
            ],
            [
                ex("Bag", "Book is ___ the bag (inside).", ["Inside"], "in"),
                ex("Tree", "Bird is ___ the branch.", ["On"], "on"),
            ],
        ),
        sec(
            "sentences",
            "📝",
            "Sentences and Punctuation",
            "A sentence is a complete idea. Start with a capital letter. End with a full stop, question mark or exclamation mark.",
            [
                "Statement ends with .",
                "Question ends with ?",
                "Exclamation ends with !",
                "The word I is always capital",
            ],
            [
                ex("Fix", "the boy is kind", ["Capital + full stop"], "The boy is kind."),
                ex("Ask", "What is your name", ["Question mark"], "?"),
            ],
        ),
        sec(
            "comprehension",
            "📚",
            "Reading Comprehension",
            "Read a short passage carefully. Find who, what, where and why. Answer from the text.",
            [
                "Read twice",
                "Find key words",
                "Answer from the passage",
                "Learn new words from the story",
            ],
            [
                ex(
                    "Story tip",
                    "If the story says Numair plays in the park, where does he play?",
                    ["From the text"],
                    "In the park",
                )
            ],
        ),
    ],
    "questions": [
        mcq("eq1", "How many letters in the English alphabet?", ["24", "25", "26", "30"], 2),
        mcq("eq2", "Blend: c-a-t", ["cut", "cot", "cat", "cart"], 2),
        mcq("eq3", "Which is a noun?", ["run", "happy", "school", "quickly"], 2),
        mcq("eq4", "Which is a verb?", ["blue", "jump", "soft", "table"], 1),
        mcq("eq5", "Choose the adjective: The ___ flower.", ["and", "pretty", "run", "is"], 1),
        mcq("eq6", "___ apple", ["a", "an", "two", "many"], 1),
        mcq("eq7", "Correct sentence:", ["the cat runs.", "The cat runs.", "the Cat Runs", "THE cat runs?"], 1),
        mcq("eq8", "Opposite of big:", ["tall", "small", "loud", "fast"], 1),
        mcq("eq9", "Pronoun for Maya:", ["he", "she", "it", "they"], 1),
        mcq("eq10", "The ball is ___ the box (inside).", ["on", "in", "over", "between"], 1),
        tf("eq11", "Sentences start with a capital letter.", True),
        tf("eq12", "Happy is a verb.", False),
        mcq("eq13", "Sight word example:", ["encyclopedia", "the", "hippopotamus", "microphone"], 1),
        mcq("eq14", "Rhymes with sun:", ["sat", "fun", "pen", "dog"], 1),
        mcq("eq15", "Vowels are:", ["a e i o u", "b c d", "x y only", "numbers"], 0),
        mcq("eq16", "End a question with", [".", "!", "?", ","], 2),
        mcq("eq17", "Proper noun example:", ["city", "Delhi", "boy", "bag"], 1),
        mcq("eq18", "We ___ football.", ["plays", "play", "playing", "played"], 1),
        mcq("eq19", "Use an before a", ["vowel sound", "number only", "verb only", "silence"], 0),
        mcq("eq20", "A describing word is called an", ["verb", "noun", "adjective", "preposition"], 2),
    ],
}
save("english.json", english)
print("done science+english")
