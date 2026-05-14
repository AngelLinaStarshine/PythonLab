// src/data/lessons.js
// Cyber/AI-themed Python for teens (Grades 10–11)
// IMPROVED LEARNING MATERIAL — v2
// Pedagogy: IBM Coursera structure · Khan Academy scaffolding · Code.org hints · Codecademy flow

const v = (name) => `/videos/${name}.mp4`;

// ─── shared table style helper ───────────────────────────────────
const TH = `padding:8px 12px;text-align:left;border:1px solid #1e3350;background:#08111e;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#4e7090`;
const TD = `padding:8px 12px;border:1px solid #1a2d44;font-size:13px;vertical-align:top`;
const TDc = `padding:8px 12px;border:1px solid #1a2d44;font-size:12px;vertical-align:top;font-family:'Courier New',monospace;color:#ffad2e`;

export const lessons = [

  // ═══════════════════════════════════════════════════════
  // LESSON 1 — Variables & Types
  // ═══════════════════════════════════════════════════════
  {
    id: "l1",
    title: "Lesson 1: Variables & Types (Cyber Profile Setup)",
    objective: "Declare variables with str, int, float, and bool types; verify with type(); print a formatted profile using f-strings.",
    concept: "A variable is a named container for a value. Python detects the type automatically from what you assign — text in quotes becomes str, whole numbers become int, decimals become float, and True/False becomes bool. You'll build a mini user profile the way a real authentication system would store it.",
    steps: [
      "Declare username (str) and grade (int) — check the type difference in your print.",
      "Add risk_score (float) and two_factor_enabled (bool) to your profile.",
      "Print a clean summary line using print() with commas or an f-string.",
      "Call type() on one variable to verify Python's type detection.",
    ],
    checkpoint: 'Output shows all four values — example: "user: Ava | grade: 10 | risk: 0.0 | 2FA: True". No NameErrors. All four variable types represented.',
    materialHtml: `
<h3>🛡️ Why variables matter in Cyber & AI</h3>
<p>Every time you log in, a server creates dozens of variables in milliseconds: your username, session token, risk score, whether 2FA is active. These live in memory as typed values — not on paper. In Python, you create them with a single line.</p>

<h3>1) Creating a variable</h3>
<p>Use <code>=</code> to assign. Python reads the right side and automatically chooses the type:</p>
<pre><code>username           = "Ava"    # str   — text always needs quotes
grade              = 10       # int   — whole number, no quotes
risk_score         = 0.0      # float — decimal number
two_factor_enabled = True     # bool  — exactly True or False</code></pre>

<h3>2) The four types — at a glance</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}">Type</th><th style="${TH}">Stores</th><th style="${TH}">Cyber use case</th><th style="${TH}">How to write it</th></tr>
  <tr><td style="${TD}"><code>str</code></td><td style="${TD}">Text</td><td style="${TD}">username, IP address, log message</td><td style="${TDc}">"Ava" or 'Ava'</td></tr>
  <tr><td style="${TD}"><code>int</code></td><td style="${TD}">Whole numbers</td><td style="${TD}">login attempts, port number, grade</td><td style="${TDc}">10 (no quotes)</td></tr>
  <tr><td style="${TD}"><code>float</code></td><td style="${TD}">Decimals</td><td style="${TD}">AI confidence score, risk probability</td><td style="${TDc}">0.75 or 7.5</td></tr>
  <tr><td style="${TD}"><code>bool</code></td><td style="${TD}">True / False</td><td style="${TD}">is_blocked, two_factor_enabled, is_admin</td><td style="${TDc}">True or False</td></tr>
</table>

<h3>3) Verify types with <code>type()</code></h3>
<p>Python's built-in <code>type()</code> is your sanity check — it tells you exactly what type a variable is:</p>
<pre><code>print(type(username))            # &lt;class 'str'&gt;
print(type(grade))               # &lt;class 'int'&gt;
print(type(risk_score))          # &lt;class 'float'&gt;
print(type(two_factor_enabled))  # &lt;class 'bool'&gt;</code></pre>

<h3>4) Printing clean output — two styles</h3>
<pre><code># Style A: commas (adds a space between each value)
print("user:", username, "| grade:", grade, "| risk:", risk_score, "| 2FA:", two_factor_enabled)

# Style B: f-string (more control, industry standard)
print(f"user: {username} | grade: {grade} | risk: {risk_score} | 2FA: {two_factor_enabled}")

# Both output: user: Ava | grade: 10 | risk: 0.0 | 2FA: True</code></pre>
<p>f-strings (f before the quote) let you embed any variable inside <code>{curly braces}</code>.</p>

<h3>❌ Common mistakes</h3>
<ul>
  <li><b>Missing quotes for text:</b> <code>username = Ava</code> → Python looks for a variable named <code>Ava</code> → <b>NameError</b></li>
  <li><b>Quoting a number:</b> <code>grade = "10"</code> stores text — <code>grade + 1</code> will crash with TypeError</li>
  <li><b>Lowercase bool:</b> <code>true</code> or <code>TRUE</code> → NameError. Python requires exactly <code>True</code> / <code>False</code></li>
  <li><b>Missing f before f-string:</b> <code>print("{username}")</code> → prints the literal text <code>{username}</code></li>
</ul>

<p><b>Your goal:</b> Build a four-variable cyber profile and print a clean, readable summary line.</p>
`,
    minReadSeconds: 60,
    videoUrl: v("l1_variables_types"),
    videoOptions: [
      { label: "Full lesson", url: v("l1_variables_types") },
      { label: "Quick overview", url: v("l1_variables_types") },
      { label: "Key concepts", url: v("l1_variables_types") },
      { label: "Recap", url: v("l1_variables_types") },
      { label: "Extra", url: v("l1_variables_types") },
    ],
    template: `# Lesson 1: Variables & Types (Cyber Profile Setup)
username = __BLANK1__
grade = __BLANK2__
risk_score = __BLANK3__
two_factor_enabled = __BLANK4__

print(type(username))
print("user:", username, "| grade:", grade, "| risk:", risk_score, "| 2FA:", two_factor_enabled)
`,
    blanks: [
      { key: "__BLANK1__", placeholder: 'String — e.g. "Ava"', expectedHint: 'Quotes required: "Ava"' },
      { key: "__BLANK2__", placeholder: "Integer — 10 or 11", expectedHint: "No quotes: 10" },
      { key: "__BLANK3__", placeholder: "Float — e.g. 0.0 or 7.5", expectedHint: "0.0" },
      { key: "__BLANK4__", placeholder: "Boolean — True or False", expectedHint: "Exactly: True" },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LESSON 2 — Input & Output
  // ═══════════════════════════════════════════════════════
  {
    id: "l2",
    title: "Lesson 2: Input & Output (Phishing Message Collector)",
    objective: "Collect user input with input(), convert types with int() and float(), and print formatted results.",
    concept: "input() always returns a string — even if the user types a number. To do math with typed numbers, you must convert them. You'll collect a suspicious message and a numeric risk score like a real security intake tool.",
    steps: [
      "Use input() to collect a suspicious message — store it as a string.",
      "Use int(input()) to collect a risk score and convert it immediately.",
      "Print both values in a clean formatted summary.",
      "Bonus: add a float input for confidence percentage.",
    ],
    checkpoint: 'Program prompts for input, user enters a message and a number, output shows both — example: "message: Buy Bitcoin now | risk: 72". The risk score must print as a number, not text.',
    materialHtml: `
<h3>🛡️ Security tools start with input</h3>
<p>Every security form you've ever filled out — reporting a phishing email, flagging suspicious activity — is powered by code that reads what you typed. <code>input()</code> is Python's way of asking the user for information at runtime.</p>

<h3>1) <code>input()</code> — always returns a string</h3>
<p>Whatever the user types, Python wraps it in quotes and stores it as <code>str</code>. Always.</p>
<pre><code>msg = input("Paste suspicious message: ")
print(type(msg))   # &lt;class 'str'&gt; — even if they typed a number</code></pre>

<h3>2) Converting to numbers — the critical step</h3>
<p>If you want to do math with typed input, you must convert it:</p>
<pre><code># int() — for whole numbers (scores, counts, ports)
risk = int(input("Risk score 0-100: "))

# float() — for decimals (probabilities, percentages)
confidence = float(input("Confidence 0.0-1.0: "))

print(risk + 10)        # works — it's an int
print(confidence * 100) # works — it's a float</code></pre>

<h3>3) Input → convert → store — the pattern</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}">What user types</th><th style="${TH}">Store as</th><th style="${TH}">Code pattern</th></tr>
  <tr><td style="${TD}">A name or message</td><td style="${TD}">str (no conversion)</td><td style="${TDc}">x = input("...")</td></tr>
  <tr><td style="${TD}">A whole number</td><td style="${TD}">int</td><td style="${TDc}">x = int(input("..."))</td></tr>
  <tr><td style="${TD}">A decimal number</td><td style="${TD}">float</td><td style="${TDc}">x = float(input("..."))</td></tr>
</table>

<h3>4) Print a clean summary</h3>
<pre><code>msg  = input("Paste suspicious message: ")
risk = int(input("Risk score 0-100: "))

# Comma style
print("message:", msg)
print("risk:", risk)

# f-string style (cleaner)
print(f"--- Phishing Report ---")
print(f"Message : {msg}")
print(f"Risk    : {risk}/100")</code></pre>

<h3>❌ Common mistakes</h3>
<ul>
  <li><b>Forgetting int():</b> <code>risk = input("Score: ")</code> — if you later write <code>risk &gt;= 70</code>, Python compares text to a number → <b>TypeError</b></li>
  <li><b>int() on non-numeric input:</b> <code>int("hello")</code> → <b>ValueError</b>. We'll handle this safely in Lesson 9 (try/except).</li>
  <li><b>int() on a float string:</b> <code>int("7.5")</code> → ValueError. Use <code>float()</code> first, then <code>int()</code> if needed.</li>
</ul>

<p><b>Your goal:</b> Collect a suspicious message (str) and a risk score (int), then print a clean summary report.</p>
`,
    minReadSeconds: 60,
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
if risk >= 70:
    print("label:", "HIGH")
else:
    print("label:", "LOW")
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Convert to integer", expectedHint: "int" },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LESSON 3 — Conditionals
  // ═══════════════════════════════════════════════════════
  {
    id: "l3",
    title: "Lesson 3: Conditionals (Phishing Risk Labeler)",
    objective: "Write if / elif / else chains to label a numeric risk score as LOW, MEDIUM, or HIGH.",
    concept: "Conditionals let your program make decisions. Python evaluates a condition (True or False) and runs different code depending on the result. You'll replicate the rule engine that real security tools use to label events.",
    steps: [
      "Create a numeric risk variable (0–100).",
      "Write if risk >= 70 to catch HIGH risk events.",
      "Add elif risk >= 40 for MEDIUM, and else for LOW.",
      "Test with three different risk values to confirm all three branches work.",
    ],
    checkpoint: 'risk = 85 prints "HIGH RISK", risk = 55 prints "MEDIUM", risk = 20 prints "LOW". All three labels appear for the right ranges.',
    materialHtml: `
<h3>🛡️ Security rules are conditionals</h3>
<p>An Intrusion Detection System (IDS) is essentially a large collection of conditional rules: "If the login failed more than 5 times, flag as suspicious." "If the file is larger than expected AND from an unknown source, quarantine." Python's <code>if / elif / else</code> is exactly how you write these rules.</p>

<h3>1) The basic structure</h3>
<pre><code>if condition:
    # runs when condition is True
elif other_condition:
    # runs when other_condition is True
else:
    # runs when none of the above are True</code></pre>
<p><b>Important:</b> Python uses <b>indentation</b> (4 spaces or 1 tab) to define which code belongs inside each branch. Missing indentation = <b>IndentationError</b>.</p>

<h3>2) Comparison operators — the building blocks of conditions</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}">Operator</th><th style="${TH}">Meaning</th><th style="${TH}">Example</th><th style="${TH}">Result</th></tr>
  <tr><td style="${TDc}">&gt;=</td><td style="${TD}">Greater than or equal</td><td style="${TDc}">risk &gt;= 70</td><td style="${TD}">True if risk is 70 or more</td></tr>
  <tr><td style="${TDc}">&gt;</td><td style="${TD}">Strictly greater than</td><td style="${TDc}">risk &gt; 70</td><td style="${TD}">True if risk is 71 or more</td></tr>
  <tr><td style="${TDc}">==</td><td style="${TD}">Exactly equal to</td><td style="${TDc}">status == "blocked"</td><td style="${TD}">True if status is exactly "blocked"</td></tr>
  <tr><td style="${TDc}">!=</td><td style="${TD}">Not equal to</td><td style="${TDc}">role != "admin"</td><td style="${TD}">True if role is anything but "admin"</td></tr>
  <tr><td style="${TDc}">&lt;=</td><td style="${TD}">Less than or equal</td><td style="${TDc}">fails &lt;= 3</td><td style="${TD}">True if fails is 3 or fewer</td></tr>
</table>

<h3>3) Risk labeler — the full pattern</h3>
<pre><code>risk = 72

if risk >= 70:
    print("🚨 HIGH RISK — immediate alert")
elif risk >= 40:
    print("⚠️  MEDIUM — monitoring required")
else:
    print("✓  LOW — within normal range")</code></pre>

<h3>4) Combining conditions with <code>and</code> / <code>or</code></h3>
<p>Real security rules often check multiple things at once:</p>
<pre><code># Flag if risk is high AND it's a new device
if risk >= 70 and new_device == True:
    print("CRITICAL: high risk from unknown device")

# Flag if risk is high OR malware was detected
if risk >= 70 or malware_found == True:
    print("ALERT: action required")</code></pre>

<h3>❌ Common mistakes</h3>
<ul>
  <li><b>Using = instead of ==:</b> <code>if risk = 70</code> → <b>SyntaxError</b>. Use <code>==</code> to compare, <code>=</code> to assign.</li>
  <li><b>Wrong elif order:</b> If you put <code>elif risk &gt;= 10</code> before <code>elif risk &gt;= 40</code>, everything hits the first branch. Order matters — most specific first, or highest threshold first.</li>
  <li><b>Missing colon:</b> <code>if risk &gt;= 70</code> without <code>:</code> → SyntaxError.</li>
</ul>

<p><b>Your goal:</b> Write an if/elif/else chain that prints the correct label for any risk score from 0 to 100.</p>
`,
    minReadSeconds: 65,
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
      { key: "__BLANK1__", placeholder: "A number between 0 and 100", expectedHint: "72" },
      { key: "__BLANK2__", placeholder: "Condition for HIGH (≥ 70)", expectedHint: "risk >= 70" },
      { key: "__BLANK3__", placeholder: "Condition for MEDIUM (≥ 40)", expectedHint: "risk >= 40" },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LESSON 4 — Loops
  // ═══════════════════════════════════════════════════════
  {
    id: "l4",
    title: "Lesson 4: Loops (Log Scanner: Count Alerts)",
    objective: "Use for loops with range() to iterate over events; accumulate a count; understand the modulo operator.",
    concept: "Loops repeat a block of code automatically. A for loop with range() gives you a sequence of numbers to iterate through — perfect for scanning event logs. You'll simulate scanning 10 security events and counting suspicious ones.",
    steps: [
      "Write a for loop with range(1, 11) to iterate event IDs 1 through 10.",
      "Inside the loop, use if event_id % 3 == 0 to flag 'suspicious' events.",
      "Maintain a counter variable — increment it each time a suspicious event is found.",
      "After the loop, print the total suspicious count.",
    ],
    checkpoint: "Output lists event IDs 3, 6, 9 as suspicious and prints 'Total suspicious: 3'. The count is correct.",
    materialHtml: `
<h3>🛡️ Loops = automated log scanning</h3>
<p>A security analyst can't manually read 10,000 log entries every morning. Automated tools loop through every event and apply rules — exactly what you'll build here. A loop in Python lets you repeat the same check on every item without rewriting the code.</p>

<h3>1) The <code>for</code> loop with <code>range()</code></h3>
<p><code>range(start, stop)</code> generates a sequence of numbers from <code>start</code> up to (but not including) <code>stop</code>:</p>
<pre><code># Scan event IDs 1 through 10
for event_id in range(1, 11):
    print("Scanning event:", event_id)

# Output: Scanning event: 1, 2, 3 ... 10</code></pre>

<h3>2) The modulo operator <code>%</code></h3>
<p>Modulo gives you the <b>remainder</b> after division. If the remainder is 0, the number divides evenly:</p>
<pre><code>print(10 % 3)   # 1  — 10 ÷ 3 = 3 remainder 1
print(9  % 3)   # 0  — 9 ÷ 3 = 3 exactly
print(6  % 2)   # 0  — even number

# Rule: if x % n == 0, then x is divisible by n</code></pre>

<h3>3) Counting inside a loop</h3>
<p>Create a counter <b>before</b> the loop, increment it <b>inside</b>:</p>
<pre><code>suspicious_count = 0   # ← start at 0, outside the loop

for event_id in range(1, 11):
    if event_id % 3 == 0:          # divisible by 3 = "suspicious"
        print("Suspicious:", event_id)
        suspicious_count += 1      # same as: suspicious_count = suspicious_count + 1

print("Total suspicious:", suspicious_count)  # prints 3</code></pre>

<h3>4) Loop anatomy — key terms</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}">Part</th><th style="${TH}">Purpose</th><th style="${TH}">Example</th></tr>
  <tr><td style="${TD}">Loop variable</td><td style="${TD}">Holds the current value each iteration</td><td style="${TDc}">event_id</td></tr>
  <tr><td style="${TD}"><code>range(a, b)</code></td><td style="${TD}">Generates integers from a to b−1</td><td style="${TDc}">range(1, 11) → 1..10</td></tr>
  <tr><td style="${TD}">Loop body</td><td style="${TD}">Indented code that runs each iteration</td><td style="${TDc}">    if event_id % 3 == 0:</td></tr>
  <tr><td style="${TD}"><code>+=</code></td><td style="${TD}">Increment shorthand</td><td style="${TDc}">count += 1</td></tr>
</table>

<h3>5) Bonus: <code>while</code> loops</h3>
<p>A <code>while</code> loop repeats as long as a condition is True — useful when you don't know how many times to loop:</p>
<pre><code>attempts = 0
while attempts < 3:
    print("Login attempt:", attempts + 1)
    attempts += 1
# Stops after 3 attempts (like a login lockout)</code></pre>

<h3>❌ Common mistakes</h3>
<ul>
  <li><b>Off-by-one in range:</b> <code>range(1, 10)</code> gives 1–9, not 1–10. Use <code>range(1, 11)</code> for 1–10.</li>
  <li><b>Resetting counter inside the loop:</b> <code>count = 0</code> inside the loop resets it every iteration → count always stays 0 or 1.</li>
  <li><b>Infinite while loop:</b> forgetting to increment your counter inside a <code>while</code> loop → program runs forever. Press Ctrl+C to stop.</li>
</ul>

<p><b>Your goal:</b> Scan events 1–10, flag those divisible by 3, count them, and print the total.</p>
`,
    minReadSeconds: 65,
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
      { key: "__BLANK1__", placeholder: "Start value (1)", expectedHint: "1" },
      { key: "__BLANK2__", placeholder: "Stop value — use 11 to include 10", expectedHint: "11" },
      { key: "__BLANK3__", placeholder: "Divisor for the rule (3)", expectedHint: "3" },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LESSON 5 — Functions
  // ═══════════════════════════════════════════════════════
  {
    id: "l5",
    title: "Lesson 5: Functions (Risk Scoring Functions)",
    objective: "Define functions with parameters and return values; call functions with different arguments; compose two functions.",
    concept: "Functions wrap reusable logic under a name. You define once, call many times — with different data. Real security systems have hundreds of functions like score_login(), detect_anomaly(), label_risk(). You'll build two of them.",
    steps: [
      "Define score_login_attempt(fails, new_device) that calculates and returns a risk number.",
      "Define label_risk(risk) that returns 'LOW', 'MEDIUM', or 'HIGH' based on thresholds.",
      "Call both functions with test values and print the results.",
      "Test with at least two different combinations of inputs.",
    ],
    checkpoint: "score_login_attempt(2, True) returns 70. label_risk(70) returns 'HIGH'. Both functions use return (not just print). Results are correct for multiple test cases.",
    materialHtml: `
<h3>🛡️ Functions = reusable security logic</h3>
<p>A real security system doesn't copy-paste its risk-scoring code in 50 places. It defines a <code>score_login()</code> function once, then calls it wherever needed. Functions make code reusable, testable, and easy to update — change the function once, everything using it automatically improves.</p>

<h3>1) Defining a function</h3>
<pre><code>def function_name(parameter1, parameter2):
    # code that runs when you call this function
    result = parameter1 + parameter2
    return result     # sends the value back to the caller</code></pre>
<p>Three key words: <code>def</code> starts the definition, <code>parameter</code> is the input placeholder, <code>return</code> sends the output back.</p>

<h3>2) Parameters vs Arguments</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}">Term</th><th style="${TH}">When</th><th style="${TH}">Example</th></tr>
  <tr><td style="${TD}"><b>Parameter</b></td><td style="${TD}">In the def line (the placeholder)</td><td style="${TDc}">def score(fails, new_device)</td></tr>
  <tr><td style="${TD}"><b>Argument</b></td><td style="${TD}">When you call the function (the real value)</td><td style="${TDc}">score(2, True)</td></tr>
</table>

<h3>3) Building a risk scoring function</h3>
<pre><code>def score_login_attempt(fails, new_device):
    """Returns a risk score (0-100) based on login behavior."""
    risk = fails * 20        # each failed attempt adds 20 points

    if new_device:           # unknown device adds another 30
        risk = risk + 30

    if risk > 100:           # cap at 100
        risk = 100

    return risk              # ← always return, don't just print

# Test calls
print(score_login_attempt(1, False))   # 20  — low risk
print(score_login_attempt(2, True))    # 70  — high risk
print(score_login_attempt(4, True))    # 100 — maxed out</code></pre>

<h3>4) Composing functions (calling one inside another)</h3>
<pre><code>def label_risk(risk):
    """Converts a numeric risk score to a label."""
    if risk >= 70:
        return "HIGH"
    elif risk >= 40:
        return "MEDIUM"
    else:
        return "LOW"

# Compose: use one function's output as another's input
risk = score_login_attempt(2, True)   # returns 70
label = label_risk(risk)              # returns "HIGH"
print(f"Risk: {risk} — Label: {label}")</code></pre>

<h3>5) <code>return</code> vs <code>print</code> — crucial difference</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}"></th><th style="${TH}"><code>return</code></th><th style="${TH}"><code>print</code></th></tr>
  <tr><td style="${TD}">What it does</td><td style="${TD}">Sends a value back to the caller</td><td style="${TD}">Displays a value in the console</td></tr>
  <tr><td style="${TD}">Reusable?</td><td style="${TD}">Yes — you can store it: <code>x = f()</code></td><td style="${TD}">No — it's display only</td></tr>
  <tr><td style="${TD}">Use in functions</td><td style="${TD}">Almost always prefer this</td><td style="${TD}">Only for user-facing output</td></tr>
</table>

<h3>❌ Common mistakes</h3>
<ul>
  <li><b>Forgetting return:</b> A function without <code>return</code> returns <code>None</code>. <code>label_risk(50) + " alert"</code> → TypeError if return is missing.</li>
  <li><b>Returning a print:</b> <code>return print("HIGH")</code> — <code>print()</code> returns <code>None</code>, so you get None back.</li>
  <li><b>Wrong indentation:</b> <code>return</code> must be inside the function (indented). If it's at the wrong level, it returns early or causes a SyntaxError.</li>
</ul>

<p><b>Your goal:</b> Build both functions, confirm they return correct values, and compose them on a test case.</p>
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
      { key: "__BLANK1__", placeholder: "Return the calculated risk", expectedHint: "risk" },
      { key: "__BLANK2__", placeholder: "HIGH threshold (70)", expectedHint: "70" },
      { key: "__BLANK3__", placeholder: "MEDIUM threshold (40)", expectedHint: "40" },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LESSON 6 — Lists
  // ═══════════════════════════════════════════════════════
  {
    id: "l6",
    title: "Lesson 6: Lists (Threat Feed + Basic Analytics)",
    objective: "Create and iterate over lists; use sum(), len(), and min()/max(); count items matching a condition.",
    concept: "Lists store multiple values in order under one variable name. You'll analyze a threat feed of risk scores — computing totals, averages, and high-alert counts exactly like a dashboard analytics module would.",
    steps: [
      "Create a list of 5–6 risk scores representing recent alerts.",
      "Use sum() and len() to compute the total and average.",
      "Loop through the list and count how many scores are high risk (>= 70).",
      "Print a clean analytics summary with all three stats.",
    ],
    checkpoint: "Output shows total, average (correct decimal), and high-risk count. The count matches the number of scores >= 70 in your list.",
    materialHtml: `
<h3>🛡️ Lists = collections of security events</h3>
<p>A threat intelligence feed might deliver 200 risk scores per hour. You need one variable to hold all of them, then compute stats across the whole collection. That's exactly what Python lists do — store many values in one container and let you process them together.</p>

<h3>1) Creating a list</h3>
<pre><code># A list holds multiple values, separated by commas, inside []
risk_scores = [15, 42, 88, 73, 60, 95]

# Access by index (starts at 0)
print(risk_scores[0])    # 15 — first item
print(risk_scores[-1])   # 95 — last item
print(len(risk_scores))  # 6  — number of items</code></pre>

<h3>2) Built-in list analytics</h3>
<pre><code>scores = [15, 42, 88, 73, 60, 95]

total = sum(scores)           # 373
count = len(scores)           # 6
average = total / count       # 62.17
highest = max(scores)         # 95
lowest  = min(scores)         # 15

print(f"Avg risk: {average:.1f} | Max: {highest}")</code></pre>
<p><code>:.1f</code> inside an f-string rounds a float to 1 decimal place.</p>

<h3>3) Looping and counting with a condition</h3>
<pre><code>high_count = 0      # counter starts at 0

for score in scores:          # 'score' takes each value in turn
    if score >= 70:
        print("HIGH alert:", score)
        high_count += 1

print("Total high-risk events:", high_count)   # 3</code></pre>

<h3>4) Useful list methods</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}">Method</th><th style="${TH}">What it does</th><th style="${TH}">Example</th></tr>
  <tr><td style="${TDc}">.append(x)</td><td style="${TD}">Adds x to the end of the list</td><td style="${TDc}">scores.append(55)</td></tr>
  <tr><td style="${TDc}">.remove(x)</td><td style="${TD}">Removes the first occurrence of x</td><td style="${TDc}">scores.remove(15)</td></tr>
  <tr><td style="${TDc}">.sort()</td><td style="${TD}">Sorts the list in place</td><td style="${TDc}">scores.sort()</td></tr>
  <tr><td style="${TDc}">.reverse()</td><td style="${TD}">Reverses the list in place</td><td style="${TDc}">scores.reverse()</td></tr>
  <tr><td style="${TDc}">x in list</td><td style="${TD}">True if x is in the list</td><td style="${TDc}">95 in scores → True</td></tr>
</table>

<h3>5) Building an analytics function</h3>
<pre><code>def analyze_feed(scores):
    total     = sum(scores)
    average   = total / len(scores)
    high_risk = sum(1 for s in scores if s >= 70)  # compact count
    return total, average, high_risk

total, avg, highs = analyze_feed(risk_scores)
print(f"Events: {len(risk_scores)} | Avg: {avg:.1f} | HIGH: {highs}")</code></pre>

<h3>❌ Common mistakes</h3>
<ul>
  <li><b>Dividing by zero:</b> if your list is empty, <code>total / len(scores)</code> → <b>ZeroDivisionError</b>. Check <code>if len(scores) &gt; 0</code> first.</li>
  <li><b>Index out of range:</b> <code>scores[10]</code> on a 6-item list → <b>IndexError</b>. Last valid index is <code>len(scores) - 1</code>.</li>
  <li><b>Modifying a list while looping through it:</b> can cause skipped items. Loop a copy: <code>for s in scores[:]</code>.</li>
</ul>

<p><b>Your goal:</b> Create a risk score list, compute total/average/high-risk count, and print a clean analytics summary.</p>
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
avg   = __BLANK2__

high_count = 0
for s in risk_scores:
    if s >= __BLANK3__:
        high_count = high_count + 1

print("Total:", total)
print("Average:", avg)
print("High risk count:", high_count)
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Sum of the list", expectedHint: "sum(risk_scores)" },
      { key: "__BLANK2__", placeholder: "Average = total / count", expectedHint: "total / len(risk_scores)" },
      { key: "__BLANK3__", placeholder: "High-risk threshold", expectedHint: "70" },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LESSON 7 — Dictionaries
  // ═══════════════════════════════════════════════════════
  {
    id: "l7",
    title: "Lesson 7: Dictionaries (Device Inventory Records)",
    objective: "Create dictionaries with key-value pairs; access and update fields; loop through .items().",
    concept: "A dictionary stores labeled fields — like a database row or a JSON record. Each key maps to a value. You'll model a device record: owner, OS, risk score, patched status — exactly the data a network inventory system would track.",
    steps: [
      "Create a device dictionary with keys: owner, os, risk, patched.",
      "Access and print specific fields using device['key'] notation.",
      "Update the risk and patched fields after a simulated patch operation.",
      "Loop through device.items() to print all fields at once.",
    ],
    checkpoint: "Original values print correctly. After update, risk shows the new value and patched shows True. The .items() loop prints every key-value pair.",
    materialHtml: `
<h3>🛡️ Dictionaries = structured records</h3>
<p>A security dashboard tracks thousands of devices. Each device has a profile: who owns it, what OS it runs, its current risk score, whether it's been patched. This is a dictionary — a structured collection of labeled fields. It's the Python equivalent of a database row or a JSON object from an API.</p>

<h3>1) Creating a dictionary</h3>
<pre><code># Keys are strings. Values can be any type.
device = {
    "owner":   "Ava",
    "os":      "Windows 11",
    "risk":    42,
    "patched": False
}</code></pre>
<p>Use curly braces <code>{}</code>. Each entry is <code>"key": value</code>, separated by commas.</p>

<h3>2) Accessing values by key</h3>
<pre><code>print(device["owner"])    # "Ava"
print(device["risk"])     # 42
print(device["patched"])  # False

# Safe access — returns None if key doesn't exist (no crash)
print(device.get("ip_address"))   # None
print(device.get("ip_address", "unknown"))  # "unknown"</code></pre>

<h3>3) Updating fields</h3>
<pre><code># Patch the device — update risk and patched status
device["risk"]    = 5      # new risk score after patch
device["patched"] = True   # mark as patched

print(device)
# {'owner': 'Ava', 'os': 'Windows 11', 'risk': 5, 'patched': True}</code></pre>

<h3>4) Looping through a dictionary</h3>
<pre><code># .items() gives you each key-value pair
for key, value in device.items():
    print(f"{key}: {value}")

# Output:
# owner: Ava
# os: Windows 11
# risk: 5
# patched: True</code></pre>

<h3>5) Key dictionary operations</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}">Operation</th><th style="${TH}">Syntax</th><th style="${TH}">Result</th></tr>
  <tr><td style="${TD}">Access a value</td><td style="${TDc}">d["key"]</td><td style="${TD}">Returns the value; KeyError if missing</td></tr>
  <tr><td style="${TD}">Safe access</td><td style="${TDc}">d.get("key")</td><td style="${TD}">Returns value or None (no crash)</td></tr>
  <tr><td style="${TD}">Add / update</td><td style="${TDc}">d["key"] = value</td><td style="${TD}">Creates or replaces the field</td></tr>
  <tr><td style="${TD}">Delete a key</td><td style="${TDc}">del d["key"]</td><td style="${TD}">Removes the key-value pair</td></tr>
  <tr><td style="${TD}">All keys</td><td style="${TDc}">d.keys()</td><td style="${TD}">dict_keys(['owner', 'os', ...])</td></tr>
  <tr><td style="${TD}">All values</td><td style="${TDc}">d.values()</td><td style="${TD}">dict_values(['Ava', 'Windows 11', ...])</td></tr>
  <tr><td style="${TD}">All pairs</td><td style="${TDc}">d.items()</td><td style="${TD}">dict_items([('owner','Ava'), ...])</td></tr>
</table>

<h3>❌ Common mistakes</h3>
<ul>
  <li><b>KeyError:</b> <code>device["ip"]</code> when "ip" doesn't exist → crash. Use <code>.get()</code> for uncertain keys.</li>
  <li><b>Using = instead of ==:</b> <code>if device["patched"] = True</code> → SyntaxError. Use <code>==</code> to compare.</li>
  <li><b>Forgetting quotes around keys:</b> <code>device[owner]</code> → Python looks for a variable named <code>owner</code>. Keys need quotes: <code>device["owner"]</code>.</li>
</ul>

<p><b>Your goal:</b> Create a device record, access its fields, simulate a patch update, and print the full updated record.</p>
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
    "owner":   __BLANK1__,
    "os":      __BLANK2__,
    "risk":    __BLANK3__,
    "patched": __BLANK4__
}

print("Owner:", device[__BLANK5__])
print("OS:",    device[__BLANK6__])
print("Risk:",  device[__BLANK7__])

# After patching:
device[__BLANK8__]  = __BLANK9__
device[__BLANK10__] = True

print("Updated:", device)
`,
    blanks: [
      { key: "__BLANK1__",  placeholder: 'Owner name string', expectedHint: '"Ava"' },
      { key: "__BLANK2__",  placeholder: 'OS string',         expectedHint: '"Windows"' },
      { key: "__BLANK3__",  placeholder: "Risk number",       expectedHint: "42" },
      { key: "__BLANK4__",  placeholder: "Bool — not yet patched", expectedHint: "False" },
      { key: "__BLANK5__",  placeholder: 'Key: "owner"',      expectedHint: '"owner"' },
      { key: "__BLANK6__",  placeholder: 'Key: "os"',         expectedHint: '"os"' },
      { key: "__BLANK7__",  placeholder: 'Key: "risk"',       expectedHint: '"risk"' },
      { key: "__BLANK8__",  placeholder: 'Key to update',     expectedHint: '"risk"' },
      { key: "__BLANK9__",  placeholder: "New risk after patch", expectedHint: "5" },
      { key: "__BLANK10__", placeholder: 'Key: "patched"',    expectedHint: '"patched"' },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LESSON 8 — Strings
  // ═══════════════════════════════════════════════════════
  {
    id: "l8",
    title: "Lesson 8: Strings (Log Parsing + Keyword Detection)",
    objective: "Use lower(), split(), and the 'in' operator to normalize log lines and detect threat keywords.",
    concept: "Security log analysis starts with text processing. Log lines arrive in inconsistent formats — mixed case, varying spacing. You'll normalize with lower(), tokenize with split(), then detect keywords with 'in'. This is how real IDS tools work.",
    steps: [
      "Convert a log line to lowercase using .lower().",
      "Split it into a list of words using .split().",
      "Use 'in' to check if a threat keyword like 'failed' is present.",
      "Print the normalized line, the word list, and the detection result.",
    ],
    checkpoint: 'For "FAILED Login From IP 10.0.0.5": clean prints all lowercase, words is a 5-item list, and "ALERT: failed login detected" prints. No crashes.',
    materialHtml: `
<h3>🛡️ Why strings power threat detection</h3>
<p>Every login attempt, network packet, and file access leaves a text record — a log line. Security tools parse thousands of these every second. Before you can detect anything, you need to <b>normalize</b> the text (same case, same format) and <b>tokenize</b> it (split into searchable parts). That's what this lesson covers.</p>

<h3>1) Strings are sequences of characters</h3>
<pre><code>log = "FAILED Login From IP 10.0.0.5"

print(log[0])       # 'F'  — first character
print(log[-1])      # '5'  — last character
print(log[0:6])     # 'FAILED'  — slice characters 0 through 5
print(len(log))     # 31 — total characters</code></pre>

<h3>2) Normalize with <code>.lower()</code></h3>
<p>Log lines arrive inconsistently. <code>"FAILED"</code>, <code>"Failed"</code>, and <code>"failed"</code> all mean the same threat — but Python sees three different strings. <code>lower()</code> standardizes everything.</p>
<pre><code>log   = "FAILED Login From IP 10.0.0.5"
clean = log.lower()
print(clean)
# → "failed login from ip 10.0.0.5"

# The original log is unchanged — strings are immutable
print(log)   # still "FAILED Login From IP 10.0.0.5"</code></pre>

<h3>3) Tokenize with <code>.split()</code></h3>
<p><code>split()</code> breaks a string at whitespace and returns a list of tokens — individual words you can inspect one by one.</p>
<pre><code>clean = "failed login from ip 10.0.0.5"
words = clean.split()
print(words)
# → ['failed', 'login', 'from', 'ip', '10.0.0.5']

print(words[0])   # 'failed'
print(words[-1])  # '10.0.0.5' — the IP address</code></pre>

<h3>4) Detect keywords with <code>in</code></h3>
<p>The <code>in</code> operator checks membership in a sequence. Returns <code>True</code> or <code>False</code>.</p>
<pre><code>if "failed" in words:
    print("⚠️  ALERT: failed login detected")

if "malware" in words:
    print("🚨 CRITICAL: malware keyword")
else:
    print("✓ No malware keyword found")</code></pre>

<h3>5) String methods — full reference</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}">Method</th><th style="${TH}">What it returns</th><th style="${TH}">Cyber use</th></tr>
  <tr><td style="${TDc}">.lower()</td><td style="${TD}">New string, all lowercase</td><td style="${TD}">Normalize before keyword matching</td></tr>
  <tr><td style="${TDc}">.upper()</td><td style="${TD}">New string, all uppercase</td><td style="${TD}">Formatting alert headers</td></tr>
  <tr><td style="${TDc}">.split()</td><td style="${TD}">List of words</td><td style="${TD}">Tokenize log lines</td></tr>
  <tr><td style="${TDc}">.replace(a,b)</td><td style="${TD}">New string with a swapped for b</td><td style="${TD}">Redact IPs, sanitize output</td></tr>
  <tr><td style="${TDc}">.strip()</td><td style="${TD}">New string, no leading/trailing spaces</td><td style="${TD}">Clean messy input</td></tr>
  <tr><td style="${TDc}">.find(sub)</td><td style="${TD}">Index of sub, or −1 if absent</td><td style="${TD}">Locate field positions in fixed logs</td></tr>
  <tr><td style="${TDc}">len(s)</td><td style="${TD}">Number of characters</td><td style="${TD}">Validate input length, detect padding</td></tr>
</table>

<h3>6) Immutability — strings never change in place</h3>
<p>Every string method returns a <b>new string</b>. The original is never modified — naturally tamper-resistant, like an audit log.</p>
<pre><code>log   = "FAILED Login"
clean = log.lower()   # creates a NEW string

print(log)    # "FAILED Login" — unchanged
print(clean)  # "failed login" — new variable</code></pre>

<h3>❌ Common mistakes</h3>
<ul>
  <li><b>Not saving the result:</b> <code>log.lower()</code> without assigning → the normalized version is lost. Always: <code>clean = log.lower()</code>.</li>
  <li><b>Checking before normalizing:</b> <code>"failed" in log</code> on the original (uppercase) string → False. Always <code>lower()</code> first.</li>
  <li><b>Checking a string instead of a list:</b> <code>"failed" in clean</code> also works but checks for the substring anywhere. <code>"failed" in words</code> checks for an exact token. Both are useful but different.</li>
</ul>

<p><b>Your goal:</b> Normalize a log line → tokenize it → detect a keyword → print the results.</p>
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
      { key: "__BLANK2__", placeholder: "Split into list",  expectedHint: "split" },
      { key: "__BLANK3__", placeholder: 'Keyword check — "failed" in words', expectedHint: '"failed" in words' },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LESSON 9 — Exceptions
  // ═══════════════════════════════════════════════════════
  {
    id: "l9",
    title: "Lesson 9: Debugging & Exceptions (Safe Data Cleaning)",
    objective: "Use try/except to catch errors; handle specific exception types; keep programs running on bad input.",
    concept: "Real data is messy — user input can be empty, CSV fields can say 'N/A', sensors can return null. A production tool must handle these without crashing. try/except is how Python catches errors and responds gracefully.",
    steps: [
      "Write a try block that converts a text value to int.",
      "Write an except block that catches the ValueError and prints a friendly message.",
      "Test with a valid number ('10') — program should compute x * 5.",
      "Test with an invalid value ('N/A') — program should print the error message, not crash.",
    ],
    checkpoint: 'value = "10" → prints "x*5 = 50". value = "N/A" → prints a friendly error message (not a stack trace). Program does not crash on either input.',
    materialHtml: `
<h3>🛡️ Real data is messy — your code needs armor</h3>
<p>Security dashboards ingest data from dozens of sources: network scanners, user forms, CSV exports, third-party APIs. That data is often incomplete, misformatted, or missing entirely. A tool that crashes on bad input is a tool that stops protecting. <code>try/except</code> keeps your program running no matter what arrives.</p>

<h3>1) What happens without exception handling</h3>
<pre><code># This crashes if value is not a number
value = "N/A"
x = int(value)         # ← ValueError here
print("x * 5 =", x * 5)
# Output: ValueError: invalid literal for int() with base 10: 'N/A'
# Program stops immediately — nothing after this runs</code></pre>

<h3>2) The <code>try / except</code> pattern</h3>
<pre><code>try:
    x = int(value)         # try this — may fail
    print("x * 5 =", x * 5)
except ValueError:
    print("Invalid number — expected digits, got:", value)
# Program continues here regardless</code></pre>
<p>Python tries the <code>try</code> block. If an error occurs, it jumps to the matching <code>except</code> block instead of crashing.</p>

<h3>3) Common exception types</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}">Exception</th><th style="${TH}">When it occurs</th><th style="${TH}">Example trigger</th></tr>
  <tr><td style="${TDc}">ValueError</td><td style="${TD}">Wrong value for the operation</td><td style="${TDc}">int("N/A")</td></tr>
  <tr><td style="${TDc}">TypeError</td><td style="${TD}">Wrong type for the operation</td><td style="${TDc}">"5" + 5</td></tr>
  <tr><td style="${TDc}">ZeroDivisionError</td><td style="${TD}">Dividing by zero</td><td style="${TDc}">100 / 0</td></tr>
  <tr><td style="${TDc}">KeyError</td><td style="${TD}">Dict key doesn't exist</td><td style="${TDc}">d["missing"]</td></tr>
  <tr><td style="${TDc}">IndexError</td><td style="${TD}">List index out of range</td><td style="${TDc}">lst[99] on a 3-item list</td></tr>
  <tr><td style="${TDc}">FileNotFoundError</td><td style="${TD}">File doesn't exist</td><td style="${TDc}">open("ghost.txt")</td></tr>
