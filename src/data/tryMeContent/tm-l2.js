export const tryMeL2 = {
  lessonId: "l2",
  ttsIntro:
    "Welcome to Lesson 2: Input and Output. In this lesson you will learn how to collect user input with the input function, convert it to the correct type, and print formatted results. Every security intake form uses these exact techniques.",
  sections: [
    {
      id: "s1",
      icon: "🛡️",
      heading: "Security Tools Start With Input",
      body: "Every security form you have filled out, reporting phishing, flagging suspicious activity, is powered by code that reads what you typed, converts it to the right type, and stores it. Python's input function lets your program pause and ask the user for information at runtime.",
      code: null,
      tryMe: null,
      tip: null,
    },
    {
      id: "s2",
      icon: "⌨️",
      heading: "The input() Function",
      body: "input() pauses the program, shows a prompt, and waits for the user to type and press Enter. Whatever they type is always returned as a string, even if they type a number. This is the single most important rule about input.",
      code: `msg = input("Paste suspicious message: ")
print(type(msg))    # <class 'str'>, always a string`,
      tryMe: {
        starter: `name = input("What is your name? ")
print("Hello,", name)
print("Type:", type(name))`,
        expectedOutput: "Hello, Ava\nType: <class 'str'>",
        hint: "input() always returns a string. The text inside the parentheses is the prompt shown to the user. (Run with mocked input \"Ava\" when available.)",
      },
      tip: null,
    },
    {
      id: "s3",
      icon: "🔢",
      heading: "Converting Types, int() and float()",
      body: "If the user types a number and you want to do math, wrap int() or float() directly around input(). Python runs the inner function first, then passes the result to the outer one. If conversion fails, for example the user types hello, Python raises a ValueError.",
      code: `risk       = int(input("Risk score 0 to 100: "))
confidence = float(input("Confidence 0.0 to 1.0: "))

print(f"risk + 10: {risk + 10}")
print(f"Confidence: {confidence * 100:.1f}%")`,
      tryMe: {
        starter: `risk = int(input("Enter a risk score: "))

print(f"You entered: {risk}")
print(f"Type: {type(risk)}")
print(f"Doubled: {risk * 2}")
print(f"Label: {'HIGH' if risk >= 70 else 'MEDIUM' if risk >= 40 else 'LOW'}")`,
        expectedOutput:
          "You entered: 72\nType: <class 'int'>\nDoubled: 144\nLabel: HIGH",
        hint: "Try entering 72. Then try entering hello to see a ValueError, Lesson 9 shows you how to handle that.",
      },
      tip: "The pattern int(input('prompt')) is very common. Python runs inside-out: input() runs first, returns a string, then int() converts it.",
    },
    {
      id: "s4",
      icon: "📋",
      heading: "Building a Formatted Report",
      body: "Once you have inputs stored and converted, print a professional report using f strings. The format specifier colon dot one f rounds a float to one decimal place.",
      code: `msg        = input("Suspicious message: ")
risk       = int(input("Risk score 0 to 100: "))
confidence = float(input("Confidence 0.0 to 1.0: "))
status     = "HIGH RISK" if risk >= 70 else "MEDIUM" if risk >= 40 else "LOW"

print(f"Message    : {msg}")
print(f"Risk Score : {risk} / 100")
print(f"Confidence : {confidence * 100:.1f}%")
print(f"Status     : {status}")`,
      tryMe: {
        starter: `msg        = "Buy Bitcoin now!"
risk       = 72
confidence = 0.875
status     = "HIGH RISK" if risk >= 70 else "MEDIUM" if risk >= 40 else "LOW"

print("=== PHISHING INTAKE REPORT ===")
print(f"Message    : {msg}")
print(f"Risk Score : {risk} / 100")
print(f"Confidence : {confidence * 100:.1f}%")
print(f"Status     : {status}")`,
        expectedOutput:
          "=== PHISHING INTAKE REPORT ===\nMessage    : Buy Bitcoin now!\nRisk Score : 72 / 100\nConfidence : 87.5%\nStatus     : HIGH RISK",
        hint: "Try changing confidence to 0.5, the percentage should display as 50.0%. The :.1f format specifier handles the rounding.",
      },
      tip: null,
    },
  ],
};
