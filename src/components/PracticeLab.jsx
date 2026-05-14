// src/components/PracticeLab.jsx
// Coursera-style hands-on lab UI (labs.js). Resolves lab by lessonId when unlocked.

import { useEffect, useMemo, useState } from "react";
import { labs } from "../data/labs.js";

// ─── colour tokens (self-contained; avoids fighting global theme) ───
const C = {
  bg: "#040c18",
  surface: "#060e1b",
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

const btn = (extra = {}) => ({
  border: "none",
  cursor: "pointer",
  fontFamily: C.sans,
  transition: "all 0.15s",
  ...extra,
});

function Badge({ children, color = C.cyan }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: 4,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
      }}
    >
      {children}
    </span>
  );
}

function CodeBlock({ code, language = "python" }) {
  const lines = (code || "").split("\n");
  return (
    <div
      style={{
        background: C.code,
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        overflow: "auto",
        marginTop: 8,
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
        <span style={{ fontSize: 11, color: C.t3, marginLeft: 4, fontFamily: C.mono }}>{language}</span>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "12px 16px",
          fontFamily: C.mono,
          fontSize: 12.5,
          lineHeight: 1.75,
          overflowX: "auto",
          whiteSpace: "pre",
        }}
      >
        {lines.map((line, i) => {
          const isComment = line.trim().startsWith("#");
          if (isComment)
            return (
              <div key={i} style={{ color: C.t3 }}>
                {line}
              </div>
            );
          const parts = line.split(/("[^"]*"|'[^']*')/);
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
                )
              )}
            </div>
          );
        })}
      </pre>
    </div>
  );
}

