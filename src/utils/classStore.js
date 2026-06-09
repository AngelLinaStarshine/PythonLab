// src/utils/classStore.js
// ─────────────────────────────────────────────────────────────────
// Class + account management. localStorage-based.
// Works perfectly for a fixed computer lab (same device each session).
// For cross device access, swap localStorage calls with Firebase.
//
// DATA MODEL
// ──────────────────────────────────────────────────────────────────
// py_learn_class_config
//   { classCode, teacherPassword, className, createdAt }
//
// py_learn_student_accounts
//   { [username]: { id, username, passwordHash, classCode, createdAt } }
//
// py_learn_active_session
//   { studentId, username, classCode, loginAt }
//
// py_learn_progress_[studentId]
//   { activeLessonId, codeByLesson, stageByLesson, masteryByLesson }
// ─────────────────────────────────────────────────────────────────

const KEYS = {
  classConfig:     "py_learn_class_config",
  studentAccounts: "py_learn_student_accounts",
  activeSession:   "py_learn_active_session",
};

export const ROLE_STORAGE_KEY = "py_learn_role";

// ── Simple hash. NOT cryptographic, good enough for a school pilot ──
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return (h >>> 0).toString(36);
}

// ── Storage helpers ───────────────────────────────────────────────
function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); }
  catch { return null; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error("classStore write", e); }
}

export function saveRole(role) {
  try { localStorage.setItem(ROLE_STORAGE_KEY, role); }
  catch { /* ignore */ }
}

export function clearRole() {
  try { localStorage.removeItem(ROLE_STORAGE_KEY); }
  catch { /* ignore */ }
}

// ══════════════════════════════════════════════════════════════════
// CLASS / TEACHER
// ══════════════════════════════════════════════════════════════════

/**
 * Returns true if a class has been configured on this device.
 */
export function isClassConfigured() {
  const cfg = read(KEYS.classConfig);
  return Boolean(cfg?.classCode);
}

/**
 * Get the current class configuration.
 */
export function getClassConfig() {
  return read(KEYS.classConfig) || {};
}

/**
 * First time teacher setup: set class name, code, and password.
 * Returns { ok: true } or { ok: false, error: string }
 */
export function setupClass({ className, classCode, teacherPassword }) {
  const code     = (classCode     || "").trim().toUpperCase();
  const name     = (className     || "").trim();
  const password = (teacherPassword || "").trim();

  if (!code)     return { ok:false, error:"Class code is required." };
  if (code.length < 4) return { ok:false, error:"Class code must be at least 4 characters." };
  if (!name)     return { ok:false, error:"Class name is required." };
  if (!password) return { ok:false, error:"Teacher password is required." };
  if (password.length < 4) return { ok:false, error:"Password must be at least 4 characters." };

  write(KEYS.classConfig, {
    classCode:       code,
    teacherPassword: simpleHash(password),
    className:       name,
    createdAt:       new Date().toISOString(),
  });
  return { ok:true };
}

/**
 * Update class code or teacher password.
 * Requires current password to authorise.
 */
export function updateClassConfig({ newClassCode, newPassword, currentPassword }) {
  const cfg = read(KEYS.classConfig);
  if (!cfg) return { ok:false, error:"No class configured." };
  if (cfg.teacherPassword !== simpleHash(currentPassword)) {
    return { ok:false, error:"Current password is incorrect." };
  }
  const updated = { ...cfg };
  if (newClassCode) updated.classCode       = newClassCode.trim().toUpperCase();
  if (newPassword)  updated.teacherPassword = simpleHash(newPassword.trim());
  write(KEYS.classConfig, updated);
  return { ok:true };
}

/**
 * Verify teacher password.
 */
export function verifyTeacherPassword(password) {
  const cfg = read(KEYS.classConfig);
  if (!cfg) return false;
  return cfg.teacherPassword === simpleHash(password);
}

// ══════════════════════════════════════════════════════════════════
// STUDENT ACCOUNTS
// ══════════════════════════════════════════════════════════════════

function getAccounts() {
  return read(KEYS.studentAccounts) || {};
}
function saveAccounts(accounts) {
  write(KEYS.studentAccounts, accounts);
}

/**
 * Register a new student.
 * @param {string} username    Display name. used as login key (lowercased)
 * @param {string} password    4+ characters
 * @param {string} classCode   Must match the configured class code
 * @returns {{ ok, student?, error }}
 */
