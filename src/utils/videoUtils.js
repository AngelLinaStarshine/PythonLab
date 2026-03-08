// src/utils/videoUtils.js
// Helpers for multiple video sources: MP4, YouTube, NotebookLM

export const VIDEO_SOURCE_TYPES = ["mp4", "youtube", "notebooklm"];

export const TEACHER_VIDEOS_KEY = "py_learn_teacher_videos";
const MIN_VIDEOS_PER_LESSON = 5;

/** Get YouTube embed URL from watch or share URL */
export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";
  const u = url.trim();
  const m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : u;
}

/** Normalize lesson videoOptions to source shape { id, type, url, label } */
export function lessonOptionsToSources(lesson, lessonId) {
  const opts = lesson?.videoOptions ?? (lesson?.videoUrl ? [{ label: "Video", url: lesson.videoUrl }] : []);
  return opts.map((o, i) => ({
    id: `${lessonId}-default-${i}`,
    type: "mp4",
    url: o.url || "",
    label: o.label || `Video ${i + 1}`,
  }));
}

/** Load teacher-saved videos for a lesson */
export function loadTeacherVideos(lessonId) {
  try {
    const raw = localStorage.getItem(TEACHER_VIDEOS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return Array.isArray(all[lessonId]) ? all[lessonId] : [];
  } catch {
    return [];
  }
}

/** Save teacher videos for a lesson (merge with defaults not needed here; manager replaces all for that lesson) */
export function saveTeacherVideos(lessonId, sources) {
  try {
    const raw = localStorage.getItem(TEACHER_VIDEOS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[lessonId] = sources;
    localStorage.setItem(TEACHER_VIDEOS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("saveTeacherVideos", e);
  }
}

/** Get merged list: teacher videos if at least MIN, else default. Ensure min MIN_VIDEOS_PER_LESSON. */
export function getMergedVideoSources(lesson, lessonId) {
  const teacher = loadTeacherVideos(lessonId);
  const defaultSources = lessonOptionsToSources(lesson, lessonId);
  let merged = teacher.length >= MIN_VIDEOS_PER_LESSON ? [...teacher] : [...defaultSources];
  while (merged.length < MIN_VIDEOS_PER_LESSON && defaultSources.length > 0) {
    merged.push({
      ...defaultSources[merged.length % defaultSources.length],
      id: `fill-${lessonId}-${merged.length}`,
    });
  }
  return merged;
}

export { MIN_VIDEOS_PER_LESSON };
