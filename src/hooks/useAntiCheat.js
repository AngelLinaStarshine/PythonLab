// src/hooks/useAntiCheat.js
// ─────────────────────────────────────────────────────────────────
// Detects when the student switches away from the lab window.
// When triggered, calls onViolation(reason) so App.jsx can reset
// the code editor and log the event to studentActivityStore.
//
// Triggers:
//   - document visibilitychange → hidden  (tab switch, minimise)
//   - window blur                          (alt-tab, click away)
//
// Grace period: 800ms before firing. prevents false triggers
// when the student clicks between Reading and Video tabs inside
// the same page.
//
// Props:
//   enabled     . boolean (teacher can toggle off in Controls)
//   onViolation . fn(reason: string)
// ─────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";

export function useAntiCheat({ enabled, onViolation }) {
  const timerRef      = useRef(null);
  const callbackRef   = useRef(onViolation);
  const GRACE_MS      = 800;

  useEffect(() => {
    callbackRef.current = onViolation;
  }, [onViolation]);

  useEffect(() => {
    if (!enabled) return;

    function fire(reason) {
      callbackRef.current?.(reason);
    }

    function scheduleViolation(reason) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fire(reason), GRACE_MS);
    }

    function cancel() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "hidden") {
        scheduleViolation("Window blur detected");
      } else {
        cancel();
      }
    }

    function handleBlur() {
      scheduleViolation("Window blur detected");
    }

    function handleFocus() {
      cancel();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur",  handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      cancel();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur",  handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled]);
}
