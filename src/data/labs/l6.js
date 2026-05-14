export const lab6 = {
  lessonId: "l6",
  title: "Lab 6: Lists",
  subtitle: "Threat Feed + Basic Analytics",
  estimatedMinutes: 30,
  objectives: [
    "Create a list and access items by index.",
    "Use sum(), len(), min(), and max() for basic analytics.",
    "Loop through a list to count conditional matches.",
    "Append new items and sort a list.",
  ],
  intro: `A threat intelligence feed delivers dozens of risk scores per hour. You need
one variable to hold them all, then compute statistics across the entire feed.
In this lab you build that analytics pipeline, from a raw list to a
dashboard-ready summary report.`,
  exercises: [
    {
      id: "e1",
      title: "Exercise 1, Create a list and access items",
      prompt: `Create a list called risk_scores with these values: [15, 42, 88, 73, 60, 95]
Then print:
  • The first item (index 0)
  • The last item (use negative indexing)
  • The total number of items`,
      starter: `# Exercise 1: Create and access a list
risk_scores = [15, 42, 88, 73, 60, 95]

print("First :", risk_scores[__BLANK__])   # index 0
print("Last  :", risk_scores[__BLANK__])   # last item using negative index
print("Count :", __BLANK__(risk_scores))   # number of items`,
      hints: [
        "First item: index 0: risk_scores[0]",
        "Last item: index -1: risk_scores[-1]",
        "Number of items: len(risk_scores)",
      ],
      solution: `risk_scores = [15, 42, 88, 73, 60, 95]

print("First :", risk_scores[0])
print("Last  :", risk_scores[-1])
print("Count :", len(risk_scores))`,
      expectedOutput: `First : 15
Last  : 95
Count : 6`,
      afterNote:
        "Negative indexes count from the right: -1 is the last item, -2 is second to last, etc. This works on any Python sequence.",
    },
    {
      id: "e2",
      title: "Exercise 2, Compute analytics with built-ins",
      prompt: `Using the same list, compute and print:
  • Total (sum of all scores)
  • Average (total ÷ count) , formatted to 1 decimal place
  • Highest score
  • Lowest score`,
      starter: `# Exercise 2: Analytics with built-in functions
risk_scores = [15, 42, 88, 73, 60, 95]

total   = __BLANK__(risk_scores)
average = total / __BLANK__(risk_scores)
highest = __BLANK__(risk_scores)
lowest  = __BLANK__(risk_scores)

print(f"Total   : {total}")
print(f"Average : {average:.1f}")
print(f"Highest : {highest}")
print(f"Lowest  : {lowest}")`,
      hints: [
        "sum(list) adds all values.",
        "len(list) counts items, use it as the divisor.",
        "max(list) returns the largest value.",
        "min(list) returns the smallest value.",
      ],
      solution: `risk_scores = [15, 42, 88, 73, 60, 95]

total   = sum(risk_scores)
average = total / len(risk_scores)
highest = max(risk_scores)
lowest  = min(risk_scores)

print(f"Total   : {total}")
print(f"Average : {average:.1f}")
print(f"Highest : {highest}")
print(f"Lowest  : {lowest}")`,
      expectedOutput: `Total   : 373
Average : 62.2
Highest : 95
Lowest  : 15`,
      afterNote:
        "sum, len, max, min are Python built-ins, they work on any list. These four lines give you the core of any analytics dashboard.",
    },
    {
      id: "e3",
      title: "Exercise 3, Count high-risk events with a loop",
      prompt: `Loop through the list and count:
  • High-risk scores (>= 70)
  • Medium-risk scores (40 to 69)
  • Low-risk scores (< 40)

Print the count for each tier.`,
      starter: `# Exercise 3: Count by tier
risk_scores = [15, 42, 88, 73, 60, 95]
high = 0
medium = 0
low = 0

for score in risk_scores:
    if score >= __BLANK__:
        high += 1
    elif score >= __BLANK__:
        medium += 1
    else:
        low += 1

print(f"HIGH   : {high}")
print(f"MEDIUM : {medium}")
print(f"LOW    : {low}")`,
      hints: [
        "HIGH threshold: >= 70. MEDIUM: >= 40. LOW: everything else.",
        "Three counters, each starting at 0.",
        "88, 73, 95 are >= 70: 3 HIGH events.",
      ],
      solution: `risk_scores = [15, 42, 88, 73, 60, 95]
high = medium = low = 0

for score in risk_scores:
    if score >= 70:
        high += 1
    elif score >= 40:
        medium += 1
    else:
        low += 1

print(f"HIGH   : {high}")
print(f"MEDIUM : {medium}")
print(f"LOW    : {low}")`,
      expectedOutput: `HIGH   : 3
MEDIUM : 2
LOW    : 1`,
      afterNote:
        "high = medium = low = 0 is Python shorthand for initializing multiple variables to the same value on one line.",
    },
    {
      id: "e4",
      title: "Exercise 4, Build a live feed with append() and sort()",
      prompt: `Simulate a live threat feed: start with an empty list, add scores one by one
with append(), then sort and print a final ranked report.

Add these scores in order: 45, 88, 22, 67, 91, 33
Then sort descending (highest first) and print the ranked list.`,
      starter: `# Exercise 4: Live feed simulation
feed = []    # start empty

scores_to_add = [45, 88, 22, 67, 91, 33]
for s in scores_to_add:
    feed.__BLANK__(s)            # add each score to the list
    print(f"Added {s}: feed length: {len(feed)}")

# Sort descending (highest risk first)
feed.sort(__BLANK__)

print("\\n=== Ranked Threat Feed ===")
for i, score in enumerate(feed, start=1):
    label = "HIGH" if score >= 70 else "MED" if score >= 40 else "LOW"
    print(f"  {i}. {score:3}  [{label}]")`,
      hints: [
        "feed.append(s) adds s to the end of the list.",
        "feed.sort(reverse=True) sorts from highest to lowest.",
        "enumerate(feed, start=1) gives you index + value, starting at 1.",
      ],
      solution: `feed = []

scores_to_add = [45, 88, 22, 67, 91, 33]
for s in scores_to_add:
    feed.append(s)
    print(f"Added {s}: feed length: {len(feed)}")

feed.sort(reverse=True)

print("\\n=== Ranked Threat Feed ===")
for i, score in enumerate(feed, start=1):
    label = "HIGH" if score >= 70 else "MED" if score >= 40 else "LOW"
    print(f"  {i}. {score:3}  [{label}]")`,
      expectedOutput: `Added 45: feed length: 1
Added 88: feed length: 2
Added 22: feed length: 3
Added 67: feed length: 4
Added 91: feed length: 5
Added 33: feed length: 6

=== Ranked Threat Feed ===
  1.  91  [HIGH]
  2.  88  [HIGH]
  3.  67  [MED]
  4.  45  [MED]
  5.  33  [LOW]
  6.  22  [LOW]`,
      afterNote:
        "enumerate(list, start=1) gives you the index and value together in one loop, far cleaner than tracking a separate counter variable.",
    },
  ],
  wrapUp: {
    message:
      "Lab 6 complete! You can build, analyze, and manage lists, the most common data structure in Python data pipelines.",
    nextLesson: "Next up: Lesson 7, structured records with dictionaries.",
    keyTakeaways: [
      "Lists store ordered collections, access with index [i] or [-1] for last.",
      "sum(), len(), max(), min() are the four analytics built-ins.",
      "Loop + counter = conditional count across a collection.",
      ".append(x) adds to end. .sort(reverse=True) sorts descending.",
      "enumerate(list, start=1) gives index + value in one loop.",
    ],
  },
};
