// src/data/lessonTryMe.js
// Extended lesson content: TTS intro text + per-section Try Me blocks.
// Each section has: id, icon, heading, body (TTS readable), code, tryMe, tip.
// tryMe optional: editableToken (substring of starter) + editableLabel / editableMaxLength when the editor should lock around one token.
// Single-file source for all lessons; teacher JSON overrides merge via getMergedLessonContent.

import { loadLessonOverrides } from "../utils/lessonOverrides.js";

export const lessonContent = [
  {
    lessonId: "l1",
    ttsIntro: "Welcome to Lesson 1: Variables and Types. In this lesson you will learn how to store data in Python using variables. Every piece of information a program works with — a username, a score, a flag — lives in a variable. By the end of this lesson you will be able to create variables of four different types, verify their type using the type function, and print clean formatted output.",
    sections: [
      {
        id:"s1", icon:"🛡️", heading:"Why Variables Matter in Cyber and AI",
        body:"Every time you log in to a system, a server creates dozens of variables in milliseconds: your username stored as text, your session token as a string, your risk score as a decimal number, and a flag for two-factor authentication. These values live in memory and are checked thousands of times per second. In Python, you create them with a single line of code.",
        code:null, tryMe:null, tip:null,
      },
      {
        id:"s2", icon:"📦", heading:"Creating Variables — The Assignment Operator",
        body:"A variable is a named container for a value. Use the equals sign to assign a value to a name. Python reads the right side and automatically detects the type — you never declare it manually.",
        code:`username           = "Ava"    # str   — text in quotes
grade              = 10       # int   — whole number
risk_score         = 0.0      # float — decimal number
two_factor_enabled = True     # bool  — True or False`,
        tryMe:{
          starter:`# Change YourName and run it
username           = "YourName"
grade              = 10
risk_score         = 0.0
two_factor_enabled = True

print("username:", username)
print("grade:", grade)
print("risk_score:", risk_score)
print("2FA enabled:", two_factor_enabled)`,
          expectedOutput:"username: YourName\ngrade: 10\nrisk_score: 0.0\n2FA enabled: True",
          hint:"Change YourName to your own name and run it. Notice how each type prints differently.",
        },
        tip:null,
      },
      {
        id:"s3", icon:"🔬", heading:"The Four Types — str, int, float, bool",
        body:"Python has four basic types. A string stores text and always needs quotes. An integer stores whole numbers with no quotes. A float stores decimal numbers. A boolean stores exactly True or False with a capital first letter. Using the wrong type — for example storing a number inside quotes — breaks any math you try to do with it.",
        code:`username  = "Ava"      # str
grade     = 10         # int
risk      = 0.75       # float
mfa_on    = True       # bool

print(type(username))  # <class 'str'>
print(type(grade))     # <class 'int'>
print(type(risk))      # <class 'float'>
print(type(mfa_on))    # <class 'bool'>`,
        tryMe:{
          starter:`username = "Ava"
grade    = 10
risk     = 0.75
mfa_on   = True

print(type(username))
print(type(grade))
print(type(risk))
print(type(mfa_on))`,
          expectedOutput:"<class 'str'>\n<class 'int'>\n<class 'float'>\n<class 'bool'>",
          hint:"type() is your debugging tool. When you see a TypeError, check your variable types first.",
        },
        tip:"In cybersecurity, the wrong type causes real bugs. Storing a port number as a string means you cannot compare it to 443 with greater-than or less-than operators.",
      },
      {
        id:"s4", icon:"🖨️", heading:"Printing Output — f-Strings",
        body:"Python's print function displays values. The modern, professional way is an f-string: put the letter f before the opening quote, then embed variable names inside curly braces. F-strings are cleaner and faster than comma-separated print calls.",
        code:`username = "Ava"
grade    = 10
mfa_on   = True

# f-string style — professional standard
print(f"user: {username} | grade: {grade} | 2FA: {mfa_on}")
# Output: user: Ava | grade: 10 | 2FA: True`,
        tryMe:{
          starter:`username = "Ava"
grade    = 10
mfa_on   = True

print("=== CYBER PROFILE ===")
print(f"User  : {username}")
print(f"Grade : {grade}")
print(f"2FA   : {mfa_on}")`,
          expectedOutput:"=== CYBER PROFILE ===\nUser  : Ava\nGrade : 10\n2FA   : True",
          hint:"Inside an f-string, put variable names inside curly braces. Try changing the values and re-running.",
        },
        tip:null,
      },
      {
        id:"s5", icon:"❌", heading:"Common Mistakes",
        body:"Three bugs cause most beginner errors. First, missing quotes on a string gives a NameError. Second, quotes around a number make it text so math crashes with TypeError. Third, lowercase true or false are not valid Python — booleans need exactly True or False with a capital first letter.",
        code:`# BUG 1 — NameError: missing quotes
# username = Ava
username = "Ava"       # ✓ Fixed

# BUG 2 — Wrong type: grade is text not number
# grade = "10"
grade = 10             # ✓ Fixed

# BUG 3 — NameError: lowercase bool
# mfa_on = true
mfa_on = True          # ✓ Fixed`,
        tryMe:{
          starter:`# Fix all three bugs — one error per line
username = Ava
grade    = "11"
mfa_on   = false

print(f"{username} | grade+1={grade+1} | 2FA:{mfa_on}")`,
          expectedOutput:"Ava | grade+1=12 | 2FA:False",
          hint:`Bug 1: Ava needs quotes → "Ava". Bug 2: "11" needs no quotes → 11. Bug 3: false → False (capital F).`,
        },
        tip:null,
      },
    ],
  },

  {
    lessonId:"l2",
    ttsIntro:"Welcome to Lesson 2: Input and Output. In this lesson you will learn how to collect user input with the input function, convert it to the correct type, and print formatted results. Every security intake form uses these exact techniques.",
    sections:[
      {
        id:"s1", icon:"🛡️", heading:"Security Tools Start With Input",
        body:"Every security form you have filled out — reporting phishing, flagging suspicious activity — is powered by code that reads what you typed, converts it to the right type, and stores it. Python's input function lets your program pause and ask the user for information at runtime.",
        code:null, tryMe:null, tip:null,
      },
      {
        id:"s2", icon:"⌨️", heading:"The input() Function",
        body:"input() pauses the program, shows a prompt, and waits for the user to type and press Enter. Whatever they type is always returned as a string — even if they type a number. This is the single most important rule about input.",
        code:`msg = input("Paste suspicious message: ")
print(type(msg))    # <class 'str'> — always a string`,
        tryMe:{
          starter:`name = input("What is your name? ")
print("Hello,", name)
print("Type:", type(name))`,
          expectedOutput:"Hello, Ava\nType: <class 'str'>",
          hint:"input() always returns a string. The text inside the parentheses is the prompt shown to the user.",
        },
        tip:null,
      },
      {
        id:"s3", icon:"🔢", heading:"Converting Types — int() and float()",
        body:"If the user types a number and you want to do math, wrap int() or float() directly around input(). Python runs the inner function first, then passes the result to the outer one. If conversion fails — for example the user types hello — Python raises a ValueError.",
        code:`risk       = int(input("Risk score 0-100: "))
confidence = float(input("Confidence 0.0-1.0: "))

print(f"risk + 10: {risk + 10}")
print(f"Confidence: {confidence * 100:.1f}%")`,
        tryMe:{
          starter:`risk = int(input("Enter a risk score: "))

print(f"You entered: {risk}")
print(f"Type: {type(risk)}")
print(f"Doubled: {risk * 2}")
print(f"Label: {'HIGH' if risk >= 70 else 'MEDIUM' if risk >= 40 else 'LOW'}")`,
          expectedOutput:"You entered: 72\nType: <class 'int'>\nDoubled: 144\nLabel: HIGH",
          hint:"Try entering 72. Then try entering hello to see a ValueError — Lesson 9 shows you how to handle that.",
        },
        tip:"The pattern int(input('prompt')) is very common. Python runs inside-out: input() runs first, returns a string, then int() converts it.",
      },
      {
        id:"s4", icon:"📋", heading:"Building a Formatted Report",
        body:"Once you have inputs stored and converted, print a professional report using f-strings. The format specifier colon dot one f rounds a float to one decimal place.",
        code:`msg        = input("Suspicious message: ")
risk       = int(input("Risk score 0-100: "))
confidence = float(input("Confidence 0.0-1.0: "))
status     = "HIGH RISK" if risk >= 70 else "MEDIUM" if risk >= 40 else "LOW"

print(f"Message    : {msg}")
print(f"Risk Score : {risk} / 100")
print(f"Confidence : {confidence * 100:.1f}%")
print(f"Status     : {status}")`,
        tryMe:{
          starter:`msg        = "Buy Bitcoin now!"
risk       = 72
confidence = 0.875
status     = "HIGH RISK" if risk >= 70 else "MEDIUM" if risk >= 40 else "LOW"

print("=== PHISHING INTAKE REPORT ===")
print(f"Message    : {msg}")
print(f"Risk Score : {risk} / 100")
print(f"Confidence : {confidence * 100:.1f}%")
print(f"Status     : {status}")`,
          expectedOutput:"=== PHISHING INTAKE REPORT ===\nMessage    : Buy Bitcoin now!\nRisk Score : 72 / 100\nConfidence : 87.5%\nStatus     : HIGH RISK",
          hint:"Try changing confidence to 0.5 — the percentage should display as 50.0%. The :.1f format specifier handles the rounding.",
        },
        tip:null,
      },
    ],
  },

  {
    lessonId:"l3",
    ttsIntro:"Welcome to Lesson 3: Conditionals. Every rule in a real Intrusion Detection System is a conditional statement. In this lesson you will write if, elif, and else chains with all six comparison operators, combine conditions with and and or, and build a five-tier triage function that mirrors professional security tooling.",
    sections:[
      {
        id:"s1", icon:"🛡️", heading:"Every IDS Rule Is a Conditional",
        body:"A real Intrusion Detection System like Snort or Suricata evaluates thousands of conditional rules every second. Each rule is essentially an if statement: if this pattern matches, fire this alert. When you write if and elif in Python, you are writing the same logic that powers enterprise security platforms. The difference between a beginner script and a production tool is mostly how many conditions you chain together and how carefully you order them.",
        code:null, tryMe:null, tip:null,
      },
      {
        id:"s2", icon:"🔀", heading:"if / elif / else — Branch Order Matters",
        body:"Python reads conditions from top to bottom and runs the first branch that is True. The moment one branch fires, all remaining branches are completely skipped — even if they would also be True. This is why the highest threshold must always come first. Missing the colon at the end of a condition line gives a SyntaxError. Wrong indentation gives an IndentationError.",
        code:
`score = 85

if score >= 90:       # checked first. 85 < 90 → False, skip
    print("CRITICAL")
elif score >= 70:     # checked second. 85 >= 70 → True, RUNS
    print("HIGH RISK")
elif score >= 40:     # never reached — already fired above
    print("MEDIUM")
else:                 # never reached
    print("LOW")

# Output: HIGH RISK`,
        tryMe:{
          starter:`score = 85

if score >= 90:
    print("CRITICAL")
elif score >= 70:
    print("HIGH RISK")
elif score >= 40:
    print("MEDIUM")
else:
    print("LOW")`,
          expectedOutput:"HIGH RISK",
          hint:"Change score to 95 for CRITICAL, 55 for MEDIUM, or 15 for LOW. Test every branch.",
        },
        tip:"Order determines which branch fires. If you put elif score >= 10 before elif score >= 70, every score above 10 hits the first branch. HIGH and CRITICAL become unreachable — a silent bug more dangerous than a crash.",
      },
      {
        id:"s3", icon:"⚖️", heading:"All Six Comparison Operators",
        body:"Conditions are built from comparison operators that return True or False. Greater than or equal catches the threshold and everything above it. Strictly greater than excludes the threshold itself. Double equals compares values — never use a single equals sign inside a condition, that is assignment and gives a SyntaxError. Not equal, less than or equal, and strictly less than complete the set.",
        code:
`score  = 72
status = "blocked"
fails  = 3

print(score >= 70)       # True  — 72 is at or above 70
print(score > 70)        # True  — 72 is strictly above 70
print(score > 72)        # False — 72 is not strictly above 72
print(status == "blocked") # True — exact match
print(status != "allowed") # True — they differ
print(fails <= 3)        # True  — 3 is at or below 3
print(fails < 3)         # False — 3 is not strictly below 3`,
        tryMe:{
          starter:`score = 50
print(score >= 70)   # ?
print(score >= 40)   # ?
print(score == 50)   # ?
print(score != 50)   # ?
print(score < 100)   # ?`,
          expectedOutput:"False\nTrue\nTrue\nFalse\nTrue",
          hint:"Every comparison returns True or False — these are the building blocks of every conditional in your program.",
        },
        tip:null,
      },
      {
        id:"s4", icon:"🔗", heading:"Combining with and / or / not",
        body:"Real threats rarely trigger on just one signal. You combine conditions using boolean operators. 'and' requires both conditions to be True — if either is False, the whole condition is False. 'or' requires at least one to be True — if either is True, the whole condition is True. 'not' inverts a boolean. You can use parentheses to group complex rules and make your intent clear.",
        code:
`score      = 75
new_device = True
malware    = False

# AND — both must be True
if score >= 70 and new_device:
    print("ESCALATE: high risk from unknown device")

# OR — either is enough
if score >= 70 or malware:
    print("ALERT: action required")

# NOT — inverts
if not malware:
    print("No malware in this event")

# Parentheses for clarity on complex rules
if (score >= 90) or (score >= 70 and new_device):
    print("Escalation triggered")`,
        tryMe:{
          starter:`score      = 75
new_device = True
malware    = False

if score >= 70 and new_device:
    print("Line 1: ESCALATE — printed?")

if score >= 70 and malware:
    print("Line 2: MALWARE+HIGH — printed?")

if score >= 70 or malware:
    print("Line 3: ALERT — printed?")`,
          expectedOutput:"Line 1: ESCALATE — printed?\nLine 3: ALERT — printed?",
          hint:"Line 2 uses 'and' — BOTH must be True. malware is False so Line 2 does not print. Line 3 uses 'or' — only one needs to be True, and score>=70 is True.",
        },
        tip:null,
      },
      {
        id:"s5", icon:"🏗️", heading:"The 5-Tier Triage Function",
        body:"Professional security tools wrap their decision logic in a function that returns a label. This makes the logic reusable anywhere. Notice the function uses return, not print — returning means the caller can store the result, compare it, or pass it to another function. A function that only prints is a dead end. This five-tier structure mirrors real SOC severity levels: CRITICAL requires immediate human response, ESCALATE means high risk from an unknown source, HIGH means a single strong signal, MEDIUM means monitoring required, LOW means within normal range.",
        code:
`def label_risk(score, new_device=False, malware=False):
    """Returns: CRITICAL / ESCALATE / HIGH / MEDIUM / LOW"""
    if score >= 90:                  # worst case — page on-call now
        return "CRITICAL"
    if score >= 70 and new_device:   # high score + unknown device
        return "ESCALATE"
    if score >= 70 or malware:       # high score OR malware present
        return "HIGH"
    if score >= 40:                  # moderate — monitor
        return "MEDIUM"
    return "LOW"                     # baseline — no action needed

# Compose: result flows into the next decision
label = label_risk(65, malware=True)  # returns "HIGH"
if label in ("CRITICAL", "ESCALATE", "HIGH"):
    print(f"[{label}] File incident ticket immediately")`,
        tryMe:{
          starter:`def label_risk(score, new_device=False, malware=False):
    if score >= 90:
        return "CRITICAL"
    if score >= 70 and new_device:
        return "ESCALATE"
    if score >= 70 or malware:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"

print(label_risk(95))
print(label_risk(75, new_device=True))
print(label_risk(72))
print(label_risk(50))
print(label_risk(20))
print(label_risk(65, malware=True))`,
          expectedOutput:"CRITICAL\nESCALATE\nHIGH\nMEDIUM\nLOW\nHIGH",
          hint:"score=65 is below 70 so the score >= 70 checks fail. But malware=True makes the 'score >= 70 or malware' condition True — result is HIGH.",
        },
        tip:"label_risk(65, malware=True) returns HIGH because 'or malware' is True even though the score is only medium. A malware detection overrides the score — exactly how real tools work.",
      },
    ],
  },

  {
    lessonId:"l4",
    ttsIntro:"Welcome to Lesson 4: Loops. A SIEM processes up to one hundred thousand security events per second — every single one passes through a loop. In this lesson you will write for loops with all three forms of range, use the modulo operator for pattern detection, maintain multiple counters simultaneously, scan a real list with enumerate, and control loop flow with break and continue.",
    sections:[
      {
        id:"s1", icon:"🛡️", heading:"Why Security Tools Live Inside Loops",
        body:"A SIEM platform processes between one thousand and one hundred thousand security events per second. Every single event passes through a loop that applies rules, scores it, and routes it to the right queue. Without loops, you would need a separate line of code for each event — completely impossible at scale. Python gives you industrial-strength event processing in a handful of lines. The same for loop that scans 10 events in your practice code is structurally identical to the loop that scans ten million events in a production SOC.",
        code:null, tryMe:null, tip:null,
      },
      {
        id:"s2", icon:"🔄", heading:"for Loop + range() — Three Forms",
        body:"range() generates a sequence of numbers. It has three forms. The single-argument form starts at zero. The two-argument form takes a start and stop — the start is included, the stop is excluded. The three-argument form adds a step, which lets you count by twos, fives, or tens. The off-by-one error is the most common loop mistake: range(1, 10) gives 1 through 9, not 10. To include 10, write range(1, 11).",
        code:
`# Form 1: range(stop) — starts at 0
for i in range(5):
    print(i)              # 0, 1, 2, 3, 4

# Form 2: range(start, stop)
for event_id in range(1, 11):
    print("Event:", event_id)   # 1, 2 ... 10

# Form 3: range(start, stop, step)
for threshold in range(0, 101, 25):
    print("Threshold:", threshold)  # 0, 25, 50, 75, 100`,
        tryMe:{
          starter:`for i in range(1, 6):
    print("Event:", i)
print("Done")`,
          expectedOutput:"Event: 1\nEvent: 2\nEvent: 3\nEvent: 4\nEvent: 5\nDone",
          hint:"range(1, 6) gives 1 through 5 — five values. The stop (6) is never included.",
        },
        tip:"Off-by-one is the single most common loop bug. Always ask: does the last value of range() match what I actually want? Trace through it manually for the first and last value.",
      },
      {
        id:"s3", icon:"%", heading:"Modulo — Pattern Detection in Data",
        body:"Modulo gives you the remainder after division. When the remainder is zero, the number divides evenly — it is divisible by the divisor. This is how you detect patterns: every third event, every fifth packet, every even-numbered log entry. Real IDS tools use modulo to sample traffic — checking every nth packet instead of all of them to reduce processing load.",
        code:
`print(9  % 3)   # 0  — exact division, no remainder → divisible
print(10 % 3)   # 1  — 10 ÷ 3 = 3 remainder 1 → not divisible
print(14 % 2)   # 0  — even number
print(15 % 2)   # 1  — odd number

# Practical: flag every 3rd event
for event_id in range(1, 11):
    if event_id % 3 == 0:
        print(f"Event {event_id}: SUSPICIOUS")   # 3, 6, 9`,
        tryMe:{
          starter:`for n in range(1, 11):
    if n % 3 == 0:
        print(f"{n} is divisible by 3")
    else:
        print(f"{n} — skip")`,
          expectedOutput:"1 — skip\n2 — skip\n3 is divisible by 3\n4 — skip\n5 — skip\n6 is divisible by 3\n7 — skip\n8 — skip\n9 is divisible by 3\n10 — skip",
          hint:"Change % 3 to % 5 and predict which numbers appear before running.",
        },
        tip:"In real IDS tools, modulo is used for traffic sampling — checking every nth packet instead of every single one. At 100k events/second, sampling 1-in-10 reduces load by 90% while keeping statistical accuracy.",
      },
      {
        id:"s4", icon:"🔢", heading:"Multiple Counters — The Accumulator Pattern",
        body:"One loop can update several counters simultaneously. Every counter must start at zero before the loop — placing a counter initialisation inside the loop resets it on every iteration, so the final count is always zero or one. The += shorthand adds a value to a variable in place. This accumulator pattern — initialise before, increment inside, read after — appears in almost every analytics pipeline you will ever write.",
        code:
`critical_count   = 0   # ALL counters BEFORE the loop
suspicious_count = 0
ok_count         = 0
total_risk       = 0

for event_id in range(1, 21):
    if event_id % 5 == 0:      # divisible by 5 → CRITICAL
        critical_count += 1
    elif event_id % 3 == 0:    # divisible by 3 → SUSPICIOUS
        suspicious_count += 1
    else:
        ok_count += 1

    total_risk += event_id     # accumulate sum

average = total_risk / 20
print(f"CRITICAL: {critical_count} | SUSPICIOUS: {suspicious_count} | OK: {ok_count}")
print(f"Average: {average:.1f}")`,
        tryMe:{
          starter:`high_count = 0
low_count  = 0
scores     = [88, 15, 72, 43, 95, 22, 67]

for score in scores:
    if score >= 70:
        high_count += 1
    elif score < 40:
        low_count += 1

print(f"High: {high_count}")
print(f"Low:  {low_count}")`,
          expectedOutput:"High: 3\nLow: 2",
          hint:"88, 72, 95 are >= 70 (HIGH). 15, 22 are < 40 (LOW). 43 and 67 fall in between — neither counter changes for them.",
        },
        tip:"The counter-inside-the-loop bug is silent — no error, just a wrong answer. Always trace through the first two iterations manually: does the counter still hold its value from the previous iteration?",
      },
      {
        id:"s5", icon:"📋", heading:"Scanning a Real List with enumerate()",
        body:"When you loop a list, you often need both the index and the value at the same time. enumerate() gives you both in one step — no separate counter variable needed. The optional start=1 argument makes numbering begin at 1 instead of 0, which is more readable for event logs. The result is a tuple you unpack into two variables using idx, value in the for line.",
        code:
`risk_scores = [15, 88, 42, 96, 73, 20, 55, 91]

total = 0
for idx, score in enumerate(risk_scores, start=1):
    if   score >= 90: label = "CRITICAL"
    elif score >= 70: label = "HIGH"
    elif score >= 40: label = "MEDIUM"
    else:             label = "LOW"

    bar = "█" * (score // 10)
    print(f"  Event {idx:>2}: {score:>3}  {bar:<10}  [{label}]")
    total += score

print(f"Average risk: {total / len(risk_scores):.1f}")`,
        tryMe:{
          starter:`scores = [22, 85, 47, 91, 60]
total  = 0

for idx, score in enumerate(scores, start=1):
    total += score
    print(f"Event {idx}: {score}")

print(f"Average: {total / len(scores):.1f}")`,
          expectedOutput:"Event 1: 22\nEvent 2: 85\nEvent 3: 47\nEvent 4: 91\nEvent 5: 60\nAverage: 61.0",
          hint:"enumerate(scores, start=1) gives (1, 22), (2, 85), (3, 47)... — index and value together. Unpack with: for idx, score in enumerate(...):",
        },
        tip:null,
      },
      {
        id:"s6", icon:"⏹️", heading:"while Loop, break, and continue",
        body:"A while loop repeats as long as a condition is True. Use it when the number of iterations depends on runtime data — like waiting for a user to authenticate, or collecting events until a CRITICAL one arrives. break exits the loop immediately. continue skips the rest of the current iteration and jumps to the next. If you forget to increment the variable in a while loop, the condition never becomes False and the program freezes in an infinite loop.",
        code:
`# Login lockout — 3 attempts then lock
attempts  = 0
max_tries = 3

while attempts < max_tries:
    attempts += 1
    print(f"Attempt {attempts}: FAILED")
    if attempts >= max_tries:
        print("Account locked.")
        break       # exit immediately

# break vs continue
for event_id in range(1, 11):
    if event_id == 5:
        continue    # skip event 5, keep looping
    if event_id == 8:
        break       # stop at event 8 entirely
    print("Processing event:", event_id)`,
        tryMe:{
          starter:`attempts  = 0
max_tries = 3

while attempts < max_tries:
    attempts += 1
    print(f"Attempt {attempts}: failed")
    if attempts >= max_tries:
        print("Account locked.")
        break`,
          expectedOutput:"Attempt 1: failed\nAttempt 2: failed\nAttempt 3: failed\nAccount locked.",
          hint:"The while loop runs while attempts < 3. On the third iteration attempts becomes 3, the inner if fires, and break exits. Without break the loop would stop anyway — try removing break and see if the output changes.",
        },
        tip:"Infinite loops are a real security concern — a poorly written while loop in a network handler can be triggered intentionally by an attacker to exhaust CPU. Always verify your while condition becomes False or has a break.",
      },
    ],
  },

  {
    lessonId:"l5",
    ttsIntro:"Welcome to Lesson 5: Functions. A real security system defines a scoring function once and calls it everywhere. In this lesson you will define functions with parameters and return values, call them with different arguments, and compose two functions together.",
    sections:[
      {
        id:"s1", icon:"🛡️", heading:"Functions Equal Reusable Security Logic",
        body:"A real security system has hundreds of functions — score login, detect anomaly, label risk. Functions wrap logic under a name. Define once, call many times with different inputs. If the scoring rule changes, update it in one place and everything using it automatically improves.",
        code:null, tryMe:null, tip:null,
      },
      {
        id:"s2", icon:"🏗️", heading:"Defining a Function",
        body:"The def keyword starts a function. After def comes the name, then parentheses with parameter names. The body is indented. The return keyword sends a value back to the caller. Without return a function gives back None — a very common source of bugs.",
        code:`def greet_analyst(name):
    message = f"Welcome, {name}. System online."
    return message

result = greet_analyst("Ava")
print(result)`,
        tryMe:{
          starter:`def double_score(score):
    return score * 2

print(double_score(30))
print(double_score(45))
print(double_score(50))`,
          expectedOutput:"60\n90\n100",
          hint:"The function runs its body once per call with the value you passed. Try passing 100 and predict the output.",
        },
        tip:null,
      },
      {
        id:"s3", icon:"⚙️", heading:"The Risk Scoring Function",
        body:"The score login attempt function takes two parameters: failed login count and whether the device is new. Each fail adds twenty points. A new device adds thirty. The score is capped at one hundred. It returns the value — not just prints it — so the caller can store and reuse it.",
        code:`def score_login_attempt(fails, new_device):
    risk = fails * 20
    if new_device:
        risk = risk + 30
    if risk > 100:
        risk = 100
    return risk

print(score_login_attempt(1, False))  # 20
print(score_login_attempt(2, True))   # 70
print(score_login_attempt(4, True))   # 100`,
        tryMe:{
          starter:`def score_login_attempt(fails, new_device):
    risk = fails * 20
    if new_device: risk += 30
    return min(risk, 100)

my_risk = score_login_attempt(2, True)
print("Risk:", my_risk)
print("Doubled:", my_risk * 2)
print("Is high?", my_risk >= 70)`,
          expectedOutput:"Risk: 70\nDoubled: 140\nIs high? True",
          hint:"The function returns a number you can store and use. Try score_login_attempt(3, False) — what do you predict?",
        },
        tip:"return sends a value back; print only displays it. A function that returns is a building block. A function that only prints is a dead end.",
      },
      {
        id:"s4", icon:"🔗", heading:"Composing Functions",
        body:"Composition means passing one function's output as another's input. Define score and label as separate small functions, each doing one thing, then call them in sequence. This keeps each function testable and the whole system easy to understand.",
        code:`def score_login_attempt(fails, new_device):
    risk = fails * 20
    if new_device: risk += 30
    return min(risk, 100)

def label_risk(risk):
    if risk >= 70: return "HIGH"
    if risk >= 40: return "MEDIUM"
    return "LOW"

risk  = score_login_attempt(2, True)   # 70
label = label_risk(risk)               # "HIGH"
print(f"Risk: {risk} — Label: {label}")`,
        tryMe:{
          starter:`def score_login_attempt(fails, new_device):
    risk = fails * 20
    if new_device: risk += 30
    return min(risk, 100)

def label_risk(risk):
    if risk >= 70: return "HIGH"
    if risk >= 40: return "MEDIUM"
    return "LOW"

cases = [(1,False),(2,True),(3,False),(4,True)]
for fails, nd in cases:
    r = score_login_attempt(fails, nd)
    l = label_risk(r)
    print(f"fails={fails} nd={nd} → {r} [{l}]")`,
          expectedOutput:"fails=1 nd=False → 20 [LOW]\nfails=2 nd=True → 70 [HIGH]\nfails=3 nd=False → 60 [MEDIUM]\nfails=4 nd=True → 100 [HIGH]",
          hint:"Change a fails value or nd value and predict the output before running.",
        },
        tip:null,
      },
    ],
  },

  {
    lessonId:"l6",
    ttsIntro:"Welcome to Lesson 6: Lists and Analytics. A threat feed delivers dozens of risk scores per hour. In this lesson you will create lists, access items by index, compute totals and averages with built-in functions, and count conditional matches with a loop.",
    sections:[
      {
        id:"s1", icon:"🛡️", heading:"Lists Equal Collections of Events",
        body:"A security dashboard might receive two hundred risk scores per hour. You need one container to hold them all, then compute statistics across the whole set. A list stores multiple values in order under one variable name.",
        code:null, tryMe:null, tip:null,
      },
      {
        id:"s2", icon:"📋", heading:"Creating and Accessing a List",
        body:"A list uses square brackets with values separated by commas. Each value has an index starting at zero. The last item is at index negative one. The len function returns the number of items.",
        code:`scores = [15, 42, 88, 73, 60, 95]
print(scores[0])     # 15 — first
print(scores[-1])    # 95 — last
print(len(scores))   # 6`,
        tryMe:{
          starter:`scores = [10, 45, 88, 73, 60, 95, 30]

print("First:", scores[0])
print("Last:", scores[-1])
print("Third:", scores[2])
print("Count:", len(scores))
print("Slice:", scores[1:4])`,
          expectedOutput:"First: 10\nLast: 30\nThird: 88\nCount: 7\nSlice: [45, 88, 73]",
          hint:"scores[1:4] gives items at index 1, 2, 3. The stop index 4 is not included.",
        },
        tip:null,
      },
      {
        id:"s3", icon:"📊", heading:"Analytics with Built-in Functions",
        body:"Four built-in functions give you immediate analytics on any list. sum adds all values. len counts items. max finds the largest. min finds the smallest. Divide sum by len for the average.",
        code:`scores = [15, 42, 88, 73, 60, 95]
print(f"Total  : {sum(scores)}")
print(f"Average: {sum(scores)/len(scores):.1f}")
print(f"Highest: {max(scores)}")
print(f"Lowest : {min(scores)}")`,
        tryMe:{
          starter:`scores = [15, 42, 88, 73, 60, 95]
total   = sum(scores)
average = total / len(scores)

print(f"Total  : {total}")
print(f"Average: {average:.1f}")
print(f"Highest: {max(scores)}")
print(f"Lowest : {min(scores)}")`,
          expectedOutput:"Total  : 373\nAverage: 62.2\nHighest: 95\nLowest : 15",
          hint:"Try scores.append(100) before these lines and re-run — all four stats update automatically.",
        },
        tip:null,
      },
      {
        id:"s4", icon:"🔍", heading:"Counting Conditionally",
        body:"To count items meeting a condition, combine a loop with a counter starting at zero before the loop. Inside the loop, check the condition and increment. This is the most common analytics pattern in Python.",
        code:`scores = [15, 42, 88, 73, 60, 95]
high = medium = low = 0

for score in scores:
    if score >= 70:   high   += 1
    elif score >= 40: medium += 1
    else:             low    += 1

print(f"HIGH:{high} MEDIUM:{medium} LOW:{low}")`,
        tryMe:{
          starter:`scores = [15, 42, 88, 73, 60, 95]
high = medium = low = 0

for score in scores:
    if score >= 70:
        high += 1
    elif score >= 40:
        medium += 1
    else:
        low += 1

print(f"HIGH  : {high}")
print(f"MEDIUM: {medium}")
print(f"LOW   : {low}")`,
          expectedOutput:"HIGH  : 3\nMEDIUM: 2\nLOW   : 1",
          hint:"Add more scores to the list and re-run. The counts update automatically.",
        },
        tip:null,
      },
    ],
  },

  {
    lessonId:"l7",
    ttsIntro:"Welcome to Lesson 7: Dictionaries. A dictionary stores labeled fields like a database row. In this lesson you will create dictionaries, access and update fields safely, and loop through all key-value pairs.",
    sections:[
      {
        id:"s1", icon:"🛡️", heading:"Dictionaries Equal Structured Records",
        body:"A security dashboard tracks thousands of devices. Each device has a profile: owner, operating system, risk score, patch status. This structured collection of labeled fields is a dictionary. It is also the format used for JSON API responses and database rows.",
        code:null, tryMe:null, tip:null,
      },
      {
        id:"s2", icon:"📁", heading:"Creating and Accessing a Dictionary",
        body:"A dictionary uses curly braces. Each entry is a key colon value pair separated by commas. Keys are almost always strings in quotes. Access a value with square brackets containing the key in quotes.",
        code:`device = {
    "owner":   "Ava",
    "os":      "Windows 11",
    "risk":    42,
    "patched": False
}

print(device["owner"])    # Ava
print(device["risk"])     # 42`,
        tryMe:{
          starter:`device = {
    "owner":   "Ava",
    "os":      "Windows 11",
    "risk":    42,
    "patched": False
}

print("Owner:", device["owner"])
print("OS:", device["os"])
print("Risk:", device["risk"])
print("Patched:", device["patched"])`,
          expectedOutput:"Owner: Ava\nOS: Windows 11\nRisk: 42\nPatched: False",
          hint:"Try device['Owner'] with a capital O — you will get a KeyError. Keys are case-sensitive.",
        },
        tip:null,
      },
      {
        id:"s3", icon:"🔒", heading:"Safe Access with .get()",
        body:"Accessing a missing key raises a KeyError. The get method returns None instead of crashing. Pass a second argument for a default value. Use get whenever data comes from an external source and you cannot guarantee every field exists.",
        code:`device = {"owner":"Ava","risk":42}

print(device.get("ip"))              # None
print(device.get("ip", "unknown"))   # "unknown"`,
        tryMe:{
          starter:`device = {"owner":"Ava","risk":42,"patched":False}

print(device.get("ip_address"))
print(device.get("ip_address","N/A"))
print(device.get("risk", 0))
print(device.get("owner","unknown"))`,
          expectedOutput:"None\nN/A\n42\nAva",
          hint:"When the key exists .get() returns its value. When it does not exist it returns None or your default.",
        },
        tip:".get() is essential when processing API responses or CSV data where fields may be missing.",
      },
      {
        id:"s4", icon:"✏️", heading:"Updating Fields and Looping with .items()",
        body:"Updating an existing key and adding a new one use the same syntax — square bracket assignment. If the key exists the value is replaced. If not a new key is added. Loop through all key-value pairs with the items method.",
        code:`device = {"owner":"Ava","risk":42,"patched":False}

device["risk"]    = 5
device["patched"] = True
device["last_scan"] = "2025-09-01"

for key, value in device.items():
    print(f"  {key}: {value}")`,
        tryMe:{
          starter:`device = {"owner":"Ava","os":"Windows 11","risk":42,"patched":False}

print("Before:")
for k, v in device.items():
    print(f"  {k}: {v}")

device["risk"]      = 5
device["patched"]   = True
device["last_scan"] = "2025-09-01"

print("After:")
for k, v in device.items():
    print(f"  {k}: {v}")`,
          expectedOutput:"Before:\n  owner: Ava\n  os: Windows 11\n  risk: 42\n  patched: False\nAfter:\n  owner: Ava\n  os: Windows 11\n  risk: 5\n  patched: True\n  last_scan: 2025-09-01",
          hint:"After patching: risk drops to 5, patched becomes True, and last_scan is a new field.",
        },
        tip:null,
      },
    ],
  },

  {
    lessonId:"l8",
    ttsIntro:"Welcome to Lesson 8: Strings and Log Parsing. Security log analysis is text processing. In this lesson you will use lower to normalize, split to tokenize, and the in operator to detect threat keywords — the exact pipeline used in commercial security tools.",
    sections:[
      {
        id:"s1", icon:"🛡️", heading:"Why Strings Power Threat Detection",
        body:"Every login attempt and network request leaves a text record. Before any rule can run, the text must be normalized to a consistent format and tokenized into individual words. This is the same preprocessing pipeline used by enterprise IDS tools.",
        code:null, tryMe:null, tip:null,
      },
      {
        id:"s2", icon:"🔡", heading:"Normalize with lower()",
        body:"FAILED in uppercase, Failed with a capital, and failed lowercase all mean the same thing but Python sees three different strings. lower() converts the entire string to lowercase. It returns a new string — the original is never changed because strings are immutable.",
        code:`log   = "FAILED Login From IP 10.0.0.5"
clean = log.lower()
print(clean)  # "failed login from ip 10.0.0.5"
print(log)    # unchanged — strings are immutable`,
        tryMe:{
          starter:`log   = "FAILED Login From IP 10.0.0.5"
clean = log.lower()

print("Original  :", log)
print("Normalized:", clean)`,
          expectedOutput:"Original  : FAILED Login From IP 10.0.0.5\nNormalized: failed login from ip 10.0.0.5",
          hint:"The original log is unchanged. lower() creates a new string stored in clean.",
        },
        tip:"Always normalize before any keyword check. One missed uppercase letter silently bypasses your detection rule.",
      },
      {
        id:"s3", icon:"✂️", heading:"Tokenize with split()",
        body:"split() breaks a string into a list of words at whitespace. Each word becomes a separate element. You can then check each token individually with the in operator.",
        code:`clean = "failed login from ip 10.0.0.5"
words = clean.split()
print(words)        # ['failed','login','from','ip','10.0.0.5']
print(words[0])     # 'failed'
print(words[-1])    # '10.0.0.5'`,
        tryMe:{
          starter:`log   = "FAILED Login From IP 192.168.1.42"
clean = log.lower()
words = clean.split()

print("Tokens:", words)
print("Count:", len(words))
print("First:", words[0])
print("IP:", words[-1])`,
          expectedOutput:"Tokens: ['failed', 'login', 'from', 'ip', '192.168.1.42']\nCount: 5\nFirst: failed\nIP: 192.168.1.42",
          hint:"words[-1] always gives the last token — the IP address — regardless of line length.",
        },
        tip:null,
      },
      {
        id:"s4", icon:"🔍", heading:"Keyword Detection with 'in'",
        body:"The in operator checks if a value exists in a sequence and returns True or False. Combined with a list of threat keywords and a loop, this builds a complete multi-keyword scanner.",
        code:`words    = ['failed','login','from','ip','10.0.0.5']
keywords = ["failed","blocked","malware","exploit"]

for kw in keywords:
    if kw in words:
        print(f"[ALERT] '{kw}' detected")
    else:
        print(f"[  OK ] '{kw}' not found")`,
        tryMe:{
          starter:`log      = "blocked connection from root user"
keywords = ["failed","blocked","malware","root","exploit"]

clean = log.lower()
words = clean.split()

for kw in keywords:
    status = "ALERT" if kw in words else " OK  "
    print(f"  [{status}] {kw}")`,
          expectedOutput:"  [ OK  ] failed\n  [ALERT] blocked\n  [ OK  ] malware\n  [ALERT] root\n  [ OK  ] exploit",
          hint:"blocked and root are in the log. Detection only works because we normalized to lowercase first.",
        },
        tip:"This pattern is used in Snort and Suricata — the two most widely deployed open-source IDS tools.",
      },
    ],
  },

  {
    lessonId:"l9",
    ttsIntro:"Welcome to Lesson 9: Debugging and Exceptions. Real security data is always messy. Fields are missing, values say N-slash-A. In this lesson you will use try and except to catch errors gracefully and keep your program running no matter what arrives.",
    sections:[
      {
        id:"s1", icon:"🛡️", heading:"Real Data Is Messy",
        body:"Security tools ingest data from CSV files, network scanners, and APIs — all messy. A tool that crashes on bad input stops protecting. The try and except pattern catches errors before they crash your program.",
        code:null, tryMe:null, tip:null,
      },
      {
        id:"s2", icon:"💥", heading:"What Happens Without Exception Handling",
        body:"If you convert a non-numeric string to int, Python raises a ValueError and stops the program. Without a try-except block, one bad value kills the entire processing run.",
        code:`value = "N/A"
x = int(value)          # ValueError — program stops
print("x * 5 =", x * 5)  # never runs`,
        tryMe:{
          starter:`value = "N/A"
x = int(value)
print("x * 5 =", x * 5)
print("This line never runs")`,
          expectedOutput:"ValueError: invalid literal for int() with base 10: 'N/A'",
          hint:"The program crashes on line 2. This is why exception handling is essential.",
        },
        tip:null,
      },
      {
        id:"s3", icon:"🛡️", heading:"try / except Pattern",
        body:"Wrap failing code in a try block. If an error occurs Python jumps to the except block instead of crashing. Execution continues normally after. Always specify the exception type — ValueError for bad conversions, ZeroDivisionError for division by zero.",
        code:`value = "N/A"

try:
    x = int(value)
    print("x * 5 =", x * 5)
except ValueError:
    print("Error: not a valid number:", value)

print("Program continues here")`,
        tryMe:{
          starter:`for value in ["10","N/A","88","null","42"]:
    try:
        x = int(value)
        print(f"  OK  {value} → x*5 = {x*5}")
    except ValueError:
        print(f"  SKIP '{value}' — not a number")`,
          expectedOutput:"  OK  10 → x*5 = 50\n  SKIP 'N/A' — not a number\n  OK  88 → x*5 = 440\n  SKIP 'null' — not a number\n  OK  42 → x*5 = 210",
          hint:"Valid numbers are processed. Invalid strings are skipped. The loop never crashes — all five values are handled.",
        },
        tip:"Always name the exception type. Bare except silently catches everything including bugs in your own code.",
      },
      {
        id:"s4", icon:"🔁", heading:"finally — Always Runs",
        body:"The finally block runs after try and except regardless of success or failure. Use it for cleanup: closing files, logging completion, resetting state. It is your guarantee that certain code always executes.",
        code:`def process_value(raw):
    try:
        x = int(raw)
        print(f"  Result: {x * 10}")
    except ValueError:
        print(f"  Skipped: '{raw}'")
    finally:
        print("  [log] done")  # always runs

process_value("45")   # succeeds
process_value("N/A")  # fails — finally still runs`,
        tryMe:{
          starter:`def process_value(raw):
    try:
        x = int(raw)
        print(f"  Result: {x * 10}")
    except ValueError:
        print(f"  Skipped: not a number")
    finally:
        print(f"  [log] processed: {raw}")

for item in ["45","N/A","88","??"]:
    print(f"Input: {item}")
    process_value(item)
    print()`,
          expectedOutput:"Input: 45\n  Result: 450\n  [log] processed: 45\n\nInput: N/A\n  Skipped: not a number\n  [log] processed: N/A\n",
          hint:"The log line in finally runs for every input — success or failure. This guarantees every event is logged.",
        },
        tip:null,
      },
    ],
  },

  {
    lessonId:"l10",
    ttsIntro:"Welcome to Lesson 10: the Capstone. You will combine everything from Lessons 1 through 9 into a working Security Operations Center dashboard — a portfolio-ready project.",
    sections:[
      {
        id:"s1", icon:"🛡️", heading:"You Have Built Every Piece — Now Connect Them",
        body:"A real SOC tool ingests log events, scores each one using keyword rules, stores them in structured records, and generates a summary report. You already know every technique required. This lesson is about connecting them intentionally into one complete, working system.",
        code:null, tryMe:null, tip:null,
      },
      {
        id:"s2", icon:"🗺️", heading:"Architecture — Each Lesson's Role",
        body:"Lesson 1 variables store your counters and labels. Lesson 2 input collects live log lines. Lesson 3 conditionals power risk labeling. Lesson 4 while loop collects events until done. Lesson 5 functions encapsulate scoring and labeling. Lesson 6 list accumulates all records. Lesson 7 dictionaries structure each event. Lesson 8 strings normalize and detect keywords. Lesson 9 exceptions handle bad input.",
        code:`# Lesson contributions:
# L1 → variables: risk, label, count
# L2 → input(): collect log lines
# L3 → if/elif: label_risk()
# L4 → while True + break
# L5 → def score_event(), label_risk()
# L6 → events = [] accumulates records
# L7 → {"raw","risk","label"} per event
# L8 → .lower(), "in": keyword scoring
# L9 → try/except: handle bad input`,
        tryMe:null, tip:null,
      },
      {
        id:"s3", icon:"⚙️", heading:"The Scoring Engine",
        body:"score event normalizes the log line, then checks for four threat keywords. Each keyword found adds to the risk score, capped at one hundred. This is a simplified version of the keyword matching rules in commercial SIEM products.",
        code:`def score_event(text):
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
        tryMe:{
          starter:`def score_event(text):
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
          expectedOutput:"[MEDIUM]  50  FAILED login from 10.0.0.5\n[HIGH  ]  90  blocked exploit attempt detected\n[HIGH  ]  70  malware found in upload\n[LOW   ]  10  normal user logout",
          hint:"The second log triggers blocked (+30) and exploit (+50) for 90 total. Multiple keywords stack.",
        },
        tip:null,
      },
      {
        id:"s4", icon:"📊", heading:"Analytics Report and Ranked Output",
        body:"After collecting events, loop through the list to sum risk scores, count tiers, and compute the average. The sorted function with a lambda key and reverse True produces a ranked list from highest to lowest risk — the view an analyst sees on their dashboard.",
        code:`events = [...]   # list of dicts collected in the while loop

risks = [e["risk"] for e in events]
avg   = sum(risks) / len(risks)
highs = sum(1 for e in events if e["label"] == "HIGH")

ranked = sorted(events, key=lambda e: e["risk"], reverse=True)
for i, e in enumerate(ranked, 1):
    bar = "█" * (e["risk"] // 10)
    print(f"  {i}. [{e['label']:6}] {e['risk']:3} {bar}")`,
        tryMe:{
          starter:`events = [
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
          expectedOutput:"Total : 4\nAvg   : 55.0\nHIGH  : 2\n  1.  90 █████████  blocked exploit\n  2.  70 ███████  malware found\n  3.  50 █████  FAILED login\n  4.  10 █  normal activity",
          hint:"sorted with reverse=True ranks highest first. The bar is one block per 10 risk points.",
        },
        tip:"lambda e: e['risk'] is an anonymous function that tells sorted what to compare. You will see this pattern constantly in data work.",
      },
    ],
  },
];

/** @param {string} lessonId */
export function getLessonContent(lessonId) {
  return lessonContent.find((c) => c.lessonId === lessonId) ?? null;
}

/**
 * Guided walkthrough + Try me: built-in content merged with teacher override JSON (localStorage).
 */
export function getMergedLessonContent(lessonId) {
  const base = getLessonContent(lessonId);
  let raw;
  try {
    raw = loadLessonOverrides()?.[lessonId]?.tryMeJson;
  } catch {
    raw = undefined;
  }
  if (typeof raw !== "string" || !raw.trim()) return base;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
      return {
        lessonId: lessonId || parsed.lessonId,
        ttsIntro: typeof parsed.ttsIntro === "string" ? parsed.ttsIntro : base?.ttsIntro ?? "",
        sections: parsed.sections,
      };
    }
  } catch {
    /* keep base */
  }
  return base;
}
