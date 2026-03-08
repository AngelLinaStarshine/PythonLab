// Stub client for your future AI agent.
// In production: call your server (never expose keys in frontend).
export async function analyzeCode({ code, lessonId }) {
  // Example: POST /api/analyze
  // return fetch("/api/analyze", { method:"POST", headers:{...}, body: JSON.stringify({code, lessonId})}).then(r=>r.json());

  // Prototype rules-based hints (safe placeholder):
  const hints = [];
  if (/def\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/.test(code) && /pass\s*$/.test(code.trim())) {
    hints.push("You defined a function but left `pass`. Try returning a value.");
  }
  if (/print\s*\(\s*["']Hello["']\s*$/.test(code)) {
    hints.push("Looks like a missing closing parenthesis or quote.");
  }
  if (/input\s*\(/.test(code) && !/int\s*\(|float\s*\(/.test(code)) {
    hints.push("Remember: input() returns a string. Convert it with int() or float() when needed.");
  }
  if (/for\s+\w+\s+in\s+range\(\s*\)\s*:/.test(code)) {
    hints.push("range() needs at least one number: range(10) or range(start, end).");
  }

  // Return one best hint (like an agent pop-up would)
  return {
    severity: hints.length ? "info" : "none",
    message: hints[0] || "",
  };
}