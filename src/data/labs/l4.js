export const lab4 = {
  lessonId: "l4",
  title: "Lab 4: Loops",
  subtitle: "Log Scanner: Count Alerts",
  estimatedMinutes: 30,
  objectives: [
    "Write for loops with range() to iterate over a sequence of IDs.",
    "Accumulate a counter inside a loop.",
    "Use the modulo operator % to apply periodic rules.",
    "Write a while loop with a break condition.",
  ],
  intro: `A security analyst can't manually review 10,000 log entries. Automated tools
loop through every event, apply rules, and count matches. In this lab you build
that scanning loop, first simple, then progressively more realistic.`,
  exercises: [
    {
      id: "e1",
      title: "Exercise 1, Scan and print event IDs",
      prompt: `Write a for loop that iterates event IDs 1 through 10 and prints each one.
Use range(). Remember: range(start, stop) does not include stop.`,
      starter: `# Exercise 1: Iterate event IDs 1 through 10
for event_id in range(__BLANK__, __BLANK__):
    print("Scanning event:", event_id)`,
      hints: [
        "range(1, 11) gives you 1, 2, 3 ... 10, stop is exclusive.",
        "The loop variable event_id takes each value in turn.",
      ],
      solution: `for event_id in range(1, 11):
    print("Scanning event:", event_id)`,
      expectedOutput: `Scanning event: 1
Scanning event: 2
Scanning event: 3
Scanning event: 4
Scanning event: 5
Scanning event: 6
Scanning event: 7
Scanning event: 8
Scanning event: 9
Scanning event: 10`,
      afterNote:
        "range(1, 11) is the most common off-by-one trap. Always count: does the sequence end at the number I want? If range(1, 10) only reaches 9, add 1 to the stop.",
    },
    {
      id: "e2",
      title: "Exercise 2, Flag and count suspicious events",
      prompt: `Extend the loop: any event divisible by 3 is "suspicious" (our simple rule).
Print those event IDs and count them.

The modulo operator % gives the remainder: 9 % 3 = 0 means 9 is divisible by 3.`,
      starter: `# Exercise 2: Flag events divisible by 3
suspicious_count = __BLANK__   # start the counter outside the loop

for event_id in range(1, 11):
    if event_id % __BLANK__ == 0:
        print("Suspicious event:", event_id)
        suspicious_count = suspicious_count + __BLANK__

print("Total suspicious:", suspicious_count)`,
      hints: [
        "The counter starts at 0, before the loop begins.",
        "event_id % 3 == 0 checks divisibility by 3.",
        "Increment: suspicious_count = suspicious_count + 1  (or += 1).",
        "Events 3, 6, 9 are divisible by 3, expect count = 3.",
      ],
      solution: `suspicious_count = 0

for event_id in range(1, 11):
    if event_id % 3 == 0:
        print("Suspicious event:", event_id)
        suspicious_count = suspicious_count + 1

print("Total suspicious:", suspicious_count)`,
      expectedOutput: `Suspicious event: 3
Suspicious event: 6
Suspicious event: 9
Total suspicious: 3`,
      afterNote:
        "The counter must start at 0 outside the loop. If it were inside, it would reset to 0 every iteration and the final count would always be 0 or 1.",
    },
    {
      id: "e3",
      title: "Exercise 3, Multiple rule tiers in one loop",
      prompt: `Now apply two rules in the same loop:
  • Divisible by 3: SUSPICIOUS
  • Divisible by 5: CRITICAL
  • Everything else: OK

Count each tier separately. Print a summary at the end.`,
      starter: `# Exercise 3: Two rules, two counters
suspicious_count = 0
critical_count   = 0

for event_id in range(1, 21):     # scan 1 through 20
    if event_id % __BLANK__ == 0:
        print(f"Event {event_id}: CRITICAL")
        critical_count += 1
    elif event_id % __BLANK__ == 0:
        print(f"Event {event_id}: SUSPICIOUS")
        suspicious_count += 1
    else:
        print(f"Event {event_id}: OK")

print(f"\\nSuspicious: {suspicious_count} | Critical: {critical_count}")`,
      hints: [
        "CRITICAL rule: divisible by 5: use % 5 == 0.",
        "SUSPICIOUS rule: divisible by 3: use % 3 == 0.",
        "Put the more severe rule (CRITICAL) in the if, the lesser in elif.",
        "Event 15 is divisible by both 3 and 5, it should be CRITICAL.",
      ],
      solution: `suspicious_count = 0
critical_count   = 0

for event_id in range(1, 21):
    if event_id % 5 == 0:
        print(f"Event {event_id}: CRITICAL")
        critical_count += 1
    elif event_id % 3 == 0:
        print(f"Event {event_id}: SUSPICIOUS")
        suspicious_count += 1
    else:
        print(f"Event {event_id}: OK")

print(f"\\nSuspicious: {suspicious_count} | Critical: {critical_count}")`,
      expectedOutput: `Event 1: OK
Event 2: OK
Event 3: SUSPICIOUS
Event 4: OK
Event 5: CRITICAL
Event 6: SUSPICIOUS
Event 7: OK
Event 8: OK
Event 9: SUSPICIOUS
Event 10: CRITICAL
Event 11: OK
Event 12: SUSPICIOUS
Event 13: OK
Event 14: OK
Event 15: CRITICAL
Event 16: OK
Event 17: OK
Event 18: SUSPICIOUS
Event 19: OK
Event 20: CRITICAL

Suspicious: 5 | Critical: 4`,
      afterNote:
        "Event 15 is divisible by both 3 and 5. Because 5 is checked first (if), it correctly becomes CRITICAL, not SUSPICIOUS. Rule order matters.",
    },
    {
      id: "e4",
      title: "Exercise 4, While loop: login lockout simulation",
      prompt: `A while loop repeats as long as a condition is True.
Simulate a login lockout: allow up to 3 attempts.
After 3 failures, print "Account locked."

This is different from for, you don't know how many attempts in advance.`,
      starter: `# Exercise 4: Login lockout with a while loop
attempts  = 0
max_tries = 3
locked    = False

while attempts < __BLANK__:
    attempts += 1
    print(f"Login attempt {attempts}: failed")

    if attempts >= __BLANK__:
        locked = True
        __BLANK__      # exit the loop immediately

if locked:
    print("Account locked, too many failed attempts.")
else:
    print("Within attempt limit.")`,
      hints: [
        "The while condition: attempts < max_tries , or attempts < 3.",
        "The lock check: if attempts >= max_tries (or >= 3).",
        "break exits the loop immediately when executed.",
      ],
      solution: `attempts  = 0
max_tries = 3
locked    = False

while attempts < max_tries:
    attempts += 1
    print(f"Login attempt {attempts}: failed")

    if attempts >= max_tries:
        locked = True
        break

if locked:
    print("Account locked, too many failed attempts.")
else:
    print("Within attempt limit.")`,
      expectedOutput: `Login attempt 1: failed
Login attempt 2: failed
Login attempt 3: failed
Account locked, too many failed attempts.`,
      afterNote:
        "break is the escape hatch for while loops. Without it, you'd need to carefully design the condition to eventually become False, easy to get wrong and create an infinite loop.",
    },
  ],
  wrapUp: {
    message:
      "Lab 4 complete! You can now scan collections of events, apply rules inside loops, count results, and control loop flow with break.",
    nextLesson: "Next up: Lesson 5, wrapping reusable logic in functions.",
    keyTakeaways: [
      "range(1, 11) gives 1 through 10, stop is exclusive.",
      "Counters start at 0 outside the loop, increment inside.",
      "% (modulo) gives remainder, if x % n == 0, x is divisible by n.",
      "while loops repeat until a condition becomes False.",
      "break exits a loop immediately.",
    ],
  },
};
