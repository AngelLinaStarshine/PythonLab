// src/components/TeacherDashboard.jsx
// ─────────────────────────────────────────────────────────────────
// Full teacher dashboard — student-centric view.
//
// Tabs:
//   📋 Students    — card per student, click to drill down
//   📊 Grade Book  — lesson × student completion matrix
//   🚨 Alerts      — security violations grouped by student
//   🎛️ Controls    — toggles + export + reset
//
// Each student card shows:
//   Name, last active, active time, lessons mastered / read / video
//   Mastery attempts, quiz correct, hints used, ARIA triggers, violations
//
// Drill-down shows:
//   Per-lesson breakdown (read ✓/✗, video ✓/✗, mastery ✓/✗, attempts)
//   Full event timeline
//   Download individual report (JSON + CSV)
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { AppPortal } from "../utils/appPortal.js";
import {
  getAllStudents,
  buildStudentSummary,
  getClassReportEvents,
  clearStudentEvents,
} from "../utils/studentActivityStore.js";
import { lessons } from "../data/lessons.js";
import {
  loadAssignments,
  setAssignment,
  deleteAssignment,
  downloadAssignmentsCsv,
} from "../utils/teacherAssignments.js";
import {
  downloadStudentEventsCsv,
  openPrintableReportWindow,
} from "../utils/teacherReports.js";
import { TeacherTools } from "./AppGuide.jsx";

const C = {
  bg:"#040c18", card:"#0a1627", cardAlt:"#081120",
  border:"rgba(0,195,255,0.12)", bHov:"rgba(0,195,255,0.25)",
  cyan:"#00c8ff", green:"#00e87a", amber:"#ffad2e",
  red:"#ff3658", purple:"#a78bfa",
  t1:"#c0ddf0", t2:"#4e7090", t3:"#243850",
  code:"#020a16",
  mono:"'JetBrains Mono','Courier New',monospace",
  sans:"'DM Sans',-apple-system,sans-serif",
};

const btn = (x={}) => ({
  border:"none", cursor:"pointer", fontFamily:C.sans,
  transition:"all 0.18s", outline:"none", ...x,
});

const LESSON_NAMES = {
  l1:"Variables & Types",   l2:"Input & Output",
  l3:"Conditionals",        l4:"Loops",
  l5:"Functions",           l6:"Lists",
  l7:"Dictionaries",        l8:"Strings",
  l9:"Exceptions",          l10:"Capstone",
};

// ── Tiny shared atoms ────────────────────────────────────────────
function Badge({ children, color=C.cyan }) {
  return (
    <span style={{
      fontSize:10, fontWeight:700, letterSpacing:"0.07em",
      textTransform:"uppercase",
      padding:"2px 8px", borderRadius:4,
      background:`${color}18`, border:`1px solid ${color}40`, color,
      display:"inline-block",
    }}>{children}</span>
  );
}

function Tick({ done, warn }) {
  if (done) return <span style={{color:C.green,fontSize:14}}>✓</span>;
  if (warn) return <span style={{color:C.amber,fontSize:12}}>~</span>;
  return <span style={{color:C.t3,fontSize:14}}>·</span>;
}

function StatBox({ icon, label, value, color=C.cyan }) {
  return (
    <div style={{
      textAlign:"center", padding:"12px 10px",
      background:C.cardAlt, borderRadius:10,
      border:`1px solid ${color}25`,
    }}>
      <div style={{fontSize:18,marginBottom:3}}>{icon}</div>
      <div style={{fontSize:22,fontWeight:800,color,lineHeight:1.1}}>{value}</div>
      <div style={{fontSize:10,color:C.t2,marginTop:2,letterSpacing:"0.04em"}}>{label}</div>
    </div>
  );
}

// ── Progress ring (simple CSS circle) ───────────────────────────
function Ring({ pct, size=52, color=C.cyan }) {
  const r   = (size-6)/2;
  const circ = 2 * Math.PI * r;
  const dash = (pct/100) * circ;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke={C.border} strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"/>
      <text x={size/2} y={size/2} textAnchor="middle"
        dominantBaseline="central"
        style={{
          fill:color, fontSize:13, fontWeight:700,
          fontFamily:C.sans, transform:`rotate(90deg) translate(0px, -${size}px)`,
        }}
      >{pct}%</text>
    </svg>
  );
}

