// src/components/AuthScreen.jsx
// ─────────────────────────────────────────────────────────────────
// Replaces RolePicker.jsx. full authentication screen.
//
// Flow:
//   First visit on this device
//     → Teacher must set up the class first (code + password)
//     → Then students can register with that code
//
//   Returning student → Log In tab → enter username + password
//   New student       → Register tab → enter username + password + class code
//   Teacher           → Teacher tab → enter teacher password
//
// On success, calls:
//   onStudentAuth(session) . for students
//   onTeacherAuth()        . for teachers
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  isClassConfigured,
  setupClass,
  verifyTeacherPassword,
  registerStudent,
  loginStudent,
  startSession,
  getClassConfig,
} from "../utils/classStore.js";

const C = {
  bg:     "#040c18",
  card:   "#0a1627",
  cardAlt:"#081120",
  border: "rgba(0,195,255,0.12)",
  cyan:   "#00c8ff",
  green:  "#00e87a",
  amber:  "#ffad2e",
  red:    "#ff3658",
  purple: "#a78bfa",
  t1:     "#c0ddf0",
  t2:     "#4e7090",
  t3:     "#243850",
  code:   "#020a16",
  sans:   "'DM Sans',-apple-system,sans-serif",
  mono:   "'JetBrains Mono','Courier New',monospace",
};

const btn = (x={}) => ({
  border:"none", cursor:"pointer", fontFamily:C.sans,
  transition:"all 0.2s", outline:"none", ...x,
});

