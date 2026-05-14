export const tryMeL5 = {
  lessonId: "l5",
  ttsIntro:
    "Welcome to Lesson 5: Functions. A real security system defines a scoring function once and calls it everywhere. In this lesson you will define functions with parameters and return values, call them with different arguments, and compose two functions together.",
  sections: [
    {
      id: "s1",
      icon: "🛡️",
      heading: "Functions Equal Reusable Security Logic",
      body: "A real security system has hundreds of functions — score login, detect anomaly, label risk. Functions wrap logic under a name. Define once, call many times with different inputs. If the scoring rule changes, update it in one place and everything using it automatically improves.",
      code: null,
      tryMe: null,
      tip: null,
    },
    {
      id: "s2",
      icon: "🏗️",
      heading: "Defining a Function",
      body: "The def keyword starts a function. After def comes the name, then parentheses with parameter names. The body is indented. The return keyword sends a value back to the caller. Without return a function gives back None — a very common source of bugs.",
      code: `def greet_analyst(name):
    message = f"Welcome, {name}. System online."
    return message

result = greet_analyst("Ava")
print(result)`,
      tryMe: {
        starter: `def double_score(score):
    return score * 2

print(double_score(30))
print(double_score(45))
print(double_score(50))`,
        expectedOutput: "60\n90\n100",
        hint: "The function runs its body once per call with the value you passed. Try passing 100 and predict the output.",
      },
      tip: null,
    },
    {
      id: "s3",
      icon: "⚙️",
      heading: "The Risk Scoring Function",
      body: "The score login attempt function takes two parameters: failed login count and whether the device is new. Each fail adds twenty points. A new device adds thirty. The score is capped at one hundred. It returns the value — not just prints it — so the caller can store and reuse it.",
      code: `def score_login_attempt(fails, new_device):
    risk = fails * 20
    if new_device:
        risk = risk + 30
    if risk > 100:
        risk = 100
    return risk

print(score_login_attempt(1, False))  # 20
print(score_login_attempt(2, True))   # 70
print(score_login_attempt(4, True))   # 100`,
      tryMe: {
        starter: `def score_login_attempt(fails, new_device):
    risk = fails * 20
    if new_device: risk += 30
    return min(risk, 100)

my_risk = score_login_attempt(2, True)
print("Risk:", my_risk)
print("Doubled:", my_risk * 2)
print("Is high?", my_risk >= 70)`,
        expectedOutput: "Risk: 70\nDoubled: 140\nIs high? True",
        hint: "The function returns a number you can store and use. Try score_login_attempt(3, False) — what do you predict?",
      },
      tip: "return sends a value back; print only displays it. A function that returns is a building block. A function that only prints is a dead end.",
    },
    {
      id: "s4",
      icon: "🔗",
      heading: "Composing Functions",
      body: "Composition means passing one function's output as another's input. Define score and label as separate small functions, each doing one thing, then call them in sequence. This keeps each function testable and the whole system easy to understand.",
      code: `def score_login_attempt(fails, new_device):
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
      tryMe: {
        starter: `def score_login_attempt(fails, new_device):
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
        expectedOutput:
          "fails=1 nd=False → 20 [LOW]\nfails=2 nd=True → 70 [HIGH]\nfails=3 nd=False → 60 [MEDIUM]\nfails=4 nd=True → 100 [HIGH]",
        hint: "Change a fails value or nd value and predict the output before running.",
      },
      tip: null,
    },
  ],
};
