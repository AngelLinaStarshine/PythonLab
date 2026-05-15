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

/**
 * Student-facing YouTube embed: keep playback in-page where the player supports it
 * (fs=0 turns off the full-screen control on many embeds).
 */
export function getYouTubeStudentEmbedUrl(url) {
  const embed = getYouTubeEmbedUrl(url);
  if (!embed || !embed.includes("youtube.com/embed")) return embed || "";
  try {
    const u = new URL(embed);
    u.searchParams.set("fs", "0");
    u.searchParams.set("modestbranding", "1");
    u.searchParams.set("rel", "0");
    return u.toString();
  } catch {
    const join = embed.includes("?") ? "&" : "?";
    return `${embed}${join}fs=0&modestbranding=1&rel=0`;
  }
}

/** Drop slots with missing/invalid URLs (prevents empty rows in student & teacher pickers). */
export function filterVideosWithUrls(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((s) => {
    if (!s || typeof s !== "object") return false;
    const u = String(s.url ?? "").trim();
    if (!u || u === "undefined" || u === "null") return false;
    return true;
  });
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

/** Get list for students: only teacher-uploaded entries with a real URL. */
export function getStudentVideoSources(lessonId) {
  return filterVideosWithUrls(loadTeacherVideos(lessonId));
}

/** Teacher UI + preview: teacher list if ≥ MIN valid entries, else lesson defaults; pad only from valid defaults. */
export function getMergedVideoSources(lesson, lessonId) {
  const teacher = filterVideosWithUrls(loadTeacherVideos(lessonId));
  const defaultSources = filterVideosWithUrls(lessonOptionsToSources(lesson, lessonId));
  let merged = teacher.length >= MIN_VIDEOS_PER_LESSON ? [...teacher] : [...defaultSources];
  while (merged.length < MIN_VIDEOS_PER_LESSON && defaultSources.length > 0) {
    merged.push({
      ...defaultSources[merged.length % defaultSources.length],
      id: `fill-${lessonId}-${merged.length}`,
    });
  }
  return filterVideosWithUrls(merged);
}

export { MIN_VIDEOS_PER_LESSON };
