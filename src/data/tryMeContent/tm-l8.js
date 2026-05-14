export const tryMeL8 = {
  lessonId: "l8",
  ttsIntro:
    "Welcome to Lesson 8: Strings and Log Parsing. Security log analysis is text processing. In this lesson you will use lower to normalize, split to tokenize, and the in operator to detect threat keywords — the exact pipeline used in commercial security tools.",
  sections: [
    {
      id: "s1",
      icon: "🛡️",
      heading: "Why Strings Power Threat Detection",
      body: "Every login attempt and network request leaves a text record. Before any rule can run, the text must be normalized to a consistent format and tokenized into individual words. This is the same preprocessing pipeline used by enterprise IDS tools.",
      code: null,
      tryMe: null,
      tip: null,
    },
    {
      id: "s2",
      icon: "🔡",
      heading: "Normalize with lower()",
      body: "FAILED in uppercase, Failed with a capital, and failed lowercase all mean the same thing but Python sees three different strings. lower() converts the entire string to lowercase. It returns a new string — the original is never changed because strings are immutable.",
      code: `log   = "FAILED Login From IP 10.0.0.5"
clean = log.lower()
print(clean)  # "failed login from ip 10.0.0.5"
print(log)    # unchanged — strings are immutable`,
      tryMe: {
        starter: `log   = "FAILED Login From IP 10.0.0.5"
clean = log.lower()

print("Original  :", log)
print("Normalized:", clean)`,
        expectedOutput:
          "Original  : FAILED Login From IP 10.0.0.5\nNormalized: failed login from ip 10.0.0.5",
        hint: "The original log is unchanged. lower() creates a new string stored in clean.",
      },
      tip: "Always normalize before any keyword check. One missed uppercase letter silently bypasses your detection rule.",
    },
    {
      id: "s3",
      icon: "✂️",
      heading: "Tokenize with split()",
      body: "split() breaks a string into a list of words at whitespace. Each word becomes a separate element. You can then check each token individually with the in operator.",
      code: `clean = "failed login from ip 10.0.0.5"
words = clean.split()
print(words)        # ['failed','login','from','ip','10.0.0.5']
print(words[0])     # 'failed'
print(words[-1])    # '10.0.0.5'`,
      tryMe: {
        starter: `log   = "FAILED Login From IP 192.168.1.42"
clean = log.lower()
words = clean.split()

print("Tokens:", words)
print("Count:", len(words))
print("First:", words[0])
print("IP:", words[-1])`,
        expectedOutput:
          "Tokens: ['failed', 'login', 'from', 'ip', '192.168.1.42']\nCount: 5\nFirst: failed\nIP: 192.168.1.42",
        hint: "words[-1] always gives the last token — the IP address — regardless of line length.",
      },
      tip: null,
    },
    {
      id: "s4",
      icon: "🔍",
      heading: "Keyword Detection with 'in'",
      body: "The in operator checks if a value exists in a sequence and returns True or False. Combined with a list of threat keywords and a loop, this builds a complete multi-keyword scanner.",
      code: `words    = ['failed','login','from','ip','10.0.0.5']
keywords = ["failed","blocked","malware","exploit"]

for kw in keywords:
    if kw in words:
        print(f"[ALERT] '{kw}' detected")
    else:
        print(f"[  OK ] '{kw}' not found")`,
      tryMe: {
        starter: `log      = "blocked connection from root user"
keywords = ["failed","blocked","malware","root","exploit"]

clean = log.lower()
words = clean.split()

for kw in keywords:
    status = "ALERT" if kw in words else " OK  "
    print(f"  [{status}] {kw}")`,
        expectedOutput:
          "  [ OK  ] failed\n  [ALERT] blocked\n  [ OK  ] malware\n  [ALERT] root\n  [ OK  ] exploit",
        hint: "blocked and root are in the log. Detection only works because we normalized to lowercase first.",
      },
      tip: "This pattern is used in Snort and Suricata — the two most widely deployed open-source IDS tools.",
    },
  ],
};
