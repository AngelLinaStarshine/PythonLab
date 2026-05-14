export const tryMeL4 = {
  lessonId: "l4",
  ttsIntro:
    "Welcome to Lesson 4: Loops. Security tools loop through thousands of events and apply rules to each one automatically. In this lesson you will write for loops with range, accumulate counters, and use the modulo operator.",
  sections: [
    {
      id: "s1",
      icon: "🛡️",
      heading: "Loops Equal Automated Log Scanning",
      body: "A security analyst cannot manually review ten thousand log entries every morning. Automated tools loop through every event and apply rules. A loop lets you repeat the same check on every item without rewriting the code.",
      code: null,
      tryMe: null,
      tip: null,
    },
    {
      id: "s2",
      icon: "🔄",
      heading: "The for Loop with range()",
      body: "range generates a sequence of numbers from a start up to but not including a stop. The loop variable takes each value in turn, and the indented body runs once per value. The most common mistake is the off-by-one error: range one comma ten gives one through nine, not ten.",
      code: `for event_id in range(1, 11):
    print("Scanning event:", event_id)
# Prints: 1, 2, 3 ... 10
# range(1, 11): start=1 included, stop=11 excluded`,
      tryMe: {
        starter: `for i in range(1, 6):
    print("Event:", i)
print("Done")`,
        expectedOutput: "Event: 1\nEvent: 2\nEvent: 3\nEvent: 4\nEvent: 5\nDone",
        hint: "range(1, 6) gives 1 through 5 — five values. Change 6 to 11 to scan 10 events.",
      },
      tip: null,
    },
    {
      id: "s3",
      icon: "%",
      heading: "The Modulo Operator",
      body: "Modulo gives you the remainder after division. If the remainder is zero, the number divides evenly — it is divisible. If event ID modulo three equals zero, every third event is flagged. This pattern appears constantly in data processing.",
      code: `print(9 % 3)    # 0  — divisible
print(10 % 3)   # 1  — not divisible
print(7 % 2)    # 1  — odd number`,
      tryMe: {
        starter: `for n in range(1, 11):
    if n % 3 == 0:
        print(f"{n} is divisible by 3")
    else:
        print(f"{n} — skip")`,
        expectedOutput:
          "1 — skip\n2 — skip\n3 is divisible by 3\n4 — skip\n5 — skip\n6 is divisible by 3\n7 — skip\n8 — skip\n9 is divisible by 3\n10 — skip",
        hint: "Try changing the rule to % 5 == 0 to find multiples of 5.",
      },
      tip: null,
    },
    {
      id: "s4",
      icon: "🔢",
      heading: "Counting Inside a Loop",
      body: "Create a counter variable before the loop with a value of zero. Increment it inside the loop each time your condition is met. After the loop, the counter holds the total. A critical mistake is initialising the counter inside the loop — that resets it every iteration.",
      code: `suspicious_count = 0   # BEFORE the loop

for event_id in range(1, 11):
    if event_id % 3 == 0:
        print("Suspicious:", event_id)
        suspicious_count += 1

print("Total:", suspicious_count)  # 3`,
      tryMe: {
        starter: `high_count = 0
low_count  = 0
scores = [88, 15, 72, 43, 95, 22, 67]

for score in scores:
    if score >= 70:
        high_count += 1
    elif score < 40:
        low_count += 1

print(f"High: {high_count}")
print(f"Low:  {low_count}")`,
        expectedOutput: "High: 3\nLow:  2",
        hint: "88, 72, 95 are >= 70. 15, 22 are < 40. 43 and 67 are medium — neither counter changes.",
      },
      tip: null,
    },
  ],
};
