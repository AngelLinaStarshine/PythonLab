export const tryMeL10 = {
  lessonId: "l10",
  ttsIntro:
    "Welcome to Lesson 10: the Capstone. You will combine everything from Lessons 1 through 9 into a working Security Operations Center dashboard — a portfolio-ready project.",
  sections: [
    {
      id: "s1",
      icon: "🛡️",
      heading: "You Have Built Every Piece — Now Connect Them",
      body: "A real SOC tool ingests log events, scores each one using keyword rules, stores them in structured records, and generates a summary report. You already know every technique required. This lesson is about connecting them intentionally into one complete, working system.",
      code: null,
      tryMe: null,
      tip: null,
    },
    {
      id: "s2",
      icon: "🗺️",
      heading: "Architecture — Each Lesson's Role",
      body: "Lesson 1 variables store your counters and labels. Lesson 2 input collects live log lines. Lesson 3 conditionals power risk labeling. Lesson 4 while loop collects events until done. Lesson 5 functions encapsulate scoring and labeling. Lesson 6 list accumulates all records. Lesson 7 dictionaries structure each event. Lesson 8 strings normalize and detect keywords. Lesson 9 exceptions handle bad input.",
      code: `# Lesson contributions:
# L1 → variables: risk, label, count
# L2 → input(): collect log lines
# L3 → if/elif: label_risk()
# L4 → while True + break
# L5 → def score_event(), label_risk()
# L6 → events = [] accumulates records
# L7 → {"raw","risk","label"} per event
# L8 → .lower(), "in": keyword scoring
# L9 → try/except: handle bad input`,
      tryMe: null,
      tip: null,
    },
    {
      id: "s3",
      icon: "⚙️",
      heading: "The Scoring Engine",
      body: "score event normalizes the log line, then checks for four threat keywords. Each keyword found adds to the risk score, capped at one hundred. This is a simplified version of the keyword matching rules in commercial SIEM products.",
      code: `def score_event(text):
    t    = text.lower()
    risk = 10
    if "failed"  in t: risk += 40
    if "blocked" in t: risk += 30
    if "malware" in t: risk += 60
    if "exploit" in t: risk += 50
    return min(risk, 100)

print(score_event("FAILED login"))            # 50
print(score_event("malware detected"))        # 70
print(score_event("blocked exploit attempt")) # 90`,
      tryMe: {
        starter: `def score_event(text):
    t    = text.lower()
    risk = 10
    if "failed"  in t: risk += 40
    if "blocked" in t: risk += 30
    if "malware" in t: risk += 60
    if "exploit" in t: risk += 50
    return min(risk, 100)

logs = [
    "FAILED login from 10.0.0.5",
    "blocked exploit attempt detected",
    "malware found in upload",
    "normal user logout",
]

for log in logs:
    score = score_event(log)
    label = "HIGH" if score >= 70 else "MEDIUM" if score >= 40 else "LOW"
    print(f"[{label:6}] {score:3}  {log}")`,
        expectedOutput:
          "[MEDIUM]  50  FAILED login from 10.0.0.5\n[HIGH  ]  90  blocked exploit attempt detected\n[HIGH  ]  70  malware found in upload\n[LOW   ]  10  normal user logout",
        hint: "The second log triggers blocked (+30) and exploit (+50) for 90 total. Multiple keywords stack.",
      },
      tip: null,
    },
    {
      id: "s4",
      icon: "📊",
      heading: "Analytics Report and Ranked Output",
      body: "After collecting events, loop through the list to sum risk scores, count tiers, and compute the average. The sorted function with a lambda key and reverse True produces a ranked list from highest to lowest risk — the view an analyst sees on their dashboard.",
      code: `events = [...]   # list of dicts collected in the while loop

risks = [e["risk"] for e in events]
avg   = sum(risks) / len(risks)
highs = sum(1 for e in events if e["label"] == "HIGH")

ranked = sorted(events, key=lambda e: e["risk"], reverse=True)
for i, e in enumerate(ranked, 1):
    bar = "█" * (e["risk"] // 10)
    print(f"  {i}. [{e['label']:6}] {e['risk']:3} {bar}")`,
      tryMe: {
        starter: `events = [
    {"raw":"FAILED login","risk":50,"label":"MEDIUM"},
    {"raw":"malware found","risk":70,"label":"HIGH"},
    {"raw":"normal activity","risk":10,"label":"LOW"},
    {"raw":"blocked exploit","risk":90,"label":"HIGH"},
]

risks = [e["risk"] for e in events]
avg   = sum(risks) / len(risks)
highs = sum(1 for e in events if e["label"] == "HIGH")

print(f"Total : {len(events)}")
print(f"Avg   : {avg:.1f}")
print(f"HIGH  : {highs}")

ranked = sorted(events, key=lambda e: e["risk"], reverse=True)
for i, e in enumerate(ranked, 1):
    bar = "█" * (e["risk"] // 10)
    print(f"  {i}. {e['risk']:3} {bar}  {e['raw']}")`,
        expectedOutput:
          "Total : 4\nAvg   : 55.0\nHIGH  : 2\n  1.  90 █████████  blocked exploit\n  2.  70 ███████  malware found\n  3.  50 █████  FAILED login\n  4.  10 █  normal activity",
        hint: "sorted with reverse=True ranks highest first. The bar is one block per 10 risk points.",
      },
      tip: "lambda e: e['risk'] is an anonymous function that tells sorted what to compare. You will see this pattern constantly in data work.",
    },
  ],
};
