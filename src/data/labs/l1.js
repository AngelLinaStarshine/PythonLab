// Lab 1, Variables & Types (split from labs bundle)
export const lab1 = {
  lessonId: "l1",
  title: "Lab 1: Variables & Types",
  subtitle: "Cyber Profile Setup",
  estimatedMinutes: 25,
  objectives: [
    "Create variables of type str, int, float, and bool.",
    "Use type() to inspect what Python detected.",
    "Print a formatted profile summary using print() and f strings.",
    "Avoid the three most common beginner type errors.",
  ],
  intro: `In this lab, you will build a mini user profile, the kind a real authentication
system creates the moment you log in. Each variable represents a field that a
security tool would store in memory: your username, session grade level, a risk
score, and whether two-factor authentication is active.`,
  exercises: [
    {
      id: "e1",
      title: "Exercise 1, Create your four profile variables",
      prompt: `Create four variables that represent a user profile:
  • username, a string with your chosen username
  • grade   , an integer (10 or 11)
  • risk_score, a float starting at 0.0
  • two_factor_enabled, a boolean (True or False)

Then print all four on one line using print() with commas.`,
      starter: `# Exercise 1: Create a cyber user profile
# Replace each __BLANK__ with the correct value

username            = __BLANK__
grade               = __BLANK__
risk_score          = __BLANK__
two_factor_enabled  = __BLANK__

print("user:", username, "| grade:", grade,
      "| risk:", risk_score, "| 2FA:", two_factor_enabled)`,
      hints: [
        "Strings need quotes. Integers and floats do not. Booleans are exactly True or False.",
        'username = "Ava"  #  add your chosen name inside quotes.',
        "grade is a whole number, write 10 or 11 with no quotes.",
        "risk_score is a decimal, write 0.0 (the dot makes it a float).",
        "two_factor_enabled = True  #  capital T, no quotes.",
      ],
      solution: `username            = "Ava"
grade               = 10
risk_score          = 0.0
two_factor_enabled  = True

print("user:", username, "| grade:", grade,
      "| risk:", risk_score, "| 2FA:", two_factor_enabled)`,
      expectedOutput: "user: Ava | grade: 10 | risk: 0.0 | 2FA: True",
      afterNote:
        "Notice how Python displays each type differently, strings without quotes, floats with a decimal point, booleans with a capital letter.",
    },
    {
      id: "e2",
      title: "Exercise 2, Inspect types with type()",
      prompt: `Use Python's built in type() function to verify what type each variable is.
Print the type of all four variables. Then answer in a comment:
  • Which variable is <class 'float'>?
  • Which is <class 'bool'>?`,
      starter: `# Exercise 2: Verify types
# Use type() to inspect each variable

print(type(username))
print(type(__BLANK__))
print(type(__BLANK__))
print(type(__BLANK__))

# Your answer (as a comment):
# <class 'float'> is the type of: __BLANK__
# <class 'bool'>  is the type of: __BLANK__`,
      hints: [
        "type(variable_name), put the variable name inside the parentheses.",
        "The four variables are: username, grade, risk_score, two_factor_enabled.",
        "Replace each __BLANK__ with the variable name whose type you want to check.",
      ],
      solution: `print(type(username))
print(type(grade))
print(type(risk_score))
print(type(two_factor_enabled))

# <class 'float'> is the type of: risk_score
# <class 'bool'>  is the type of: two_factor_enabled`,
      expectedOutput: `<class 'str'>
<class 'int'>
<class 'float'>
<class 'bool'>`,
      afterNote: "type() is your debugging superpower. When something crashes with a TypeError, check the type of your variables first.",
    },
    {
      id: "e3",
      title: "Exercise 3, Print a formatted profile with f strings",
      prompt: `Now print the same profile using an f string, the modern, industry-standard
way to format output. An f string starts with f before the quote and uses
{variable} to embed values.

Target output (exact format):
  === CYBER PROFILE ===
  User     : Ava
  Grade    : 10
  Risk     : 0.0
  2FA      : True`,
      starter: `# Exercise 3: f string formatting
# Complete the f strings below

print("=== CYBER PROFILE ===")
print(f"User     : {__BLANK__}")
print(f"Grade    : {__BLANK__}")
print(f"Risk     : {__BLANK__}")
print(f"2FA      : {__BLANK__}")`,
      hints: [
        "Inside an f string, put the variable name inside curly braces: {username}.",
        'f"User: {username}" will print: User: Ava',
        "Replace each __BLANK__ with the variable name that belongs on that line.",
      ],
      solution: `print("=== CYBER PROFILE ===")
print(f"User     : {username}")
print(f"Grade    : {grade}")
print(f"Risk     : {risk_score}")
print(f"2FA      : {two_factor_enabled}")`,
      expectedOutput: `=== CYBER PROFILE ===
User     : Ava
Grade    : 10
Risk     : 0.0
2FA      : True`,
      afterNote:
        "f strings are used in every professional Python codebase. Get comfortable with the {variable} syntax, you'll use it through all 10 lessons.",
    },
    {
      id: "e4",
      title: "Exercise 4, Spot the bugs (3 broken lines)",
      prompt: `The code below has three bugs, one on each variable line.
Find and fix all three. Read the error type hints in the comments.

Common errors to watch for:
  • Missing quotes on a string: NameError
  • Quotes around a number  : wrong type (str instead of int)
  • Wrong bool capitalization: NameError`,
      starter: `# Exercise 4: Fix the three bugs
# Each line has ONE error, find it and fix it

username           = Ava            # Bug: NameError
grade              = "10"           # Bug: wrong type
two_factor_enabled = true           # Bug: NameError

print(f"Fixed: {username} | {grade + 1} | {two_factor_enabled}")`,
      hints: [
        'Bug 1: Ava without quotes, Python thinks Ava is a variable. Fix: username = "Ava"',
        'Bug 2: "10" is a string, grade + 1 will crash. Fix: grade = 10 (no quotes).',
        "Bug 3: true is not a valid Python keyword. Fix: two_factor_enabled = True (capital T).",
      ],
      solution: `username           = "Ava"
grade              = 10
two_factor_enabled = True

print(f"Fixed: {username} | {grade + 1} | {two_factor_enabled}")`,
      expectedOutput: "Fixed: Ava | 11 | True",
      afterNote:
        "These three bugs, missing quotes, quoted numbers, and lowercase booleans, account for a huge percentage of beginner Python errors. You now know how to spot all three.",
    },
  ],
  wrapUp: {
    message:
      "Congratulations, you've completed Lab 1! You can now create any Python variable, verify its type, and print formatted output. These four variable types (str, int, float, bool) are the building blocks of every program in this course.",
    nextLesson: "Next up: Lesson 2, collecting live input from users with input().",
    keyTakeaways: [
      "str stores text, always use quotes.",
      "int and float store numbers, never use quotes.",
      "bool is exactly True or False, capital first letter, no quotes.",
      "type() reveals what Python detected, use it when debugging.",
      'f strings (f"...") embed variables cleanly, industry standard.',
    ],
  },
};
