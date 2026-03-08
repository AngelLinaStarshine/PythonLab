// src/components/TeacherNotificationsPanel.jsx
// Teacher view: notifications per student (window switch, active time, right answer, student Q&A).
import { useState, useEffect } from "react";
import { getStudentEvents, clearStudentEvents } from "../utils/studentActivityStore.js";

function formatEvent(ev) {
  const time = ev.atLabel || new Date(ev.at).toLocaleTimeString();
  const student = (ev.studentId || "").slice(0, 20);
  switch (ev.type) {
    case "window_switch":
      return { icon: "🪟", text: `Window/tab switch`, detail: `${student} — ${time}` };
    case "active_time":
      return { icon: "⏱", text: `Window active`, detail: `${student} — ${ev.minutes ?? 0} min — ${time}` };
    case "correct_answer":
      return { icon: "✅", text: `Right answer`, detail: `${student} — ${ev.lessonTitle || ev.lessonId || ""} — ${time}`, extra: ev.message };
    case "student_question":
      return { icon: "❓", text: `Student question`, detail: `${student} — ${ev.lessonTitle || ev.lessonId || ""} — ${time}`, extra: ev.explanation };
    default:
      return { icon: "•", text: ev.type || "Event", detail: `${student} — ${time}` };
  }
}

export default function TeacherNotificationsPanel() {
  const [events, setEvents] = useState(getStudentEvents());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setEvents(getStudentEvents()), 2000);
    return () => clearInterval(interval);
  }, [open]);

  const handleClear = () => {
    clearStudentEvents();
    setEvents([]);
  };

  const reversed = [...events].reverse();

  return (
    <div className="teacher-notifications">
      <button
        type="button"
        className="btn ghost teacher-notifications-toggle"
        onClick={() => setOpen(!open)}
        title="Student activity"
      >
        🔔 Notifications {events.length > 0 && <span className="teacher-notifications-badge">{events.length}</span>}
      </button>
      {open && (
        <div className="teacher-notifications-panel">
          <div className="teacher-notifications-header">
            <span>Student activity</span>
            <button type="button" className="btn ghost" onClick={handleClear}>Clear</button>
          </div>
          <div className="teacher-notifications-list">
            {reversed.length === 0 ? (
              <p className="teacher-notifications-empty">No activity yet. Students’ window switches, active time, right answers, and questions will appear here.</p>
            ) : (
              reversed.map((ev) => {
                const { icon, text, detail, extra } = formatEvent(ev);
                return (
                  <div key={ev.id} className="teacher-notifications-item">
                    <span className="teacher-notifications-item-icon">{icon}</span>
                    <div className="teacher-notifications-item-body">
                      <div className="teacher-notifications-item-text">{text}</div>
                      <div className="teacher-notifications-item-detail">{detail}</div>
                      {extra && <div className="teacher-notifications-item-extra">{extra}</div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
