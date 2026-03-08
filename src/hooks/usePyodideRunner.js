// src/hooks/usePyodideRunner.js
import { useCallback, useEffect, useRef, useState } from "react";

// Local copy (Canvas/Brightspace safe) — put Pyodide build in public/pyodide/
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
        setLoadingMsg("Loading Pyodide script (local)...");
        let indexURL = PYODIDE_INDEX_URL;
        try {
          await loadScript(PYODIDE_SCRIPT);
        } catch {
          setLoadingMsg("Loading Pyodide from CDN...");
          await loadScript(PYODIDE_CDN_SCRIPT);
          indexURL = PYODIDE_CDN_INDEX;
        }

        if (typeof window.loadPyodide !== "function") {
          throw new Error("Pyodide script loaded but loadPyodide is not available. If in Canvas/Brightspace, host Pyodide locally in public/pyodide/.");
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

  const run = useCallback(async (code) => {
    const pyodide = pyodideRef.current;
    if (!pyodide) return { stdout: "", error: initError || "Python runtime not ready." };

    const wrapped = `
import sys, io, traceback
_buf = io.StringIO()
_err = None
_stdout = ""
try:
    _old = sys.stdout
    sys.stdout = _buf
    exec(${JSON.stringify(code)}, {})
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
    }
  }, [initError]);

  return { ready, loadingMsg: initError ? `${loadingMsg} (${initError})` : loadingMsg, run };
}