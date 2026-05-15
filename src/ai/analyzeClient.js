// Stub client for your future AI agent.
// In production: call your server (never expose keys in frontend).
export async function analyzeCode({ code, lessonId }) {
  // Example: POST /api/analyze
  // return fetch("/api/analyze", { method:"POST", headers:{...}, body: JSON.stringify({code, lessonId})}).then(r=>r.json());

  // Prototype rules-based hints (high level only; details belong in Learn reading + error Guide).
  const hints = [];
  if (/def\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/.test(code) && /pass\s*$/.test(code.trim())) {
    hints.push("Your function is still a stub. Think about what value the caller should receive back.");
  }
  if (/print\s*\(\s*["']Hello["']\s*$/.test(code)) {
    hints.push("Check that each opening bracket and quote has a matching closing one.");
  }
  if (/input\s*\(/.test(code) && !/int\s*\(|float\s*\(/.test(code)) {
    hints.push("Remember the lesson pattern: typed input from the keyboard is still text until you convert it.");
  }
  if (/for\s+\w+\s+in\s+range\(\s*\)\s*:/.test(code)) {
    hints.push("range() needs a clear stop or span of numbers; compare to the smallest working example in the reading.");
  }

  // Return one best hint (like an agent pop-up would)
  return {
    severity: hints.length ? "info" : "none",
    message: hints[0] || "",
  };
}
