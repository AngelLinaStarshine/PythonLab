export const lab8 = {
  lessonId: "l8",
  title: "Lab 8: Strings",
  subtitle: "Log Parsing + Keyword Detection",
  estimatedMinutes: 30,
  objectives: [
    "Normalize log text with lower() for consistent detection.",
    "Tokenize a log line into words with split().",
    "Detect threat keywords using the 'in' operator.",
    "Extract structured fields from a log line using string methods.",
  ],
  intro: `Security log analysis is fundamentally a text-processing problem. Logs arrive in
mixed case, varying formats, and inconsistent spacing. Before any rule can run,
the text must be normalized. In this lab you build the preprocessing pipeline
that every real log parser uses, step by step.`,
  exercises: [
    {
      id: "e1",
      title: "Exercise 1, Normalize with lower() and verify immutability",
      prompt: `Take the log line below and convert it to lowercase.
Then prove strings are immutable: print both the original and the normalized version
to show the original is unchanged.`,
      starter: `# Exercise 1: Normalize and verify immutability
log = "FAILED Login From IP 192.168.1.42, UserAgent: Chrome"

clean = log.__BLANK__()

print("Original  :", log)     # should still be uppercase
print("Normalized:", clean)   # should be all lowercase`,
      hints: [
        ".lower() returns a new lowercase string.",
        "The original log variable is never changed, strings are immutable.",
        "Always assign the result: clean = log.lower()",
      ],
      solution: `log = "FAILED Login From IP 192.168.1.42, UserAgent: Chrome"
clean = log.lower()

print("Original  :", log)
print("Normalized:", clean)`,
      expectedOutput: `Original  : FAILED Login From IP 192.168.1.42, UserAgent: Chrome
Normalized: failed login from ip 192.168.1.42, useragent: chrome`,
      afterNote:
        "String immutability means you can never accidentally corrupt the original log. Every transformation creates a new string, original data is always safe.",
    },
    {
      id: "e2",
      title: "Exercise 2, Tokenize with split()",
      prompt: `Split the normalized log line into individual words (tokens).
Then print:
  • The full token list
  • The number of tokens
  • The first and last token`,
      starter: `# Exercise 2: Tokenize the log line
log   = "FAILED Login From IP 192.168.1.42"
clean = log.lower()
words = clean.__BLANK__()

print("Tokens :", words)
print("Count  :", len(__BLANK__))
print("First  :", words[__BLANK__])
print("Last   :", words[__BLANK__])`,
      hints: [
        ".split() with no arguments splits on whitespace.",
        "len(words) gives the number of tokens.",
        "words[0] is the first, words[-1] is the last.",
      ],
      solution: `log   = "FAILED Login From IP 192.168.1.42"
clean = log.lower()
words = clean.split()

print("Tokens :", words)
print("Count  :", len(words))
print("First  :", words[0])
print("Last   :", words[-1])`,
      expectedOutput: `Tokens : ['failed', 'login', 'from', 'ip', '192.168.1.42']
Count  : 5
First  : failed
Last   : 192.168.1.42`,
      afterNote:
        "The last token, the IP address, can be extracted from any log line with this pattern without knowing how long the line is. words[-1] always gives the last item.",
    },
    {
      id: "e3",
      title: "Exercise 3, Keyword detection scanner",
      prompt: `Build a keyword detector. Given a log line and a list of threat keywords,
check each keyword and print a result for each one.

Keywords to check: ["failed", "blocked", "malware", "root", "exploit"]`,
      starter: `# Exercise 3: Multi-keyword scanner
log      = "blocked connection from root user, exploit attempt"
keywords = ["failed", "blocked", "malware", "root", "exploit"]

clean = log.lower()
words = clean.split()

print(f"Log: {log}")
print("Detection Results")

for keyword in keywords:
    if __BLANK__ in words:
        print(f"  [ALERT] '{keyword}' detected")
    else:
        print(f"  [  OK ] '{keyword}' not found")`,
      hints: [
        "Check if keyword is in the words list: keyword in words.",
        "The for loop gives you each keyword in turn.",
        "blocked, root, exploit should be detected. failed and malware should not.",
      ],
      solution: `log      = "blocked connection from root user, exploit attempt"
keywords = ["failed", "blocked", "malware", "root", "exploit"]

clean = log.lower()
words = clean.split()

print(f"Log: {log}")
print("Detection Results")

for keyword in keywords:
    if keyword in words:
        print(f"  [ALERT] '{keyword}' detected")
    else:
        print(f"  [  OK ] '{keyword}' not found")`,
      expectedOutput: `Log: blocked connection from root user, exploit attempt
Detection Results
  [  OK ] 'failed' not found
  [ALERT] 'blocked' detected
  [  OK ] 'malware' not found
  [ALERT] 'root' detected
  [ALERT] 'exploit' detected`,
      afterNote:
        "This is rule-based detection, the same approach used in Snort, Suricata, and other open-source IDS tools. The keywords list is your ruleset; the log is your event.",
    },
    {
      id: "e4",
      title: "Exercise 4, Build a full log parser function",
      prompt: `Build a function parse_log(log_line) that:
  1. Normalizes the line (lower)
  2. Tokenizes it (split)
  3. Computes a risk score: +30 per threat keyword found
  4. Extracts the IP address (assume it's the 4th token, index 3)
  5. Returns a dict: {ip, keywords_found, risk_score}

Test it on two different log lines.`,
      starter: `# Exercise 4: Full log parser function
THREAT_KEYWORDS = ["failed", "blocked", "malware", "exploit", "root", "unauthorized"]

def parse_log(log_line):
    clean  = log_line.__BLANK__()
    words  = clean.__BLANK__()

    found  = [kw for kw in THREAT_KEYWORDS if kw in words]
    risk   = len(found) * __BLANK__

    # Extract IP, token at index 3 (or "unknown" if not present)
    ip = words[3] if len(words) > 3 else "unknown"

    return {
        "ip"            : ip,
        "keywords_found": found,
        "risk_score"    : min(risk, 100),
    }

# Test
logs = [
    "failed login from 10.0.0.5 unauthorized access blocked",
    "normal activity from 192.168.1.1 user logged out",
]

for log in logs:
    result = parse_log(log)
    print(f"IP: {result['ip']}  risk: {result['risk_score']}  keywords: {result['keywords_found']}")`,
      hints: [
        ".lower() and .split(), same pattern as before.",
        "Risk per keyword = 30.",
        "[kw for kw in list if kw in words] is a list comprehension, it builds a filtered list.",
      ],
      solution: `THREAT_KEYWORDS = ["failed", "blocked", "malware", "exploit", "root", "unauthorized"]

def parse_log(log_line):
    clean = log_line.lower()
    words = clean.split()
    found = [kw for kw in THREAT_KEYWORDS if kw in words]
    risk  = len(found) * 30
    ip    = words[3] if len(words) > 3 else "unknown"
    return {
        "ip"            : ip,
        "keywords_found": found,
        "risk_score"    : min(risk, 100),
    }

logs = [
    "failed login from 10.0.0.5 unauthorized access blocked",
    "normal activity from 192.168.1.1 user logged out",
]

for log in logs:
    result = parse_log(log)
    print(f"IP: {result['ip']}  risk: {result['risk_score']}  keywords: {result['keywords_found']}")`,
      expectedOutput: `IP: 10.0.0.5  risk: 90  keywords: ['failed', 'blocked', 'unauthorized']
IP: 192.168.1.1  risk: 0  keywords: []`,
      afterNote:
        "parse_log() is a complete log parsing function, exactly the kind of function you'd write in a real SIEM integration. The list comprehension [kw for ... if ...] is a concise Pythonic pattern worth memorizing.",
    },
  ],
  wrapUp: {
    message:
      "Lab 8 complete! You can now normalize, tokenize, and detect patterns in any text string, the core skill of log analysis and NLP preprocessing.",
    nextLesson: "Next up: Lesson 9, keeping your tools running on messy data with try/except.",
    keyTakeaways: [
      ".lower() normalizes case, always do this before keyword matching.",
      ".split() tokenizes into a word list, enables exact token matching.",
      "keyword in words, checks for exact token presence.",
      "Strings are immutable, methods always return a new string.",
      "List comprehensions [x for x in list if condition] are compact filters.",
    ],
  },
};
