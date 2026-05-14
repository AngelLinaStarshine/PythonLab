export const tryMeL1 = {
  lessonId: "l1",
  ttsIntro:
    "Welcome to Lesson 1: Variables and Types. In this lesson you will learn how to store data in Python using variables. Every piece of information a program works with — a username, a score, a flag — lives in a variable. By the end of this lesson you will be able to create variables of four different types, verify their type using the type function, and print clean formatted output.",
  sections: [
    {
      id: "s1",
      icon: "🛡️",
      heading: "Why Variables Matter in Cyber and AI",
      body: "Every time you log in to a system, a server creates dozens of variables in milliseconds: your username stored as text, your session token as a string, your risk score as a decimal number, and a flag for two-factor authentication. These values live in memory and are checked thousands of times per second. In Python, you create them with a single line of code.",
      code: null,
      tryMe: null,
      tip: null,
    },
    {
      id: "s2",
      icon: "📦",
      heading: "Creating Variables — The Assignment Operator",
      body: "A variable is a named container for a value. Use the equals sign to assign a value to a name. Python reads the right side and automatically detects the type — you never declare it manually.",
      code: `username           = "Ava"    # str   — text in quotes
grade              = 10       # int   — whole number
risk_score         = 0.0      # float — decimal number
two_factor_enabled = True     # bool  — True or False`,
      tryMe: {
        starter: `# Change YourName and run it
username           = "YourName"
grade              = 10
risk_score         = 0.0
two_factor_enabled = True

print("username:", username)
print("grade:", grade)
print("risk_score:", risk_score)
print("2FA enabled:", two_factor_enabled)`,
        editableToken: "YourName",
        editableLabel: "Your name (replace YourName)",
        editableMaxLength: 48,
        expectedOutput:
          "username: YourName\ngrade: 10\nrisk_score: 0.0\n2FA enabled: True",
        hint: "Change YourName to your own name and run it. Notice how each type prints differently.",
      },
      tip: null,
    },
    {
      id: "s3",
      icon: "🔬",
      heading: "The Four Types — str, int, float, bool",
      body: "Python has four basic types. A string stores text and always needs quotes. An integer stores whole numbers with no quotes. A float stores decimal numbers. A boolean stores exactly True or False with a capital first letter. Using the wrong type — for example storing a number inside quotes — breaks any math you try to do with it.",
      code: `username  = "Ava"      # str
grade     = 10         # int
risk      = 0.75       # float
mfa_on    = True       # bool

print(type(username))  # <class 'str'>
print(type(grade))     # <class 'int'>
print(type(risk))      # <class 'float'>
print(type(mfa_on))    # <class 'bool'>`,
      tryMe: {
        starter: `username = "Ava"
grade    = 10
risk     = 0.75
mfa_on   = True

print(type(username))
print(type(grade))
print(type(risk))
print(type(mfa_on))`,
        expectedOutput:
          "<class 'str'>\n<class 'int'>\n<class 'float'>\n<class 'bool'>",
        hint: "type() is your debugging tool. When you see a TypeError, check your variable types first.",
      },
      tip: "In cybersecurity, the wrong type causes real bugs. Storing a port number as a string means you cannot compare it to 443 with greater-than or less-than operators.",
    },
    {
      id: "s4",
      icon: "🖨️",
      heading: "Printing Output — f-Strings",
      body: "Python's print function displays values. The modern, professional way is an f-string: put the letter f before the opening quote, then embed variable names inside curly braces. F-strings are cleaner and faster than comma-separated print calls.",
      code: `username = "Ava"
grade    = 10
mfa_on   = True

# f-string style — professional standard
print(f"user: {username} | grade: {grade} | 2FA: {mfa_on}")
# Output: user: Ava | grade: 10 | 2FA: True`,
      tryMe: {
        starter: `username = "Ava"
grade    = 10
mfa_on   = True

print("=== CYBER PROFILE ===")
print(f"User  : {username}")
print(f"Grade : {grade}")
print(f"2FA   : {mfa_on}")`,
        expectedOutput:
          "=== CYBER PROFILE ===\nUser  : Ava\nGrade : 10\n2FA   : True",
        hint: "Inside an f-string, put variable names inside curly braces. Try changing the values and re-running.",
      },
      tip: null,
    },
    {
      id: "s5",
      icon: "❌",
      heading: "Common Mistakes",
      body: "Three bugs cause most beginner errors. First, missing quotes on a string gives a NameError. Second, quotes around a number make it text so math crashes with TypeError. Third, lowercase true or false are not valid Python — booleans need exactly True or False with a capital first letter.",
      code: `# BUG 1 — NameError: missing quotes
# username = Ava
username = "Ava"       # ✓ Fixed

# BUG 2 — Wrong type: grade is text not number
# grade = "10"
grade = 10             # ✓ Fixed

# BUG 3 — NameError: lowercase bool
# mfa_on = true
mfa_on = True          # ✓ Fixed`,
      tryMe: {
        starter: `# Fix all three bugs — one error per line
username = Ava
grade    = "11"
mfa_on   = false

print(f"{username} | grade+1={grade+1} | 2FA:{mfa_on}")`,
        expectedOutput: "Ava | grade+1=12 | 2FA:False",
        hint: `Bug 1: Ava needs quotes → "Ava". Bug 2: "11" needs no quotes → 11. Bug 3: false → False (capital F).`,
      },
      tip: null,
    },
  ],
};
