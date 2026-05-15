import { createPortal } from "react-dom";

/** Render overlays on document.body (escapes topbar backdrop-filter containing block). */
export function AppPortal({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
