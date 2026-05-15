// src/components/TeacherNotificationsPanel.jsx
// Teacher view: notifications per student (window switch, active time, right answer, student Q&A).
import { useState, useEffect } from "react";
import { getClassReportEvents, clearStudentEvents } from "../utils/studentActivityStore.js";
import { AppPortal } from "../utils/appPortal.js";

function formatEvent(ev) {
  const time = ev.atLabel || new Date(ev.at).toLocaleTimeString();
  const student = ev.studentName || (ev.studentId || "").slice(0, 20);
  switch (ev.type) {
    case "window_switch":
      return { icon: "🪟", text: `Window or tab switch`, detail: `${student}, ${time}` };
    case "active_time":
      return { icon: "⏱", text: `Window active`, detail: `${student}, ${ev.minutes ?? 0} min, ${time}` };
    case "correct_answer":
      return { icon: "✅", text: `Right answer`, detail: `${student}, ${ev.lessonTitle || ev.lessonId || ""}, ${time}`, extra: ev.message };
    case "student_question":
      return { icon: "❓", text: `Student question`, detail: `${student}, ${ev.lessonTitle || ev.lessonId || ""}, ${time}`, extra: ev.explanation };
    default:
      return { icon: "•", text: ev.type || "Event", detail: `${student}, ${time}` };
  }
}

export default function TeacherNotificationsPanel() {
  const [events, setEvents] = useState(getClassReportEvents());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const refresh = () => setEvents(getClassReportEvents());
    refresh();
    const interval = setInterval(refresh, 2000);
    window.addEventListener("py-learn-activity-updated", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("py-learn-activity-updated", refresh);
    };
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
        <AppPortal>
          <div className="app-modal-overlay" onClick={() => setOpen(false)}>
            <div
              className="app-modal-panel"
              style={{ width: "min(720px, 100%)", height: "min(560px, calc(100vh - 32px))" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="teacher-notifications-header">
                <span>Student activity</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn ghost" onClick={handleClear}>Clear</button>
                  <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Close</button>
                </div>
              </div>
              <div className="teacher-notifications-list app-modal-scroll">
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
          </div>
        </AppPortal>
      )}
    </div>
  );
}