</table>

<h3>4) Handling multiple exception types</h3>
<pre><code>try:
    x = int(value)
    result = 100 / x
    print("Result:", result)
except ValueError:
    print("Not a number:", value)
except ZeroDivisionError:
    print("Can't divide by zero")
except Exception as e:
    print("Unexpected error:", e)   # catch-all safety net</code></pre>

<h3>5) <code>finally</code> — code that always runs</h3>
<pre><code>try:
    x = int(value)
    print("Converted:", x)
except ValueError:
    print("Bad value, using default 0")
    x = 0
finally:
    print("Processing complete")   # runs whether error or not</code></pre>
<p><code>finally</code> is useful for cleanup — closing files, logging, resetting state — regardless of success or failure.</p>

<h3>❌ Common mistakes</h3>
<ul>
  <li><b>Bare except:</b> <code>except:</code> with no type catches everything silently — including bugs you should see. Be specific: <code>except ValueError</code>.</li>
  <li><b>Catching too broadly:</b> putting 20 lines in one <code>try</code> block makes it hard to know which line failed. Keep try blocks small and targeted.</li>
  <li><b>Swallowing errors:</b> <code>except: pass</code> makes errors completely invisible. At minimum, print a message so you know something went wrong.</li>
</ul>

<p><b>Your goal:</b> Wrap a type conversion in try/except, handle the ValueError gracefully, and keep the program running on both valid and invalid inputs.</p>
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
except ValueError:
    print(__BLANK3__)
