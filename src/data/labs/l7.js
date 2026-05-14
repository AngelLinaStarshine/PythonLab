export const lab7 = {
  lessonId: "l7",
  title: "Lab 7: Dictionaries",
  subtitle: "Device Inventory Records",
  estimatedMinutes: 30,
  objectives: [
    "Create a dictionary with key-value pairs of mixed types.",
    "Access values with d['key'] and the safe d.get() method.",
    "Update, add, and delete fields.",
    "Loop through .items() to print all fields.",
  ],
  intro: `A network security team tracks every device: owner, OS, IP address, risk score,
patch status. Each device is a dictionary, labeled fields that can be read,
updated, and queried at any time. In this lab you build that inventory record,
from creation through update through full report generation.`,
  exercises: [
    {
      id: "e1",
      title: "Exercise 1, Create a device record and access fields",
      prompt: `Create a dictionary called device with these fields:
  owner, os, ip, risk, patched

Then print the owner, OS, and current risk score using dictionary access.`,
      starter: `# Exercise 1: Create and access a dictionary
device = {
    "owner"  : __BLANK__,
    "os"     : __BLANK__,
    "ip"     : "192.168.1.42",
    "risk"   : __BLANK__,
    "patched": __BLANK__
}

print("Owner :", device[__BLANK__])
print("OS    :", device[__BLANK__])
print("Risk  :", device[__BLANK__])`,
      hints: [
        'Strings need quotes: "owner": "Ava"',
        "risk is a number (no quotes). patched is a boolean (True or False).",
        'Access a value: device["owner"], use the key name in quotes inside [].',
      ],
      solution: `device = {
    "owner"  : "Ava",
    "os"     : "Windows 11",
    "ip"     : "192.168.1.42",
    "risk"   : 42,
    "patched": False
}

print("Owner :", device["owner"])
print("OS    :", device["os"])
print("Risk  :", device["risk"])`,
      expectedOutput: `Owner : Ava
OS    : Windows 11
Risk  : 42`,
      afterNote:
        'Dictionary keys are case-sensitive. "Owner" and "owner" are different keys. Always use the exact spelling you used when creating the dictionary.',
    },
    {
      id: "e2",
      title: "Exercise 2, Safe access with .get()",
      prompt: `The device doesn't have a "last_scan" field yet.
  1. Try accessing device["last_scan"], it will raise a KeyError.
  2. Fix it by using device.get("last_scan"), returns None instead of crashing.
  3. Use device.get("last_scan", "never") to provide a default value.`,
      starter: `# Exercise 2: Safe dictionary access
device = {"owner":"Ava","os":"Windows 11","risk":42,"patched":False}

# This crashes, KeyError:
# print(device["last_scan"])

# Safe: returns None if key missing
result1 = device.__BLANK__(__BLANK__)
print("No default :", result1)

# Safe with default value
result2 = device.__BLANK__("last_scan", __BLANK__)
print("With default:", result2)`,
      hints: [
        "Use .get(key) for safe access, returns None if the key doesn't exist.",
        '.get("last_scan") returns None.',
        '.get("last_scan", "never") returns "never" if the key is absent.',
      ],
      solution: `device = {"owner":"Ava","os":"Windows 11","risk":42,"patched":False}

result1 = device.get("last_scan")
print("No default :", result1)

result2 = device.get("last_scan", "never")
print("With default:", result2)`,
      expectedOutput: `No default : None
With default: never`,
      afterNote:
        ".get() is essential when working with data from APIs or CSV files where you can't guarantee every field is present.",
    },
    {
      id: "e3",
      title: "Exercise 3, Update and add fields",
      prompt: `Simulate patching the device:
  1. Update the risk score to 5 (patched = lower risk).
  2. Set patched to True.
  3. Add a new field "last_scan" with today's date as a string.
  4. Print the full updated dictionary.`,
      starter: `# Exercise 3: Update fields after patching
device = {"owner":"Ava","os":"Windows 11","ip":"192.168.1.42","risk":42,"patched":False}

print("Before:", device)

device[__BLANK__] = __BLANK__          # new risk score
device[__BLANK__] = True          # mark as patched
device["last_scan"] = __BLANK__   # add new field (any date string)

print("After :", device)`,
      hints: [
        'device["risk"] = 5 , overwrites the existing value.',
        'device["patched"] = True , updates the boolean field.',
        'device["last_scan"] = "2026-05-01" , adds a brand new key.',
      ],
      solution: `device = {"owner":"Ava","os":"Windows 11","ip":"192.168.1.42","risk":42,"patched":False}

print("Before:", device)

device["risk"]      = 5
device["patched"]   = True
device["last_scan"] = "2026-05-01"

print("After :", device)`,
      expectedOutput: `Before: {'owner': 'Ava', 'os': 'Windows 11', 'ip': '192.168.1.42', 'risk': 42, 'patched': False}
After : {'owner': 'Ava', 'os': 'Windows 11', 'ip': '192.168.1.42', 'risk': 5, 'patched': True, 'last_scan': '2026-05-01'}`,
      afterNote:
        "Updating an existing key and adding a new key use the exact same syntax: d['key'] = value. Python creates the key if it doesn't exist, or replaces it if it does.",
    },
    {
      id: "e4",
      title: "Exercise 4, Build an inventory report with .items()",
      prompt: `You have three devices in a list. Loop through all of them and print a
formatted inventory report showing every field.

Tip: .items() on a dictionary gives you (key, value) pairs to loop through.`,
      starter: `# Exercise 4: Multi-device inventory report
inventory = [
    {"owner":"Ava",    "os":"Windows 11","risk":5,  "patched":True},
    {"owner":"Marcus", "os":"macOS",     "risk":62, "patched":False},
    {"owner":"Priya",  "os":"Ubuntu",    "risk":88, "patched":False},
]

print("=== DEVICE INVENTORY ===")
for i, device in enumerate(inventory, start=1):
    risk_label = "HIGH" if device["risk"] >= 70 else "MED" if device["risk"] >= 40 else "LOW"
    print(f"\\nDevice {i} [{risk_label}]")
    for __BLANK__, __BLANK__ in device.__BLANK__():
        print(f"  {key:10}: {value}")`,
      hints: [
        "device.items() returns each (key, value) pair.",
        "Unpack with: for key, value in device.items():",
        ":10 in the f-string pads the key to 10 characters wide, makes columns align.",
      ],
      solution: `inventory = [
    {"owner":"Ava",    "os":"Windows 11","risk":5,  "patched":True},
    {"owner":"Marcus", "os":"macOS",     "risk":62, "patched":False},
    {"owner":"Priya",  "os":"Ubuntu",    "risk":88, "patched":False},
]

print("=== DEVICE INVENTORY ===")
for i, device in enumerate(inventory, start=1):
    risk_label = "HIGH" if device["risk"] >= 70 else "MED" if device["risk"] >= 40 else "LOW"
    print(f"\\nDevice {i} [{risk_label}]")
    for key, value in device.items():
        print(f"  {key:10}: {value}")`,
      expectedOutput: `=== DEVICE INVENTORY ===

Device 1 [LOW]
  owner     : Ava
  os        : Windows 11
  risk      : 5
  patched   : True

Device 2 [MED]
  owner     : Marcus
  os        : macOS
  risk      : 62
  patched   : False

Device 3 [HIGH]
  owner     : Priya
  os        : Ubuntu
  risk      : 88
  patched   : False`,
      afterNote:
        "A list of dictionaries is the most common data structure in real Python programs, it's how JSON API responses, CSV rows, and database records are all represented.",
    },
  ],
  wrapUp: {
    message:
      "Lab 7 complete! Dictionaries are the foundation of structured data in Python. You now know how to build, read, update, and report on them.",
    nextLesson: "Next up: Lesson 8, parsing and detecting patterns in text strings.",
    keyTakeaways: [
      "d['key'], fast access, raises KeyError if missing.",
      "d.get('key'), safe access, returns None if missing.",
      "d.get('key', default), safe access with a fallback value.",
      "d['key'] = value, creates or updates a field (same syntax for both).",
      "for key, value in d.items(), loop through all fields.",
    ],
  },
};
