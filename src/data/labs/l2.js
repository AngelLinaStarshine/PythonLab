export const lab2 = {
  lessonId: "l2",
  title: "Lab 2: Input & Output",
  subtitle: "Phishing Message Collector",
  estimatedMinutes: 25,
  objectives: [
    "Collect string input from a user with input().",
    "Convert typed input to int and float using type conversion.",
    "Format and print a clean intake report.",
    "Understand why skipping conversion causes a TypeError.",
  ],
  intro: `Security intake forms are everywhere — reporting a phishing email, flagging a
suspicious attachment, escalating an incident. Behind each form is code that reads
what you typed, converts it to the right type, and stores it. In this lab you build that.`,
  exercises: [
    {
      id: "e1",
      title: "Exercise 1 — Collect a suspicious message",
      prompt: `Use input() to ask for a suspicious message and store it in a variable called msg.
Then print the message back with a label.

Note: input() always returns a string — no conversion needed here.`,
      starter: `# Exercise 1: Collect a suspicious message
msg = input("Paste suspicious message: ")

# Print it back with a label
print(???)`,
      hints: [
        'print("message:", msg)  — use a comma to separate the label from the variable.',
        'Or use an f-string: print(f"Message: {msg}")',
      ],
      solution: `msg = input("Paste suspicious message: ")
print("message:", msg)`,
      expectedOutput: "message: Buy crypto now — click here!",
      afterNote:
        "input() pauses the program and waits for the user to type. Whatever they type becomes a string stored in msg.",
    },
    {
      id: "e2",
      title: "Exercise 2 — Collect and convert a risk score",
      prompt: `Ask the user for a risk score (0–100). Store it as an integer.
Then prove it's an integer by doing math on it: print risk + 10.

If you skip int(), you'll get a TypeError when you try risk + 10.`,
      starter: `# Exercise 2: Collect a numeric risk score
risk = ???(input("Risk score 0-100: "))

# Prove it's an int — this only works if conversion was done
print("risk:", risk)
print("risk + 10:", risk + 10)`,
      hints: [
        "input() returns a string. To do math, wrap it: int(input(...))",
        'risk = int(input("Risk score 0-100: "))  ← this is the pattern.',
        "If you see TypeError: can only concatenate str, you forgot int().",
      ],
      solution: `risk = int(input("Risk score 0-100: "))
print("risk:", risk)
print("risk + 10:", risk + 10)`,
      expectedOutput: `risk: 72
risk + 10: 82`,
      afterNote:
        "The int() wraps around input() — they nest together. Python runs the inner function first (input), then passes the result to the outer (int).",
    },
    {
      id: "e3",
      title: "Exercise 3 — Collect a confidence percentage (float)",
      prompt: `Some threat scores are probabilities: 0.0 to 1.0.
Ask the user for a confidence score and store it as a float.
Then print it as a percentage by multiplying by 100.`,
      starter: `# Exercise 3: Collect a float confidence score
confidence = ???(input("Confidence 0.0-1.0: "))

percentage = confidence * 100
print(f"Confidence: {percentage:.1f}%")`,
      hints: [
        "Use float() instead of int() for decimal numbers.",
        'confidence = float(input("Confidence 0.0-1.0: "))',
        ":.1f in the f-string rounds the float to 1 decimal place.",
      ],
      solution: `confidence = float(input("Confidence 0.0-1.0: "))
percentage = confidence * 100
print(f"Confidence: {percentage:.1f}%")`,
      expectedOutput: "Confidence: 87.5%",
      afterNote:
        ":.1f is f-string formatting syntax. The colon starts the format spec, .1 means one decimal place, and f means float. You can use .2f for two decimal places.",
    },
    {
      id: "e4",
      title: "Exercise 4 — Build the full intake report",
      prompt: `Combine all three inputs into one phishing intake report.
Collect: message (str), risk score (int), and confidence (float).
Print a formatted report that looks like the target output below.

Target output:
  ╔══ PHISHING INTAKE REPORT ══╗
  Message    : Buy crypto now!
  Risk Score : 72 / 100
  Confidence : 87.5%
  Status     : HIGH RISK`,
      starter: `# Exercise 4: Full phishing intake report
msg        = input("Suspicious message: ")
risk       = ???(input("Risk score 0-100: "))
confidence = ???(input("Confidence 0.0-1.0: "))

status = "HIGH RISK" if risk >= 70 else "MEDIUM" if risk >= 40 else "LOW"

print("╔══ PHISHING INTAKE REPORT ══╗")
print(f"Message    : {???}")
print(f"Risk Score : {???} / 100")
print(f"Confidence : {confidence * 100:.1f}%")
print(f"Status     : {???}")`,
      hints: [
        "risk uses int(), confidence uses float().",
        "Replace each ??? in the print statements with the matching variable name.",
        "status is already computed — just use {status} in the f-string.",
      ],
      solution: `msg        = input("Suspicious message: ")
risk       = int(input("Risk score 0-100: "))
confidence = float(input("Confidence 0.0-1.0: "))

status = "HIGH RISK" if risk >= 70 else "MEDIUM" if risk >= 40 else "LOW"

print("╔══ PHISHING INTAKE REPORT ══╗")
print(f"Message    : {msg}")
print(f"Risk Score : {risk} / 100")
print(f"Confidence : {confidence * 100:.1f}%")
print(f"Status     : {status}")`,
      expectedOutput: `╔══ PHISHING INTAKE REPORT ══╗
Message    : Buy crypto now!
Risk Score : 72 / 100
Confidence : 87.5%
Status     : HIGH RISK`,
      afterNote:
        "This is a complete data intake pattern — collect, convert, compute, report. You'll reuse this exact structure in the Capstone.",
    },
  ],
  wrapUp: {
    message:
      "Lab 2 complete! You can now collect any type of user input, convert it correctly, and format it into a professional report.",
    nextLesson: "Next up: Lesson 3 — making decisions with if/elif/else.",
    keyTakeaways: [
      "input() always returns a string — even if the user types a number.",
      "int(input(...)) converts typed input to an integer in one step.",
      "float(input(...)) converts to a decimal number.",
      "Skipping conversion causes TypeError when you try to do math.",
      ":.1f in an f-string formats a float to 1 decimal place.",
    ],
  },
};
