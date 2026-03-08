// src/components/RolePicker.jsx
// Entry screen: choose Teacher or Student to access the app.

export const ROLE_STORAGE_KEY = "py_learn_role";

export function loadRole() {
  try {
    const r = localStorage.getItem(ROLE_STORAGE_KEY);
    if (r === "teacher" || r === "student") return r;
  } catch {}
  return null;
}

export function saveRole(role) {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch {}
}

export default function RolePicker({ onSelect }) {
  return (
    <div className="role-picker">
      <div className="role-picker-card">
        <h1 className="role-picker-title">Cyber/AI Python Lab</h1>
        <p className="role-picker-subtitle">Grades 10–11 — Choose your access</p>
        <div className="role-picker-buttons">
          <button
            type="button"
            className="btn role-btn role-btn-teacher"
            onClick={() => onSelect("teacher")}
          >
            <span className="role-btn-icon">👩‍🏫</span>
            <span className="role-btn-label">Teacher</span>
            <span className="role-btn-desc">Unlock all lessons, reset progress, demo mode</span>
          </button>
          <button
            type="button"
            className="btn role-btn role-btn-student"
            onClick={() => onSelect("student")}
          >
            <span className="role-btn-icon">👩‍🎓</span>
            <span className="role-btn-label">Student</span>
            <span className="role-btn-desc">Learn → Practice → Mastery → Portfolio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
