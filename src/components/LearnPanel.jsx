// src/components/LearnPanel.jsx
// ─────────────────────────────────────────────────────────────────
// Gated Learn panel.
//
// VIDEO BEHAVIOUR:
//   Teacher mode → "Manage Videos" panel: add/edit/delete video URLs
//                  per lesson. Saved to localStorage via videoStore.
//   Student mode → VideoPanel reads ONLY from videoStore.
//                  Empty placeholder URLs from lessons.js are ignored.
//                  If no videos saved for this lesson → "No videos
//                  uploaded yet" notice + "Continue without video" button.
//
// Gate order (student):
//   1. Read material (scroll to bottom + timer)
//   2. Watch video or skip via notice if none uploaded
//   3. Practice unlocks
// ─────────────────────────────────────────────────────────────────

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  getVideosForLesson,
  addVideoToLesson,
  removeVideoFromLesson,
  updateVideoInLesson,
  toEmbedUrl,
  detectUrlType,
} from "../utils/videoStore.js";
import { getMergedLessonContent } from "../data/lessonTryMe.js";
import TeacherLearnEditor from "./TeacherLearnEditor.jsx";
import InlineTryMe from "./InlineTryMe.jsx";
import { getInlineTryMe } from "../data/lessonInlineTryMe.js";

