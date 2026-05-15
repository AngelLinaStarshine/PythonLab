// src/data/lessonInlineTryMe.js
// ─────────────────────────────────────────────────────────────────
// Inline Try-Me data one editable «BLANK» per reading section.
// Every section that has a concept to test has an entry here.
// Key format: "l{lessonNum}-{sectionId}"
//
// Each entry:
//   label    — instruction in the Try Me header
//   code     — full Python with «BLANK» as the ONE editable spot
//   answer   — correct string (trimmed, case-insensitive match)
//   hint     — shown on 💡 Hint click
//   expected — shown as "Output when correct" on success,
//              and as "Expected output" after 2 wrong attempts
// ─────────────────────────────────────────────────────────────────

export const inlineTryMeData = {

  // ══════════════════════════════════════════════════════════════
  // LESSON 1 Variables & Types
  // ══════════════════════════════════════════════════════════════

  // s1 — Why Variables Matter (no code to fill in, intro section)

  "l1-s2": {
    label:    "Type your username as a Python string (include quotes)",
    code:
`username = «BLANK»
print("Hello,", username)`,
    answer:   '"Ava"',
    hint:     'Strings always need quotes. Type your name inside quotes: "Ava"',
    expected: "Hello, Ava",
  },

  "l1-s3": {
    label:    "Which built-in function tells you a variable's type?",
    code:
`grade = 10
print(«BLANK»(grade))`,
    answer:   "type",
    hint:     "The function that reveals what type Python stored is called type()",
    expected: "<class 'int'>",
  },

  "l1-s4": {
    label:    "Inside the f-string, embed the username variable",
    code:
`username = "Ava"
print(f"User: {«BLANK»}")`,
    answer:   "username",
    hint:     "Inside curly braces of an f-string you write the variable name directly, no quotes",
    expected: "User: Ava",
  },

  "l1-s5": {
    label:    "Fix the bug: what's missing around Ava?",
    code:
`username = «BLANK»
print("User:", username)`,
    answer:   '"Ava"',
    hint:     'Without quotes, Python thinks Ava is a variable name → NameError. Fix: "Ava"',
    expected: "User: Ava",
  },

  // ══════════════════════════════════════════════════════════════
  // LESSON 2 Input & Output
  // ══════════════════════════════════════════════════════════════

  "l2-s2": {
    label:    "Which function pauses and waits for the user to type?",
    code:
`name = «BLANK»("What is your name? ")
print("Hello,", name)`,
    answer:   "input",
    hint:     "The built-in that reads typed input from the user is called input()",
    expected: "Hello, Ava",
  },

  "l2-s3": {
    label:    "Wrap input() to convert the result to an integer",
    code:
`risk = «BLANK»(input("Risk score: "))
print("Doubled:", risk * 2)`,
    answer:   "int",
    hint:     "input() returns a string. To get a whole number wrap it with int()",
    expected: "Doubled: 144",
  },

  "l2-s4": {
    label:    "Complete the format spec: 1 decimal place for a float",
    code:
`conf = 0.875
print(f"Confidence: {conf * 100:.«BLANK»f}%")`,
    answer:   "1",
    hint:     ":.1f means float with 1 decimal place. The digit goes between the dot and the f",
    expected: "Confidence: 87.5%",
  },

  // ══════════════════════════════════════════════════════════════
  // LESSON 3 Conditionals
  // ══════════════════════════════════════════════════════════════

  // s1 — intro, no code blank

  "l3-s2": {
    label:    "What is the HIGH risk threshold? (type just the number)",
    code:
`score = 85
if score >= «BLANK»:
    print("HIGH RISK")
else:
    print("OK")`,
    answer:   "70",
    hint:     "Scores of 70 and above are labelled HIGH RISK. The threshold number is 70",
    expected: "HIGH RISK",
  },

  "l3-s3": {
    label:    "Which operator checks if two values are EXACTLY equal?",
    code:
`status = "blocked"
print(status «BLANK» "blocked")`,
    answer:   "==",
    hint:     "Single = assigns. Double == compares. You need double equals to check equality",
    expected: "True",
  },

  "l3-s4": {
    label:    "Which keyword requires BOTH conditions to be True?",
    code:
`score = 75
new_device = True
if score >= 70 «BLANK» new_device:
    print("ESCALATE")`,
    answer:   "and",
    hint:     "'and' requires both conditions to be True at the same time. 'or' only needs one",
    expected: "ESCALATE",
  },

  "l3-s5": {
    label:    "What does label_risk(65, malware=True) return?",
    code:
`def label_risk(score, malware=False):
    if score >= 90: return "CRITICAL"
    if score >= 70 or malware: return "HIGH"
    if score >= 40: return "MEDIUM"
    return "LOW"

print(label_risk(65, malware=«BLANK»))`,
    answer:   "True",
    hint:     "malware=True makes the 'or malware' condition True — so the result is HIGH even though score=65 is below 70",
    expected: "HIGH",
  },

  // ══════════════════════════════════════════════════════════════
  // LESSON 4 Loops
  // ══════════════════════════════════════════════════════════════

  // s1 — intro, no code blank

  "l4-s2": {
    label:    "Type the stop value for range() to include event 10",
    code:
`for i in range(1, «BLANK»):
    print("Event:", i)`,
    answer:   "11",
    hint:     "range(1, 11) gives 1 through 10. The stop is always excluded — add 1 to the last value you want",
    expected: "Event: 1\nEvent: 2\nEvent: 3\nEvent: 4\nEvent: 5\nEvent: 6\nEvent: 7\nEvent: 8\nEvent: 9\nEvent: 10",
  },

  "l4-s3": {
    label:    "What does 9 % 3 equal? (type just the number)",
    code:
`print(9 % «BLANK»)`,
    answer:   "3",
    hint:     "9 % 3 = 0 because 9 divides exactly by 3 with zero remainder. Type the divisor: 3",
    expected: "0",
  },

  "l4-s4": {
    label:    "Type the += shorthand that adds score to total",
    code:
`total  = 0
scores = [20, 50, 30]
for score in scores:
    total «BLANK» score
print(total)`,
    answer:   "+=",
    hint:     "+= is the accumulator shorthand. total += score means total = total + score",
    expected: "100",
  },

  "l4-s5": {
    label:    "Type the start value so enumerate numbers events from 1",
    code:
`scores = [88, 42, 96]
for idx, score in enumerate(scores, start=«BLANK»):
    print(f"Event {idx}: {score}")`,
    answer:   "1",
    hint:     "start=1 makes the first index 1 instead of 0. Without it you would see Event 0, Event 1...",
    expected: "Event 1: 88\nEvent 2: 42\nEvent 3: 96",
  },

  "l4-s6": {
    label:    "Which keyword exits a loop immediately?",
    code:
`for i in range(1, 6):
    if i == 3:
        «BLANK»
    print(i)`,
    answer:   "break",
    hint:     "break exits the entire loop immediately. continue would only skip iteration 3 and keep looping",
    expected: "1\n2",
  },

  // ══════════════════════════════════════════════════════════════
  // LESSON 5 Functions
  // ══════════════════════════════════════════════════════════════

  "l5-s2": {
    label:    "Type the keyword that starts a function definition",
    code:
`«BLANK» greet(name):
    return "Hello, " + name

print(greet("Ava"))`,
    answer:   "def",
    hint:     "All function definitions start with the keyword: def",
    expected: "Hello, Ava",
  },

  "l5-s3": {
    label:    "Which keyword sends a value back from a function?",
    code:
`def double(x):
    «BLANK» x * 2

print(double(10))`,
    answer:   "return",
    hint:     "Use 'return' to send a value back. Without it the function returns None",
    expected: "20",
  },

  "l5-s4": {
    label:    "Type the HIGH threshold for label_risk",
    code:
`def label_risk(risk):
    if risk >= «BLANK»:
        return "HIGH"
    return "OK"

print(label_risk(75))`,
    answer:   "70",
    hint:     "Scores of 70 and above are labelled HIGH",
    expected: "HIGH",
  },

  // ══════════════════════════════════════════════════════════════
  // LESSON 6 Lists
  // ══════════════════════════════════════════════════════════════

  "l6-s2": {
    label:    "Access the LAST item using a negative index",
    code:
`scores = [15, 42, 88, 73, 60, 95]
print(scores[«BLANK»])`,
    answer:   "-1",
    hint:     "In Python, index -1 always refers to the last item in any list",
    expected: "95",
  },

  "l6-s3": {
    label:    "Which built-in adds all values in a list?",
    code:
`scores = [15, 42, 88]
print(«BLANK»(scores))`,
    answer:   "sum",
    hint:     "The built-in function that totals all list values is sum()",
    expected: "145",
  },

  "l6-s4": {
    label:    "Type the HIGH risk threshold used in the counter",
    code:
`scores = [15, 88, 73]
count = 0
for s in scores:
    if s >= «BLANK»:
        count += 1
print("HIGH:", count)`,
    answer:   "70",
    hint:     "Scores of 70 or above are counted as HIGH risk",
    expected: "HIGH: 2",
  },

  // ══════════════════════════════════════════════════════════════
  // LESSON 7 Dictionaries
  // ══════════════════════════════════════════════════════════════

  "l7-s2": {
    label:    'Access the "owner" field from the dictionary',
    code:
`device = {"owner": "Ava", "risk": 42}
print(device[«BLANK»])`,
    answer:   '"owner"',
    hint:     'Dictionary keys need quotes inside []. Type: "owner"',
    expected: "Ava",
  },

  "l7-s3": {
    label:    "Which method returns a default instead of crashing on a missing key?",
    code:
`device = {"owner": "Ava"}
print(device.«BLANK»("ip", "unknown"))`,
    answer:   "get",
    hint:     "The safe access method that won't crash on missing keys is .get()",
    expected: "unknown",
  },

  "l7-s4": {
    label:    "Which method gives you all key-value pairs to loop through?",
    code:
`device = {"owner": "Ava", "risk": 42}
for k, v in device.«BLANK»():
    print(k, ":", v)`,
    answer:   "items",
    hint:     ".items() returns each (key, value) pair — unpack with: for k, v in d.items()",
    expected: "owner : Ava\nrisk : 42",
  },

  // ══════════════════════════════════════════════════════════════
  // LESSON 8 Strings
  // ══════════════════════════════════════════════════════════════

  "l8-s2": {
    label:    "Type the method name that converts a string to lowercase",
    code:
`log = "FAILED Login"
clean = log.«BLANK»()
print(clean)`,
    answer:   "lower",
    hint:     "The string method that converts all characters to lowercase is .lower()",
    expected: "failed login",
  },

  "l8-s3": {
    label:    "Type the method that splits a string into a list of words",
    code:
`line = "failed login from ip"
words = line.«BLANK»()
print(words[0])`,
    answer:   "split",
    hint:     ".split() with no arguments splits on whitespace and returns a list of words",
    expected: "failed",
  },

  "l8-s4": {
    label:    'Type the keyword that checks if "failed" is in the list',
    code:
`words = ["failed", "login", "from"]
print("failed" «BLANK» words)`,
    answer:   "in",
    hint:     'The membership operator that checks if an item exists in a sequence is "in"',
    expected: "True",
  },

  // ══════════════════════════════════════════════════════════════
  // LESSON 9 Exceptions
  // ══════════════════════════════════════════════════════════════

  "l9-s2": {
    label:    "Which exception does int('N/A') raise?",
    code:
`try:
    x = int("N/A")
except «BLANK»:
    print("Caught it!")`,
    answer:   "ValueError",
    hint:     "Converting a non-numeric string with int() raises a ValueError",
    expected: "Caught it!",
  },

  "l9-s3": {
    label:    "Type the keyword that catches errors after try:",
    code:
`try:
    x = int("N/A")
«BLANK» ValueError:
    print("Bad value")`,
    answer:   "except",
    hint:     "The keyword that catches errors after 'try:' is 'except'",
    expected: "Bad value",
  },

  "l9-s4": {
    label:    "Type the keyword for the block that ALWAYS runs",
    code:
`try:
    x = int("10")
except ValueError:
    print("Error")
«BLANK»:
    print("Always runs")`,
    answer:   "finally",
    hint:     "'finally' runs after try/except regardless of success or failure",
    expected: "Always runs",
  },

  // ══════════════════════════════════════════════════════════════
  // LESSON 10 Capstone
  // ══════════════════════════════════════════════════════════════

  "l10-s3": {
    label:    "Which string method normalizes the log line before keyword matching?",
    code:
`def score_event(text):
    t = text.«BLANK»()
    if "failed" in t:
        return 50
    return 10

print(score_event("FAILED login"))`,
    answer:   "lower",
    hint:     "Always normalize with .lower() so 'FAILED' and 'failed' match the same keyword",
    expected: "50",
  },

  "l10-s4": {
    label:    "Which built-in sorts a list? (add reverse=True after for highest first)",
    code:
`events = [{"risk":50},{"risk":90},{"risk":10}]
ranked = «BLANK»(events, key=lambda e: e["risk"], reverse=True)
print(ranked[0]["risk"])`,
    answer:   "sorted",
    hint:     "The sorted() built-in returns a new sorted list without modifying the original",
    expected: "90",
  },
};

/**
 * Get inline Try-Me data for a specific lesson section.
 * @param {string} lessonId   e.g. "l1"
 * @param {string} sectionId  e.g. "s2"
 * @returns {object|null}
 */
export function getInlineTryMe(lessonId, sectionId) {
  if (!lessonId || !sectionId) return null;
  const hy = `${lessonId}-${sectionId}`;
  const co = `${lessonId}:${sectionId}`;
  return inlineTryMeData[hy] || inlineTryMeData[co] || null;
}
