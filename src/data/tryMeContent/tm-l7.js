export const tryMeL7 = {
  lessonId: "l7",
  ttsIntro:
    "Welcome to Lesson 7: Dictionaries. A dictionary stores labeled fields like a database row. In this lesson you will create dictionaries, access and update fields safely, and loop through all key-value pairs.",
  sections: [
    {
      id: "s1",
      icon: "🛡️",
      heading: "Dictionaries Equal Structured Records",
      body: "A security dashboard tracks thousands of devices. Each device has a profile: owner, operating system, risk score, patch status. This structured collection of labeled fields is a dictionary. It is also the format used for JSON API responses and database rows.",
      code: null,
      tryMe: null,
      tip: null,
    },
    {
      id: "s2",
      icon: "📁",
      heading: "Creating and Accessing a Dictionary",
      body: "A dictionary uses curly braces. Each entry is a key colon value pair separated by commas. Keys are almost always strings in quotes. Access a value with square brackets containing the key in quotes.",
      code: `device = {
    "owner":   "Ava",
    "os":      "Windows 11",
    "risk":    42,
    "patched": False
}

print(device["owner"])    # Ava
print(device["risk"])     # 42`,
      tryMe: {
        starter: `device = {
    "owner":   "Ava",
    "os":      "Windows 11",
    "risk":    42,
    "patched": False
}

print("Owner:", device["owner"])
print("OS:", device["os"])
print("Risk:", device["risk"])
print("Patched:", device["patched"])`,
        expectedOutput: "Owner: Ava\nOS: Windows 11\nRisk: 42\nPatched: False",
        hint: "Try device['Owner'] with a capital O, you will get a KeyError. Keys are case-sensitive.",
      },
      tip: null,
    },
    {
      id: "s3",
      icon: "🔒",
      heading: "Safe Access with .get()",
      body: "Accessing a missing key raises a KeyError. The get method returns None instead of crashing. Pass a second argument for a default value. Use get whenever data comes from an external source and you cannot guarantee every field exists.",
      code: `device = {"owner":"Ava","risk":42}

print(device.get("ip"))              # None
print(device.get("ip", "unknown"))   # "unknown"`,
      tryMe: {
        starter: `device = {"owner":"Ava","risk":42,"patched":False}

print(device.get("ip_address"))
print(device.get("ip_address","N/A"))
print(device.get("risk", 0))
print(device.get("owner","unknown"))`,
        expectedOutput: "None\nN/A\n42\nAva",
        hint: "When the key exists .get() returns its value. When it does not exist it returns None or your default.",
      },
      tip: ".get() is essential when processing API responses or CSV data where fields may be missing.",
    },
    {
      id: "s4",
      icon: "✏️",
      heading: "Updating Fields and Looping with .items()",
      body: "Updating an existing key and adding a new one use the same syntax, square bracket assignment. If the key exists the value is replaced. If not a new key is added. Loop through all key-value pairs with the items method.",
      code: `device = {"owner":"Ava","risk":42,"patched":False}

device["risk"]    = 5
device["patched"] = True
device["last_scan"] = "2026-05-01"

for key, value in device.items():
    print(f"  {key}: {value}")`,
      tryMe: {
        starter: `device = {"owner":"Ava","os":"Windows 11","risk":42,"patched":False}

print("Before:")
for k, v in device.items():
    print(f"  {k}: {v}")

device["risk"]      = 5
device["patched"]   = True
device["last_scan"] = "2026-05-01"

print("After:")
for k, v in device.items():
    print(f"  {k}: {v}")`,
        expectedOutput:
          "Before:\n  owner: Ava\n  os: Windows 11\n  risk: 42\n  patched: False\nAfter:\n  owner: Ava\n  os: Windows 11\n  risk: 5\n  patched: True\n  last_scan: 2026-05-01",
        hint: "After patching: risk drops to 5, patched becomes True, and last_scan is a new field.",
      },
      tip: null,
    },
  ],
};
