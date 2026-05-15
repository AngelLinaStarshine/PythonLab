// src/components/TeacherVideoManager.jsx
// Teacher-only: add/remove at least 5 videos per lesson (MP4, YouTube, NotebookLM)
import { useState, useEffect } from "react";
import {
  saveTeacherVideos,
  getYouTubeEmbedUrl,
  lessonOptionsToSources,
  filterVideosWithUrls,
  getMergedVideoSources,
  getStudentVideoSources,
  sourcesForPersistence,
  MIN_VIDEOS_PER_LESSON,
} from "../utils/videoUtils.js";
import { addVideoToLesson, exportAllLessonVideos, importAllLessonVideos } from "../utils/videoStore.js";

export default function TeacherVideoManager({ lessonId, lesson, onVideosChange }) {
  const defaultSources = filterVideosWithUrls(lessonOptionsToSources(lesson, lessonId));
  const [sources, setSources] = useState(() => getMergedVideoSources(lesson, lessonId));

  const [newType, setNewType] = useState("mp4");
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [uploadObjectUrl, setUploadObjectUrl] = useState(null);
  const [uploadNotice, setUploadNotice] = useState("");
  const [packNotice, setPackNotice] = useState("");

  useEffect(() => {
    setSources(getMergedVideoSources(lesson, lessonId));
  }, [lessonId, lesson]);

  const padForTeacherDisplay = (list) => {
    let display = filterVideosWithUrls(list);
    if (display.length < MIN_VIDEOS_PER_LESSON && defaultSources.length > 0) {
      const base = [...display];
      while (base.length < MIN_VIDEOS_PER_LESSON) {
        const d = defaultSources[base.length % defaultSources.length];
        base.push({
          ...d,
          id: `fill-${lessonId}-${base.length}-${Date.now()}`,
        });
      }
      display = filterVideosWithUrls(base);
    }
    return display;
  };

  const save = (next) => {
    const persist = sourcesForPersistence(next);
    saveTeacherVideos(lessonId, persist);
    onVideosChange?.(persist);
    setSources(padForTeacherDisplay(next));
  };

  const addFromUrl = () => {
    const url = (newUrl || "").trim();
    if (!url) return;
    let finalUrl = url;
    if (newType === "youtube") finalUrl = getYouTubeEmbedUrl(url) || url;
    const label = (newLabel || "").trim() || (newType === "youtube" ? "YouTube" : newType === "notebooklm" ? "NotebookLM" : "MP4");
    const ok = addVideoToLesson(lessonId, label, finalUrl);
    if (!ok) {
      setUploadNotice("That URL is already saved for this lesson.");
      return;
    }
    setUploadNotice("");
    onVideosChange?.();
    setSources(padForTeacherDisplay(getMergedVideoSources(lesson, lessonId)));
    setNewUrl("");
    setNewLabel("");
  };

  const publishListForStudents = () => {
    const persist = sourcesForPersistence(sources);
    saveTeacherVideos(lessonId, persist);
    const count = getStudentVideoSources(lessonId, lesson).length;
    setPackNotice(
      count > 0
        ? `${count} video(s) are saved for students on this lesson (this browser).`
        : "No videos saved yet — add a YouTube, NotebookLM, or public MP4/WebM URL (file upload is preview only).",
    );
    onVideosChange?.();
    setSources(padForTeacherDisplay(getMergedVideoSources(lesson, lessonId)));
  };

  const copyVideoPack = async () => {
    try {
      const text = exportAllLessonVideos();
      await navigator.clipboard.writeText(text);
      setPackNotice("Copied all lesson videos to clipboard. Paste into Import on student devices or another browser.");
    } catch {
      setPackNotice("Could not copy — use Export download instead.");
    }
  };

  const downloadVideoPack = () => {
    const blob = new Blob([exportAllLessonVideos()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "py-learn-lesson-videos.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setPackNotice("Downloaded video pack. Students import the same file on their devices.");
  };

  const importVideoPack = () => {
    const raw = window.prompt("Paste the video pack JSON (from teacher Export):");
    if (!raw?.trim()) return;
    try {
      importAllLessonVideos(raw.trim());
      setPackNotice("Video pack imported for all lessons.");
      onVideosChange?.();
      setSources(padForTeacherDisplay(getMergedVideoSources(lesson, lessonId)));
    } catch {
      setPackNotice("Import failed — check the JSON and try again.");
    }
  };

  const addFromFile = (e, { recording = false } = {}) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;
    const prev = uploadObjectUrl;
    if (prev) URL.revokeObjectURL(prev);
    const objUrl = URL.createObjectURL(file);
    setUploadObjectUrl(objUrl);
    const baseLabel = (newLabel || "").trim() || file.name || "Uploaded video";
    const label = recording ? `Screen recording: ${baseLabel}` : baseLabel;
    save([
      ...sources,
      { id: `t-${lessonId}-${Date.now()}`, type: "mp4", url: objUrl, label },
    ]);
    setUploadNotice(
      "Preview added for you on this device only. Students need a public MP4/WebM URL, YouTube, or NotebookLM link — paste a hosted URL above, or upload the file to your site and paste that link.",
    );
    setNewLabel("");
    e.target.value = "";
  };

  const remove = (id) => {
    const revoke = sources.find((s) => s.id === id);
    if (revoke?.url?.startsWith("blob:")) URL.revokeObjectURL(revoke.url);
    save(sources.filter((s) => s.id !== id));
  };

  return (
    <div className="teacher-video-manager">
      <div className="teacher-video-manager-title">Manage videos (min {MIN_VIDEOS_PER_LESSON}), MP4, YouTube, NotebookLM</div>
      {uploadNotice ? (
        <p className="teacher-video-manager-note teacher-video-manager-notice" role="status">
          {uploadNotice}
        </p>
      ) : null}
      <p className="teacher-video-manager-note">
        <strong>Students see</strong> videos you add with <strong>Add</strong> (YouTube, NotebookLM, or public MP4/WebM
        URL). Videos are stored in <strong>this browser only</strong> unless you export the pack and students import it
        on their devices (required for Netlify/class laptops).
      </p>
      <p className="teacher-video-manager-note">
        File upload is <strong>preview only</strong> on your machine — host the file online, paste that URL, then click{" "}
        <strong>Add</strong>.
      </p>
      {packNotice ? (
        <p className="teacher-video-manager-note teacher-video-manager-notice" role="status">
          {packNotice}
        </p>
      ) : null}
      <div className="teacher-video-pack-actions" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <button type="button" className="btn ghost" onClick={publishListForStudents}>
          Save list for students
        </button>
        <button type="button" className="btn ghost" onClick={copyVideoPack}>
          Copy all lessons (clipboard)
        </button>
        <button type="button" className="btn ghost" onClick={downloadVideoPack}>
          Download pack
        </button>
        <button type="button" className="btn ghost" onClick={importVideoPack}>
          Import pack
        </button>
      </div>
      <p className="teacher-video-manager-note">
        <strong>NotebookLM:</strong> build or refine your script in{" "}
        <a href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer">
          NotebookLM
        </a>
        , then paste the <strong>share / embed link</strong> here as NotebookLM type so learners see it in-frame.
      </p>
      <div className="teacher-video-manager-form">
        <select
          className="video-select"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          aria-label="Video type"
        >
          <option value="mp4">MP4 (URL)</option>
          <option value="youtube">YouTube</option>
          <option value="notebooklm">NotebookLM</option>
        </select>
        {newType === "mp4" && (
          <span className="teacher-video-upload">
            <label className="btn ghost" style={{ marginRight: 8 }}>
              Upload file (MP4/WebM)
              <input
                type="file"
                accept="video/mp4,video/webm,video/*"
                onChange={(ev) => addFromFile(ev, { recording: false })}
                style={{ display: "none" }}
              />
            </label>
            <label className="btn ghost" style={{ marginRight: 8 }} title="Use after recording with OS or browser screen capture">
              Upload screen recording
              <input
                type="file"
                accept="video/mp4,video/webm,video/*"
                onChange={(ev) => addFromFile(ev, { recording: true })}
                style={{ display: "none" }}
              />
            </label>
          </span>
        )}
        <input
          type="url"
          className="teacher-video-url-input"
          placeholder={newType === "youtube" ? "YouTube URL" : newType === "notebooklm" ? "NotebookLM share URL" : "MP4 or video URL"}
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          aria-label="Video URL"
        />
        <input
          type="text"
          className="teacher-video-label-input"
          placeholder="Label (optional)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          aria-label="Video label"
        />
        <button type="button" className="btn" onClick={addFromUrl} disabled={!newUrl.trim()}>
          Add
        </button>
      </div>
      <ul className="teacher-video-list">
        {sources.map((s) => (
          <li key={s.id} className="teacher-video-item">
            <span className="teacher-video-item-type">{s.type}</span>
            <span className="teacher-video-item-label">{s.label}</span>
            <button
              type="button"
              className="btn ghost"
              onClick={() => remove(s.id)}
              disabled={sources.length <= 1}
              title="Remove"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
