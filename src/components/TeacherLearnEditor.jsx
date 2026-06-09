// src/components/TeacherLearnEditor.jsx
// Teacher-only: edit lesson title, objective, Learn HTML, and full guided walkthrough / Try me (JSON).
import { useState, useEffect } from "react";
import { loadLessonOverrides, saveLessonOverrides } from "../utils/lessonOverrides.js";
import { getLessonContent } from "../data/lessonTryMe.js";

export default function TeacherLearnEditor({ lesson, lessonId, onSave }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [materialHtml, setMaterialHtml] = useState("");
  const [tryMeJson, setTryMeJson] = useState("");

  useEffect(() => {
    if (!lesson || !open) return;
    setTitle(lesson.title ?? "");
    setObjective(lesson.objective ?? "");
    setMaterialHtml(lesson.materialHtml ?? "");
    const overrides = loadLessonOverrides();
    setTryMeJson(typeof overrides[lessonId]?.tryMeJson === "string" ? overrides[lessonId].tryMeJson : "");
  }, [lesson, lessonId, open]);

  const insertDefaultTryMe = () => {
    const c = getLessonContent(lessonId);
    if (c) setTryMeJson(JSON.stringify(c, null, 2));
  };

  const handleSave = () => {
    const overrides = loadLessonOverrides();
    const prev = overrides[lessonId] || {};
    const next = {
      ...prev,
      title: title.trim() || undefined,
      objective: objective.trim() || undefined,
      materialHtml: materialHtml.trim() || undefined,
    };
    const tj = tryMeJson.trim();
    if (tj) {
      try {
        JSON.parse(tj);
        next.tryMeJson = tj;
      } catch {
        window.alert("Guided walkthrough JSON is not valid. Fix JSON or clear the field.");
        return;
      }
    } else {
      delete next.tryMeJson;
    }
    if (!next.title) delete next.title;
    if (!next.objective) delete next.objective;
    if (!next.materialHtml) delete next.materialHtml;
    if (!next.tryMeJson) delete next.tryMeJson;
    if (Object.keys(next).length === 0) {
      delete overrides[lessonId];
    } else {
      overrides[lessonId] = next;
    }
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
    setTryMeJson("");
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
          <div className="teacher-learn-editor-head">Modify Learn window, {lesson.title}</div>
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
            placeholder="HTML content for the Learn panel reading tab"
            rows={8}
          />
          <label className="teacher-learn-editor-label">
            Guided walkthrough + Try me (JSON). optional full override
          </label>
          <p className="teacher-learn-editor-hint">
            Shape: <code>lessonId</code>, <code>ttsIntro</code>, <code>sections[]</code> with headings, body, code,
            tryMe (starter, hint, expectedOutput, …). Leave empty to use built in content for this lesson.
          </p>
          <div className="teacher-learn-editor-row">
            <button type="button" className="btn ghost small" onClick={insertDefaultTryMe}>
              Load built in JSON as starting point
            </button>
          </div>
          <textarea
            className="teacher-learn-editor-textarea teacher-learn-editor-json"
            value={tryMeJson}
            onChange={(e) => setTryMeJson(e.target.value)}
            placeholder='Paste JSON here, e.g. { "lessonId": "l1", "ttsIntro": "...", "sections": [ ... ] }'
            rows={14}
            spellCheck={false}
          />
          <div className="teacher-learn-editor-actions">
            <button type="button" className="btn" onClick={handleSave}>
              Save
            </button>
            <button type="button" className="btn ghost" onClick={handleReset}>
              Reset to default
            </button>
            <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