function OutputBlock({ text }) {
  return (
    <div
      style={{
        background: C.code,
        borderRadius: 8,
        border: `1px solid ${C.green}30`,
        marginTop: 8,
        overflow: "hidden",
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
        <span style={{ fontSize: 11, color: C.green, fontFamily: C.mono }}>expected output</span>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "12px 16px",
          fontFamily: C.mono,
          fontSize: 12,
          lineHeight: 1.7,
          color: C.green,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </pre>
    </div>
  );
}

function ExerciseCard({ exercise, index, totalExercises, onApplyStarter }) {
  const [showHint, setShowHint] = useState(false);
  const [hintStep, setHintStep] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShowHint(false);
    setHintStep(0);
    setShowSolution(false);
    setDone(false);
  }, [exercise.id]);

  const nextHint = () => {
    if (hintStep < exercise.hints.length - 1) setHintStep((h) => h + 1);
  };

  return (
    <div
      style={{
        background: C.card,
        borderRadius: 12,
        border: `1px solid ${done ? C.green + "40" : C.border}`,
        overflow: "hidden",
        marginBottom: 16,
        transition: "border-color 0.3s",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: C.cardAlt,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            flexShrink: 0,
            background: done ? C.green + "20" : C.cyan + "15",
            border: `1px solid ${done ? C.green : C.cyan}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: done ? C.green : C.cyan,
          }}
        >
          {done ? "✓" : index}
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.t1 }}>{exercise.title}</span>
        </div>
        <Badge color={done ? C.green : C.t3}>{done ? "completed" : `${index}/${totalExercises}`}</Badge>
      </div>

      <div style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 13, color: C.t1, lineHeight: 1.75, whiteSpace: "pre-line", marginBottom: 16 }}>
          {exercise.prompt}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Starter code
          </div>
          <CodeBlock code={exercise.starter} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => {
              setShowHint(true);
            }}
            style={{
              ...btn(),
              padding: "8px 16px",
              borderRadius: 7,
              fontSize: 12,
              background: C.amber + "12",
              border: `1px solid ${C.amber}40`,
              color: showHint ? C.amber : C.t2,
            }}
          >
            💡 {showHint ? `Hint ${hintStep + 1} of ${exercise.hints.length}` : "Show hint"}
          </button>

          {showHint && hintStep < exercise.hints.length - 1 && (
            <button
              type="button"
              onClick={nextHint}
              style={{
                ...btn(),
                padding: "8px 14px",
                borderRadius: 7,
                fontSize: 12,
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.t2,
              }}
            >
              Next hint
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSolution((s) => !s)}
            style={{
              ...btn(),
              padding: "8px 16px",
              borderRadius: 7,
              fontSize: 12,
              background: showSolution ? C.purple + "18" : "transparent",
              border: `1px solid ${C.purple}40`,
              color: showSolution ? C.purple : C.t2,
            }}
          >
            {showSolution ? "Hide solution" : "Click here for the solution"}
          </button>

          {onApplyStarter && (
            <button
              type="button"
              onClick={() => onApplyStarter(exercise.starter)}
              style={{
                ...btn(),
                padding: "8px 16px",
                borderRadius: 7,
                fontSize: 12,
                background: C.cyan + "12",
                border: `1px solid ${C.cyan}45`,
                color: C.cyan,
              }}
            >
              Load in editor
            </button>
          )}

          {!done && (
            <button
              type="button"
              onClick={() => setDone(true)}
              style={{
                ...btn(),
                padding: "8px 16px",
                borderRadius: 7,
                fontSize: 12,
                background: C.green + "15",
                border: `1px solid ${C.green}40`,
                color: C.green,
                marginLeft: "auto",
              }}
            >
              ✓ Mark complete
            </button>
          )}
        </div>

        {showHint && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              marginBottom: 12,
              background: C.amber + "08",
              border: `1px solid ${C.amber}30`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: C.amber,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Hint {hintStep + 1}
            </div>
            {exercise.hints.slice(0, hintStep + 1).map((h, i) => (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: i === hintStep ? C.t1 : C.t3,
                  paddingLeft: i > 0 ? 14 : 0,
                  marginTop: i > 0 ? 4 : 0,
                }}
              >
                {i === hintStep ? "• " : "   "}
                {h}
              </div>
            ))}
          </div>
        )}

        {showSolution && (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                color: C.purple,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Solution
            </div>
            <CodeBlock code={exercise.solution} />
            {exercise.expectedOutput && (
              <>
                <div
                  style={{
                    fontSize: 11,
                    color: C.green,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginTop: 12,
                    marginBottom: 6,
                  }}
                >
                  Expected output
                </div>
                <OutputBlock text={exercise.expectedOutput} />
              </>
            )}
          </div>
        )}

        {(done || showSolution) && exercise.afterNote && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: C.cyan + "08",
              border: `1px solid ${C.cyan}25`,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
            <span style={{ fontSize: 13, color: C.t1, lineHeight: 1.6 }}>{exercise.afterNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PracticeLab({ lessonId, unlocked, onApplyStarter, onComplete }) {
  const lab = useMemo(() => labs.find((l) => l.lessonId === lessonId), [lessonId]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    setAllDone(false);
  }, [lessonId]);

  if (!unlocked) return null;

  if (!lab) {
    return (
      <section className="practice-lab-coursera" aria-label="Hands-on lab">
        <div style={{ padding: 32, color: C.t2, fontFamily: C.sans }}>
          No lab found for this lesson.
        </div>
      </section>
    );
  }

  return (
    <section className="practice-lab-coursera" aria-label="Hands-on lab">
      <div
        style={{
          padding: "24px 28px",
          maxWidth: 860,
          margin: "0 auto",
          fontFamily: C.sans,
          color: C.t1,
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            background: C.card,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                flexShrink: 0,
                background: C.cyan + "15",
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              🧪
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: C.t1 }}>{lab.title}</span>
                <Badge color={C.cyan}>{lab.subtitle}</Badge>
              </div>
              <div style={{ fontSize: 12, color: C.t2 }}>
                Estimated time: {lab.estimatedMinutes} minutes &nbsp;·&nbsp; {lab.exercises.length} exercises
              </div>
            </div>
          </div>

          <p style={{ marginTop: 16, marginBottom: 0, fontSize: 13.5, color: C.t1, lineHeight: 1.75, whiteSpace: "pre-line" }}>
            {lab.intro.trim()}
          </p>
        </div>

        <div
          style={{
            padding: "16px 20px",
            background: C.card,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: C.cyan,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Objectives
          </div>
          <div style={{ fontSize: 13, color: C.t2, marginBottom: 8 }}>After completing this lab you will be able to:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {lab.objectives.map((obj, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    flexShrink: 0,
                    marginTop: 1,
                    background: C.cyan + "10",
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: C.cyan,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </div>
                <span style={{ fontSize: 13, color: C.t1, lineHeight: 1.6 }}>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          {lab.exercises.map((ex, i) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              index={i + 1}
              totalExercises={lab.exercises.length}
              onApplyStarter={onApplyStarter}
            />
          ))}
        </div>

        {!allDone && (
          <div
            style={{
              padding: "20px 24px",
              background: C.card,
              borderRadius: 12,
              border: `1px solid ${C.green}30`,
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 8 }}>The last exercise!</div>
            <p style={{ fontSize: 13, color: C.t1, lineHeight: 1.7, margin: 0 }}>{lab.wrapUp.message}</p>
            <p style={{ fontSize: 13, color: C.t2, margin: "8px 0 0" }}>{lab.wrapUp.nextLesson}</p>
          </div>
        )}

        <div
          style={{
            padding: "16px 20px",
            background: C.card,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: C.amber,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Key takeaways
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lab.wrapUp.keyTakeaways.map((kt, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: C.amber, fontSize: 13, marginTop: 1 }}>›</span>
                <span style={{ fontSize: 13, color: C.t1, lineHeight: 1.55 }}>{kt}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: "14px 20px",
            background: C.cardAlt,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              flexShrink: 0,
              background: C.purple + "20",
              border: `1px solid ${C.purple}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: C.purple,
              fontWeight: 700,
            }}
          >
            CP
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.t2 }}>Lab by</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>Cyber Python · Ontario Grade 10 to 11</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Badge color={C.amber}>Mastery track</Badge>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setAllDone(true);
            onComplete?.();
          }}
          style={{
            ...btn(),
            width: "100%",
            padding: "14px",
            background: C.green + "15",
            border: `1px solid ${C.green}50`,
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            color: C.green,
            letterSpacing: "0.04em",
          }}
        >
          ✓ Complete Lab, proceed to quiz
        </button>
      </div>
    </section>
  );
}
