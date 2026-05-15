// src/components/RolePicker.jsx
// Students enter their name; teachers enter with passcode (VITE_TEACHER_PASSCODE).

import { useState } from "react";
import { setStudentName, getStudentName } from "../utils/studentActivityStore.js";

export const ROLE_STORAGE_KEY = "py_learn_role";
export const STUDENT_NAME_KEY = "py_learn_student_name";
/** Set only after a successful passcode this browser session (prevents stale teacher role). */
export const TEACHER_SESSION_KEY = "py_learn_teacher_session";

/** From `.env.local` / Netlify env at build time (never show on screen). */
const TEACHER_PASSCODE = String(import.meta.env.VITE_TEACHER_PASSCODE ?? "").trim();

export function markTeacherSession() {
  try {
    sessionStorage.setItem(TEACHER_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearTeacherSession() {
  try {
    sessionStorage.removeItem(TEACHER_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function hasValidTeacherSession() {
  try {
    return sessionStorage.getItem(TEACHER_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

const C = {
  bg: "#040c18",
  card: "#0a1627",
  border: "rgba(0,195,255,0.12)",
  cyan: "#00c8ff",
  purple: "#a78bfa",
  t1: "#c0ddf0",
  t2: "#4e7090",
  t3: "#243850",
  code: "#020a16",
  sans: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
};

const btn = (x = {}) => ({
  border: "none",
  cursor: "pointer",
  fontFamily: C.sans,
  transition: "all 0.2s",
  outline: "none",
  ...x,
});

const screenStyle = {
  minHeight: "100vh",
  background: `radial-gradient(ellipse at 30% 20%, ${C.cyan}08 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, ${C.purple}08 0%, transparent 50%),
              ${C.bg}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: C.sans,
  padding: 24,
};

const cardStyle = {
  width: "100%",
  maxWidth: 420,
  background: C.card,
  borderRadius: 16,
  border: `1px solid ${C.cyan}50`,
  padding: "32px",
  boxShadow: `0 0 40px ${C.cyan}12`,
};

export function loadRole() {
  try {
    const r = localStorage.getItem(ROLE_STORAGE_KEY);
    if (r === "teacher") {
      if (!hasValidTeacherSession()) {
        localStorage.removeItem(ROLE_STORAGE_KEY);
        return null;
      }
      return "teacher";
    }
    if (r === "student") {
      if (!loadStudentName()) return null;
      return "student";
    }
    return null;
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
  return getStudentName();
}

export function saveStudentName(name) {
  setStudentName(name);
}

export default function RolePicker({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [showName, setShowName] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [name, setName] = useState(() => loadStudentName() || "");
  const [passcode, setPasscode] = useState("");
  const [nameError, setNameError] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const handleStudentSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Please enter your name to continue.");
      return;
    }
    if (trimmed.length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }
    clearTeacherSession();
    saveStudentName(trimmed);
    onSelect("student", { displayName: trimmed });
  };

  const handleTeacherSubmit = () => {
    if (!TEACHER_PASSCODE) {
      setPasscodeError(
        "Teacher passcode is not configured. Set VITE_TEACHER_PASSCODE in .env.local and rebuild (see .env.example).",
      );
      return;
    }
    if (passcode !== TEACHER_PASSCODE) {
      setPasscodeError("Incorrect passcode.");
      return;
    }
    markTeacherSession();
    onSelect("teacher", {});
  };

  if (showPasscode) {
    return (
      <div style={screenStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>👩‍🏫</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.t1 }}>Teacher access</div>
            <div style={{ fontSize: 13, color: C.t2, marginTop: 6, lineHeight: 1.6 }}>
              {TEACHER_PASSCODE
                ? "Enter the teacher passcode you were given."
                : "This copy of the lab does not have a passcode configured yet."}
            </div>
          </div>

          <input
            type="password"
            autoFocus
            autoComplete="off"
            value={passcode}
            disabled={!TEACHER_PASSCODE}
            onChange={(e) => {
              setPasscode(e.target.value);
              setPasscodeError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTeacherSubmit();
            }}
            placeholder="Teacher passcode"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 16px",
              marginBottom: 8,
              background: C.code,
              border: `1.5px solid ${passcodeError ? "#ff3658" : C.border}`,
              borderRadius: 9,
              color: C.t1,
              fontSize: 15,
              fontFamily: C.sans,
              outline: "none",
            }}
          />

          {passcodeError ? (
            <div style={{ fontSize: 12, color: "#ff3658", marginBottom: 12, paddingLeft: 4 }}>{passcodeError}</div>
          ) : null}

          <button
            type="button"
            onClick={handleTeacherSubmit}
            disabled={!TEACHER_PASSCODE}
            style={{
              ...btn(),
              width: "100%",
              padding: "13px",
              borderRadius: 10,
              marginTop: 4,
              background: `linear-gradient(135deg, ${C.purple}25, ${C.purple}15)`,
              border: `1px solid ${C.purple}70`,
              color: C.purple,
              fontSize: 15,
              fontWeight: 700,
              opacity: TEACHER_PASSCODE ? 1 : 0.5,
            }}
          >
            Enter as Teacher →
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPasscode(false);
              setPasscode("");
              setPasscodeError("");
            }}
            style={{
              ...btn(),
              width: "100%",
              padding: "10px",
              marginTop: 8,
              borderRadius: 9,
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.t3,
              fontSize: 13,
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (showName) {
    return (
      <div style={screenStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>👩‍🎓</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.t1 }}>What&apos;s your name?</div>
            <div style={{ fontSize: 13, color: C.t2, marginTop: 6, lineHeight: 1.6 }}>
              Your teacher uses this to track your progress. It&apos;s saved on this device only.
            </div>
          </div>

          <input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStudentSubmit();
            }}
            placeholder="First name or full name"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 16px",
              marginBottom: 8,
              background: C.code,
              border: `1.5px solid ${nameError ? "#ff3658" : C.border}`,
              borderRadius: 9,
              color: C.t1,
              fontSize: 15,
              fontFamily: C.sans,
              outline: "none",
            }}
          />

          {nameError ? (
            <div style={{ fontSize: 12, color: "#ff3658", marginBottom: 12, paddingLeft: 4 }}>{nameError}</div>
          ) : null}

          <button
            type="button"
            onClick={handleStudentSubmit}
            style={{
              ...btn(),
              width: "100%",
              padding: "13px",
              borderRadius: 10,
              marginTop: 4,
              background: `linear-gradient(135deg, ${C.cyan}25, ${C.cyan}15)`,
              border: `1px solid ${C.cyan}70`,
              color: C.cyan,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            Start Learning →
          </button>

          <button
            type="button"
            onClick={() => setShowName(false)}
            style={{
              ...btn(),
              width: "100%",
              padding: "10px",
              marginTop: 8,
              borderRadius: 9,
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.t3,
              fontSize: 13,
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={screenStyle}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🛡️</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.t1 }}>Cyber/AI Python Lab</div>
        <div style={{ fontSize: 13, color: C.t2, marginTop: 4 }}>Ontario · Grades 10–11 · Mastery Track</div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: 680,
        }}
      >
        <div
          role="button"
          tabIndex={0}
          onMouseEnter={() => setHovered("student")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setShowName(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowName(true)}
          style={{
            flex: "1 1 280px",
            maxWidth: 320,
            background: C.card,
            borderRadius: 16,
            padding: "36px 28px",
            border: `1px solid ${hovered === "student" ? `${C.cyan}80` : C.border}`,
            cursor: "pointer",
            textAlign: "center",
            transform: hovered === "student" ? "translateY(-3px)" : "none",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 14 }}>👩‍🎓</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.t1, marginBottom: 8 }}>Student</div>
          <div style={{ fontSize: 13, color: C.t2, lineHeight: 1.7, marginBottom: 24 }}>
            Follow the lesson plan, complete exercises, and earn mastery badges.
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: `${C.cyan}15`,
              border: `1px solid ${C.cyan}40`,
              color: C.cyan,
              fontSize: 13,
              fontWeight: 600,
              display: "inline-block",
            }}
          >
            Enter as Student
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onMouseEnter={() => setHovered("teacher")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setShowPasscode(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowPasscode(true)}
          style={{
            flex: "1 1 280px",
            maxWidth: 320,
            background: C.card,
            borderRadius: 16,
            padding: "36px 28px",
            border: `1px solid ${hovered === "teacher" ? `${C.purple}80` : C.border}`,
            cursor: "pointer",
            textAlign: "center",
            transform: hovered === "teacher" ? "translateY(-3px)" : "none",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 14 }}>👩‍🏫</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.t1, marginBottom: 8 }}>Teacher</div>
          <div style={{ fontSize: 13, color: C.t2, lineHeight: 1.7, marginBottom: 24 }}>
            View student progress, manage videos, and edit lesson content. Passcode required.
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: `${C.purple}15`,
              border: `1px solid ${C.purple}40`,
              color: C.purple,
              fontSize: 13,
              fontWeight: 600,
              display: "inline-block",
            }}
          >
            Enter as Teacher
          </div>
        </div>
      </div>

      <div style={{ marginTop: 36, fontSize: 11, color: C.t3, textAlign: "center" }}>
        All data is stored locally on this device only.
      </div>
    </div>
  );
}
