// src/components/AgentARIA.jsx
// ─────────────────────────────────────────────────────────────────
// ARIA — Adaptive Response Intelligence Agent
//
// Appears when a student makes 3+ incorrect mastery attempts.
//
// Props:
//   lessonId, lesson, wrongAttempts, lastError, lastCode
//   onDismiss, onGoToRead(sectionTitle?)
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#040c18",
  card: "#0a1627",
  cardAlt: "#081120",
  border: "rgba(0,195,255,0.12)",
  cyan: "#00c8ff",
  green: "#00e87a",
  amber: "#ffad2e",
  red: "#ff3658",
  purple: "#a78bfa",
  t1: "#c0ddf0",
  t2: "#4e7090",
  t3: "#243850",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  sans: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
};

const btn = (extra = {}) => ({
  border: "none",
  cursor: "pointer",
  fontFamily: C.sans,
  transition: "all 0.18s",
  outline: "none",
  ...extra,
});

const ERROR_SECTION_MAP = {
  nameerror: { section: "Common Mistakes", reason: "You may have a missing quote or incorrect capitalisation." },
  typeerror: { section: "The Four Types", reason: "You may be using the wrong type — e.g. a string where a number is needed." },
  syntaxerror: { section: "Creating Variables", reason: "Check your syntax — equals signs, quotes, and colons." },
  "invalid literal": { section: "Converting Types", reason: "int() received text it cannot convert — make sure the value is a number." },
  valueerror: { section: "Converting Types", reason: "A type conversion failed. Re-read how int() and float() work." },
  indentationerror: { section: "if / elif / else", reason: "Python requires consistent indentation inside if/elif/else blocks." },
  zerodivisionerror: { section: "Counting Inside a Loop", reason: "You divided by zero — check your counter or list length." },
  indexerror: { section: "The for Loop", reason: "You accessed an index that doesn't exist — check your range." },
  return: { section: "Defining a Function", reason: "Make sure your function uses return, not just print." },
  "list index out of range": {
    section: "Creating and Accessing",
    reason: "Check how you're creating or accessing your list.",
  },
  keyerror: { section: "Safe Access with .get()", reason: "A dictionary key doesn't exist — use .get() for safe access." },
  attributeerror: { section: "Normalize with lower()", reason: "You called a method that doesn't exist on this type." },
  except: { section: "try / except Pattern", reason: "Check your try/except structure and exception type." },
  "no output": { section: "Your lesson objective", reason: "Your code ran without errors but produced no output." },
};

const LESSON_HINTS = {
  l1: { section: "The Four Types — str, int, float, bool", hint: "Check that each variable uses the correct type and the correct syntax (quotes for strings, no quotes for numbers)." },
  l2: { section: "Converting Types — int() and float()", hint: "Remember: input() always returns a string. Wrap it with int() or float() if you need a number." },
  l3: { section: "if / elif / else Structure", hint: "Check the order of your conditions — highest threshold first. Don't forget the colon at the end of each line." },
  l4: { section: "Counting Inside a Loop", hint: "Make sure your counter starts at 0 before the loop, not inside it. Check your range() start and stop values." },
  l5: { section: "Composing Functions", hint: "Are you using return (not just print)? Can you call one function's output as another's input?" },
  l6: { section: "Analytics with Built-in Functions", hint: "Check you're using sum(), len(), max(), and min() correctly. Division needs len() as the denominator." },
  l7: { section: "Safe Access with .get()", hint: "Keys are case-sensitive and need quotes in square brackets. Use .get() when a key might not exist." },
  l8: {
    section: "Normalize with lower() and Tokenize with split()",
    hint: "Always call .lower() before checking keywords, then .split() to get a word list.",
  },
  l9: { section: "try / except Pattern", hint: "Name the specific exception type (ValueError, KeyError...) and keep the try block small and targeted." },
  l10: { section: "The Scoring Engine", hint: "Test score_event() and label_risk() separately first, then combine them in the main loop." },
};

function diagnose(lastError, lastCode, lessonId) {
  const combined = `${lastError || ""} ${lastCode || ""}`.toLowerCase();

  for (const [pattern, info] of Object.entries(ERROR_SECTION_MAP)) {
    if (combined.includes(pattern)) {
      return { section: info.section, reason: info.reason, source: "error" };
    }
  }

  const lessonHint = LESSON_HINTS[lessonId];
  if (lessonHint) {
    return { section: lessonHint.section, reason: lessonHint.hint, source: "lesson" };
  }

  return {
    section: "the reading material",
    reason: "Re-read the lesson carefully and check the common mistakes section.",
    source: "generic",
  };
}

