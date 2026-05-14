export const tryMeL6 = {
  lessonId: "l6",
  ttsIntro:
    "Welcome to Lesson 6: Lists and Analytics. A threat feed delivers dozens of risk scores per hour. In this lesson you will create lists, access items by index, compute totals and averages with built-in functions, and count conditional matches with a loop.",
  sections: [
    {
      id: "s1",
      icon: "🛡️",
      heading: "Lists Equal Collections of Events",
      body: "A security dashboard might receive two hundred risk scores per hour. You need one container to hold them all, then compute statistics across the whole set. A list stores multiple values in order under one variable name.",
      code: null,
      tryMe: null,
      tip: null,
    },
    {
      id: "s2",
      icon: "📋",
      heading: "Creating and Accessing a List",
      body: "A list uses square brackets with values separated by commas. Each value has an index starting at zero. The last item is at index negative one. The len function returns the number of items.",
      code: `scores = [15, 42, 88, 73, 60, 95]
print(scores[0])     # 15 — first
print(scores[-1])    # 95 — last
print(len(scores))   # 6`,
      tryMe: {
        starter: `scores = [10, 45, 88, 73, 60, 95, 30]

print("First:", scores[0])
print("Last:", scores[-1])
print("Third:", scores[2])
print("Count:", len(scores))
print("Slice:", scores[1:4])`,
        expectedOutput:
          "First: 10\nLast: 30\nThird: 88\nCount: 7\nSlice: [45, 88, 73]",
        hint: "scores[1:4] gives items at index 1, 2, 3. The stop index 4 is not included.",
      },
      tip: null,
    },
    {
      id: "s3",
      icon: "📊",
      heading: "Analytics with Built-in Functions",
      body: "Four built-in functions give you immediate analytics on any list. sum adds all values. len counts items. max finds the largest. min finds the smallest. Divide sum by len for the average.",
      code: `scores = [15, 42, 88, 73, 60, 95]
print(f"Total  : {sum(scores)}")
print(f"Average: {sum(scores)/len(scores):.1f}")
print(f"Highest: {max(scores)}")
print(f"Lowest : {min(scores)}")`,
      tryMe: {
        starter: `scores = [15, 42, 88, 73, 60, 95]
total   = sum(scores)
average = total / len(scores)

print(f"Total  : {total}")
print(f"Average: {average:.1f}")
print(f"Highest: {max(scores)}")
print(f"Lowest : {min(scores)}")`,
        expectedOutput:
          "Total  : 373\nAverage: 62.2\nHighest: 95\nLowest : 15",
        hint: "Try scores.append(100) before these lines and re-run — all four stats update automatically.",
      },
      tip: null,
    },
    {
      id: "s4",
      icon: "🔍",
      heading: "Counting Conditionally",
      body: "To count items meeting a condition, combine a loop with a counter starting at zero before the loop. Inside the loop, check the condition and increment. This is the most common analytics pattern in Python.",
      code: `scores = [15, 42, 88, 73, 60, 95]
high = medium = low = 0

for score in scores:
    if score >= 70:   high   += 1
    elif score >= 40: medium += 1
    else:             low    += 1

print(f"HIGH:{high} MEDIUM:{medium} LOW:{low}")`,
      tryMe: {
        starter: `scores = [15, 42, 88, 73, 60, 95]
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
        expectedOutput: "HIGH  : 3\nMEDIUM: 2\nLOW   : 1",
        hint: "Add more scores to the list and re-run. The counts update automatically.",
      },
      tip: null,
    },
  ],
};
