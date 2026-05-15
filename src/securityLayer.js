import { recordStudentEvent } from "./utils/studentActivityStore.js";
import { ROLE_STORAGE_KEY } from "./components/RolePicker.jsx";

/**
 * securityLayer.js
 * ─────────────────────────────────────────────────────────────────
 * Maximum browser-level content protection for the Cyber Python Lab.
 *
 * Import ONCE as the very first line of src/main.jsx:
 *   import "./securityLayer";
 *
 * ✅ WHAT THIS BLOCKS                  ❌ WHAT NO BROWSER CAN BLOCK
 * ─────────────────────────────────── ────────────────────────────
 * Ctrl+P  (print)                     OS screenshots (PrtScr / ⌘⇧3)
 * Ctrl+S  (save page)                 Phone camera pointed at screen
 * Ctrl+U  (view source)               Screen recording (OBS etc.)
 * Ctrl+A  (select all)                Browser DevTools (always openable)
 * Ctrl+C  on protected content        Photographing screen physically
 * Ctrl+Shift+I/J/C  (DevTools)
 * F12  (DevTools)
 * F5 / Ctrl+R  (page refresh)
 * Right-click on protected content
 * Drag-to-copy on protected content
 * Text selection on protected content
 * Print preview (@media print → black)
 * Tab-away / window-hide blur overlay
 * DevTools panel size detection
 * PrintScreen key (screen flash)
 * ─────────────────────────────────────────────────────────────────
 */