const C = {
  bg:"#040c18", card:"#0a1627", cardAlt:"#081120",
  border:"rgba(0,195,255,0.12)", bHov:"rgba(0,195,255,0.28)",
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

function GateBadge({ done, label, index }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:7,
      padding:"5px 11px", borderRadius:20,
      background: done?`${C.green}15`:`${C.amber}10`,
      border:`1px solid ${done?C.green:C.amber}40`,
    }}>
      <div style={{
        width:20, height:20, borderRadius:"50%", flexShrink:0,
        background: done?C.green:`${C.amber}20`,
        border:`1px solid ${done?C.green:C.amber}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:10, fontWeight:700,
        color: done?"#000":C.amber,
      }}>
        {done?"✓":index}
      </div>
      <span style={{fontSize:12, fontWeight:600, color:done?C.green:C.amber}}>
        {label}
      </span>
    </div>
  );
}

function formatTime(secs) {
  const m = Math.floor(secs/60);
  const s = secs%60;
  return m>0?`${m}m ${s}s`:`${s}s`;
}

function normHeading(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Reading section (legacy; prefer scrollRef container in main panel) ──
function ReadingSection({ materialHtml, onScrolledToBottom }) {
  const ref  = useRef(null);
  const done = useRef(false);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el || done.current) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      done.current = true;
      onScrolledToBottom?.();
    }
  }, [onScrolledToBottom]);

  return (
    <div ref={ref} onScroll={onScroll} style={{
      maxHeight:420, overflowY:"auto",
      padding:"18px 22px",
      fontSize:13.5, lineHeight:1.78, color:C.t1,
      scrollbarWidth:"thin", scrollbarColor:`${C.border} transparent`,
    }}>
      <div className="material-html"
        dangerouslySetInnerHTML={{__html:materialHtml||"<p>No reading material.</p>"}}/>
      <div style={{height:1, marginTop:12}}/>
    </div>
  );
}

// ── Timer bar ─────────────────────────────────────────────────────
function TimerBar({ totalSecs, elapsed, done }) {
  const pct       = Math.min((elapsed/totalSecs)*100, 100);
  const remaining = Math.max(totalSecs-elapsed, 0);
  return (
    <div style={{padding:"10px 22px 12px", borderTop:`1px solid ${C.border}`, background:C.cardAlt}}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12}}>
        <span style={{color:C.t2}}>
          {done?"✅ Reading time complete":`⏱ Minimum read time — ${formatTime(remaining)} remaining`}
        </span>
        <span style={{color:done?C.green:C.amber, fontWeight:600}}>{Math.round(pct)}%</span>
      </div>
      <div style={{height:4, background:C.border, borderRadius:2, overflow:"hidden"}}>
        <div style={{
          height:"100%", borderRadius:2, width:`${pct}%`,
          background:done?C.green:`linear-gradient(90deg,${C.amber},${C.cyan})`,
          transition:"width 0.5s ease",
        }}/>
      </div>
    </div>
  );
}

// ── Smart video player: YouTube embed / Vimeo embed / <video> ────
function VideoPlayer({ url, onProgress }) {
  const videoRef = useRef(null);
  const type     = detectUrlType(url);
  const embedUrl = toEmbedUrl(url);

  // For direct <video> files we can track progress
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.duration && v.currentTime/v.duration >= 0.9) onProgress?.();
  };

  if (type === "youtube" || type === "vimeo" || type === "iframe") {
    return (
      <div style={{position:"relative", paddingTop:"56.25%", borderRadius:10, overflow:"hidden", background:"#000"}}>
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position:"absolute", top:0, left:0,
            width:"100%", height:"100%",
            border:"none",
          }}
          title="Lesson video"
        />
        {/* For iframes we can't track progress — show manual confirm */}
        <button
          onClick={onProgress}
          style={{
            position:"absolute", bottom:10, right:10,
            ...btn(),
            padding:"7px 16px", borderRadius:8,
            background:"rgba(0,0,0,0.7)",
            border:`1px solid ${C.green}80`,
            color:C.green, fontSize:12, fontWeight:600,
          }}>
          ✓ Mark as watched
        </button>
      </div>
    );
  }

  // Direct video file
  return (
    <video
      ref={videoRef}
      src={url}
      controls
      onTimeUpdate={onTimeUpdate}
      style={{width:"100%", display:"block", borderRadius:10, background:"#000"}}
    />
  );
}

// ── Student video panel ───────────────────────────────────────────
function StudentVideoPanel({ lessonId, onVideoDone, videoDone }) {
  const [saved, setSaved] = useState(() => getVideosForLesson(lessonId));
  const [activeIdx, setActiveIdx] = useState(0);
  const [watched, setWatched] = useState(videoDone);

  useEffect(() => {
    const reload = () => setSaved(getVideosForLesson(lessonId));
    reload();
    setActiveIdx(0);
    setWatched(false);
    window.addEventListener("py-learn-teacher-videos-updated", reload);
    return () => window.removeEventListener("py-learn-teacher-videos-updated", reload);
  }, [lessonId]);

  const markWatched = () => {
    if (watched) return;
    setWatched(true);
    onVideoDone();
  };

  const isDone = videoDone || watched;
  const hasVideos = saved.length > 0;

  return (
    <div style={{padding:"16px 22px"}}>

      {/* ── No videos uploaded yet ── */}
      {!hasVideos && (
        <div style={{
          padding:"32px 24px", borderRadius:12,
          border:`1px dashed ${C.amber}40`,
          background:`${C.amber}05`,
          textAlign:"center",
          display:"flex", flexDirection:"column", alignItems:"center", gap:14,
        }}>
          <span style={{fontSize:36}}>🎬</span>
          <div>
            <div style={{fontSize:14, fontWeight:600, color:C.amber, marginBottom:6}}>
              No videos uploaded yet
            </div>
            <div style={{fontSize:12, color:C.t2, lineHeight:1.65, maxWidth:280}}>
              Your teacher will add video resources here shortly.
              You can continue to practice without watching a video.
            </div>
          </div>
          {!isDone && (
            <button onClick={markWatched} style={{...btn(),
              padding:"9px 24px", borderRadius:8,
              background:`${C.cyan}15`, border:`1px solid ${C.cyan}50`,
              color:C.cyan, fontSize:13, fontWeight:600,
            }}>
              Continue without video →
            </button>
          )}
          {isDone && (
            <span style={{fontSize:13, color:C.green, fontWeight:600}}>
              ✅ Continued — Practice unlocked
            </span>
          )}
        </div>
      )}

      {/* ── Video tabs — only saved videos ── */}
      {hasVideos && (
        <>
          {saved.length > 1 && (
            <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:12}}>
              {saved.map((v,i) => (
                <button key={i} onClick={()=>setActiveIdx(i)} style={{...btn(),
                  padding:"5px 12px", borderRadius:6, fontSize:12,
                  background: activeIdx===i?`${C.cyan}18`:"transparent",
                  border:`1px solid ${activeIdx===i?C.cyan:C.border}`,
                  color: activeIdx===i?C.cyan:C.t2,
                }}>
                  {v.label}
                </button>
              ))}
            </div>
          )}

          <VideoPlayer
            url={saved[activeIdx]?.url || ""}
            onProgress={markWatched}
          />

          {/* Watch progress note */}
          {!isDone && (
            <p style={{fontSize:12, color:C.t3, marginTop:8}}>
              Watch the video, then click "✓ Mark as watched" to unlock Practice.
            </p>
          )}
          {isDone && (
            <p style={{fontSize:12, color:C.green, marginTop:8, fontWeight:600}}>
              ✅ Video complete — Practice is now unlocked.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ── Teacher video manager ─────────────────────────────────────────
function TeacherVideoManager({ lessonId }) {
  const [videos,    setVideos]    = useState(() => getVideosForLesson(lessonId));
  const [newLabel,  setNewLabel]  = useState("");
  const [newUrl,    setNewUrl]    = useState("");
  const [error,     setError]     = useState("");
  const [editIdx,   setEditIdx]   = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl,   setEditUrl]   = useState("");

  // Reload on lesson change
  useEffect(() => {
    setVideos(getVideosForLesson(lessonId));
    setError(""); setNewLabel(""); setNewUrl("");
    setEditIdx(null);
  }, [lessonId]);

  const refresh = () => setVideos(getVideosForLesson(lessonId));

  const handleAdd = () => {
    const label = newLabel.trim();
    const url   = newUrl.trim();
    if (!label) { setError("Enter a display label for this video."); return; }
    if (!url)   { setError("Enter a video URL."); return; }
    if (!url.startsWith("http")) { setError("URL must start with http:// or https://"); return; }

    const added = addVideoToLesson(lessonId, label, url);
    if (!added) { setError("This URL is already saved for this lesson."); return; }

    setNewLabel(""); setNewUrl(""); setError("");
    refresh();
  };

  const handleRemove = (i) => {
    removeVideoFromLesson(lessonId, i);
    refresh();
  };

  const startEdit = (i) => {
    setEditIdx(i);
    setEditLabel(videos[i].label);
    setEditUrl(videos[i].url);
  };

  const saveEdit = () => {
    updateVideoInLesson(lessonId, editIdx, editLabel, editUrl);
    setEditIdx(null);
    refresh();
  };

  const urlHint = (url) => {
    const t = detectUrlType(url);
    return {
      youtube: "✓ YouTube — will embed automatically",
      vimeo:   "✓ Vimeo — will embed automatically",
      video:   "✓ Direct video file (.mp4)",
      iframe:  "✓ Web URL — will open in iframe",
      unknown: "",
    }[t] || "";
  };

  return (
    <div style={{padding:"16px 22px"}}>

      {/* Header */}
      <div style={{
        fontSize:12, fontWeight:700, color:C.purple,
        letterSpacing:"0.07em", textTransform:"uppercase",
        marginBottom:14,
      }}>
        📹 Manage Videos for this Lesson
      </div>

      {/* Saved videos list */}
      {videos.length === 0 ? (
        <div style={{
          padding:"14px 16px", borderRadius:9,
          background:`${C.amber}07`, border:`1px solid ${C.amber}25`,
          fontSize:12, color:C.t2, marginBottom:14,
        }}>
          No videos saved for this lesson yet. Add one below.
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:8, marginBottom:16}}>
          {videos.map((v,i) => (
            <div key={i} style={{
              background:C.cardAlt, borderRadius:10,
              border:`1px solid ${C.border}`,
              overflow:"hidden",
            }}>
              {editIdx === i ? (
                /* Edit mode */
                <div style={{padding:"12px 14px", display:"flex", flexDirection:"column", gap:8}}>
                  <input
                    value={editLabel}
                    onChange={e=>setEditLabel(e.target.value)}
                    placeholder="Display label"
                    style={{
                      background:C.code, border:`1px solid ${C.border}`,
                      borderRadius:6, padding:"7px 10px",
                      color:C.t1, fontSize:12, fontFamily:C.sans,
                      outline:"none",
                    }}
                  />
                  <input
                    value={editUrl}
                    onChange={e=>setEditUrl(e.target.value)}
                    placeholder="Video URL"
                    style={{
                      background:C.code, border:`1px solid ${C.border}`,
                      borderRadius:6, padding:"7px 10px",
                      color:C.t1, fontSize:12, fontFamily:C.mono,
                      outline:"none",
                    }}
                  />
                  <div style={{display:"flex", gap:8}}>
                    <button onClick={saveEdit} style={{...btn(),
                      padding:"6px 14px", borderRadius:6, fontSize:11, fontWeight:600,
                      background:`${C.green}15`, border:`1px solid ${C.green}50`,
                      color:C.green,
                    }}>Save</button>
                    <button onClick={()=>setEditIdx(null)} style={{...btn(),
                      padding:"6px 12px", borderRadius:6, fontSize:11,
                      background:"transparent", border:`1px solid ${C.border}`,
                      color:C.t2,
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* Display mode */
                <div style={{
                  padding:"10px 14px",
                  display:"flex", alignItems:"center", gap:10,
                }}>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{
                      fontSize:13, fontWeight:600, color:C.t1,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    }}>
                      {v.label}
                    </div>
                    <div style={{
                      fontSize:10, color:C.t3, fontFamily:C.mono, marginTop:2,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    }}>
                      {v.url}
                    </div>
                    <div style={{fontSize:10, color:C.cyan, marginTop:2}}>
                      {urlHint(v.url)}
                    </div>
                  </div>
                  <button onClick={()=>startEdit(i)} style={{...btn(),
                    padding:"5px 10px", borderRadius:6, fontSize:11,
                    background:`${C.cyan}10`, border:`1px solid ${C.cyan}30`,
                    color:C.cyan, flexShrink:0,
                  }}>Edit</button>
                  <button onClick={()=>handleRemove(i)} style={{...btn(),
                    padding:"5px 10px", borderRadius:6, fontSize:11,
                    background:`${C.red}10`, border:`1px solid ${C.red}30`,
                    color:C.red, flexShrink:0,
                  }}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new video form */}
      <div style={{
        background:C.cardAlt, borderRadius:12,
        border:`1px solid ${C.purple}30`,
        padding:"14px 16px",
      }}>
        <div style={{
          fontSize:11, fontWeight:700, color:C.purple,
          letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:10,
        }}>
          + Add Video
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          <input
            value={newLabel}
            onChange={e=>{setNewLabel(e.target.value); setError("");}}
            placeholder='Display label  e.g. "Full Lesson" or "Quick Overview"'
            style={{
              background:C.code, border:`1px solid ${C.border}`,
              borderRadius:7, padding:"8px 12px",
              color:C.t1, fontSize:12, fontFamily:C.sans,
              outline:"none",
            }}
          />

          <div>
            <input
              value={newUrl}
              onChange={e=>{setNewUrl(e.target.value); setError("");}}
              onKeyDown={e=>{ if(e.key==="Enter") handleAdd(); }}
              placeholder="Video URL — YouTube, Vimeo, or direct .mp4 link"
              style={{
                width:"100%", boxSizing:"border-box",
                background:C.code, border:`1px solid ${C.border}`,
                borderRadius:7, padding:"8px 12px",
                color:C.t1, fontSize:12, fontFamily:C.mono,
                outline:"none",
              }}
            />
            {newUrl && (
              <div style={{fontSize:10, color:C.cyan, marginTop:3, paddingLeft:2}}>
                {urlHint(newUrl)}
              </div>
            )}
          </div>

          {error && (
            <div style={{fontSize:11, color:C.red, paddingLeft:2}}>{error}</div>
          )}

          <button onClick={handleAdd} style={{...btn(),
            padding:"9px 20px", borderRadius:8, alignSelf:"flex-start",
            background:`${C.purple}18`, border:`1px solid ${C.purple}50`,
            color:C.purple, fontSize:12, fontWeight:600,
          }}>
            + Save Video
          </button>
        </div>

        {/* URL format tips */}
        <div style={{
          marginTop:12, padding:"10px 12px", borderRadius:8,
          background:`${C.cyan}06`, border:`1px solid ${C.border}`,
          fontSize:11, color:C.t2, lineHeight:1.7,
        }}>
          <div style={{fontWeight:600, color:C.cyan, marginBottom:4}}>Supported formats:</div>
          <div>🎬 YouTube: <code style={{fontFamily:C.mono,color:C.amber}}>https://youtube.com/watch?v=ID</code></div>
          <div>🎥 Vimeo: <code style={{fontFamily:C.mono,color:C.amber}}>https://vimeo.com/12345678</code></div>
          <div>📹 Direct MP4: <code style={{fontFamily:C.mono,color:C.amber}}>https://yoursite.com/video.mp4</code></div>
          <div style={{marginTop:4, color:C.t3}}>
            YouTube and Vimeo embed automatically. MP4 uses a native video player.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Steps list ────────────────────────────────────────────────────
function StepsList({ steps }) {
  if (!steps?.length) return null;
  return (
    <div style={{padding:"14px 22px", borderTop:`1px solid ${C.border}`}}>
      <div style={{
        fontSize:12, color:C.t2, fontWeight:700,
        letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:10,
      }}>
        What you'll do
      </div>
      {steps.map((step,i) => (
        <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start", marginBottom:7}}>
          <div style={{
            width:22, height:22, borderRadius:"50%", flexShrink:0, marginTop:1,
            background:`${C.cyan}12`, border:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, color:C.cyan, fontWeight:700,
          }}>{i+1}</div>
          <span style={{fontSize:13, color:C.t1, lineHeight:1.6}}>{step}</span>
        </div>
      ))}
    </div>
  );
}

// ── Teacher meta editor ───────────────────────────────────────────
function TeacherEditBanner({ lesson, onLessonOverride }) {
  const [editing, setEditing]   = useState(false);
  const [title,   setTitle]     = useState(lesson?.title||"");
  const [obj,     setObj]       = useState(lesson?.objective||"");

  const save = () => {
    try {
      const raw = localStorage.getItem("py_learn_teacher_lesson_overrides")||"{}";
      const ov  = JSON.parse(raw);
      ov[lesson.id] = {title, objective:obj};
      localStorage.setItem("py_learn_teacher_lesson_overrides", JSON.stringify(ov));
      onLessonOverride?.();
      setEditing(false);
    } catch(e){ console.error(e); }
  };

  if (!editing) return (
    <div style={{
      padding:"8px 22px", background:`${C.purple}08`,
      borderBottom:`1px solid ${C.purple}30`,
      display:"flex", alignItems:"center", gap:10,
    }}>
      <span style={{fontSize:12, color:C.purple}}>👩‍🏫 Teacher mode</span>
      <button onClick={()=>setEditing(true)} style={{...btn(),
        fontSize:11, padding:"3px 10px", borderRadius:5,
        background:`${C.purple}15`, border:`1px solid ${C.purple}40`,
        color:C.purple,
      }}>Edit title / objective</button>
    </div>
  );

  return (
    <div style={{padding:"14px 22px", background:`${C.purple}08`, borderBottom:`1px solid ${C.purple}30`}}>
      <div style={{fontSize:12, color:C.purple, fontWeight:700, marginBottom:10}}>✏️ Editing lesson meta</div>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Lesson title"
        style={{width:"100%",boxSizing:"border-box",marginBottom:8,background:C.code,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 12px",color:C.t1,fontSize:13,fontFamily:C.sans}}/>
      <textarea value={obj} onChange={e=>setObj(e.target.value)} rows={2} placeholder="Objective"
        style={{width:"100%",boxSizing:"border-box",marginBottom:8,background:C.code,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 12px",color:C.t1,fontSize:13,fontFamily:C.sans,resize:"vertical"}}/>
      <div style={{display:"flex",gap:8}}>
        <button onClick={save} style={{...btn(),padding:"7px 18px",borderRadius:6,background:`${C.purple}20`,border:`1px solid ${C.purple}`,color:C.purple,fontSize:13,fontWeight:600}}>Save</button>
        <button onClick={()=>setEditing(false)} style={{...btn(),padding:"7px 14px",borderRadius:6,background:"transparent",border:`1px solid ${C.border}`,color:C.t2,fontSize:12}}>Cancel</button>
      </div>
    </div>
  );
}

// ── MAIN LearnPanel ───────────────────────────────────────────────
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
    lessonOverridesVersion = 0,
  },
  ref,
) {
  const scrollRef = useRef(null);
  const pendingScrollRef = useRef(null);
  const scrollRequestIdRef = useRef(0);
  const [scrollRequestId, setScrollRequestId] = useState(0);
  const autoVideoDoneForLessonRef = useRef(null);

  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("read");

  const scrolled  = isTeacher || Boolean(progress?.scrolled);
  const timed     = isTeacher || Boolean(progress?.timed);
  const videoDone = isTeacher || Boolean(progress?.videoDone);
  const readDone  = scrolled && timed;
  const allDone   = readDone && videoDone;

  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const minSecs = lesson?.minReadSeconds ?? 45;

  const enrichment = useMemo(
    () => getMergedLessonContent(lessonId ?? lesson?.id ?? ""),
    [lessonId, lesson?.id, lessonOverridesVersion],
  );

  useEffect(() => {
    setElapsed(0);
    setActiveTab("read");
    autoVideoDoneForLessonRef.current = null;
  }, [lessonId]);

  useEffect(() => {
    if (isTeacher || !readDone || videoDone) return;
    if (getVideosForLesson(lessonId).length > 0) return;
    if (autoVideoDoneForLessonRef.current === lessonId) return;
    autoVideoDoneForLessonRef.current = lessonId;
    onProgressChange?.({ ...(progress ?? {}), videoDone: true });
  }, [isTeacher, readDone, videoDone, lessonId, onProgressChange, progress]);

  useEffect(() => {
    if (isTeacher||!open||activeTab!=="read"||timed) return;
    intervalRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e+1;
        if (next >= minSecs) {
          clearInterval(intervalRef.current);
          onProgressChange?.({...(progress??{}), timed:true});
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [open, activeTab, isTeacher, timed, minSecs, lessonId]);

  const onScrolledToBottom = useCallback(() => {
    if (isTeacher||scrolled) return;
    onProgressChange?.({...(progress??{}), scrolled:true});
  }, [isTeacher, scrolled, progress, onProgressChange]);

  const onVideoDone = useCallback(() => {
    if (isTeacher || videoDone) return;
    onProgressChange?.({ ...(progress ?? {}), videoDone: true });
  }, [isTeacher, videoDone, progress, onProgressChange]);

  const checkScrollBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && !scrolled && !isTeacher) {
      onProgressChange?.({ ...(progress ?? {}), scrolled: true });
    }
  }, [scrolled, isTeacher, progress, onProgressChange]);

  const runScrollToHint = useCallback((sectionHint) => {
    const root = scrollRef.current;
    if (!root) return;
    const words = normHeading(sectionHint).split(/\s+/).filter((w) => w.length > 2);
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
  }, [activeTab, open, lessonId, scrollRequestId, runScrollToHint]);

  useEffect(() => {
    if (readDone && !videoDone && activeTab === "read") setActiveTab("video");
  }, [readDone, videoDone, activeTab]);

  // Teacher sees an extra tab to manage videos
  const tabs = [
    {id:"read",   label:"📖 Reading",        locked:false},
    {id:"video",  label:"🎬 Video",           locked:!readDone},
    ...(isTeacher?[{id:"manage",label:"📹 Manage Videos",locked:false}]:[]),
  ];

  return (
    <div style={{
      background:C.card, borderRadius:12,
      border:`1px solid ${C.border}`,
      marginBottom:16, overflow:"hidden",
    }}>
      {isTeacher && (
        <div
          style={{
            padding: "8px 22px",
            background: `${C.purple}08`,
            borderBottom: `1px solid ${C.purple}30`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <TeacherLearnEditor lesson={lesson} lessonId={lessonId} onSave={onLessonOverride} />
        </div>
      )}

      {/* Panel header */}
      <div onClick={()=>setOpen(o=>!o)} style={{
        padding:"14px 22px", cursor:"pointer",
        display:"flex", alignItems:"center", gap:12,
        background:C.cardAlt, borderBottom:open?`1px solid ${C.border}`:"none",
      }}>
        <span style={{fontSize:18}}>📚</span>
        <span style={{fontSize:15, fontWeight:700, color:C.t1, flex:1}}>Learn</span>
        <div style={{display:"flex", gap:6}}>
          <GateBadge done={readDone}  label="Read"     index={1}/>
          <GateBadge done={videoDone} label="Video"    index={2}/>
          <GateBadge done={allDone}   label="Unlocked" index={3}/>
        </div>
        <span style={{fontSize:12, color:C.t3, marginLeft:8}}>{open?"▲":"▼"}</span>
      </div>

      {open && (
        <>
          {/* Tab bar */}
          <div style={{
            display:"flex", borderBottom:`1px solid ${C.border}`,
            background:C.cardAlt,
          }}>
            {tabs.map(tab => {
              const isActive = activeTab===tab.id;
              const locked   = tab.locked && !isTeacher;
              return (
                <button key={tab.id} onClick={()=>!locked&&setActiveTab(tab.id)}
                  style={{...btn(),
                    padding:"11px 18px", fontSize:13,
                    fontWeight:isActive?600:400,
                    background:"transparent",
                    borderBottom:`2px solid ${isActive?C.cyan:"transparent"}`,
                    color:locked?C.t3:tab.id==="manage"?C.purple:isActive?C.cyan:C.t2,
                    cursor:locked?"not-allowed":"pointer",
                    opacity:locked?0.45:1,
                    display:"flex", alignItems:"center", gap:6,
                  }}>
                  {tab.label}
                  {locked && <span style={{fontSize:11}}>🔒</span>}
                  {tab.id==="read"  && readDone  && <span style={{fontSize:11,color:C.green}}>✓</span>}
                  {tab.id==="video" && videoDone && <span style={{fontSize:11,color:C.green}}>✓</span>}
                </button>
              );
            })}
            <div style={{marginLeft:"auto",padding:"0 16px",display:"flex",alignItems:"center"}}>
              <span style={{
                fontSize:12,
                color:allDone?C.green:C.t3,
                fontWeight:allDone?600:400,
              }}>
                {allDone?"✅ Practice unlocked":
                 !readDone?"Step 1: Read & wait for timer":
                 "Step 2: Watch video"}
              </span>
            </div>
          </div>

          {/* ── READ TAB ── */}
          {activeTab==="read" && (
            <>
              {lesson?.concept && (
                <div style={{
                  padding:"12px 22px", background:`${C.cyan}07`,
                  borderBottom:`1px solid ${C.border}`,
                  fontSize:13, color:C.t2, lineHeight:1.65,
                }}>
                  <strong style={{color:C.cyan}}>🎯 Concept: </strong>{lesson.concept}
                </div>
              )}
              <div
                ref={scrollRef}
                onScroll={() => {
                  checkScrollBottom();
                  const el = scrollRef.current;
                  if (!el || isTeacher || scrolled) return;
                  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
                    onScrolledToBottom();
                  }
                }}
                className="learn-reading-scroll"
                style={{
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
                    __html: lesson?.materialHtml || "<p>No reading material.</p>",
                  }}
                />
                {enrichment?.sections?.length ? (
                  <div className="lesson-enrichment" style={{ marginTop: 16 }}>
                    <h3 className="lesson-enrichment-title">Guided walkthrough</h3>
                    <ol className="lesson-enrichment-sections">
                      {enrichment.sections.map((sec) => {
                        const lid = lessonId ?? lesson?.id ?? "";
                        const inlineSpec = getInlineTryMe(lid, sec.id);
                        return (
                          <li key={sec.id} className="lesson-enrichment-section">
                            <h4 className="lesson-enrichment-heading">{sec.heading}</h4>
                            {sec.body ? <p className="lesson-enrichment-body">{sec.body}</p> : null}
                            {inlineSpec ? <InlineTryMe {...inlineSpec} /> : null}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ) : null}
              </div>
              {!isTeacher && (
                <TimerBar totalSecs={minSecs} elapsed={elapsed} done={timed}/>
              )}
              {!isTeacher && !scrolled && (
                <div style={{
                  padding:"8px 22px", background:`${C.amber}08`,
                  borderTop:`1px solid ${C.amber}20`,
                  fontSize:12, color:C.amber, textAlign:"center",
                }}>
                  ↓ Scroll to the bottom of the reading to continue
                </div>
              )}
              {!isTeacher && readDone && (
                <div style={{
                  padding:"12px 22px", background:`${C.green}08`,
                  borderTop:`1px solid ${C.green}20`,
                  fontSize:13, color:C.green, fontWeight:600, textAlign:"center",
                }}>
                  ✅ Reading complete — click <strong>Video</strong> tab to continue
                </div>
              )}
              <StepsList steps={lesson?.steps}/>
            </>
          )}

          {/* ── VIDEO TAB ── */}
          {activeTab==="video" && (
            !readDone && !isTeacher ? (
              <div style={{
                padding:"48px 22px", textAlign:"center",
                display:"flex", flexDirection:"column", alignItems:"center", gap:12,
              }}>
                <span style={{fontSize:36}}>🔒</span>
                <span style={{fontSize:14, color:C.t2}}>
                  Complete the reading first.
                </span>
              </div>
            ) : (
              /* Teacher in video tab sees the player + a hint to use Manage tab */
              isTeacher ? (
                <div>
                  <StudentVideoPanel
                    lessonId={lessonId}
                    onVideoDone={()=>{}}
                    videoDone={true}
                  />
                  <div style={{
                    margin:"0 22px 16px",
                    padding:"10px 14px", borderRadius:8,
                    background:`${C.purple}08`, border:`1px solid ${C.purple}30`,
                    fontSize:12, color:C.purple,
                  }}>
                    👩‍🏫 Switch to the <strong>Manage Videos</strong> tab to add or edit videos for this lesson.
                  </div>
                </div>
              ) : (
                <StudentVideoPanel
                  lessonId={lessonId}
                  onVideoDone={onVideoDone}
                  videoDone={videoDone}
                />
              )
            )
          )}

          {/* ── MANAGE VIDEOS TAB (teacher only) ── */}
          {activeTab==="manage" && isTeacher && (
            <TeacherVideoManager lessonId={lessonId}/>
          )}

          {lesson?.checkpoint && allDone && (
            <div style={{
              padding:"12px 22px", borderTop:`1px solid ${C.border}`,
              background:`${C.green}08`,
            }}>
              <span style={{fontSize:12, color:C.green, fontWeight:700}}>✓ Checkpoint: </span>
              <span style={{fontSize:12, color:C.t1}}>{lesson.checkpoint}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default LearnPanel;
