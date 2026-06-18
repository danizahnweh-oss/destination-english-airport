/* ============================================================
   Destination English · content data
   Edit the texts here to adapt the project day.
   ============================================================ */
window.DATA = {

  /* ---- Landing page ---- */
  intro:
    "The class explores Munich Airport in small groups, collects real English from the " +
    "signs and screens around them, and then interviews real travellers. English isn't " +
    "practised in the classroom; it's used where it's really needed.",

  goals: [
    "Use travel, airport and orientation vocabulary actively.",
    "Dare to speak English to strangers (lower the fear of speaking).",
    "Train listening & reading with real material: signs, announcements, displays.",
    "Work together as a team and present your results in English."
  ],

  schedule: [
    { t: "00:00", what: "Welcome, rules, group set-up, hand out tasks, short warm-up (English only from now).", who: "Whole class" },
    { t: "00:15", what: "Phase 1: Airport Scavenger Hunt. Find words & signs, take photos, collect vocabulary.", who: "Groups of 4" },
    { t: "00:55", what: "Meet at the meeting point, short break.", who: "Whole class" },
    { t: "01:00", what: "Phase 2: Short interviews with travellers in the terminal.", who: "Groups of 4" },
    { t: "01:45", what: "Wrap-up: groups present their finds, feedback, reflection.", who: "Whole class" }
  ],

  rules: [
    "Be polite: start with “Excuse me, do you have a minute?” and accept a “no”.",
    "Never photograph a person who doesn't want it. Photos only of signs and places.",
    "Stay together, keep to the meeting point and the time.",
    "Don't enter restricted areas and don't stand in anyone's way."
  ],

  /* ---- Scavenger hunt missions ----
     Each field: {key, label, placeholder, big?:true for textarea} */
  missions: [
    { n: 1, points: 10, title: "The airport's real name",
      task: "Find the official name of Munich Airport on a sign or screen. Who was it named after? Write one full sentence about that person in English.",
      proof: "Proof: the name + 1 sentence.",
      fields: [
        { key: "m1_name", label: "Official name", placeholder: "Munich Airport “…”" },
        { key: "m1_sentence", label: "One sentence about the person", placeholder: "Franz Josef Strauß was …", big: true }
      ]},
    { n: 2, points: 10, title: "Airport codes",
      task: "Stand in front of a departures board. Munich's code is MUC. Find three other three-letter airport codes and match each one to the correct city and country.",
      proof: "Proof: 3 codes + cities + countries.",
      fields: [
        { key: "m2_a", label: "Code 1 → city, country", placeholder: "LHR → London, UK" },
        { key: "m2_b", label: "Code 2 → city, country", placeholder: "JFK → New York, USA" },
        { key: "m2_c", label: "Code 3 → city, country", placeholder: "CDG → Paris, France" }
      ]},
    { n: 3, points: 10, title: "Flight to an English-speaking country",
      task: "Find a flight from Munich to an English-speaking country (UK, USA, Ireland, Canada, Australia, New Zealand). Note the city, flight number, airline and departure time. How many hours from now does it leave?",
      proof: "Proof: details + your calculation.",
      fields: [
        { key: "m3_flight", label: "City · flight no. · airline · time", placeholder: "Dublin · EI 352 · Aer Lingus · 14:20" },
        { key: "m3_hours", label: "Hours from now (show calculation)", placeholder: "14:20 − 11:00 = 3 h 20 min" }
      ]},
    { n: 4, points: 10, title: "Price detective",
      task: "Compare prices at two different shops: ask in English for a 0.5 l bottle of water (“How much is this water, please?”). Which shop is cheaper, and by how much?",
      proof: "Proof: 2 prices + the difference.",
      fields: [
        { key: "m4_p1", label: "Shop 1 (name & price)", placeholder: "Relay, €3.20" },
        { key: "m4_p2", label: "Shop 2 (name & price)", placeholder: "Spar, €2.50" },
        { key: "m4_diff", label: "Cheaper shop & difference", placeholder: "Spar is cheaper by €0.70." }
      ]},
    { n: 5, points: 10, title: "Five orders (imperatives)",
      task: "Find five signs with an imperative instruction (e.g. KEEP LEFT, DO NOT ENTER, MIND THE STEP). Write the full instruction each time, not just one word.",
      proof: "Proof: 5 full instructions.",
      fields: [
        { key: "m5_1", label: "Sign 1", placeholder: "KEEP LEFT" },
        { key: "m5_2", label: "Sign 2", placeholder: "DO NOT ENTER" },
        { key: "m5_3", label: "Sign 3", placeholder: "MIND THE STEP" },
        { key: "m5_4", label: "Sign 4", placeholder: "PLEASE QUEUE HERE" },
        { key: "m5_5", label: "Sign 5", placeholder: "FASTEN YOUR SEATBELT" }
      ]},
    { n: 6, points: 10, title: "Ask for directions",
      task: "Ask a member of staff in English how to get from Terminal 1 to Terminal 2 (or to the SkyLine train). Write down their directions in two or three full sentences.",
      proof: "Proof: the directions in your own words.",
      fields: [
        { key: "m6_dir", label: "The directions", placeholder: "Go straight ahead, then take the SkyLine …", big: true }
      ]},
    { n: 7, points: 10, title: "MAC & the Airbräu",
      task: "Go to the Munich Airport Center (MAC) or find the Airbräu, the airport's own brewery. Find an advert or poster in English nearby, say what it is selling and write one sentence why a traveller might buy it.",
      proof: "Proof: 1 sentence.",
      fields: [
        { key: "m7_sentence", label: "What it sells + why buy it", placeholder: "The poster sells … because …", big: true }
      ]},
    { n: 8, points: 10, title: "Bonus: two languages",
      task: "Find a sign or announcement written in both English and German. Write the English version and explain one difference between the two languages.",
      proof: "Proof: EN text + one difference.",
      fields: [
        { key: "m8_en", label: "The English version", placeholder: "“Please keep your luggage with you at all times.”" },
        { key: "m8_diff", label: "One difference between EN and DE", placeholder: "English uses … while German …", big: true }
      ]}
  ],

  /* ---- Interviews ---- */
  interviewHelp: {
    starters: [
      "“Excuse me, do you have a minute for a school project?” If they say no, smile: “No problem, thank you!”",
      "Ask only friendly questions about country, culture and food. No questions about age, money, religion or politics.",
      "At the end, give the person 2-3 tips for Munich and wish them a good trip."
    ],
    questions: [
      "Where are you flying to today?",
      "Why are you travelling: holiday, work or family?",
      "What is a typical / national food in your country?",
      "What language do you speak at home?",
      "What is the weather like there right now?",
      "What is a festival or tradition people celebrate?",
      "What is one thing you are proud of about your home?",
      "Have you been to Munich before? What do you want to see?"
    ]
  },
  interviewCount: 6,
  // field templates per interview (n is filled in by app.js)
  interviewFields: [
    { suffix: "name",   label: "First name",                          placeholder: "Maria" },
    { suffix: "from",   label: "From (country / region)",             placeholder: "Spain" },
    { suffix: "flight", label: "Flight number",                       placeholder: "IB 3171" },
    { suffix: "food",   label: "A typical food from your country is …", placeholder: "paella", full: true },
    { suffix: "place",  label: "A place I should visit there is …",   placeholder: "Granada, the Alhambra", full: true },
    { suffix: "tip",    label: "Our Munich tip for them was …",       placeholder: "the English Garden", full: true }
  ],

  /* ---- World map: flag emojis for common countries (lowercase keys) ---- */
  flags: {
    "germany":"🇩🇪","uk":"🇬🇧","united kingdom":"🇬🇧","england":"🇬🇧","scotland":"🇬🇧",
    "usa":"🇺🇸","united states":"🇺🇸","america":"🇺🇸","ireland":"🇮🇪","canada":"🇨🇦",
    "australia":"🇦🇺","new zealand":"🇳🇿","france":"🇫🇷","spain":"🇪🇸","italy":"🇮🇹",
    "portugal":"🇵🇹","netherlands":"🇳🇱","belgium":"🇧🇪","austria":"🇦🇹","switzerland":"🇨🇭",
    "poland":"🇵🇱","greece":"🇬🇷","turkey":"🇹🇷","sweden":"🇸🇪","norway":"🇳🇴",
    "denmark":"🇩🇰","finland":"🇫🇮","iceland":"🇮🇸","czech republic":"🇨🇿","czechia":"🇨🇿",
    "hungary":"🇭🇺","romania":"🇷🇴","croatia":"🇭🇷","russia":"🇷🇺","ukraine":"🇺🇦",
    "china":"🇨🇳","japan":"🇯🇵","south korea":"🇰🇷","korea":"🇰🇷","india":"🇮🇳",
    "thailand":"🇹🇭","vietnam":"🇻🇳","indonesia":"🇮🇩","singapore":"🇸🇬","philippines":"🇵🇭",
    "brazil":"🇧🇷","argentina":"🇦🇷","mexico":"🇲🇽","chile":"🇨🇱","colombia":"🇨🇴",
    "egypt":"🇪🇬","morocco":"🇲🇦","south africa":"🇿🇦","nigeria":"🇳🇬","kenya":"🇰🇪",
    "uae":"🇦🇪","united arab emirates":"🇦🇪","dubai":"🇦🇪","qatar":"🇶🇦","israel":"🇮🇱"
  }
};
