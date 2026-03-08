import { useEffect, useRef } from "react";

/**
 * Prototype anti-cheat:
 * - Detect tab switch / blur -> call onViolation()
 * - Block copy/paste/cut is handled in the editor component
 *
 * NOTE: "Cannot be bypassed" is impossible on the web,
 * but this is good for a prototype + classroom deterrence.
 */
export function useAntiCheat({ enabled, onViolation }) {
  const violatedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.hidden) {
        violatedRef.current = true;
        onViolation?.("Tab switch detected");
      }
    };

    const handleBlur = () => {
      violatedRef.current = true;
      onViolation?.("Window blur detected");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, onViolation]);
}