import { recordStudentEvent } from "./utils/studentActivityStore.js";

/**
 * securityLayer.js
 * Browser content discouragement for the Cyber Python Lab.
 * Import once at the top of main.jsx: import "./securityLayer.js";
 *
 * Mitigates: print styling, some shortcuts, right click and copy on static course text,
 * blur when switching away. Cannot stop OS screenshots or screen recording.
 *
 * Monaco (.monaco-editor) is excluded so students can edit their own code.
 */

/** True when the event target is lesson/lab static code, not the live editor or console. */
function isProtectedCodeContext(node) {
  const el = node?.nodeType === 3 ? node.parentElement : node;
  if (!el?.closest) return false;
  if (el.closest(".monaco-editor") || el.closest(".editor-wrap")) return false;
  if (el.closest(".console")) return false;
  if (el.closest(".lesson-enrichment-tryme-runout")) return false;
  const inMaterial = el.closest(".material");
  const inPractice = el.closest(".practice-lab");
  if (!inMaterial && !inPractice) return false;
  return Boolean(el.closest("pre") || el.closest("code"));
}

(function injectCSS() {
  if (document.getElementById("security-layer-styles")) return;
  const style = document.createElement("style");
  style.id = "security-layer-styles";
  style.textContent = `
    @media print {
      html, body, * {
        visibility: hidden !important;
        background: #000 !important;
        color: #000 !important;
        -webkit-print-color-adjust: exact;
      }
      body::after {
        content: "⛔  Content printing is disabled.";
        visibility: visible !important;
        display: block !important;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 28px;
        font-weight: bold;
        color: #fff !important;
        background: #000 !important;
      }
    }

    .material pre,
    .material code,
    .practice-lab pre:not(.lesson-enrichment-tryme-runout-pre) {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
    }

    .lesson-enrichment-tryme-runout-pre {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      user-select: text !important;
    }

    #security-blur-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(2, 8, 20, 0.97);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 16px;
    }
    #security-blur-overlay.active {
      display: flex;
    }
    #security-blur-overlay .overlay-icon {
      font-size: 52px;
    }
    #security-blur-overlay .overlay-title {
      font-size: 22px;
      font-weight: 700;
      color: #7dcfb6;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    #security-blur-overlay .overlay-sub {
      font-size: 14px;
      color: #9fb3c9;
      font-family: ui-sans-serif, system-ui, sans-serif;
      text-align: center;
      max-width: 360px;
      line-height: 1.6;
    }
    #security-blur-overlay .overlay-btn {
      margin-top: 8px;
      padding: 11px 28px;
      background: rgba(125, 207, 182, 0.15);
      border: 1px solid rgba(125, 207, 182, 0.45);
      border-radius: 10px;
      color: #7dcfb6;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }

    #security-toast {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
      z-index: 999999;
      background: rgba(255, 54, 88, 0.15);
      border: 1px solid rgba(255, 54, 88, 0.45);
      backdrop-filter: blur(12px);
      color: #ff6b6b;
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 13px;
      font-weight: 600;
      padding: 12px 22px;
      border-radius: 10px;
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);
})();

(function createBlurOverlay() {
  function _buildOverlay() {
    if (document.getElementById("security-blur-overlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "security-blur-overlay";
    overlay.innerHTML = `
      <div class="overlay-icon">🔒</div>
      <div class="overlay-title">Session Paused</div>
      <div class="overlay-sub">
        This lab pauses when you switch away to protect course content.<br>
        Click below to resume where you left off.
      </div>
      <button type="button" class="overlay-btn" id="security-resume-btn">Resume session</button>
    `;
    document.body.appendChild(overlay);

    document.getElementById("security-resume-btn")?.addEventListener("click", () => {
      overlay.classList.remove("active");
      _logSecurityEvent("session_resumed");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _buildOverlay, { once: true });
  } else {
    _buildOverlay();
  }
})();

(function blockKeyboard() {
  const BLOCKED = new Set(["p", "s", "u"]);
  const DEVTOOLS = new Set(["i", "j", "c"]);

  document.addEventListener(
    "keydown",
    (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (ctrl && BLOCKED.has(key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        _showToast("⛔  " + _keyLabel(key) + " is disabled in this lab.");
        _logSecurityEvent("blocked_keyboard", { key: "Ctrl+" + key.toUpperCase() });
        return false;
      }

      if (e.key === "F12") {
        e.preventDefault();
        e.stopImmediatePropagation();
        _showToast("⛔  F12 is blocked in this lab.");
        _logSecurityEvent("blocked_keyboard", { key: "F12" });
        return false;
      }

      if (ctrl && shift && DEVTOOLS.has(key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        _logSecurityEvent("blocked_keyboard", { key: "Ctrl+Shift+" + key.toUpperCase() });
        return false;
      }

      if (e.key === "PrintScreen") {
        _logSecurityEvent("printscreen_attempt");
        document.body.style.visibility = "hidden";
        setTimeout(() => {
          document.body.style.visibility = "visible";
        }, 300);
      }
    },
    true
  );
})();

(function blockContextMenu() {
  document.addEventListener(
    "contextmenu",
    (e) => {
      if (isProtectedCodeContext(e.target)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        _showToast("⛔  Right-click is disabled on this course text.");
        _logSecurityEvent("blocked_rightclick");
      }
    },
    true
  );
})();

(function blockCopy() {
  document.addEventListener(
    "copy",
    (e) => {
      const sel = window.getSelection();
      if (!sel || sel.toString().length === 0) return;
      const anchor = sel.anchorNode;
      if (!anchor) return;
      const node = anchor.nodeType === 3 ? anchor.parentElement : anchor;
      if (!isProtectedCodeContext(node)) return;
      e.preventDefault();
      if (e.clipboardData) e.clipboardData.setData("text/plain", "");
      _showToast("⛔  Copying this course text is disabled. Use the editor for your own code.");
      _logSecurityEvent("blocked_copy");
    },
    true
  );
})();

(function blockDrag() {
  document.addEventListener(
    "dragstart",
    (e) => {
      if (isProtectedCodeContext(e.target)) {
        e.preventDefault();
        _logSecurityEvent("blocked_drag");
      }
    },
    true
  );
})();

function hideSecurityOverlay() {
  try {
    document.getElementById("security-blur-overlay")?.classList.remove("active");
  } catch {
    /* ignore */
  }
}

(function handleVisibility() {
  let blurTimer = null;
  const BLUR_DELAY_MS = 800;

  function scheduleBlurOverlay(reason) {
    if (blurTimer) {
      clearTimeout(blurTimer);
      blurTimer = null;
    }
    blurTimer = setTimeout(() => {
      blurTimer = null;
      document.getElementById("security-blur-overlay")?.classList.add("active");
      _logSecurityEvent(reason);
    }, BLUR_DELAY_MS);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      scheduleBlurOverlay("window_hidden");
    } else {
      if (blurTimer) {
        clearTimeout(blurTimer);
        blurTimer = null;
      }
      hideSecurityOverlay();
    }
  });

  window.addEventListener("blur", () => {
    scheduleBlurOverlay("window_blur");
  });

  window.addEventListener("focus", () => {
    if (blurTimer) {
      clearTimeout(blurTimer);
      blurTimer = null;
    }
    hideSecurityOverlay();
  });

  window.addEventListener("pageshow", hideSecurityOverlay);
})();

(function blockPrint() {
  window.addEventListener("beforeprint", (e) => {
    e.preventDefault();
    _logSecurityEvent("print_attempt");
    _showToast("⛔  Printing is disabled in this lab.");
  });
})();

(function disableCodeSelection() {
  document.addEventListener(
    "selectstart",
    (e) => {
      if (isProtectedCodeContext(e.target)) e.preventDefault();
    },
    true
  );
})();

let _toastTimeout = null;

function _showToast(message) {
  let toast = document.getElementById("security-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "security-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";

  if (_toastTimeout) clearTimeout(_toastTimeout);
  _toastTimeout = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
  }, 3000);
}

function _logSecurityEvent(type, extra = {}) {
  try {
    const events = JSON.parse(sessionStorage.getItem("security_events") || "[]");
    events.push({
      type,
      at: new Date().toISOString(),
      atLabel: new Date().toLocaleTimeString(),
      ...extra,
    });
    sessionStorage.setItem("security_events", JSON.stringify(events.slice(-200)));
  } catch {
    /* ignore */
  }

  try {
    recordStudentEvent({ type: `security_${type}`, ...extra });
  } catch {
    /* ignore */
  }
}

function _keyLabel(k) {
  return { p: "Ctrl+P (Print)", s: "Ctrl+S (Save)", u: "Ctrl+U (View Source)" }[k] || k;
}

export function getSecurityEvents() {
  try {
    return JSON.parse(sessionStorage.getItem("security_events") || "[]");
  } catch {
    return [];
  }
}

export function clearSecurityEvents() {
  sessionStorage.removeItem("security_events");
}
