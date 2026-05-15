// src/components/AppGuide.jsx
// ─────────────────────────────────────────────────────────────────
// In-app guidance modal.
// Shows a detailed guide for the current role.
// Also contains the TeacherTools quick-access panel (NotebookLM,
// Google Colab, and other teacher resources).
//
// Usage:
//   import { AppGuide, TeacherTools } from "./components/AppGuide";
//
//   // In topbar:
//   <AppGuide role={userRole} />
//
//   // In TeacherDashboard Tools tab:
//   <TeacherTools />
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";

const C = {
  bg:"#040c18", card:"#0a1627", cardAlt:"#081120",
  border:"rgba(0,195,255,0.12)",
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

// ── Shared atoms ─────────────────────────────────────────────────
function Step({ n, title, body, warn }) {
  return (
    <div style={{
      display:"flex", gap:12, alignItems:"flex-start",
      padding:"10px 0",
      borderBottom:`1px solid ${C.border}`,
    }}>
      <div style={{
        width:26, height:26, borderRadius:"50%", flexShrink:0, marginTop:1,
        background: warn?`${C.amber}20`:`${C.cyan}12`,
        border:`1px solid ${warn?C.amber:C.cyan}50`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:11, fontWeight:700,
        color:warn?C.amber:C.cyan,
      }}>{n}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13, fontWeight:600, color:C.t1, marginBottom:3}}>
          {title}
        </div>
        <div style={{fontSize:12.5, color:C.t2, lineHeight:1.7}}>{body}</div>
      </div>
    </div>
  );
}

function Section({ icon, title, color=C.cyan, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{
      marginBottom:12, borderRadius:10, overflow:"hidden",
      border:`1px solid ${color}25`, background:C.card,
    }}>
      <div
        onClick={()=>setOpen(o=>!o)}
        style={{
          padding:"11px 16px", cursor:"pointer",
          background:`${color}08`,
          display:"flex", alignItems:"center", gap:8,
          borderBottom:open?`1px solid ${color}20`:"none",
        }}
      >
        <span style={{fontSize:16}}>{icon}</span>
        <span style={{fontSize:13, fontWeight:700, color, flex:1}}>{title}</span>
        <span style={{fontSize:12, color:C.t3}}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{padding:"12px 16px"}}>{children}</div>
      )}
    </div>
  );
}

function WarnBox({ children }) {
  return (
    <div style={{
      padding:"10px 14px", borderRadius:8,
      background:`${C.amber}08`, border:`1px solid ${C.amber}35`,
      fontSize:12, color:C.amber, lineHeight:1.65,
      margin:"8px 0",
    }}>
      ⚠️ {children}
    </div>
  );
}

function TipBox({ children }) {
  return (
    <div style={{
      padding:"10px 14px", borderRadius:8,
      background:`${C.cyan}07`, border:`1px solid ${C.cyan}25`,
      fontSize:12, color:C.t2, lineHeight:1.65,
      margin:"8px 0",
    }}>
      💡 {children}
    </div>
  );
}

