# -*- coding: utf-8 -*-
import json
from pathlib import Path

root = Path(r"numair-app/data")


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


hindi = {
    "title": "Hindi — CBSE कक्षा 2 पूर्ण पाठ्यक्रम",
    "sections": [
        sec(
            "swar",
            "🔤",
            "स्वर",
            "स्वर वे ध्वनियाँ हैं जिन्हें अकेले बोला जा सकता है। रोज़ स्वरों का अभ्यास करें।",
            ["अ आ इ ई उ ऊ", "ए ऐ ओ औ", "अं अः", "उदाहरण: आ से आता, ई से ईख"],
            [
                ex("पहचान", "आ क्या है?", ["अकेले बोला जा सकता है"], "स्वर"),
                ex("उदाहरण", "इ से कौन-सा शब्द?", ["इमली"], "इमली"),
            ],
        ),
        sec(
            "vyanjan",
            "क",
            "व्यंजन",
            "व्यंजन स्वर की मदद से बोले जाते हैं। कक्षा 2 में सभी व्यंजन याद करें।",
            [
                "क ख ग घ ङ",
                "च छ ज झ ञ",
                "ट ठ ड ढ ण · त थ द ध न",
                "प फ ब भ म · य र ल व · श ष स ह",
            ],
            [ex("उदाहरण", "म क्या है?", ["व्यंजन"], "व्यंजन")],
        ),
        sec(
            "matra",
            "ा",
            "मात्राएँ",
            "मात्रा स्वर की ध्वनि को व्यंजन के साथ जोड़ती है।",
            [
                "ा (आ) का, मा",
                "ि (इ) कि · ी (ई) की",
                "ु (उ) कु · ू (ऊ) कू",
                "े (ए) के · ै (ऐ) कै · ो (ओ) को · ौ (औ) कौ",
            ],
            [
                ex("जोड़", "क + आ = ?", ["ा लगाएँ"], "का"),
                ex("और", "क + उ = ?", ["ु"], "कु"),
            ],
        ),
        sec(
            "words",
            "📖",
            "शब्द ज्ञान",
            "अक्षरों को जोड़कर शब्द बनते हैं। रोज़ नए शब्द पढ़ें और लिखें।",
            [
                "घर, जल, फल, बाल, नदी",
                "किताब, कলম, स्कूल, बस्ता",
                "माँ, पापा, भाई, बहन",
                "सूरज, चाँद, तारा, बादल",
            ],
            [ex("अर्थ", "घर का अंग्रेज़ी अर्थ?", ["home"], "Home / House")],
        ),
        sec(
            "sentences",
            "✍️",
            "वाक्य",
            "वाक्य में पूरा भाव होता है। स्पष्ट और सही वाक्य बोलें व लिखें।",
            [
                "मैं स्कूल जाता हूँ।",
                "यह मेरा घर है।",
                "माँ खाना बनाती हैं।",
                "हम फल खाते हैं।",
                "आज मौसम अच्छा है।",
            ],
            [ex("पढ़ें", "मैं स्कूल जाता हूँ — कहाँ जाता हूँ?", ["स्कूल"], "स्कूल")],
        ),
        sec(
            "sangya",
            "📛",
            "संज्ञा (नाम वाले शब्द)",
            "संज्ञा किसी व्यक्ति, वस्तु, स्थान या जानवर के नाम को कहते हैं।",
            [
                "व्यक्ति: नुमैर, शिक्षक",
                "स्थान: दिल्ली, स्कूल, पार्क",
                "वस्तु: किताब, घड़ी",
                "जानवर: बिल्ली, तोता",
            ],
            [ex("चुनें", "संज्ञा कौन-सी है: दौड़ना / स्कूल / सुंदर?", ["नाम"], "स्कूल")],
        ),
        sec(
            "kriya",
            "🏃",
            "क्रिया (काम वाले शब्द)",
            "क्रिया उस शब्द को कहते हैं जिससे किसी काम का पता चले।",
            ["खाना, पीना, पढ़ना, लिखना, खेलना, सोना", "नुमैर खेलता है।"],
            [ex("चुनें", "क्रिया: कुर्सी / दौड़ना / लाल", ["काम"], "दौड़ना")],
        ),
        sec(
            "vilom",
            "🔄",
            "विलोम और समान अर्थ",
            "विलोम शब्द उल्टा अर्थ बताते हैं। कुछ शब्द लगभग एक जैसे अर्थ वाले भी होते हैं।",
            [
                "दिन — रात",
                "आना — जाना",
                "छोटा — बड़ा",
                "हंसना — रोना",
                "सच्चा — झूठा",
            ],
            [ex("विलोम", "छोटा का उल्टा?", ["बड़ा"], "बड़ा")],
        ),
        sec(
            "reading",
            "📚",
            "कहानी और कविता पढ़ना",
            "छोटी कहानियाँ और कविताएँ पढ़कर समझ बनाएँ। कठिन शब्द पूछें।",
            [
                "धीरे-धीरे पढ़ें",
                "मुख्य बात समझें: कौन, क्या, कहाँ",
                "नए शब्द कॉपी में लिखें",
            ],
            [
                ex(
                    "समझ",
                    "अगर कहानी में नुमैर पार्क में खेलता है, वह कहाँ है?",
                    ["पाठ से"],
                    "पार्क में",
                )
            ],
        ),
        sec(
            "lekhan",
            "🖋️",
            "लेखन अभ्यास",
            "साफ़ अक्षर लिखें। शब्दों और वाक्यों का दैनिक अभ्यास करें।",
            [
                "सीधी पंक्ति में लिखें",
                "मात्रा सही लगाएँ",
                "5 नए शब्द रोज़ लिखें",
                "3 छोटे वाक्य रोज़ बनाएँ",
            ],
            [ex("अभ्यास", "का शब्द से एक वाक्य बनाएँ", ["काका आते हैं।"], "काका आते हैं।")],
        ),
    ],
    "questions": [
        mcq("hq1", "आ कौन-सा है?", ["व्यंजन", "स्वर", "क्रिया", "संख्या"], 1),
        mcq("hq2", "क + आ = ?", ["कि", "का", "कु", "के"], 1),
        mcq("hq3", "क + उ = ?", ["का", "कि", "कु", "को"], 2),
        mcq("hq4", "पानी का शब्द है", ["किताब", "जल", "कपड़ा", "पेड़"], 1),
        tf("hq5", "म एक व्यंजन है।", True),
        mcq("hq6", "घर का अंग्रेज़ी मतलब", ["Tree", "Home", "Book", "Sun"], 1),
        mcq("hq7", "स्कूल जहाँ हम", ["सोते हैं", "पढ़ते हैं", "तैरते हैं", "उड़ते हैं"], 1),
        tf("hq8", "इ एक स्वर है।", True),
        mcq("hq9", "फल का उदाहरण", ["पत्थर", "सेब", "कुर्सी", "पानी"], 1),
        mcq("hq10", "माँ का मतलब", ["Father", "Mother", "Brother", "Teacher"], 1),
        mcq("hq11", "क + ई = ?", ["कि", "की", "के", "कै"], 1),
        tf("hq12", "का में आ की मात्रा है।", True),
        mcq("hq13", "संज्ञा उदाहरण", ["दौड़ना", "दिल्ली", "सुंदर", "तेज़"], 1),
        mcq("hq14", "क्रिया उदाहरण", ["किताब", "खेलना", "लाल", "बड़ा"], 1),
        mcq("hq15", "छोटा का विलोम", ["नया", "बड़ा", "मीठा", "सफ़ेद"], 1),
        mcq("hq16", "दिन का विलोम", ["सूरज", "रात", "स्कूल", "खेल"], 1),
        mcq("hq17", "हम फल ___ हैं।", ["उड़ाते", "खाते", "पीते केवल", "सोते"], 1),
        tf("hq18", "वाक्य में पूरा भाव होता है।", True),
        mcq("hq19", "तोता है एक", ["स्थान", "जानवर", "मात्रा", "विलोम"], 1),
        mcq("hq20", "क + ओ = ?", ["के", "कै", "को", "कौ"], 2),
    ],
}
save("hindi.json", hindi)

