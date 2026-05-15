// src/hooks/usePyodideRunner.js
import { useCallback, useEffect, useRef, useState } from "react";

// Prefer a local copy in public/pyodide/ (works offline and behind strict firewalls).
const PYODIDE_INDEX_URL = "/pyodide/";
const PYODIDE_SCRIPT = "/pyodide/pyodide.js";

// Fallback CDN when local files are missing (e.g. dev without downloading Pyodide)
const PYODIDE_CDN_VERSION = "v0.29.3";
const PYODIDE_CDN_SCRIPT = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_CDN_VERSION}/full/pyodide.js`;
const PYODIDE_CDN_INDEX = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_CDN_VERSION}/full/`;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-pyodide="1"]`);
    if (existing) return resolve();

    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.pyodide = "1";
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.body.appendChild(s);
  });
}

export function usePyodideRunner() {
  const pyodideRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Loading Python runtime...");
  const [initError, setInitError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setInitError("");
        const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
        let indexURL = PYODIDE_CDN_INDEX;
        setLoadingMsg("Loading Pyodide from CDN...");
        try {
          if (isLocal) {
            setLoadingMsg("Loading Pyodide script (local)...");
            await loadScript(PYODIDE_SCRIPT);
            indexURL = PYODIDE_INDEX_URL;
          } else {
            await loadScript(PYODIDE_CDN_SCRIPT);
          }
        } catch {
          if (isLocal) {
            setLoadingMsg("Loading Pyodide from CDN...");
            await loadScript(PYODIDE_CDN_SCRIPT);
            indexURL = PYODIDE_CDN_INDEX;
          } else {
            throw new Error("Failed to load Pyodide. Check your network.");
          }
        }

        if (typeof window.loadPyodide !== "function") {
          throw new Error("Pyodide script loaded but loadPyodide is not available. Add a full Pyodide build under public/pyodide/.");
        }

        setLoadingMsg("Initializing Python...");
        const pyodide = await window.loadPyodide({
          indexURL,
        });

        if (cancelled) return;
        pyodideRef.current = pyodide;
        setReady(true);
        setLoadingMsg("Python ready ✅");
      } catch (e) {
        console.error(e);
        if (cancelled) return;
        setInitError(String(e?.message || e));
        setLoadingMsg("Failed to load Python runtime.");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(async (code, options = {}) => {
    const pyodide = pyodideRef.current;
    if (!pyodide) return { stdout: "", error: initError || "Python runtime not ready." };

    const stdinLines = Array.isArray(options.stdinLines) ? options.stdinLines.map(String) : [];
    const inputPrompts = Array.isArray(options.inputPrompts) ? options.inputPrompts.map(String) : [];
    let stdinIdx = 0;

    if (stdinLines.length || inputPrompts.length) {
      pyodide.setStdin({
        stdin() {
          if (stdinIdx < stdinLines.length) {
            const line = stdinLines[stdinIdx];
            stdinIdx += 1;
            return line;
          }
          const prompt =
            inputPrompts[stdinIdx] ??
            `Enter input ${stdinIdx + 1} (see the Input help box above for examples):`;
          stdinIdx += 1;
          if (typeof window !== "undefined" && typeof window.prompt === "function") {
            const typed = window.prompt(prompt);
            return typed ?? "";
          }
          return "";
        },
        isatty: true,
      });
    }

    const wrapped = `
import sys, io, traceback, builtins
_buf = io.StringIO()
_err = None
_stdout = ""
_stdin_lines = ${JSON.stringify(stdinLines)}
try:
    _old = sys.stdout
    sys.stdout = _buf
    _g = {"__name__": "__main__", "__builtins__": builtins}
    if _stdin_lines:
        _it = iter(_stdin_lines)
        def _mock_input(prompt=""):
            try:
                return next(_it)
            except StopIteration:
                return ""
        builtins.input = _mock_input
    exec(${JSON.stringify(code)}, _g)
except Exception:
    _err = traceback.format_exc()
finally:
    sys.stdout = _old

_stdout = _buf.getvalue()
`;

    try {
      await pyodide.runPythonAsync(wrapped);
      const stdout = pyodide.globals.get("_stdout") || "";
      const error = pyodide.globals.get("_err") || "";
      return { stdout, error };
    } catch (e) {
      return { stdout: "", error: String(e) };
    } finally {
      if (stdinLines.length || inputPrompts.length) pyodide.setStdin();
    }
  }, [initError]);

  return { ready, loadingMsg: initError ? `${loadingMsg} (${initError})` : loadingMsg, run };
}