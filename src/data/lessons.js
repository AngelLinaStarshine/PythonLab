// src/data/lessons.js
// Cyber/AI-themed Python for teens (Grades 10–11)
// Ontario mastery track + data/analytics mini projects

const v = (name) => `/videos/${name}.mp4`;

export const lessons = [
  {
    id: "l1",
    title: "Lesson 1: Variables & Types (Cyber Profile Setup)",
    objective: "Store data in variables (str/int/float/bool) and print clean output.",
    concept:
      "Variables store information. Python automatically assigns a type (string, integer, float, boolean). You’ll model a mini 'user profile' like a cyber system would.",
    steps: [
      "Create variables for username (string) and grade (int).",
      "Add a boolean for 'two_factor_enabled'.",
      "Print a clean 'profile summary' using print().",
    ],
    checkpoint:
      'Your output shows username, grade, and 2FA status (example: "user: Ava | grade: 10 | 2FA: True").',
    materialHtml: `
      <h3>Why variables matter in Cyber/AI</h3>
      <p>In cybersecurity and AI, systems constantly store <b>facts</b> about users, devices, and events:
      usernames, risk scores, IP addresses, flags like "suspicious = True", and more. In Python, we store these in <b>variables</b>.</p>

      <h3>1) Variables</h3>
      <p>A <b>variable</b> is a named container for a value. You assign with <code>=</code>:</p>
      <pre><code>username = "Ava"
grade = 10</code></pre>

      <h3>2) Types (the kind of value)</h3>
      <p>Python detects types based on what you assign:</p>
      <ul>
        <li><b>str</b>: text, like <code>"hello"</code> (usernames, messages, file names)</li>
        <li><b>int</b>: whole numbers, like <code>10</code> (counts, ages, grades)</li>
        <li><b>float</b>: decimals, like <code>3.14</code> (scores, averages, probabilities)</li>
        <li><b>bool</b>: <code>True</code>/<code>False</code> (flags: allowed/blocked, suspicious/not)</li>
      </ul>

      <h3>3) Output with <code>print()</code></h3>
      <p><code>print()</code> shows results in the console (your “system logs”).</p>
      <pre><code>print("user:", username)
print("grade:", grade)</code></pre>

      <h3>Common mistakes</h3>
      <ul>
        <li>Forgetting quotes for strings: <code>username = Ava</code> ❌</li>
        <li>Using quotes for numbers: <code>grade = "10"</code> (becomes text) ⚠️</li>
      </ul>

      <p><b>Your goal:</b> Build a mini cyber profile and print it clearly.</p>
    `,
    minReadSeconds: 50,
    videoUrl: v("l1_variables_types"),
    videoOptions: [
      { label: "Full lesson", url: v("l1_variables_types") },
      { label: "Quick overview", url: v("l1_variables_types") },
      { label: "Key concepts", url: v("l1_variables_types") },
      { label: "Recap", url: v("l1_variables_types") },
      { label: "Extra", url: v("l1_variables_types") },
    ],
    template: `# Lesson 1: Variables & Types (Cyber Profile Setup)
# Goal: create a mini "profile" and print it

username = __BLANK1__
grade = __BLANK2__
two_factor_enabled = __BLANK3__

print("user:", username, "| grade:", grade, "| 2FA:", two_factor_enabled)
`,
    blanks: [
      { key: "__BLANK1__", placeholder: 'Your username as a string (example: "Ava")', expectedHint: 'Use quotes: "Ava"' },
      { key: "__BLANK2__", placeholder: "Your grade as an integer (10 or 11)", expectedHint: "Use 10 or 11 (no quotes)" },
      { key: "__BLANK3__", placeholder: "2FA enabled? (True or False)", expectedHint: "Use True or False (no quotes)" },
    ],
  },

  {
    id: "l2",
    title: "Lesson 2: Input & Output (Phishing Message Collector)",
    objective: "Use input(), convert types, and print clean results.",
    concept:
      "input() returns a string. Convert to int when needed. You’ll collect a suspicious message and a risk score like a security tool.",
    steps: [
      "Ask for a suspicious message (string).",
      "Ask for a risk score (0–100) and convert to int.",
      "Print a clean summary (message + risk).",
    ],
    checkpoint:
      'Program prints message and numeric risk score (example: "risk: 72").',
    materialHtml: `
      <h3>Cyber tool idea: collecting suspicious input</h3>
      <p>Security tools collect input: a suspicious email, a URL, or a risk score.
      In Python, <code>input()</code> lets the user type.</p>

      <h3>1) <code>input()</code> returns text (string)</h3>
      <pre><code>msg = input("Paste the message: ")
print(type(msg))  # &lt;class 'str'&gt;</code></pre>

      <h3>2) Convert to numbers when needed</h3>
      <p>If the user types a number and you want math, convert it:</p>
      <ul>
        <li><code>int(x)</code> for whole numbers (scores, counts)</li>
        <li><code>float(x)</code> for decimals (probabilities)</li>
      </ul>

      <pre><code>risk = int(input("Risk score 0-100: "))
print(risk + 10)</code></pre>

      <p><b>Your goal:</b> Collect a message + numeric risk score and print a clear summary.</p>
    `,
    minReadSeconds: 55,
    videoUrl: v("l2_input_output"),
    videoOptions: [
      { label: "Full lesson", url: v("l2_input_output") },
      { label: "Quick overview", url: v("l2_input_output") },
      { label: "Key concepts", url: v("l2_input_output") },
      { label: "Recap", url: v("l2_input_output") },
      { label: "Extra", url: v("l2_input_output") },
    ],
    template: `# Lesson 2: Input & Output (Phishing Message Collector)
msg = input("Paste a suspicious message: ")

risk = __BLANK1__(input("Risk score 0-100: "))

print("message:", msg)
print("risk:", risk)
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Convert to int", expectedHint: "int" },
    ],
  },

  {
    id: "l3",
    title: "Lesson 3: Conditionals (Phishing Risk Labeler)",
    objective: "Use if/elif/else to label risk as LOW/MEDIUM/HIGH.",
    concept:
      "Conditionals let your program make decisions. You’ll label a risk score like a security tool does.",
    steps: [
      "Create a numeric risk score (0–100).",
      "If risk >= 70 print HIGH RISK.",
      "Else if risk >= 40 print MEDIUM. Else LOW.",
    ],
    checkpoint:
      "Risk score prints the correct label.",
    materialHtml: `
      <h3>Conditionals = security rules</h3>
      <p>Cybersecurity is full of rules: “If risk is high, warn.” In Python, we write rules with
      <code>if</code>, <code>elif</code>, <code>else</code>.</p>

      <h3>Example</h3>
      <pre><code>risk = 72
if risk >= 70:
    print("HIGH RISK")
elif risk >= 40:
    print("MEDIUM")
else:
    print("LOW")</code></pre>

      <p><b>Your goal:</b> Turn a number into a label.</p>
    `,
    minReadSeconds: 60,
    videoUrl: v("l3_conditionals"),
    videoOptions: [
      { label: "Full lesson", url: v("l3_conditionals") },
      { label: "Quick overview", url: v("l3_conditionals") },
      { label: "Key concepts", url: v("l3_conditionals") },
      { label: "Recap", url: v("l3_conditionals") },
      { label: "Extra", url: v("l3_conditionals") },
    ],
    template: `# Lesson 3: Conditionals (Phishing Risk Labeler)
risk = __BLANK1__

if __BLANK2__:
    print("HIGH RISK")
elif __BLANK3__:
    print("MEDIUM")
else:
    print("LOW")
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Pick a risk number (0–100)", expectedHint: "72" },
      { key: "__BLANK2__", placeholder: "High condition", expectedHint: "risk >= 70" },
      { key: "__BLANK3__", placeholder: "Medium condition", expectedHint: "risk >= 40" },
    ],
  },

  // Lessons 4–10 stay exactly as you wrote them (they are consistent and strong)
  // ✅ I kept your content but pasted them here so this file is COMPLETE.

  {
    id: "l4",
    title: "Lesson 4: Loops (Log Scanner: Count Alerts)",
    objective: "Use for loops and range() to scan events and count alerts.",
    concept:
      "Loops repeat actions. You’ll simulate scanning 10 security events and count suspicious ones.",
    steps: [
      "Loop through event IDs 1 to 10.",
      "Mark events divisible by 3 as 'suspicious' (simple rule).",
      "Count how many suspicious events were found.",
    ],
    checkpoint: "Output lists suspicious events and prints the final count.",
    materialHtml: `
      <h3>Loops = scanning logs</h3>
      <p>Security teams scan many events (logins, downloads, clicks). A loop lets you repeat checks without rewriting code.</p>

      <h3>1) <code>for</code> + <code>range()</code></h3>
      <pre><code>for i in range(1, 11):
    print(i)</code></pre>

      <h3>2) Counting</h3>
      <pre><code>count = 0
for i in range(1, 11):
    if i % 3 == 0:
        count += 1
print(count)</code></pre>

      <h3>3) Mod operator</h3>
      <p><code>%</code> gives remainder. If remainder is 0, it divides evenly.</p>

      <p><b>Your goal:</b> Scan events 1–10 and count suspicious ones.</p>
    `,
    minReadSeconds: 60,
    videoUrl: v("l4_loops"),
    videoOptions: [
      { label: "Full lesson", url: v("l4_loops") },
      { label: "Quick overview", url: v("l4_loops") },
      { label: "Key concepts", url: v("l4_loops") },
      { label: "Recap", url: v("l4_loops") },
      { label: "Extra", url: v("l4_loops") },
    ],
    template: `# Lesson 4: Loops (Log Scanner: Count Alerts)
suspicious_count = 0

for event_id in range(__BLANK1__, __BLANK2__):
    if event_id % __BLANK3__ == 0:
        print("Suspicious event:", event_id)
        suspicious_count = suspicious_count + 1

print("Total suspicious:", suspicious_count)
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Start at 1", expectedHint: "1" },
      { key: "__BLANK2__", placeholder: "Stop at 11 (because stop isn't included)", expectedHint: "11" },
      { key: "__BLANK3__", placeholder: "Rule number (use 3)", expectedHint: "3" },
    ],
  },

  {
    id: "l5",
    title: "Lesson 5: Functions (Risk Scoring Functions)",
    objective: "Write functions with parameters + return values.",
    concept:
      "Functions make your code reusable. You’ll build a tiny 'risk scoring' function like a real security system.",
    steps: [
      "Create score_login_attempt(fails, new_device) that returns a risk number.",
      "Create label_risk(risk) that returns 'LOW/MEDIUM/HIGH'.",
      "Print results for test cases.",
    ],
    checkpoint: "Functions return values correctly and output matches the rule.",
    materialHtml: `
      <h3>Functions = reusable security logic</h3>
      <p>In real tools, scoring logic must be reused everywhere. Functions let you define logic once and call it many times.</p>

      <h3>Example: risk scoring</h3>
      <pre><code>def score_login_attempt(fails, new_device):
    risk = fails * 20
    if new_device:
        risk += 30
    return risk</code></pre>

      <pre><code>def label_risk(risk):
    if risk >= 70:
        return "HIGH"
    elif risk >= 40:
        return "MEDIUM"
    else:
        return "LOW"</code></pre>

      <p><b>Your goal:</b> Build both functions and test them.</p>
    `,
    minReadSeconds: 70,
    videoUrl: v("l5_functions"),
    videoOptions: [
      { label: "Full lesson", url: v("l5_functions") },
      { label: "Quick overview", url: v("l5_functions") },
      { label: "Key concepts", url: v("l5_functions") },
      { label: "Recap", url: v("l5_functions") },
      { label: "Extra", url: v("l5_functions") },
    ],
    template: `# Lesson 5: Functions (Risk Scoring Functions)
def score_login_attempt(fails, new_device):
    risk = fails * 20
    if new_device:
        risk = risk + 30
    return __BLANK1__

def label_risk(risk):
    if risk >= __BLANK2__:
        return "HIGH"
    elif risk >= __BLANK3__:
        return "MEDIUM"
    else:
        return "LOW"

test_risk = score_login_attempt(2, True)
print("risk:", test_risk)
print("label:", label_risk(test_risk))
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Return the risk variable", expectedHint: "risk" },
      { key: "__BLANK2__", placeholder: "High threshold (70)", expectedHint: "70" },
      { key: "__BLANK3__", placeholder: "Medium threshold (40)", expectedHint: "40" },
    ],
  },

  {
    id: "l6",
    title: "Lesson 6: Lists (Threat Feed + Basic Analytics)",
    objective: "Use lists, loop through them, compute totals and averages.",
    concept:
      "Lists store multiple values. You’ll analyze a threat feed of risk scores and compute summary stats.",
    steps: [
      "Create a list of risk scores.",
      "Compute total and average.",
      "Count how many are high risk (>= 70).",
    ],
    checkpoint: "Prints total, average, and high-risk count correctly.",
    materialHtml: `
      <h3>Lists = collections of events</h3>
      <p>A security dashboard might store many risk scores in a list.</p>

      <pre><code>scores = [10, 45, 80, 70]
total = sum(scores)
avg = total / len(scores)</code></pre>

      <pre><code>high = 0
for s in scores:
    if s >= 70:
        high += 1</code></pre>

      <p><b>Your goal:</b> Create a tiny analytics summary.</p>
    `,
    minReadSeconds: 65,
    videoUrl: v("l6_lists_analytics"),
    videoOptions: [
      { label: "Full lesson", url: v("l6_lists_analytics") },
      { label: "Quick overview", url: v("l6_lists_analytics") },
      { label: "Key concepts", url: v("l6_lists_analytics") },
      { label: "Recap", url: v("l6_lists_analytics") },
      { label: "Extra", url: v("l6_lists_analytics") },
    ],
    template: `# Lesson 6: Lists (Threat Feed + Basic Analytics)
risk_scores = [15, 42, 88, 73, 60, 95]

total = __BLANK1__
avg = __BLANK2__

high_count = 0
for s in risk_scores:
    if s >= __BLANK3__:
        high_count = high_count + 1

print("Total:", total)
print("Average:", avg)
print("High risk count:", high_count)
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Compute total", expectedHint: "sum(risk_scores)" },
      { key: "__BLANK2__", placeholder: "Compute average", expectedHint: "total / len(risk_scores)" },
      { key: "__BLANK3__", placeholder: "High risk threshold", expectedHint: "70" },
    ],
  },

  {
    id: "l7",
    title: "Lesson 7: Dictionaries (Device Inventory Records)",
    objective: "Use dictionaries to store structured data and update fields.",
    concept:
      "Dictionaries store labeled fields like a database row. You’ll model a device record: owner, OS, risk, patched.",
    steps: [
      "Create a device dictionary with keys: owner, os, risk, patched.",
      "Print key fields.",
      "Update risk and patched status, then print the dictionary.",
    ],
    checkpoint: "Shows original values and updated record correctly.",
    materialHtml: `
      <h3>Dictionaries = mini database records</h3>
      <pre><code>device = {
  "owner": "Ava",
  "os": "Windows",
  "risk": 42,
  "patched": False
}</code></pre>

      <pre><code>device["risk"] = 10
device["patched"] = True</code></pre>

      <p><b>Your goal:</b> Build and update a device record cleanly.</p>
    `,
    minReadSeconds: 65,
    videoUrl: v("l7_dictionaries"),
    videoOptions: [
      { label: "Full lesson", url: v("l7_dictionaries") },
      { label: "Quick overview", url: v("l7_dictionaries") },
      { label: "Key concepts", url: v("l7_dictionaries") },
      { label: "Recap", url: v("l7_dictionaries") },
      { label: "Extra", url: v("l7_dictionaries") },
    ],
    template: `# Lesson 7: Dictionaries (Device Inventory Records)
device = {
    "owner": __BLANK1__,
    "os": __BLANK2__,
    "risk": __BLANK3__,
    "patched": __BLANK4__
}

print("Owner:", device[__BLANK5__])
print("OS:", device[__BLANK6__])
print("Risk:", device[__BLANK7__])

# Update after patching
device[__BLANK8__] = __BLANK9__
device[__BLANK10__] = True

print("Updated device:", device)
`,
    blanks: [
      { key: "__BLANK1__", placeholder: 'Owner string', expectedHint: '"Ava"' },
      { key: "__BLANK2__", placeholder: 'OS string', expectedHint: '"Windows"' },
      { key: "__BLANK3__", placeholder: "Risk number", expectedHint: "42" },
      { key: "__BLANK4__", placeholder: "Patched True/False", expectedHint: "False" },
      { key: "__BLANK5__", placeholder: 'Key for owner', expectedHint: '"owner"' },
      { key: "__BLANK6__", placeholder: 'Key for os', expectedHint: '"os"' },
      { key: "__BLANK7__", placeholder: 'Key for risk', expectedHint: '"risk"' },
      { key: "__BLANK8__", placeholder: 'Key to update risk', expectedHint: '"risk"' },
      { key: "__BLANK9__", placeholder: "New risk after patching", expectedHint: "10" },
      { key: "__BLANK10__", placeholder: 'Key to update patched', expectedHint: '"patched"' },
    ],
  },

  {
    id: "l8",
    title: "Lesson 8: Strings (Log Parsing + Keyword Detection)",
    objective: "Use string methods: lower(), split(), replace(), and 'in'.",
    concept:
      "Security log analysis often starts with text processing. You’ll normalize log lines and detect suspicious keywords.",
    steps: [
      "Convert a log line to lowercase.",
      "Split into words.",
      "Detect keywords like 'failed' or 'blocked'.",
    ],
    checkpoint: "Prints normalized text and correctly flags suspicious keywords.",
    materialHtml: `
      <h3>Strings = logs, messages, and alerts</h3>
      <pre><code>line = "FAILED Login From IP 10.0.0.5"
clean = line.lower()
words = clean.split()
if "failed" in words:
    print("ALERT")</code></pre>

      <p><b>Your goal:</b> Parse a log line and flag suspicious words.</p>
    `,
    minReadSeconds: 70,
    videoUrl: v("l8_strings_parsing"),
    videoOptions: [
      { label: "Full lesson", url: v("l8_strings_parsing") },
      { label: "Quick overview", url: v("l8_strings_parsing") },
      { label: "Key concepts", url: v("l8_strings_parsing") },
      { label: "Recap", url: v("l8_strings_parsing") },
      { label: "Extra", url: v("l8_strings_parsing") },
    ],
    template: `# Lesson 8: Strings (Log Parsing + Keyword Detection)
log_line = "FAILED Login From IP 10.0.0.5"

clean = log_line.__BLANK1__()
words = clean.__BLANK2__()

print("clean:", clean)
print("words:", words)

if __BLANK3__:
    print("ALERT: failed login detected")
else:
    print("No failed login keyword found")
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Lowercase method", expectedHint: "lower" },
      { key: "__BLANK2__", placeholder: "Split method", expectedHint: "split" },
      { key: "__BLANK3__", placeholder: "Keyword check", expectedHint: '"failed" in words' },
    ],
  },

  {
    id: "l9",
    title: "Lesson 9: Debugging & Exceptions (Safe Data Cleaning)",
    objective: "Use try/except to handle errors and keep your tool running.",
    concept:
      "Real data is messy. If conversion fails, your program should not crash — it should handle the error safely.",
    steps: [
      "Try converting a text value to int.",
      "If conversion fails, print a helpful message.",
      "Otherwise compute a result and print it.",
    ],
    checkpoint:
      'If value="10" → prints 50. If value="N/A" → prints a friendly error without crashing.',
    materialHtml: `
      <h3>try/except keeps tools alive</h3>
      <pre><code>raw = "N/A"
try:
    x = int(raw)
    print(x * 5)
except:
    print("Invalid number")</code></pre>

      <p><b>Your goal:</b> Safely convert input and keep your program running.</p>
    `,
    minReadSeconds: 70,
    videoUrl: v("l9_exceptions_debugging"),
    videoOptions: [
      { label: "Full lesson", url: v("l9_exceptions_debugging") },
      { label: "Quick overview", url: v("l9_exceptions_debugging") },
      { label: "Key concepts", url: v("l9_exceptions_debugging") },
      { label: "Recap", url: v("l9_exceptions_debugging") },
      { label: "Extra", url: v("l9_exceptions_debugging") },
    ],
    template: `# Lesson 9: Debugging & Exceptions (Safe Data Cleaning)
value = "N/A"

try:
    x = __BLANK1__
    print("x*5 =", __BLANK2__)
except:
    print(__BLANK3__)
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Convert value to int", expectedHint: "int(value)" },
      { key: "__BLANK2__", placeholder: "Multiply x by 5", expectedHint: "x * 5" },
      { key: "__BLANK3__", placeholder: "Friendly error string", expectedHint: '"Invalid number (expected digits)"' },
    ],
  },

  {
    id: "l10",
    title: "Lesson 10: Capstone (Portfolio Mini SOC Dashboard)",
    objective: "Build a portfolio-ready mini project: log input → scoring → alerts → summary analytics.",
    concept:
      "This capstone combines the whole track: input, loops, lists, dicts, strings, functions, and safe error handling.",
    steps: [
      "Collect multiple log lines from the user until they type 'done'.",
      "Parse lines and compute a risk score per event.",
      "Store events as dictionaries in a list.",
      "Print a summary report: total events, high alerts, average risk.",
    ],
    checkpoint:
      "Enter 3+ logs, type done, and it prints a readable report with counts + average risk.",
    materialHtml: `
      <h3>Capstone: Mini SOC Dashboard (Portfolio Project)</h3>
      <p>This is a simplified Security Operations Center tool: paste log lines, score risk, label alerts, and print a summary report.</p>

      <ul>
        <li><b>Real scenario:</b> logs + alerts + scoring</li>
        <li><b>Analytics:</b> average risk + high alert count</li>
        <li><b>Robust:</b> handles many entries</li>
      </ul>
    `,
    minReadSeconds: 90,
    videoUrl: v("l10_capstone"),
    videoOptions: [
      { label: "Full lesson", url: v("l10_capstone") },
      { label: "Quick overview", url: v("l10_capstone") },
      { label: "Key concepts", url: v("l10_capstone") },
      { label: "Recap", url: v("l10_capstone") },
      { label: "Extra", url: v("l10_capstone") },
    ],
    template: `# Lesson 10: Capstone (Portfolio Mini SOC Dashboard)
# Paste log lines one by one. Type 'done' to finish.

def score_event(text):
    t = text.lower()
    risk = 10

    if "failed" in t:
        risk = risk + 40
    if "blocked" in t:
        risk = risk + 30
    if "malware" in t:
        risk = risk + 60

    if risk > 100:
        risk = 100
    return risk

def label_risk(risk):
    if risk >= 70:
        return "HIGH"
    elif risk >= 40:
        return "MEDIUM"
    else:
        return "LOW"

events = []

while True:
    line = input("Log (or 'done'): ")
    if line.lower() == "done":
        break

    risk = __BLANK1__
    label = __BLANK2__

    event = {"raw": line, "risk": risk, "label": label}
    events.append(event)

print("\\n=== MINI SOC REPORT ===")
print("Total events:", len(events))

high_count = 0
total_risk = 0

for e in events:
    total_risk += e["risk"]
    if e["label"] == "HIGH":
        high_count += 1

avg_risk = total_risk / len(events) if len(events) > 0 else 0

print("High alerts:", high_count)
print("Average risk:", avg_risk)

print("\\nEvents:")
for i in range(len(events)):
    e = events[i]
    print(i + 1, "-", e["label"], "| risk:", e["risk"], "|", e["raw"])
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Call score_event(line)", expectedHint: "score_event(line)" },
      { key: "__BLANK2__", placeholder: "Call label_risk(risk)", expectedHint: "label_risk(risk)" },
    ],
  },
];