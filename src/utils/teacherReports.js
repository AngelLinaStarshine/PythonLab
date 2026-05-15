// src/utils/teacherReports.js
// CSV (Excel-friendly) and printable HTML summaries for teacher dashboard.

export function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function collectColumns(events) {
  const keys = new Set([
    "id",
    "studentId",
    "studentName",
    "at",
    "atLabel",
    "type",
    "lessonId",
    "lessonTitle",
    "minutes",
    "message",
    "reason",
    "explanation",
  ]);
  for (const e of events) {
    if (e && typeof e === "object") Object.keys(e).forEach((k) => keys.add(k));
  }
  return [...keys].sort();
}

/** @param {object[]} events */
export function downloadStudentEventsCsv(events) {
  const cols = collectColumns(events);
  const lines = [cols.join(",")];
  for (const e of events) {
    lines.push(cols.map((c) => csvEscape(e?.[c])).join(","));
  }
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `student-activity-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function aggregateCounts(events) {
  const byType = {};
  const byLesson = {};
  for (const e of events || []) {
    const t = e?.type || "(none)";
    byType[t] = (byType[t] || 0) + 1;
    if (e?.lessonId) {
      const lid = e.lessonId;
      byLesson[lid] = (byLesson[lid] || 0) + 1;
    }
  }
  return { byType, byLesson };
}

function barRow(label, count, max) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const safe = escapeHtml(label);
  return `<tr><td style="padding:6px 10px;white-space:nowrap">${safe}</td><td style="padding:6px;width:55%"><div style="height:18px;background:#1a2a3d;border-radius:6px;overflow:hidden"><div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#00c8ff,#00e87a);"></div></div></td><td style="padding:6px 10px;text-align:right;font-weight:700">${count}</td></tr>`;
}

/**
 * Opens a new window with tables + bar-style graphs; use browser Print → Save as PDF.
 * @param {object[]} events
 * @param {Record<string, boolean>} masteryByLesson
 */
export function openPrintableReportWindow(events, masteryByLesson = {}) {
  const { byType, byLesson } = aggregateCounts(events);
  const maxT = Math.max(1, ...Object.values(byType));
  const maxL = Math.max(1, ...Object.values(byLesson));

  const typeRows = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => barRow(k, v, maxT))
    .join("");

  const lessonRows = Object.entries(byLesson)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => barRow(k, v, maxL))
    .join("");

  const masteryRows = Object.entries(masteryByLesson || {})
    .filter(([, v]) => v)
    .map(([id]) => `<tr><td colspan="3" style="padding:4px 10px">${escapeHtml(id)}</td></tr>`)
    .join("") || `<tr><td colspan="3" style="padding:10px;color:#8899aa">No mastery marks in this browser session.</td></tr>`;

  const rawRows = (events || [])
    .slice(-80)
    .map(
      (e) =>
        `<tr><td style="white-space:nowrap">${escapeHtml(e.atLabel || e.at)}</td><td>${escapeHtml(e.studentName || e.studentId || "")}</td><td>${escapeHtml(e.type)}</td><td>${escapeHtml(String(e.message || e.reason || e.lessonTitle || "").slice(0, 120))}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Student report</title>
  <style>
    body{font-family:system-ui,Segoe UI,sans-serif;background:#050d18;color:#e8f1ff;padding:24px;max-width:900px;margin:0 auto}
    h1{font-size:22px;margin:0 0 6px} .sub{color:#8ab4c7;font-size:13px;margin-bottom:22px}
    h2{font-size:15px;margin:22px 0 10px;color:#7dcfb6}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;padding:8px 10px;background:#0f1f33;color:#9fb3c9;font-size:11px;text-transform:uppercase}
    td{border-bottom:1px solid #1a2a3d}
    @media print{body{background:#fff;color:#111}td{border-color:#ddd}}
  </style></head><body>
  <h1>Lab activity report</h1>
  <div class="sub">Generated ${new Date().toLocaleString()} · ${events.length} raw events · Use Print → Save as PDF for a PDF copy.</div>
  <h2>Events by type</h2>
  <table><thead><tr><th>Label</th><th>Volume</th><th>Count</th></tr></thead><tbody>${typeRows || "<tr><td colspan=3>No events</td></tr>"}</tbody></table>
  <h2>Events by lesson</h2>
  <table><thead><tr><th>Lesson</th><th>Volume</th><th>Count</th></tr></thead><tbody>${lessonRows || "<tr><td colspan=3>No lesson-tagged events</td></tr>"}</tbody></table>
  <h2>Mastery (this browser)</h2>
  <table><thead><tr><th colspan="3">Lesson id</th></tr></thead><tbody>${masteryRows}</tbody></table>
  <h2>Raw event log (abbrev.)</h2>
  <table><thead><tr><th>Time</th><th>Student</th><th>Type</th><th>Detail</th></tr></thead><tbody>
  ${rawRows}
  </tbody></table>
  </body></html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
