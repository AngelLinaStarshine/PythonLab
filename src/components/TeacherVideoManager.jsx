// src/components/TeacherVideoManager.jsx
// Teacher-only: add/remove at least 5 videos per lesson (MP4, YouTube, NotebookLM)
import { useState, useEffect } from "react";
import {
  loadTeacherVideos,
  saveTeacherVideos,
  getYouTubeEmbedUrl,
  lessonOptionsToSources,
  MIN_VIDEOS_PER_LESSON,
} from "../utils/videoUtils.js";

export default function TeacherVideoManager({ lessonId, lesson, onVideosChange }) {
  const defaultSources = lessonOptionsToSources(lesson, lessonId);
  const [sources, setSources] = useState(() => {
    const saved = loadTeacherVideos(lessonId);
    return saved.length >= MIN_VIDEOS_PER_LESSON ? saved : defaultSources;
  });

  const [newType, setNewType] = useState("mp4");
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [uploadObjectUrl, setUploadObjectUrl] = useState(null);

  useEffect(() => {
    const saved = loadTeacherVideos(lessonId);
    const def = lessonOptionsToSources(lesson, lessonId);
    setSources(saved.length >= MIN_VIDEOS_PER_LESSON ? saved : def);
  }, [lessonId, lesson]);

  const save = (next) => {
    const list = next.length >= MIN_VIDEOS_PER_LESSON ? next : [...next, ...defaultSources].slice(0, MIN_VIDEOS_PER_LESSON);
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

  const addFromFile = (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;
    const prev = uploadObjectUrl;
    if (prev) URL.revokeObjectURL(prev);
    const objUrl = URL.createObjectURL(file);
    setUploadObjectUrl(objUrl);
    const label = (newLabel || "").trim() || file.name || "Uploaded MP4";
    save([
      ...sources,
      { id: `t-${lessonId}-${Date.now()}`, type: "mp4", url: objUrl, label },
    ]);
    setNewLabel("");
    e.target.value = "";
  };

  const remove = (id) => {
    const next = sources.filter((s) => s.id !== id);
    if (next.length < MIN_VIDEOS_PER_LESSON) return;
    const revoke = sources.find((s) => s.id === id);
    if (revoke?.url?.startsWith("blob:")) URL.revokeObjectURL(revoke.url);
    save(next);
  };

  return (
    <div className="teacher-video-manager">
      <div className="teacher-video-manager-title">Manage videos (min {MIN_VIDEOS_PER_LESSON}) — MP4, YouTube, NotebookLM</div>
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
              Upload MP4
              <input type="file" accept="video/mp4,video/*" onChange={addFromFile} style={{ display: "none" }} />
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
            <button type="button" className="btn ghost" onClick={() => remove(s.id)} disabled={sources.length <= MIN_VIDEOS_PER_LESSON} title="Remove">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
