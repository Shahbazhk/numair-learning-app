# -*- coding: utf-8 -*-
import json
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "data" / "duas.json"
data = json.loads(p.read_text(encoding="utf-8"))

extra = [
    {
        "id": "before-drink",
        "occasion": "Before drinking",
        "arabic": "بِسْمِ اللهِ",
        "transliteration": "Bismillaah",
        "meaning": "In the Name of Allah. Say Bismillah before sipping water or milk.",
        "source": "Hisnul Muslim; sunnah of beginning with Bismillah (Abu Dawud 3767)",
    },
    {
        "id": "after-drink",
        "occasion": "After drinking",
        "arabic": "الْحَمْدُ لِلَّهِ",
        "transliteration": "Alhamdulillaah",
        "meaning": "All praise is for Allah.",
        "source": "Hisnul Muslim practice; praising Allah for blessings",
    },
    {
        "id": "sneeze",
        "occasion": "When you sneeze",
        "arabic": "الْحَمْدُ لِلَّهِ",
        "transliteration": "Alhamdulillaah",
        "meaning": "All praise is for Allah.",
        "source": "Hisnul Muslim; Sahih Bukhari 6224",
    },
    {
        "id": "sneeze-reply",
        "occasion": "When someone sneezes (after they praise Allah)",
        "arabic": "يَرْحَمُكَ اللهُ",
        "transliteration": "Yarhamukallaah",
        "meaning": "May Allah have mercy on you.",
        "source": "Hisnul Muslim; Sahih Bukhari 6224",
    },
    {
        "id": "knowledge",
        "occasion": "Before studying / learning",
        "arabic": "رَبِّ زِدْنِي عِلْمًا",
        "transliteration": "Rabbi zidnee ilma",
        "meaning": "My Lord, increase me in knowledge.",
        "source": "Qur'an 20:114; Hisnul Muslim",
    },
    {
        "id": "mirror",
        "occasion": "When looking in the mirror",
        "arabic": "اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
        "transliteration": "Allaahumma kamaa hassanta khalqee fa hassin khuluqee",
        "meaning": "O Allah, as You have made my appearance beautiful, make my character beautiful.",
        "source": "Hisnul Muslim; Ahmad (hasan according to many scholars)",
    },
    {
        "id": "clothes",
        "occasion": "When wearing clothes",
        "arabic": "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        "transliteration": "Alhamdu lillaahil-ladhee kasaanee haadhaa wa razaqaneehi min ghayri hawlin minnee wa laa quwwah",
        "meaning": "All praise is for Allah Who clothed me with this and provided it for me without any might or power from myself.",
        "source": "Hisnul Muslim; Abu Dawud 4023; Tirmidhi 3458",
    },
    {
        "id": "enter-masjid",
        "occasion": "Entering the mosque",
        "arabic": "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        "transliteration": "Allaahummaf-tah lee abwaaba rahmatik",
        "meaning": "O Allah, open the gates of Your mercy for me.",
        "source": "Hisnul Muslim; Sahih Muslim 713",
    },
    {
        "id": "leave-masjid",
        "occasion": "Leaving the mosque",
        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        "transliteration": "Allaahumma innee as'aluka min fadlik",
        "meaning": "O Allah, I ask You from Your bounty.",
        "source": "Hisnul Muslim; Sahih Muslim 713",
    },
    {
        "id": "rain",
        "occasion": "When it rains",
        "arabic": "اللَّهُمَّ صَيِّبًا نَافِعًا",
        "transliteration": "Allaahumma sayyiban naafi'an",
        "meaning": "O Allah, (make it) a beneficial downpour.",
        "source": "Hisnul Muslim; Sahih Bukhari 1032",
    },
    {
        "id": "angry",
        "occasion": "When angry",
        "arabic": "أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
        "transliteration": "A'oodhu billaahi minash-shaytaanir-rajeem",
        "meaning": "I seek refuge with Allah from the accursed devil.",
        "source": "Hisnul Muslim; Sahih Bukhari 6115; Sahih Muslim 2610",
    },
    {
        "id": "protection",
        "occasion": "Morning & evening protection (short)",
        "arabic": "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        "transliteration": "Bismillaahil-ladhee laa yadurru ma'as-mihi shay'un fil-ardi wa laa fis-samaa'i wa Huwas-Samee'ul-'Aleem",
        "meaning": "In the Name of Allah, with Whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing. (Say 3 times morning and evening.)",
        "source": "Hisnul Muslim; Abu Dawud 5088; Tirmidhi 3388",
    },
    {
        "id": "afraid",
        "occasion": "When scared",
        "arabic": "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        "transliteration": "A'oodhu bikalimaatillaahit-taammaati min sharri maa khalaq",
        "meaning": "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        "source": "Hisnul Muslim; Sahih Muslim 2708",
    },
    {
        "id": "parents",
        "occasion": "Dua for parents",
        "arabic": "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        "transliteration": "Rabbir-hamhumaa kamaa rabbayaanee sagheera",
        "meaning": "My Lord, have mercy upon them as they brought me up when I was small.",
        "source": "Qur'an 17:24",
    },
    {
        "id": "thank-allah",
        "occasion": "When happy for a blessing",
        "arabic": "الْحَمْدُ لِلَّهِ",
        "transliteration": "Alhamdulillaah",
        "meaning": "All praise is for Allah — we thank Allah for every blessing.",
        "source": "Frequent authentic sunnah; Qur'an encourages Alhamdulillah",
    },
    {
        "id": "before-wudu",
        "occasion": "Before wudu (ablution)",
        "arabic": "بِسْمِ اللهِ",
        "transliteration": "Bismillaah",
        "meaning": "In the Name of Allah.",
        "source": "Hisnul Muslim; Abu Dawud 101; Tirmidhi 25",
    },
    {
        "id": "after-wudu",
        "occasion": "After wudu",
        "arabic": "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
        "transliteration": "Ash-hadu an laa ilaaha illallaahu wahdahu laa shareeka lah, wa ash-hadu anna Muhammadan 'abduhu wa rasooluh",
        "meaning": "I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and Messenger.",
        "source": "Hisnul Muslim; Sahih Muslim 234",
    },
    {
        "id": "leaving-gathering",
        "occasion": "Kaffarah after a gathering / sitting",
        "arabic": "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
        "transliteration": "Subhaanaka Allaahumma wa bihamdik, ash-hadu an laa ilaaha illaa Ant, astaghfiruka wa atoobu ilayk",
        "meaning": "Glory is to You, O Allah, and praise. I bear witness that there is no god but You. I seek Your forgiveness and repent to You.",
        "source": "Hisnul Muslim; Abu Dawud 4859; Tirmidhi 3433",
    },
]

ids = {d["id"] for d in data["duas"]}
for d in extra:
    if d["id"] not in ids:
        data["duas"].append(d)

p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print("total duas", len(data["duas"]))