`,
    blanks: [
      { key: "__BLANK1__", placeholder: "Convert value to int", expectedHint: "int(value)" },
      { key: "__BLANK2__", placeholder: "Multiply x by 5",      expectedHint: "x * 5" },
      { key: "__BLANK3__", placeholder: "Friendly error message string", expectedHint: '"Invalid number — expected digits"' },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LESSON 10 — Capstone
  // ═══════════════════════════════════════════════════════
  {
    id: "l10",
    title: "Lesson 10: Capstone (Portfolio Mini SOC Dashboard)",
    objective: "Combine all prior concepts into a working SOC tool: input collection, parsing, scoring, storage, and analytics.",
    concept: "This capstone integrates everything from Lessons 1–9: variables, input, conditionals, loops, functions, lists, dicts, strings, and exceptions. You'll build a mini Security Operations Center dashboard — real enough to put in your portfolio.",
    steps: [
      "Use a while loop to collect log lines from the user until they type 'done'.",
      "Call score_event() and label_risk() on each line — the functions you learned in L5.",
      "Store each event as a dictionary in a list — combining L6 and L7 skills.",
      "After input ends, print a report: total events, high alert count, average risk.",
    ],
    checkpoint: "Enter 3+ log lines including one with 'failed' or 'malware'. Type 'done'. Report shows correct total, high-risk count, and average. Each event prints with number, label, risk, and raw text.",
    materialHtml: `