// ─── STUDENT GUIDE ───────────────────────────────────────────────
function StudentGuide() {
  return (
    <div style={{fontSize:13, color:C.t2, lineHeight:1.7}}>

      <Section icon="🚪" title="Signing In" color={C.cyan}>
        <Step n={1} title="Open the app in your browser"
          body="Your teacher will share the URL. Open it in Chrome or Edge for the best experience."/>
        <Step n={2} title="Click Student"
          body="On the welcome screen, click the Student card — not Teacher."/>
        <Step n={3} title="Enter your name"
          body="Type your first name (or full name). Your teacher uses this to track your progress. Click Start Learning."/>
        <TipBox>Your name is remembered on this device. If you're on a shared computer, someone else's name may appear — always check and update it.</TipBox>
      </Section>

      <Section icon="🗺️" title="Understanding the Layout" color={C.purple}>
        <Step n={1} title="Left sidebar — Lessons"
          body="Shows all 10 lessons. Lesson 1 starts unlocked. Each lesson unlocks after you pass Mastery Check on the previous one. Locked lessons show a padlock icon."/>
        <Step n={2} title="Main area — Learn panel"
          body="At the top of the main column. Contains the Reading tab, Video tab, and inline Try Me exercises. You must complete both before the editor unlocks."/>
        <Step n={3} title="Practice Lab"
          body="Appears below the Learn panel after the gates pass. Follow each exercise step by step, fill in the blanks, and check your answers."/>
        <Step n={4} title="Code pane (right side)"
          body="Monaco code editor. Write your Python here. Use Save to keep your progress. Unlocks only after Learn is complete."/>
        <Step n={5} title="Result pane (right side)"
          body="Contains Run, Reset, and Mastery Check. Your code output and errors appear here."/>
      </Section>

      <Section icon="🔒" title="The Learning Gate — Do This in Order" color={C.amber}>
        <Step n={1} title="Read the material"
          body="Scroll all the way to the bottom of the reading. A timer bar shows the minimum reading time. Both scroll AND timer must complete." warn/>
        <Step n={2} title="Use Try Me blocks"
          body="Inside the reading, amber-highlighted blanks appear inside code blocks. Type the one requested word and click Check. This tests your understanding right as you read — no editor needed."/>
        <Step n={3} title="Watch the video"
          body="The Video tab unlocks after reading is complete. Watch your teacher's video. Click Mark as watched when done." warn/>
        <Step n={4} title="Code + Practice unlock"
          body="Once reading and video are done, the code editor and Practice Lab both unlock."/>
        <Step n={5} title="Pass Mastery Check"
          body="When your code meets the lesson goals, click Mastery Check. Pass → next lesson unlocks." warn/>
        <WarnBox>Do NOT switch to another browser tab or application while using the lab. The app detects tab switches and your session may reset. Use a second device for notes or music.</WarnBox>
      </Section>

      <Section icon="▶️" title="Buttons to Know" color={C.green}>
        <Step n="▶" title="Run"
          body="Runs your current code in the editor. Only available after Learn gates are complete. Watch the terminal output below for results or errors."/>
        <Step n="↺" title="Reset"
          body="Puts the default template code back in the editor. Does not affect your mastery status or which lesson is selected."/>
        <Step n="🏆" title="Mastery Check"
          body="The official test for this lesson. Uses automated tests to check if your code meets all goals. When you pass, the next lesson unlocks in the sidebar."/>
        <Step n="💾" title="Save"
          body="Saves your current code, lesson selection, and progress to this browser. Use it often."/>
      </Section>

      <Section icon="🤖" title="ARIA — Your AI Study Assistant" color={C.purple}>
        <Step n={1} title="When does ARIA appear?"
          body="ARIA appears automatically after 3 incorrect Mastery Check attempts on the same lesson. She will not appear before that."/>
        <Step n={2} title="What does ARIA do?"
          body="She analyses your error, identifies which section of the reading covers the answer, and gives you a targeted tip pointing directly to it."/>
        <Step n={3} title="How to use ARIA"
          body="Read her message, click the blue Re-read button to jump back to the relevant section, then try again. You can minimise ARIA and keep working."/>
        <TipBox>ARIA is not a shortcut — she points you to the reading, not the answer. Re-reading the highlighted section is the fastest route to passing.</TipBox>
      </Section>

      <Section icon="🔐" title="Copy & Paste Rules" color={C.red}>
        <Step n={1} title="Copying is disabled"
          body="Ctrl+C, right-click, and text selection are disabled on lesson content, code examples, and quiz options. This is intentional."/>
        <Step n={2} title="Why?"
          body="Programming is a skill learned by doing. Copy-pasting code prevents you from building the muscle memory and understanding you need. Type every line yourself."/>
        <Step n={3} title="What you CAN do"
          body="You can type freely in the code editor and the Try Me input fields. You can select and copy your own code in the editor pane."/>
      </Section>

    </div>
  );
}

