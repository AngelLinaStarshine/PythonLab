export const tryMeL3 = {
  lessonId: "l3",
  ttsIntro:
    "Welcome to Lesson 3: Conditionals. Every security rule is a conditional. If the risk is high, alert. If login failures exceed five, lock the account. In this lesson you will write if, elif, and else chains and combine conditions with and and or.",
  sections: [
    {
      id: "s1",
      icon: "🛡️",
      heading: "Security Rules Are Conditionals",
      body: "An Intrusion Detection System is a large collection of conditional rules. If login failed more than five times, flag as suspicious. If a file is large and from an unknown source, quarantine it. Python's if, elif, and else keywords are exactly how these rules are written in real tools.",
      code: null,
      tryMe: null,
      tip: null,
    },
    {
      id: "s2",
      icon: "🔀",
      heading: "if / elif / else Structure",
      body: "Python uses indentation, four spaces, to define which code belongs inside each branch. A colon ends every condition line. Python evaluates from top to bottom and runs the first branch whose condition is True. Once a branch runs, all remaining branches are skipped.",
      code: `risk = 72

if risk >= 70:
    print("HIGH RISK")
elif risk >= 40:
    print("MEDIUM")
else:
    print("LOW")`,
      tryMe: {
        starter: `risk = 85    # try 85, then 50, then 15

if risk >= 70:
    print("HIGH RISK")
elif risk >= 40:
    print("MEDIUM")
else:
    print("LOW")`,
        expectedOutput: "HIGH RISK",
        hint: "Change risk to 50 to hit MEDIUM, or 15 to hit LOW. Test all three branches.",
      },
      tip: "Order matters. Always put the highest threshold first. If you put elif risk >= 10 before elif risk >= 40, everything hits the first branch.",
    },
    {
      id: "s3",
      icon: "⚖️",
      heading: "Comparison Operators",
      body: "Conditions use comparison operators. Greater than or equal checks if a value is at or above a threshold. Double equals checks exact equality, a single equals sign is assignment, not comparison. Not equal is written as exclamation mark equals.",
      code: `risk = 72
print(risk >= 70)       # True
print(risk > 70)        # False, strictly greater
print(risk == 72)       # True, exactly equal
print(risk != 50)       # True, not equal
print(risk <= 100)      # True`,
      tryMe: {
        starter: `x = 50
print(x >= 70)
print(x >= 40)
print(x == 50)
print(x != 50)
print(x < 100)`,
        expectedOutput: "False\nTrue\nTrue\nFalse\nTrue",
        hint: "Every comparison returns True or False. These boolean values power all conditional logic.",
      },
      tip: null,
    },
    {
      id: "s4",
      icon: "🔗",
      heading: "Combining with and / or",
      body: "Real security rules check multiple conditions at once. The and keyword requires both conditions to be True. The or keyword requires at least one. You can chain multiple conditions and Python evaluates them left to right.",
      code: `risk       = 75
new_device = True
malware    = False

if risk >= 70 and new_device:
    print("ESCALATE: high risk from unknown device")

if risk >= 70 or malware:
    print("ALERT: action required")`,
      tryMe: {
        starter: `risk       = 75
new_device = True
malware    = False

if risk >= 70 and new_device:
    print("Line 1: ESCALATE")

if risk >= 70 and malware:
    print("Line 2: MALWARE + HIGH")

if risk >= 70 or malware:
    print("Line 3: ALERT")`,
        expectedOutput: "Line 1: ESCALATE\nLine 3: ALERT",
        hint: "Line 2 uses 'and', both must be True. malware is False so it does not print. Line 3 uses 'or', only one needs to be True.",
      },
      tip: null,
    },
  ],
};