<h3>🛡️ You've built every piece — now connect them</h3>
<p>A real Security Operations Center tool does exactly what you're about to build: it ingests log events, scores each one, stores them, then generates a summary report for the analyst. You already know every technique this requires. This lesson is about combining them intentionally.</p>

<h3>Concept map — what each lesson contributes</h3>
<table style="width:100%;border-collapse:collapse;margin:8px 0 14px">
  <tr><th style="${TH}">Skill</th><th style="${TH}">From lesson</th><th style="${TH}">Role in the capstone</th></tr>
  <tr><td style="${TD}">Variables & types</td><td style="${TD}">L1</td><td style="${TD}">Store counts, totals, labels</td></tr>
  <tr><td style="${TD}">Input</td><td style="${TD}">L2</td><td style="${TD}">Collect log lines from the user</td></tr>
  <tr><td style="${TD}">Conditionals</td><td style="${TD}">L3</td><td style="${TD}">Risk labeling inside score_event()</td></tr>
  <tr><td style="${TD}">Loops</td><td style="${TD}">L4</td><td style="${TD}">while loop for input; for loop for report</td></tr>
  <tr><td style="${TD}">Functions</td><td style="${TD}">L5</td><td style="${TD}">score_event() and label_risk() defined once, called many times</td></tr>
  <tr><td style="${TD}">Lists</td><td style="${TD}">L6</td><td style="${TD}">events list accumulates all records</td></tr>
  <tr><td style="${TD}">Dictionaries</td><td style="${TD}">L7</td><td style="${TD}">Each event stored as {"raw", "risk", "label"}</td></tr>
  <tr><td style="${TD}">Strings</td><td style="${TD}">L8</td><td style="${TD}">lower() and 'in' for keyword scoring</td></tr>
  <tr><td style="${TD}">Exceptions</td><td style="${TD}">L9</td><td style="${TD}">Optional: wrap input conversion safely</td></tr>
