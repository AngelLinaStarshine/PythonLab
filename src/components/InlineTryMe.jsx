// src/components/InlineTryMe.jsx
// Inline fill-the-blank during reading. no Pyodide, no Code editor.
// `code` contains exactly one «BLANK» marker for the editable spot.

import { useState, useRef } from "react";

const C = {
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
  code: "#020a16",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  sans: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
};

const BLANK = "«BLANK»";

function splitCode(code) {
  const idx = (code || "").indexOf(BLANK);
  if (idx === -1) return { before: code || "", after: "" };
  return {
    before: code.slice(0, idx),
    after: code.slice(idx + BLANK.length),
  };
}

function CodeLine({ text }) {
  if (!text) return null;
  if (text.trim().startsWith("#")) {
    return <span style={{ color: C.t3 }}>{text}</span>;
  }
  const parts = text.split(/("[^"]*"|'[^']*')/g);
  return (
    <>
      {parts.map((seg, i) =>
        seg.startsWith('"') || seg.startsWith("'") ? (
          <span key={i} style={{ color: C.amber }}>
            {seg}
          </span>
        ) : (
          <span key={i} style={{ color: C.t1 }}>
            {seg}
          </span>
        ),
      )}
    </>
  );
}

export default function InlineTryMe({ code, answer, hint, expected, label }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [showHint, setShowHint] = useState(false);
  const [showExp, setShowExp] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef(null);

  const { before, after } = splitCode(code);

  const check = () => {
    const val = value.trim();
    if (!val) {
      inputRef.current?.focus();
      return;
    }
    const correct = val.toLowerCase() === (answer || "").trim().toLowerCase();
    setAttempts((n) => {
      const next = n + 1;
      if (!correct && next >= 2) setShowExp(true);
      return next;
    });
    setStatus(correct ? "correct" : "wrong");
  };

  const reset = () => {
    setValue("");
    setStatus("idle");
    setShowHint(false);
    setShowExp(false);
    setAttempts(0);
  };

  const statusBorder = { idle: C.cyan, correct: C.green, wrong: C.red }[status];
  const inputBg = { idle: `${C.amber}18`, correct: `${C.green}22`, wrong: `${C.red}15` }[status];
  const inputColor = { idle: C.amber, correct: C.green, wrong: C.red }[status];

  return (
    <div
      className="inline-tryme"
      style={{
        marginTop: 14,
        borderRadius: 10,
        border: `1px solid ${statusBorder}40`,
        overflow: "hidden",
        background: C.cardAlt,
        fontFamily: C.sans,
        transition: "border-color 0.25s",
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          background: `${C.cyan}07`,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, color: C.cyan, fontWeight: 700 }}>▶ Try Me</span>
        <span style={{ fontSize: 11, color: C.t3, flex: 1 }}>
          {label || "Type your answer in the highlighted blank, then click Check"}
        </span>
        {hint ? (
          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            style={{
              border: `1px solid ${C.amber}40`,
              cursor: "pointer",
              padding: "2px 10px",
              borderRadius: 5,
              fontSize: 11,
              background: showHint ? `${C.amber}18` : "transparent",
              color: showHint ? C.amber : C.t2,
              fontFamily: C.sans,
              transition: "all 0.15s",
            }}
          >
            💡 Hint
          </button>
        ) : null}
        {attempts >= 2 && expected ? (
          <button
            type="button"
            onClick={() => setShowExp((s) => !s)}
            style={{
              border: `1px solid ${C.purple}40`,
              cursor: "pointer",
              padding: "2px 10px",
              borderRadius: 5,
              fontSize: 11,
              background: showExp ? `${C.purple}18` : "transparent",
              color: showExp ? C.purple : C.t2,
              fontFamily: C.sans,
              transition: "all 0.15s",
            }}
          >
            👁 Expected
          </button>
        ) : null}
      </div>

      {showHint && hint ? (
        <div
          style={{
            padding: "9px 14px",
            borderBottom: `1px solid ${C.border}`,
            background: `${C.amber}07`,
            fontSize: 12.5,
            color: C.amber,
            lineHeight: 1.65,
          }}
        >
          💡 {hint}
        </div>
      ) : null}

      {showExp && expected ? (
        <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.border}`, background: `${C.purple}07` }}>
          <div
            style={{
              fontSize: 10,
              color: C.t3,
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              fontFamily: C.sans,
            }}
          >
            Expected output
          </div>
          <pre
            style={{
              margin: 0,
              fontFamily: C.mono,
              fontSize: 11.5,
              color: C.purple,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {expected}
          </pre>
        </div>
      ) : null}

      <div
        onCopy={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          background: C.code,
          padding: "14px 16px",
          fontFamily: C.mono,
          fontSize: 12.5,
          lineHeight: 1.9,
          userSelect: "none",
          WebkitUserSelect: "none",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {before.split("\n").map((line, i, arr) => (
          <span key={`b${i}`}>
            <CodeLine text={line} />
            {i < arr.length - 1 ? "\n" : null}
          </span>
        ))}

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") check();
          }}
          placeholder="type here…"
          aria-label="Fill in the blank"
          style={{
            display: "inline-block",
            fontFamily: C.mono,
            fontSize: 12.5,
            background: inputBg,
            border: `1.5px dashed ${statusBorder}`,
            borderRadius: 4,
            color: inputColor,
            padding: "1px 8px",
            outline: "none",
            minWidth: 80,
            width: `${Math.max((value.length || 0) + 5, 10)}ch`,
            verticalAlign: "baseline",
            transition: "background 0.2s, border-color 0.2s, color 0.2s",
            userSelect: "text",
            WebkitUserSelect: "text",
            MozUserSelect: "text",
          }}
        />

        {after.split("\n").map((line, i) => (
          <span key={`a${i}`}>
            {i === 0 ? null : "\n"}
            <CodeLine text={line} />
          </span>
        ))}
      </div>

      <div
        style={{
          padding: "8px 14px",
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={check}
          style={{
            border: `1px solid ${C.cyan}50`,
            cursor: "pointer",
            padding: "7px 20px",
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
            background: `${C.cyan}15`,
            color: C.cyan,
            fontFamily: C.sans,
            transition: "all 0.15s",
          }}
        >
          ✓ Check
        </button>
        {status !== "idle" ? (
          <button
            type="button"
            onClick={reset}
            style={{
              border: `1px solid ${C.border}`,
              cursor: "pointer",
              padding: "7px 12px",
              borderRadius: 7,
              fontSize: 11,
              background: "transparent",
              color: C.t2,
              fontFamily: C.sans,
            }}
          >
            ↺ Try again
          </button>
        ) : null}
        {status === "correct" ? (
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.green,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            ✓ Correct!
          </span>
        ) : null}
        {status === "wrong" ? (
          <span style={{ fontSize: 12, color: C.red }}>
            ✗{" "}
            {attempts >= 2 ? "Check the hint or expected output above" : "Not quite. try again"}
          </span>
        ) : null}
        {attempts > 0 ? (
          <span style={{ fontSize: 10, color: C.t3, marginLeft: "auto", fontFamily: C.mono }}>
            {attempts} attempt{attempts !== 1 ? "s" : ""}
          </span>
        ) : null}
      </div>

      {status === "correct" && expected ? (
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.green}25`, background: `${C.green}07` }}>
          <div
            style={{
              fontSize: 10,
              color: C.green,
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Output when this runs
          </div>
          <pre
            style={{
              margin: 0,
              fontFamily: C.mono,
              fontSize: 11.5,
              color: C.green,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {expected}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
