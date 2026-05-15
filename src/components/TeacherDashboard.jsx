// src/components/TeacherDashboard.jsx
// Full teacher control panel.
//
// Sections:
//   1. Live Alerts: tab switch, print, copy violations (from studentActivityStore)
//   2. Progress: per-lesson mastery/completion status
//   3. Activity: active time per lesson, attempt counts
//   4. Quiz Results: correct_answer and mastery events
//   5. Controls: copy/paste policy, reset, export
//
// Props:
//   masteryByLesson: { l1: bool, l2: bool, ... }
//   onToggleCopy: fn(bool) parent sets noPasteEnabled
//   noPasteEnabled: bool
//   onResetAll: fn()
//   activeLessonId, currentEditorCode — Assignments tab (per-student code)

import { useState, useEffect, useCallback } from "react";
import { getStudentEvents, clearStudentEvents } from "../utils/studentActivityStore.js";
import { lessons } from "../data/lessons.js";
import { downloadStudentEventsCsv, openPrintableReportWindow } from "../utils/teacherReports.js";
import {
  loadAssignments,
  setAssignment,
  deleteAssignment,
  downloadAssignmentsCsv,
} from "../utils/teacherAssignments.js";

const C = {
  bg:"#040c18", card:"#0a1627", cardAlt:"#081120",
  border:"rgba(0,195,255,0.12)", bHov:"rgba(0,195,255,0.28)",
  cyan:"#00c8ff", green:"#00e87a", amber:"#ffad2e",
  red:"#ff3658", purple:"#a78bfa",
  t1:"#c0ddf0", t2:"#4e7090", t3:"#243850",
  code:"#020a16",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  sans: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
};

const btn = (extra = {}) => ({
  border:"none", cursor:"pointer", fontFamily:C.sans,
  transition:"all 0.18s", outline:"none", ...extra,
});

const SECURITY_ALERT_TYPES = new Set([
  "window_switch",
  "window_blur",
  "window_hidden",
  "print_attempt",
  "blocked_keyboard",
  "blocked_copy",
  "blocked_rightclick",
  "blocked_drag",
  "devtools_opened",
  "printscreen_attempt",
  "session_resumed",
]);

/** Maps `security_blocked_copy` to `blocked_copy` for matching and display. */
function normalizeSecurityEventType(type) {
  if (!type) return "";
  const s = String(type);
  return s.startsWith("security_") ? s.slice("security_".length) : s;
}

function isSecurityAlertEvent(e) {
  return SECURITY_ALERT_TYPES.has(normalizeSecurityEventType(e?.type));
}

// ─── helpers ─────────────────────────────────────────────────────
function Badge({ children, color = C.cyan }) {
  return (
    <span style={{
      display:"inline-block", fontSize:10, fontWeight:700,
      letterSpacing:"0.07em", textTransform:"uppercase",
      padding:"2px 8px", borderRadius:4,
      background:`${color}18`, border:`1px solid ${color}40`, color,
    }}>{children}</span>
  );
}

function SectionHeader({ icon, title, count }) {
  return (
    <div style={{
      padding:"12px 18px", borderBottom:`1px solid ${C.border}`,
      display:"flex", alignItems:"center", gap:8,
      background:C.cardAlt,
    }}>
      <span style={{fontSize:16}}>{icon}</span>
      <span style={{fontSize:14, fontWeight:700, color:C.t1, flex:1}}>{title}</span>
      {count !== undefined && (
        <Badge color={count > 0 ? C.red : C.green}>
          {count > 0 ? `${count} new` : "clear"}
        </Badge>
      )}
    </div>
  );
}

