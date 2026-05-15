// src/App.jsx
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import "./styles.css";
import { lessons } from "./data/lessons.js";
import LessonList from "./components/LessonList.jsx";
import EditorPane from "./components/EditorPane.jsx";
import ResultPane from "./components/ResultPane.jsx";
import LearnPanel from "./components/LearnPanel.jsx";
import RolePicker, {
  saveRole,
  loadRole,
  loadStudentName,
  markTeacherSession,
  clearTeacherSession,
} from "./components/RolePicker.jsx";
import { loadPublishedVideosFromSite } from "./utils/videoStore.js";
import { usePyodideRunner } from "./hooks/usePyodideRunner.js";
import { analyzeCode } from "./ai/analyzeClient.js";
import { buildErrorCoach } from "./ai/errorCoach.js";
import { useDebounce } from "./hooks/useDebounce.js";
import { gradeLesson, getLessonTestInputs, alignMockInputs } from "./grading/gradeLesson.js";
import {
  recordStudentEvent,
  clearStudentEvents,
  registerStudent,
  saveStudentProgressSnapshot,
} from "./utils/studentActivityStore.js";
import { loadLessonOverrides, getLessonWithOverrides } from "./utils/lessonOverrides.js";
import { clampTryMeCode } from "./utils/tryMeConstraint.js";
import TeacherNotificationsPanel from "./components/TeacherNotificationsPanel.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import AgentARIA from "./components/AgentARIA.jsx";
import PracticeLab from "./components/PracticeLab.jsx";
import QuizPanel from "./components/QuizPanel.jsx";
import { getQuiz } from "./data/quizData.js";
import InputPromptModal from "./components/InputPromptModal.jsx";
import { getLessonInputGuide, getLessonInputPrompts } from "./data/lessonInputGuides.js";
import { AppGuide } from "./components/AppGuide.jsx";
import { useStudentSession } from "./hooks/useStudentSession.js";