export function registerStudent({ username, password, classCode }) {
  const uname = (username  || "").trim();
  const pass  = (password  || "").trim();
  const code  = (classCode || "").trim().toUpperCase();

  if (!uname)          return { ok:false, error:"Please enter a username." };
  if (uname.length < 2) return { ok:false, error:"Username must be at least 2 characters." };
  if (!pass)           return { ok:false, error:"Please enter a password." };
  if (pass.length < 4) return { ok:false, error:"Password must be at least 4 characters." };
  if (!code)           return { ok:false, error:"Please enter your class code." };

  const cfg = read(KEYS.classConfig);
  if (!cfg) return { ok:false, error:"No class has been set up on this device yet. Ask your teacher." };
  if (cfg.classCode !== code) {
    return { ok:false, error:`Class code "${code}" is incorrect. Ask your teacher for the correct code.` };
  }

  const key      = uname.toLowerCase();
  const accounts = getAccounts();

  if (accounts[key]) {
    return { ok:false, error:`Username "${uname}" is already taken. Choose a different name or log in.` };
  }

  const student = {
    id:           "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    username:     uname,
    displayName:  uname,
    passwordHash: simpleHash(pass),
    classCode:    code,
    createdAt:    new Date().toISOString(),
  };

  accounts[key] = student;
  saveAccounts(accounts);
  return { ok:true, student };
}

/**
 * Log in an existing student.
 * @returns {{ ok, student?, error }}
 */
export function loginStudent({ username, password }) {
  const uname = (username || "").trim();
  const pass  = (password || "").trim();

  if (!uname) return { ok:false, error:"Please enter your username." };
  if (!pass)  return { ok:false, error:"Please enter your password." };

  const accounts = getAccounts();
  const student  = accounts[uname.toLowerCase()];

  if (!student) {
    return { ok:false, error:`No account found for "${uname}". Register first or check your username.` };
  }
  if (student.passwordHash !== simpleHash(pass)) {
    return { ok:false, error:"Incorrect password. Try again." };
  }

  return { ok:true, student };
}

/**
 * Get all registered students for teacher view.
 * Optionally filter by class code.
 */
export function getAllStudentAccounts(classCode = null) {
  const accounts = getAccounts();
  const list = Object.values(accounts);
  if (classCode) return list.filter(s => s.classCode === classCode);
  return list;
}

/**
 * Delete a student account (teacher action).
 */
export function deleteStudentAccount(username) {
  const accounts = getAccounts();
  delete accounts[username.toLowerCase()];
  saveAccounts(accounts);
}

// ══════════════════════════════════════════════════════════════════
// SESSION (who is currently logged in)
// ══════════════════════════════════════════════════════════════════

/**
 * Save the active session after login.
 */
function readSession() {
  try {
    const raw = sessionStorage.getItem(KEYS.activeSession);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(value) {
  try {
    sessionStorage.setItem(KEYS.activeSession, JSON.stringify(value));
  } catch (e) {
    console.error("classStore writeSession", e);
  }
}

export function startSession(student) {
  writeSession({
    studentId:   student.id,
    username:    student.username,
    displayName: student.displayName || student.username,
    classCode:   student.classCode,
    loginAt:     new Date().toISOString(),
  });
  saveRole("student");
}

/**
 * Get the current session (null if not logged in).
 * Stored in sessionStorage so refresh keeps the student signed in;
 * closing the tab clears the session automatically.
 */
export function getSession() {
  return readSession();
}

/**
 * Clear the session (logout).
 */
export function clearSession() {
  try {
    sessionStorage.removeItem(KEYS.activeSession);
  } catch {
    /* ignore */
  }
  clearRole();
}

// ══════════════════════════════════════════════════════════════════
// PROGRESS. keyed per student so different students on the
//            same device don't overwrite each other
// ══════════════════════════════════════════════════════════════════

function progressKey(studentId) {
  return `py_learn_progress_${studentId}`;
}

export function loadStudentProgress(studentId) {
  try {
    const raw = localStorage.getItem(progressKey(studentId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveStudentProgress(studentId, payload) {
  try {
    const key      = progressKey(studentId);
    const existing = loadStudentProgress(studentId);
    localStorage.setItem(key, JSON.stringify({ ...existing, ...payload }));
  } catch (e) { console.error("saveStudentProgress", e); }
}

export function clearStudentProgress(studentId) {
  localStorage.removeItem(progressKey(studentId));
}

/**
 * Get a summary of all students' progress for the teacher dashboard.
 * Returns an array of { student, progress } objects.
 */
export function getAllProgressSummaries(classCode) {
  const students = getAllStudentAccounts(classCode);
  return students.map(s => ({
    student:  s,
    progress: loadStudentProgress(s.id),
  }));
}
