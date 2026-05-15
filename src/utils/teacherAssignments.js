// src/utils/teacherAssignments.js
// Teacher-only: saved starter code targets per student key + lesson (localStorage).

import { csvEscape } from "./teacherReports.js";
const STORAGE_KEY = "py_learn_teacher_assignments";

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return typeof o === "object" && o ? o : {};
  } catch {
    return {};
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("teacherAssignments save", e);
  }
}

/** @returns {Record<string, Record<string, { code: string, updatedAt: string, note?: string }>>} */
export function loadAssignments() {
  return loadAll();
}

export function setAssignment(studentKey, lessonId, code, note = "") {
  const sk = String(studentKey || "").trim();
  const lid = String(lessonId || "").trim();
  if (!sk || !lid) return;
  const all = loadAll();
  if (!all[sk]) all[sk] = {};
  all[sk][lid] = {
    code: String(code ?? ""),
    updatedAt: new Date().toISOString(),
    note: String(note || "").trim() || undefined,
  };
  saveAll(all);
}

export function deleteAssignment(studentKey, lessonId) {
  const all = loadAll();
  if (all[studentKey]?.[lessonId]) {
    delete all[studentKey][lessonId];
    if (Object.keys(all[studentKey]).length === 0) delete all[studentKey];
    saveAll(all);
  }
}

export function downloadAssignmentsCsv() {
  const all = loadAll();
  const lines = [["studentKey", "lessonId", "updatedAt", "note", "code"].join(",")];
  for (const [sk, lessons] of Object.entries(all)) {
    for (const [lid, row] of Object.entries(lessons || {})) {
      lines.push(
        [sk, lid, row.updatedAt || "", row.note || "", row.code ?? ""].map(csvEscape).join(","),
      );
    }
  }
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `teacher-assignments-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
