// Student sessions live in sessionStorage (cleared when the tab closes).
// Teachers keep their role in memory until they log out.

import { useEffect } from "react";

export function useStudentSession(_userRole) {
  useEffect(() => {
    /* sessionStorage handles tab-close cleanup; no pagehide hook needed */
  }, [_userRole]);
}
