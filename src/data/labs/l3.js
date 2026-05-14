export const lab3 = {
  lessonId: "l3",
  title: "Lab 3: Conditionals",
  subtitle: "Phishing Risk Labeler",
  estimatedMinutes: 30,
  objectives: [
    "Write if / elif / else chains that label numeric values.",
    "Use comparison operators: >=, >, ==, !=.",
    "Combine conditions with and / or.",
    "Build a multi-factor risk escalation system.",
  ],
  intro: `Every Intrusion Detection System is a collection of conditional rules.
"If login failures > 5: alert." "If source IP is unknown AND time is 2am: escalate."
In this lab you build those rules step by step, starting simple and building to a
realistic multi-factor checker.`,
  exercises: [
    {
      id: "e1",
      title: "Exercise 1 — Basic risk label (3 tiers)",
      prompt: `Given a numeric risk score, print the correct label:
  • score >= 70  →  HIGH RISK
  • score >= 40  →  MEDIUM
  • anything else →  LOW

Test your code with score = 85, then score = 45, then score = 15.`,
      starter: `# Exercise 1: Three-tier risk labeler
score = 85

if ???:
    print("HIGH RISK")
elif ???:
    print("MEDIUM")
else:
    print("LOW")`,
      hints: [
        "The first condition catches the highest tier: score >= 70.",
        "elif only runs if the if above was False — so elif score >= 40 correctly catches 40–69.",
        "else catches everything remaining (0–39).",
        "Change score to 45 and 15 to test all three branches.",
      ],
      solution: `score = 85

if score >= 70:
    print("HIGH RISK")
elif score >= 40:
    print("MEDIUM")
else:
    print("LOW")`,
      expectedOutput: "HIGH RISK",
      afterNote:
        "Order matters in if/elif chains. Always put the highest threshold first, otherwise events 'fall through' to the wrong branch.",
    },
    {
      id: "e2",
      title: "Exercise 2 — Add a CRITICAL tier",
      prompt: `Extend the labeler to four tiers:
  • score >= 90  →  CRITICAL — immediate response
  • score >= 70  →  HIGH RISK
  • score >= 40  →  MEDIUM
  • else          →  LOW

Test with score = 95 and score = 72.`,
      starter: `# Exercise 2: Four-tier labeler
score = 95

if score >= ???:
    print("CRITICAL — immediate response")
elif score >= ???:
    print("HIGH RISK")
elif score >= ???:
    print("MEDIUM")
else:
    print("LOW")`,
      hints: [
        "Add a new if condition before the existing HIGH RISK check.",
        "CRITICAL threshold is 90, HIGH is 70, MEDIUM is 40.",
        "Because CRITICAL (>=90) is more specific, it must come first.",
      ],
      solution: `score = 95

if score >= 90:
    print("CRITICAL — immediate response")
elif score >= 70:
    print("HIGH RISK")
elif score >= 40:
    print("MEDIUM")
else:
    print("LOW")`,
      expectedOutput: "CRITICAL — immediate response",
      afterNote:
        "Real SIEM (Security Information and Event Management) systems use exactly these tiered rules to triage thousands of daily alerts.",
    },
    {
      id: "e3",
      title: "Exercise 3 — Combine conditions with and / or",
      prompt: `Real threats often require multiple conditions. Complete the rules:
  1. If score >= 70 AND new_device is True → print "ESCALATE: high risk from unknown device"
  2. If score >= 70 OR malware_found is True → print "ALERT: action required"
  3. Otherwise → print "Monitoring"`,
      starter: `# Exercise 3: Multi-condition rules
score        = 75
new_device   = True
malware_found = False

if score >= 70 ??? new_device == True:
    print("ESCALATE: high risk from unknown device")
elif score >= 70 ??? malware_found == True:
    print("ALERT: action required")
else:
    print("Monitoring")`,
      hints: [
        "Both conditions must be True at the same time → use and.",
        "Either condition being True is enough → use or.",
        'Rule 1 uses "and". Rule 2 uses "or".',
      ],
      solution: `score        = 75
new_device   = True
malware_found = False

if score >= 70 and new_device == True:
    print("ESCALATE: high risk from unknown device")
elif score >= 70 or malware_found == True:
    print("ALERT: action required")
else:
    print("Monitoring")`,
      expectedOutput: "ESCALATE: high risk from unknown device",
      afterNote:
        'You can simplify "new_device == True" to just "new_device" — Python evaluates bool variables directly. Both work; the shorter form is more Pythonic.',
    },
    {
      id: "e4",
      title: "Exercise 4 — Full automated triage function",
      prompt: `Wrap the logic in a function called triage(score, new_device, malware_found)
that returns (not just prints) the alert level as a string.
Then test it on four different combinations and print a report.`,
      starter: `# Exercise 4: Triage function
def triage(score, new_device, malware_found):
    if score >= 90:
        return "CRITICAL"
    if score >= 70 and ???:
        return "ESCALATE"
    if score >= 70 or ???:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"

# Test cases
tests = [
    (95, False, False),
    (75, True,  False),
    (72, False, True),
    (30, False, False),
]

for score, nd, mf in tests:
    level = triage(score, nd, mf)
    print(f"score={score} nd={nd} mf={mf}  →  {level}")`,
      hints: [
        "First ??? is the new_device parameter — check if it's True.",
        "Second ??? is the malware_found parameter.",
        "Use the parameter names, not the variable names from the test list.",
      ],
      solution: `def triage(score, new_device, malware_found):
    if score >= 90:
        return "CRITICAL"
    if score >= 70 and new_device:
        return "ESCALATE"
    if score >= 70 or malware_found:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"

tests = [
    (95, False, False),
    (75, True,  False),
    (72, False, True),
    (30, False, False),
]

for score, nd, mf in tests:
    level = triage(score, nd, mf)
    print(f"score={score} nd={nd} mf={mf}  →  {level}")`,
      expectedOutput: `score=95 nd=False mf=False  →  CRITICAL
score=75 nd=True mf=False  →  ESCALATE
score=72 nd=False mf=True  →  HIGH
score=30 nd=False mf=False  →  LOW`,
      afterNote:
        "This triage() function is portfolio-quality. It encapsulates a real security decision tree, handles edge cases, and is fully testable.",
    },
  ],
  wrapUp: {
    message:
      "Lab 3 complete! You can now write conditional logic that mirrors real security rule engines — single conditions, tiered chains, and multi-factor escalation.",
    nextLesson: "Next up: Lesson 4 — automating repetition with for loops.",
    keyTakeaways: [
      "if/elif/else — the most specific condition must come first.",
      ">= catches the value AND everything above it.",
      "and — both conditions must be True.",
      "or — either condition being True is enough.",
      "Return a value from functions instead of just printing — it makes the logic reusable.",
    ],
  },
};
