// src/lms/scorm.js
// SCORM 1.2 wrapper (Canvas + Brightspace friendly)
// Supports basic: init, suspend_data, location, status, score, commit, finish.
// Also includes a light SCORM 2004 fallback if you ever need it.

function findScormApi(win) {
  // SCORM 1.2: window.API
  // SCORM 2004: window.API_1484_11
  let w = win;
  for (let i = 0; i < 12; i++) {
    if (!w) break;
    if (w.API) return { api: w.API, version: "1.2" };
    if (w.API_1484_11) return { api: w.API_1484_11, version: "2004" };
    try {
      w = w.parent;
    } catch {
      break; // cross-origin parent
    }
  }
  return { api: null, version: null };
}

function safeJsonParse(str, fallback) {
  try {
    if (!str || typeof str !== "string") return fallback;
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function clampScore(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

class ScormClient {
  constructor() {
    const { api, version } = findScormApi(window);
    this.api = api;
    this.version = version; // "1.2" | "2004" | null
    this.inited = false;
    this.lastError = null;
  }

  isAvailable() {
    return !!this.api && !!this.version;
  }

  init() {
    if (!this.isAvailable()) return false;
    if (this.inited) return true;

    let ok = false;
    try {
      if (this.version === "1.2") ok = this.api.LMSInitialize("") === "true";
      else ok = this.api.Initialize("") === "true";
    } catch (e) {
      this.lastError = e;
      ok = false;
    }
    this.inited = ok;
    return ok;
  }

  finish() {
    if (!this.isAvailable() || !this.inited) return false;
    try {
      if (this.version === "1.2") return this.api.LMSFinish("") === "true";
      return this.api.Terminate("") === "true";
    } catch (e) {
      this.lastError = e;
      return false;
    }
  }

  commit() {
    if (!this.isAvailable() || !this.inited) return false;
    try {
      if (this.version === "1.2") return this.api.LMSCommit("") === "true";
      return this.api.Commit("") === "true";
    } catch (e) {
      this.lastError = e;
      return false;
    }
  }

  getValue(key) {
    if (!this.isAvailable() || !this.inited) return "";
    try {
      if (this.version === "1.2") return this.api.LMSGetValue(key) ?? "";
      return this.api.GetValue(key) ?? "";
    } catch (e) {
      this.lastError = e;
      return "";
    }
  }

  setValue(key, value) {
    if (!this.isAvailable() || !this.inited) return false;
    try {
      const v = String(value ?? "");
      if (this.version === "1.2") return this.api.LMSSetValue(key, v) === "true";
      return this.api.SetValue(key, v) === "true";
    } catch (e) {
      this.lastError = e;
      return false;
    }
  }

  // ---------- SCORM 1.2 convenience ----------
  loadState() {
    // We store app state in suspend_data
    if (!this.isAvailable()) return null;
    if (!this.inited) this.init();

    if (this.version === "1.2") {
      const raw = this.getValue("cmi.suspend_data");
      return safeJsonParse(raw, null);
    }
    // 2004
    const raw = this.getValue("cmi.suspend_data");
    return safeJsonParse(raw, null);
  }

  saveState(stateObj) {
    if (!this.isAvailable()) return false;
    if (!this.inited) this.init();

    // Keep it compact. (Most LMS allow plenty, but don’t go wild.)
    const raw = JSON.stringify(stateObj ?? {});
    const max = 60000; // safe-ish; many LMS allow 64KB+; SCORM 1.2 min spec is smaller but most modern LMS allow more
    const trimmed = raw.length > max ? raw.slice(0, max) : raw;

    const ok = this.setValue("cmi.suspend_data", trimmed);
    if (ok) this.commit();
    return ok;
  }

  setLocation(lessonId) {
    if (!this.isAvailable()) return false;
    if (!this.inited) this.init();

    if (this.version === "1.2") {
      // cmi.core.lesson_location commonly used
      const ok = this.setValue("cmi.core.lesson_location", lessonId);
      if (ok) this.commit();
      return ok;
    }
    // 2004
    const ok = this.setValue("cmi.location", lessonId);
    if (ok) this.commit();
    return ok;
  }

  setScore(rawScore0to100) {
    if (!this.isAvailable()) return false;
    if (!this.inited) this.init();

    const score = clampScore(rawScore0to100);

    if (this.version === "1.2") {
      // SCORM 1.2 score
      const ok = this.setValue("cmi.core.score.raw", score);
      if (ok) this.commit();
      return ok;
    }

    // SCORM 2004 score
    const ok1 = this.setValue("cmi.score.raw", score);
    const ok2 = this.setValue("cmi.score.min", "0");
    const ok3 = this.setValue("cmi.score.max", "100");
    if (ok1 && ok2 && ok3) this.commit();
    return ok1 && ok2 && ok3;
  }

  setStatus(status) {
    // status for SCORM 1.2: incomplete/completed/passed/failed
    // status for 2004: completion_status + success_status
    if (!this.isAvailable()) return false;
    if (!this.inited) this.init();

    if (this.version === "1.2") {
      const ok = this.setValue("cmi.core.lesson_status", status);
      if (ok) this.commit();
      return ok;
    }

    // 2004 mapping
    // We'll interpret:
    // passed/failed -> success_status
    // completed/incomplete -> completion_status
    let completion = "incomplete";
    let success = "unknown";

    if (status === "completed") completion = "completed";
    if (status === "incomplete") completion = "incomplete";
    if (status === "passed") {
      completion = "completed";
      success = "passed";
    }
    if (status === "failed") {
      completion = "completed";
      success = "failed";
    }

    const ok1 = this.setValue("cmi.completion_status", completion);
    const ok2 = this.setValue("cmi.success_status", success);
    if (ok1 && ok2) this.commit();
    return ok1 && ok2;
  }

  setSessionTimeSeconds(sec) {
    // Optional (some LMS track time themselves)
    // SCORM 1.2 expects HH:MM:SS or HH:MM:SS.SS
    if (!this.isAvailable()) return false;
    if (!this.inited) this.init();

    const s = Math.max(0, Math.floor(Number(sec) || 0));
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    const formatted = `${hh}:${mm}:${ss}`;

    if (this.version === "1.2") {
      const ok = this.setValue("cmi.core.session_time", formatted);
      if (ok) this.commit();
      return ok;
    }

    // 2004 format is PT#H#M#S
    const formatted2004 = `PT${Math.floor(s / 3600)}H${Math.floor((s % 3600) / 60)}M${s % 60}S`;
    const ok = this.setValue("cmi.session_time", formatted2004);
    if (ok) this.commit();
    return ok;
  }
}

export const scorm = new ScormClient();