// src/App.jsx
import { scorm } from "./lms/scorm.js";
import { useEffect, useMemo, useState, useRef } from "react";
import "./styles.css";
import { lessons } from "./data/lessons.js";
import LessonList from "./components/LessonList.jsx";
import EditorPane from "./components/EditorPane.jsx";
import ResultPane from "./components/ResultPane.jsx";
import LearnPanel from "./components/LearnPanel.jsx";
import RolePicker, { saveRole } from "./components/RolePicker.jsx";
import { usePyodideRunner } from "./hooks/usePyodideRunner.js";
import { analyzeCode } from "./ai/analyzeClient.js";
import { useDebounce } from "./hooks/useDebounce.js";
import { useAntiCheat } from "./hooks/useAntiCheat.js";
import { gradeLesson, getLessonTestInputs, wrapWithMockInputs } from "./grading/gradeLesson.js";
import { recordStudentEvent } from "./utils/studentActivityStore.js";
import { loadLessonOverrides, getLessonWithOverrides } from "./utils/lessonOverrides.js";
import TeacherNotificationsPanel from "./components/TeacherNotificationsPanel.jsx";

const STORAGE_KEY = "py_learn_progress_v3"; // bump again to avoid old saves

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function normalizeCodeForLesson(lesson, code) {
  if (!lesson?.template) return code ?? "";
  if (!code || typeof code !== "string") return lesson.template;

  const firstLine = (code.split("\n")[0] || "").trim();
  const expected = (lesson.template.split("\n")[0] || "").trim();

  if (expected.startsWith("# Lesson") && firstLine.startsWith("# Lesson") && firstLine !== expected) {
    return lesson.template;
  }
  return code;
}

