// src/components/TeacherVideoManager.jsx
// Teacher-only: add/remove at least 5 videos per lesson (MP4, YouTube, NotebookLM)
import { useState, useEffect } from "react";
import {
  loadTeacherVideos,
  saveTeacherVideos,
  getYouTubeEmbedUrl,
  lessonOptionsToSources,
  filterVideosWithUrls,
  getMergedVideoSources,
  MIN_VIDEOS_PER_LESSON,
} from "../utils/videoUtils.js";

export default function TeacherVideoManager({ lessonId, lesson, onVideosChange }) {
  const defaultSources = filterVideosWithUrls(lessonOptionsToSources(lesson, lessonId));
  const [sources, setSources] = useState(() => getMergedVideoSources(lesson, lessonId));

  const [newType, setNewType] = useState("mp4");
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [uploadObjectUrl, setUploadObjectUrl] = useState(null);

  useEffect(() => {
    const list = getMergedVideoSources(lesson, lessonId);
    setSources(list);
    const raw = loadTeacherVideos(lessonId);
    const rawJson = JSON.stringify(raw);
    const listJson = JSON.stringify(list);
    if (rawJson !== listJson) {
      saveTeacherVideos(lessonId, list);
      onVideosChange?.(list);
    }
  }, [lessonId, lesson, onVideosChange]);

  const save = (next) => {
    let list = filterVideosWithUrls(next);
    if (list.length < MIN_VIDEOS_PER_LESSON && defaultSources.length > 0) {
      const base = [...list];
      while (base.length < MIN_VIDEOS_PER_LESSON) {
        const d = defaultSources[base.length % defaultSources.length];
        base.push({
          ...d,
          id: `fill-${lessonId}-${base.length}-${Date.now()}`,
        });
      }
      list = filterVideosWithUrls(base);
    }
    setSources(list);
    saveTeacherVideos(lessonId, list);
    onVideosChange?.(list);
  };

  const addFromUrl = () => {
    const url = (newUrl || "").trim();
    if (!url) return;
    let finalUrl = url;
    if (newType === "youtube") finalUrl = getYouTubeEmbedUrl(url) || url;
    const label = (newLabel || "").trim() || (newType === "youtube" ? "YouTube" : newType === "notebooklm" ? "NotebookLM" : "MP4");
    save([
      ...sources,
      { id: `t-${lessonId}-${Date.now()}`, type: newType, url: finalUrl, label },
    ]);
    setNewUrl("");
    setNewLabel("");
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