// ─── TEACHER GUIDE ────────────────────────────────────────────────
function TeacherGuide() {
  return (
    <div style={{fontSize:13, color:C.t2, lineHeight:1.7}}>

      <Section icon="🏁" title="Getting Started" color={C.purple}>
        <Step n={1} title="Open the app and select Teacher"
          body="Click the Teacher card on the welcome screen. Teachers are not asked for a name — you go straight in. Your role is remembered across sessions."/>
        <Step n={2} title="Teacher mode bypasses all gates"
          body="As a teacher, all lessons are unlocked, the code editor is always accessible, and the reading/video timers do not apply to you. You can see and test everything immediately."/>
        <Step n={3} title="Open the Dashboard"
          body="Click the Dashboard button in the top-right bar. The panel slides in from the right and auto-refreshes every 5 seconds."/>
      </Section>

      <Section icon="📹" title="Uploading Videos for Students" color={C.cyan}>
        <Step n={1} title="Open any lesson in the sidebar"
          body="Click a lesson in the left sidebar. The Learn panel opens at the top of the main area."/>
        <Step n={2} title="Go to the Manage Videos tab"
          body="Inside the Learn panel, click the purple Manage Videos tab (third tab, only visible in teacher mode)."/>
        <Step n={3} title="Add a video URL"
          body="Enter a display label (e.g. Full Lesson, Quick Overview) and paste the video URL. Supported: YouTube links, Vimeo links, and direct .mp4 URLs."/>
        <Step n={4} title="Save and repeat for each lesson"
          body="Click Save Video. The video appears immediately in the list. Add multiple videos per lesson — students will see a tab for each one."/>
        <Step n={5} title="Students see only saved videos"
          body="Students never see empty slots. If a lesson has no videos saved, they see a 'No videos yet' notice and a Continue button so they're not blocked."/>
        <TipBox>YouTube links automatically convert to embed format. Paste the regular watch URL — no need to find the embed link yourself.</TipBox>
      </Section>

      <Section icon="📊" title="Using the Dashboard" color={C.green}>
        <Step n={1} title="Students tab"
          body="One card per student showing: completion ring, lessons mastered, active minutes, security violations, ARIA triggers, and hints used. Click any card for a full drill-down."/>
        <Step n={2} title="Student drill-down"
          body="Shows a per-lesson table: Read ✓/✗, Video ✓/✗, Mastered ✓/✗, attempt count, hints used. Also shows the full security violation list and event timeline for that student."/>
        <Step n={3} title="Grade Book tab"
          body="A full matrix — every student × every lesson. Cells show: ✓ mastered (green), RV = read+video done (amber), R = read only (cyan), · = not started."/>
        <Step n={4} title="Alerts tab"
          body="All security violations across all students: tab switches, print attempts, DevTools opens, copy blocks. Each alert shows student name, violation type, and timestamp."/>
        <Step n={5} title="Controls tab"
          body="Toggle copy/paste blocking and tab-switch reset for all students. Export the full class grade book as CSV or the complete activity log as JSON."/>
      </Section>

      <Section icon="⬇️" title="Exporting Student Reports" color={C.amber}>
        <Step n={1} title="Per-student report"
          body="Open any student's drill-down view. Click ⬇ CSV for a spreadsheet of their lesson progress, or ⬇ JSON for the full event log."/>
        <Step n={2} title="Full class grade book"
          body="In Controls tab, click ⬇ Class Grade Book (.csv). Opens in Excel or Google Sheets — one row per student, columns for every lesson's read/video/mastery status."/>
        <Step n={3} title="Full activity log"
          body="In Controls tab, click ⬇ Full Activity Log (.json). Contains every recorded event for every student: timestamps, violations, mastery attempts, active time."/>
        <TipBox>Export the grade book at the end of each class session. Data is stored locally on this device — it is not backed up to a server.</TipBox>
      </Section>

      <Section icon="🎛️" title="Classroom Controls" color={C.red}>
        <Step n={1} title="Block copy/paste"
          body="Toggle in Controls tab. When on, students cannot paste code into the editor — they must type it themselves. Recommended: keep on during lessons, toggle off for assessment days if needed."/>
        <Step n={2} title="Reset on tab switch"
          body="Toggle in Controls tab. When on, student code and progress reset if they switch browser tabs or minimise the window. Strongly recommended during graded exercises."/>
        <Step n={3} title="Reset all progress"
          body="At the bottom of Controls tab. Resets all student code, gates, mastery, and activity logs. Use between class groups or at the start of a new semester."/>
        <WarnBox>Reset All is permanent and cannot be undone. Export reports before resetting if you need to keep records.</WarnBox>
      </Section>

      <Section icon="✏️" title="Editing Lesson Content" color={C.purple}>
        <Step n={1} title="Edit lesson title and objective"
          body="In teacher mode, a purple Edit title / objective button appears at the top of each Learn panel. Changes are saved as overrides in the browser — they persist across sessions."/>
        <Step n={2} title="Overrides don't affect the source files"
          body="Edits are stored in localStorage as overrides on top of the default content. To revert to the original, clear the override (feature coming in next update)."/>
      </Section>

    </div>
  );
}

