// src/components/LearnPanel.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { getMergedVideoSources } from "../utils/videoUtils.js";
import TeacherVideoManager from "./TeacherVideoManager.jsx";
import TeacherLearnEditor from "./TeacherLearnEditor.jsx";

export default function LearnPanel({ lesson, progress, onProgressChange, isTeacher, lessonId, onLessonOverride }) {
  const scrollRef = useRef(null);
  const videoRef = useRef(null);
  const lastTimeRef = useRef(0);

  const [videoSourcesVersion, setVideoSourcesVersion] = useState(0);
  const videoOptions = useMemo(
    () => getMergedVideoSources(lesson, lessonId ?? lesson?.id),
    [lesson, lessonId, videoSourcesVersion]
  );
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const currentSource = videoOptions[selectedVideoIndex];
  const isEmbed = currentSource?.type === "youtube" || currentSource?.type === "notebooklm";

  const [seconds, setSeconds] = useState(0);
  const minSeconds = lesson?.minReadSeconds ?? 30;

  useEffect(() => {
    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [lesson?.id]);

  useEffect(() => {
    if (seconds >= minSeconds && !progress?.timed) {
      onProgressChange?.({ ...(progress ?? {}), timed: true });
    }
  }, [seconds, minSeconds, progress, onProgressChange]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 6;
    if (atBottom && !progress?.scrolled) {
      onProgressChange?.({ ...(progress ?? {}), scrolled: true });
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
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

  useEffect(() => {
    lastTimeRef.current = 0;
    setSelectedVideoIndex(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  }, [lesson?.id]);

  const learnComplete = useMemo(
    () => Boolean(progress?.scrolled && progress?.timed && progress?.videoDone),
    [progress]
  );

  return (
    <div className="learn-panel">
      <div
        className={`learn-banner ${learnComplete ? "ok" : ""}`}
        role="status"
        aria-live="polite"
      >
        {learnComplete ? "Practice Unlocked ✅" : "Complete all gates to unlock practice"}
      </div>

      <div className="learn-head">
        <div>
          <div className="learn-title">Learn</div>
          <div className="learn-sub">Read + watch to unlock practice.</div>
        </div>
        {isTeacher && (
          <TeacherLearnEditor
            lesson={lesson}
            lessonId={lessonId ?? lesson?.id}
            onSave={onLessonOverride}
          />
        )}
        <div className="learn-gates">
          <div className={`gate ${progress?.scrolled ? "ok" : ""}`}>Scroll ✓</div>
          <div className={`gate ${progress?.timed ? "ok" : ""}`}>
            Time ✓ ({Math.min(seconds, minSeconds)}/{minSeconds}s)
          </div>
          <div className={`gate ${progress?.videoDone ? "ok" : ""}`}>Video ✓</div>
        </div>
      </div>

      <div className="learn-body">
        <div className="material" ref={scrollRef} onScroll={onScroll}>
          <div
            className="material-inner"
            dangerouslySetInnerHTML={{
              __html: lesson?.materialHtml || "<p>Material missing.</p>",
            }}
          />
        </div>

        <div className="video-box">
          {videoOptions.length > 0 && (
            <div className="video-options">
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
              <iframe
                className="video-embed"
                src={currentSource.url}
                title={currentSource.label}
              />
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

          {(currentSource?.type === "mp4" || !currentSource?.type) && (
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
                <button type="button" className="btn" onClick={() => videoRef.current?.play()}>Play</button>
                <button type="button" className="btn ghost" onClick={() => videoRef.current?.pause()}>Pause</button>
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

          {!isEmbed && (
            <div className="video-note">Skipping is disabled. Watch to the end to unlock.</div>
          )}

          {isTeacher && (
            <TeacherVideoManager
              lessonId={lessonId ?? lesson?.id}
              lesson={lesson}
              onVideosChange={() => setVideoSourcesVersion((v) => v + 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
