// Resolves teacher passcode: build env → public/app-config.json → classroom default.

const BUILD_PASSCODE = String(import.meta.env.VITE_TEACHER_PASSCODE ?? "").trim();

/** Used when no env var and no app-config.json (classroom demo). Change in app-config.json for production. */
export const DEFAULT_TEACHER_PASSCODE = "teacher123";

let cached = null;

export async function resolveTeacherPasscode() {
  if (cached) return cached;

  if (BUILD_PASSCODE) {
    cached = { passcode: BUILD_PASSCODE, source: "env" };
    return cached;
  }

  try {
    const res = await fetch("/app-config.json", { cache: "no-cache" });
    if (res.ok) {
      const cfg = await res.json();
      const fromFile = String(cfg?.teacherPasscode ?? "").trim();
      if (fromFile) {
        cached = { passcode: fromFile, source: "config" };
        return cached;
      }
    }
  } catch {
    /* ignore */
  }

  cached = { passcode: DEFAULT_TEACHER_PASSCODE, source: "default" };
  return cached;
}

export function clearTeacherPasscodeCache() {
  cached = null;
}