// ─── TEACHER TOOLS (NotebookLM + Colab) ──────────────────────────
export function TeacherTools() {
  const tools = [
    {
      icon:"📓",
      name:"Google NotebookLM",
      url:"https://notebooklm.google.com",
      color:C.cyan,
      badge:"AI Research",
      tagline:"Upload lesson materials, generate study guides, create student FAQs.",
      howTo:[
        "Go to notebooklm.google.com and sign in with your Google account.",
        "Click + New Notebook. Upload your lesson PDFs, paste the lesson text, or paste the NotebookLM prompt file provided with this platform.",
        "In the chat, ask it to generate a student FAQ, create a quiz, or explain a concept in simpler terms.",
        "Use the Audio Overview feature to generate a podcast-style summary students can listen to.",
        "Share the notebook link with students (set to Viewer) so they can query your uploaded materials.",
      ],
      tips:[
        "Paste the full lessonTryMe.js content as a source — NotebookLM can generate comprehension questions automatically.",
        "Ask: 'Generate 5 multiple choice questions about Python loops for Grade 10 students'.",
        "Ask: 'Create a one-page study guide for Lesson 3: Conditionals'.",
      ],
    },
    {
      icon:"🧪",
      name:"Google Colab",
      url:"https://colab.research.google.com",
      color:C.amber,
      badge:"Python Runtime",
      tagline:"Run Python in the browser with no installation. Share notebooks with students.",
      howTo:[
        "Go to colab.research.google.com and sign in with Google.",
        "Click + New Notebook to create a blank Python environment.",
        "Each cell runs Python independently. Press Shift+Enter to run a cell.",
        "Share the notebook URL with students — they can open it, run code, and make their own copy.",
        "Use File → Save a copy in Drive to keep your own version.",
      ],
      tips:[
        "Paste the capstone SENTINEL code into Colab as a full working demo students can run and fork.",
        "Create a Colab notebook per lesson with starter code — share the link in class for live demos.",
        "Colab has free GPU/TPU access — useful for showing AI/ML extensions of the Python concepts.",
        "Students can run code without any local Python installation — ideal for Chromebooks or school-managed devices.",
      ],
    },
    {
      icon:"📺",
      name:"YouTube Studio",
      url:"https://studio.youtube.com",
      color:C.red,
      badge:"Video Upload",
      tagline:"Record and upload lesson videos. Use unlisted links for class-only access.",
      howTo:[
        "Record your lesson video (Loom, OBS, or screen record with audio).",
        "Go to studio.youtube.com and upload the video.",
        "Set visibility to Unlisted — only people with the link can watch it.",
        "Copy the video URL and paste it into the Manage Videos tab for the relevant lesson.",
        "Students will see your video appear in the Video tab automatically.",
      ],
      tips:[
        "Unlisted videos don't appear in search results — safe for classroom use.",
        "Add chapters to your YouTube video (timestamps in description) — they appear as chapter markers in the player.",
        "Record a Short (under 60s) as a Quick Overview option for students who want a fast recap.",
      ],
    },
    {
      icon:"🔗",
      name:"Google Drive",
      url:"https://drive.google.com",
      color:C.green,
      badge:"File Sharing",
      tagline:"Store lesson resources, rubrics, and student exports in one shared folder.",
      howTo:[
        "Create a class folder in Google Drive.",
        "Upload your exported CSV grade books and JSON activity logs here after each session.",
        "Share supplementary PDFs, code reference sheets, or rubrics by pasting their Drive share links into the video manager as reference links.",
        "Create a shared folder for students to submit their final Capstone projects.",
      ],
      tips:[
        "Use Google Sheets (import the CSV export) to track progress over multiple sessions.",
        "Create a shared class folder with view-only access so students can access resources without editing them.",
      ],
    },
  ];

  const [open, setOpen] = useState(null);

  return (
    <div style={{padding:"16px 20px", fontFamily:C.sans}}>
      <div style={{
        fontSize:12, fontWeight:700, color:C.t2,
        letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:14,
      }}>
        Quick Access — Teaching Tools
      </div>

      {tools.map((tool,i) => (
        <div key={i} style={{
          background:C.card, borderRadius:12,
          border:`1px solid ${open===i?tool.color+"50":C.border}`,
          overflow:"hidden", marginBottom:10,
          transition:"border-color 0.2s",
        }}>
          {/* Tool header */}
          <div style={{
            padding:"12px 16px",
            display:"flex", alignItems:"center", gap:12,
            background: open===i?`${tool.color}07`:C.cardAlt,
            borderBottom:open===i?`1px solid ${tool.color}20`:"none",
          }}>
            <span style={{fontSize:22, flexShrink:0}}>{tool.icon}</span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{
                fontSize:14, fontWeight:700, color:C.t1,
              }}>
                {tool.name}
              </div>
              <div style={{fontSize:11, color:C.t2, marginTop:1}}>
                {tool.tagline}
              </div>
            </div>
            <span style={{
              fontSize:9, fontWeight:700, letterSpacing:"0.07em",
              textTransform:"uppercase", padding:"3px 8px", borderRadius:4,
              background:`${tool.color}18`, border:`1px solid ${tool.color}40`,
              color:tool.color, flexShrink:0,
            }}>{tool.badge}</span>
            <button
              onClick={()=>setOpen(open===i?null:i)}
              style={{...btn(),
                padding:"5px 10px", borderRadius:6, fontSize:11,
                background:"transparent", border:`1px solid ${C.border}`,
                color:C.t2,
              }}>
              {open===i?"▲":"▼"}
            </button>
          </div>

          {open===i && (
            <div style={{padding:"14px 16px"}}>

              {/* Open in new tab */}
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:"inline-flex", alignItems:"center", gap:7,
                  padding:"9px 18px", borderRadius:8, marginBottom:14,
                  background:`${tool.color}18`,
                  border:`1px solid ${tool.color}50`,
                  color:tool.color, fontSize:13, fontWeight:600,
                  textDecoration:"none",
                }}
              >
                <span>{tool.icon}</span>
                <span>Open {tool.name} →</span>
              </a>

              {/* How to use */}
              <div style={{
                fontSize:11, fontWeight:700, color:C.t2,
                letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8,
              }}>
                How to use it
              </div>
              <ol style={{
                margin:"0 0 14px", paddingLeft:18,
                display:"flex", flexDirection:"column", gap:6,
              }}>
                {tool.howTo.map((step,j) => (
                  <li key={j} style={{
                    fontSize:12.5, color:C.t1, lineHeight:1.65,
                  }}>
                    {step}
                  </li>
                ))}
              </ol>

              {/* Tips */}
              <div style={{
                padding:"12px 14px", borderRadius:9,
                background:`${tool.color}06`,
                border:`1px solid ${tool.color}20`,
              }}>
                <div style={{
                  fontSize:10, fontWeight:700, color:tool.color,
                  letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8,
                }}>
                  💡 Tips for this platform
                </div>
                <ul style={{
                  margin:0, paddingLeft:16,
                  display:"flex", flexDirection:"column", gap:5,
                }}>
                  {tool.tips.map((tip,j) => (
                    <li key={j} style={{fontSize:12, color:C.t2, lineHeight:1.6}}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN AppGuide component ──────────────────────────────────────
export function AppGuide({ role }) {
  const [open, setOpen] = useState(false);
  const [tab,  setTab]  = useState(role === "teacher" ? "teacher" : "student");

  const isTeacher = role === "teacher";

  return (
    <>
      {/* Trigger button — shown in topbar */}
      <button
        onClick={() => setOpen(true)}
        title="Open user guide"
        style={{...btn(),
          padding:"7px 14px", borderRadius:8,
          background:`${C.cyan}10`,
          border:`1px solid ${C.cyan}40`,
          color:C.cyan, fontSize:13, fontWeight:600,
          display:"flex", alignItems:"center", gap:6,
        }}>
        <span>?</span>
        <span>Guide</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={e => { if(e.target===e.currentTarget) setOpen(false); }}
          style={{
            position:"fixed", inset:0, zIndex:99000,
            background:"rgba(2,8,20,0.88)",
            backdropFilter:"blur(8px)",
            display:"flex", alignItems:"flex-start",
            justifyContent:"center",
            padding:"40px 16px", overflowY:"auto",
          }}
        >
          <div style={{
            width:"100%", maxWidth:680,
            background:C.card, borderRadius:16,
            border:`1px solid ${C.border}`,
            boxShadow:"0 20px 60px rgba(0,0,0,0.7)",
            overflow:"hidden",
            animation:"guide-in 0.25s ease",
          }}>
            <style>{`@keyframes guide-in{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

            {/* Header */}
            <div style={{
              padding:"16px 24px",
              borderBottom:`1px solid ${C.border}`,
              background:C.cardAlt,
              display:"flex", alignItems:"center", gap:10,
            }}>
              <span style={{fontSize:20}}>📖</span>
              <span style={{fontSize:16, fontWeight:700, color:C.t1, flex:1}}>
                Cyber/AI Python Lab — User Guide
              </span>
              <button onClick={()=>setOpen(false)} style={{...btn(),
                width:30, height:30, borderRadius:7,
                background:"transparent", border:`1px solid ${C.border}`,
                color:C.t3, fontSize:16,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>✕</button>
            </div>

            {/* Tab bar */}
            <div style={{
              display:"flex",
              borderBottom:`1px solid ${C.border}`,
              background:C.cardAlt,
            }}>
              {[
                {id:"student", icon:"👩‍🎓", label:"Student Guide"},
                {id:"teacher", icon:"👩‍🏫", label:"Teacher Guide"},
              ].map(t => (
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{...btn(),
                    padding:"11px 20px", fontSize:13,
                    fontWeight:tab===t.id?600:400,
                    background:"transparent",
                    borderBottom:`2px solid ${tab===t.id?C.cyan:"transparent"}`,
                    color:tab===t.id?C.cyan:C.t2,
                    display:"flex", alignItems:"center", gap:6,
                  }}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{
              padding:"20px 24px",
              maxHeight:"70vh", overflowY:"auto",
            }}>
              {tab === "student" && <StudentGuide/>}
              {tab === "teacher" && <TeacherGuide/>}
            </div>

            {/* Footer */}
            <div style={{
              padding:"12px 24px",
              borderTop:`1px solid ${C.border}`,
              background:C.cardAlt,
              display:"flex", justifyContent:"space-between",
              alignItems:"center",
            }}>
              <span style={{fontSize:11, color:C.t3}}>
                Cyber/AI Python Lab · Ontario Grade 10–11
              </span>
              <button onClick={()=>setOpen(false)} style={{...btn(),
                padding:"8px 20px", borderRadius:8,
                background:`${C.cyan}12`, border:`1px solid ${C.cyan}50`,
                color:C.cyan, fontSize:13, fontWeight:600,
              }}>
                Got it →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AppGuide;
