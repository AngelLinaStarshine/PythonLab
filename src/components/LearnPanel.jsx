// src/components/LearnPanel.jsx
// Tabbed gated Learn (reading then video) + project integrations: merged videos,
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
import {
  getMergedVideoSources,
  getStudentVideoSources,
  getYouTubeEmbedUrl,
  getYouTubeStudentEmbedUrl,
  filterVideosWithUrls,
  TEACHER_VIDEOS_KEY,
} from "../utils/videoUtils.js";
import { getMergedLessonContent } from "../data/lessonTryMe.js";
import { splitTryMeStarter, previewTryMeExpected } from "../utils/tryMeConstraint.js";
import TeacherVideoManager from "./TeacherVideoManager.jsx";
import TeacherLearnEditor from "./TeacherLearnEditor.jsx";
import InlineTryMe from "./InlineTryMe.jsx";
import { getInlineTryMe } from "../data/lessonInlineTryMe.js";
import { importAllLessonVideos } from "../utils/videoStore.js";

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
        {done ? "\u2713" : index}
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
          {done ? "Reading complete" : `Minimum read time: ${formatTime(remaining)} remaining`}
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
    liveEditorCode = "",
    /** Bumps when teacher saves Learn overrides so Try me / walkthrough JSON reloads. */
    lessonOverridesVersion = 0,
  },
  ref,
) {
  const scrollRef = useRef(null);
  const videoRef = useRef(null);
  const lastTimeRef = useRef(0);
  const intervalRef = useRef(null);
  const pendingScrollRef = useRef(null);
  const scrollRequestIdRef = useRef(0);
  /** When there are zero playable videos, auto-complete the video gate once so Run can unlock. */
  const autoVideoDoneForLessonRef = useRef(null);

  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("read");
  const [scrollRequestId, setScrollRequestId] = useState(0);

  const [videoSourcesVersion, setVideoSourcesVersion] = useState(0);
  const videoOptions = useMemo(() => {
    const lid = lessonId ?? lesson?.id;
    const raw = isTeacher ? getMergedVideoSources(lesson, lid) : getStudentVideoSources(lid, lesson);
    return filterVideosWithUrls(raw);
  }, [lesson, lessonId, lesson?.id, isTeacher, videoSourcesVersion]);
  const hasVideos = isTeacher || videoOptions.length > 0;
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const currentSource = videoOptions[selectedVideoIndex];
  const isEmbed = currentSource?.type === "youtube" || currentSource?.type === "notebooklm";

  const youtubeIframeSrc = useMemo(() => {
    if (currentSource?.type !== "youtube" || !currentSource?.url) return "";
    const raw = currentSource.url;
    if (isTeacher) return getYouTubeEmbedUrl(raw) || raw;
    return getYouTubeStudentEmbedUrl(raw) || getYouTubeEmbedUrl(raw) || raw;
  }, [currentSource?.type, currentSource?.url, isTeacher]);

  /** First completion only: block scrub on MP4; after `videoDone`, full controls. */
  const mp4Restricted = !isTeacher && !progress?.videoDone;
  const [mp4Volume, setMp4Volume] = useState(1);

  const scrolled = isTeacher || Boolean(progress?.scrolled);
  const timed = isTeacher || Boolean(progress?.timed);
  const videoDone = isTeacher || Boolean(progress?.videoDone);
  const readDone = scrolled && timed;
  const allDone = readDone && videoDone;

  const minSecs = lesson?.minReadSeconds ?? 30;
  const [elapsed, setElapsed] = useState(0);

  const enrichment = useMemo(
    () => getMergedLessonContent(lessonId ?? lesson?.id ?? ""),
    [lessonId, lesson?.id, lessonOverridesVersion],
  );

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
    autoVideoDoneForLessonRef.current = null;
  }, [lessonId]);

  useEffect(() => {
    const bump = () => setVideoSourcesVersion((v) => v + 1);
    const onCustom = (e) => {
      const lid = lessonId ?? lesson?.id;
      const changed = e.detail?.lessonId;
      if (!changed || !lid || changed === lid) bump();
    };
    const onStorage = (e) => {
      if (e.key === TEACHER_VIDEOS_KEY) bump();
    };
    window.addEventListener("py-learn-teacher-videos-updated", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("py-learn-teacher-videos-updated", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, [lessonId, lesson?.id]);

  useEffect(() => {
    if (isTeacher || progress?.videoDone) return;
    if (videoOptions.length > 0) return;
    if (autoVideoDoneForLessonRef.current === lessonId) return;
    autoVideoDoneForLessonRef.current = lessonId;
    onProgressChange?.({ ...(progress ?? {}), videoDone: true });
  }, [
    isTeacher,
    progress?.videoDone,
    videoOptions.length,
    lessonId,
    onProgressChange,
    progress,
  ]);

  useEffect(() => {
    setElapsed(0);
    setActiveTab("read");
  }, [lessonId]);

  useEffect(() => {
    if (!isTeacher && !hasVideos && activeTab === "video") {
      setActiveTab("read");
    }
  }, [hasVideos, isTeacher, activeTab]);

  useEffect(() => {
    lastTimeRef.current = 0;
    setSelectedVideoIndex(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  }, [lesson?.id]);

  useEffect(() => {
    setSelectedVideoIndex((idx) => {
      if (videoOptions.length === 0) return 0;
      return idx >= videoOptions.length ? 0 : idx;
    });
  }, [videoOptions.length]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !currentSource?.url) return;
    if (currentSource.type === "youtube" || currentSource.type === "notebooklm") return;
    try {
      v.load();
    } catch {
      /* ignore */
    }
  }, [currentSource?.url, currentSource?.type]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || currentSource?.type === "youtube" || currentSource?.type === "notebooklm") return;
    v.volume = mp4Volume;
  }, [mp4Volume, currentSource?.url, currentSource?.type, selectedVideoIndex]);

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

  /** Track position for seek guard only; avoid clamping on slow timeupdate (that used to freeze playback). */
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || isTeacher || progress?.videoDone) return;
    if (!v.seeking) lastTimeRef.current = v.currentTime;
  };

  const onSeeking = () => {
    const v = videoRef.current;
    if (!v || isTeacher || progress?.videoDone) return;
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
    { id: "read", label: "Reading", locked: false },
    ...(hasVideos ? [{ id: "video", label: "Video", locked: !readDone && !isTeacher }] : []),
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
          <span style={{ fontSize: 15, fontWeight: 700, color: C.t1, flex: 1, minWidth: 120 }}>Learn</span>
          {isTeacher && (
            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <TeacherLearnEditor lesson={lesson} lessonId={lessonId ?? lesson?.id} onSave={onLessonOverride} />
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <GateBadge done={readDone} label="Read" index={1} />
            {hasVideos ? <GateBadge done={videoDone} label="Video" index={2} /> : null}
            <GateBadge done={allDone} label="Unlocked" index={hasVideos ? 3 : 2} />
          </div>
          <span style={{ fontSize: 12, color: C.t3 }}>{open ? "\u25BC" : "\u25B6"}</span>
        </div>

        <div
          className={`learn-banner ${learnComplete ? "ok" : ""}`}
          role="status"
          aria-live="polite"
          style={{ margin: "10px 14px 0", borderRadius: 10 }}
        >
          {learnComplete ? "Practice unlocked" : "Complete all gates to unlock practice"}
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
                    {isLocked && <span style={{ fontSize: 11 }}>(locked)</span>}
                    {tab.id === "read" && readDone && <span style={{ fontSize: 11, color: C.green }}>{"\u2713"}</span>}
                    {tab.id === "video" && videoDone && <span style={{ fontSize: 11, color: C.green }}>{"\u2713"}</span>}
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
                  <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Practice unlocked</span>
                ) : (
                  <span style={{ fontSize: 12, color: C.t3 }}>
                    {!readDone
                      ? "Step 1: Read & wait"
                      : hasVideos
                        ? "Step 2: Watch video"
                        : "Finish reading to unlock practice"}
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
                    <strong style={{ color: C.cyan }}>Concept: </strong>
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
                        {enrichment.sections.map((sec) => {
                          const lid = lessonId ?? lesson?.id ?? "";
                          const inlineSpec = getInlineTryMe(lid, sec.id);
                          return (
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
                            {inlineSpec ? <InlineTryMe {...inlineSpec} /> : null}
                            {sec.tryMe && (() => {
                              const token =
                                typeof sec.tryMe.editableToken === "string"
                                  ? sec.tryMe.editableToken.trim()
                                  : "";
                              const split = token
                                ? splitTryMeStarter(sec.tryMe.starter, token)
                                : null;
                              const midForPreview = (() => {
                                if (
                                  !split ||
                                  tryMeRunPreview?.sectionId !== sec.id ||
                                  typeof liveEditorCode !== "string"
                                ) {
                                  return split ? split.token : "";
                                }
                                const c = liveEditorCode;
                                if (c.startsWith(split.before) && c.endsWith(split.after)) {
                                  return c.slice(
                                    split.before.length,
                                    c.length - split.after.length,
                                  );
                                }
                                return split.token;
                              })();
                              const expectedShown = split
                                ? previewTryMeExpected(
                                    sec.tryMe.expectedOutput,
                                    split.token,
                                    midForPreview,
                                  )
                                : sec.tryMe.expectedOutput;
                              const constraint =
                                split != null
                                  ? {
                                      before: split.before,
                                      after: split.after,
                                      maxLength: Number(sec.tryMe.editableMaxLength) || 64,
                                      defaultMid: split.token,
                                    }
                                  : null;

                              const loadSubtle = Boolean(inlineSpec);

                              return (
                                <div className="lesson-enrichment-tryme practice-lab">
                                  <div className="lesson-enrichment-tryme-label">Try me</div>
                                  <p className="lesson-enrichment-tryme-locked-note">
                                    {loadSubtle ? (
                                      <>
                                        Use the <strong>Try Me</strong> block above first. When you are ready for the
                                        full runnable starter, open it in the <strong>Code</strong> editor (after Read +
                                        Video gates).{" "}
                                        {split ? (
                                          <>
                                            You may still change only <strong>{split.token}</strong> in the editor
                                            when a token is shown.
                                          </>
                                        ) : null}
                                      </>
                                    ) : split ? (
                                      <>
                                        Change only <strong>{split.token}</strong> in the <strong>Code</strong> editor
                                        after <strong>Load in editor</strong> (see Hint). Other text is fixed
                                        automatically.
                                      </>
                                    ) : (
                                      <>
                                        Starter is read-only here. Use <strong>Load in editor</strong>, then edit and
                                        run in the Code panel.
                                      </>
                                    )}
                                  </p>
                                  <pre className="lesson-enrichment-code">
                                    <code>{sec.tryMe.starter}</code>
                                  </pre>
                                  {onTryMeApply && (
                                    <div
                                      className={
                                        loadSubtle
                                          ? "lesson-enrichment-tryme-actions lesson-enrichment-tryme-actions--subtle"
                                          : "lesson-enrichment-tryme-actions"
                                      }
                                    >
                                      <button
                                        type="button"
                                        className={loadSubtle ? "btn ghost small" : "btn small"}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onTryMeApply(sec.tryMe.starter, sec.id, { constraint });
                                        }}
                                      >
                                        {loadSubtle ? "Load full example in code editor" : "Load in editor"}
                                      </button>
                                      {loadSubtle ? (
                                        <span className="lesson-enrichment-tryme-gate-note">
                                          Available after Read + Video gates
                                        </span>
                                      ) : null}
                                    </div>
                                  )}
                                  <details className="lesson-enrichment-details">
                                    <summary>Hint</summary>
                                    <p className="lesson-enrichment-hint">{sec.tryMe.hint}</p>
                                  </details>
                                  <details className="lesson-enrichment-details">
                                    <summary>Expected output</summary>
                                    <pre className="lesson-enrichment-expected">
                                      <code>{expectedShown}</code>
                                    </pre>
                                    {tryMeRunPreview?.sectionId === sec.id && (
                                      <div className="lesson-enrichment-tryme-runout">
                                        <div className="lesson-enrichment-tryme-runout-label">
                                          Your run (Code panel)
                                        </div>
                                        {(() => {
                                          const err = (tryMeRunPreview.error || "").trim();
                                          const out = (tryMeRunPreview.stdout || "").trim();
                                          const combined = [err, out].filter(Boolean).join("\n\n");
                                          if (!combined) {
                                            return (
                                              <p className="lesson-enrichment-tryme-runout-placeholder">
                                                {split ? (
                                                  <>
                                                    Edit <strong>{split.token}</strong> in the Code editor, then{" "}
                                                    <strong>Run</strong>; your output appears here.
                                                  </>
                                                ) : (
                                                  <>
                                                    Press <strong>Run</strong> after loading; your program output will
                                                    show here.
                                                  </>
                                                )}
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
                              );
                            })()}
                            {sec.tip && <p className="lesson-enrichment-tip">Tip: {sec.tip}</p>}
                          </li>
                          );
                        })}
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
                    Scroll to the bottom of the reading material to continue
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
                    Reading complete ? click the <strong>Video</strong> tab to continue
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
                    <span style={{ fontSize: 14, color: C.t2 }}>Complete the reading first to unlock this video.</span>
                  </div>
                ) : (
                  <div style={{ padding: "16px 22px" }}>
                    {videoOptions.length > 1 && (
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

                    {currentSource?.type === "youtube" && youtubeIframeSrc && (
                      <div className="video-shell-col">
                        <div className="video-stage">
                          <iframe
                            key={youtubeIframeSrc}
                            className="video-embed video-stage-fill"
                            src={youtubeIframeSrc}
                            title={currentSource.label}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            {...(isTeacher ? { allowFullScreen: true } : {})}
                          />
                        </div>
                        {!isTeacher && !progress?.videoDone && (
                          <button type="button" className="btn sun" onClick={onMarkWatched}>
                            I watched this, unlock
                          </button>
                        )}
                      </div>
                    )}

                    {currentSource?.type === "notebooklm" && currentSource?.url && (
                      <div className="video-shell-col">
                        <div className="video-stage">
                          <iframe
                            className="video-embed video-stage-fill"
                            src={currentSource.url}
                            title={currentSource.label}
                          />
                        </div>
                        <a href={currentSource.url} target="_blank" rel="noopener noreferrer" className="video-external-link">
                          Open NotebookLM in new tab
                        </a>
                        {!isTeacher && !progress?.videoDone && (
                          <button type="button" className="btn sun" onClick={onMarkWatched}>
                            I watched this, unlock
                          </button>
                        )}
                      </div>
                    )}

                    {(currentSource?.type === "mp4" || !currentSource?.type) && currentSource?.url && (
                      <div className="video-shell-col">
                        <div className="video-stage">
                          <video
                            key={`${currentSource?.id || "v"}-${currentSource?.url || ""}`}
                            className="video video-stage-fill"
                            ref={videoRef}
                            src={currentSource?.url}
                            playsInline
                            controls={!mp4Restricted}
                            controlsList={
                              isTeacher ? "nodownload noplaybackrate" : "nofullscreen nodownload noplaybackrate"
                            }
                            disablePictureInPicture
                            onTimeUpdate={onTimeUpdate}
                            onSeeking={onSeeking}
                            onEnded={onEnded}
                            onDoubleClick={(e) => {
                              if (mp4Restricted) e.preventDefault();
                            }}
                          />
                        </div>
                        {mp4Restricted ? (
                          <div className="video-controls video-controls-student">
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
                            <label className="video-volume">
                              <span className="video-volume-label">Volume</span>
                              <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={mp4Volume}
                                onChange={(e) => setMp4Volume(Number(e.target.value))}
                              />
                            </label>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {currentSource?.type === "youtube" && currentSource?.url && mp4Restricted && (
                      <div className="video-note">
                        Playback stays in this page. If the player does not mark completion, use the button under the
                        video when you have watched it.
                      </div>
                    )}

                    {!isEmbed && currentSource?.url && mp4Restricted && (
                      <div className="video-note">Skipping is disabled until you finish once. Watch to the end to unlock.</div>
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
                        <span
                          style={{
                            fontSize: 13,
                            color: C.t2,
                            textAlign: "center",
                            padding: "0 16px",
                            maxWidth: 420,
                            lineHeight: 1.45,
                          }}
                        >
                          {!isTeacher && videoOptions.length === 0
                            ? "No videos yet for this lesson. Your teacher should add YouTube or public MP4 links, share a video pack, or publish public/lesson-videos.json with the site."
                            : "No video URL, add one in teacher mode"}
                        </span>
                        {!isTeacher && videoOptions.length === 0 ? (
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={() => {
                              const raw = window.prompt(
                                "Paste the video pack JSON from your teacher (Download pack in teacher mode):",
                              );
                              if (!raw?.trim()) return;
                              try {
                                importAllLessonVideos(raw.trim());
                                setVideoSourcesVersion((v) => v + 1);
                              } catch {
                                window.alert("Import failed ? check the JSON and try again.");
                              }
                            }}
                          >
                            Import class video pack
                          </button>
                        ) : null}
                        {!isTeacher && !progress?.videoDone && videoOptions.length > 0 && (
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
                            Mark video watched
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
                <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>Checkpoint: </span>
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