function Toggle({ label, desc, checked, onChange, color = C.cyan }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12,
      padding:"12px 16px", borderRadius:10,
      background:C.cardAlt, border:`1px solid ${C.border}`,
      marginBottom:8,
    }}>
      <div style={{flex:1}}>
        <div style={{fontSize:13, fontWeight:600, color:C.t1}}>{label}</div>
        {desc && <div style={{fontSize:11, color:C.t2, marginTop:2}}>{desc}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{...btn(),
          width:44, height:24, borderRadius:12,
          background:checked ? `${color}30` : C.border,
          border:`1px solid ${checked ? color : C.border}`,
          position:"relative", flexShrink:0,
          transition:"all 0.2s",
        }}
      >
        <div style={{
          width:18, height:18, borderRadius:"50%",
          background:checked ? color : C.t3,
          position:"absolute", top:2,
          left:checked ? 22 : 2,
          transition:"left 0.2s, background 0.2s",
        }} />
      </button>
    </div>
  );
}

// ─── Tab 1: Live Alerts ───────────────────────────────────────────
function AlertsTab({ events, onClear }) {
  const alerts = events.filter(isSecurityAlertEvent);

  const icon = (type) =>
    ({
      window_switch: "🪟",
      window_blur: "🪟",
      window_hidden: "🙈",
      print_attempt: "🖨️",
      blocked_keyboard: "⌨️",
      blocked_copy: "📋",
      blocked_rightclick: "🖱️",
      blocked_drag: "↕️",
      devtools_opened: "🔧",
      printscreen_attempt: "📸",
      session_resumed: "▶️",
    }[normalizeSecurityEventType(type)] || "⚠️");

  const color = (type) =>
    ["print_attempt", "blocked_keyboard", "devtools_opened", "printscreen_attempt"].includes(
      normalizeSecurityEventType(type),
    )
      ? C.red
      : C.amber;

  return (
    <div>
      <SectionHeader icon="🚨" title="Live Security Alerts" count={alerts.length} />
      <div style={{padding:"14px 18px"}}>
        {alerts.length === 0 ? (
          <div style={{
            padding:"24px", textAlign:"center",
            color:C.t2, fontSize:13,
          }}>
            ✅ No alerts, all students are on task.
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onClear}
              style={{
                ...btn(),
                marginBottom: 12,
                padding: "6px 14px",
                borderRadius: 7,
                background: `${C.red}10`,
                border: `1px solid ${C.red}30`,
                color: C.red,
                fontSize: 12,
              }}
            >
              🗑 Clear all activity
            </button>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 12 }}>
              Removes every stored student event (same data as clearing Notifications).
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              {[...alerts].reverse().map((ev, i) => (
                  <div
                  key={ev.id || `${ev.at}-${i}`}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: `${color(ev.type)}08`,
                    border: `1px solid ${color(ev.type)}30`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{icon(ev.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: color(ev.type),
                        textTransform: "capitalize",
                      }}
                    >
                      {normalizeSecurityEventType(ev.type).replace(/_/g, " ")}
                      {ev.key && (
                        <span style={{ color: C.t2, fontWeight: 400 }}>, {ev.key}</span>
                      )}
                    </div>
                    {ev.lessonId && (
                      <div style={{fontSize:11, color:C.t3}}>Lesson: {ev.lessonId}</div>
                    )}
                  </div>
                  <span style={{
                    fontSize:11, color:C.t3, fontFamily:C.mono, flexShrink:0,
                  }}>{ev.atLabel || ev.at?.slice(11,19)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tab 2: Progress Report ───────────────────────────────────────
function ProgressTab({ masteryByLesson }) {
  const completedCount = Object.values(masteryByLesson).filter(Boolean).length;

  // Derive read/video completion from stage events if stored
  const stageData = (() => {
    try {
      const raw = localStorage.getItem("py_learn_progress_v3") || "{}";
      const p = JSON.parse(raw);
      return p.stageByLesson || {};
    } catch { return {}; }
  })();

  return (
    <div>
      <SectionHeader icon="📊" title="Lesson Progress" />
      <div style={{padding:"14px 18px"}}>
        {/* Summary bar */}
        <div style={{
          padding:"14px 16px", borderRadius:10, marginBottom:14,
          background:C.cardAlt, border:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", gap:16,
        }}>
          <div>
            <div style={{fontSize:28, fontWeight:800, color:C.green}}>{completedCount}</div>
            <div style={{fontSize:11, color:C.t2}}>lessons mastered</div>
          </div>
          <div style={{flex:1}}>
            <div style={{
              height:8, background:C.border, borderRadius:4, overflow:"hidden",
            }}>
              <div style={{
                height:"100%", borderRadius:4,
                width:`${(completedCount / lessons.length) * 100}%`,
                background:`linear-gradient(90deg,${C.cyan},${C.green})`,
                transition:"width 0.4s",
              }} />
            </div>
            <div style={{fontSize:11, color:C.t2, marginTop:4}}>
              {completedCount} / {lessons.length} ({Math.round((completedCount/lessons.length)*100)}%)
            </div>
          </div>
        </div>

        {/* Per-lesson table */}
        <div style={{
          borderRadius:10, border:`1px solid ${C.border}`, overflow:"hidden",
        }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"32px 1fr 80px 72px 80px",
            background:C.cardAlt,
          }}>
            {["#","Lesson","Read","Video","Mastery"].map((h,i) => (
              <div key={i} style={{
                padding:"8px 10px",
                borderBottom:`1px solid ${C.border}`,
                borderRight: i < 4 ? `1px solid ${C.border}` : "none",
                fontSize:10, fontWeight:700, color:C.t2,
                letterSpacing:"0.06em", textTransform:"uppercase",
              }}>{h}</div>
            ))}
          </div>
          {lessons.map((lesson, i) => {
            const stage   = stageData[lesson.id] || {};
            const mastered = Boolean(masteryByLesson[lesson.id]);
            const readDone  = Boolean(stage.scrolled && stage.timed);
            const videoDone = Boolean(stage.videoDone);

            return (
              <div key={lesson.id} style={{
                display:"grid",
                gridTemplateColumns:"32px 1fr 80px 72px 80px",
                background: mastered ? `${C.green}06` : "transparent",
              }}>
                <div style={{
                  padding:"9px 10px",
                  borderBottom:`1px solid ${C.border}`,
                  borderRight:`1px solid ${C.border}`,
                  fontSize:12, color:C.t3,
                }}>{i+1}</div>
                <div style={{
                  padding:"9px 10px",
                  borderBottom:`1px solid ${C.border}`,
                  borderRight:`1px solid ${C.border}`,
                  fontSize:12, color:C.t1,
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                }}>
                  {lesson.title.replace(/^Lesson \d+: /,"")}
                </div>
                {[readDone, videoDone, mastered].map((done, j) => (
                  <div key={j} style={{
                    padding:"9px 10px",
                    borderBottom:`1px solid ${C.border}`,
                    borderRight: j < 2 ? `1px solid ${C.border}` : "none",
                    textAlign:"center",
                    fontSize:13,
                    color: done ? C.green : C.t3,
                  }}>
                    {done ? "✓" : "·"}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: Activity ──────────────────────────────────────────────
function ActivityTab({ events }) {
  // Sum active_time minutes
  const totalMins = events
    .filter(e => e.type === "active_time")
    .reduce((sum, e) => sum + (e.minutes || 0), 0);

  const switchTypes = new Set(["window_switch", "window_blur", "window_hidden"]);
  const switches = events.filter((e) => switchTypes.has(normalizeSecurityEventType(e.type))).length;

  // ARIA invocations
  const ariaEvents = events.filter(e => e.type === "aria_triggered");

  // Attempts per lesson
  const attemptsByLesson = {};
  events.filter(e => e.type === "mastery_attempt").forEach(e => {
    if (!attemptsByLesson[e.lessonId]) attemptsByLesson[e.lessonId] = 0;
    attemptsByLesson[e.lessonId]++;
  });

  return (
    <div>
      <SectionHeader icon="⏱️" title="Activity Report" />
      <div style={{padding:"14px 18px"}}>
        {/* Summary cards */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          gap:10, marginBottom:16,
        }}>
          {[
            { label:"Active time",    value:`${totalMins}m`,  color:C.cyan,   icon:"⏱" },
            { label:"Tab switches",   value:switches,         color:C.amber,  icon:"🪟" },
            { label:"ARIA triggered", value:ariaEvents.length,color:C.purple, icon:"🤖" },
          ].map(({label,value,color,icon},i) => (
            <div key={i} style={{
              padding:"14px 12px", borderRadius:10,
              background:C.cardAlt, border:`1px solid ${color}30`,
              textAlign:"center",
            }}>
              <div style={{fontSize:22, marginBottom:4}}>{icon}</div>
              <div style={{fontSize:22, fontWeight:800, color}}>{value}</div>
              <div style={{fontSize:11, color:C.t2}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Event timeline */}
        <div style={{
          fontSize:12, color:C.t2, fontWeight:700,
          letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8,
        }}>
          Event timeline (newest first)
        </div>
        <div style={{
          maxHeight:300, overflowY:"auto",
          display:"flex", flexDirection:"column", gap:5,
        }}>
          {events.length === 0 ? (
            <div style={{fontSize:13,color:C.t3,padding:"16px 0"}}>
              No events recorded yet.
            </div>
          ) : (
            [...events].reverse().map((ev, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"7px 10px", borderRadius:7,
                background:C.cardAlt, border:`1px solid ${C.border}`,
              }}>
                <span style={{
                  fontSize:10, fontFamily:C.mono, color:C.t3,
                  flexShrink:0, minWidth:60,
                }}>
                  {ev.atLabel || (ev.at || "").slice(11,19)}
                </span>
                <span style={{
                  fontSize:11, fontWeight:600, color:C.t2,
                  flex:1, textTransform:"capitalize",
                }}>
                  {normalizeSecurityEventType(ev.type).replace(/_/g," ")}
                </span>
                {ev.lessonId && (
                  <span style={{fontSize:10,color:C.t3}}>{ev.lessonId}</span>
                )}
                {ev.minutes && (
                  <Badge color={C.cyan}>{ev.minutes}m</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 4: Quiz & Practice Results ──────────────────────────────
function ResultsTab({ events }) {
  const resultTypes = ["correct_answer", "student_question", "mastery_attempt", "lab_completed", "quiz_completed"];
  const results = events.filter((e) => resultTypes.includes(e.type));

  const passed = results.filter((e) => e.type === "correct_answer").length;
  const hints = results.filter((e) => e.type === "student_question").length;
  const labs = results.filter((e) => e.type === "lab_completed").length;
  const quizzes = results.filter((e) => e.type === "quiz_completed").length;

  return (
    <div>
      <SectionHeader icon="🏆" title="Quiz & Mastery Results" />
      <div style={{padding:"14px 18px"}}>
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(4, 1fr)",
          gap:10, marginBottom:16,
        }}>
          {[
            { label:"Lessons passed", value:passed, color:C.green, icon:"✅" },
            { label:"Hint triggers",  value:hints,  color:C.amber, icon:"💡" },
            { label:"Labs completed", value:labs,   color:C.cyan,  icon:"🔬" },
            { label:"Quizzes finished", value:quizzes, color:C.purple, icon:"📝" },
          ].map(({label,value,color,icon},i) => (
            <div key={i} style={{
              padding:"14px", borderRadius:10,
              background:C.cardAlt, border:`1px solid ${color}30`,
              textAlign:"center",
            }}>
              <div style={{fontSize:20, marginBottom:4}}>{icon}</div>
              <div style={{fontSize:28, fontWeight:800, color}}>{value}</div>
              <div style={{fontSize:11, color:C.t2}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{
          fontSize:12, color:C.t2, fontWeight:700,
          letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8,
        }}>
          Results log
        </div>
        <div style={{
          maxHeight:280, overflowY:"auto",
          display:"flex", flexDirection:"column", gap:6,
        }}>
          {results.length === 0 ? (
            <div style={{fontSize:13, color:C.t3, padding:"16px 0"}}>
              No quiz or mastery results yet.
            </div>
          ) : (
            [...results].reverse().map((ev, i) => {
              const isPassed = ev.type === "correct_answer";
              const isHint   = ev.type === "student_question";
              const isLab    = ev.type === "lab_completed";
              const isQuiz   = ev.type === "quiz_completed";
              const color    = isPassed ? C.green : isHint ? C.amber : isLab ? C.cyan : isQuiz ? C.purple : C.t2;
              const icon     = isPassed ? "✅" : isHint ? "💡" : isLab ? "🔬" : isQuiz ? "📝" : "🔁";
              return (
                <div key={i} style={{
                  padding:"10px 12px", borderRadius:8,
                  background:`${color}06`,
                  border:`1px solid ${color}25`,
                }}>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                    <span>{icon}</span>
                    <span style={{fontSize:12, fontWeight:600, color}}>
                      {ev.type.replace(/_/g," ")}
                    </span>
                    {ev.lessonId && (
                      <Badge color={color}>{ev.lessonId}</Badge>
                    )}
                    {typeof ev.score === "number" && typeof ev.total === "number" && (
                      <Badge color={color}>{ev.score}/{ev.total}</Badge>
                    )}
                    <span style={{fontSize:11, color:C.t3, marginLeft:"auto", fontFamily:C.mono}}>
                      {ev.atLabel || (ev.at || "").slice(11,19)}
                    </span>
                  </div>
                  {ev.message && (
                    <div style={{fontSize:11, color:C.t2, lineHeight:1.55, marginLeft:22}}>
                      {ev.message}
                    </div>
                  )}
                  {ev.explanation && (
                    <div style={{fontSize:11, color:C.t2, lineHeight:1.55, marginLeft:22}}>
                      {ev.explanation}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 5: Controls ─────────────────────────────────────────────
function ControlsTab({
  noPasteEnabled,
  onToggleCopy, onResetAll,
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div>
      <SectionHeader icon="🎛️" title="Teacher Controls" />
      <div style={{padding:"14px 18px"}}>

        <div style={{
          fontSize:12, color:C.t2, fontWeight:700,
          letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:10,
        }}>
          Student restrictions
        </div>

        <div
          style={{
            fontSize: 12,
            color: C.t2,
            lineHeight: 1.45,
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: `${C.amber}08`,
            border: `1px solid ${C.amber}25`,
          }}
        >
          <strong style={{ color: C.t1 }}>Tab leave:</strong> student sign-in resets after leaving this tab for a few
          seconds. Your teacher screen is never cleared when you switch windows or resize.
        </div>

        <Toggle
          label="Block copy / paste"
          desc="Students cannot paste code into the editor"
          checked={noPasteEnabled}
          onChange={onToggleCopy}
          color={C.red}
        />

        <div style={{
          fontSize:12, color:C.t2, fontWeight:700,
          letterSpacing:"0.07em", textTransform:"uppercase",
          margin:"18px 0 10px",
        }}>
          Danger zone
        </div>

        {!confirmReset ? (
          <button type="button" onClick={() => setConfirmReset(true)} style={{...btn(),
            width:"100%", padding:"12px", borderRadius:10,
            background:`${C.red}10`, border:`1px solid ${C.red}40`,
            color:C.red, fontSize:13, fontWeight:600,
          }}>
            🗑 Reset all student progress
          </button>
        ) : (
          <div style={{
            padding:"14px", borderRadius:10,
            background:`${C.red}10`, border:`1px solid ${C.red}50`,
          }}>
            <div style={{fontSize:13, color:C.red, fontWeight:600, marginBottom:10}}>
              ⚠️ This resets all code, mastery, gates and activity logs. Are you sure?
            </div>
            <div style={{display:"flex", gap:8}}>
              <button type="button" onClick={() => { onResetAll(); setConfirmReset(false); }}
                style={{...btn(),
                  flex:1, padding:"9px", borderRadius:8,
                  background:`${C.red}25`, border:`1px solid ${C.red}`,
                  color:C.red, fontSize:13, fontWeight:700,
                }}>
                Yes, reset everything
              </button>
              <button type="button" onClick={() => setConfirmReset(false)} style={{...btn(),
                padding:"9px 16px", borderRadius:8,
                background:"transparent", border:`1px solid ${C.border}`,
                color:C.t2, fontSize:13,
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Export */}
        <div style={{
          fontSize:12, color:C.t2, fontWeight:700,
          letterSpacing:"0.07em", textTransform:"uppercase",
          margin:"18px 0 10px",
        }}>
          Export
        </div>
        <button
          type="button"
          onClick={() => {
            const data = {
              exported: new Date().toISOString(),
              events: getStudentEvents(),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href     = url;
            a.download = `student-activity-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          style={{...btn(),
            width:"100%", padding:"11px", borderRadius:10,
            background:`${C.cyan}10`, border:`1px solid ${C.cyan}40`,
            color:C.cyan, fontSize:13, fontWeight:600,
          }}>
          ⬇ Export activity log (JSON)
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Reports (Excel CSV, JSON, print/PDF) ─────────────────────
function ReportsTab({ events, masteryByLesson }) {
  const downloadJson = () => {
    const data = {
      exported: new Date().toISOString(),
      events,
      masteryByLesson,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "14px 18px" }}>
      <SectionHeader icon="📥" title="Reports & exports" />
      <p style={{ fontSize: 12, color: C.t2, lineHeight: 1.5, marginBottom: 14 }}>
        Activity CSV includes every field logged for each student event (name, id, time, type, lesson, messages).
        Open the print report for bar-style charts, then use the browser&apos;s <strong>Print → Save as PDF</strong>.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="button"
          onClick={() => downloadStudentEventsCsv(events)}
          style={{
            ...btn(),
            width: "100%",
            padding: "11px",
            borderRadius: 10,
            background: `${C.green}12`,
            border: `1px solid ${C.green}45`,
            color: C.green,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ⬇ Download activity (Excel CSV)
        </button>
        <button
          type="button"
          onClick={downloadJson}
          style={{
            ...btn(),
            width: "100%",
            padding: "11px",
            borderRadius: 10,
            background: `${C.cyan}10`,
            border: `1px solid ${C.cyan}40`,
            color: C.cyan,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ⬇ Download full report (JSON)
        </button>
        <button
          type="button"
          onClick={() => openPrintableReportWindow(events, masteryByLesson)}
          style={{
            ...btn(),
            width: "100%",
            padding: "11px",
            borderRadius: 10,
            background: `${C.amber}12`,
            border: `1px solid ${C.amber}45`,
            color: C.amber,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          📄 Open print report (graphs + PDF)
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Per-student code assignments (local) ─────────────────────
function AssignmentsTab({ events, activeLessonId, currentEditorCode }) {
  const [studentKey, setStudentKey] = useState("");
  const [lessonId, setLessonId] = useState(activeLessonId);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [tick, setTick] = useState(0);

  const students = [
    ...new Set(
      events
        .map((e) => ((e.studentName && String(e.studentName).trim()) || e.studentId || "").trim())
        .filter(Boolean),
    ),
  ].sort();

  useEffect(() => {
    setLessonId(activeLessonId);
  }, [activeLessonId]);

  useEffect(() => {
    if (!studentKey || !lessonId) return;
    const all = loadAssignments();
    const row = all[studentKey]?.[lessonId];
    setCode(row?.code ?? "");
    setNote(row?.note ?? "");
  }, [studentKey, lessonId, tick]);

  const onSave = () => {
    if (!studentKey.trim()) {
      window.alert("Choose a student from the list (students appear after they have used the lab on this machine).");
      return;
    }
    setAssignment(studentKey.trim(), lessonId, code, note);
    setTick((x) => x + 1);
  };

  const onDelete = () => {
    if (!studentKey.trim()) return;
    deleteAssignment(studentKey.trim(), lessonId);
    setCode("");
    setNote("");
    setTick((x) => x + 1);
  };

  return (
    <div style={{ padding: "14px 18px" }}>
      <SectionHeader icon="📝" title="Code assignments" />
      <p style={{ fontSize: 12, color: C.t2, lineHeight: 1.5, marginBottom: 12 }}>
        Save starter or solution code per student and lesson on this browser. Export CSV to share or archive.
        Students still use their own devices unless you distribute these files separately.
      </p>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.t3, marginBottom: 4 }}>Student</label>
      <select
        className="video-select"
        style={{ width: "100%", maxWidth: "none", marginBottom: 10 }}
        value={studentKey}
        onChange={(e) => setStudentKey(e.target.value)}
      >
        <option value="">Select student (from activity)</option>
        {students.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.t3, marginBottom: 4 }}>Lesson</label>
      <select
        className="video-select"
        style={{ width: "100%", maxWidth: "none", marginBottom: 10 }}
        value={lessonId}
        onChange={(e) => setLessonId(e.target.value)}
      >
        {lessons.map((l) => (
          <option key={l.id} value={l.id}>
            {l.id} — {l.title}
          </option>
        ))}
      </select>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn ghost" style={{ fontSize: 12 }} onClick={() => setCode(currentEditorCode || "")}>
          Copy from Code editor
        </button>
      </div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.t3, marginBottom: 4 }}>Python code</label>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={10}
        spellCheck={false}
        style={{
          width: "100%",
          marginBottom: 8,
          padding: 10,
          borderRadius: 10,
          border: `1px solid ${C.border}`,
          background: C.cardAlt,
          color: C.t1,
          fontFamily: "ui-monospace, monospace",
          fontSize: 12,
        }}
      />
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.t3, marginBottom: 4 }}>Note (optional)</label>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{
          width: "100%",
          marginBottom: 10,
          padding: 8,
          borderRadius: 10,
          border: `1px solid ${C.border}`,
          background: C.cardAlt,
          color: C.t1,
          fontSize: 12,
        }}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <button type="button" className="btn" onClick={onSave}>
          Save assignment
        </button>
        <button type="button" className="btn ghost" onClick={onDelete}>
          Clear this slot
        </button>
        <button type="button" className="btn ghost" onClick={() => downloadAssignmentsCsv()}>
          ⬇ Export assignments CSV
        </button>
      </div>
    </div>
  );
}

// ─── Main TeacherDashboard ────────────────────────────────────────
const TABS = [
  { id: "alerts", icon: "🚨", label: "Alerts" },
  { id: "progress", icon: "📊", label: "Progress" },
  { id: "activity", icon: "⏱️", label: "Activity" },
  { id: "results", icon: "🏆", label: "Results" },
  { id: "reports", icon: "📥", label: "Reports" },
  { id: "assign", icon: "📝", label: "Assign" },
  { id: "controls", icon: "🎛️", label: "Controls" },
];

export default function TeacherDashboard({
  masteryByLesson = {},
  noPasteEnabled = true,
  onToggleCopy,
  onResetAll,
  activeLessonId = lessons[0]?.id ?? "l1",
  currentEditorCode = "",
}) {
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState("alerts");
  const [events, setEvents]   = useState([]);
  const [unread, setUnread]   = useState(0);

  const refresh = useCallback(() => {
    const ev = getStudentEvents();
    setEvents(ev);
    setUnread(ev.filter((e) => isSecurityAlertEvent(e)).length);
  }, []);

  // Poll every 5 seconds for new events
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  const handleClearAlerts = () => {
    clearStudentEvents();
    setEvents([]);
    setUnread(0);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); if (!open) refresh(); }}
        style={{...btn(),
          position:"relative",
          padding:"7px 14px", borderRadius:8,
          background: unread > 0 ? `${C.red}18` : `${C.purple}12`,
          border:`1px solid ${unread > 0 ? C.red : C.purple}50`,
          color: unread > 0 ? C.red : C.purple,
          fontSize:13, fontWeight:600,
          display:"flex", alignItems:"center", gap:7,
        }}>
        <span>📋</span>
        <span>Dashboard</span>
        {unread > 0 && (
          <span style={{
            position:"absolute", top:-6, right:-6,
            background:C.red, color:"#fff",
            fontSize:10, fontWeight:800,
            width:18, height:18, borderRadius:"50%",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {/* Dashboard panel */}
      {open && (
        <div style={{
          position:"fixed", top:0, right:0, bottom:0,
          width:420, zIndex:9000,
          background:C.card,
          borderLeft:`1px solid ${C.border}`,
          boxShadow:`-8px 0 40px rgba(0,0,0,0.6)`,
          display:"flex", flexDirection:"column",
          fontFamily:C.sans,
          animation:"slide-in-right 0.25s ease",
        }}>
          <style>{`
            @keyframes slide-in-right {
              from { transform: translateX(40px); opacity:0; }
              to   { transform: translateX(0);    opacity:1; }
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding:"16px 20px",
            borderBottom:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", gap:10,
            background:C.cardAlt, flexShrink:0,
          }}>
            <span style={{fontSize:16}}>👩‍🏫</span>
            <span style={{fontSize:15, fontWeight:700, color:C.t1, flex:1}}>
              Teacher Dashboard
            </span>
            <button
              type="button"
              onClick={refresh}
              style={{...btn(),
                padding:"5px 12px", borderRadius:7,
                background:C.cardAlt, border:`1px solid ${C.border}`,
                color:C.t2, fontSize:11,
              }}>
              ↻ Refresh
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{...btn(),
                width:28, height:28, borderRadius:7,
                background:C.cardAlt, border:`1px solid ${C.border}`,
                color:C.t3, fontSize:16,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>✕</button>
          </div>

          {/* Tab bar */}
          <div style={{
            display:"flex", borderBottom:`1px solid ${C.border}`,
            background:C.cardAlt, flexShrink:0, overflowX:"auto",
          }}>
            {TABS.map(t => {
              const isActive = tab === t.id;
              const hasAlert = t.id === "alerts" && unread > 0;
              return (
                <button type="button" key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{...btn(),
                    padding:"10px 14px", fontSize:12,
                    fontWeight: isActive ? 600 : 400,
                    background:"transparent",
                    borderBottom:`2px solid ${isActive ? C.cyan : "transparent"}`,
                    color: hasAlert ? C.red : isActive ? C.cyan : C.t2,
                    whiteSpace:"nowrap",
                    display:"flex", alignItems:"center", gap:5,
                  }}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  {hasAlert && (
                    <span style={{
                      background:C.red, color:"#fff",
                      fontSize:9, fontWeight:800,
                      padding:"1px 5px", borderRadius:10,
                    }}>{unread}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div style={{flex:1, overflowY:"auto"}}>
            {tab === "alerts"   && <AlertsTab   events={events} onClear={handleClearAlerts} />}
            {tab === "progress" && <ProgressTab masteryByLesson={masteryByLesson} />}
            {tab === "activity" && <ActivityTab events={events} />}
            {tab === "results"  && <ResultsTab  events={events} />}
            {tab === "controls" && (
              <ControlsTab
                noPasteEnabled={noPasteEnabled}
                onToggleCopy={onToggleCopy}
                onResetAll={onResetAll}
              />
            )}
            {tab === "reports" && (
              <ReportsTab events={events} masteryByLesson={masteryByLesson} />
            )}
            {tab === "assign" && (
              <AssignmentsTab
                events={events}
                activeLessonId={activeLessonId}
                currentEditorCode={currentEditorCode}
              />
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding:"10px 18px",
            borderTop:`1px solid ${C.border}`,
            background:C.cardAlt, flexShrink:0,
            display:"flex", alignItems:"center", gap:8,
          }}>
            <div style={{
              width:7, height:7, borderRadius:"50%",
              background:C.green, boxShadow:`0 0 6px ${C.green}`,
            }} />
            <span style={{fontSize:11, color:C.t3}}>
              Auto-refreshes every 5 seconds · {events.length} events total
            </span>
          </div>
        </div>
      )}
    </>
  );
}