gk = {
    "title": "General Knowledge — Grade 2",
    "sections": [
        sec(
            "me",
            "🧒",
            "Myself and Good Habits",
            "Know your name, age, school and class. Good manners make everyone happy.",
            [
                "Say please, thank you and sorry",
                "Share and wait for your turn",
                "Keep your things tidy",
                "Respect parents, teachers and elders",
            ],
            [
                ex("Real life", "Someone gives you a pencil. What do you say?", ["Good manners"], "Thank you"),
            ],
        ),
        sec(
            "calendar",
            "📅",
            "Days, Months and Year",
            "There are 7 days in a week and 12 months in a year. Knowing the calendar helps planning school and holidays.",
            [
                "Days: Sunday to Saturday",
                "12 months: January to December",
                "365 days in a common year",
                "Birthday is a special day each year",
            ],
            [
                ex("Week", "How many days in a week?", ["7"], "7"),
                ex("Year", "How many months in a year?", ["12"], "12"),
            ],
        ),
        sec(
            "colours-shapes",
            "🎨",
            "Colours and Shapes",
            "Name common colours and shapes you see around you every day.",
            [
                "Colours: red, blue, green, yellow, orange, pink, black, white",
                "Shapes: circle, square, triangle, rectangle",
                "Traffic light: red stop, yellow wait, green go",
            ],
            [
                ex("Signal", "Green light means?", ["Go carefully"], "Go"),
                ex("Wheel", "A wheel looks like which shape?", ["Round"], "Circle"),
            ],
        ),
        sec(
            "nature",
            "🦁",
            "Animals, Birds, Fruits and Vegetables",
            "Nature gives us animals, birds, fruits and vegetables. Learn their names and uses.",
            [
                "Pets: dog, cat, rabbit",
                "Wild: lion, tiger, elephant",
                "Birds: crow, sparrow, parrot, peacock",
                "Fruits: mango, banana, apple, orange",
                "Vegetables: tomato, potato, carrot, spinach",
            ],
            [
                ex("National bird", "India national bird?", ["Peacock"], "Peacock"),
                ex("Fruit", "Yellow long fruit?", ["Banana"], "Banana"),
            ],
        ),
        sec(
            "india",
            "🇮🇳",
            "Our India (Basics)",
            "India is our country. We love our flag, national symbols and festivals of unity.",
            [
                "Country: India",
                "Capital: New Delhi",
                "National flag: Tiranga (saffron, white, green with Ashoka Chakra)",
                "National animal: Tiger",
                "National flower: Lotus",
                "National bird: Peacock",
            ],
            [
                ex("Capital", "Capital of India?", ["New Delhi"], "New Delhi"),
                ex("Flag", "How many colours in Tiranga (main bands)?", ["3"], "Three"),
            ],
        ),
        sec(
            "monuments",
            "🕌",
            "Famous Places",
            "India has beautiful monuments. Knowing them is fun GK!",
            [
                "Taj Mahal — Agra",
                "Red Fort — Delhi",
                "India Gate — Delhi",
                "Gateway of India — Mumbai",
                "Charminar — Hyderabad",
            ],
            [ex("Agra", "Taj Mahal is in?", ["Agra"], "Agra")],
        ),
        sec(
            "space",
            "🚀",
            "Sky and Space (Kid Level)",
            "The Sun gives light. Earth is our planet. Moon goes around Earth. Stars shine at night.",
            [
                "Sun is a star that lights our day",
                "Earth is our home planet",
                "Moon shines at night (reflected sunlight)",
                "Do not look directly at the Sun",
            ],
            [ex("Day", "What gives us daytime light?", ["Sun"], "The Sun")],
        ),
        sec(
            "safety-gk",
            "🚨",
            "Safety Numbers and Helping Hands",
            "Know who helps us and important emergency ideas (with a parent).",
            [
                "Doctor helps when we are sick",
                "Teacher helps us learn",
                "Police keep us safe",
                "Firefighter helps in fire",
                "Always tell a trusted adult if you need help",
            ],
            [ex("Sick", "Who do we visit when sick?", ["Doctor"], "Doctor")],
        ),
        sec(
            "science-gk",
            "🌦️",
            "Weather and Environment GK",
            "Know simple weather words and how to care for Earth.",
            [
                "Sunny, rainy, cloudy, windy, stormy",
                "Plant trees; do not waste water",
                "Say no to littering",
                "Reuse and recycle with family help",
            ],
            [ex("Plant", "Planting trees helps", ["Clean air / shade"], "The environment")],
        ),
        sec(
            "sports",
            "🏏",
            "Sports and Games",
            "Playing keeps us healthy. Know popular games in India and school.",
            [
                "Cricket, football, hockey, badminton, kabaddi",
                "Indoor: chess, carrom, ludo",
                "Exercise every day",
                "Play fair; never bully",
            ],
            [ex("Bat-ball", "A famous bat-and-ball game in India?", ["Cricket"], "Cricket")],
        ),
    ],
    "questions": [
        mcq("gq1", "Capital of India?", ["Mumbai", "New Delhi", "Kolkata", "Chennai"], 1),
        mcq("gq2", "How many days in a week?", ["5", "6", "7", "10"], 2),
        mcq("gq3", "National bird of India?", ["Crow", "Peacock", "Sparrow", "Owl"], 1),
        mcq("gq4", "National animal of India?", ["Lion", "Tiger", "Elephant", "Cow"], 1),
        mcq("gq5", "Taj Mahal is in", ["Delhi", "Agra", "Jaipur", "Mumbai"], 1),
        mcq("gq6", "Green traffic light means", ["Stop", "Go", "Sleep", "Jump"], 1),
        mcq("gq7", "How many months in a year?", ["10", "11", "12", "7"], 2),
        mcq("gq8", "A wheel looks like a", ["Square", "Triangle", "Circle", "Rectangle"], 2),
        tf("gq9", "We should say thank you.", True),
        tf("gq10", "Littering is good for Earth.", False),
        mcq("gq11", "National flower of India?", ["Rose", "Lotus", "Sunflower", "Lily"], 1),
        mcq("gq12", "Who helps when we are sick?", ["Doctor", "Pilot", "Chef only", "Driver only"], 0),
        mcq("gq13", "Our planet is", ["Mars", "Earth", "Moon", "Sun"], 1),
        mcq("gq14", "Yellow long fruit:", ["Apple", "Banana", "Grapes", "Orange"], 1),
        mcq("gq15", "Tiranga has how many main colour bands?", ["2", "3", "4", "5"], 1),
        mcq("gq16", "Red Fort is in", ["Mumbai", "Delhi", "Chennai", "Goa"], 1),
        mcq("gq17", "Best day for kite flying?", ["No air", "Windy", "Inside cupboard", "Under water"], 1),
        mcq("gq18", "A popular Indian bat-and-ball sport:", ["Chess", "Cricket", "Swimming only", "Painting"], 1),
        mcq("gq19", "Moon is seen mainly at", ["Noon only", "Night", "Never", "Underground"], 1),
        mcq("gq20", "Saying please shows", ["Rudeness", "Good manners", "Anger", "Lazy habit"], 1),
    ],
}
save("gk.json", gk)

