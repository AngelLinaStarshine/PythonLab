// Records student activity for teacher dashboard (localStorage, this browser).

const STORAGE_KEY = "py_learn_student_events";
const ROSTER_KEY = "py_learn_student_roster";
const PROGRESS_BY_STUDENT_KEY = "py_learn_progress_by_student";
const STUDENT_ID_KEY = "py_learn_student_id";
const STUDENT_NAME_KEY = "py_learn_student_name";
const ROLE_KEY = "py_learn_role";
const MAX_EVENTS = 2000;

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
    notifyActivityUpdated();
  } catch {
    /* ignore */
  }
}

function loadRoster() {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function saveRoster(roster) {
  try {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
    notifyActivityUpdated();
  } catch {
    /* ignore */
  }
}

function loadProgressByStudent() {
  try {
    const raw = localStorage.getItem(PROGRESS_BY_STUDENT_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function saveProgressByStudent(map) {
  try {
    localStorage.setItem(PROGRESS_BY_STUDENT_KEY, JSON.stringify(map));
    notifyActivityUpdated();
  } catch {
    /* ignore */
  }
}

function notifyActivityUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("py-learn-activity-updated"));
}

function isTeacherRole() {
  try {
    return localStorage.getItem(ROLE_KEY) === "teacher";
  } catch {
    return false;
  }
}

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

/** Call when a student signs in so they appear on the dashboard even before other events. */
export function registerStudent(studentId, studentName) {
  const id = studentId || getStudentId();
  const name = String(studentName || "").trim() || "Student";
  const roster = loadRoster();
  const existing = roster[id] || {};
  roster[id] = {
    studentId: id,
    studentName: name,
    firstSeen: existing.firstSeen || new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  };
  saveRoster(roster);
  return id;
}

/** Save this student's lesson gates + mastery for the grade book / reports. */
export function saveStudentProgressSnapshot(studentId, { stageByLesson = {}, masteryByLesson = {} } = {}) {
  if (isTeacherRole()) return;
  const id = studentId || getStudentId();
  if (!id) return;
  const map = loadProgressByStudent();
  map[id] = {
    stageByLesson: { ...(map[studentId]?.stageByLesson || {}), ...stageByLesson },
    masteryByLesson: { ...(map[studentId]?.masteryByLesson || {}), ...masteryByLesson },
    updatedAt: new Date().toISOString(),
  };
  saveProgressByStudent(map);
}

export function getProgressForStudent(studentId) {
  const snap = loadProgressByStudent()[studentId];
  return {
    stageByLesson: snap?.stageByLesson || {},
    masteryByLesson: snap?.masteryByLesson || {},
  };
}

export function recordStudentEvent(event) {
  if (isTeacherRole()) return;

  const now = new Date();
  const studentId = event?.studentId || getStudentId();
  const studentName = event?.studentName || getStudentName() || "Student";

  if (studentName && studentName !== "Student") {
    registerStudent(studentId, studentName);
  }

  const entry = {
    id: now.getTime() + "_" + Math.random().toString(36).slice(2, 6),
    studentId,
    studentName,
    at: now.toISOString(),
    atLabel: now.toLocaleTimeString(),
    atDate: now.toLocaleDateString(),
    ...event,
    studentId,
    studentName,
  };

  const list = loadEvents();
  list.push(entry);
  saveEvents(list);
}

export function getStudentEvents() {
  return loadEvents();
}

/** Activity log + security events for class reports. */
export function getClassReportEvents() {
  const events = loadEvents();
  let security = [];
  try {
    const raw = sessionStorage.getItem("security_events");
    security = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(security)) security = [];
  } catch {
    security = [];
  }
  const normalized = security.map((e, i) => ({
    id: `sec_${i}_${e.at || i}`,
    studentId: e.studentId || "security",
    studentName: e.studentName || getStudentName() || "—",
    type: String(e.type || "").startsWith("security_") ? e.type : `security_${e.type}`,
    at: e.at,
    atLabel: e.atLabel,
    atDate: e.atDate,
    ...e,
  }));
  return [...events, ...normalized].sort((a, b) => String(a.at).localeCompare(String(b.at)));
}

export function clearStudentEvents() {
  saveEvents([]);
  saveRoster({});
  saveProgressByStudent({});
}

export function getAllStudents() {
  const events = loadEvents();
  const roster = loadRoster();
  const progressMap = loadProgressByStudent();
  const map = { ...roster };

  for (const [id, snap] of Object.entries(progressMap)) {
    if (!map[id]) {
      map[id] = {
        studentId: id,
        studentName: "Student",
        firstSeen: snap?.updatedAt,
        lastSeen: snap?.updatedAt,
      };
    }
  }

  for (const e of events) {
    const id = e.studentId || "unknown";
    if (!map[id]) {
      map[id] = {
        studentId: id,
        studentName: e.studentName || "Unknown",
        firstSeen: e.at,
        lastSeen: e.at,
      };
    } else {
      if (e.at > map[id].lastSeen) {
        map[id].lastSeen = e.at;
        map[id].studentName = e.studentName || map[id].studentName;
      }
      if (e.at < map[id].firstSeen) map[id].firstSeen = e.at;
    }
  }

  return Object.values(map).sort((a, b) => String(b.lastSeen || "").localeCompare(String(a.lastSeen || "")));
}

export function getEventsForStudent(studentId) {
  return loadEvents().filter((e) => e.studentId === studentId);
}

const LESSON_NAMES = {
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

export function buildStudentSummary(studentId) {
  const events = getEventsForStudent(studentId);
  const { stageByLesson, masteryByLesson } = getProgressForStudent(studentId);
  const lessonIds = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10"];

  const roster = loadRoster();
  const rosterName = roster[studentId]?.studentName;

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
    if (!lid) continue;
    if (!masteryAttempts[lid]) masteryAttempts[lid] = { attempts: 0, passed: false };
    masteryAttempts[lid].attempts++;
    if (e.passed) masteryAttempts[lid].passed = true;
  }
  for (const e of events.filter((ev) => ev.type === "correct_answer")) {
    if (e.lessonId) masteryAttempts[e.lessonId] = { attempts: 1, passed: true };
  }

  const correctAnswers = events.filter((e) => e.type === "correct_answer");
  const hintRequests = events.filter((e) => e.type === "student_question");
  const ariaEvents = events.filter((e) => e.type === "aria_triggered");

  const lessonSummary = lessonIds.map((lid) => {
    const stage = stageByLesson[lid] || {};
    const mastered = Boolean(masteryByLesson[lid]);
    const attempt = masteryAttempts[lid] || { attempts: 0, passed: mastered };
    const hintsCount = hintRequests.filter((e) => e.lessonId === lid).length;
    return {
      id: lid,
      name: LESSON_NAMES[lid],
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

  const lastEvent = events.length ? events[events.length - 1] : null;

  return {
    studentId,
    studentName: rosterName || events[0]?.studentName || "Unknown",
    firstSeen: events.length ? events[0].at : roster[studentId]?.firstSeen,
    lastSeen: lastEvent?.at || roster[studentId]?.lastSeen,
    lastDate: lastEvent?.atDate || null,
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