</table>

<h3>Architecture: how the pieces connect</h3>
<pre><code># STEP 1: Define the scoring function (strings + conditionals)
def score_event(text):
    t    = text.lower()       # normalize (L8)
    risk = 10                 # base score

    if "failed"  in t: risk += 40   # keyword rules (L3 + L8)
    if "blocked" in t: risk += 30
    if "malware" in t: risk += 60

    return min(risk, 100)     # cap at 100 (L5)

# STEP 2: Define the label function (conditionals + return)
def label_risk(risk):
    if risk >= 70: return "HIGH"    # (L3 + L5)
    if risk >= 40: return "MEDIUM"
    return "LOW"</code></pre>

<pre><code># STEP 3: Collect events in a loop (input + while + lists + dicts)
events = []                   # list to hold all events (L6)

while True:                   # keep asking until "done" (L4)
    line = input("Log (or 'done'): ")
    if line.lower() == "done":
        break

    risk  = score_event(line)           # function call (L5)
    label = label_risk(risk)
    events.append({"raw": line, "risk": risk, "label": label})   # dict in list (L6+L7)</code></pre>

<pre><code># STEP 4: Print the analytics report (lists + dicts + loops + math)
print("\\n=== MINI SOC REPORT ===")
print("Total events:", len(events))

total_risk  = sum(e["risk"] for e in events)
high_count  = sum(1 for e in events if e["label"] == "HIGH")
avg_risk    = total_risk / len(events) if events else 0

