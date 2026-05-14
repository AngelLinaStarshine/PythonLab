export const lab10 = {
  lessonId: "l10",
  title: "Lab 10: Capstone",
  subtitle: "Portfolio Mini SOC Dashboard",
  estimatedMinutes: 45,
  objectives: [
    "Combine all 9 prior skills into a working security tool.",
    "Process live input with error handling.",
    "Generate an analytics report with counts, averages, and ranked events.",
    "Produce portfolio-ready code with clean structure and comments.",
  ],
  intro: `This is your capstone lab. You have learned variables, input, conditionals,
loops, functions, lists, dictionaries, strings, and exceptions. Now you connect them
all into a Mini SOC (Security Operations Center) Dashboard, a tool that ingests
log events, scores them, and produces an analyst report. This is portfolio-ready work.`,
  exercises: [
    {
      id: "e1",
      title: "Exercise 1, The scoring engine (L5 + L8)",
      prompt: `Define score_event(text) that uses string methods to detect keywords
and accumulate a risk score. Then test it on 4 different log lines.

Scoring rules:
  "failed" : +40
  "blocked": +30
  "malware": +60
  "exploit": +50
  Base score: 10. Cap at 100.`,
      starter: `# Exercise 1: Scoring engine
def score_event(text):
    t    = text.__BLANK__()    # normalize
    risk = 10

    if "failed"  in t: risk += __BLANK__
    if "blocked" in t: risk += __BLANK__
    if "malware" in t: risk += __BLANK__
    if "exploit" in t: risk += __BLANK__

    return min(risk, __BLANK__)   # cap at 100

# Test
tests = [
    "normal user activity",
    "FAILED login from 192.168.1.5",
    "malware detected in upload",
    "blocked exploit attempt from unknown IP",
]

for log in tests:
    print(f"score={score_event(log):3}  log={log}")`,
      hints: [
        "text.lower() normalizes the text.",
        "failed adds 40, blocked adds 30, malware adds 60, exploit adds 50.",
        "min(risk, 100) caps the value at 100.",
      ],
      solution: `def score_event(text):
    t    = text.lower()
    risk = 10
    if "failed"  in t: risk += 40
    if "blocked" in t: risk += 30
    if "malware" in t: risk += 60
    if "exploit" in t: risk += 50
    return min(risk, 100)

tests = [
    "normal user activity",
    "FAILED login from 192.168.1.5",
    "malware detected in upload",
    "blocked exploit attempt from unknown IP",
]

for log in tests:
    print(f"score={score_event(log):3}  log={log}")`,
      expectedOutput: `score= 10  log=normal user activity
score= 50  log=FAILED login from 192.168.1.5
score= 70  log=malware detected in upload
score= 90  log=blocked exploit attempt from unknown IP`,
      afterNote:
        "Notice that score_event() handles uppercase input correctly because .lower() normalizes it first. Always normalize before checking.",
    },
    {
      id: "e2",
      title: "Exercise 2, Collect events into a list of dicts (L2 + L4 + L6 + L7)",
      prompt: `Build the input loop. Use a while True loop to collect log lines.
When the user types "done", break out.
For each line, score it, label it, and append a dict to the events list.`,
      starter: `# Exercise 2: Event collection loop
def label_risk(risk):
    if risk >= 70: return "HIGH"
    if risk >= 40: return "MEDIUM"
    return "LOW"

events = []

while True:
    line = input("Enter log (or 'done'): ")
    if line.__BLANK__() == "done":
        break

    risk  = score_event(line)
    label = label_risk(__BLANK__)

    event = {
        "raw"  : line,
        "risk" : __BLANK__,
        "label": __BLANK__,
    }
    events.__BLANK__(event)

print(f"Collected {len(events)} events.")`,
      hints: [
        "line.lower() == 'done', normalize the stop word too.",
        "label_risk(risk) passes the score to the labeling function.",
        "events.append(event) adds the dict to the list.",
      ],
      solution: `def label_risk(risk):
    if risk >= 70: return "HIGH"
    if risk >= 40: return "MEDIUM"
    return "LOW"

events = []

while True:
    line = input("Enter log (or 'done'): ")
    if line.lower() == "done":
        break

    risk  = score_event(line)
    label = label_risk(risk)

    event = {"raw": line, "risk": risk, "label": label}
    events.append(event)

print(f"Collected {len(events)} events.")`,
      expectedOutput: "Collected 4 events.",
      afterNote:
        "Normalizing the stop word (line.lower() == 'done') means the user can type 'Done', 'DONE', or 'done', all work. Small UX detail, big difference in production.",
    },
    {
      id: "e3",
      title: "Exercise 3, Analytics report (L6 + math)",
      prompt: `Write a function generate_report(events) that computes and prints:
  • Total events
  • High / Medium / Low counts
  • Average risk score (1 decimal place)
  • The single highest-risk event`,
      starter: `# Exercise 3: Analytics report function
def generate_report(events):
    if not events:
        print("No events to report.")
        return

    total      = len(events)
    risks      = [e[__BLANK__] for e in events]           # list of all risk scores
    avg_risk   = sum(risks) / __BLANK__                    # average
    high_count = sum(1 for e in events if e["label"] == __BLANK__)
    med_count  = sum(1 for e in events if e["label"] == "MEDIUM")
    low_count  = sum(1 for e in events if e["label"] == "LOW")

    worst = max(events, key=lambda e: e["risk"])     # dict with highest risk

    print("\\n╔══════════════════════════╗")
    print("║   MINI SOC REPORT        ║")
    print("╚══════════════════════════╝")
    print(f"  Total events : {total}")
    print(f"  HIGH / MED / LOW : {high_count} / {med_count} / {low_count}")
    print(f"  Average risk  : {avg_risk:.1f}")
    print(f"  Worst event   : [{worst['label']}] risk={worst['risk']}: {worst['raw']}")

generate_report(events)`,
      hints: [
        'risks = [e["risk"] for e in events] , list comprehension to extract all risk scores.',
        "sum(risks) / len(events) gives the average.",
        '"HIGH" in the high_count sum condition.',
      ],
      solution: `def generate_report(events):
    if not events:
        print("No events to report.")
        return

    total      = len(events)
    risks      = [e["risk"] for e in events]
    avg_risk   = sum(risks) / total
    high_count = sum(1 for e in events if e["label"] == "HIGH")
    med_count  = sum(1 for e in events if e["label"] == "MEDIUM")
    low_count  = sum(1 for e in events if e["label"] == "LOW")
    worst      = max(events, key=lambda e: e["risk"])

    print("\\n╔══════════════════════════╗")
    print("║   MINI SOC REPORT        ║")
    print("╚══════════════════════════╝")
    print(f"  Total events : {total}")
    print(f"  HIGH / MED / LOW : {high_count} / {med_count} / {low_count}")
    print(f"  Average risk  : {avg_risk:.1f}")
    print(f"  Worst event   : [{worst['label']}] risk={worst['risk']}: {worst['raw']}")

generate_report(events)`,
      expectedOutput: `╔══════════════════════════╗
║   MINI SOC REPORT        ║
╚══════════════════════════╝
  Total events : 4
  HIGH / MED / LOW : 2 / 1 / 1
  Average risk  : 55.0
  Worst event   : [HIGH] risk=90: blocked exploit attempt from unknown IP`,
      afterNote:
        "max(events, key=lambda e: e['risk']) finds the dictionary with the highest risk field. The key= parameter tells max() what to compare, you'll see this pattern constantly in data work.",
    },
    {
      id: "e4",
      title: "Exercise 4, Add exception handling and a ranked event log (L9 + full assembly)",
      prompt: `Add two final touches:
  1. Wrap the input collection in a try/except so an empty line is handled gracefully.
  2. Print a full ranked event log at the end, sorted by risk, highest first.

This is your complete, portfolio-ready SOC Dashboard.`,
      starter: `# Exercise 4: Final assembly, exception handling + ranked log

# (score_event, label_risk, generate_report are already defined above)

events = []
print("Mini SOC Dashboard, enter log lines. Type 'done' to finish.\\n")

while True:
    try:
        line = input("Log> ").strip()
    except (EOFError, KeyboardInterrupt):
        break

    if line.lower() == "done" or line == "":
        if line.lower() == "done":
            break
        continue     # skip empty lines

    risk  = score_event(line)
    label = label_risk(risk)
    events.append({"raw": line, "risk": risk, "label": label})
    print(f" : [{label}] risk={risk}")

# Generate summary report
generate_report(events)

# Ranked event log
if events:
    print("\\n── Ranked Event Log ────────────────────────────")
    ranked = sorted(events, key=lambda e: e[__BLANK__], reverse=__BLANK__)
    for i, e in enumerate(ranked, start=1):
        bar = "█" * (e["risk"] // 10)
        print(f"  {i}. [{e['label']:6}] {e['risk']:3} {bar}  {e['raw'][:50]}")
    print("─────────────────────────────────────────────────")`,
      hints: [
        'sorted(events, key=lambda e: e["risk"], reverse=True) sorts highest first.',
        'e["risk"] // 10 gives a bar length from 0 to 10 blocks.',
        "e['raw'][:50] truncates long log lines to 50 characters.",
      ],
      solution: `events = []
print("Mini SOC Dashboard, enter log lines. Type 'done' to finish.\\n")

while True:
    try:
        line = input("Log> ").strip()
    except (EOFError, KeyboardInterrupt):
        break

    if line.lower() == "done" or line == "":
        if line.lower() == "done":
            break
        continue

    risk  = score_event(line)
    label = label_risk(risk)
    events.append({"raw": line, "risk": risk, "label": label})
    print(f" : [{label}] risk={risk}")

generate_report(events)

if events:
    print("\\n── Ranked Event Log ────────────────────────────")
    ranked = sorted(events, key=lambda e: e["risk"], reverse=True)
    for i, e in enumerate(ranked, start=1):
        bar = "█" * (e["risk"] // 10)
        print(f"  {i}. [{e['label']:6}] {e['risk']:3} {bar}  {e['raw'][:50]}")
    print("─────────────────────────────────────────────────")`,
      expectedOutput: `Mini SOC Dashboard, enter log lines. Type 'done' to finish.

Log> blocked exploit attempt from unknown IP
 : [HIGH] risk=90
Log> FAILED login from 192.168.1.5
 : [MEDIUM] risk=50
Log> malware detected in upload folder
 : [HIGH] risk=70
Log> normal user activity from 10.0.0.2
 : [LOW] risk=10
Log> done

╔══════════════════════════╗
║   MINI SOC REPORT        ║
╚══════════════════════════╝
  Total events : 4
  HIGH / MED / LOW : 2 / 1 / 1
  Average risk  : 55.0
  Worst event   : [HIGH] risk=90: blocked exploit attempt from unknown IP

── Ranked Event Log ────────────────────────────
  1. [HIGH  ]  90 █████████  blocked exploit attempt from unknown IP
  2. [HIGH  ]  70 ███████  malware detected in upload folder
  3. [MEDIUM]  50 █████  FAILED login from 192.168.1.5
  4. [LOW   ]  10 █  normal user activity from 10.0.0.2
─────────────────────────────────────────────────`,
      afterNote:
        "You just built a real security tool. It ingests events, scores threats, handles errors, generates analytics, and renders a ranked report. Every line of code you wrote in Labs 1 to 9 contributed to this. That's integration.",
    },
  ],
  wrapUp: {
    message:
      "🎖️ Congratulations, you have completed the Cyber Python course! You built a working SOC Dashboard from scratch using every concept in the Ontario Grade 10-11 Python curriculum. This project is ready to go in your portfolio.",
    nextLesson: "Share your project. Add it to your GitHub. Show it in interviews. You earned it.",
    keyTakeaways: [
      "Functions (score_event, label_risk) encapsulate reusable logic.",
      "while True + break = flexible event collection loop.",
      "List of dicts = the universal Python data record format.",
      "sorted(list, key=lambda, reverse=True) = ranked output.",
      "try/except keeps production tools alive on bad input.",
    ],
  },
};
