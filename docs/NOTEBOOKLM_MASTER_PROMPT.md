# NotebookLM Master Prompt
## Cyber/AI Python Lab — Code Upload & Explanation Guide

> **How to use this file:**
> 1. Go to [notebooklm.google.com](https://notebooklm.google.com) → New Notebook
> 2. Add Source → Copied text → paste **everything below the line** → Save
> 3. Then add each code file as a separate source (see Section 5)

---

---

## SECTION 1 — WHAT THIS PROJECT IS

This is a browser-based Python learning platform called the **Cyber/AI Python Lab**, built for Grade 10–11 students in Ontario, Canada. It teaches Python through a cybersecurity and AI theme across 10 structured lessons.

The platform is a **React single-page application** with no backend server. All data is stored in the browser's `localStorage`. It is deployed on Netlify.

**Learning philosophy:**
- Mastery-based: students must pass each lesson before the next unlocks
- Gated progression: Read → Watch Video → Practice → Mastery Check
- Anti-cheat: copy/paste blocked, tab-switching resets code, print/screenshot protections active
- AI assistant (ARIA): appears after 3 failed attempts, points students to the relevant reading section
- Accessibility: Text-to-Speech on all reading sections

**Target audience:**
- Students: Grade 10–11, Ontario curriculum, ages 15–17
- Teachers: non-technical to intermediate, need a simple dashboard

---

## SECTION 2 — FILE STRUCTURE & WHAT EACH FILE DOES

```
src/
├── main.jsx
│     Entry point. imports "./securityLayer" as the very first line.
│     Mounts the React app into index.html.
│
├── App.jsx
│     Root component. Manages: auth state (userRole, studentSession),
│     active lesson, per-student progress (codeByLesson,
│     stageByLesson, masteryByLesson), Pyodide runner, anti-cheat
│     hook, ARIA wrong-attempt counter, and topbar rendering.
│     Uses classStore for login/logout and progress persistence.
│
├── styles.css
│     Global layout CSS: topbar, sidebar, panes, layout grid.
│
├── securityLayer.js   (src/ root, NOT in components/)
│     Imported first in main.jsx. Blocks all of:
│       Ctrl+P (print), Ctrl+S (save), Ctrl+U (view source),
│       Ctrl+A (select all), Ctrl+R / F5 (refresh), F12,
│       Ctrl+Shift+I/J/C (DevTools), right-click on content,
│       Ctrl+C copy on content, drag-to-copy, text selection
│       on content, print preview (CSS blackout), tab-away
│       blur overlay with Resume button, DevTools size detection.
│     Logs all violations to studentActivityStore.
│
├── components/
│   │
│   ├── AuthScreen.jsx
│   │     Replaces the old RolePicker. Full login/register screen.
│   │     Three tabs: Student Log In, Student Register, Teacher Login.
│   │     First launch on a new device: teacher runs ClassSetup
│   │     (one-time: class name + class code + password).
│   │     Students register with username + password + class code.
│   │     Calls classStore functions. On success calls
│   │     onStudentAuth(student) or onTeacherAuth().
│   │
│   ├── LessonList.jsx
│   │     Left sidebar. Lists all 10 lessons. Lessons lock/unlock
│   │     based on masteryByLesson. Locked = padlock icon shown.
│   │     Active lesson highlighted. Mastered lessons show ✓ badge.
│   │
│   ├── LearnPanel.jsx
│   │     Gated reading + video panel. Two student tabs: Reading,
│   │     Video (locked until read+timer done). Teacher gets a
│   │     third tab: Manage Videos (add/edit/delete URLs).
│   │     Reading gate: scroll to bottom AND wait minReadSeconds.
│   │     Video gate: watch 90% or click "Mark as watched".
│   │     Both gates pass → learnComplete=true → editor unlocks.
│   │
│   ├── LearnSection.jsx
│   │     Rich reading content renderer used inside LearnPanel.
│   │     Reads from lessonTryMe.js and lessonInlineTryMe.js.
│   │     Renders: TTS listen button per section, read-only code
│   │     examples, InlineTryMe fill-the-blank blocks, cyber tips.
│   │     Load in editor button is a secondary text link only.
│   │
│   ├── InlineTryMe.jsx
│   │     Single-blank inline widget embedded in the reading panel.
│   │     Full code shown read-only with ONE «BLANK» input field.
│   │     Student types one word → clicks Check → instant ✓ or ✗.
│   │     Pure string-match, no Pyodide, works before any gate.
│   │     Hint button, Expected Output after 2 wrong attempts.
│   │
│   ├── EditorPane.jsx
│   │     Monaco code editor (same as VS Code). Paste blocked when
│   │     antiPasteEnabled=true. Shows locked overlay until
│   │     learnComplete. Save button calls saveStudentProgress().
│   │
│   ├── ResultPane.jsx
│   │     Run, Reset, Mastery Check buttons + stdout/error terminal.
│   │     All locked until learnComplete. Mastery Check calls
│   │     gradeLesson() and unlocks next lesson on pass.
│   │
│   ├── PracticeLab.jsx
│   │     Coursera-style lab exercises. Reads from labs.js.
│   │     4 exercises per lesson: prompt, starter code with
│   │     __BLANK__ markers, progressive hints (3 per blank),
│   │     solution reveal, expected output, after-note.
│   │     Locked until learnComplete.
│   │
│   ├── QuizPanel.jsx
│   │     Code-structure MCQ quiz. Reads from quizData.js.
│   │     3 questions per lesson. Each shows a Python snippet.
│   │     Students predict output, fix bugs, or trace execution.
│   │     Immediate feedback with explanation on every answer.
│   │
│   ├── AgentARIA.jsx
│   │     AI study assistant: Adaptive Response Intelligence Agent.
│   │     Appears as a floating card (bottom-right) after exactly
│   │     3 wrong Mastery Check attempts. Analyses the error type,
│   │     maps it to a reading section via ERROR_SECTION_MAP, shows
│   │     a typed animation message, and offers a "Re-read section"
│   │     button. Has minimise and dismiss. Resets on lesson change.
│   │
│   ├── TeacherDashboard.jsx
│   │     Slide-in panel from the right side of the screen.
│   │     Five tabs:
│   │       👩‍🎓 Students — card per student, click for drill-down
│   │                      (per-lesson read/video/mastery table,
│   │                       violations list, event timeline,
│   │                       CSV + JSON download per student)
│   │       📊 Grade Book — matrix: student × lesson, 4 states
│   │       🚨 Alerts    — all security violations with timestamps
│   │       🎛️ Controls  — copy/paste toggle, anti-cheat toggle,
│   │                      export class CSV/JSON, reset all
│   │       🔗 Tools     — quick links: NotebookLM, Colab,
│   │                      YouTube Studio, Google Drive
│   │     Auto-refreshes every 5 seconds.
│   │
│   ├── AppGuide.jsx
│   │     Exports AppGuide (modal with Student + Teacher guides)
│   │     and TeacherTools (the Tools tab content).
│   │     AppGuide button appears in topbar for both roles.
│   │     Student Guide: 6 sections covering full student workflow.
│   │     Teacher Guide: 6 sections covering full teacher workflow.
│   │
│   └── VideoPanel  (inside LearnPanel.jsx, not a separate file)
│         Student: reads only from videoStore — never shows empty
│         placeholder slots from lessons.js. If no videos → notice
│         with "Continue without video" button.
│         Teacher: Manage Videos tab with label + URL form.
│         Supports YouTube (auto-embed), Vimeo, direct .mp4.
│
├── data/
│   │
│   ├── lessons.js
│   │     All 10 lesson definitions. Each lesson:
│   │       id, title, objective, concept, steps, checkpoint,
│   │       materialHtml (HTML reading content),
│   │       minReadSeconds (timer gate duration),
│   │       videoUrl + videoOptions (placeholder paths, ignored),
│   │       template (code with __BLANKn__ placeholders),
│   │       blanks[] (placeholder hint + expectedHint per blank)
│   │
│   ├── lessonTryMe.js
│   │     Rich reading content for all 10 lessons.
│   │     Each lesson: lessonId, ttsIntro (full TTS read text),
│   │     sections[] — each section has id, icon, heading,
│   │     body text, code example, tryMe starter, tip.
│   │
│   ├── lessonInlineTryMe.js
│   │     Inline Try Me data keyed by "l{n}-s{n}".
│   │     Each entry: label, code (with «BLANK»), answer,
│   │     hint, expected output. One entry per reading section
│   │     across all 10 lessons (28 entries total).
│   │     getInlineTryMe(lessonId, sectionId) is the accessor.
│   │
│   ├── labs.js
│   │     Coursera-style lab data for all 10 lessons.
│   │     Each lab: lessonId, title, estimatedMinutes, objectives[],
│   │     intro, exercises[] (4 per lesson), wrapUp.
│   │     Each exercise: id, title, prompt, starter code,
│   │     hints[], solution, expectedOutput, afterNote.
│   │
│   └── quizData.js
│         Quiz questions keyed by lessonId (l1–l10).
│         3 questions per lesson, each with:
│           tag (topic label), q (question), code (snippet),
│           opts[4], correct (0-based index), explain.
│         getQuiz(lessonId) is the accessor.
│
├── utils/
│   │
│   ├── classStore.js                              ← NEW
│   │     Class code system + student account management.
│   │     Teacher functions: setupClass(), verifyTeacherPassword(),
│   │       updateClassConfig(), getClassConfig(), isClassConfigured()
│   │     Student functions: registerStudent(), loginStudent(),
│   │       getAllStudentAccounts(), deleteStudentAccount()
│   │     Session: startSession(), getSession(), clearSession()
│   │     Progress: loadStudentProgress(studentId),
│   │               saveStudentProgress(studentId, payload),
│   │               clearStudentProgress(studentId),
│   │               getAllProgressSummaries(classCode)
│   │     Passwords stored as simpleHash() (not cryptographic —
│   │     adequate for a school pilot, not for production).
│   │     Progress key pattern: py_learn_progress_{studentId}
│   │
│   ├── studentActivityStore.js
│   │     Records student events in localStorage.
│   │     Every event gets: studentId, studentName, at, atLabel.
│   │     recordStudentEvent(event) — call from anywhere.
│   │     getStudentEvents() — all events (for teacher dashboard).
│   │     getAllStudents() — unique students from event log.
│   │     buildStudentSummary(studentId, masteryByLesson) — derives
│   │       full analytics: active time, violations, per-lesson
│   │       progress, ARIA count, hint count, recent timeline.
│   │
│   ├── lessonOverrides.js
│   │     loadLessonOverrides() / saveLessonOverrides()
│   │     getLessonWithOverrides(lesson, overrides) — merges
│   │     teacher edits (title, objective, materialHtml) on top
│   │     of the base lesson. Saved to localStorage.
│   │
│   └── videoStore.js
│         getVideosForLesson(lessonId) → [{label, url, addedAt}]
│         addVideoToLesson(lessonId, label, url) — validates URL,
│           rejects duplicates, auto-handles YouTube/Vimeo.
│         removeVideoFromLesson(lessonId, index)
│         updateVideoInLesson(lessonId, index, label, url)
│         toEmbedUrl(url) — converts YouTube/Vimeo to embed URL.
│         detectUrlType(url) → "youtube"|"vimeo"|"video"|"iframe"
│
├── hooks/
│   ├── usePyodideRunner.js
│   │     Loads Pyodide (Python in WebAssembly).
│   │     Returns { ready, loadingMsg, run(code) }.
│   │     run() returns Promise<{ stdout, error }>.
│   │     Takes 10–30 seconds on first load.
│   │
│   ├── useAntiCheat.js
│   │     Listens for visibilitychange + window blur.
│   │     Calls onViolation(reason) when student switches away.
│   │     enabled prop — can be toggled by teacher in Controls.
│   │
│   ├── useStudentSession.js
│   │     Called in App.jsx. Clears student role + session on
│   │     beforeunload. 3-second grace period prevents false
│   │     triggers when switching Reading↔Video tabs.
│   │     Teachers are never affected.
│   │
│   └── useDebounce.js
│         Standard debounce hook. 700ms delay on AI code analysis.
│
├── ai/
│   └── analyzeClient.js
│         Sends student code + lessonId to AI for inline hints.
│         Returns { severity: "none"|"info"|"warn", message }.
│         Only called after learnComplete. Debounced.
│
└── grading/
    └── gradeLesson.js
          getLessonTestInputs(lessonId) — predefined test inputs
          wrapWithMockInputs(code, inputs) — injects mock input()
          gradeLesson({ lessonId, stdout, error, code })
            → { ok: boolean, message: string }
```

---

## SECTION 3 — KEY CONCEPTS

**THE GATE SYSTEM**
```
Student opens lesson
  → Read material (scroll to bottom + timer bar)
  → Video tab unlocks → watch video
  → learnComplete = true
  → Code editor, PracticeLab, QuizPanel all unlock
  → Student writes code → Mastery Check
  → Pass → next lesson unlocks
  → Fail ×3 → ARIA appears
```

**INLINE TRY ME vs FULL EDITOR**
- InlineTryMe: inside reading panel, one word at a time, string-match only, works before any gate
- EditorPane: full Python editor, requires learnComplete, runs via Pyodide, assessed by gradeLesson

**PER-STUDENT PROGRESS STORAGE**
```
localStorage keys used:
  py_learn_class_config          — class name, code, teacher password hash
  py_learn_student_accounts      — { [username]: student object }
  py_learn_active_session        — current logged-in student
  py_learn_progress_{studentId}  — code, gates, mastery per student
  py_learn_student_events        — all activity events
  py_learn_lesson_videos         — teacher-uploaded videos per lesson
  py_learn_teacher_lesson_overrides — teacher edits to lesson content
```

**CLASS CODE FLOW**
```
Teacher (one-time): setupClass() → class name + code + password
Student (first visit): registerStudent() → username + password + class code
Student (returning): loginStudent() → username + password → session restored
Teacher: verifyTeacherPassword() → dashboard access
```

**SECURITY LAYER**
Browser-level only. Cannot block: OS screenshots, phone cameras, screen recording.
Can block: all keyboard shortcuts, right-click, copy events, print, tab-away overlay, DevTools detection.

---

## SECTION 4 — SAMPLE QUESTIONS FOR NOTEBOOKLM

**Explanation**
- "Walk me through what happens when a student clicks Mastery Check."
- "How does the class code system work from teacher setup to student login?"
- "What is the difference between InlineTryMe and the code editor?"
- "When and why does ARIA appear, and what does it do?"
- "How is each student's progress kept separate on a shared device?"

**Documentation**
- "Generate a technical overview of this platform in one page."
- "Document all localStorage keys this app uses."
- "List every prop that LearnPanel.jsx accepts with types and descriptions."
- "Create a data flow diagram for the student auth system."

**Teacher resources**
- "Write a teacher quick-start guide for first-time setup."
- "What must the teacher do before students can register?"
- "Write a FAQ for teachers about the dashboard and student tracking."
- "Create a classroom setup checklist for a computer lab."

**Student resources**
- "Write a student-friendly registration guide."
- "Explain the learning gate system to a 15-year-old."
- "What should a student do if they forget their password?"
- "Create a help card students can keep at their desk."

**Curriculum**
- "List the Python concepts covered in each of the 10 lessons."
- "How does Lesson 10 connect to real cybersecurity work?"
- "Generate 5 new quiz questions for Lesson 4 (Loops)."
- "Create a 10-week course plan using this platform."

---

## SECTION 5 — FILE UPLOAD CHECKLIST

Upload files to NotebookLM in this order, one source per file.
**Label each source** by writing `FILE: src/path/to/file.jsx` before pasting the code.

| # | File | Why it matters |
|---|------|----------------|
| 1 | *(this prompt)* | Already uploaded |
| 2 | `src/App.jsx` | Root logic — auth, progress, lesson flow |
| 3 | `src/utils/classStore.js` | Account system — most important new file |
| 4 | `src/components/AuthScreen.jsx` | Login/register UI |
| 5 | `src/components/LearnPanel.jsx` | Reading + video gate |
| 6 | `src/components/LearnSection.jsx` | Reading content renderer |
| 7 | `src/components/InlineTryMe.jsx` | Inline fill-the-blank widget |
| 8 | `src/data/lessons.js` | All 10 lesson definitions |
| 9 | `src/data/labs.js` | Practice lab exercises |
| 10 | `src/data/lessonInlineTryMe.js` | Inline Try Me data |
| 11 | `src/data/quizData.js` | Quiz questions |
| 12 | `src/grading/gradeLesson.js` | Mastery check logic |
| 13 | `src/components/AgentARIA.jsx` | ARIA AI assistant |
| 14 | `src/components/TeacherDashboard.jsx` | Teacher dashboard |
| 15 | `src/components/AppGuide.jsx` | In-app guide + teacher tools |
| 16 | `src/securityLayer.js` | Content protection |
| 17 | `src/utils/studentActivityStore.js` | Event tracking |
| 18 | `src/utils/videoStore.js` | Video URL management |

---

## SECTION 6 — CONTEXT FOR AI RESPONSES

**Tech stack:** React 18, Vite, Monaco Editor, Pyodide, localStorage, Netlify

**Constraints:**
- No backend = no cross-device progress sync in current version
- localStorage clears if user clears browser data
- Pyodide takes 10–30 seconds to load on first visit
- Security protections are browser-level only

**Upgrade path to cross-device access:**
Replace `classStore.js` localStorage calls with Firebase Realtime Database.
The rest of the app stays identical — it is the only file that needs changing.

**Audience:** The teacher/developer is not a professional software engineer.
Explain everything in plain language. Students are 15–17, Ontario curriculum.

---

*Cyber/AI Python Lab · Ontario Grade 10–11 · Pilot version*