/** Full-viewport auth shell. scrolls when register/setup content is taller than the screen. */
const screenStyle = {
  position: "fixed",
  inset: 0,
  width: "100%",
  boxSizing: "border-box",
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
  background: `radial-gradient(ellipse at 25% 25%, ${C.cyan}08 0%, transparent 50%),
               radial-gradient(ellipse at 75% 75%, ${C.purple}08 0%, transparent 50%),
               ${C.bg}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  fontFamily: C.sans,
  padding: "24px 20px 32px",
};

const setupScreenStyle = {
  ...screenStyle,
  background: `radial-gradient(ellipse at 30% 20%, ${C.purple}10 0%, transparent 50%),
               radial-gradient(ellipse at 70% 80%, ${C.cyan}08 0%, transparent 50%),
               ${C.bg}`,
};

const tabContentStyle = {
  padding: "24px 28px",
  maxHeight: "min(560px, calc(100dvh - 300px))",
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
};

function Field({ label, type="text", value, onChange, placeholder, hint, error }) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{
        display:"block", fontSize:12, fontWeight:600,
        color:C.t2, marginBottom:5,
        letterSpacing:"0.04em", textTransform:"uppercase",
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type==="password"?"current-password":"off"}
        style={{
          width:"100%", boxSizing:"border-box",
          padding:"11px 14px",
          background:C.code,
          border:`1.5px solid ${error?"#ff3658":C.border}`,
          borderRadius:8,
          color:C.t1, fontSize:13.5, fontFamily:C.sans,
          outline:"none",
          transition:"border-color 0.2s",
        }}
        onFocus={e=>{ e.target.style.borderColor=C.cyan; }}
        onBlur={e=>{ e.target.style.borderColor=error?"#ff3658":C.border; }}
      />
      {hint && !error && (
        <div style={{fontSize:11,color:C.t3,marginTop:4,paddingLeft:2}}>{hint}</div>
      )}
      {error && (
        <div style={{fontSize:11,color:"#ff3658",marginTop:4,paddingLeft:2}}>⚠ {error}</div>
      )}
    </div>
  );
}

function SubmitBtn({ label, color=C.cyan, loading, onClick }) {
  return (
    <button onClick={onClick} disabled={loading} style={{...btn(),
      width:"100%", padding:"13px",
      borderRadius:10, marginTop:4,
      background:`${color}20`,
      border:`1px solid ${color}70`,
      color, fontSize:14, fontWeight:700,
      letterSpacing:"0.02em",
      opacity:loading?0.6:1,
      cursor:loading?"not-allowed":"pointer",
    }}>
      {loading?"Please wait…":label}
    </button>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      padding:"10px 14px", borderRadius:8, marginBottom:12,
      background:`${C.red}12`, border:`1px solid ${C.red}40`,
      fontSize:12, color:C.red, lineHeight:1.6,
    }}>
      ⚠ {msg}
    </div>
  );
}

function ClassSetup({ onComplete }) {
  const [className,       setClassName]       = useState("");
  const [classCode,       setClassCode]       = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [confirm,         setConfirm]         = useState("");
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);

  const handleSetup = () => {
    setError("");
    if (teacherPassword !== confirm) {
      setError("Passwords do not match."); return;
    }
    setLoading(true);
    const result = setupClass({ className, classCode, teacherPassword });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    onComplete();
  };

  return (
    <div>
      <div style={{textAlign:"center", marginBottom:24}}>
        <div style={{fontSize:32, marginBottom:8}}>🏫</div>
        <div style={{fontSize:18, fontWeight:700, color:C.t1, marginBottom:6}}>
          Set Up Your Class
        </div>
        <div style={{fontSize:13, color:C.t2, lineHeight:1.65}}>
          This is a one time setup on this device.<br/>
          Students will use your class code to register.
        </div>
      </div>

      <ErrorBox msg={error}/>

      <Field label="Class name"        value={className}       onChange={setClassName}
        placeholder="e.g. Grade 10 Cyber Python. Period 2"/>
      <Field label="Class code"        value={classCode}       onChange={v=>setClassCode(v.toUpperCase())}
        placeholder="e.g. CYBER2025"
        hint="Students enter this code when they register. Share it with your class."/>
      <Field label="Teacher password"  value={teacherPassword} onChange={setTeacherPassword}
        type="password" placeholder="Min 4 characters"
        hint="You'll enter this to access teacher mode."/>
      <Field label="Confirm password"  value={confirm}         onChange={setConfirm}
        type="password" placeholder="Repeat password"/>

      <SubmitBtn label="Create Class →" color={C.purple} loading={loading} onClick={handleSetup}/>
    </div>
  );
}

function TeacherLogin({ onTeacherAuth }) {
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const cfg = getClassConfig();

  const handleLogin = () => {
    setError("");
    if (!password) { setError("Enter your teacher password."); return; }
    if (verifyTeacherPassword(password)) {
      onTeacherAuth();
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  return (
    <div>
      <div style={{textAlign:"center", marginBottom:20}}>
        <div style={{fontSize:32, marginBottom:8}}>👩‍🏫</div>
        <div style={{fontSize:17, fontWeight:700, color:C.t1, marginBottom:4}}>
          Teacher Login
        </div>
        {cfg.className && (
          <div style={{
            fontSize:12, color:C.purple,
            padding:"3px 10px", borderRadius:20,
            background:`${C.purple}15`, border:`1px solid ${C.purple}30`,
            display:"inline-block", marginBottom:4,
          }}>
            {cfg.className}
          </div>
        )}
        {cfg.classCode && (
          <div style={{fontSize:12, color:C.t2, marginTop:4}}>
            Class code: <span style={{color:C.amber, fontFamily:C.mono, fontWeight:600}}>
              {cfg.classCode}
            </span>
          </div>
        )}
      </div>

      <ErrorBox msg={error}/>

      <Field label="Teacher password" value={password} onChange={setPassword}
        type="password" placeholder="Enter your password"/>

      <SubmitBtn label="Enter Teacher Mode →" color={C.purple} onClick={handleLogin}/>
    </div>
  );
}

function StudentRegister({ onStudentAuth }) {
  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [classCode, setClassCode] = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const cfg = getClassConfig();

  const handleRegister = () => {
    setError("");
    setLoading(true);
    const result = registerStudent({ username, password, classCode });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    startSession(result.student);
    onStudentAuth(result.student);
  };

  return (
    <div>
      <ErrorBox msg={error}/>

      <Field label="Choose a username" value={username} onChange={setUsername}
        placeholder="e.g. Ava or AvaSmith"
        hint="This is how you'll log in each session. Choose something you'll remember."/>
      <Field label="Create a password" value={password} onChange={setPassword}
        type="password" placeholder="Min 4 characters"
        hint="You'll need this every time you log in. Write it down."/>
      <Field label="Class code" value={classCode} onChange={v=>setClassCode(v.toUpperCase())}
        placeholder="Ask your teacher for this code"
        hint={cfg.classCode ? "Your class code is shown on the board by your teacher." : ""}/>

      <SubmitBtn label="Create Account →" color={C.green} loading={loading} onClick={handleRegister}/>
    </div>
  );
}

function StudentLogin({ onStudentAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  const handleLogin = () => {
    setError("");
    const result = loginStudent({ username, password });
    if (!result.ok) { setError(result.error); return; }
    startSession(result.student);
    onStudentAuth(result.student);
  };

  return (
    <div>
      <ErrorBox msg={error}/>

      <Field label="Username" value={username} onChange={setUsername}
        placeholder="The name you registered with"/>
      <Field label="Password" value={password} onChange={setPassword}
        type="password" placeholder="Your password"/>

      <SubmitBtn label="Log In & Continue →" color={C.cyan} onClick={handleLogin}/>
    </div>
  );
}

export default function AuthScreen({ onStudentAuth, onTeacherAuth }) {
  const configured = isClassConfigured();
  const [mode,      setMode]      = useState("student-login");
  const [setupDone, setSetupDone] = useState(configured);

  if (!setupDone) {
    return (
      <div style={setupScreenStyle}>
        <div style={{
          width:"100%", maxWidth:440,
          marginTop: "auto",
          marginBottom: "auto",
          background:C.card, borderRadius:18,
          border:`1px solid ${C.purple}40`,
          padding:"32px 32px",
          boxShadow:`0 0 60px ${C.purple}15`,
          maxHeight: "calc(100dvh - 48px)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}>
          <div style={{
            fontSize:11, color:C.purple, textAlign:"center",
            letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:20,
          }}>
            First time setup · Teacher only
          </div>
          <ClassSetup onComplete={()=>setSetupDone(true)}/>
        </div>
        <div style={{marginTop:20,fontSize:11,color:C.t3,textAlign:"center"}}>
          This setup only appears once on this device.
        </div>
      </div>
    );
  }

  const cfg = getClassConfig();

  return (
    <div style={screenStyle}>

      <div style={{textAlign:"center", marginBottom:24, marginTop: 8, flexShrink: 0}}>
        <div style={{fontSize:38, marginBottom:10, filter:"drop-shadow(0 0 20px rgba(0,200,255,0.4))"}}>
          🛡️
        </div>
        <div style={{fontSize:22, fontWeight:800, color:C.t1, letterSpacing:"-0.01em"}}>
          Cyber/AI Python Lab
        </div>
        {cfg.className && (
          <div style={{
            fontSize:13, color:C.purple, marginTop:6,
            padding:"3px 12px", borderRadius:20,
            background:`${C.purple}12`, border:`1px solid ${C.purple}30`,
            display:"inline-block",
          }}>
            {cfg.className}
          </div>
        )}
      </div>

      <div style={{
        width:"100%", maxWidth:420,
        flexShrink: 0,
        background:C.card, borderRadius:18,
        border:`1px solid ${C.border}`,
        overflow:"hidden",
        boxShadow:"0 8px 40px rgba(0,0,0,0.4)",
      }}>

        <div style={{
          display:"flex",
          borderBottom:`1px solid ${C.border}`,
          background:C.cardAlt,
        }}>
          {[
            {id:"student-login",    label:"🎓 Log In"},
            {id:"student-register", label:"✏️ Register"},
            {id:"teacher",          label:"👩‍🏫 Teacher"},
          ].map(t => (
            <button key={t.id} onClick={()=>setMode(t.id)}
              style={{...btn(),
                flex:1, padding:"12px 6px", fontSize:12,
                fontWeight:mode===t.id?700:400,
                background:"transparent",
                borderBottom:`2px solid ${
                  mode===t.id
                    ? t.id==="teacher" ? C.purple : C.cyan
                    : "transparent"
                }`,
                color: mode===t.id
                  ? t.id==="teacher" ? C.purple : C.cyan
                  : C.t2,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={tabContentStyle}>

          {mode === "student-login" && (
            <>
              <div style={{
                fontSize:12, color:C.t2, marginBottom:18, lineHeight:1.65,
              }}>
                Welcome back! Log in with the username and password you created.
              </div>
              <StudentLogin onStudentAuth={onStudentAuth}/>
              <div style={{marginTop:14, textAlign:"center", fontSize:12, color:C.t3}}>
                First time here?{" "}
                <button onClick={()=>setMode("student-register")} style={{...btn(),
                  color:C.cyan, fontSize:12, background:"none",
                  textDecoration:"underline", padding:0,
                }}>
                  Create an account
                </button>
              </div>
            </>
          )}

          {mode === "student-register" && (
            <>
              <div style={{
                fontSize:12, color:C.t2, marginBottom:18, lineHeight:1.65,
              }}>
                Create your account to save progress between sessions.
                Ask your teacher for the class code.
              </div>
              <StudentRegister onStudentAuth={onStudentAuth}/>
              <div style={{marginTop:14, textAlign:"center", fontSize:12, color:C.t3}}>
                Already registered?{" "}
                <button onClick={()=>setMode("student-login")} style={{...btn(),
                  color:C.cyan, fontSize:12, background:"none",
                  textDecoration:"underline", padding:0,
                }}>
                  Log in
                </button>
              </div>
            </>
          )}

          {mode === "teacher" && (
            <TeacherLogin onTeacherAuth={onTeacherAuth}/>
          )}
        </div>
      </div>

      {cfg.classCode && mode !== "teacher" && (
        <div style={{
          marginTop:16, fontSize:12, color:C.t3, textAlign:"center", flexShrink: 0,
        }}>
          Class code:{" "}
          <span style={{
            color:C.amber, fontFamily:C.mono, fontWeight:700,
            background:`${C.amber}12`, padding:"2px 8px", borderRadius:4,
          }}>
            {cfg.classCode}
          </span>
        </div>
      )}

      <div style={{marginTop:12, marginBottom: 8, fontSize:11, color:C.t3, textAlign:"center", flexShrink: 0}}>
        Progress is saved to this device · Ontario Grade 10 to 11
      </div>
    </div>
  );
}
