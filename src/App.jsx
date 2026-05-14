// src/App.jsx
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import "./styles.css";
import { lessons } from "./data/lessons.js";
import LessonList from "./components/LessonList.jsx";
import EditorPane from "./components/EditorPane.jsx";
import ResultPane from "./components/ResultPane.jsx";
import LearnPanel from "./components/LearnPanel.jsx";
import RolePicker, { saveRole, loadRole, loadStudentName } from "./components/RolePicker.jsx";
import { usePyodideRunner } from "./hooks/usePyodideRunner.js";
import { analyzeCode } from "./ai/analyzeClient.js";
import { useDebounce } from "./hooks/useDebounce.js";
import { gradeLesson, getLessonTestInputs, wrapWithMockInputs } from "./grading/gradeLesson.js";
import { recordStudentEvent, clearStudentEvents } from "./utils/studentActivityStore.js";
import { loadLessonOverrides, getLessonWithOverrides } from "./utils/lessonOverrides.js";
import { clampTryMeCode } from "./utils/tryMeConstraint.js";
import TeacherNotificationsPanel from "./components/TeacherNotificationsPanel.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import AgentARIA from "./components/AgentARIA.jsx";
import PracticeLab from "./components/PracticeLab.jsx";

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
  const [userRole, setUserRole] = useState(() => loadRole());
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

  const learnPanelRef = useRef(null);
  /** Bumped on full session reset so LearnPanel remounts (local timers / tabs / video state). */
  const [learnPanelMountKey, setLearnPanelMountKey] = useState(0);
  const viewportSizeRef = useRef({
    w: typeof window !== "undefined" ? window.innerWidth : 0,
    h: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [masteryFailByLesson, setMasteryFailByLesson] = useState({});
  const [ariaDismissedByLesson, setAriaDismissedByLesson] = useState({});
  const ariaTriggerLoggedRef = useRef({});

  const mastered = Boolean(masteryByLesson[activeLessonId]);

  const masteryFailCount = masteryFailByLesson[activeLessonId] || 0;
  const showAgentAria =
    !isTeacher &&
    learnComplete &&
    !mastered &&
    masteryFailCount >= 3 &&
    !ariaDismissedByLesson[activeLessonId];

  useEffect(() => {
    if (!showAgentAria) return;
    if (ariaTriggerLoggedRef.current[activeLessonId]) return;
    ariaTriggerLoggedRef.current[activeLessonId] = true;
    recordStudentEvent({
      type: "aria_triggered",
      lessonId: activeLessonId,
      lessonTitle: activeLesson?.title,
    });
  }, [showAgentAria, activeLessonId, activeLesson?.title]);

  const [antiCheatEnabled, setAntiCheatEnabled] = useState(true);
  const [noPasteEnabled, setNoPasteEnabled] = useState(true);
  /** Bumped when starter code is applied from Learn / Lab so Monaco remounts with the new `value`. */
  const [editorLayoutKey, setEditorLayoutKey] = useState(0);

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

  const [editorTryMeConstraint, setEditorTryMeConstraint] = useState(null);

  const onChangeCode = (next) => {
    let v = next ?? "";
    if (editorTryMeConstraint) {
      v = clampTryMeCode(v, editorTryMeConstraint);
    }
    setCodeByLesson((prev) => ({ ...prev, [activeLessonId]: v }));
  };

  const applyStarterToEditor = (nextCode) => {
    setCodeByLesson((prev) => ({ ...prev, [activeLessonId]: nextCode ?? "" }));
    setEditorLayoutKey((k) => k + 1);
  };

  /** When set, normal Run output is mirrored under that Try me section’s “Expected output”. */
  const [tryMeRunPreview, setTryMeRunPreview] = useState(null);

  useEffect(() => {
    setTryMeRunPreview(null);
    setEditorTryMeConstraint(null);
  }, [activeLessonId]);

  const applyStarterFromLab = (nextCode) => {
    setTryMeRunPreview(null);
    setEditorTryMeConstraint(null);
    applyStarterToEditor(nextCode);
  };

  const onTryMeLoadInEditor = (starter, sectionId, meta) => {
    applyStarterToEditor(starter ?? "");
    if (sectionId != null && sectionId !== "") {
      setTryMeRunPreview({ sectionId, stdout: "", error: "" });
    } else {
      setTryMeRunPreview(null);
    }
    setEditorTryMeConstraint(meta?.constraint ?? null);
  };

  const onRun = async () => {
    if (!learnComplete) return;
    setStdout("");
    setError("");
    setMasteryMsg("");

    const result = await run(code);
    setStdout(result.stdout || "");
    setError(result.error || "");
    setTryMeRunPreview((prev) => {
      if (!prev?.sectionId) return prev;
      return {
        sectionId: prev.sectionId,
        stdout: result.stdout || "",
        error: result.error || "",
      };
    });
  };

  const onReset = () => {
    setCodeByLesson((prev) => ({ ...prev, [activeLessonId]: activeLesson?.template ?? "" }));
    setEditorLayoutKey((k) => k + 1);
    setStdout("");
    setError("");
    setHint({ severity: "none", message: "" });
    setMasteryMsg("");
    setTryMeRunPreview(null);
    setEditorTryMeConstraint(null);
    // keep mastery as-is (teacher choice); if you want reset mastery, tell me.
  };

  const onSave = () => {
    const payload = { activeLessonId, codeByLesson, stageByLesson };
    const p = loadProgress();
    saveProgress({ ...p, ...payload, masteryByLesson });
    setHint({ severity: "info", message: "Progress saved successfully." });
  };

  // ✅ NEW: Mastery Check
  const onMasteryCheck = async () => {
    if (!learnComplete) return;

    setTryMeRunPreview(null);
    setEditorTryMeConstraint(null);
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
      setMasteryFailByLesson((prev) => ({ ...prev, [activeLessonId]: 0 }));
      setAriaDismissedByLesson((prev) => ({ ...prev, [activeLessonId]: false }));
      delete ariaTriggerLoggedRef.current[activeLessonId];
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
      setMasteryFailByLesson((prev) => ({
        ...prev,
        [activeLessonId]: (prev[activeLessonId] || 0) + 1,
      }));
      if (!isTeacher) {
        recordStudentEvent({
          type: "mastery_attempt",
          lessonId: activeLessonId,
          lessonTitle: activeLesson?.title,
          message: grade.message,
        });
      }
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
    } catch {
      /* ignore */
    }
  };

  const resetSessionToBeginning = useCallback(
    ({ clearActivityLog = false, progressHint = null } = {}) => {
      const initialCode = {};
      for (const l of lessons) {
        initialCode[l.id] = l.template ?? "";
      }
      const firstId = lessons[0]?.id ?? "l1";
      setActiveLessonId(firstId);
      setCodeByLesson(initialCode);
      setStageByLesson({});
      setMasteryByLesson({});
      setStdout("");
      setError("");
      setMasteryMsg("");
      setMasteryFailByLesson({});
      setAriaDismissedByLesson({});
      ariaTriggerLoggedRef.current = {};
      setEditorLayoutKey((k) => k + 1);
      setLearnPanelMountKey((k) => k + 1);
      if (clearActivityLog) clearStudentEvents();
      if (progressHint) {
        setHint({ severity: "info", message: progressHint });
      } else {
        setHint({ severity: "none", message: "" });
      }
      setTryMeRunPreview(null);
      setEditorTryMeConstraint(null);
      saveProgress({
        activeLessonId: firstId,
        codeByLesson: initialCode,
        stageByLesson: {},
        masteryByLesson: {},
      });
      if (typeof window !== "undefined") {
        viewportSizeRef.current = { w: window.innerWidth, h: window.innerHeight };
      }
    },
    []
  );

  /**
   * Leaving the tab or hiding the window: after a short delay, restart from lesson 1
   * (cancel if the user comes back before the delay). Students always; teachers only
   * when “Reset on tab switch” is enabled.
   */
  useEffect(() => {
    const leaveResetEnabled = !isTeacher || antiCheatEnabled;
    if (!leaveResetEnabled) return;

    const HIDDEN_DEBOUNCE_MS = 500;
    const MOUNT_GRACE_MS = 2000;
    const mountedAt = Date.now();
    let tid;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (Date.now() - mountedAt < MOUNT_GRACE_MS) return;
        window.clearTimeout(tid);
        tid = window.setTimeout(() => {
          tid = undefined;
          if (!isTeacher) {
            recordStudentEvent({
              type: "window_switch",
              reason: "tab_or_window_hidden_session_reset",
            });
          }
          resetSessionToBeginning({
            clearActivityLog: false,
            progressHint:
              "You left this tab or window — starting again from the first lesson.",
          });
        }, HIDDEN_DEBOUNCE_MS);
      } else {
        window.clearTimeout(tid);
        tid = undefined;
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(tid);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isTeacher, antiCheatEnabled, resetSessionToBeginning]);

  useEffect(() => {
    /** Ignore scrollbar / layout jitter so we do not reset in a tight loop. */
    const SIGNIFICANT_SIZE_CHANGE_PX = 180;
    /** Let first paint + scrollbar settle before any auto-reset. */
    const MOUNT_SETTLE_MS = 1600;
    const DEBOUNCE_MS = 450;

    const mountedAt = Date.now();
    let tid;

    const runReset = (progressHint) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      viewportSizeRef.current = { w, h };
      resetSessionToBeginning({
        clearActivityLog: false,
        progressHint,
      });
    };

    const schedule = (kind) => {
      window.clearTimeout(tid);
      tid = window.setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const prev = viewportSizeRef.current;

        if (Date.now() - mountedAt < MOUNT_SETTLE_MS) {
          viewportSizeRef.current = { w, h };
          return;
        }

        if (kind === "orientation") {
          if (w === prev.w && h === prev.h) {
            viewportSizeRef.current = { w, h };
            return;
          }
          runReset(
            "Screen orientation changed — starting again from the first lesson."
          );
          return;
        }

        const delta = Math.abs(w - prev.w) + Math.abs(h - prev.h);
        if (delta < SIGNIFICANT_SIZE_CHANGE_PX) {
          viewportSizeRef.current = { w, h };
          return;
        }

        runReset(
          "Window size changed a lot — starting again from the first lesson."
        );
      }, DEBOUNCE_MS);
    };

    const onResize = () => schedule("resize");
    const onOrientation = () => schedule("orientation");

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);
    return () => {
      window.clearTimeout(tid);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
    };
  }, [resetSessionToBeginning]);

  const onResetAllProgress = () => {
    resetSessionToBeginning({
      clearActivityLog: true,
      progressHint: "All progress cleared.",
    });
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
            {userRole === "teacher"
              ? "👩‍🏫 Teacher"
              : `👩‍🎓 ${loadStudentName() || "Student"}`}
          </span>
          {isTeacher && <TeacherNotificationsPanel />}
          {isTeacher && (
            <TeacherDashboard
              masteryByLesson={masteryByLesson}
              noPasteEnabled={noPasteEnabled}
              antiCheatEnabled={antiCheatEnabled}
              onToggleCopy={setNoPasteEnabled}
              onToggleAntiCheat={setAntiCheatEnabled}
              onResetAll={onResetAllProgress}
            />
          )}
          {isTeacher && (
            <button type="button" className="btn ghost" onClick={onSwitchRole}>
              Switch role
            </button>
          )}
          {isTeacher && (
            <button type="button" className="btn ghost" onClick={onResetAllProgress} title="Reset all code, gates, and mastery">
              Reset all progress
            </button>
          )}
          {isTeacher && (
            <>
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
            </>
          )}
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
              setTryMeRunPreview(null);
              setEditorTryMeConstraint(null);
            }}
          />
        </aside>

        <main className="main">
          <div className="lesson-meta">
            <div className="lesson-meta-title">{activeLesson?.title}</div>
            <div className="lesson-meta-obj">{activeLesson?.objective}</div>
          </div>

          <LearnPanel
            key={`learn-${learnPanelMountKey}-${activeLessonId}`}
            ref={learnPanelRef}
            lesson={activeLesson}
            progress={lessonProgress}
            onProgressChange={(next) =>
              setStageByLesson((prev) => ({ ...prev, [activeLessonId]: next }))
            }
            isTeacher={isTeacher}
            lessonId={activeLessonId}
            onLessonOverride={() => setLessonOverridesVersion((v) => v + 1)}
            onTryMeApply={onTryMeLoadInEditor}
            tryMeRunPreview={tryMeRunPreview}
            liveEditorCode={code}
          />

          <PracticeLab
            lessonId={activeLessonId}
            unlocked={learnComplete}
            onApplyStarter={applyStarterFromLab}
            onComplete={
              !isTeacher
                ? () =>
                    recordStudentEvent({
                      type: "lab_completed",
                      lessonId: activeLessonId,
                      lessonTitle: activeLesson?.title,
                    })
                : undefined
            }
          />

          <div className="panes">
            <EditorPane
              code={code}
              onChange={onChangeCode}
              hint={hint}
              onSave={onSave}
              antiPasteEnabled={isTeacher ? noPasteEnabled : true}
              unlocked={learnComplete}
              layoutKey={editorLayoutKey}
              tryMeConstrained={Boolean(editorTryMeConstraint)}
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

      {showAgentAria && (
        <AgentARIA
          lessonId={activeLessonId}
          lesson={activeLesson}
          wrongAttempts={masteryFailCount}
          lastError={[error, masteryMsg, stdout].filter(Boolean).join("\n")}
          lastCode={code}
          onDismiss={() =>
            setAriaDismissedByLesson((prev) => ({ ...prev, [activeLessonId]: true }))
          }
          onGoToRead={(sectionTitle) => learnPanelRef.current?.scrollToReading?.(sectionTitle)}
        />
      )}
    </div>
  );
}