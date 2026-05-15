#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║         SENTINEL — Cyber Threat Monitoring Tool             ║
║         Lesson 10 Capstone · Ontario Cyber/AI Python        ║
╚══════════════════════════════════════════════════════════════╝

WHAT YOU ARE BUILDING:
  A real command-line security tool that:
  1. Reads a log file (or accepts live input)
  2. Parses each line and detects threat keywords
  3. Scores each event using a weighted rule engine
  4. Labels events as LOW / MEDIUM / HIGH / CRITICAL
  5. Filters and displays events by severity
  6. Generates an analytics report with a ranked threat list
  7. Exports a JSON report file for analysts

This is portfolio-ready code — every technique from Lessons 1-9.

HOW TO RUN:
  python sentinel.py                     # live input mode
  python sentinel.py --file logs.txt     # process a log file
  python sentinel.py --demo              # run with built-in demo data
  python sentinel.py --demo --export    # run + save report.json
"""

# ── L2: imports + constants ───────────────────────────────────────
import sys
import json
import os
from datetime import datetime

# ── L1: Configuration (variables) ────────────────────────────────
APP_NAME    = "SENTINEL"
APP_VERSION = "1.0.0"
SEPARATOR   = "─" * 60

# ── L8: Threat keyword rules (string matching) ────────────────────
# Each keyword maps to a risk score addition.
# Students: add your own rules here!
KEYWORD_RULES = {
    "failed":        35,
    "unauthorized":  40,
    "blocked":       25,
    "malware":       60,
    "exploit":       55,
    "rootkit":       70,
    "ransomware":    80,
    "brute":         45,
    "injection":     50,
    "overflow":      50,
    "exfiltration":  75,
    "privilege":     40,
    "escalation":    45,
    "phishing":      35,
    "suspicious":    20,
    "anomaly":       15,
}

# ── L3: Risk labels by threshold ──────────────────────────────────
def label_risk(score):
    """
    Convert numeric score to text label.
    L5: This is a function with a parameter and return value.
    L3: Uses if/elif/else conditional chain.
    """
    if score >= 90:
        return "CRITICAL"
    elif score >= 70:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    else:
        return "LOW"


# ── L8 + L4: Score a single log event ────────────────────────────
def score_event(log_line):
    """
    Parse one log line and compute a weighted risk score.
    L5: Function with one parameter, returns dict (L7).
    L8: Uses .lower() and .split() for string processing.
    L4: Loops through keyword rules.
    L9: try/except handles unexpected input.
    """
    try:
        # L8: Normalise — lowercase, strip whitespace
        text  = log_line.lower().strip()
        words = text.split()

        # Start with a base score of 0 (no base — must earn it)
        score          = 0
        matched_rules  = []

        # L4 + L7: Loop through the keyword rules dictionary
        for keyword, weight in KEYWORD_RULES.items():
            # L8: Check if keyword appears as a token in the log
            if keyword in words or keyword in text:
                score          += weight
                matched_rules.append((keyword, weight))

        # Cap at 100
        score = min(score, 100)

        # L7: Return a structured dictionary record
        return {
            "raw":       log_line.strip(),
            "score":     score,
            "label":     label_risk(score),
            "keywords":  matched_rules,
            "timestamp": datetime.now().strftime("%H:%M:%S"),
        }

    except Exception as e:
        # L9: Safe error handling — never crash on one bad line
        return {
            "raw":       str(log_line),
            "score":     0,
            "label":     "ERROR",
            "keywords":  [],
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "error":     str(e),
        }


# ── L6: Analytics across all events ──────────────────────────────
def compute_analytics(events):
    """
    Compute summary stats for the full event list.
    L6: Uses list operations — sum, len, max, filtering.
    L5: Function that takes a list and returns a dict.
    """
    if not events:
        return {"total":0,"avg":0,"max":0,"by_label":{}}

    scores    = [e["score"] for e in events]           # L6: list comprehension
    by_label  = {"LOW":0,"MEDIUM":0,"HIGH":0,"CRITICAL":0,"ERROR":0}

    for e in events:                                    # L4: loop
        label = e.get("label","ERROR")
        by_label[label] = by_label.get(label, 0) + 1

    return {
        "total":    len(events),
        "avg":      round(sum(scores) / len(scores), 1),
        "max":      max(scores),
        "by_label": by_label,
    }


# ── Display helpers ───────────────────────────────────────────────
LABEL_COLORS = {
    "CRITICAL": "\033[91m",   # bright red
    "HIGH":     "\033[31m",   # red
    "MEDIUM":   "\033[33m",   # yellow
    "LOW":      "\033[32m",   # green
    "ERROR":    "\033[90m",   # grey
}
RESET = "\033[0m"
BOLD  = "\033[1m"

def colour(text, label):
    """Wrap text in ANSI colour for the given label."""
    return f"{LABEL_COLORS.get(label,'')}{text}{RESET}"

def risk_bar(score, width=20):
    """Visual risk bar: ████░░░░ """
    filled = round((score / 100) * width)
    return "█" * filled + "░" * (width - filled)

def print_event(event, idx):
    """Print one event row."""
    label = event["label"]
    score = event["score"]
    bar   = risk_bar(score, 15)
    kws   = ", ".join(k for k,_ in event["keywords"]) if event["keywords"] else "—"

    print(f"  {idx:>3}.  {colour(f'[{label:8}]', label)}  "
          f"{score:3}/100  {bar}  {event['timestamp']}")
    print(f"        ↳ {event['raw'][:70]}")
    if kws != "—":
        print(f"        ✦ Keywords: {colour(kws, label)}")
    print()


def print_report(events, analytics):
    """Print the full analyst report."""
    print()
    print(BOLD + "═" * 60 + RESET)
    print(BOLD + f"  {APP_NAME} v{APP_VERSION} — THREAT REPORT" + RESET)
    print(BOLD + f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}" + RESET)
    print(BOLD + "═" * 60 + RESET)

    if not events:
        print("  No events to report.")
        return

    # ── Summary stats ─────────────────────────────────────────
    print()
    print("  SUMMARY")
    print(SEPARATOR)
    a = analytics
    print(f"  Total events    : {a['total']}")
    print(f"  Average risk    : {a['avg']}/100")
    print(f"  Highest risk    : {a['max']}/100")
    for lbl in ["CRITICAL","HIGH","MEDIUM","LOW"]:
        count = a["by_label"].get(lbl, 0)
        if count > 0:
            bar = "■" * count
            print(f"  {colour(f'{lbl:10}', lbl)}: {count:3}  {colour(bar, lbl)}")

    # ── Ranked threat list ────────────────────────────────────
    print()
    print("  RANKED EVENTS (highest risk first)")
    print(SEPARATOR)

    # L6: sort descending by score
    ranked = sorted(events, key=lambda e: e["score"], reverse=True)

    for i, event in enumerate(ranked, start=1):
        print_event(event, i)

    # ── Critical alerts highlighted ───────────────────────────
    critical = [e for e in events if e["label"] == "CRITICAL"]
    if critical:
        print(SEPARATOR)
        print(colour(f"  ⚠  {len(critical)} CRITICAL ALERT(S) REQUIRE IMMEDIATE ATTENTION", "CRITICAL"))
        print(SEPARATOR)


def export_json(events, analytics, filename="sentinel_report.json"):
    """
    Export the full report as JSON.
    L7: Serialises list of dicts to JSON.
    L9: try/except handles file write errors.
    """
    try:
        report = {
            "app":        APP_NAME,
            "version":    APP_VERSION,
            "generated":  datetime.now().isoformat(),
            "analytics":  analytics,
            "events":     events,
        }
        with open(filename, "w") as f:
            json.dump(report, f, indent=2)
        print(f"\n  ✓ Report exported → {filename}")
        return True
    except IOError as e:
        print(f"\n  ✗ Export failed: {e}")
        return False


# ── Demo data ─────────────────────────────────────────────────────
DEMO_LOGS = [
    "2024-01-15 08:12:01 FAILED login attempt from IP 192.168.1.105 user=admin",
    "2024-01-15 08:12:45 Unauthorized access to /etc/shadow detected from 10.0.0.5",
    "2024-01-15 08:15:22 Normal user login: jsmith from 192.168.1.20",
    "2024-01-15 08:17:01 Malware signature detected in upload: invoice_2024.exe",
    "2024-01-15 08:18:33 Blocked outbound connection to known C2 server 45.33.32.156",
    "2024-01-15 08:22:10 Privilege escalation attempt: sudo -i from user=guest",
    "2024-01-15 08:25:44 Ransomware behavior detected: mass file encryption in /home",
    "2024-01-15 08:30:01 Brute force attack detected: 247 FAILED attempts in 60s",
    "2024-01-15 08:31:15 SQL injection attempt blocked on /api/login endpoint",
    "2024-01-15 09:01:00 Routine backup completed successfully",
    "2024-01-15 09:05:11 Suspicious outbound traffic: 2.4GB exfiltration to unknown host",
    "2024-01-15 09:12:00 User logout: jsmith session ended normally",
]


# ── MAIN — entry point ────────────────────────────────────────────
def main():
    """
    Main program flow.
    L4: while loop for live input mode.
    L6: events list accumulates all records.
    L9: Exception handling throughout.
    """
    # Parse command-line arguments (simple version without argparse)
    args      = sys.argv[1:]
    demo_mode = "--demo"   in args
    do_export = "--export" in args
    file_mode = "--file"   in args

    # ── Print banner ──────────────────────────────────────────
    print()
    print(BOLD + f"  {APP_NAME} v{APP_VERSION} — Cyber Threat Monitoring Tool" + RESET)
    print(f"  Grade 10–11 Capstone · Ontario Cyber/AI Python Track")
    print(SEPARATOR)

    events = []   # L6: list that accumulates all event dicts

    # ── Mode 1: Demo ──────────────────────────────────────────
    if demo_mode:
        print(f"\n  Running with {len(DEMO_LOGS)} demo log entries…\n")
        for log in DEMO_LOGS:
            event = score_event(log)   # L5: function call
            events.append(event)       # L6: append to list
            # Show real-time alert for high severity
            if event["label"] in ("HIGH","CRITICAL"):
                print(f"  {colour('ALERT','CRITICAL')} {event['timestamp']} "
                      f"[{colour(event['label'], event['label'])}] "
                      f"{event['raw'][:55]}…")

    # ── Mode 2: File ──────────────────────────────────────────
    elif file_mode:
        try:
            file_idx  = args.index("--file")
            filename  = args[file_idx + 1]
        except (ValueError, IndexError):
            print("  ✗ Usage: python sentinel.py --file <logfile.txt>")
            sys.exit(1)

        try:
            with open(filename, "r") as f:
                lines = f.readlines()
            print(f"\n  Processing {len(lines)} lines from {filename}…\n")
            for line in lines:
                if line.strip():
                    event = score_event(line)
                    events.append(event)
        except FileNotFoundError:
            print(f"  ✗ File not found: {filename}")
            sys.exit(1)
        except IOError as e:
            print(f"  ✗ File read error: {e}")
            sys.exit(1)

    # ── Mode 3: Live input ────────────────────────────────────
    else:
        print("\n  Live mode — paste log lines one at a time.")
        print("  Commands: 'report' (show results) | 'quit' (exit)\n")

        # L4: while loop for interactive input
        while True:
            try:
                line = input("  log> ").strip()
            except (EOFError, KeyboardInterrupt):
                break

            if not line:
                continue

            if line.lower() == "quit":
                break

            if line.lower() == "report":
                if not events:
                    print("  No events yet — keep entering logs.\n")
                else:
                    break   # exit loop and show report below

            # Score the line immediately
            event = score_event(line)   # L5: function composition
            events.append(event)

            # Instant feedback
            label = event["label"]
            score = event["score"]
            print(f"  → {colour(f'[{label}]', label)} {score}/100  "
                  f"{risk_bar(score, 12)}  "
                  f"{', '.join(k for k,_ in event['keywords']) or 'no keywords'}")
            print()

    # ── Compute analytics and print report ────────────────────
    if events:
        analytics = compute_analytics(events)   # L5 + L6
        print_report(events, analytics)

        # Export if requested
        if do_export:
            export_json(events, analytics)
    else:
        print("\n  No events recorded.")

    print()
    print(SEPARATOR)
    print(f"  {APP_NAME} session complete.")
    print(SEPARATOR)


# ── Entry point guard ─────────────────────────────────────────────
if __name__ == "__main__":
    main()
