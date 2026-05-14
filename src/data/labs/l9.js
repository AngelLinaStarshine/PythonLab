export const lab9 = {
  lessonId: "l9",
  title: "Lab 9: Debugging & Exceptions",
  subtitle: "Safe Data Cleaning",
  estimatedMinutes: 30,
  objectives: [
    "Use try/except to catch ValueError and TypeError.",
    "Provide meaningful error messages instead of stack traces.",
    "Use finally for cleanup code that always runs.",
    "Build a safe batch data cleaner that handles bad rows without stopping.",
  ],
  intro: `Real security data comes from CSV exports, API responses, and network scanners —
and it's always messy. Empty fields, 'N/A' where a number should be, null values,
malformed IPs. A professional tool handles all of this without crashing.
In this lab you add that armor to your code.`,
  exercises: [
    {
      id: "e1",
      title: "Exercise 1 — Catch a ValueError safely",
      prompt: `The code below crashes when value = "N/A". Wrap it in try/except to:
  • Print x * 5 if the conversion succeeds.
  • Print a friendly error message if it fails.

Test with value = "10" (should work) and value = "N/A" (should be caught).`,
      starter: `# Exercise 1: Catch ValueError
value = "N/A"

try:
    x = ???(value)
    print("x * 5 =", x * 5)
except ???:
    print("Error: expected a number, got:", value)`,
      hints: [
        "int(value) — the conversion that can fail.",
        "except ValueError: — catches the specific error int() raises on non-numeric input.",
        'Change value to "10" to see the success path.',
      ],
      solution: `value = "N/A"

try:
    x = int(value)
    print("x * 5 =", x * 5)
except ValueError:
    print("Error: expected a number, got:", value)`,
      expectedOutput: "Error: expected a number, got: N/A",
      afterNote:
        "Always name a specific exception type (ValueError) rather than bare except:. Named exceptions only catch what you expect — bare except: silently swallows everything, including bugs.",
    },
    {
      id: "e2",
      title: "Exercise 2 — Handle multiple exception types",
      prompt: `This function can fail in two ways:
  1. ValueError — if the string isn't a number
  2. ZeroDivisionError — if the number is 0

Add two except clauses — one for each error — with different messages.
Test with: "0", "N/A", "50".`,
      starter: `# Exercise 2: Multiple exception types
def safe_divide(raw_value, total=100):
    try:
        n      = int(raw_value)
        result = total / n
        return f"{result:.1f}"
    except ???:
        return "Error: not a valid number"
    except ???:
        return "Error: cannot divide by zero"

print(safe_divide("50"))   # 2.0
print(safe_divide("N/A"))  # Error: not a valid number
print(safe_divide("0"))    # Error: cannot divide by zero`,
      hints: [
        "except ValueError: catches int('N/A').",
        "except ZeroDivisionError: catches 100 / 0.",
        "Each except clause handles a different failure mode.",
      ],
      solution: `def safe_divide(raw_value, total=100):
    try:
        n      = int(raw_value)
        result = total / n
        return f"{result:.1f}"
    except ValueError:
        return "Error: not a valid number"
    except ZeroDivisionError:
        return "Error: cannot divide by zero"

print(safe_divide("50"))
print(safe_divide("N/A"))
print(safe_divide("0"))`,
      expectedOutput: `2.0
Error: not a valid number
Error: cannot divide by zero`,
      afterNote:
        "Multiple except clauses are like elif chains — each one handles a specific failure type. The first matching except runs; the rest are skipped.",
    },
    {
      id: "e3",
      title: "Exercise 3 — Use finally for cleanup",
      prompt: `finally always runs — whether the try succeeded or an exception was caught.
It's used for cleanup: logging, closing files, printing status.

Complete the function so that "Processing complete" always prints,
regardless of whether the conversion succeeded or failed.`,
      starter: `# Exercise 3: finally for guaranteed cleanup
def process_value(raw):
    print(f"Processing: '{raw}'")
    try:
        x = int(raw)
        print(f"  Result: {x * 10}")
    except ValueError:
        print(f"  Skipped: '{raw}' is not a number")
    ???:
        print("  Processing complete")
        print()

rows = ["45", "N/A", "88", "unknown", "12"]
for row in rows:
    process_value(row)`,
      hints: [
        "The finally keyword goes after the except block.",
        "finally: — no condition needed.",
        "Everything inside finally runs on every call, success or failure.",
      ],
      solution: `def process_value(raw):
    print(f"Processing: '{raw}'")
    try:
        x = int(raw)
        print(f"  Result: {x * 10}")
    except ValueError:
        print(f"  Skipped: '{raw}' is not a number")
    finally:
        print("  Processing complete")
        print()

rows = ["45", "N/A", "88", "unknown", "12"]
for row in rows:
    process_value(row)`,
      expectedOutput: `Processing: '45'
  Result: 450
  Processing complete

Processing: 'N/A'
  Skipped: 'N/A' is not a number
  Processing complete

Processing: '88'
  Result: 880
  Processing complete

Processing: 'unknown'
  Skipped: 'unknown' is not a number
  Processing complete

Processing: '12'
  Result: 120
  Processing complete

`,
      afterNote:
        "finally is essential for resource management — if you open a file, finally guarantees it gets closed even if the code inside crashes.",
    },
    {
      id: "e4",
      title: "Exercise 4 — Safe batch data cleaner",
      prompt: `You have a raw threat feed as a list of strings — some valid, some broken.
Build a clean_feed(raw_list) function that:
  1. Tries to convert each value to int.
  2. Skips invalid values (catches ValueError) and logs them.
  3. Returns {"clean": [...valid ints...], "skipped": [...invalid strings...]}`,
      starter: `# Exercise 4: Batch data cleaner
def clean_feed(raw_list):
    clean   = []
    skipped = []

    for item in raw_list:
        try:
            value = int(item.strip())   # strip() removes accidental spaces
            ???.???(value)              # add to clean list
        except ValueError:
            ???.???(item)              # add to skipped list

    return {"clean": clean, "skipped": skipped}

raw = ["45", " 88 ", "N/A", "73", "null", "12", "??", "60"]
result = clean_feed(raw)

print("Clean values  :", result["clean"])
print("Skipped values:", result["skipped"])
print(f"Kept {len(result['clean'])} of {len(raw)} records")
print(f"Average risk  : {sum(result['clean']) / len(result['clean']):.1f}")`,
      hints: [
        "clean.append(value) adds the valid integer to the clean list.",
        "skipped.append(item) records the problematic raw string.",
        ".strip() removes spaces from both ends — e.g. ' 88 ' becomes '88'.",
      ],
      solution: `def clean_feed(raw_list):
    clean   = []
    skipped = []

    for item in raw_list:
        try:
            value = int(item.strip())
            clean.append(value)
        except ValueError:
            skipped.append(item)

    return {"clean": clean, "skipped": skipped}

raw = ["45", " 88 ", "N/A", "73", "null", "12", "??", "60"]
result = clean_feed(raw)

print("Clean values  :", result["clean"])
print("Skipped values:", result["skipped"])
print(f"Kept {len(result['clean'])} of {len(raw)} records")
print(f"Average risk  : {sum(result['clean']) / len(result['clean']):.1f}")`,
      expectedOutput: `Clean values  : [45, 88, 73, 12, 60]
Skipped values: ['N/A', 'null', '??']
Kept 5 of 8 records
Average risk  : 55.6`,
      afterNote:
        "clean_feed() is a production-quality ETL (Extract, Transform, Load) function. It processes an entire dataset, handles every error gracefully, and reports on data quality — all in under 10 lines.",
    },
  ],
  wrapUp: {
    message:
      "Lab 9 complete! Your code can now handle messy real-world data without crashing. This is what separates student code from production code.",
    nextLesson: "Next up: Lesson 10 — the Capstone. You'll combine every skill into a full SOC dashboard.",
    keyTakeaways: [
      "try/except catches errors and prevents crashes.",
      "Always name the specific exception (ValueError, ZeroDivisionError, etc.).",
      "finally always runs — use it for cleanup and logging.",
      ".strip() removes leading/trailing whitespace from string input.",
      "Batch processing: loop + try/except = robust data pipeline.",
    ],
  },
};