// ── Student summary card ─────────────────────────────────────────
function StudentCard({ summary, onClick }) {
  const pct  = Math.round((summary.completedCount / 10) * 100);
  const ts   = summary.lastDate || (summary.lastSeen
    ? new Date(summary.lastSeen).toLocaleDateString()
    : "—");

  const riskColor =
    summary.violations >= 5 ? C.red :
    summary.violations >= 2 ? C.amber : C.green;

  return (
    <div
      onClick={onClick}
      style={{
        background:C.card, borderRadius:14,
        border:`1px solid ${C.border}`,
        padding:"20px", cursor:"pointer",
        transition:"all 0.18s",
      }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=C.bHov}
      onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
    >
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <div style={{
          width:42, height:42, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg, ${C.cyan}30, ${C.purple}30)`,
          border:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18,
        }}>
          {summary.studentName?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{
            fontSize:15, fontWeight:700, color:C.t1,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>
            {summary.studentName}
          </div>
          <div style={{fontSize:11,color:C.t2}}>Last active: {ts}</div>
        </div>
        <Ring pct={pct} size={50} color={pct>=70?C.green:pct>=40?C.amber:C.cyan}/>
      </div>

      {/* Stats grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        <StatBox icon="🏆" label="Mastered"     value={`${summary.completedCount}/10`}  color={C.green}  />
        <StatBox icon="⏱️" label="Active min"   value={summary.activeMinutes || 0}       color={C.cyan}   />
        <StatBox icon="⚠️" label="Violations"   value={summary.violations}               color={riskColor}/>
      </div>

      {/* Mini progress bar */}
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.t3,marginBottom:4}}>
          <span>Read: {summary.readCount}/10</span>
          <span>Video: {summary.videoCount}/10</span>
          <span>Mastery: {summary.completedCount}/10</span>
        </div>
        <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
          <div style={{
            height:"100%", borderRadius:2,
            background:`linear-gradient(90deg,${C.cyan},${C.green})`,
            width:`${pct}%`, transition:"width 0.4s",
          }}/>
        </div>
      </div>

      {/* Footer badges */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {summary.ariaCount   >0 && <Badge color={C.purple}>ARIA ×{summary.ariaCount}</Badge>}
        {summary.hintRequests>0 && <Badge color={C.amber}>Hints ×{summary.hintRequests}</Badge>}
        {summary.violations  >0 && <Badge color={riskColor}>⚠ ×{summary.violations}</Badge>}
        {summary.completedCount===10 && <Badge color={C.green}>✓ Complete</Badge>}
      </div>
    </div>
  );
}

// ── Per-student drill-down ───────────────────────────────────────
function StudentDetail({ summary, onBack }) {
  const [showEvents, setShowEvents] = useState(false);

  const exportStudentJSON = () => {
    const blob = new Blob([JSON.stringify(summary, null, 2)], {type:"application/json"});
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), {
      href:url, download:`${summary.studentName.replace(/\s+/g,"_")}_report.json`
    });
    a.click(); URL.revokeObjectURL(url);
  };

  const exportStudentCSV = () => {
    const rows = [
      ["Lesson","Read","Video","Mastered","Attempts","Hints"],
      ...summary.lessonSummary.map(l => [
        l.name,
        l.readDone  ? "Yes":"No",
        l.videoDone ? "Yes":"No",
        l.mastered  ? "Yes":"No",
        l.attempts,
        l.hintsUsed,
      ]),
    ];
    const csv  = rows.map(r => r.map(v=>`"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), {
      href:url, download:`${summary.studentName.replace(/\s+/g,"_")}_progress.csv`
    });
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{padding:"16px 20px"}}>
      {/* Back + actions */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button onClick={onBack} style={{...btn(),
          padding:"7px 14px", borderRadius:8,
          background:C.cardAlt, border:`1px solid ${C.border}`,
          color:C.t2, fontSize:12,
        }}>← All students</button>
        <div style={{
          fontSize:16, fontWeight:700, color:C.t1, flex:1,
        }}>
          {summary.studentName}
        </div>
        <button onClick={exportStudentCSV} style={{...btn(),
          padding:"7px 14px", borderRadius:7, fontSize:11,
          background:`${C.green}12`, border:`1px solid ${C.green}40`,
          color:C.green,
        }}>⬇ CSV</button>
        <button onClick={exportStudentJSON} style={{...btn(),
          padding:"7px 14px", borderRadius:7, fontSize:11,
          background:`${C.cyan}12`, border:`1px solid ${C.cyan}40`,
          color:C.cyan,
        }}>⬇ JSON</button>
      </div>

      {/* Summary stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        <StatBox icon="🏆" label="Mastered"    value={`${summary.completedCount}/10`}  color={C.green}  />
        <StatBox icon="⏱️" label="Active min"  value={summary.activeMinutes||0}         color={C.cyan}   />
        <StatBox icon="🤖" label="ARIA calls"  value={summary.ariaCount}                color={C.purple} />
        <StatBox icon="⚠️" label="Violations"  value={summary.violations}               color={summary.violations>3?C.red:C.amber} />
      </div>

      {/* Per-lesson breakdown table */}
      <div style={{
        background:C.card, borderRadius:12,
        border:`1px solid ${C.border}`,
        overflow:"hidden", marginBottom:16,
      }}>
        <div style={{
          padding:"10px 16px", background:C.cardAlt,
          borderBottom:`1px solid ${C.border}`,
          fontSize:12, fontWeight:700, color:C.t2,
          letterSpacing:"0.06em", textTransform:"uppercase",
        }}>
          Lesson Progress
        </div>
        {/* Header row */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"2fr 60px 60px 80px 70px 60px",
          background:C.cardAlt,
          borderBottom:`1px solid ${C.border}`,
        }}>
          {["Lesson","Read","Video","Mastered","Attempts","Hints"].map((h,i)=>(
            <div key={i} style={{
              padding:"7px 12px", fontSize:10, fontWeight:700,
              color:C.t2, textTransform:"uppercase", letterSpacing:"0.06em",
              borderRight:i<5?`1px solid ${C.border}`:"none",
            }}>{h}</div>
          ))}
        </div>
        {summary.lessonSummary.map((l,i) => (
          <div key={l.id} style={{
            display:"grid",
            gridTemplateColumns:"2fr 60px 60px 80px 70px 60px",
            background: l.mastered?`${C.green}05`:i%2===0?C.card:C.cardAlt,
            borderBottom: i<9?`1px solid ${C.border}`:"none",
          }}>
            <div style={{
              padding:"9px 12px",fontSize:13,color:C.t1,
              borderRight:`1px solid ${C.border}`,
              fontWeight:l.mastered?600:400,
            }}>
              {i+1}. {l.name}
            </div>
            {[l.readDone, l.videoDone, l.mastered].map((done,j)=>(
              <div key={j} style={{
                padding:"9px 12px", textAlign:"center",
                borderRight:`1px solid ${C.border}`,
              }}>
                <Tick done={done}/>
              </div>
            ))}
            <div style={{
              padding:"9px 12px", textAlign:"center",
              borderRight:`1px solid ${C.border}`,
              fontSize:12,
              color: l.attempts>3?C.red:l.attempts>1?C.amber:C.t2,
            }}>
              {l.attempts||"—"}
            </div>
            <div style={{
              padding:"9px 12px", textAlign:"center",
              fontSize:12, color:C.t2,
            }}>
              {l.hintsUsed||"—"}
            </div>
          </div>
        ))}
      </div>

      {/* Violations list */}
      {summary.violationDetails.length > 0 && (
        <div style={{
          background:C.card, borderRadius:12,
          border:`1px solid ${C.red}30`,
          overflow:"hidden", marginBottom:16,
        }}>
          <div style={{
            padding:"10px 16px", background:`${C.red}08`,
            borderBottom:`1px solid ${C.red}25`,
            fontSize:12, fontWeight:700, color:C.red,
          }}>
            ⚠ Security Violations ({summary.violationDetails.length})
          </div>
          <div style={{padding:"8px 0", maxHeight:180, overflowY:"auto"}}>
            {summary.violationDetails.slice().reverse().map((v,i)=>(
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"6px 14px",
                borderBottom:i<summary.violationDetails.length-1?`1px solid ${C.border}`:"none",
              }}>
                <span style={{
                  fontSize:10, fontFamily:C.mono, color:C.t3,
                  minWidth:64, flexShrink:0,
                }}>
                  {v.atLabel||v.at?.slice(11,19)}
                </span>
                <span style={{
                  fontSize:12, color:C.amber, fontWeight:600,
                  textTransform:"capitalize",
                }}>
                  {v.type.replace(/_/g," ")}
                </span>
                {v.key && <span style={{fontSize:11,color:C.t3}}>{v.key}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event timeline toggle */}
      <button
        onClick={()=>setShowEvents(s=>!s)}
        style={{...btn(),
          width:"100%", padding:"10px 16px", borderRadius:10,
          background:C.cardAlt, border:`1px solid ${C.border}`,
          color:C.t2, fontSize:12, textAlign:"left",
          display:"flex", justifyContent:"space-between",
        }}>
        <span>Full event timeline ({summary.recentEvents.length} recent events)</span>
        <span>{showEvents?"▲":"▼"}</span>
      </button>

      {showEvents && (
        <div style={{
          background:C.card, borderRadius:"0 0 10px 10px",
          border:`1px solid ${C.border}`, borderTop:"none",
          maxHeight:280, overflowY:"auto",
          padding:"8px 0",
        }}>
          {summary.recentEvents.map((e,i)=>(
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"6px 14px",
              borderBottom:i<summary.recentEvents.length-1?`1px solid ${C.border}`:"none",
            }}>
              <span style={{fontSize:10,fontFamily:C.mono,color:C.t3,minWidth:64,flexShrink:0}}>
                {e.atLabel}
              </span>
              <span style={{
                fontSize:11, fontWeight:600,
                color: e.type==="correct_answer"?C.green:
                       e.type.includes("block")||e.type.includes("switch")?C.red:C.t2,
                textTransform:"capitalize",
              }}>
                {e.type.replace(/_/g," ")}
              </span>
              {e.lessonId && <Badge color={C.cyan}>{e.lessonId}</Badge>}
              {e.minutes  && <Badge color={C.amber}>{e.minutes}m</Badge>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Grade Book tab ───────────────────────────────────────────────
function GradeBook({ summaries }) {
  if (!summaries.length) return (
    <div style={{padding:32,textAlign:"center",color:C.t2,fontSize:13}}>
      No student data yet.
    </div>
  );

  const lessonIds = ["l1","l2","l3","l4","l5","l6","l7","l8","l9","l10"];

  return (
    <div style={{padding:"16px 0", overflowX:"auto"}}>
      <table style={{
        borderCollapse:"collapse", fontSize:12,
        width:"100%", minWidth:700,
        fontFamily:C.sans,
      }}>
        <thead>
          <tr style={{background:C.cardAlt}}>
            <th style={{
              padding:"10px 16px", textAlign:"left",
              borderBottom:`1px solid ${C.border}`,
              color:C.t2, fontSize:11, fontWeight:700,
              letterSpacing:"0.06em", textTransform:"uppercase",
              position:"sticky", left:0, background:C.cardAlt, zIndex:2,
              minWidth:140,
            }}>Student</th>
            {lessonIds.map((lid,i)=>(
              <th key={lid} style={{
                padding:"10px 8px", textAlign:"center",
                borderBottom:`1px solid ${C.border}`,
                borderLeft:`1px solid ${C.border}`,
                color:C.t2, fontSize:10, fontWeight:700,
                letterSpacing:"0.04em", minWidth:72,
              }}>
                <div style={{color:C.cyan}}>L{i+1}</div>
                <div style={{color:C.t3,fontSize:9,marginTop:1}}>
                  {LESSON_NAMES[lid]?.split(" ")[0]}
                </div>
              </th>
            ))}
            <th style={{
              padding:"10px 8px", textAlign:"center",
              borderBottom:`1px solid ${C.border}`,
              borderLeft:`1px solid ${C.border}`,
              color:C.t2, fontSize:10, fontWeight:700, minWidth:72,
            }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((s,si)=>{
            const pct = Math.round((s.completedCount/10)*100);
            return (
              <tr key={s.studentId}
                style={{background:si%2===0?C.card:C.cardAlt}}>
                <td style={{
                  padding:"10px 16px",
                  borderBottom:`1px solid ${C.border}`,
                  color:C.t1, fontWeight:600, fontSize:13,
                  position:"sticky", left:0,
                  background:si%2===0?C.card:C.cardAlt, zIndex:1,
                }}>
                  {s.studentName}
                  <div style={{fontSize:10,color:C.t2,fontWeight:400}}>
                    {s.activeMinutes||0}m active
                  </div>
                </td>
                {lessonIds.map(lid=>{
                  const l = s.lessonSummary?.find(x=>x.id===lid);
                  const m = l?.mastered;
                  const r = l?.readDone;
                  const v = l?.videoDone;
                  return (
                    <td key={lid} style={{
                      padding:"8px", textAlign:"center",
                      borderBottom:`1px solid ${C.border}`,
                      borderLeft:`1px solid ${C.border}`,
                      background: m?`${C.green}08`:
                                  (r&&v)?`${C.amber}06`:
                                  r?`${C.cyan}05`:"transparent",
                    }}>
                      {m  ? <span style={{fontSize:16,color:C.green}}>✓</span> :
                       r&&v? <span style={{fontSize:11,color:C.amber}}>RV</span> :
                       r  ? <span style={{fontSize:11,color:C.cyan}}>R</span>  :
                             <span style={{fontSize:11,color:C.t3}}>·</span>}
                    </td>
                  );
                })}
                <td style={{
                  padding:"8px", textAlign:"center",
                  borderBottom:`1px solid ${C.border}`,
                  borderLeft:`1px solid ${C.border}`,
                }}>
                  <div style={{
                    fontSize:13, fontWeight:700,
                    color:pct>=70?C.green:pct>=40?C.amber:C.t2,
                  }}>{pct}%</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{
        padding:"10px 16px", fontSize:11, color:C.t3,
        display:"flex", gap:20, marginTop:8,
      }}>
        <span><span style={{color:C.green}}>✓</span> = Mastered</span>
        <span><span style={{color:C.amber}}>RV</span> = Read + Video done</span>
        <span><span style={{color:C.cyan}}>R</span> = Read only</span>
        <span style={{color:C.t3}}>· = Not started</span>
      </div>
    </div>
  );
}

// ── Alerts tab ───────────────────────────────────────────────────
function AlertsTab({ summaries, allEvents, onClear }) {
  const alertTypes = new Set([
    "window_switch","window_blur","window_hidden","print_attempt",
    "blocked_keyboard","blocked_copy","blocked_rightclick",
    "devtools_opened","printscreen_attempt","blocked_drag",
  ]);
  const alerts = allEvents.filter(e => alertTypes.has(e.type));

  const icon = t => ({
    window_switch:"🪟", window_blur:"🪟", window_hidden:"🙈",
    print_attempt:"🖨️", blocked_keyboard:"⌨️", blocked_copy:"📋",
    blocked_rightclick:"🖱️", devtools_opened:"🔧", printscreen_attempt:"📸",
  }[t] || "⚠️");

  return (
    <div style={{padding:"16px 20px"}}>
      <div style={{
        display:"flex", alignItems:"center",
        justifyContent:"space-between", marginBottom:16,
      }}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:C.t1}}>
            Security Alerts
          </div>
          <div style={{fontSize:12,color:C.t2}}>
            {alerts.length} violation{alerts.length!==1?"s":""} recorded across all students
          </div>
        </div>
        <button onClick={onClear} style={{...btn(),
          padding:"7px 14px", borderRadius:7, fontSize:11,
          background:`${C.red}10`, border:`1px solid ${C.red}40`,
          color:C.red,
        }}>🗑 Clear all</button>
      </div>

      {alerts.length===0 ? (
        <div style={{
          padding:32, textAlign:"center",
          color:C.t2, fontSize:13,
        }}>
          ✅ No security alerts recorded.
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[...alerts].reverse().map((e,i)=>(
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 14px", borderRadius:9,
              background:`${C.red}06`,
              border:`1px solid ${C.red}20`,
            }}>
              <span style={{fontSize:16,flexShrink:0}}>{icon(e.type)}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{
                  fontSize:12,fontWeight:600,color:C.amber,
                  textTransform:"capitalize",
                }}>
                  {e.type.replace(/_/g," ")}
                  {e.key && <span style={{color:C.t2,fontWeight:400}}> — {e.key}</span>}
                </div>
                <div style={{fontSize:11,color:C.t2}}>
                  {e.studentName || "Unknown"} · {e.lessonId||""}
                </div>
              </div>
              <span style={{
                fontSize:10,color:C.t3,fontFamily:C.mono,flexShrink:0,
              }}>
                {e.atLabel||e.at?.slice(11,19)} · {e.atDate||""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Controls tab ─────────────────────────────────────────────────
function ControlsTab({
  noPasteEnabled, antiCheatEnabled,
  onToggleCopy, onToggleAntiCheat, onResetAll,
  allSummaries,
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  const Toggle = ({ label, desc, checked, onChange, color=C.red }) => (
    <div style={{
      display:"flex", alignItems:"center", gap:12,
      padding:"12px 16px", borderRadius:10,
      background:C.cardAlt, border:`1px solid ${C.border}`,
      marginBottom:8,
    }}>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:C.t1}}>{label}</div>
        {desc&&<div style={{fontSize:11,color:C.t2,marginTop:2}}>{desc}</div>}
      </div>
      <button onClick={()=>onChange(!checked)} style={{...btn(),
        width:44,height:24,borderRadius:12,
        background:checked?`${color}30`:C.border,
        border:`1px solid ${checked?color:C.border}`,
        position:"relative", flexShrink:0,
      }}>
        <div style={{
          width:18,height:18,borderRadius:"50%",
          background:checked?color:C.t3,
          position:"absolute",top:2,
          left:checked?22:2,transition:"left 0.2s",
        }}/>
      </button>
    </div>
  );

  const exportAll = () => {
    const data = {
      exported:  new Date().toISOString(),
      students:  allSummaries,
      events:    getClassReportEvents(),
    };
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"),{
      href:url, download:`class_report_${Date.now()}.json`,
    });
    a.click(); URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const lessonIds = ["l1","l2","l3","l4","l5","l6","l7","l8","l9","l10"];
    const headers   = [
      "Student","Active Min","Mastered","Violations","ARIA",
      ...lessonIds.map((_,i)=>`L${i+1} Read`),
      ...lessonIds.map((_,i)=>`L${i+1} Video`),
      ...lessonIds.map((_,i)=>`L${i+1} Mastery`),
    ];
    const rows = allSummaries.map(s => [
      s.studentName,
      s.activeMinutes||0,
      s.completedCount,
      s.violations,
      s.ariaCount,
      ...lessonIds.map(lid=>{
        const l=s.lessonSummary?.find(x=>x.id===lid);
        return l?.readDone?"Yes":"No";
      }),
      ...lessonIds.map(lid=>{
        const l=s.lessonSummary?.find(x=>x.id===lid);
        return l?.videoDone?"Yes":"No";
      }),
      ...lessonIds.map(lid=>{
        const l=s.lessonSummary?.find(x=>x.id===lid);
        return l?.mastered?"Yes":"No";
      }),
    ]);
    const csv = [headers,...rows]
      .map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"),{
      href:url, download:`class_gradebook_${Date.now()}.csv`,
    });
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{padding:"16px 20px"}}>
      <div style={{
        fontSize:11,color:C.t2,fontWeight:700,letterSpacing:"0.07em",
        textTransform:"uppercase",marginBottom:10,
      }}>Student restrictions</div>
      <Toggle
        label="Block copy / paste"
        desc="Students cannot paste code into the editor"
        checked={noPasteEnabled} onChange={onToggleCopy} color={C.red}
      />
      {typeof onToggleAntiCheat === "function" ? (
        <Toggle
          label="Reset on tab switch"
          desc="Student's code resets if they leave the app window"
          checked={antiCheatEnabled}
          onChange={onToggleAntiCheat}
          color={C.amber}
        />
      ) : null}

      <div style={{
        fontSize:11,color:C.t2,fontWeight:700,letterSpacing:"0.07em",
        textTransform:"uppercase",margin:"20px 0 10px",
      }}>Export reports</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        <button onClick={exportCSV} style={{...btn(),
          padding:"11px", borderRadius:10,
          background:`${C.green}10`,border:`1px solid ${C.green}40`,
          color:C.green,fontSize:12,fontWeight:600,
        }}>
          ⬇ Class Grade Book (.csv)
        </button>
        <button onClick={exportAll} style={{...btn(),
          padding:"11px", borderRadius:10,
          background:`${C.cyan}10`,border:`1px solid ${C.cyan}40`,
          color:C.cyan,fontSize:12,fontWeight:600,
        }}>
          ⬇ Full Activity Log (.json)
        </button>
      </div>

      <div style={{
        fontSize:11,color:C.t2,fontWeight:700,letterSpacing:"0.07em",
        textTransform:"uppercase",marginBottom:10,
      }}>Danger zone</div>

      {!confirmReset ? (
        <button onClick={()=>setConfirmReset(true)} style={{...btn(),
          width:"100%",padding:"12px",borderRadius:10,
          background:`${C.red}10`,border:`1px solid ${C.red}40`,
          color:C.red,fontSize:13,fontWeight:600,
        }}>
          🗑 Reset all student data + progress
        </button>
      ) : (
        <div style={{
          padding:14,borderRadius:10,
          background:`${C.red}10`,border:`1px solid ${C.red}50`,
        }}>
          <div style={{fontSize:13,color:C.red,fontWeight:600,marginBottom:10}}>
            ⚠️ This clears all events, progress, mastery, and code for every student.
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{onResetAll();setConfirmReset(false);}}
              style={{...btn(),flex:1,padding:9,borderRadius:8,
                background:`${C.red}25`,border:`1px solid ${C.red}`,
                color:C.red,fontSize:13,fontWeight:700,
              }}>Yes, reset everything</button>
            <button onClick={()=>setConfirmReset(false)} style={{...btn(),
              padding:"9px 16px",borderRadius:8,
              background:"transparent",border:`1px solid ${C.border}`,
              color:C.t2,fontSize:13,
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Code assignments (per student, local browser) ─────────────────
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
    <div style={{ padding: "16px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 8 }}>📝 Code assignments</div>
      <p style={{ fontSize: 12, color: C.t2, lineHeight: 1.5, marginBottom: 12 }}>
        Save starter or solution code per student and lesson on this browser.
      </p>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.t3, marginBottom: 4 }}>Student</label>
      <select
        className="video-select"
        style={{ width: "100%", marginBottom: 10 }}
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
        style={{ width: "100%", marginBottom: 10 }}
        value={lessonId}
        onChange={(e) => setLessonId(e.target.value)}
      >
        {lessons.map((l) => (
          <option key={l.id} value={l.id}>
            {l.id} — {l.title}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn ghost"
        style={{ fontSize: 12, marginBottom: 8 }}
        onClick={() => setCode(currentEditorCode || "")}
      >
        Copy from Code editor
      </button>
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
          fontFamily: C.mono,
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
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={onSave}>
          Save assignment
        </button>
        <button type="button" className="btn ghost" onClick={onDelete}>
          Clear this slot
        </button>
        <button type="button" className="btn ghost" onClick={() => downloadAssignmentsCsv()}>
          ⬇ Export CSV
        </button>
      </div>
    </div>
  );
}

// ── Reports tab ──────────────────────────────────────────────────
function ReportsTab({ allEvents, summaries, masteryByLesson }) {
  const exportAll = () => {
    const data = {
      exported: new Date().toISOString(),
      students: summaries,
      events: allEvents,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `class_report_${Date.now()}.json`,
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasData = allEvents.length > 0 || summaries.length > 0;

  if (!hasData) {
    return (
      <div style={{ padding: "20px", color: C.t2, fontSize: 13, lineHeight: 1.7 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 10 }}>No reports yet</div>
        <p style={{ margin: "0 0 12px" }}>
          Reports are built from <strong style={{ color: C.cyan }}>student activity on this browser</strong>.
          They appear after learners sign in as <strong>Student</strong> (with their name) and use the lab.
        </p>
        <ul style={{ margin: "0 0 14px", paddingLeft: 18 }}>
          <li>Teacher mode does not create student rows.</li>
          <li>Each computer keeps its own data (not synced to Netlify automatically).</li>
          <li>For a quick test: Switch role → Student → enter a name → complete a lesson → open Dashboard again.</li>
        </ul>
        <p style={{ margin: 0, fontSize: 12, color: C.t3 }}>
          Class exports also live under the <strong>Controls</strong> tab when data exists.
        </p>
      </div>
    );
  }

  const byType = {};
  for (const e of allEvents) {
    const t = e?.type || "(none)";
    byType[t] = (byType[t] || 0) + 1;
  }

  return (
    <div style={{ padding: "16px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 4 }}>Class reports</div>
      <p style={{ fontSize: 12, color: C.t2, margin: "0 0 14px", lineHeight: 1.5 }}>
        {summaries.length} student{summaries.length !== 1 ? "s" : ""} · {allEvents.length} events logged on this device
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => openPrintableReportWindow(allEvents, masteryByLesson)}
          style={{
            ...btn(),
            padding: "11px",
            borderRadius: 10,
            background: `${C.purple}10`,
            border: `1px solid ${C.purple}40`,
            color: C.purple,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Print / Save PDF
        </button>
        <button
          type="button"
          onClick={() => downloadStudentEventsCsv(allEvents)}
          style={{
            ...btn(),
            padding: "11px",
            borderRadius: 10,
            background: `${C.green}10`,
            border: `1px solid ${C.green}40`,
            color: C.green,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Download CSV
        </button>
        <button
          type="button"
          onClick={exportAll}
          style={{
            ...btn(),
            padding: "11px",
            borderRadius: 10,
            background: `${C.cyan}10`,
            border: `1px solid ${C.cyan}40`,
            color: C.cyan,
            fontSize: 12,
            fontWeight: 600,
            gridColumn: "1 / -1",
          }}
        >
          Download full JSON report
        </button>
      </div>

      <div
        style={{
          background: C.cardAlt,
          borderRadius: 10,
          border: `1px solid ${C.border}`,
          padding: "12px 14px",
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", marginBottom: 8 }}>
          Events by type
        </div>
        {Object.entries(byType)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([type, count]) => (
            <div
              key={type}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                padding: "4px 0",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <span style={{ color: C.t1 }}>{type}</span>
              <span style={{ color: C.cyan, fontWeight: 700 }}>{count}</span>
            </div>
          ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", marginBottom: 8 }}>
        Recent activity
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {allEvents
          .slice(-15)
          .reverse()
          .map((e) => (
            <div
              key={e.id}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: C.cardAlt,
                border: `1px solid ${C.border}`,
                fontSize: 11,
              }}
            >
              <span style={{ color: C.cyan, fontWeight: 600 }}>{e.studentName || "Unknown"}</span>
              <span style={{ color: C.t3 }}> · </span>
              <span style={{ color: C.t2 }}>{e.type}</span>
              {e.lessonId ? <span style={{ color: C.t3 }}> · {e.lessonId}</span> : null}
              <div style={{ color: C.t3, marginTop: 2 }}>{e.atLabel || e.at}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ── MAIN TeacherDashboard ────────────────────────────────────────
const TABS = [
  { id: "students", icon: "👩‍🎓", label: "Students" },
  { id: "gradebook", icon: "📊", label: "Grade Book" },
  { id: "reports", icon: "📄", label: "Reports" },
  { id: "tools", icon: "🔗", label: "Tools" },
  { id: "alerts", icon: "🚨", label: "Alerts" },
  { id: "assign", icon: "📝", label: "Assign" },
  { id: "controls", icon: "🎛️", label: "Controls" },
];

function normalizeAlertType(type) {
  if (!type) return "";
  const s = String(type);
  return s.startsWith("security_") ? s.slice("security_".length) : s;
}

export default function TeacherDashboard({
  masteryByLesson = {},
  noPasteEnabled = true,
  antiCheatEnabled = false,
  onToggleCopy,
  onToggleAntiCheat,
  onResetAll,
  activeLessonId = lessons[0]?.id ?? "l1",
  currentEditorCode = "",
}) {
  const [open,       setOpen]       = useState(false);
  const [tab,        setTab]        = useState("students");
  const [allEvents,  setAllEvents]  = useState([]);
  const [summaries,  setSummaries]  = useState([]);
  const [selected,   setSelected]   = useState(null); // studentId for drill-down
  const [alertCount, setAlertCount] = useState(0);

  const refresh = useCallback(() => {
    const events = getClassReportEvents();
    const students = getAllStudents();
    const sums = students.map((s) => buildStudentSummary(s.studentId));
    setAllEvents(events);
    setSummaries(sums);

    const alertTypes = new Set([
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
    ]);
    setAlertCount(events.filter((e) => alertTypes.has(normalizeAlertType(e.type))).length);
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("py-learn-activity-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    const id = setInterval(refresh, 3000);
    return () => {
      clearInterval(id);
      window.removeEventListener("py-learn-activity-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const handleClearAlerts = () => { clearStudentEvents(); refresh(); };

  const selectedSummary = selected
    ? summaries.find(s=>s.studentId===selected)
    : null;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={()=>{ setOpen(o=>!o); if(!open) refresh(); }}
        style={{...btn(),
          position:"relative",
          padding:"7px 14px", borderRadius:8,
          background:alertCount>0?`${C.red}18`:`${C.purple}12`,
          border:`1px solid ${alertCount>0?C.red:C.purple}50`,
          color:alertCount>0?C.red:C.purple,
          fontSize:13, fontWeight:600,
          display:"flex", alignItems:"center", gap:7,
        }}>
        <span>📋</span>
        <span>Dashboard</span>
        {alertCount>0 && (
          <span style={{
            position:"absolute",top:-6,right:-6,
            background:C.red,color:"#fff",
            fontSize:10,fontWeight:800,
            width:18,height:18,borderRadius:"50%",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{alertCount>9?"9+":alertCount}</span>
        )}
      </button>

      {open && (
        <AppPortal>
        <div
          className="app-modal-overlay"
          onClick={() => { setOpen(false); setSelected(null); }}
        >
        <div
          className="app-modal-panel app-modal-panel--dashboard"
          style={{
          background:C.card,
          border:`1px solid ${C.border}`,
          fontFamily:C.sans,
          animation:"slide-in-right 0.25s ease",
        }}
          onClick={e => e.stopPropagation()}
        >
          <style>{`@keyframes slide-in-right{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

          {/* Header */}
          <div style={{
            padding:"14px 20px",
            borderBottom:`1px solid ${C.border}`,
            display:"flex",alignItems:"center",gap:10,
            background:C.cardAlt,flexShrink:0,
          }}>
            <span style={{fontSize:16}}>👩‍🏫</span>
            <span style={{fontSize:15,fontWeight:700,color:C.t1,flex:1}}>
              Teacher Dashboard
            </span>
            <button onClick={refresh} style={{...btn(),
              padding:"5px 12px",borderRadius:7,
              background:C.cardAlt,border:`1px solid ${C.border}`,
              color:C.t2,fontSize:11,
            }}>↻</button>
            <button onClick={()=>{setOpen(false);setSelected(null);}}
              style={{...btn(),
                width:28,height:28,borderRadius:7,
                background:C.cardAlt,border:`1px solid ${C.border}`,
                color:C.t3,fontSize:16,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>✕</button>
          </div>

          {/* Tab bar */}
          <div style={{
            display:"flex",borderBottom:`1px solid ${C.border}`,
            background:C.cardAlt,flexShrink:0,overflowX:"auto",
          }}>
            {TABS.map(t=>{
              const isActive = tab===t.id;
              const hasAlert = t.id==="alerts" && alertCount>0;
              return (
                <button key={t.id}
                  onClick={()=>{setTab(t.id);setSelected(null);}}
                  style={{...btn(),
                    padding:"10px 14px",fontSize:12,
                    fontWeight:isActive?600:400,
                    background:"transparent",
                    borderBottom:`2px solid ${isActive?C.cyan:"transparent"}`,
                    color:hasAlert?C.red:isActive?C.cyan:C.t2,
                    whiteSpace:"nowrap",
                    display:"flex",alignItems:"center",gap:5,
                  }}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  {hasAlert&&(
                    <span style={{
                      background:C.red,color:"#fff",fontSize:9,
                      fontWeight:800,padding:"1px 5px",borderRadius:10,
                    }}>{alertCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div style={{flex:1,overflowY:"auto"}}>

            {/* Students tab */}
            {tab==="students" && (
              selectedSummary ? (
                <StudentDetail
                  summary={selectedSummary}
                  onBack={()=>setSelected(null)}
                />
              ) : (
                <div style={{padding:"16px 20px"}}>
                  <div style={{
                    display:"flex",justifyContent:"space-between",
                    alignItems:"center",marginBottom:14,
                  }}>
                    <div style={{fontSize:14,fontWeight:700,color:C.t1}}>
                      {summaries.length} student{summaries.length!==1?"s":""} on record
                    </div>
                    <Badge color={C.cyan}>
                      {summaries.filter(s=>s.completedCount===10).length} complete
                    </Badge>
                  </div>

                  {summaries.length===0 ? (
                    <div style={{
                      padding:40,textAlign:"center",
                      color:C.t2,fontSize:13,lineHeight:1.7,
                    }}>
                      No students yet.<br/>
                      Students enter their name when they sign in.
                    </div>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {summaries.map(s=>(
                        <StudentCard
                          key={s.studentId}
                          summary={s}
                          onClick={()=>setSelected(s.studentId)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {tab==="gradebook" && <GradeBook summaries={summaries}/>}
            {tab==="reports" && (
              <ReportsTab
                allEvents={allEvents}
                summaries={summaries}
                masteryByLesson={masteryByLesson}
              />
            )}
            {tab === "tools" && <TeacherTools />}
            {tab==="alerts"    && (
              <AlertsTab
                summaries={summaries}
                allEvents={allEvents}
                onClear={handleClearAlerts}
              />
            )}
            {tab === "assign" && (
              <AssignmentsTab
                events={allEvents}
                activeLessonId={activeLessonId}
                currentEditorCode={currentEditorCode}
              />
            )}
            {tab==="controls"  && (
              <ControlsTab
                noPasteEnabled={noPasteEnabled}
                antiCheatEnabled={antiCheatEnabled}
                onToggleCopy={onToggleCopy}
                onToggleAntiCheat={onToggleAntiCheat}
                onResetAll={onResetAll}
                allSummaries={summaries}
              />
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding:"9px 18px",
            borderTop:`1px solid ${C.border}`,
            background:C.cardAlt,flexShrink:0,
            display:"flex",alignItems:"center",gap:8,
          }}>
            <div style={{
              width:7,height:7,borderRadius:"50%",
              background:C.green,boxShadow:`0 0 6px ${C.green}`,
            }}/>
            <span style={{fontSize:11,color:C.t3}}>
              Auto-refreshes every 3 s · {allEvents.length} total events
            </span>
          </div>
        </div>
        </div>
        </AppPortal>
      )}
    </>
  );
}
