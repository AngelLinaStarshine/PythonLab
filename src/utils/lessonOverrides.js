// src/utils/lessonOverrides.js
// Teacher can override lesson title, objective, and Learn panel content (stored in localStorage).

const STORAGE_KEY = "py_learn_teacher_lesson_overrides";

export function loadLessonOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

export function saveLessonOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.error("lessonOverrides save", e);
  }
}

export function getLessonWithOverrides(lesson, overrides) {
  if (!lesson) return lesson;
  const o = overrides[lesson.id];
  if (!o) return lesson;
  return {
    ...lesson,
    title: o.title !== undefined ? o.title : lesson.title,
    objective: o.objective !== undefined ? o.objective : lesson.objective,
    materialHtml: o.materialHtml !== undefined ? o.materialHtml : lesson.materialHtml,
  };
}