sst = {
    "title": "Social Studies / EVS Society — CBSE Grade 2",
    "sections": [
        sec(
            "family",
            "👨‍👩‍👧‍👦",
            "My Family",
            "A family lives together and cares for one another. Joint and small families both share love and duties.",
            [
                "Parents, siblings, grandparents",
                "Help at home with small chores",
                "Celebrate together",
                "Speak kindly to family members",
            ],
            [
                ex("Home", "Who usually helps you get ready for school?", ["Parents/elders"], "Parents or elders"),
            ],
        ),
        sec(
            "neighbourhood",
            "🏘️",
            "My Neighbourhood",
            "A neighbourhood has houses, shops, parks, school and helpers. Keep it clean and friendly.",
            [
                "Neighbours live near us",
                "Places: market, park, mosque/temple/church, hospital",
                "Greet neighbours politely",
                "Do not make loud noise late at night",
            ],
            [ex("Park", "A place to play near home?", ["Park"], "Park")],
        ),
        sec(
            "school",
            "🏫",
            "Our School",
            "School is where we learn and make friends. Follow school rules and respect teachers.",
            [
                "Classroom, library, playground",
                "Teacher, principal, classmates",
                "Be on time; wear uniform",
                "Listen in class; complete homework",
            ],
            [ex("Learn", "Who teaches us in class?", ["Teacher"], "Teacher")],
        ),
        sec(
            "helpers",
            "🧑‍🚒",
            "People Who Help Us",
            "Community helpers make life safe and easy. Thank them and respect their work.",
            [
                "Doctor, nurse, teacher",
                "Police officer, firefighter",
                "Postman, farmer, cleaners",
                "Driver, carpenter, tailor",
            ],
            [
                ex("Fire", "Who helps if there is a fire?", ["Firefighter"], "Firefighter"),
                ex("Letters", "Who delivers letters?", ["Postman"], "Postman / courier helper"),
            ],
        ),
        sec(
            "transport",
            "🚌",
            "Transport and Communication",
            "Transport takes us from place to place. Communication helps us send messages.",
            [
                "Land: bicycle, car, bus, train",
                "Water: boat, ship",
                "Air: aeroplane, helicopter",
                "Communication: phone, letter, email (with parents)",
            ],
            [
                ex("School trip", "Many children go to school by", ["Bus/car/walk"], "Bus, car, or walking with adult"),
                ex("Sky", "We travel in the sky by", ["Aeroplane"], "Aeroplane"),
            ],
        ),
        sec(
            "directions",
            "🧭",
            "Directions and Maps",
            "Four main directions: North, South, East, West. A simple map helps us find places.",
            [
                "Sun rises in the East",
                "Sun sets in the West",
                "Map shows places with symbols",
                "Ask an adult before exploring new places",
            ],
            [ex("Sunrise", "Sun rises in the", ["East"], "East")],
        ),
        sec(
            "festivals",
            "🎉",
            "Festivals and Celebrations",
            "Festivals bring joy and teach sharing. India has many festivals of different communities.",
            [
                "Eid, Diwali, Christmas, Gurpurab, Pongal, Onam (examples)",
                "Republic Day (26 Jan), Independence Day (15 Aug)",
                "Share sweets; never burst risky fireworks alone",
                "Respect all cultures and religions",
            ],
            [
                ex("Freedom", "Independence Day is on", ["15 August"], "15 August"),
                ex("Respect", "Should we respect others festivals?", ["Yes"], "Yes"),
            ],
        ),
        sec(
            "india-sst",
            "🗺️",
            "Our Country and States (Intro)",
            "India is a large country with many states and languages. We are all Indians.",
            [
                "Capital: New Delhi",
                "Many states and union territories",
                "Many languages; Hindi and English widely used in schools",
                "Unity in diversity",
            ],
            [ex("Capital", "India capital city?", ["New Delhi"], "New Delhi")],
        ),
        sec(
            "rules",
            "🚦",
            "Rules, Rights and Safety",
            "Rules keep us safe at home, school and on the road. Children have the right to learn, play and be safe.",
            [
                "Road rules: walk on footpath; cross carefully",
                "School rules: no bullying; listen to teachers",
                "Home rules: ask before going out",
                "Tell a trusted adult if something feels wrong",
            ],
            [ex("Road", "We cross at the", ["Zebra crossing"], "Zebra crossing")],
        ),
        sec(
            "earth-care",
            "🌍",
            "Caring for Our Surroundings",
            "We share Earth with plants and animals. Keep surroundings clean and green.",
            [
                "Do not litter",
                "Save water and electricity",
                "Plant and protect trees",
                "Be kind to animals",
            ],
            [ex("Bin", "Where does rubbish go?", ["Dustbin"], "Dustbin")],
        ),
    ],
    "questions": [
        mcq("ss1", "Who teaches us in school?", ["Driver", "Teacher", "Pilot only", "Farmer only"], 1),
        mcq("ss2", "Sun rises in the", ["West", "East", "North", "South"], 1),
        mcq("ss3", "Independence Day date", ["26 January", "15 August", "2 October", "1 May"], 1),
        mcq("ss4", "Who helps in a fire?", ["Firefighter", "Chef", "Painter", "Singer"], 0),
        mcq("ss5", "A neighbourhood is", ["Only a jungle", "Area near our home", "Only a desert", "Only sky"], 1),
        mcq("ss6", "Capital of India", ["Mumbai", "New Delhi", "Agra", "Goa"], 1),
        tf("ss7", "We should respect all festivals.", True),
        tf("ss8", "Littering keeps surroundings clean.", False),
        mcq("ss9", "Transport in the air", ["Bus", "Ship", "Aeroplane", "Bicycle"], 2),
        mcq("ss10", "Postman helps with", ["Letters/parcels", "Cooking only", "Flying planes", "Building dams only"], 0),
        mcq("ss11", "School is a place to", ["Only sleep", "Learn and play", "Only shop", "Only farm"], 1),
        mcq("ss12", "Cross the road at", ["Anywhere", "Zebra crossing", "Highway middle", "Tunnel of toys"], 1),
        mcq("ss13", "Family members should", ["Fight always", "Care for each other", "Never talk", "Hide homework forever"], 1),
        mcq("ss14", "A map helps us", ["Cook rice", "Find places", "Sleep", "Paint only"], 1),
        mcq("ss15", "Doctor helps when we are", ["Hungry for games only", "Sick", "Flying", "Singing only"], 1),
        mcq("ss16", "Save water means", ["Leave taps open", "Close taps after use", "Wash roads all day", "Flood home"], 1),
        mcq("ss17", "Republic Day is on", ["15 August", "26 January", "25 December", "14 November"], 1),
        mcq("ss18", "A farmer grows", ["Aeroplanes", "Crops/food", "Computers only", "Cars only"], 1),
        mcq("ss19", "Unity in diversity means", ["Only one culture allowed", "Many cultures live together", "No festivals", "No languages"], 1),
        mcq("ss20", "If you need help, tell", ["Nobody ever", "A trusted adult", "A stranger online", "Random noise"], 1),
    ],
}
save("social-studies.json", sst)
print("done hindi+gk+sst")
