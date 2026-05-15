// Clears student role when the tab closes so the next visit shows the sign-in screen.
// Teachers keep their role until they use Switch role.

import { useEffect } from "react";
import { ROLE_STORAGE_KEY } from "../components/RolePicker.jsx";

export function useStudentSession(userRole) {
  useEffect(() => {
    if (userRole !== "student") return;

    const clearStudentRole = () => {
      try {
        localStorage.removeItem(ROLE_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("pagehide", clearStudentRole);
    return () => window.removeEventListener("pagehide", clearStudentRole);
  }, [userRole]);
}
