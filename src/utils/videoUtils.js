// src/utils/videoUtils.js
// Bridges lesson video UI to videoStore.js (canonical storage).

import {
  getVideosForLesson,
  addVideoToLesson,
  clearVideosForLesson,
  detectUrlType,
  toEmbedUrl,
  LESSON_VIDEOS_KEY,
} from "./videoStore.js";

export const VIDEO_SOURCE_TYPES = ["mp4", "youtube", "notebooklm"];
export const TEACHER_VIDEOS_KEY = LESSON_VIDEOS_KEY;
export const MIN_VIDEOS_PER_LESSON = 5;

const LEGACY_TEACHER_KEY = "py_learn_teacher_videos";
const MIGRATE_FLAG = "py_learn_videos_migrated_v1";

export function getYouTubeEmbedUrl(url) {
  return toEmbedUrl(url) || "";
}

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

export function filterVideosWithUrls(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((s) => {
    if (!s || typeof s !== "object") return false;
    const u = String(s.url ?? "").trim();
    if (!u || u === "undefined" || u === "null") return false;
    return true;
  });
}

export function lessonOptionsToSources(lesson, lessonId) {
  const opts = lesson?.videoOptions ?? (lesson?.videoUrl ? [{ label: "Video", url: lesson.videoUrl }] : []);
  return opts.map((o, i) => ({
    id: `${lessonId}-default-${i}`,
    type: "mp4",
    url: o.url || "",
    label: o.label || `Video ${i + 1}`,
  }));
}

function migrateLegacyVideos() {
  try {
    if (localStorage.getItem(MIGRATE_FLAG)) return;
    const raw = localStorage.getItem(LEGACY_TEACHER_KEY);
    if (!raw) {
      localStorage.setItem(MIGRATE_FLAG, "1");
      return;
    }
    const legacy = JSON.parse(raw);
    if (legacy && typeof legacy === "object") {
      for (const [lessonId, arr] of Object.entries(legacy)) {
        if (!Array.isArray(arr)) continue;
        for (const s of arr) {
          const url = String(s?.url ?? "").trim();
          const label = String(s?.label ?? "Video").trim();
          if (url && label && isPersistableVideoUrl(url)) {
            addVideoToLesson(lessonId, label, url);
          }
        }
      }
    }
    localStorage.setItem(MIGRATE_FLAG, "1");
  } catch (e) {
    console.warn("migrateLegacyVideos", e);
  }
}

function sourceTypeFromUrl(url) {
  const t = detectUrlType(url);
  if (t === "youtube") return "youtube";
  if (t === "notebooklm") return "notebooklm";
  return "mp4";
}

function videoEntryToSource(v, lessonId, index) {
  return {
    id: `t-${lessonId}-${index}-${String(v.addedAt || index).slice(-8)}`,
    type: sourceTypeFromUrl(v.url),
    url: v.url,
    label: v.label,
  };
}

export function isTeacherAddedSource(source) {
  return Boolean(source?.id && String(source.id).startsWith("t-"));
}

export function isPersistableVideoUrl(url) {
  const u = String(url ?? "").trim();
  if (!u || u === "undefined" || u === "null") return false;
  if (u.startsWith("blob:")) return false;
  return true;
}

/** Persist every real URL in the teacher list (not padded fill slots or blob previews). */
export function sourcesForPersistence(sources) {
  if (!Array.isArray(sources)) return [];
  const seen = new Set();
  return filterVideosWithUrls(sources).filter((s) => {
    if (String(s.id || "").startsWith("fill-")) return false;
    if (!isPersistableVideoUrl(s.url)) return false;
    const key = String(s.url).trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function loadTeacherVideos(lessonId) {
  migrateLegacyVideos();
  return getVideosForLesson(lessonId).map((v, i) => videoEntryToSource(v, lessonId, i));
}

export function saveTeacherVideos(lessonId, sources) {
  clearVideosForLesson(lessonId);
  for (const s of sourcesForPersistence(sources)) {
    addVideoToLesson(lessonId, s.label || "Video", s.url);
  }
}

/** Students: teacher-saved videos, plus bundled lesson MP4s when none are saved yet. */
export function getStudentVideoSources(lessonId, lesson) {
  migrateLegacyVideos();
  const saved = filterVideosWithUrls(
    getVideosForLesson(lessonId).map((v, i) => videoEntryToSource(v, lessonId, i)),
  ).filter((s) => isPersistableVideoUrl(s.url));

  const defaults = lesson
    ? filterVideosWithUrls(lessonOptionsToSources(lesson, lessonId)).filter((s) =>
        isPersistableVideoUrl(s.url),
      )
    : [];

  if (saved.length === 0) return defaults;

  const urls = new Set(saved.map((s) => String(s.url).trim()));
  const extra = defaults.filter((d) => !urls.has(String(d.url).trim()));
  return [...saved, ...extra];
}

/** Teacher preview: saved videos, or lesson defaults padded for the manager UI. */
export function getMergedVideoSources(lesson, lessonId) {
  const saved = getStudentVideoSources(lessonId, lesson);
  if (saved.length > 0) return saved;

  const defaultSources = filterVideosWithUrls(lessonOptionsToSources(lesson, lessonId));
  let merged = [...defaultSources];
  while (merged.length < MIN_VIDEOS_PER_LESSON && defaultSources.length > 0) {
    merged.push({
      ...defaultSources[merged.length % defaultSources.length],
      id: `fill-${lessonId}-${merged.length}`,
    });
  }
  return filterVideosWithUrls(merged);
}

export { detectUrlType, toEmbedUrl, getVideosForLesson };
