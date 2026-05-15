// src/utils/studentActivityStore.js
// Records student activity for teacher dashboard.
// Uses localStorage — no backend required for pilot.
//
// Every event includes studentName so the teacher dashboard can group by student.

const STORAGE_KEY = "py_learn_student_events";
const STUDENT_ID_KEY = "py_learn_student_id";
const STUDENT_NAME_KEY = "py_learn_student_name";
const PROGRESS_KEY = "py_learn_progress_v4";
const MAX_EVENTS = 1000;

// ── Student identity ──────────────────────────────────────────────

export function getStudentId() {
  try {
    let id = localStorage.getItem(STUDENT_ID_KEY);
    if (!id) {
      id = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      localStorage.setItem(STUDENT_ID_KEY, id);
    }
    return id;
  } catch {
    return "s_unknown";
  }
}

export function getStudentName() {
  try {
    return localStorage.getItem(STUDENT_NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function setStudentName(name) {
  try {
    localStorage.setItem(STUDENT_NAME_KEY, String(name || "").trim());
  } catch {
    /* ignore */
  }
}

export function clearStudentIdentity() {
  try {
    localStorage.removeItem(STUDENT_ID_KEY);
    localStorage.removeItem(STUDENT_NAME_KEY);
  } catch {
    /* ignore */
  }
}

// ── Events ────────────────────────────────────────────────────────

function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveEvents(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_EVENTS)));
  } catch {
    /* ignore */
  }
}

/**
 * Record an event. Automatically attaches studentId, studentName, timestamp.
 */
export function recordStudentEvent(event) {
  const now = new Date();
  const name = getStudentName();
  const entry = {
    id: now.getTime() + "_" + Math.random().toString(36).slice(2, 6),
    studentId: getStudentId(),
    studentName: name || undefined,
    at: now.toISOString(),
    atLabel: now.toLocaleTimeString(),
    atDate: now.toLocaleDateString(),
    ...event,
  };
  const list = loadEvents();
  list.push(entry);
  saveEvents(list);
}

export function getStudentEvents() {
  return loadEvents();
}

export function clearStudentEvents() {
  saveEvents([]);
}

/**
 * Get all unique students from the event log.
 */
export function getAllStudents() {
  const events = loadEvents();
  const map = {};
  for (const e of events) {
    const id = e.studentId || "unknown";
    if (!map[id]) {
      map[id] = {
        studentId: id,
        studentName: e.studentName || "Unknown",
        firstSeen: e.at,
        lastSeen: e.at,
        firstDate: e.atDate || "",
      };
    } else {
      if (e.at > map[id].lastSeen) {
        map[id].lastSeen = e.at;
        map[id].studentName = e.studentName || map[id].studentName;
      }
      if (e.at < map[id].firstSeen) map[id].firstSeen = e.at;
    }
  }
  return Object.values(map).sort((a, b) => (b.lastSeen || "").localeCompare(a.lastSeen || ""));
}

export function getEventsForStudent(studentId) {
  return loadEvents().filter((e) => e.studentId === studentId);
}

/**
 * Structured summary for one student (teacher dashboard).
 */
export function buildStudentSummary(studentId, masteryByLesson = {}) {
  const events = getEventsForStudent(studentId);
  const lessonIds = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10"];
  const lessonNames = {
    l1: "Variables & Types",
    l2: "Input & Output",
    l3: "Conditionals",
    l4: "Loops",
    l5: "Functions",
    l6: "Lists",
    l7: "Dictionaries",
    l8: "Strings",
    l9: "Exceptions",
    l10: "Capstone",
  };

  const activeMinutes = events
    .filter((e) => e.type === "active_time")
    .reduce((s, e) => s + (e.minutes || 0), 0);

  const violationTypes = new Set([
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
  const violations = events.filter((e) => {
    const t = String(e.type || "");
    const norm = t.startsWith("security_") ? t.slice("security_".length) : t;
    return violationTypes.has(norm);
  });

  const masteryAttempts = {};
  for (const e of events.filter((ev) => ev.type === "mastery_attempt")) {
    const lid = e.lessonId;
    if (!masteryAttempts[lid]) masteryAttempts[lid] = { attempts: 0, passed: false };
    masteryAttempts[lid].attempts++;
    if (e.passed) masteryAttempts[lid].passed = true;
  }

  let stageByLesson = {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) stageByLesson = JSON.parse(raw)?.stageByLesson || {};
  } catch {
    /* ignore */
  }

  const correctAnswers = events.filter((e) => e.type === "correct_answer");
  const hintRequests = events.filter((e) => e.type === "student_question");
  const ariaEvents = events.filter((e) => e.type === "aria_triggered");

  const lessonSummary = lessonIds.map((lid) => {
    const stage = stageByLesson[lid] || {};
    const mastered = Boolean(masteryByLesson[lid]);
    const attempt = masteryAttempts[lid] || { attempts: 0, passed: false };
    const hintsCount = hintRequests.filter((e) => e.lessonId === lid).length;
    return {
      id: lid,
      name: lessonNames[lid],
      readDone: Boolean(stage.scrolled && stage.timed),
      videoDone: Boolean(stage.videoDone),
      mastered,
      attempts: attempt.attempts,
      hintsUsed: hintsCount,
    };
  });

  const completedCount = lessonSummary.filter((l) => l.mastered).length;
  const readCount = lessonSummary.filter((l) => l.readDone).length;
  const videoCount = lessonSummary.filter((l) => l.videoDone).length;

  return {
    studentId,
    studentName: events[0]?.studentName || getStudentName() || "Unknown",
    firstSeen: events.length ? events[0].at : null,
    lastSeen: events.length ? events[events.length - 1].at : null,
    lastDate: events.length ? events[events.length - 1].atDate : null,
    totalEvents: events.length,
    activeMinutes,
    completedCount,
    readCount,
    videoCount,
    violations: violations.length,
    violationDetails: violations,
    ariaCount: ariaEvents.length,
    correctAnswers: correctAnswers.length,
    hintRequests: hintRequests.length,
    lessonSummary,
    recentEvents: [...events].reverse().slice(0, 30),
  };
}
