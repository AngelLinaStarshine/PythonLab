// src/components/LearnPanel.jsx
// Tabbed gated Learn (reading → video) + project integrations: merged videos,
// TeacherLearnEditor, enrichment / Try me, forwardRef scrollToReading for ARIA.

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import { getMergedVideoSources } from "../utils/videoUtils.js";
import { getLessonContent } from "../data/lessonTryMe.js";
import TeacherVideoManager from "./TeacherVideoManager.jsx";
import TeacherLearnEditor from "./TeacherLearnEditor.jsx";

const C = {
  bg: "#040c18",
  card: "#0a1627",
  cardAlt: "#081120",
  border: "rgba(0,195,255,0.12)",
  cyan: "#00c8ff",
  green: "#00e87a",
  amber: "#ffad2e",
  red: "#ff3658",
  purple: "#a78bfa",
  t1: "#c0ddf0",
  t2: "#4e7090",
  t3: "#243850",
  code: "#020a16",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  sans: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
};

const btn = (extra = {}) => ({
  border: "none",
  cursor: "pointer",
  fontFamily: C.sans,
  transition: "all 0.18s",
  outline: "none",
  ...extra,
});

function speakText(text) {
  const t = typeof text === "string" ? text.trim() : "";
  if (!t || typeof window === "undefined" || !window.speechSynthesis) return;

  const synth = window.speechSynthesis;

  const run = () => {
    try {
      synth.resume();
    } catch {
      /* ignore */
    }
    try {
      if (synth.speaking) synth.cancel();
    } catch {
      /* ignore */
    }
    try {
      if (synth.paused) synth.resume();
    } catch {
      /* ignore */
    }

    const voices = synth.getVoices();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "en-US";
    u.rate = 0.95;
    u.volume = 1;
    if (voices?.length) {
      const en =
        voices.find((v) => /^en-US$/i.test(v.lang)) ||
        voices.find((v) => /^en(-|$)/i.test(v.lang)) ||
        voices[0];
      if (en) {
        try {
          u.voice = en;
        } catch {
          /* ignore */
        }
      }
    }
    u.onerror = (ev) => {
      console.warn("SpeechSynthesis error:", ev?.error ?? ev);
    };

    requestAnimationFrame(() => {
      try {
        synth.speak(u);
      } catch (e) {
        console.warn("LearnPanel TTS speak:", e);
      }
    });
  };

  /* Prime during user gesture (Chrome). */
  synth.getVoices();

  if (synth.getVoices().length > 0) {
    run();
    return;
  }

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    synth.removeEventListener("voiceschanged", onVoices);
    window.clearTimeout(tid);
    run();
  };
  const onVoices = () => finish();
  const tid = window.setTimeout(finish, 1200);
  synth.addEventListener("voiceschanged", onVoices);
}

