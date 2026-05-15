// src/data/quizData.js
// ─────────────────────────────────────────────────────────────────
// Quiz questions for all 10 lessons.
// Every question shows a real code snippet and asks the student
// to reason about structure, output, errors, or fix a bug.
// Three questions per lesson, each harder than the last.
//
// Format per question:
//   q        — question text (may include a code block in backticks)
//   code     — optional Python snippet shown in a code panel
//   opts     — 4 answer options (A–D)
//   correct  — index of correct option (0-based)
//   explain  — explanation shown after answering
//   tag      — short topic label shown as a badge
// ─────────────────────────────────────────────────────────────────

export const quizData = {

  // ══════════════════════════════════════════════════════════════
  // LESSON 1 — Variables & Types
  // ══════════════════════════════════════════════════════════════
  l1: [
    {
      tag: "Type detection",
      q: "What does this code print?",
      code:
`port = "443"
print(type(port))`,
      opts: [
        "<class 'int'>",
        "<class 'str'>",
        "<class 'float'>",
        "TypeError",
      ],
      correct: 1,
      explain: `port is assigned "443" — text inside quotes. Python stores it as str, not int. To get an integer, you would write port = 443 with no quotes, or port = int("443").`,
    },
    {
      tag: "Bug fix",
      q: "This code crashes with a TypeError on line 3. What is the fix?",
      code:
`grade = "10"
bonus = 5
result = grade + bonus
print(result)`,
      opts: [
        `Change grade = "10" to grade = 10`,
        `Change bonus = 5 to bonus = "5"`,
        `Change result = grade + bonus to result = grade`,
        "Remove the print statement",
      ],
      correct: 0,
      explain: `grade is stored as the string "10". You cannot add a string to an integer — Python raises TypeError. Fix: grade = 10 (no quotes) so both operands are integers.`,
    },
    {
      tag: "Output prediction",
      q: "What is printed by this f-string?",
      code:
`user   = "Ava"
score  = 87
flag   = True
print(f"{user} | score={score} | admin={flag}")`,
      opts: [
        "Ava | score=87 | admin=True",
        "{user} | score={score} | admin={flag}",
        "Ava | score='87' | admin='True'",
        "SyntaxError — missing quotes",
      ],
      correct: 0,
      explain: `f-strings embed variable values inside curly braces. user is "Ava", score is 87 (int, no quotes), flag is True (bool). The f-string renders them all inline exactly as they are.`,
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // LESSON 2 — Input & Output
  // ══════════════════════════════════════════════════════════════
  l2: [
    {
      tag: "Type from input",
      q: "The user types 72 and presses Enter. What is the type of risk?",
      code:
`risk = input("Risk score: ")
print(type(risk))`,
      opts: [
        "<class 'int'>",
        "<class 'float'>",
        "<class 'str'>",
        "<class 'bool'>",
      ],
      correct: 2,
      explain: `input() ALWAYS returns a string — even when the user types a number. To get an integer you must convert: risk = int(input("Risk score: "))`,
    },
    {
      tag: "Crash diagnosis",
      q: "The user types 50. Which line crashes and why?",
      code:
`score  = input("Score: ")
result = score + 10
print(result)`,
      opts: [
        "Line 1 — input() is not a valid function",
        "Line 2 — cannot add str and int",
        "Line 3 — print needs quotes around result",
        "No crash — it prints 60",
      ],
      correct: 1,
      explain: `score is a str (input always returns str). Line 2 tries to add str + int which raises TypeError: can only concatenate str (not "int") to str. Fix line 1: score = int(input("Score: "))`,
    },
    {
      tag: "Format specifier",
      q: "What does this print?",
      code:
`conf = 0.8333
print(f"Confidence: {conf * 100:.2f}%")`,
      opts: [
        "Confidence: 0.8333%",
        "Confidence: 83%",
        "Confidence: 83.33%",
        "Confidence: 83.330000%",
      ],
      correct: 2,
      explain: `conf * 100 = 83.33. The format specifier :.2f means "float with 2 decimal places". So 83.3333... rounds and displays as 83.33.`,
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // LESSON 3 — Conditionals
  // ══════════════════════════════════════════════════════════════
  l3: [
    {
      tag: "Branch order",
      q: "What does this print when risk = 80?",
      code:
`risk = 80
if risk >= 40:
    print("MEDIUM")
elif risk >= 70:
    print("HIGH")
else:
    print("LOW")`,
      opts: [
        "HIGH",
        "MEDIUM",
        "LOW",
        "Both MEDIUM and HIGH",
      ],
      correct: 1,
      explain: `risk=80 passes the first condition risk >= 40, so Python prints "MEDIUM" and skips all remaining elif/else branches. Even though risk >= 70 is also true, it is never checked. Always put the most specific (highest) threshold first.`,
    },
    {
      tag: "and / or logic",
      q: "What prints?",
      code:
`risk      = 65
malware   = False
new_device = True

if risk >= 70 and new_device:
    print("A")
elif risk >= 40 or malware:
    print("B")
else:
    print("C")`,
      opts: [
        "A",
        "B",
        "C",
        "A and B",
      ],
      correct: 1,
      explain: `First condition: risk >= 70 is False (65 < 70), so the 'and' fails regardless of new_device. Second condition: risk >= 40 is True (65 >= 40), so the 'or' is True — prints B. The 'else' is never reached.`,
    },
    {
      tag: "Bug fix",
      q: "This code always prints LOW no matter the value of risk. Why?",
      code:
`risk = 85
if risk >= 40:
    print("MEDIUM")
if risk >= 70:
    print("HIGH")
if risk < 40:
    print("LOW")`,
      opts: [
        "Should use elif not a second if — HIGH and MEDIUM both print for risk=85",
        "The >= operator is wrong — should use >",
        "risk = 85 should be risk = '85'",
        "print needs f-string formatting",
      ],
      correct: 0,
      explain: `Three separate if statements each run independently. For risk=85: first if (>=40) prints MEDIUM, second if (>=70) prints HIGH — both print. Use if/elif/else so only one branch fires.`,
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // LESSON 4 — Loops
  // ══════════════════════════════════════════════════════════════
  l4: [
    {
      tag: "range() output",
      q: "How many lines does this print?",
      code:
`for i in range(2, 9, 2):
    print(i)`,
      opts: ["3", "4", "7", "9"],
      correct: 1,
      explain: `range(2, 9, 2) generates: 2, 4, 6, 8 — four values. The step is 2, start is 2, stop is 9 (excluded). So the loop runs 4 times printing 2, 4, 6, 8.`,
    },
    {
      tag: "Counter bug",
      q: "What does this print?",
      code:
`total = 0
for n in range(1, 6):
    total = 0
    total += n
print("Total:", total)`,
      opts: [
        "Total: 15",
        "Total: 5",
        "Total: 0",
        "Total: 1",
      ],
      correct: 1,
      explain: `total = 0 is inside the loop, so it resets every iteration. By the end, total is reset to 0 then += 5 on the last iteration, giving 5. Fix: move total = 0 BEFORE the for loop.`,
    },
    {
      tag: "Output prediction",
      q: "What is the final value of count?",
      code:
`count = 0
for i in range(1, 11):
    if i % 2 == 0 and i % 3 == 0:
        count += 1
print(count)`,
      opts: ["1", "2", "3", "5"],
      correct: 0,
      explain: `Numbers from 1-10 divisible by BOTH 2 and 3 must be divisible by 6. Only 6 qualifies (6 % 2 == 0 and 6 % 3 == 0). So count is 1. The 'and' requires both conditions — divisible by 2 OR 3 would give 7 numbers.`,
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // LESSON 5 — Functions
  // ══════════════════════════════════════════════════════════════
  l5: [
    {
      tag: "return vs print",
      q: "What does result contain after this runs?",
      code:
`def label(risk):
    if risk >= 70:
        print("HIGH")
    else:
        print("LOW")

result = label(85)
print(result)`,
      opts: [
        '"HIGH"',
        "None",
        "85",
        "TypeError",
      ],
      correct: 1,
      explain: `label() uses print() but has no return statement. A function without return gives back None. So result = label(85) stores None, and the final print outputs None. Fix: use return "HIGH" instead of print.`,
    },
    {
      tag: "Composition",
      q: "What is the output?",
      code:
`def score(fails):
    return fails * 20

def label(risk):
    return "HIGH" if risk >= 70 else "LOW"

print(label(score(4)))`,
      opts: [
        "LOW",
        "HIGH",
        "80",
        "4",
      ],
      correct: 1,
      explain: `score(4) returns 4 * 20 = 80. label(80) checks 80 >= 70 → True, returns "HIGH". print("HIGH") outputs HIGH. Python evaluates inside-out: score runs first, its return value passes into label.`,
    },
    {
      tag: "Scope bug",
      q: "What happens when this code runs?",
      code:
`def add_bonus(score):
    bonus = 10
    return score + bonus

result = add_bonus(50)
print(bonus)`,
      opts: [
        "Prints 10",
        "Prints 60",
        "NameError: bonus is not defined",
        "Prints None",
      ],
      correct: 2,
      explain: `bonus is a local variable — it only exists inside the add_bonus function. After the function returns, bonus is gone. print(bonus) outside the function raises NameError. To use it outside, return it or define it globally.`,
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // LESSON 6 — Lists
  // ══════════════════════════════════════════════════════════════
  l6: [
    {
      tag: "Index & slice",
      q: "What does this print?",
      code:
`scores = [10, 45, 88, 73, 60, 95]
print(scores[-2])
print(scores[1:4])`,
      opts: [
        "60 and [45, 88, 73]",
        "95 and [45, 88, 73, 60]",
        "60 and [10, 45, 88]",
        "95 and [73, 60, 95]",
      ],
      correct: 0,
      explain: `scores[-2] is the second-to-last item: 60. scores[1:4] is a slice from index 1 up to (not including) 4: [45, 88, 73]. Remember: stop index is excluded.`,
    },
    {
      tag: "Mutation bug",
      q: "After this code runs, what is in scores?",
      code:
`scores = [15, 42, 88]
copy   = scores
copy.append(99)
print(scores)`,
      opts: [
        "[15, 42, 88]",
        "[15, 42, 88, 99]",
        "[99]",
        "TypeError",
      ],
      correct: 1,
      explain: `copy = scores does NOT create a new list. Both copy and scores point to the same list in memory. copy.append(99) modifies the one list they both reference. To make a real copy: copy = scores[:] or copy = list(scores).`,
    },
    {
      tag: "Analytics logic",
      q: "What does this print?",
      code:
`events = [20, 85, 45, 90, 30]
high   = [e for e in events if e >= 70]
print(len(high), sum(high) / len(high)))`,
      opts: [
        "2 87.5",
        "3 58.0",
        "2 175",
        "5 54.0",
      ],
      correct: 0,
      explain: `The list comprehension filters events >= 70: [85, 90]. len([85,90]) = 2. sum([85,90]) = 175. 175 / 2 = 87.5. So it prints: 2 87.5`,
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // LESSON 7 — Dictionaries
  // ══════════════════════════════════════════════════════════════
  l7: [
    {
      tag: "KeyError",
      q: "What happens on line 2?",
      code:
`device = {"owner": "Ava", "risk": 42}
print(device["ip"])`,
      opts: [
        'Prints "None"',
        'Prints ""',
        "KeyError: 'ip'",
        "Prints 0",
      ],
      correct: 2,
      explain: `"ip" is not a key in device. Accessing a missing key with square brackets raises KeyError. Fix: use device.get("ip") which returns None, or device.get("ip", "unknown") for a default.`,
    },
    {
      tag: "Output prediction",
      q: "What is printed?",
      code:
`d = {"a": 1, "b": 2, "c": 3}
d["b"] = 99
d["d"] = 4
del d["a"]
print(list(d.keys()))`,
      opts: [
        "['a', 'b', 'c']",
        "['b', 'c', 'd']",
        "['a', 'b', 'c', 'd']",
        "['b', 'c']",
      ],
      correct: 1,
      explain: `d["b"] = 99 updates b. d["d"] = 4 adds d. del d["a"] removes a. Remaining keys in insertion order: 'b', 'c', 'd'. list(d.keys()) returns ['b', 'c', 'd'].`,
    },
    {
      tag: "Nested data",
      q: "How do you access the value 443?",
      code:
`service = {
    "name": "HTTPS",
    "ports": [80, 443, 8080],
    "active": True
}`,
      opts: [
        'service["ports"][1]',
        'service["ports"](1)',
        'service[443]',
        'service["ports"]["443"]',
      ],
      correct: 0,
      explain: `service["ports"] gives the list [80, 443, 8080]. Then [1] accesses index 1 (the second item). So service["ports"][1] gives 443. You chain square brackets: first get the list, then index into it.`,
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // LESSON 8 — Strings
  // ══════════════════════════════════════════════════════════════
  l8: [
    {
      tag: "Immutability",
      q: "What is the value of log after this runs?",
      code:
`log   = "FAILED Login From IP 10.0.0.5"
clean = log.lower()
log.replace("FAILED", "BLOCKED")`,
      opts: [
        '"blocked login from ip 10.0.0.5"',
        '"BLOCKED Login From IP 10.0.0.5"',
        '"FAILED Login From IP 10.0.0.5"',
        "None",
      ],
      correct: 2,
      explain: `Strings are immutable. lower() and replace() return NEW strings — they never change the original. The result of log.replace(...) is discarded because it isn't assigned to anything. log stays exactly as it was.`,
    },
    {
      tag: "Detection logic",
      q: "What does this print for the given log line?",
      code:
`log      = "User FAILED to login successfully"
clean    = log.lower()
words    = clean.split()
keywords = ["failed", "blocked", "malware"]
found    = [k for k in keywords if k in words]
print(found)`,
      opts: [
        "['failed']",
        "['failed', 'successfully']",
        "[]",
        "['FAILED']",
      ],
      correct: 0,
      explain: `clean.split() gives ['user', 'failed', 'to', 'login', 'successfully']. The list comprehension checks each keyword: 'failed' IS in words (✓), 'blocked' is not, 'malware' is not. Result: ['failed'].`,
    },
    {
      tag: "Method chaining",
      q: "What does this print?",
      code:
`log = "  BLOCKED :: Admin :: IP 192.168.1.1  "
parts = log.strip().lower().split(" :: ")
print(parts[1])`,
      opts: [
        '"Admin"',
        '"admin"',
        '"BLOCKED"',
        "IndexError",
      ],
      correct: 1,
      explain: `strip() removes leading/trailing spaces. lower() converts to lowercase: "blocked :: admin :: ip 192.168.1.1". split(" :: ") splits on " :: " giving ['blocked', 'admin', 'ip 192.168.1.1']. parts[1] is 'admin'.`,
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // LESSON 9 — Exceptions
  // ══════════════════════════════════════════════════════════════
  l9: [
    {
      tag: "Exception flow",
      q: "What is printed?",
      code:
`def convert(val):
    try:
        return int(val) * 2
    except ValueError:
        return -1
    finally:
        print("done")

print(convert("abc"))`,
      opts: [
        "done\n-1",
        "-1",
        "done\n-2",
        "ValueError",
      ],
      correct: 0,
      explain: `int("abc") raises ValueError → except runs, returns -1. BUT finally ALWAYS runs before the return completes. So "done" prints first, then convert returns -1, then the outer print outputs -1. Output: done then -1 on separate lines.`,
    },
    {
      tag: "Bare except",
      q: "What is wrong with this code?",
      code:
`data = ["45", "N/A", None, "88"]
for item in data:
    try:
        print(int(item))
    except:
        pass`,
      opts: [
        "int() cannot accept a list",
        "bare except: silently hides all errors including bugs — use except Exception or specific types",
        "pass is not valid inside except",
        "The for loop will crash on None",
      ],
      correct: 1,
      explain: `Bare except: catches every possible exception including SystemExit, KeyboardInterrupt, and your own programming bugs. This makes debugging nearly impossible. Use except (ValueError, TypeError): to only catch what you expect.`,
    },
    {
      tag: "Multiple exceptions",
      q: "What prints for each call?",
      code:
`def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "DIV_ZERO"
    except TypeError:
        return "BAD_TYPE"

print(safe_div(10, 2))
print(safe_div(10, 0))
print(safe_div(10, "x"))`,
      opts: [
        "5.0 / DIV_ZERO / BAD_TYPE",
        "5 / 0 / TypeError",
        "5.0 / DIV_ZERO / TypeError",
        "DIV_ZERO / DIV_ZERO / BAD_TYPE",
      ],
      correct: 0,
      explain: `10/2 = 5.0 (float division). 10/0 raises ZeroDivisionError → "DIV_ZERO". 10/"x" raises TypeError → "BAD_TYPE". Each except clause catches only its named exception type — they don't interfere with each other.`,
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // LESSON 10 — Capstone
  // ══════════════════════════════════════════════════════════════
  l10: [
    {
      tag: "Full flow",
      q: "A student enters: 'malware detected in C:/temp'. What does score_event return?",
      code:
`def score_event(text):
    t    = text.lower()
    risk = 10
    if "failed"  in t: risk += 40
    if "blocked" in t: risk += 30
    if "malware" in t: risk += 60
    if "exploit" in t: risk += 50
    return min(risk, 100)`,
      opts: ["10", "60", "70", "100"],
      correct: 2,
      explain: `t = "malware detected in c:/temp". Only "malware" is in t → risk = 10 + 60 = 70. No other keywords match. min(70, 100) = 70. The function returns 70.`,
    },
    {
      tag: "Data structure",
      q: "After this code, what does events[1]['label'] contain?",
      code:
`events = []
logs   = ["normal login", "FAILED login from unknown"]

def score_event(t):
    return 50 if "failed" in t.lower() else 10

def label_risk(r):
    return "HIGH" if r >= 70 else "MEDIUM" if r >= 40 else "LOW"

for log in logs:
    r = score_event(log)
    events.append({"raw": log, "risk": r, "label": label_risk(r)})`,
      opts: ['"LOW"', '"MEDIUM"', '"HIGH"', '"FAILED"'],
      correct: 1,
      explain: `logs[1] = "FAILED login from unknown". score_event returns 50 (because "failed" in t.lower()). label_risk(50): 50 < 70 so not HIGH; 50 >= 40 so MEDIUM. events[1]["label"] = "MEDIUM".`,
    },
    {
      tag: "Analytics",
      q: "What does avg_risk equal?",
      code:
`events = [
    {"risk": 10,  "label": "LOW"},
    {"risk": 70,  "label": "HIGH"},
    {"risk": 50,  "label": "MEDIUM"},
    {"risk": 90,  "label": "HIGH"},
]
risks    = [e["risk"] for e in events]
avg_risk = sum(risks) / len(risks)`,
      opts: ["55.0", "57.5", "60.0", "220"],
      correct: 0,
      explain: `risks = [10, 70, 50, 90]. Sum is 220 and there are 4 events, so avg_risk = 220 / 4 = 55.0.`,
    },
  ],
};

/**
 * Get quiz questions for a lesson.
 * @param {string} lessonId  e.g. "l1"
 * @returns {Array}
 */
export function getQuiz(lessonId) {
  return quizData[lessonId] || [];
}
