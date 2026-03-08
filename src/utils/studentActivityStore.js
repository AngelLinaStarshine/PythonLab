// src/utils/studentActivityStore.js
// Records student activity for teacher notifications. Uses localStorage (no backend).

const STORAGE_KEY = "py_learn_student_events";
const STUDENT_ID_KEY = "py_learn_student_id";
const MAX_EVENTS = 500;

function getStudentId() {
  try {
    let id = localStorage.getItem(STUDENT_ID_KEY);
    if (!id) {
      id = "student_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
      localStorage.setItem(STUDENT_ID_KEY, id);
    }
    return id;
  } catch {
    return "student_unknown";
  }
}

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
    const trimmed = list.slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("studentActivityStore saveEvents", e);
  }
}

/**
 * Record an event (call from student context only).
 * @param {Object} event - { type: 'window_switch'|'active_time'|'correct_answer'|'student_question', ... }
 */
export function recordStudentEvent(event) {
  const studentId = getStudentId();
  const entry = {
    id: Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    studentId,
    at: new Date().toISOString(),
    atLabel: new Date().toLocaleTimeString(),
    ...event,
  };
  const list = loadEvents();
  list.push(entry);
  saveEvents(list);
}

/** Get all events for teacher view (newest last). */
export function getStudentEvents() {
  return loadEvents();
}

/** Clear all events (teacher action). */
export function clearStudentEvents() {
  saveEvents([]);
}

export { getStudentId };