// ─── 1. Inject CSS immediately — runs before React renders ───────
(function injectCSS() {
  const style = document.createElement("style");
  style.id = "security-layer-styles";
  style.textContent = `

    /* ══ PRINT: blackout entire page ═════════════════════════════ */
    @media print {
      html, body, * {
        visibility:        hidden !important;
        background:        #000  !important;
        color:             #000  !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body::after {
        content:    "⛔  Printing is disabled in this learning environment.";
        visibility: visible !important;
        display:    block   !important;
        position:   fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        font-size:   28px;
        font-weight: bold;
        color:       #ffffff !important;
        background:  #000000 !important;
        padding:     24px 36px;
        border:      2px solid #ff3658;
        border-radius: 12px;
      }
    }

    /* ══ GLOBAL SELECTION: disable on all lesson content ═════════ */
    .material-html,
    .material-html *,
    .material,
    .material-inner,
    .material *,
    .code-block,
    .code-block *,
    pre, code,
    .lesson-meta,
    .lesson-meta-title,
    .lesson-meta-obj,
    .learn-panel-content,
    .quiz-option,
    .lab-prompt,
    .lab-starter {
      -webkit-user-select: none !important;
      -moz-user-select:    none !important;
      -ms-user-select:     none !important;
      user-select:         none !important;
      -webkit-touch-callout: none !important;
    }

    /* ══ INPUTS: allow typing but override code-area selection ═══ */
    input, textarea, .try-me-textarea,
    .inline-try-me-input, .editor-pane textarea,
    .monaco-editor * {
      -webkit-user-select: text !important;
      user-select:         text !important;
    }

    /* ══ BLUR OVERLAY ════════════════════════════════════════════ */
    #security-blur-overlay {
      display:          none;
      position:         fixed;
      inset:            0;
      z-index:          99999;
      background:       rgba(2, 8, 20, 0.97);
      backdrop-filter:  blur(28px);
      -webkit-backdrop-filter: blur(28px);
      align-items:      center;
      justify-content:  center;
      flex-direction:   column;
      gap:              16px;
    }
    #security-blur-overlay.active { display: flex; }
    #security-blur-overlay .ov-icon  { font-size: 56px; }
    #security-blur-overlay .ov-title { font-size: 22px; font-weight: 700; color: #00c8ff; font-family: 'DM Sans', sans-serif; }
    #security-blur-overlay .ov-sub   { font-size: 14px; color: #4e7090; font-family: 'DM Sans', sans-serif; text-align: center; max-width: 340px; line-height: 1.65; }
    #security-blur-overlay .ov-btn   { margin-top: 8px; padding: 11px 28px; background: rgba(0,200,255,0.12); border: 1px solid rgba(0,200,255,0.4); border-radius: 8px; color: #00c8ff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

    /* ══ DEVTOOLS WARNING BANNER ═════════════════════════════════ */
    #devtools-warning {
      display: none;
      position: fixed; top: 0; left: 0; right: 0; z-index: 99998;
      background: rgba(255,54,88,0.15); border-bottom: 1px solid rgba(255,54,88,0.4);
      padding: 8px 20px; font-size: 13px; color: #ff3658;
      font-family: 'DM Sans', sans-serif; text-align: center;
    }
    #devtools-warning.active { display: block; }

    /* ══ SECURITY TOAST ══════════════════════════════════════════ */
    #security-toast {
      position:    fixed;
      bottom:      28px;
      left:        50%;
      transform:   translateX(-50%) translateY(20px);
      opacity:     0;
      z-index:     999999;
      background:  rgba(255,54,88,0.15);
      border:      1px solid rgba(255,54,88,0.5);
      backdrop-filter: blur(12px);
      color:       #ff3658;
      font-family: 'DM Sans', sans-serif;
      font-size:   13px;
      font-weight: 600;
      padding:     12px 22px;
      border-radius: 10px;
      pointer-events: none;
      transition:  opacity 0.25s ease, transform 0.25s ease;
      white-space: nowrap;
    }

    /* ══ DRAG PREVENTION ══════════════════════════════════════════ */
    .material-html img,
    .material-html table,
    pre, code, .code-block {
      -webkit-user-drag: none;
      user-drag: none;
      pointer-events: none;
    }

    /* Re-allow pointer on buttons and links inside material */
    .material-html a,
    .material-html button {
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);
})();


// ─── 2. Build DOM overlays after page loads ───────────────────────
(function buildOverlays() {
  function _build() {
    // Blur overlay
    const overlay = document.createElement("div");
    overlay.id = "security-blur-overlay";
    overlay.innerHTML = `
      <div class="ov-icon">🔒</div>
      <div class="ov-title">Session Paused</div>
      <div class="ov-sub">
        This lab pauses when you switch away to protect course content.<br>
        Click below to resume your session.
      </div>
      <button class="ov-btn" id="security-resume-btn">Resume Session →</button>
    `;
    document.body.appendChild(overlay);
    document.getElementById("security-resume-btn")
      .addEventListener("click", () => {
        overlay.classList.remove("active");
        _log("session_resumed");
      });

    // DevTools banner
    const banner = document.createElement("div");
    banner.id = "devtools-warning";
    banner.textContent =
      "⚠️  Developer tools detected. Code cannot be copied from this environment.";
    document.body.appendChild(banner);

    // Toast
    const toast = document.createElement("div");
    toast.id = "security-toast";
    document.body.appendChild(toast);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _build);
  } else {
    _build();
  }
})();


// ─── 3. Keyboard: block print / save / source / select / DevTools ─
(function blockKeyboard() {
  // Keys blocked with Ctrl/Cmd
  const CTRL_BLOCKED = new Set(["p","s","u","a"]);
  // Keys blocked with Ctrl+Shift
  const CTRL_SHIFT_BLOCKED = new Set(["i","j","c","s"]);
  // Standalone blocked keys
  const STANDALONE_BLOCKED = new Set(["F12","F5"]);

  const LABELS = {
    p:"Ctrl+P (Print)", s:"Ctrl+S (Save)", u:"Ctrl+U (View Source)",
    a:"Ctrl+A (Select All)",
  };

  document.addEventListener("keydown", (e) => {
    const ctrl  = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const key   = e.key?.toLowerCase();
    const raw   = e.key;

    // ── Standalone: F12, F5 ──
    if (STANDALONE_BLOCKED.has(raw)) {
      e.preventDefault(); e.stopImmediatePropagation();
      raw === "F12"
        ? _toast("⛔  Developer tools are disabled in this lab.")
        : _toast("⛔  Page refresh is disabled during a session.");
      _log("blocked_keyboard", { key: raw });
      return false;
    }

    // ── Ctrl+R (refresh) ──
    if (ctrl && key === "r") {
      e.preventDefault(); e.stopImmediatePropagation();
      _toast("⛔  Page refresh is disabled during a session.");
      _log("blocked_keyboard", { key: "Ctrl+R" });
      return false;
    }

    // ── Ctrl+P / S / U / A ──
    if (ctrl && !shift && CTRL_BLOCKED.has(key)) {
      e.preventDefault(); e.stopImmediatePropagation();
      _toast(`⛔  ${LABELS[key] || "Ctrl+" + key.toUpperCase()} is disabled.`);
      _log("blocked_keyboard", { key: "Ctrl+" + key.toUpperCase() });
      return false;
    }

    // ── Ctrl+Shift+I/J/C/S (DevTools, Console, Sources) ──
    if (ctrl && shift && CTRL_SHIFT_BLOCKED.has(key)) {
      e.preventDefault(); e.stopImmediatePropagation();
      _log("blocked_keyboard", { key: `Ctrl+Shift+${key.toUpperCase()}` });
      return false;
    }

    // ── PrintScreen — OS-level, can't fully block, flash the screen ──
    if (raw === "PrintScreen") {
      _log("printscreen_attempt");
      document.body.style.visibility = "hidden";
      setTimeout(() => { document.body.style.visibility = "visible"; }, 350);
    }
  }, true); // capture phase
})();


// ─── 4. Block right-click on ALL lesson content ───────────────────
(function blockContextMenu() {
  const PROTECTED = [
    "pre","code",".code-block",".material-html",
    ".lesson-meta",".lab-prompt",".quiz-option",
  ];

  document.addEventListener("contextmenu", (e) => {
    const t = e.target;
    const isProtected = PROTECTED.some(sel => {
      try { return t.closest(sel); } catch { return false; }
    });
    if (isProtected) {
      e.preventDefault(); e.stopImmediatePropagation();
      _toast("⛔  Right-click is disabled on course content.");
      _log("blocked_rightclick");
    }
  }, true);
})();


// ─── 5. Block Ctrl+C / copy event on ALL protected areas ─────────
(function blockCopy() {
  document.addEventListener("copy", (e) => {
    const sel = window.getSelection();
    if (!sel || !sel.toString().length) return;

    const anchor = sel.anchorNode;
    const el     = anchor
      ? anchor.nodeType === 3 ? anchor.parentElement : anchor
      : null;
    if (!el) return;

    const PROTECTED = [
      "pre","code",".code-block",".material-html",
      ".lesson-meta",".lab-prompt",".quiz-option",".quiz-question",
    ];
    const isProtected = PROTECTED.some(sel => {
      try { return el.closest(sel); } catch { return false; }
    });

    if (isProtected) {
      e.preventDefault();
      if (e.clipboardData) e.clipboardData.setData("text/plain", "");
      _toast("⛔  Copying course content is disabled. Type it yourself!");
      _log("blocked_copy");
    }
  }, true);
})();


// ─── 6. Block drag-to-copy from protected areas ───────────────────
(function blockDrag() {
  document.addEventListener("dragstart", (e) => {
    const t = e.target;
    const PROTECTED = ["pre","code",".code-block",".material-html"];
    const isProtected = PROTECTED.some(sel => {
      try { return t.closest(sel); } catch { return false; }
    });
    if (isProtected) {
      e.preventDefault(); e.stopImmediatePropagation();
      _log("blocked_drag");
    }
  }, true);
})();


// ─── 7. Block text selection via mouse on protected areas ─────────
(function blockSelection() {
  document.addEventListener("selectstart", (e) => {
    const t = e.target;
    // Allow in inputs, textareas, Monaco editor
    if (
      t.tagName === "INPUT"    ||
      t.tagName === "TEXTAREA" ||
      t.closest(".monaco-editor") ||
      t.closest(".try-me-textarea") ||
      t.closest(".inline-try-me-input")
    ) return;

    const PROTECTED = [
      "pre","code",".code-block",".material-html",
      ".lesson-meta",".quiz-option",".lab-prompt",
    ];
    const isProtected = PROTECTED.some(sel => {
      try { return t.closest(sel); } catch { return false; }
    });
    if (isProtected) e.preventDefault();
  }, true);
})();


// ─── 8. Tab-away / window-hide blur overlay (student only) ────────
(function handleVisibility() {
  let blurTimer = null;
  const GRACE_MS = 1200; // grace period so switching Reading→Video tab doesn't trigger

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      blurTimer = setTimeout(() => {
        _showOverlay();
        _log("window_hidden");
      }, GRACE_MS);
    } else {
      if (blurTimer) clearTimeout(blurTimer);
    }
  });

  window.addEventListener("blur", () => {
    blurTimer = setTimeout(() => {
      _showOverlay();
      _log("window_blur");
    }, GRACE_MS);
  });

  window.addEventListener("focus", () => {
    if (blurTimer) clearTimeout(blurTimer);
  });

  function _showOverlay() {
    try {
      if (localStorage.getItem(ROLE_STORAGE_KEY) === "teacher") return;
    } catch {
      /* ignore */
    }
    const o = document.getElementById("security-blur-overlay");
    if (o) o.classList.add("active");
  }
})();


// ─── 9. @media print: beforeprint event ──────────────────────────
(function blockPrint() {
  window.addEventListener("beforeprint", (e) => {
    _log("print_attempt");
    _toast("⛔  Printing is disabled in this lab.");
  });
})();


// ─── 10. DevTools panel size detection ───────────────────────────
(function detectDevTools() {
  const THRESHOLD = 160;
  let devOpen     = false;

  function check() {
    const widthDiff  = window.outerWidth  - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const isOpen     = widthDiff > THRESHOLD || heightDiff > THRESHOLD;

    if (isOpen && !devOpen) {
      devOpen = true;
      const b = document.getElementById("devtools-warning");
      if (b) b.classList.add("active");
      _log("devtools_opened");
    } else if (!isOpen && devOpen) {
      devOpen = false;
      const b = document.getElementById("devtools-warning");
      if (b) b.classList.remove("active");
    }
  }

  window.addEventListener("resize", check);
  setInterval(check, 1500);
})();


// ─── 11. Toast helper ─────────────────────────────────────────────
let _toastTimer = null;

function _toast(message) {
  const el = document.getElementById("security-toast");
  if (!el) return;
  el.textContent = message;
  el.style.opacity   = "1";
  el.style.transform = "translateX(-50%) translateY(0)";

  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.style.opacity   = "0";
    el.style.transform = "translateX(-50%) translateY(20px)";
  }, 3200);
}


// ─── 12. Security event logger ────────────────────────────────────
function _log(type, extra = {}) {
  try {
    const events = JSON.parse(sessionStorage.getItem("security_events") || "[]");
    events.push({
      type,
      at:      new Date().toISOString(),
      atLabel: new Date().toLocaleTimeString(),
      ...extra,
    });
    sessionStorage.setItem("security_events", JSON.stringify(events.slice(-200)));
  } catch (_) {}

  try {
    recordStudentEvent({ type: `security_${type}`, ...extra });
  } catch (_) {}
}


// ─── Exports ──────────────────────────────────────────────────────
export function getSecurityEvents() {
  try { return JSON.parse(sessionStorage.getItem("security_events") || "[]"); }
  catch { return []; }
}
export function clearSecurityEvents() {
  sessionStorage.removeItem("security_events");
}