function TypedText({ text, speed = 22 }) {
  const [displayed, setDisplayed] = useState("");
  const i = useRef(0);

  useEffect(() => {
    setDisplayed("");
    i.current = 0;
    const interval = setInterval(() => {
      if (i.current < text.length) {
        setDisplayed(text.slice(0, i.current + 1));
        i.current++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      <span style={{ opacity: 0.5 }}>|</span>
    </span>
  );
}

export default function AgentARIA({
  lessonId,
  wrongAttempts,
  lastError,
  lastCode,
  onDismiss,
  onGoToRead,
}) {
  const [minimized, setMinimized] = useState(false);
  const [step, setStep] = useState(0);

  const diagnosis = diagnose(lastError, lastCode, lessonId);

  useEffect(() => {
    setStep(0);
    setMinimized(false);
  }, [lessonId, wrongAttempts]);

  const MESSAGES = [
    `Hi! I'm ARIA — your Adaptive Response Intelligence Agent. I see you've made ${wrongAttempts} attempts. No worries — let me help you find the answer.`,
    `I've analysed your code and the error. It looks like the issue is related to: "${diagnosis.reason}"`,
    `I recommend going back to the reading section titled "${diagnosis.section}" — the answer is explained there. Click the button below to jump straight to it.`,
  ];

  useEffect(() => {
    if (step < 2) {
      const t = setTimeout(() => setStep((s) => s + 1), 2800);
      return () => clearTimeout(t);
    }
  }, [step]);

  if (minimized) {
    return (
      <>
        <style>{`
          @keyframes aria-pulse {
            0%, 100% { box-shadow: 0 0 20px ${C.purple}60; }
            50%       { box-shadow: 0 0 40px ${C.purple}90, 0 0 60px ${C.cyan}40; }
          }
        `}</style>
        <button
          type="button"
          onClick={() => setMinimized(false)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`,
            border: "none",
            cursor: "pointer",
            boxShadow: `0 0 20px ${C.purple}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            color: "#fff",
            animation: "aria-pulse 2s ease-in-out infinite",
          }}
          title="ARIA needs your attention"
        >
          🤖
        </button>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes aria-pulse {
          0%, 100% { box-shadow: 0 0 20px ${C.purple}60; }
          50%       { box-shadow: 0 0 40px ${C.purple}90, 0 0 60px ${C.cyan}40; }
        }
        @keyframes aria-slide-in {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 360,
          zIndex: 9999,
          background: C.card,
          borderRadius: 16,
          border: `1px solid ${C.purple}60`,
          boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 30px ${C.purple}30`,
          overflow: "hidden",
          animation: "aria-slide-in 0.35s ease",
          fontFamily: C.sans,
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            background: `linear-gradient(135deg, ${C.purple}30, ${C.cyan}15)`,
            borderBottom: `1px solid ${C.purple}40`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
              boxShadow: `0 0 12px ${C.purple}50`,
            }}
          >
            🤖
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>ARIA</div>
            <div
              style={{
                fontSize: 10,
                color: C.purple,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Adaptive Response Intelligence Agent
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMinimized(true)}
            style={{
              ...btn(),
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.t3,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Minimise"
          >
            ─
          </button>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              ...btn(),
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.t3,
              fontSize: 14,
              marginLeft: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "6px 16px",
            background: `${C.red}10`,
            borderBottom: `1px solid ${C.red}25`,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i <= wrongAttempts ? C.red : C.border,
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: C.t2, marginLeft: 4 }}>
            {wrongAttempts} incorrect attempt{wrongAttempts !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {MESSAGES.slice(0, step + 1).map((msg, i) => (
            <div
              key={i}
              style={{
                padding: "10px 13px",
                borderRadius: 10,
                background: i === step ? `${C.purple}12` : `${C.cyan}06`,
                border: `1px solid ${i === step ? C.purple : C.border}40`,
                fontSize: 13,
                color: C.t1,
                lineHeight: 1.6,
              }}
            >
              {i === step ? <TypedText text={msg} /> : msg}
            </div>
          ))}
        </div>

        {step >= 2 && (
          <div
            style={{
              padding: "0 16px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            <button
              type="button"
              onClick={() => {
                onGoToRead?.(diagnosis.section);
                onDismiss?.();
              }}
              style={{
                ...btn(),
                padding: "10px 16px",
                borderRadius: 9,
                background: `${C.cyan}15`,
                border: `1px solid ${C.cyan}50`,
                color: C.cyan,
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>📖</span>
              <span>Re-read: &quot;{diagnosis.section}&quot;</span>
            </button>

            <div
              style={{
                padding: "10px 13px",
                borderRadius: 9,
                background: `${C.amber}08`,
                border: `1px solid ${C.amber}30`,
                fontSize: 12,
                color: C.amber,
                lineHeight: 1.6,
              }}
            >
              <strong>💡 Quick tip: </strong>
              {diagnosis.reason}
            </div>

            <button
              type="button"
              onClick={onDismiss}
              style={{
                ...btn(),
                padding: "8px 16px",
                borderRadius: 9,
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.t2,
                fontSize: 12,
              }}
            >
              I&apos;ll try again on my own
            </button>
          </div>
        )}

        <div
          style={{
            padding: "8px 16px",
            borderTop: `1px solid ${C.border}`,
            background: C.cardAlt,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.green,
              boxShadow: `0 0 6px ${C.green}`,
            }}
          />
          <span style={{ fontSize: 10, color: C.t3, letterSpacing: "0.05em" }}>ARIA is active for this session</span>
        </div>
      </div>
    </>
  );
}