const STORAGE_KEY = "py_learn_progress_v4"; // v4: lessons refresh (L1 3-blank starter, L10 SENTINEL template)

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
  const [videosReady, setVideosReady] = useState(false);

  useEffect(() => {
    loadPublishedVideosFromSite().finally(() => setVideosReady(true));
  }, []);
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

  useStudentSession(userRole);

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
  /** Code editor, Result Run/Mastery, and Practice lab stay locked until reading + video gates pass (students). */
  const learnGate = learnComplete;

  /** After "Complete Lab, proceed to quiz", show lesson quiz when questions exist for this lesson. */
  const [showQuizAfterLab, setShowQuizAfterLab] = useState(false);

  useEffect(() => {
    setShowQuizAfterLab(false);
  }, [activeLessonId]);

  const [stdout, setStdout] = useState("");
  const [error, setError] = useState("");
  /** Counts consecutive runs (Run or Mastery) that ended with a non-empty interpreter error. */
  const [runErrorStreak, setRunErrorStreak] = useState(0);
  const [hint, setHint] = useState({ severity: "none", message: "" });

  const [masteryMsg, setMasteryMsg] = useState(""); // shown in ResultPane
  const [inputModalOpen, setInputModalOpen] = useState(false);

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
  const lessonInputGuide = useMemo(() => getLessonInputGuide(activeLessonId), [activeLessonId]);

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

  useEffect(() => {
    setRunErrorStreak(0);
  }, [activeLessonId]);

  const errorCoach = useMemo(
    () => buildErrorCoach({ errorText: error, lessonId: activeLessonId, streak: runErrorStreak }),
    [error, activeLessonId, runErrorStreak],
  );

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

  /** Try me only: when set, only the token slice may change in the Code editor. */
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

  const runCodeWithInputs = useCallback(
    async (stdinLines, { label = "sample inputs" } = {}) => {
      const aligned = alignMockInputs(code, stdinLines);
      const inputPrompts = getLessonInputPrompts(activeLessonId);
      const result = await run(code, { stdinLines: aligned, inputPrompts });
      const mockNote =
        aligned.length > 0
          ? `[Run used ${label}: ${aligned.map((v) => JSON.stringify(v)).join(", ")}]\n\n`
          : "";
      setStdout(mockNote + (result.stdout || ""));
      setError(result.error || "");
      if ((result.error || "").trim()) {
        setRunErrorStreak((n) => n + 1);
      } else {
        setRunErrorStreak(0);
      }
      setTryMeRunPreview((prev) => {
        if (!prev?.sectionId) return prev;
        return {
          sectionId: prev.sectionId,
          stdout: result.stdout || "",
          error: result.error || "",
        };
      });
    },
    [activeLessonId, code, run]
  );

  const onRun = async () => {
    if (!learnGate) return;
    setStdout("");
    setError("");
    setMasteryMsg("");
    if (lessonInputGuide) {
      setInputModalOpen(true);
      return;
    }
    const result = await run(code, {});
    setStdout(result.stdout || "");
    setError(result.error || "");
    if ((result.error || "").trim()) setRunErrorStreak((n) => n + 1);
    else setRunErrorStreak(0);
  };

  const onRunWithSampleInputs = async () => {
    if (!learnGate || !lessonInputGuide) return;
    setStdout("");
    setError("");
    setMasteryMsg("");
    const mockInputs =
      lessonInputGuide.sampleInputs?.length
        ? lessonInputGuide.sampleInputs
        : getLessonTestInputs(activeLessonId);
    await runCodeWithInputs(mockInputs, { label: "sample inputs" });
  };

  const onInputModalSubmit = async (values) => {
    setInputModalOpen(false);
    setStdout("");
    setError("");
    setMasteryMsg("");
    await runCodeWithInputs(values, { label: "your inputs" });
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
    setRunErrorStreak(0);
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
    if (!learnGate) return;
    setTryMeRunPreview(null);
    setEditorTryMeConstraint(null);
    setStdout("");
    setError("");
    setMasteryMsg("Running mastery tests...");

    const inputs = alignMockInputs(
      code,
      lessonInputGuide?.sampleInputs?.length
        ? lessonInputGuide.sampleInputs
        : getLessonTestInputs(activeLessonId)
    );
    const result = await run(code, {
      stdinLines: inputs,
      inputPrompts: getLessonInputPrompts(activeLessonId),
    });
    const out = result.stdout || "";
    const err = result.error || "";

    setStdout(out);
    setError(err);
    if (err.trim()) {
      setRunErrorStreak((n) => n + 1);
    } else {
      setRunErrorStreak(0);
    }

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

  // Persist progress + per-student snapshot for teacher reports
  useEffect(() => {
    const p = loadProgress();
    saveProgress({ ...p, activeLessonId, codeByLesson, stageByLesson, masteryByLesson });
    if (!isTeacher) {
      saveStudentProgressSnapshot(null, { stageByLesson, masteryByLesson });
    }
  }, [activeLessonId, stageByLesson, masteryByLesson, isTeacher, codeByLesson]);

  const onSwitchRole = () => {
    setUserRole(null);
    clearTeacherSession();
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
      setRunErrorStreak(0);
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
   * Tab / window leave + bfcache: full session reset for students only.
   * Teachers are never reset when switching windows or tabs (their work stays put).
   */
  useEffect(() => {
    if (isTeacher) return;

    const MOUNT_GRACE_MS = 2000;
    const mountedAt = Date.now();

    const runLeaveReset = (reason) => {
      if (Date.now() - mountedAt < MOUNT_GRACE_MS) return;
      recordStudentEvent({
        type: "window_switch",
        reason,
      });
      resetSessionToBeginning({
        clearActivityLog: false,
        progressHint:
          "You left this tab or window. Starting again from the first lesson.",
      });
    };

    let hiddenTid;
    const HIDDEN_DEBOUNCE_MS = 3500;

    const fullscreenActive = () =>
      Boolean(
        document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement,
      );

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (Date.now() - mountedAt < MOUNT_GRACE_MS) return;
        if (fullscreenActive()) return;
        window.clearTimeout(hiddenTid);
        hiddenTid = window.setTimeout(() => {
          hiddenTid = undefined;
          runLeaveReset("tab_or_window_hidden_session_reset");
        }, HIDDEN_DEBOUNCE_MS);
      } else {
        window.clearTimeout(hiddenTid);
        hiddenTid = undefined;
      }
    };

    /** Back/forward cache: page can reappear without a full reload; force a clean start. */
    const onPageShow = (e) => {
      if (e.persisted) {
        runLeaveReset("bfcache_pageshow_session_reset");
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.clearTimeout(hiddenTid);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [isTeacher, resetSessionToBeginning]);

  useEffect(() => {
    if (isTeacher) return;

    /** Ignore scrollbar / layout jitter so we do not reset in a tight loop. */
    const SIGNIFICANT_SIZE_CHANGE_PX = 420;
    /** Let first paint + scrollbar settle before any auto-reset. */
    const MOUNT_SETTLE_MS = 1600;
    const DEBOUNCE_MS = 900;

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
            "Screen orientation changed. Starting again from the first lesson."
          );
          return;
        }

        const delta = Math.abs(w - prev.w) + Math.abs(h - prev.h);
        if (delta < SIGNIFICANT_SIZE_CHANGE_PX) {
          viewportSizeRef.current = { w, h };
          return;
        }

        runReset(
          "Window size changed a lot. Starting again from the first lesson."
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
  }, [isTeacher, resetSessionToBeginning]);

  const onResetAllProgress = () => {
    resetSessionToBeginning({
      clearActivityLog: true,
      progressHint: "All progress cleared.",
    });
  };

  if (!userRole) {
    return (
      <RolePicker
        onSelect={(role, meta) => {
          saveRole(role);
          if (role === "teacher") {
            markTeacherSession();
          } else {
            clearTeacherSession();
            if (meta?.displayName) {
              const sid = registerStudent(null, meta.displayName);
              saveStudentProgressSnapshot(sid, { stageByLesson, masteryByLesson });
              recordStudentEvent({
                type: "student_sign_in",
                studentId: sid,
                studentName: meta.displayName,
                message: `Signed in as ${meta.displayName}`,
              });
            }
          }
          setUserRole(role);
        }}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-title">Cyber/AI Python Lab (Grades 10 to 11)</div>
          <div className="brand-subtitle">Learn, practice, mastery, portfolio capstone</div>
        </div>

        <div className="toggles">
          <span className={`role-badge ${userRole}`}>
            {userRole === "teacher"
              ? "👩‍🏫 Teacher"
              : `👩‍🎓 ${loadStudentName() || "Student"}`}
          </span>
          <button
            type="button"
            className="btn ghost"
            onClick={onSwitchRole}
            title="Return to sign-in to choose Teacher or Student"
          >
            Switch role
          </button>
          {isTeacher && <TeacherNotificationsPanel />}
          {isTeacher && (
            <TeacherDashboard
              masteryByLesson={masteryByLesson}
              noPasteEnabled={noPasteEnabled}
              onToggleCopy={setNoPasteEnabled}
              onResetAll={onResetAllProgress}
              activeLessonId={activeLessonId}
              currentEditorCode={code}
            />
          )}
          <AppGuide role={userRole} />
          {isTeacher && (
            <button type="button" className="btn ghost" onClick={onResetAllProgress} title="Reset all code, gates, and mastery">
              Reset all progress
            </button>
          )}
          {isTeacher && (
            <label className="toggle">
              <input
                type="checkbox"
                checked={noPasteEnabled}
                onChange={(e) => setNoPasteEnabled(e.target.checked)}
              />
              Block copy/paste
            </label>
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
              setRunErrorStreak(0);
            }}
          />
        </aside>

        <main className="main">
          <div className="lesson-meta">
            <div className="lesson-meta-title">{activeLesson?.title}</div>
            <div className="lesson-meta-obj">{activeLesson?.objective}</div>
          </div>

          <LearnPanel
            key={`learn-${learnPanelMountKey}-${activeLessonId}-${videosReady ? "pub" : "load"}`}
            ref={learnPanelRef}
            lesson={activeLesson}
            progress={lessonProgress}
            onProgressChange={(next) => {
              setStageByLesson((prev) => {
                const merged = { ...prev, [activeLessonId]: next };
                if (!isTeacher && next?.scrolled && next?.timed && next?.videoDone) {
                  recordStudentEvent({
                    type: "learn_complete",
                    lessonId: activeLessonId,
                    lessonTitle: activeLesson?.title,
                  });
                }
                return merged;
              });
            }}
            isTeacher={isTeacher}
            lessonId={activeLessonId}
            onLessonOverride={() => setLessonOverridesVersion((v) => v + 1)}
            onTryMeApply={onTryMeLoadInEditor}
            tryMeRunPreview={tryMeRunPreview}
            liveEditorCode={code}
            lessonOverridesVersion={lessonOverridesVersion}
          />

          <PracticeLab
            lessonId={activeLessonId}
            unlocked={learnComplete}
            onApplyStarter={applyStarterFromLab}
            onComplete={() => {
              if (getQuiz(activeLessonId).length > 0) {
                setShowQuizAfterLab(true);
              }
              if (!isTeacher) {
                recordStudentEvent({
                  type: "lab_completed",
                  lessonId: activeLessonId,
                  lessonTitle: activeLesson?.title,
                });
              }
            }}
          />

          {learnComplete && showQuizAfterLab && getQuiz(activeLessonId).length > 0 && (
            <div className="lesson-quiz-panel-wrap">
              <QuizPanel
                key={activeLessonId}
                lessonId={activeLessonId}
                onComplete={
                  !isTeacher
                    ? (score, total) =>
                        recordStudentEvent({
                          type: "quiz_completed",
                          lessonId: activeLessonId,
                          lessonTitle: activeLesson?.title,
                          score,
                          total,
                        })
                    : undefined
                }
              />
            </div>
          )}

          <div className="panes">
            <EditorPane
              code={code}
              onChange={onChangeCode}
              hint={hint}
              onSave={onSave}
              antiPasteEnabled={isTeacher && noPasteEnabled}
              unlocked={learnGate}
              layoutKey={editorLayoutKey}
              tryMeConstrained={Boolean(editorTryMeConstraint)}
            />

            <ResultPane
              stdout={stdout}
              error={error}
              masteryMsg={masteryMsg}
              unlocked={learnGate}
              errorCoach={errorCoach}
              onGoToReading={(section) => learnPanelRef.current?.scrollToReading?.(section)}
              onRun={onRun}
              onReset={onReset}
              runtimeReady={ready}
              loadingMsg={loadingMsg}
              onMasteryCheck={onMasteryCheck}
              mastered={mastered}
              inputGuide={lessonInputGuide}
              onRunWithSampleInputs={lessonInputGuide ? onRunWithSampleInputs : undefined}
            />
          </div>
        </main>
      </div>

      <InputPromptModal
        guide={lessonInputGuide}
        open={inputModalOpen}
        onCancel={() => setInputModalOpen(false)}
        onSubmit={onInputModalSubmit}
      />

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