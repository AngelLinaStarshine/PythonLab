// src/utils/videoStore.js
// Persistent video store — teacher uploads URLs per lesson (localStorage).
// Storage key: "py_learn_lesson_videos"
// Shape: { l1: [{ label, url, addedAt }], ... }

const STORAGE_KEY = "py_learn_lesson_videos";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return typeof obj === "object" && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

function save(data, lessonId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("py-learn-teacher-videos-updated", {
          detail: { storageKey: STORAGE_KEY, lessonId: lessonId || null },
        }),
      );
    }
  } catch (e) {
    console.error("videoStore save error", e);
  }
}

export function getVideosForLesson(lessonId) {
  const data = load();
  return Array.isArray(data[lessonId]) ? data[lessonId] : [];
}

export function addVideoToLesson(lessonId, label, url) {
  const trimUrl = (url || "").trim();
  const trimLabel = (label || "").trim();
  if (!trimUrl || !trimLabel) return false;

  const data = load();
  const existing = Array.isArray(data[lessonId]) ? data[lessonId] : [];
  if (existing.some((v) => v.url === trimUrl)) return false;

  existing.push({
    label: trimLabel,
    url: trimUrl,
    addedAt: new Date().toISOString(),
  });

  data[lessonId] = existing;
  save(data, lessonId);
  return true;
}

export function removeVideoFromLesson(lessonId, index) {
  const data = load();
  const existing = Array.isArray(data[lessonId]) ? data[lessonId] : [];
  data[lessonId] = existing.filter((_, i) => i !== index);
  save(data, lessonId);
}

export function updateVideoInLesson(lessonId, index, label, url) {
  const data = load();
  const existing = Array.isArray(data[lessonId]) ? data[lessonId] : [];
  if (!existing[index]) return;
  existing[index] = {
    ...existing[index],
    label: (label || "").trim() || existing[index].label,
    url: (url || "").trim() || existing[index].url,
  };
  data[lessonId] = existing;
  save(data, lessonId);
}

export function clearVideosForLesson(lessonId) {
  const data = load();
  delete data[lessonId];
  save(data, lessonId);
}

export function exportAllLessonVideos() {
  return JSON.stringify(load(), null, 2);
}

export function importAllLessonVideos(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid video pack");
  save(parsed);
  return true;
}

export function getVideoSummary() {
  const data = load();
  const lessonIds = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10"];
  return lessonIds.map((lid) => ({
    lessonId: lid,
    count: Array.isArray(data[lid]) ? data[lid].length : 0,
    videos: Array.isArray(data[lid]) ? data[lid] : [],
  }));
}

export function toEmbedUrl(url) {
  try {
    const u = url.trim();
    const shortMatch = u.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    const longMatch = u.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;

    if (u.includes("youtube.com/embed/")) return u;

    const vimeoMatch = u.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return u;
  } catch {
    return url;
  }
}

export function detectUrlType(url) {
  if (!url) return "unknown";
  const u = url.trim().toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("vimeo.com")) return "vimeo";
  if (u.includes("notebooklm")) return "notebooklm";
  if (u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".ogg")) return "video";
  if (u.startsWith("http")) return "iframe";
  return "unknown";
}

export { STORAGE_KEY as LESSON_VIDEOS_KEY };