export default function App() {
  const [userRole, setUserRole] = useState(() => {
    try {
      const r = localStorage.getItem("py_learn_role");
      return (r === "teacher" || r === "student") ? r : null;
    } catch {
      return null;
    }
  });
  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id ?? "l1");

  const [lessonOverridesVersion, setLessonOverridesVersion] = useState(0);
  const activeLesson = useMemo(() => {
    const base = lessons.find((l) => l.id === activeLessonId) ?? lessons[0];
    const overrides = loadLessonOverrides();
    return getLessonWithOverrides(base, overrides);
  }, [activeLessonId, lessonOverridesVersion]);

  const [codeByLesson, setCodeByLesson] = useState(() => {
    const p = loadProgress();
    const initial = {};
    for (const l of lessons) {
      const saved = p?.codeByLesson?.[l.id];
      initial[l.id] = normalizeCodeForLesson(l, saved ?? l.template ?? "");
    }
    return initial;
  });

  const [stageByLesson, setStageByLesson] = useState(() => {
    const p = loadProgress();
    return p?.stageByLesson ?? {};
  });

  // ✅ NEW: mastery status per lesson
  const [masteryByLesson, setMasteryByLesson] = useState(() => {
    const p = loadProgress();
    return p?.masteryByLesson ?? {};
  });

  useEffect(() => {
    setCodeByLesson((prev) => {
      const next = { ...prev };
      for (const l of lessons) {
        next[l.id] = normalizeCodeForLesson(l, prev[l.id] ?? l.template ?? "");
      }
      return next;
    });
  }, []);
  useEffect(() => {
    // init SCORM if inside LMS
    if (scorm.isAvailable()) {
      scorm.init();
      const sc = scorm.loadState();
      if (sc?.activeLessonId) setActiveLessonId(sc.activeLessonId);
      if (sc?.codeByLesson) setCodeByLesson(sc.codeByLesson);
      if (sc?.stageByLesson) setStageByLesson(sc.stageByLesson);
      if (sc?.activeLessonId) scorm.setLocation(sc.activeLessonId);
      scorm.setStatus("incomplete");
    }
  }, []);
  const lessonProgress =
    stageByLesson[activeLessonId] ?? { scrolled: false, timed: false, videoDone: false };

  const isTeacher = userRole === "teacher";

  // ✅ Unlock next lesson only when previous is mastered (students); teachers get all
  const unlockedLessonIds = useMemo(() => {
    if (isTeacher) return new Set(lessons.map((l) => l.id));
    const unlocked = new Set();
    for (let i = 0; i < lessons.length; i++) {
      if (i === 0) unlocked.add(lessons[i].id);
      else if (masteryByLesson[lessons[i - 1].id]) unlocked.add(lessons[i].id);
    }
    return unlocked;
  }, [isTeacher, masteryByLesson]);

  const learnComplete = isTeacher || (lessonProgress.scrolled && lessonProgress.timed && lessonProgress.videoDone);

  const [stdout, setStdout] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState({ severity: "none", message: "" });

  const [masteryMsg, setMasteryMsg] = useState(""); // shown in ResultPane
  const mastered = Boolean(masteryByLesson[activeLessonId]);

  const [antiCheatEnabled, setAntiCheatEnabled] = useState(true);
  const [noPasteEnabled, setNoPasteEnabled] = useState(true);

  const { ready, loadingMsg, run } = usePyodideRunner();

  const code = codeByLesson[activeLessonId] ?? activeLesson?.template ?? "";
  const debouncedCode = useDebounce(code, 700);
  const lastRecordedHintRef = useRef("");

  useEffect(() => {
    let cancelled = false;
    async function doAnalyze() {
      const res = await analyzeCode({ code: debouncedCode, lessonId: activeLessonId });
      if (!cancelled) {
        setHint(res);
        if (!isTeacher && res?.message && res.message !== lastRecordedHintRef.current) {
          lastRecordedHintRef.current = res.message;
          recordStudentEvent({
            type: "student_question",
            lessonId: activeLessonId,
            lessonTitle: activeLesson?.title,
            explanation: res.message,
          });
        }
        if (!res?.message) lastRecordedHintRef.current = "";
      }
    }
    if (learnComplete) doAnalyze();
    return () => { cancelled = true; };
  }, [debouncedCode, activeLessonId, learnComplete, isTeacher, activeLesson?.title]);
  useEffect(() => {
    if (scorm.isAvailable()) scorm.setLocation(activeLessonId);
  }, [activeLessonId]);

  useEffect(() => {
    lastRecordedHintRef.current = "";
  }, [activeLessonId]);

  // Student: track window active time for teacher notifications
  const focusStartRef = useRef(null);
  useEffect(() => {
    if (isTeacher) return;
    const onFocus = () => { focusStartRef.current = Date.now(); };
    const onBlur = () => {
      if (focusStartRef.current) {
        const minutes = Math.round((Date.now() - focusStartRef.current) / 60000);
        if (minutes > 0) {
          recordStudentEvent({ type: "active_time", minutes });
        }
        focusStartRef.current = null;
      }
    };
    const onVisibility = () => {
      if (document.hidden) onBlur();
      else onFocus();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isTeacher]);

  useAntiCheat({
    enabled: antiCheatEnabled,
    onViolation: (reason) => {
      if (!isTeacher) {
        recordStudentEvent({ type: "window_switch", reason });
      }
      setCodeByLesson((prev) => ({
        ...prev,
        [activeLessonId]: activeLesson?.template ?? "",
      }));
      setStdout("");
      setError(`Session reset: ${reason}`);
      setHint({ severity: "info", message: "Stay in the app. Your code was reset." });
      setMasteryMsg("");
    },
  });

  const onChangeCode = (next) => {
    setCodeByLesson((prev) => ({ ...prev, [activeLessonId]: next }));
  };

  const onRun = async () => {
    if (!learnComplete) return;
    setStdout("");
    setError("");
    setMasteryMsg("");

    const result = await run(code);
    setStdout(result.stdout || "");
    setError(result.error || "");
  };

  const onReset = () => {
    setCodeByLesson((prev) => ({ ...prev, [activeLessonId]: activeLesson?.template ?? "" }));
    setStdout("");
    setError("");
    setHint({ severity: "none", message: "" });
    setMasteryMsg("");
    // keep mastery as-is (teacher choice); if you want reset mastery, tell me.
  };

const onSave = () => {
  const payload = { activeLessonId, codeByLesson, stageByLesson };

  // your local fallback save (still good)
  saveProgress(payload);

  // ✅ SCORM save (only works when inside LMS)
  if (scorm.isAvailable()) {
    scorm.init();
    scorm.saveState(payload);
    scorm.setLocation(activeLessonId);
    scorm.commit();
  }

  setHint({ severity: "info", message: "Progress saved successfully." });
};

function reportMastery({ lessonId, score0to100, passed }) {
  if (!scorm.isAvailable()) return;

  scorm.init();
  scorm.setScore(score0to100);

  // Strict status: passed/failed affects gradebook in many LMS
  scorm.setStatus(passed ? "passed" : "failed");

  // Save current location (so LMS resumes properly)
  scorm.setLocation(lessonId);

  scorm.commit();
}

  // ✅ NEW: Mastery Check
  const onMasteryCheck = async () => {
    if (!learnComplete) return;

    setStdout("");
    setError("");
    setMasteryMsg("Running mastery tests...");

    const inputs = getLessonTestInputs(activeLessonId);
    const wrapped = wrapWithMockInputs(code, inputs);

    const result = await run(wrapped);
    const out = result.stdout || "";
    const err = result.error || "";

    setStdout(out);
    setError(err);

    const grade = gradeLesson({ lessonId: activeLessonId, stdout: out, error: err, code });

    if (grade.ok) {
      setMasteryByLesson((prev) => ({ ...prev, [activeLessonId]: true }));
      setMasteryMsg(grade.message);
      if (!isTeacher) {
        recordStudentEvent({
          type: "correct_answer",
          lessonId: activeLessonId,
          lessonTitle: activeLesson?.title,
          message: grade.message,
        });
      }
    } else {
      setMasteryByLesson((prev) => ({ ...prev, [activeLessonId]: false }));
      setMasteryMsg(`Not yet ❌ ${grade.message}`);
    }
  };

  // Persist progress
  useEffect(() => {
    const p = loadProgress();
    saveProgress({ ...p, activeLessonId, codeByLesson, stageByLesson, masteryByLesson });
  }, [activeLessonId, stageByLesson, masteryByLesson]);

  const onSwitchRole = () => {
    setUserRole(null);
    try {
      localStorage.removeItem("py_learn_role");
    } catch {}
  };

  const onResetAllProgress = () => {
    const initialCode = {};
    for (const l of lessons) {
      initialCode[l.id] = l.template ?? "";
    }
    setCodeByLesson(initialCode);
    setStageByLesson({});
    setMasteryByLesson({});
    setStdout("");
    setError("");
    setHint({ severity: "none", message: "" });
    setMasteryMsg("");
    saveProgress({ activeLessonId: lessons[0].id, codeByLesson: initialCode, stageByLesson: {}, masteryByLesson: {} });
  };

  if (!userRole) {
    return (
      <RolePicker
        onSelect={(role) => {
          saveRole(role);
          setUserRole(role);
        }}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-title">Cyber/AI Python Lab (Grades 10–11)</div>
          <div className="brand-subtitle">Learn → Practice → Mastery ✅ → Portfolio Capstone</div>
        </div>

        <div className="toggles">
          <span className={`role-badge ${userRole}`}>
            {userRole === "teacher" ? "👩‍🏫 Teacher" : "👩‍🎓 Student"}
          </span>
          {isTeacher && <TeacherNotificationsPanel />}
          <button type="button" className="btn ghost" onClick={onSwitchRole}>
            Switch role
          </button>
          {isTeacher && (
            <button type="button" className="btn ghost" onClick={onResetAllProgress} title="Reset all code, gates, and mastery">
              Reset all progress
            </button>
          )}
          <label className="toggle">
            <input
              type="checkbox"
              checked={antiCheatEnabled}
              onChange={(e) => setAntiCheatEnabled(e.target.checked)}
            />
            Reset on tab switch
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={noPasteEnabled}
              onChange={(e) => setNoPasteEnabled(e.target.checked)}
            />
            Block copy/paste
          </label>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <LessonList
            lessons={lessons}
            activeId={activeLessonId}
            unlockedLessonIds={unlockedLessonIds}
            masteryByLesson={masteryByLesson}
            onSelect={(id) => {
              if (!unlockedLessonIds.has(id)) return;
              setActiveLessonId(id);
              setStdout("");
              setError("");
              setHint({ severity: "none", message: "" });
              setMasteryMsg("");
            }}
          />
        </aside>

        <main className="main">
          <div className="lesson-meta">
            <div className="lesson-meta-title">{activeLesson?.title}</div>
            <div className="lesson-meta-obj">{activeLesson?.objective}</div>
          </div>

          <LearnPanel
            lesson={activeLesson}
            progress={lessonProgress}
            onProgressChange={(next) =>
              setStageByLesson((prev) => ({ ...prev, [activeLessonId]: next }))
            }
            isTeacher={isTeacher}
            lessonId={activeLessonId}
            onLessonOverride={() => setLessonOverridesVersion((v) => v + 1)}
          />

          <div className="panes">
            <EditorPane
              code={code}
              onChange={onChangeCode}
              hint={hint}
              onSave={onSave}
              antiPasteEnabled={noPasteEnabled}
              unlocked={learnComplete}
            />

        <ResultPane
          stdout={stdout}
          error={error}
          masteryMsg={masteryMsg}
          unlocked={learnComplete}
          onRun={onRun}
          onReset={onReset}
          runtimeReady={ready}
          loadingMsg={loadingMsg}
          onMasteryCheck={onMasteryCheck}
          mastered={mastered}
        />
          </div>
        </main>
      </div>
    </div>
  );
}