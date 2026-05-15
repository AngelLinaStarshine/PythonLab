// src/components/LearnSection.jsx
// Alternate reading UI: collapsible sections from lessonTryMe + InlineTryMe.
// The main app uses LearnPanel (gates, material HTML, merged overrides). This
// module is kept for reuse or experiments; wire it from App only if you replace
// the reading stack.
//
// Props:
//   lessonId     — string
//   objectives   — string[]
//   onTryMeApply — fn(starterCode, sectionId?, options?) — match LearnPanel signature if used with App

import { useState, useEffect, useCallback } from "react";
import { lessonContent } from "../data/lessonTryMe.js";
import { getInlineTryMe } from "../data/lessonInlineTryMe.js";
import InlineTryMe from "./InlineTryMe.jsx";

const C = {
  card: "#0a1627",
  cardAlt: "#081120",
  border: "rgba(0,195,255,0.12)",
  bHov: "rgba(0,195,255,0.28)",
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
const btn = (x = {}) => ({
  border: "none",
  cursor: "pointer",
  fontFamily: C.sans,
  transition: "all 0.18s",
  outline: "none",
  ...x,
});

function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const speak = useCallback(
    (text) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.pitch = 1.0;
      u.lang = "en-US";
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [supported],
  );
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);
  useEffect(
    () => () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    },
    [],
  );
  return { speak, stop, speaking, supported };
}

