export const tryMeL9 = {
  lessonId: "l9",
  ttsIntro:
    "Welcome to Lesson 9: Debugging and Exceptions. Real security data is always messy. Fields are missing, values say N-slash-A. In this lesson you will use try and except to catch errors gracefully and keep your program running no matter what arrives.",
  sections: [
    {
      id: "s1",
      icon: "🛡️",
      heading: "Real Data Is Messy",
      body: "Security tools ingest data from CSV files, network scanners, and APIs — all messy. A tool that crashes on bad input stops protecting. The try and except pattern catches errors before they crash your program.",
      code: null,
      tryMe: null,
      tip: null,
    },
    {
      id: "s2",
      icon: "💥",
      heading: "What Happens Without Exception Handling",
      body: "If you convert a non-numeric string to int, Python raises a ValueError and stops the program. Without a try-except block, one bad value kills the entire processing run.",
      code: `value = "N/A"
x = int(value)          # ValueError — program stops
print("x * 5 =", x * 5)  # never runs`,
      tryMe: {
        starter: `value = "N/A"
x = int(value)
print("x * 5 =", x * 5)
print("This line never runs")`,
        expectedOutput: "ValueError: invalid literal for int() with base 10: 'N/A'",
        hint: "The program crashes on line 2. In the browser runner the error may appear in the error panel instead of stdout.",
      },
      tip: null,
    },
    {
      id: "s3",
      icon: "🛡️",
      heading: "try / except Pattern",
      body: "Wrap failing code in a try block. If an error occurs Python jumps to the except block instead of crashing. Execution continues normally after. Always specify the exception type — ValueError for bad conversions, ZeroDivisionError for division by zero.",
      code: `value = "N/A"

try:
    x = int(value)
    print("x * 5 =", x * 5)
except ValueError:
    print("Error: not a valid number:", value)

print("Program continues here")`,
      tryMe: {
        starter: `for value in ["10","N/A","88","null","42"]:
    try:
        x = int(value)
        print(f"  OK  {value} → x*5 = {x*5}")
    except ValueError:
        print(f"  SKIP '{value}' — not a number")`,
        expectedOutput:
          "  OK  10 → x*5 = 50\n  SKIP 'N/A' — not a number\n  OK  88 → x*5 = 440\n  SKIP 'null' — not a number\n  OK  42 → x*5 = 210",
        hint: "Valid numbers are processed. Invalid strings are skipped. The loop never crashes — all five values are handled.",
      },
      tip: "Always name the exception type. Bare except silently catches everything including bugs in your own code.",
    },
    {
      id: "s4",
      icon: "🔁",
      heading: "finally — Always Runs",
      body: "The finally block runs after try and except regardless of success or failure. Use it for cleanup: closing files, logging completion, resetting state. It is your guarantee that certain code always executes.",
      code: `def process_value(raw):
    try:
        x = int(raw)
        print(f"  Result: {x * 10}")
    except ValueError:
        print(f"  Skipped: '{raw}'")
    finally:
        print("  [log] done")  # always runs

process_value("45")   # succeeds
process_value("N/A")  # fails — finally still runs`,
      tryMe: {
        starter: `def process_value(raw):
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
        expectedOutput:
          "Input: 45\n  Result: 450\n  [log] processed: 45\n\nInput: N/A\n  Skipped: not a number\n  [log] processed: N/A\n\nInput: 88\n  Result: 880\n  [log] processed: 88\n\nInput: ??\n  Skipped: not a number\n  [log] processed: ??\n\n",
        hint: "The log line in finally runs for every input — success or failure. This guarantees every event is logged.",
      },
      tip: null,
    },
  ],
};