function normHeading(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function GateBadge({ done, label, index }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 12px",
        borderRadius: 20,
        background: done ? `${C.green}15` : `${C.amber}10`,
        border: `1px solid ${done ? C.green : C.amber}40`,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: done ? C.green : `${C.amber}20`,
          border: `1px solid ${done ? C.green : C.amber}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          color: done ? "#000" : C.amber,
        }}
      >
        {done ? "✓" : index}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: done ? C.green : C.amber }}>{label}</span>
    </div>
  );
}

function TimerBar({ totalSecs, elapsed, done }) {
  const pct = Math.min((elapsed / totalSecs) * 100, 100);
  const remaining = Math.max(totalSecs - elapsed, 0);
  return (
    <div
      style={{
        padding: "10px 22px 12px",
        borderTop: `1px solid ${C.border}`,
        background: C.cardAlt,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontSize: 12,
        }}
      >
        <span style={{ color: C.t2 }}>
          {done ? "✅ Reading complete" : `⏱ Minimum read time — ${formatTime(remaining)} remaining`}
        </span>
        <span style={{ color: done ? C.green : C.amber, fontWeight: 600 }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 2,
            width: `${pct}%`,
            background: done ? C.green : `linear-gradient(90deg, ${C.amber}, ${C.cyan})`,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

function StepsList({ steps }) {
  if (!steps?.length) return null;
  return (
    <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}` }}>
      <div
        style={{
          fontSize: 12,
          color: C.t2,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        What you&apos;ll do
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                flexShrink: 0,
                marginTop: 1,
                background: `${C.cyan}12`,
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: C.cyan,
                fontWeight: 700,
              }}
            >
              {i + 1}
            </div>
            <span style={{ fontSize: 13, color: C.t1, lineHeight: 1.6 }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const LearnPanel = forwardRef(function LearnPanel(
  {
    lesson,
    progress,
    onProgressChange,
    isTeacher,
    lessonId,
    onLessonOverride,
    onTryMeApply,
    tryMeRunPreview,
  },
  ref,
) {
  const scrollRef = useRef(null);
  const videoRef = useRef(null);
  const lastTimeRef = useRef(0);
  const intervalRef = useRef(null);
  const pendingScrollRef = useRef(null);
  const scrollRequestIdRef = useRef(0);

  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("read");
  const [scrollRequestId, setScrollRequestId] = useState(0);

  const [videoSourcesVersion, setVideoSourcesVersion] = useState(0);
  const videoOptions = useMemo(
    () => getMergedVideoSources(lesson, lessonId ?? lesson?.id),
    [lesson, lessonId, videoSourcesVersion],
  );
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const currentSource = videoOptions[selectedVideoIndex];
  const isEmbed = currentSource?.type === "youtube" || currentSource?.type === "notebooklm";

  const scrolled = isTeacher || Boolean(progress?.scrolled);
  const timed = isTeacher || Boolean(progress?.timed);
  const videoDone = isTeacher || Boolean(progress?.videoDone);
  const readDone = scrolled && timed;
  const allDone = readDone && videoDone;

  const minSecs = lesson?.minReadSeconds ?? 30;
  const [elapsed, setElapsed] = useState(0);

  const enrichment = useMemo(() => getLessonContent(lessonId ?? lesson?.id ?? ""), [lessonId, lesson?.id]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const s = window.speechSynthesis;
    s.getVoices();
    const prime = () => {
      s.getVoices();
    };
    s.addEventListener("voiceschanged", prime);
    return () => s.removeEventListener("voiceschanged", prime);
  }, []);

  const learnComplete = useMemo(
    () => Boolean(progress?.scrolled && progress?.timed && progress?.videoDone),
    [progress],
  );

  useEffect(() => {
    setElapsed(0);
    setActiveTab("read");
  }, [lessonId]);

  useEffect(() => {
    lastTimeRef.current = 0;
    setSelectedVideoIndex(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  }, [lesson?.id]);

  useEffect(() => {
    if (isTeacher) return;
    if (!open || activeTab !== "read") return;
    if (timed) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= minSecs) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onProgressChange?.({ ...(progress ?? {}), timed: true });
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, activeTab, isTeacher, timed, minSecs, lessonId, onProgressChange, progress]);

  const checkScrollBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (bottom && !progress?.scrolled && !isTeacher) {
      onProgressChange?.({ ...(progress ?? {}), scrolled: true });
    }
  }, [progress, isTeacher, onProgressChange]);

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || progress?.videoDone) return;
    const now = v.currentTime;
    if (now - lastTimeRef.current > 1.2 && !v.seeking) {
      v.currentTime = lastTimeRef.current;
      return;
    }
    lastTimeRef.current = now;
  };

  const onSeeking = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.currentTime > lastTimeRef.current + 0.2) {
      v.currentTime = lastTimeRef.current;
    }
  };

  const onEnded = () => {
    if (!progress?.videoDone) {
      onProgressChange?.({ ...(progress ?? {}), videoDone: true });
    }
  };

  const onMarkWatched = () => {
    if (!progress?.videoDone) {
      onProgressChange?.({ ...(progress ?? {}), videoDone: true });
    }
  };

  const runScrollToHint = useCallback((sectionHint) => {
    const root = scrollRef.current;
    if (!root) return;
    const hint = normHeading(sectionHint);
    const words = hint.split(/\s+/).filter((w) => w.length > 2);
    const headings = root.querySelectorAll("h2, h3, h4, .lesson-enrichment-heading");
    for (const h of headings) {
      const t = normHeading(h.textContent || "");
      if (words.length > 0 && words.some((w) => t.includes(w))) {
        h.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    root.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      scrollToReading(sectionHint) {
        setOpen(true);
        setActiveTab("read");
        pendingScrollRef.current = sectionHint;
        scrollRequestIdRef.current += 1;
        setScrollRequestId(scrollRequestIdRef.current);
      },
    }),
    [],
  );

  useEffect(() => {
    if (!open || activeTab !== "read") return;
    const hint = pendingScrollRef.current;
    if (hint === null || hint === undefined) return;
    pendingScrollRef.current = null;
    const id = window.setTimeout(() => runScrollToHint(hint), 50);
    return () => clearTimeout(id);
  }, [activeTab, open, lesson?.id, scrollRequestId, runScrollToHint]);

  const tabs = [
    { id: "read", label: "📖 Reading", locked: false },
    { id: "video", label: "🎬 Video", locked: !readDone && !isTeacher },
  ];

  return (
    <div className="learn-panel learn-panel-tabbed">
      <div
        style={{
          background: C.card,
          borderRadius: 12,
          border: `1px solid ${C.border}`,
          overflow: "hidden",
        }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((o) => !o);
            }
          }}
          style={{
            padding: "14px 22px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            background: C.cardAlt,
            borderBottom: open ? `1px solid ${C.border}` : "none",
          }}
        >
          <span style={{ fontSize: 18 }}>📚</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.t1, flex: 1, minWidth: 120 }}>Learn</span>
          {isTeacher && (
            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <TeacherLearnEditor lesson={lesson} lessonId={lessonId ?? lesson?.id} onSave={onLessonOverride} />
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <GateBadge done={readDone} label="Read" index={1} />
            <GateBadge done={videoDone} label="Video" index={2} />
            <GateBadge done={allDone} label="Unlocked" index={3} />
          </div>
          <span style={{ fontSize: 12, color: C.t3 }}>{open ? "▲" : "▼"}</span>
        </div>

        <div
          className={`learn-banner ${learnComplete ? "ok" : ""}`}
          role="status"
          aria-live="polite"
          style={{ margin: "10px 14px 0", borderRadius: 10 }}
        >
          {learnComplete ? "Practice Unlocked ✅" : "Complete all gates to unlock practice"}
        </div>

        {open && (
          <>
            <div
              style={{
                display: "flex",
                borderBottom: `1px solid ${C.border}`,
                background: C.cardAlt,
                flexWrap: "wrap",
              }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isLocked = tab.locked && !isTeacher;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => !isLocked && setActiveTab(tab.id)}
                    title={isLocked ? "Complete reading first" : ""}
                    style={{
                      ...btn(),
                      padding: "11px 20px",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      background: "transparent",
                      borderBottom: `2px solid ${isActive ? C.cyan : "transparent"}`,
                      color: isLocked ? C.t3 : isActive ? C.cyan : C.t2,
                      cursor: isLocked ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    {tab.label}
                    {isLocked && <span style={{ fontSize: 11 }}>🔒</span>}
                    {tab.id === "read" && readDone && <span style={{ fontSize: 11, color: C.green }}>✓</span>}
                    {tab.id === "video" && videoDone && <span style={{ fontSize: 11, color: C.green }}>✓</span>}
                  </button>
                );
              })}
              <div
                style={{
                  marginLeft: "auto",
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {allDone ? (
                  <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>✅ Practice unlocked</span>
                ) : (
                  <span style={{ fontSize: 12, color: C.t3 }}>
                    {!readDone ? "Step 1: Read & wait" : "Step 2: Watch video"}
                  </span>
                )}
              </div>
            </div>

            {activeTab === "read" && (
              <>
                {lesson?.concept && (
                  <div
                    style={{
                      padding: "12px 22px",
                      background: `${C.cyan}07`,
                      borderBottom: `1px solid ${C.border}`,
                      fontSize: 13,
                      color: C.t2,
                      lineHeight: 1.65,
                    }}
                  >
                    <strong style={{ color: C.cyan }}>🎯 Concept: </strong>
                    {lesson.concept}
                  </div>
                )}

                <div
                  ref={scrollRef}
                  onScroll={checkScrollBottom}
                  className="learn-reading-scroll"
                  style={{
                    height: "auto",
                    maxHeight: 420,
                    overflowY: "auto",
                    padding: "18px 22px",
                    fontSize: 13.5,
                    lineHeight: 1.78,
                    color: C.t1,
                    scrollbarWidth: "thin",
                    scrollbarColor: `${C.border} transparent`,
                  }}
                >
                  <div
                    className="material material-inner"
                    dangerouslySetInnerHTML={{
                      __html: lesson?.materialHtml || "<p>No reading material for this lesson.</p>",
                    }}
                  />
                  <div style={{ height: 1, marginTop: 12 }} />

                  {enrichment && (
                    <div className="lesson-enrichment">
                      <div className="lesson-enrichment-head">
                        <h3 className="lesson-enrichment-title">Guided walkthrough</h3>
                        {enrichment.ttsIntro && (
                          <button
                            type="button"
                            className="btn ghost small"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(enrichment.ttsIntro);
                            }}
                          >
                            Play intro (TTS)
                          </button>
                        )}
                      </div>
                      <ol className="lesson-enrichment-sections">
                        {enrichment.sections.map((sec) => (
                          <li key={sec.id} className="lesson-enrichment-section">
                            <div className="lesson-enrichment-section-head">
                              <span className="lesson-enrichment-icon" aria-hidden>
                                {sec.icon}
                              </span>
                              <h4 className="lesson-enrichment-heading">{sec.heading}</h4>
                              {sec.body && (
                                <button
                                  type="button"
                                  className="btn ghost small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakText(sec.body);
                                  }}
                                  title="Read this section aloud"
                                >
                                  TTS
                                </button>
                              )}
                            </div>
                            {sec.body && <p className="lesson-enrichment-body">{sec.body}</p>}
                            {sec.code && (
                              <pre className="lesson-enrichment-code">
                                <code>{sec.code}</code>
                              </pre>
                            )}
                            {sec.tryMe && (
                              <div className="lesson-enrichment-tryme practice-lab">
                                <div className="lesson-enrichment-tryme-label">Try me</div>
                                <p className="lesson-enrichment-tryme-locked-note">
                                  Starter is read-only. Use <strong>Load in editor</strong>, then type and run in the Code
                                  panel.
                                </p>
                                <pre className="lesson-enrichment-code">
                                  <code>{sec.tryMe.starter}</code>
                                </pre>
                                {onTryMeApply && (
                                  <div className="lesson-enrichment-tryme-actions">
                                    <button
                                      type="button"
                                      className="btn small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTryMeApply(sec.tryMe.starter, sec.id);
                                      }}
                                    >
                                      Load in editor
                                    </button>
                                  </div>
                                )}
                                <details className="lesson-enrichment-details">
                                  <summary>Hint</summary>
                                  <p className="lesson-enrichment-hint">{sec.tryMe.hint}</p>
                                </details>
                                <details className="lesson-enrichment-details">
                                  <summary>Expected output</summary>
                                  <pre className="lesson-enrichment-expected">
                                    <code>{sec.tryMe.expectedOutput}</code>
                                  </pre>
                                  {tryMeRunPreview?.sectionId === sec.id && (
                                    <div className="lesson-enrichment-tryme-runout">
                                      <div className="lesson-enrichment-tryme-runout-label">Your run (Code panel)</div>
                                      {(() => {
                                        const err = (tryMeRunPreview.error || "").trim();
                                        const out = (tryMeRunPreview.stdout || "").trim();
                                        const combined = [err, out].filter(Boolean).join("\n\n");
                                        if (!combined) {
                                          return (
                                            <p className="lesson-enrichment-tryme-runout-placeholder">
                                              Press <strong>Run</strong> after loading; your program output will show
                                              here.
                                            </p>
                                          );
                                        }
                                        return (
                                          <pre className="lesson-enrichment-tryme-runout-pre">
                                            <code>{combined}</code>
                                          </pre>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </details>
                              </div>
                            )}
                            {sec.tip && <p className="lesson-enrichment-tip">Tip: {sec.tip}</p>}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {!isTeacher && <TimerBar totalSecs={minSecs} elapsed={elapsed} done={timed} />}

                {!isTeacher && !scrolled && (
                  <div
                    style={{
                      padding: "8px 22px",
                      background: `${C.amber}08`,
                      borderTop: `1px solid ${C.amber}20`,
                      fontSize: 12,
                      color: C.amber,
                      textAlign: "center",
                    }}
                  >
                    ↓ Scroll to the bottom of the reading material to continue
                  </div>
                )}

                {!isTeacher && readDone && (
                  <div
                    style={{
                      padding: "12px 22px",
                      background: `${C.green}08`,
                      borderTop: `1px solid ${C.green}20`,
                      fontSize: 13,
                      color: C.green,
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    ✅ Reading complete — click <strong>Video</strong> tab to continue
                  </div>
                )}

                <StepsList steps={lesson?.steps} />
              </>
            )}

            {activeTab === "video" && (
              <>
                {!readDone && !isTeacher ? (
                  <div
                    style={{
                      padding: "48px 22px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 36 }}>🔒</span>
                    <span style={{ fontSize: 14, color: C.t2 }}>Complete the reading first to unlock this video.</span>
                  </div>
                ) : (
                  <div style={{ padding: "16px 22px" }}>
                    {videoOptions.length > 0 && (
                      <div className="video-options" style={{ marginBottom: 12 }}>
                        <span className="video-options-label">Video:</span>
                        <select
                          className="video-select"
                          value={selectedVideoIndex}
                          onChange={(e) => {
                            const idx = Number(e.target.value);
                            setSelectedVideoIndex(idx);
                            lastTimeRef.current = 0;
                            if (videoRef.current) {
                              videoRef.current.currentTime = 0;
                              videoRef.current.pause();
                            }
                          }}
                          aria-label="Choose video"
                        >
                          {videoOptions.map((opt, i) => (
                            <option key={opt.id || i} value={i}>
                              {opt.label} ({opt.type})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {currentSource?.type === "youtube" && currentSource?.url && (
                      <div className="video-embed-wrap">
                        <iframe
                          className="video-embed"
                          src={currentSource.url}
                          title={currentSource.label}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        {!isTeacher && !progress?.videoDone && (
                          <button type="button" className="btn sun" onClick={onMarkWatched}>
                            I watched this — unlock
                          </button>
                        )}
                      </div>
                    )}

                    {currentSource?.type === "notebooklm" && currentSource?.url && (
                      <div className="video-embed-wrap">
                        <iframe className="video-embed" src={currentSource.url} title={currentSource.label} />
                        <a href={currentSource.url} target="_blank" rel="noopener noreferrer" className="video-external-link">
                          Open NotebookLM in new tab
                        </a>
                        {!isTeacher && !progress?.videoDone && (
                          <button type="button" className="btn sun" onClick={onMarkWatched}>
                            I watched this — unlock
                          </button>
                        )}
                      </div>
                    )}

                    {(currentSource?.type === "mp4" || !currentSource?.type) && currentSource?.url && (
                      <>
                        <video
                          className="video"
                          ref={videoRef}
                          src={currentSource?.url}
                          controls
                          controlsList="nodownload noplaybackrate"
                          disablePictureInPicture
                          onTimeUpdate={onTimeUpdate}
                          onSeeking={onSeeking}
                          onEnded={onEnded}
                        />
                        <div className="video-controls">
                          <button type="button" className="btn" onClick={() => videoRef.current?.play()}>
                            Play
                          </button>
                          <button type="button" className="btn ghost" onClick={() => videoRef.current?.pause()}>
                            Pause
                          </button>
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={() => {
                              const v = videoRef.current;
                              if (!v) return;
                              v.currentTime = 0;
                              lastTimeRef.current = 0;
                              v.pause();
                            }}
                          >
                            Restart
                          </button>
                        </div>
                      </>
                    )}

                    {!isEmbed && currentSource?.url && (
                      <div className="video-note">Skipping is disabled. Watch to the end to unlock.</div>
                    )}

                    {!currentSource?.url && (
                      <div
                        style={{
                          height: 200,
                          background: C.code,
                          borderRadius: 10,
                          border: `1px solid ${C.border}`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                        }}
                      >
                        <span style={{ fontSize: 40 }}>🎬</span>
                        <span style={{ fontSize: 13, color: C.t2 }}>No video URL — add one in teacher mode</span>
                        {!isTeacher && !progress?.videoDone && (
                          <button
                            type="button"
                            onClick={onMarkWatched}
                            style={{
                              ...btn(),
                              padding: "8px 20px",
                              borderRadius: 8,
                              background: `${C.cyan}15`,
                              border: `1px solid ${C.cyan}50`,
                              color: C.cyan,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            ✓ Mark video watched
                          </button>
                        )}
                      </div>
                    )}

                    {isTeacher && (
                      <TeacherVideoManager
                        lessonId={lessonId ?? lesson?.id}
                        lesson={lesson}
                        onVideosChange={() => setVideoSourcesVersion((v) => v + 1)}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {lesson?.checkpoint && allDone && (
              <div
                style={{
                  padding: "12px 22px",
                  borderTop: `1px solid ${C.border}`,
                  background: `${C.green}08`,
                }}
              >
                <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>✓ Checkpoint: </span>
                <span style={{ fontSize: 12, color: C.t1 }}>{lesson.checkpoint}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default LearnPanel;