function CodeExample({ code }) {
  if (!code) return null;
  return (
    <div
      className="code-block"
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        background: C.code,
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        marginTop: 12,
        overflow: "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div
        style={{
          padding: "5px 14px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ fontSize: 11, color: C.t3, marginLeft: 4, fontFamily: C.mono }}>python</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: C.t3,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          read-only · example
        </span>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "12px 16px",
          fontFamily: C.mono,
          fontSize: 12.5,
          lineHeight: 1.85,
          pointerEvents: "none",
          overflowX: "auto",
        }}
      >
        {code.split("\n").map((line, i) => {
          const isC = line.trim().startsWith("#");
          if (isC)
            return (
              <div key={i} style={{ color: C.t3 }}>
                {line}
              </div>
            );
          const parts = line.split(/("[^"]*"|'[^']*')/g);
          return (
            <div key={i}>
              {parts.map((seg, j) =>
                seg.startsWith('"') || seg.startsWith("'") ? (
                  <span key={j} style={{ color: C.amber }}>
                    {seg}
                  </span>
                ) : (
                  <span key={j} style={{ color: C.t1 }}>
                    {seg}
                  </span>
                ),
              )}
            </div>
          );
        })}
      </pre>
    </div>
  );
}

function SectionCard({ section, lessonId, tts, onTryMeApply }) {
  const [open, setOpen] = useState(true);
  const inlineData = getInlineTryMe(lessonId, section.id);
  const ttsText = [section.heading, section.body, section.tip].filter(Boolean).join(". ");

  return (
    <div
      style={{
        background: C.card,
        borderRadius: 12,
        border: `1px solid ${open ? C.bHov : C.border}`,
        overflow: "hidden",
        marginBottom: 10,
        transition: "border-color 0.2s",
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "13px 18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: C.cardAlt,
          borderBottom: open ? `1px solid ${C.border}` : "none",
        }}
      >
        <span style={{ fontSize: 18 }}>{section.icon}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.t1, flex: 1 }}>{section.heading}</span>
        {tts.supported && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              tts.speaking ? tts.stop() : tts.speak(ttsText);
            }}
            title={tts.speaking ? "Stop" : "Listen to this section"}
            style={{
              ...btn(),
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: tts.speaking ? `${C.amber}20` : `${C.cyan}12`,
              border: `1px solid ${tts.speaking ? C.amber : C.border}`,
              color: tts.speaking ? C.amber : C.t2,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {tts.speaking ? "⏹" : "🔊"}
          </button>
        )}
        <span style={{ fontSize: 12, color: C.t3 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "14px 18px" }}>
          <p style={{ fontSize: 13.5, color: C.t1, lineHeight: 1.78, margin: "0 0 4px" }}>{section.body}</p>
          {section.code && <CodeExample code={section.code} />}
          {inlineData && (
            <InlineTryMe
              code={inlineData.code}
              answer={inlineData.answer}
              hint={inlineData.hint}
              expected={inlineData.expected}
              label={inlineData.label}
            />
          )}
          {section.tryMe?.starter && onTryMeApply && (
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                onClick={() => onTryMeApply(section.tryMe.starter, section.id, {})}
                style={{
                  ...btn(),
                  fontSize: 11,
                  color: C.t3,
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  textDecoration: "underline",
                  textDecorationColor: `${C.t3}60`,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>📝</span>
                <span>Load full example in code editor</span>
                <span style={{ color: C.t3, fontSize: 10 }}>(available after Read + Video gates)</span>
              </button>
            </div>
          )}
          {section.tip && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                borderRadius: 8,
                background: `${C.amber}08`,
                border: `1px solid ${C.amber}28`,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>⚡</span>
              <span style={{ fontSize: 13, color: C.amber, lineHeight: 1.6 }}>
                <strong>Cyber insight: </strong>
                {section.tip}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LearnSection({ lessonId, objectives = [], onTryMeApply, onComplete }) {
  const tts = useTTS();
  const content = lessonContent.find((l) => l.lessonId === lessonId);

  if (!content) {
    return (
      <div style={{ padding: 32, color: C.t2, fontFamily: C.sans }}>
        No content found for {lessonId}.
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 28px", maxWidth: 820, fontFamily: C.sans, color: C.t1 }}>
      {objectives.length > 0 && (
        <div
          style={{
            padding: "18px 22px",
            background: C.card,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            marginBottom: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.t1, flex: 1 }}>
              By the end of this lesson, you will be able to:
            </span>
            {tts.supported && (
              <button
                type="button"
                onClick={() => (tts.speaking ? tts.stop() : tts.speak(content.ttsIntro))}
                style={{
                  ...btn(),
                  padding: "6px 14px",
                  borderRadius: 7,
                  background: tts.speaking ? `${C.amber}18` : `${C.cyan}12`,
                  border: `1px solid ${tts.speaking ? C.amber : C.border}`,
                  color: tts.speaking ? C.amber : C.cyan,
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {tts.speaking ? <>⏹ Stop</> : <>🔊 Listen</>}
              </button>
            )}
          </div>
          {objectives.map((obj, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  flexShrink: 0,
                  marginTop: 1,
                  background: `${C.cyan}10`,
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: C.cyan,
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: 13.5, color: C.t1, lineHeight: 1.65 }}>{obj}</span>
            </div>
          ))}
        </div>
      )}

      {tts.speaking && (
        <div
          style={{
            padding: "9px 16px",
            marginBottom: 14,
            borderRadius: 8,
            background: `${C.amber}10`,
            border: `1px solid ${C.amber}40`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 13, color: C.amber, flex: 1 }}>🔊 Reading aloud…</span>
          <button
            type="button"
            onClick={tts.stop}
            style={{
              ...btn(),
              padding: "4px 12px",
              borderRadius: 6,
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.t2,
              fontSize: 12,
            }}
          >
            ⏹ Stop
          </button>
        </div>
      )}

      <div style={{ marginBottom: 22 }}>
        {content.sections.map((s) => (
          <SectionCard key={s.id} section={s} lessonId={lessonId} tts={tts} onTryMeApply={onTryMeApply} />
        ))}
      </div>

      <div
        style={{
          padding: "13px 18px",
          background: C.card,
          borderRadius: 12,
          border: `1px solid ${C.green}28`,
          marginBottom: 18,
          fontSize: 13,
          color: C.t2,
          lineHeight: 1.65,
        }}
      >
        🔊 Click the listen button on any section to hear it read aloud. ▶ Use the{" "}
        <strong style={{ color: C.cyan }}>Try Me</strong> blocks to test one concept at a time — no editor needed.
        When you scroll to the bottom and the timer completes, the <strong style={{ color: C.cyan }}>Video</strong>{" "}
        tab unlocks.
      </div>

      {typeof onComplete === "function" && (
        <button
          type="button"
          onClick={onComplete}
          style={{
            ...btn(),
            padding: "13px 28px",
            background: `${C.cyan}12`,
            border: `1px solid ${C.cyan}55`,
            borderRadius: 10,
            color: C.cyan,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          Mark as Read → Watch Video
        </button>
      )}
    </div>
  );
}
