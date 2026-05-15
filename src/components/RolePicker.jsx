// src/components/RolePicker.jsx
// Entry screen: choose Teacher (passcode) or Student to access the app.

import { useState } from "react";

export const ROLE_STORAGE_KEY = "py_learn_role";
export const STUDENT_NAME_KEY = "py_learn_student_name";

/** Optional: set `VITE_TEACHER_PASSCODE` in `.env.local` to require one shared passcode. If unset, any non-empty passcode works (Netlify-friendly). */
const TEACHER_PASSCODE = String(import.meta.env.VITE_TEACHER_PASSCODE ?? "").trim();

/** Teacher or student with saved name; otherwise null (show picker). */
export function loadRole() {
  try {
    const r = localStorage.getItem(ROLE_STORAGE_KEY);
    if (r !== "teacher" && r !== "student") return null;
    if (r === "student" && !loadStudentName()) return null;
    return r;
  } catch {
    return null;
  }
}

export function saveRole(role) {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch {
    /* ignore */
  }
}

export function loadStudentName() {
  try {
    const n = localStorage.getItem(STUDENT_NAME_KEY);
    return typeof n === "string" ? n.trim() : "";
  } catch {
    return "";
  }
}

export function saveStudentName(name) {
  try {
    localStorage.setItem(STUDENT_NAME_KEY, String(name || "").trim());
  } catch {
    /* ignore */
  }
}

export default function RolePicker({ onSelect }) {
  const [teacherStep, setTeacherStep] = useState(false);
  const [studentStep, setStudentStep] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");

  const openTeacherGate = () => {
    setTeacherStep(true);
    setPasscode("");
    setError("");
  };

  const backToRoles = () => {
    setTeacherStep(false);
    setStudentStep(false);
    setPasscode("");
    setStudentName("");
    setError("");
  };

  const openStudentGate = () => {
    setStudentStep(true);
    setStudentName(loadStudentName() || "");
    setError("");
  };

  const submitStudent = (e) => {
    e.preventDefault();
    const trimmed = studentName.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      return;
    }
    saveStudentName(trimmed);
    onSelect("student", { displayName: trimmed });
  };

  const submitTeacher = (e) => {
    e.preventDefault();
    const trimmed = passcode.trim();
    if (!trimmed) {
      setError("Please enter a passcode.");
      return;
    }
    if (TEACHER_PASSCODE && trimmed !== TEACHER_PASSCODE) {
      setError("Incorrect passcode.");
      return;
    }
    onSelect("teacher", {});
  };

  if (teacherStep) {
    return (
      <div className="role-picker">
        <div className="role-picker-card">
          <h1 className="role-picker-title">Teacher access</h1>
          <p className="role-picker-subtitle">
            {TEACHER_PASSCODE
              ? "Enter the teacher passcode you were given."
              : "Enter any passcode you choose (for example: teacher or your school name)."}
          </p>
          <form className="role-picker-passcode-form" onSubmit={submitTeacher}>
            <label className="role-picker-passcode-label">
              Passcode
              <input
                type="password"
                name="teacher-passcode"
                autoComplete="off"
                className="role-picker-passcode-input"
                value={passcode}
                onChange={(ev) => {
                  setPasscode(ev.target.value);
                  setError("");
                }}
              />
            </label>
            {error ? <p className="role-picker-passcode-error">{error}</p> : null}
            <div className="role-picker-passcode-actions">
              <button type="button" className="btn ghost" onClick={backToRoles}>
                Back
              </button>
              <button type="submit" className="btn">
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (studentStep) {
    return (
      <div className="role-picker">
        <div className="role-picker-card">
          <h1 className="role-picker-title">Student sign-in</h1>
          <p className="role-picker-subtitle">Enter your name so your teacher can recognize your work.</p>
          <form className="role-picker-passcode-form" onSubmit={submitStudent}>
            <label className="role-picker-passcode-label">
              Your name
              <input
                type="text"
                name="student-name"
                autoComplete="name"
                className="role-picker-passcode-input"
                value={studentName}
                onChange={(ev) => {
                  setStudentName(ev.target.value);
                  setError("");
                }}
                placeholder="e.g. Jordan Lee"
              />
            </label>
            {error ? <p className="role-picker-passcode-error">{error}</p> : null}
            <div className="role-picker-passcode-actions">
              <button type="button" className="btn ghost" onClick={backToRoles}>
                Back
              </button>
              <button type="submit" className="btn">
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="role-picker">
      <div className="role-picker-card">
        <h1 className="role-picker-title">Cyber/AI Python Lab</h1>
        <p className="role-picker-subtitle">Grades 10 to 11. Choose your access</p>
        <div className="role-picker-buttons">
          <button
            type="button"
            className="btn role-btn role-btn-teacher"
            onClick={openTeacherGate}
          >
            <span className="role-btn-icon">👩‍🏫</span>
            <span className="role-btn-label">Teacher</span>
            <span className="role-btn-desc">Enter any teacher passcode</span>
          </button>
          <button
            type="button"
            className="btn role-btn role-btn-student"
            onClick={openStudentGate}
          >
            <span className="role-btn-icon">👩‍🎓</span>
            <span className="role-btn-label">Student</span>
            <span className="role-btn-desc">Enter your name, then learn, practice, and mastery</span>
          </button>
        </div>
      </div>
    </div>
  );
}
