// src/components/TeacherLearnEditor.jsx
// Teacher-only: edit lesson title, objective, and Learn panel material for the current lesson.
import { useState, useEffect } from "react";
import { loadLessonOverrides, saveLessonOverrides } from "../utils/lessonOverrides.js";

export default function TeacherLearnEditor({ lesson, lessonId, onSave }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [materialHtml, setMaterialHtml] = useState("");

  useEffect(() => {
    if (!lesson || !open) return;
    setTitle(lesson.title ?? "");
    setObjective(lesson.objective ?? "");
    setMaterialHtml(lesson.materialHtml ?? "");
  }, [lesson, open]);

  const handleSave = () => {
    const overrides = loadLessonOverrides();
    overrides[lessonId] = {
      ...(overrides[lessonId] || {}),
      title: title.trim() || undefined,
      objective: objective.trim() || undefined,
      materialHtml: materialHtml.trim() || undefined,
    };
    saveLessonOverrides(overrides);
    onSave?.();
    setOpen(false);
  };

  const handleReset = () => {
    const overrides = loadLessonOverrides();
    delete overrides[lessonId];
    saveLessonOverrides(overrides);
    onSave?.();
    setTitle(lesson?.title ?? "");
    setObjective(lesson?.objective ?? "");
    setMaterialHtml(lesson?.materialHtml ?? "");
    setOpen(false);
  };

  if (!lesson) return null;

  return (
    <div className="teacher-learn-editor">
      <button type="button" className="btn ghost" onClick={() => setOpen(!open)}>
        ✏️ Edit Learn content
      </button>
      {open && (
        <div className="teacher-learn-editor-panel">
          <div className="teacher-learn-editor-head">Modify Learn window — {lesson.title}</div>
          <label className="teacher-learn-editor-label">Title</label>
          <input
            type="text"
            className="teacher-learn-editor-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
          />
          <label className="teacher-learn-editor-label">Objective</label>
          <input
            type="text"
            className="teacher-learn-editor-input"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Lesson objective"
          />
          <label className="teacher-learn-editor-label">Learn content (HTML)</label>
          <textarea
            className="teacher-learn-editor-textarea"
            value={materialHtml}
            onChange={(e) => setMaterialHtml(e.target.value)}
            placeholder="HTML content for the Learn panel"
            rows={8}
          />
          <div className="teacher-learn-editor-actions">
            <button type="button" className="btn" onClick={handleSave}>Save</button>
            <button type="button" className="btn ghost" onClick={handleReset}>Reset to default</button>
            <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