print(f"High alerts : {high_count}")
print(f"Average risk: {avg_risk:.1f}")

print("\\nEvent log:")
for i, e in enumerate(events, start=1):
    print(f"  {i}. [{e['label']:6}] risk={e['risk']:3}  {e['raw']}")</code></pre>

<h3>What makes this portfolio-ready</h3>
<ul>
  <li><b>Real scenario:</b> it mirrors actual SOC tooling patterns</li>
  <li><b>Modular:</b> score_event() and label_risk() are separate, testable functions</li>
  <li><b>Scalable:</b> add more keywords to score_event() without changing anything else</li>
  <li><b>Analytics:</b> summary report with counts, averages, and per-event breakdown</li>
</ul>

<h3>Test cases to try</h3>
<pre><code># Enter these as logs when prompted:
"FAILED login from 10.0.0.5"         # risk=50, MEDIUM
"blocked connection from unknown"     # risk=40, MEDIUM
"malware detected in C:/temp"         # risk=70, HIGH
"normal user activity"                # risk=10, LOW
# Then type: done</code></pre>

<p><b>Your goal:</b> Run the dashboard, enter at least 4 diverse log lines, type done, and review your report. The average and high count should reflect your inputs exactly.</p>
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
def score_event(text):
    t    = text.lower()
    risk = 10
    if "failed"  in t: risk += 40
    if "blocked" in t: risk += 30
    if "malware" in t: risk += 60
    if risk > 100: risk = 100
    return risk

def label_risk(risk):
    if risk >= 70: return "HIGH"
    if risk >= 40: return "MEDIUM"
    return "LOW"

events = []

while True:
    line = input("Log (or 'done'): ")
    if line.lower() == "done":
        break
    risk  = __BLANK1__
    label = __BLANK2__
    events.append({"raw": line, "risk": risk, "label": label})

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
      { key: "__BLANK1__", placeholder: "Call score_event with line", expectedHint: "score_event(line)" },
      { key: "__BLANK2__", placeholder: "Call label_risk with risk",  expectedHint: "label_risk(risk)" },
    ],
  },

];
