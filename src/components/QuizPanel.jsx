// src/components/QuizPanel.jsx
// ─────────────────────────────────────────────────────────────────
// Reusable quiz renderer. Reads questions from quizData.js.
// Shows code snippets per question. Tracks score.
//
// Props:
//   lessonId   . string e.g. "l8"
//   onComplete . fn(score, total) called when all questions answered
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { getQuiz } from "../data/quizData.js";

const C = {
  card:"#0a1627", cardAlt:"#081120",
  border:"rgba(0,195,255,0.12)",
  cyan:"#00c8ff", green:"#00e87a", amber:"#ffad2e",
  red:"#ff3658", purple:"#a78bfa",
  t1:"#c0ddf0", t2:"#4e7090", t3:"#243850",
  code:"#020a16",
  mono:"'JetBrains Mono','Courier New',monospace",
  sans:"'DM Sans',-apple-system,sans-serif",
};

const btn = (x={}) => ({
  border:"none", cursor:"pointer", fontFamily:C.sans,
  transition:"all 0.18s", outline:"none", ...x,
});

function CodeSnippet({ code }) {
  if (!code) return null;
  return (
    <div style={{
      background:C.code, borderRadius:8,
      border:`1px solid ${C.border}`,
      margin:"12px 0", overflow:"auto",
      userSelect:"none", WebkitUserSelect:"none",
    }}
      onCopy={e=>e.preventDefault()}
      onContextMenu={e=>e.preventDefault()}
    >
      <div style={{
        padding:"5px 14px", borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", gap:6,
      }}>
        {["#ff5f57","#febc2e","#28c840"].map((c,i)=>(
          <div key={i} style={{width:10,height:10,borderRadius:"50%",background:c}}/>
        ))}
        <span style={{fontSize:11,color:C.t3,marginLeft:4,fontFamily:C.mono}}>python</span>
        <span style={{marginLeft:"auto",fontSize:10,color:C.t3,textTransform:"uppercase",letterSpacing:"0.05em"}}>read only</span>
      </div>
      <pre style={{
        margin:0, padding:"12px 16px",
        fontFamily:C.mono, fontSize:12.5, lineHeight:1.8,
        whiteSpace:"pre", overflowX:"auto",
        pointerEvents:"none",
      }}>
        {code.split("\n").map((line, i) => {
          const isComment = line.trim().startsWith("#");
          if (isComment) return <div key={i} style={{color:C.t3}}>{line}</div>;
          const parts = line.split(/("[^"]*"|'[^']*')/g);
          return (
            <div key={i}>
              {parts.map((seg,j) =>
                (seg.startsWith('"')||seg.startsWith("'"))
                  ? <span key={j} style={{color:C.amber}}>{seg}</span>
                  : <span key={j} style={{color:C.t1}}>{seg}</span>
              )}
            </div>
          );
        })}
      </pre>
    </div>
  );
}

function Tag({ label }) {
  return (
    <span style={{
      display:"inline-block", fontSize:10, fontWeight:700,
      letterSpacing:"0.07em", textTransform:"uppercase",
      padding:"2px 8px", borderRadius:4,
      background:`${C.purple}18`, border:`1px solid ${C.purple}40`,
      color:C.purple,
    }}>{label}</span>
  );
}

export default function QuizPanel({ lessonId, onComplete }) {
  const questions = getQuiz(lessonId);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState({}); // { qIdx: selectedOptIdx }
  const [done, setDone] = useState(false);

  useEffect(() => {
    setCurrent(0);
    setAnswered({});
    setDone(false);
  }, [lessonId]);

  if (!questions.length) {
    return (
      <div style={{padding:"20px",color:C.t2,fontFamily:C.sans,fontSize:13}}>
        No quiz available for this lesson yet.
      </div>
    );
  }

  const q          = questions[current];
  const isAnswered = answered[current] !== undefined;
  const selected   = answered[current];
  const isCorrect  = selected === q.correct;

  const answer = (optIdx) => {
    if (isAnswered) return;
    setAnswered(prev => ({ ...prev, [current]: optIdx }));
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      const score = questions.reduce((acc, qq, idx) => acc + (answered[idx] === qq.correct ? 1 : 0), 0);
      setDone(true);
      onComplete?.(score, questions.length);
    }
  };

  // ── Results screen ────────────────────────────────────────────
  if (done) {
    const score  = Object.entries(answered).filter(([qi, ai]) =>
      questions[parseInt(qi)].correct === ai
    ).length;
    const pct    = Math.round((score / questions.length) * 100);
    const emoji  = pct === 100 ? "🏆" : pct >= 67 ? "🎯" : "💪";
    const msg    = pct === 100
      ? "Perfect! You understand the code structure completely."
      : pct >= 67
        ? "Good work. Review the questions you missed before moving on."
        : "Keep going. reread the lesson material and try again.";

    return (
      <div style={{padding:"24px",fontFamily:C.sans}}>
        <div style={{
          padding:"28px 24px", background:C.card, borderRadius:12,
          border:`1px solid ${C.border}`, textAlign:"center",
        }}>
          <div style={{fontSize:52,marginBottom:12}}>{emoji}</div>
          <div style={{fontSize:22,fontWeight:800,color:C.t1,marginBottom:6}}>
            {score} / {questions.length} correct
          </div>
          <div style={{fontSize:14,color:C.t2,marginBottom:20}}>{msg}</div>

          {/* Per-question review */}
          <div style={{textAlign:"left",marginBottom:20}}>
            {questions.map((qq, i) => {
              const sel = answered[i];
              const ok  = sel === qq.correct;
              return (
                <div key={i} style={{
                  padding:"10px 14px", borderRadius:8, marginBottom:8,
                  background: ok ? `${C.green}08` : `${C.red}08`,
                  border:`1px solid ${ok ? C.green : C.red}25`,
                  display:"flex", alignItems:"flex-start", gap:10,
                }}>
                  <span style={{fontSize:14, flexShrink:0}}>{ok?"✓":"✗"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:ok?C.green:C.red,marginBottom:2}}>
                      Q{i+1}: <Tag label={qq.tag} />
                    </div>
                    <div style={{fontSize:12,color:C.t2,lineHeight:1.5}}>{qq.explain}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrent(0);
              setAnswered({});
              setDone(false);
            }}
            style={{...btn(),
              padding:"10px 24px", borderRadius:8,
              background:`${C.cyan}15`, border:`1px solid ${C.cyan}50`,
              color:C.cyan, fontSize:13, fontWeight:600,
            }}>
            ↺ Retry quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Question screen ───────────────────────────────────────────
  return (
    <div style={{padding:"20px 24px",fontFamily:C.sans}}>

      {/* Progress bar */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        {questions.map((_,i) => (
          <div key={i} style={{
            height:4, flex:1, borderRadius:2,
            background: i<current
              ? (answered[i]===questions[i].correct ? C.green : C.red)
              : i===current ? C.cyan : C.border,
            transition:"background 0.3s",
          }}/>
        ))}
        <span style={{fontSize:12,color:C.t2,minWidth:44,textAlign:"right"}}>
          {current+1}/{questions.length}
        </span>
      </div>

      {/* Question card */}
      <div style={{
        padding:"18px 20px", background:C.card, borderRadius:10,
        border:`1px solid ${C.border}`, marginBottom:12,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <Tag label={q.tag} />
          <span style={{fontSize:11,color:C.t3}}>Question {current+1}</span>
        </div>
        <p style={{fontSize:14,color:C.t1,lineHeight:1.65,margin:"0 0 4px"}}>{q.q}</p>
        {q.code && <CodeSnippet code={q.code} />}
      </div>

      {/* Options */}
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
        {q.opts.map((opt,i) => {
          const isSelected = selected===i;
          const isRight    = isAnswered && i===q.correct;
          const isWrong    = isAnswered && isSelected && i!==q.correct;
          return (
            <button type="button" key={i} onClick={()=>answer(i)} style={{...btn(),
              padding:"12px 16px", borderRadius:8, textAlign:"left",
              background: isRight?`${C.green}10`:isWrong?`${C.red}10`:isSelected?`${C.cyan}10`:C.card,
              border:`1px solid ${isRight?C.green:isWrong?C.red:isSelected?C.cyan:C.border}`,
              color: isRight?C.green:isWrong?C.red:isSelected?C.cyan:C.t1,
              display:"flex", alignItems:"flex-start", gap:12,
              cursor: isAnswered?"default":"pointer",
            }}>
              <span style={{
                width:24, height:24, borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                background: isRight?`${C.green}20`:isWrong?`${C.red}20`:C.cardAlt,
                border:`1px solid ${isRight?C.green:isWrong?C.red:C.border}`,
                fontSize:11, fontWeight:700,
                color: isRight?C.green:isWrong?C.red:C.t2,
              }}>
                {String.fromCharCode(65+i)}
              </span>
              <span style={{fontFamily:C.mono, fontSize:12.5, lineHeight:1.6, paddingTop:1}}>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation after answering */}
      {isAnswered && (
        <div style={{
          padding:"12px 16px", borderRadius:8, marginBottom:14,
          background: isCorrect?`${C.green}08`:`${C.red}08`,
          border:`1px solid ${isCorrect?C.green:C.red}30`,
        }}>
          <span style={{fontSize:13,fontWeight:700,color:isCorrect?C.green:C.red}}>
            {isCorrect?"✓ Correct! ":"✗ Not quite. "}
          </span>
          <span style={{fontSize:13,color:C.t1,lineHeight:1.6}}>{q.explain}</span>
        </div>
      )}

      {/* Next button */}
      <button type="button" onClick={next} disabled={!isAnswered} style={{...btn(),
        padding:"11px 24px", borderRadius:8,
        background: isAnswered?`${C.cyan}15`:"transparent",
        border:`1px solid ${isAnswered?C.cyan:C.border}`,
        color: isAnswered?C.cyan:C.t3,
        fontSize:14, fontWeight:600,
        cursor: isAnswered?"pointer":"not-allowed",
      }}>
        {current===questions.length-1?"Finish Quiz ✓":"Next Question →"}
      </button>
    </div>
  );
}
