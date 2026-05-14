export const lab5 = {
  lessonId: "l5",
  title: "Lab 5: Functions",
  subtitle: "Risk Scoring Functions",
  estimatedMinutes: 35,
  objectives: [
    "Define functions with def, parameters, and return.",
    "Call functions with different arguments and capture return values.",
    "Compose two functions (pass one's output to another's input).",
    "Explain the difference between return and print.",
  ],
  intro: `A real security system doesn't copy-paste its scoring logic everywhere.
It defines score_login() once and calls it wherever needed. In this lab you
build two functions, test them independently, then compose them — the foundation
of modular, professional Python.`,
  exercises: [
    {
      id: "e1",
      title: "Exercise 1 — Define and call a simple function",
      prompt: `Define a function called greet_analyst(name) that returns the string:
"Welcome, <name>. System is online."

Then call it with two different names and print the results.`,
      starter: `# Exercise 1: Define and call a function
def greet_analyst(???):
    return f"Welcome, {???}. System is online."

# Call the function with two different names
print(greet_analyst(???))
print(greet_analyst(???))`,
      hints: [
        "def greet_analyst(name): — name is the parameter.",
        "Inside the function, use name in the f-string.",
        'Call it: greet_analyst("Ava") — put the name in quotes as an argument.',
      ],
      solution: `def greet_analyst(name):
    return f"Welcome, {name}. System is online."

print(greet_analyst("Ava"))
print(greet_analyst("Marcus"))`,
      expectedOutput: `Welcome, Ava. System is online.
Welcome, Marcus. System is online.`,
      afterNote:
        "The function body runs only when called. Define once, call many times with different arguments — that's the power of functions.",
    },
    {
      id: "e2",
      title: "Exercise 2 — Build the risk scoring function",
      prompt: `Define score_login_attempt(fails, new_device):
  • Each failed attempt adds 20 to risk.
  • An unknown device (new_device = True) adds 30 more.
  • Cap the score at 100.
  • Return the final risk score.

Test it with three combinations.`,
      starter: `# Exercise 2: Risk scoring function
def score_login_attempt(fails, new_device):
    risk = fails * ???

    if new_device:
        risk = risk + ???

    if risk > 100:
        risk = ???

    return risk

# Test cases
print(score_login_attempt(1, False))   # expect: 20
print(score_login_attempt(2, True))    # expect: 70
print(score_login_attempt(4, True))    # expect: 100 (capped)`,
      hints: [
        "Each fail adds 20: risk = fails * 20.",
        "Unknown device adds 30: risk = risk + 30.",
        "Cap: if risk > 100: risk = 100.",
        "Don't forget return risk at the end.",
      ],
      solution: `def score_login_attempt(fails, new_device):
    risk = fails * 20
    if new_device:
        risk = risk + 30
    if risk > 100:
        risk = 100
    return risk

print(score_login_attempt(1, False))
print(score_login_attempt(2, True))
print(score_login_attempt(4, True))`,
      expectedOutput: `20
70
100`,
      afterNote:
        "Notice how the function returns a number — not just prints it. This means you can store the result: my_risk = score_login_attempt(2, True) and use it later.",
    },
    {
      id: "e3",
      title: "Exercise 3 — Build the label function",
      prompt: `Define label_risk(risk) that returns:
  • "HIGH"   if risk >= 70
  • "MEDIUM" if risk >= 40
  • "LOW"    otherwise

This function takes a number and returns a string label.`,
      starter: `# Exercise 3: Label function
def label_risk(risk):
    if risk >= ???:
        return "HIGH"
    elif risk >= ???:
        return "MEDIUM"
    else:
        return ???

# Test
print(label_risk(85))   # HIGH
print(label_risk(50))   # MEDIUM
print(label_risk(15))   # LOW`,
      hints: [
        "HIGH threshold: 70. MEDIUM threshold: 40.",
        'The else branch returns "LOW" — add the quotes.',
        "Test all three to confirm each branch works.",
      ],
      solution: `def label_risk(risk):
    if risk >= 70:
        return "HIGH"
    elif risk >= 40:
        return "MEDIUM"
    else:
        return "LOW"

print(label_risk(85))
print(label_risk(50))
print(label_risk(15))`,
      expectedOutput: `HIGH
MEDIUM
LOW`,
      afterNote:
        "A function that maps a number to a category is called a classifier. label_risk() is a simple rule-based classifier — exactly what early AI/ML threat models are built on.",
    },
    {
      id: "e4",
      title: "Exercise 4 — Compose both functions into a full analysis",
      prompt: `Now use both functions together. For each test case:
  1. Call score_login_attempt() to get the risk score.
  2. Pass that score to label_risk() to get the label.
  3. Print a formatted line.

Then wrap this in a function called analyze_login(fails, new_device) 
that returns a dict: {"risk": ..., "label": ...}`,
      starter: `# Exercise 4: Compose functions
def analyze_login(fails, new_device):
    risk  = ???(fails, new_device)   # call score function
    label = ???(risk)                # call label function
    return {"risk": risk, "label": label}

# Run 4 test cases
cases = [(1,False),(2,True),(3,False),(4,True)]

for fails, nd in cases:
    result = analyze_login(fails, nd)
    print(f"fails={fails} nd={nd}  →  risk={result[???]} label={result[???]}")`,
      hints: [
        "Call score_login_attempt(fails, new_device) to get the risk.",
        "Call label_risk(risk) to get the label.",
        'result["risk"] and result["label"] access the dictionary.',
      ],
      solution: `def analyze_login(fails, new_device):
    risk  = score_login_attempt(fails, new_device)
    label = label_risk(risk)
    return {"risk": risk, "label": label}

cases = [(1,False),(2,True),(3,False),(4,True)]

for fails, nd in cases:
    result = analyze_login(fails, nd)
    print(f"fails={fails} nd={nd}  →  risk={result['risk']} label={result['label']}")`,
      expectedOutput: `fails=1 nd=False  →  risk=20 label=LOW
fails=2 nd=True   →  risk=70 label=HIGH
fails=3 nd=False  →  risk=60 label=MEDIUM
fails=4 nd=True   →  risk=100 label=HIGH`,
      afterNote:
        "analyze_login() composes two smaller functions. This pattern — small functions that do one thing, composed into larger ones — is the foundation of clean, professional code.",
    },
  ],
  wrapUp: {
    message:
      "Lab 5 complete! You can now define functions, pass arguments, capture return values, and compose functions. This is the most important skill in the entire course.",
    nextLesson: "Next up: Lesson 6 — storing and analyzing collections with lists.",
    keyTakeaways: [
      "def creates a function. Parameters are the placeholders in the definition.",
      "Arguments are the real values you pass when calling the function.",
      "return sends a value back — don't just print inside functions.",
      "Function composition: pass one function's return value into another.",
      "Returning a dict lets a function send back multiple values at once.",
    ],
  },
};
