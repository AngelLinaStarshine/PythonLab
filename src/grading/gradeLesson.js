// src/grading/gradeLesson.js
// STRICT-ish Auto-grading for lessons l1..l10
// - Runs hidden tests (mock input when needed)
// - Checks required code patterns (must use the concept)
// - Uses robust stdout checks (not overly brittle)
// - Blocks obvious hardcoding / bypass patterns

function norm(s) {
  return String(s ?? "").replace(/\r\n/g, "\n").trim();
}

function hasRegex(code, re) {
  return re.test(String(code ?? ""));
}

function missing(message, details = {}) {
  return { ok: false, score: 0, message, details };
}

function pass(message, details = {}) {
  return { ok: true, score: 100, message, details };
}

function assertNoRuntimeCrash(error) {
  if (error && String(error).trim()) {
    return missing("Your code crashed. Fix the error first.", { error });
  }
  return null;
}

/**
 * Anti-cheat: basic but effective
 */
function antiCheat(code, expectedOutLines = []) {
  const c = String(code ?? "");

  // Block redefining input()
  if (hasRegex(c, /^\s*def\s+input\s*\(/m)) {
    return missing("Do not redefine input(). Use Python’s input() as-is.");
  }

  // Block eval/exec
  if (hasRegex(c, /\b(eval|exec)\s*\(/)) {
    return missing("Do not use eval() or exec() in this lab.");
  }

  // Block hardcoding expected output lines
  const literals = expectedOutLines.filter((x) => String(x).length >= 6);
  if (literals.length >= 2) {
    const hitCount = literals.reduce((acc, line) => acc + (c.includes(line) ? 1 : 0), 0);
    if (hitCount >= Math.min(3, literals.length)) {
      return missing("Looks like you hardcoded the expected output. Compute it instead.");
    }
  }

  return null;
}

/**
 * Wrap user code with deterministic mocked inputs
 */
export function wrapWithMockInputs(pyCode, inputs = []) {
  const safeInputs = inputs.map((x) =>
    String(x).replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  );

  const header = `# --- AUTOGRADER INPUT HARNESS ---
__inputs = iter([${safeInputs.map((x) => `"${x}"`).join(", ")}])
def input(prompt=""):
    try:
        return next(__inputs)
    except StopIteration:
        return ""
# --- END HARNESS ---
`;
  return header + "\n" + (pyCode ?? "");
}

/**
 * Code concept checks
 */
function requirePatterns(code, patterns, messageIfFail) {
  const c = String(code ?? "");
  const missingOnes = patterns.filter((re) => !re.test(c));
  if (missingOnes.length) {
    return missing(messageIfFail, { missing: missingOnes.map(String) });
  }
  return null;
}

/**
 * Robust stdout checks
 * (so students aren't punished for tiny formatting differences)
 */
function stdoutMustContain(stdout, needles, messageIfFail) {
  const out = norm(stdout).toLowerCase();
  const missingNeedles = needles.filter((n) => !out.includes(String(n).toLowerCase()));
  if (missingNeedles.length) {
    return missing(messageIfFail, { missing: missingNeedles, stdout: norm(stdout) });
  }
  return null;
}

function stdoutMustMatchRegex(stdout, regexList, messageIfFail) {
  const out = norm(stdout);
  const failed = regexList.filter((re) => !re.test(out));
  if (failed.length) {
    return missing(messageIfFail, { failed: failed.map(String), stdout: out });
  }
  return null;
}

/* -----------------------------
   Lesson 1 strict type checks
----------------------------- */

function stripComments(code = "") {
  return code
    .split("\n")
    .map((line) => line.replace(/#.*$/, "")) // remove python comments
    .join("\n");
}

function findAssignment(code, varName) {
  // matches: username = "Ava"  OR username="Ava"
  const re = new RegExp(`\\b${varName}\\s*=\\s*([^\\n]+)`, "m");
  const m = code.match(re);
  return m ? m[1].trim() : "";
}

function isQuotedString(expr) {
  // Accept "text" or 'text'
  return /^(['"])(.*)\1$/.test(expr.trim());
}

function isInt10or11(expr) {
  // Must be exactly 10 or 11 (no quotes)
  return /^(10|11)$/.test(expr.trim());
}

function isBooleanTF(expr) {
  // Must be exactly True or False (capitalized, no quotes)
  return /^(True|False)$/.test(expr.trim());
}

function hasPrintUsingVars(code) {
  const c = String(code ?? "");
  const hasPrint = /\bprint\s*\(/.test(c);
  const usesUsername = /\busername\b/.test(c);
  const usesGrade = /\bgrade\b/.test(c);
  const uses2fa = /\btwo_factor_enabled\b/.test(c);
  return hasPrint && usesUsername && usesGrade && uses2fa;
}

/* -----------------------------
   TESTS CONFIG (l1..l10)
----------------------------- */

const TESTS = {
  // ✅ Lesson 1: Flexible values, strict types
  l1: {
    inputs: [],
    expectedStdoutLines: [], // not used (we grade by code rules)
    requiredPatterns: [
      /\busername\s*=/,
      /\bgrade\s*=/,
      /\btwo_factor_enabled\s*=/,
      /\bprint\s*\(/,
    ],
    grade: ({ code, stdout, error }) => {
      const crash = assertNoRuntimeCrash(error);
      if (crash) return crash;

      const req = requirePatterns(
        code,
        TESTS.l1.requiredPatterns,
        "Lesson 1 requires variables (username, grade, two_factor_enabled) and print()."
      );
      if (req) return req;

      const clean = stripComments(code || "");

      const usernameExpr = findAssignment(clean, "username");
      const gradeExpr = findAssignment(clean, "grade");
      const twoFAExpr = findAssignment(clean, "two_factor_enabled");

      if (!usernameExpr || !gradeExpr || !twoFAExpr) {
        return missing("Define all three variables: username, grade, two_factor_enabled.");
      }

      if (!isQuotedString(usernameExpr)) {
        return missing('username must be a string in quotes. Example: username = "Ava"');
      }

      if (!isInt10or11(gradeExpr)) {
        return missing("grade must be 10 or 11 as a number (no quotes). Example: grade = 10");
      }

      if (!isBooleanTF(twoFAExpr)) {
        return missing(
          "two_factor_enabled must be True or False (capital T/F, no quotes). Example: two_factor_enabled = True"
        );
      }

      if (!hasPrintUsingVars(clean)) {
        return missing("Use print() and include username, grade, and two_factor_enabled in the output.");
      }

      return pass("Mastered ✅ Lesson 1 strict type rules passed.");
    },
  },

  // Lesson 2: Input & Output (phishing checker style)
  l2: {
    inputs: ["Click this now!", "85"],
    expectedStdoutLines: ["message:", "risk:", "label:"], // used for anti-cheat + contains checks
    requiredPatterns: [/\binput\s*\(/, /\bint\s*\(/, /\bprint\s*\(/],
    grade: ({ code, stdout, error }) => {
      const crash = assertNoRuntimeCrash(error);
      if (crash) return crash;

      const ac = antiCheat(code, TESTS.l2.expectedStdoutLines);
      if (ac) return ac;

      const req = requirePatterns(
        code,
        TESTS.l2.requiredPatterns,
        "Lesson 2 requires input() + int() conversion + print()."
      );
      if (req) return req;

      // Must show message + risk + label; label should indicate high risk
      const contains = stdoutMustContain(
        stdout,
        ["message", "risk", "label"],
        "Output should include message, risk, and label."
      );
      if (contains) return contains;

      const labelOk = stdoutMustMatchRegex(
        stdout,
        [/label\s*:\s*(high|high risk)/i],
        'Label should show HIGH / HIGH RISK when risk is 85.'
      );
      if (labelOk) return labelOk;

      return pass("Mastered ✅ Lesson 2 passed.");
    },
  },

  // Lesson 3: Conditionals (login guard)
  l3: {
    inputs: [],
    expectedStdoutLines: ["weak", "2fa"],
    requiredPatterns: [/^\s*if\s+/m, /len\s*\(/, /\bprint\s*\(/],
    grade: ({ code, stdout, error }) => {
      const crash = assertNoRuntimeCrash(error);
      if (crash) return crash;

      const ac = antiCheat(code, TESTS.l3.expectedStdoutLines);
      if (ac) return ac;

      const req = requirePatterns(
        code,
        TESTS.l3.requiredPatterns,
        "Lesson 3 requires if/else and len() for password strength."
      );
      if (req) return req;

      // Output can vary; just ensure it prints something about weak/2FA
      const out = norm(stdout).toLowerCase();
      if (out && !(out.includes("weak") || out.includes("2fa") || out.includes("enable"))) {
        return missing("Your output should indicate password strength and 2FA status.", { stdout: norm(stdout) });
      }

      return pass("Mastered ✅ Lesson 3 passed.");
    },
  },

  // Lesson 4: Loops (count suspicious)
  l4: {
    inputs: [],
    expectedStdoutLines: ["total suspicious"],
    requiredPatterns: [/\bfor\s+\w+\s+in\s+/m, /\brange\s*\(/, /\bprint\s*\(/],
    grade: ({ code, stdout, error }) => {
      const crash = assertNoRuntimeCrash(error);
      if (crash) return crash;

      const ac = antiCheat(code, TESTS.l4.expectedStdoutLines);
      if (ac) return ac;

      const req = requirePatterns(code, TESTS.l4.requiredPatterns, "Lesson 4 requires a for-loop with range() and print().");
      if (req) return req;

      const contains = stdoutMustContain(stdout, ["suspicious"], "Output should mention suspicious events or the suspicious count.");
      if (contains) return contains;

      return pass("Mastered ✅ Lesson 4 passed.");
    },
  },

  // Lesson 5: Functions (risk scoring)
  l5: {
    inputs: [],
    expectedStdoutLines: ["risk", "label"],
    requiredPatterns: [/^\s*def\s+\w+\s*\(/m, /\breturn\b/, /\bprint\s*\(/],
    grade: ({ code, stdout, error }) => {
      const crash = assertNoRuntimeCrash(error);
      if (crash) return crash;

      const ac = antiCheat(code, TESTS.l5.expectedStdoutLines);
      if (ac) return ac;

      const req = requirePatterns(code, TESTS.l5.requiredPatterns, "Lesson 5 requires defining functions (def) and returning values (return).");
      if (req) return req;

      const contains = stdoutMustContain(stdout, ["risk", "label"], "Output should include risk and label.");
      if (contains) return contains;

      return pass("Mastered ✅ Lesson 5 passed.");
    },
  },

  // Lesson 6: Lists analytics
  l6: {
    inputs: [],
    expectedStdoutLines: ["total", "average", "high"],
    requiredPatterns: [/\[.*\]/s, /\bsum\s*\(/, /\blen\s*\(/, /\bprint\s*\(/],
    grade: ({ code, stdout, error }) => {
      const crash = assertNoRuntimeCrash(error);
      if (crash) return crash;

      const ac = antiCheat(code, TESTS.l6.expectedStdoutLines);
      if (ac) return ac;

      const req = requirePatterns(code, TESTS.l6.requiredPatterns, "Lesson 6 requires a list plus sum() and len().");
      if (req) return req;

      const contains = stdoutMustContain(stdout, ["total", "average"], "Output should include Total and Average.");
      if (contains) return contains;

      return pass("Mastered ✅ Lesson 6 passed.");
    },
  },

  // Lesson 7: Dictionaries
  l7: {
    inputs: [],
    expectedStdoutLines: ["owner", "os", "risk"],
    requiredPatterns: [/\{[\s\S]*:\s*/m, /\[[\'"]\w+[\'"]\]/m, /\bprint\s*\(/],
    grade: ({ code, stdout, error }) => {
      const crash = assertNoRuntimeCrash(error);
      if (crash) return crash;

      const ac = antiCheat(code, TESTS.l7.expectedStdoutLines);
      if (ac) return ac;

      const req = requirePatterns(code, TESTS.l7.requiredPatterns, "Lesson 7 requires a dictionary, key access, update, and printing.");
      if (req) return req;

      const contains = stdoutMustContain(stdout, ["owner"], "Output should show at least the Owner field.");
      if (contains) return contains;

      return pass("Mastered ✅ Lesson 7 passed.");
    },
  },

  // Lesson 8: Strings parsing
  l8: {
    inputs: [],
    expectedStdoutLines: ["clean", "words", "alert"],
    requiredPatterns: [/\.lower\s*\(/, /\.split\s*\(/, /\bprint\s*\(/],
    grade: ({ code, stdout, error }) => {
      const crash = assertNoRuntimeCrash(error);
      if (crash) return crash;

      const ac = antiCheat(code, TESTS.l8.expectedStdoutLines);
      if (ac) return ac;

      const req = requirePatterns(code, TESTS.l8.requiredPatterns, "Lesson 8 requires .lower() and .split() for log parsing.");
      if (req) return req;

      const contains = stdoutMustContain(stdout, ["clean", "words"], "Output should include clean text and words list.");
      if (contains) return contains;

      return pass("Mastered ✅ Lesson 8 passed.");
    },
  },

  // Lesson 9: try/except
  l9: {
    inputs: [],
    expectedStdoutLines: ["invalid"],
    requiredPatterns: [/^\s*try\s*:\s*$/m, /^\s*except\s*:\s*$/m, /\bint\s*\(/, /\bprint\s*\(/],
    grade: ({ code, stdout, error }) => {
      const crash = assertNoRuntimeCrash(error);
      if (crash) return crash;

      const ac = antiCheat(code, TESTS.l9.expectedStdoutLines);
      if (ac) return ac;

      const req = requirePatterns(code, TESTS.l9.requiredPatterns, "Lesson 9 requires try/except with int() conversion and a friendly message.");
      if (req) return req;

      const contains = stdoutMustContain(stdout, ["invalid"], 'Output should include an "Invalid" style message when conversion fails.');
      if (contains) return contains;

      return pass("Mastered ✅ Lesson 9 passed.");
    },
  },

  // Lesson 10: Capstone (uses input loop)
  l10: {
    inputs: [
      "FAILED login from ip 10.0.0.5",
      "blocked url: http://bad.site",
      "login success user ava",
      "done",
    ],
    expectedStdoutLines: ["mini soc", "total", "events"],
    requiredPatterns: [/\bwhile\s+True\s*:/, /\binput\s*\(/, /\bappend\s*\(/, /\bfor\s+\w+\s+in\s+/m, /\bprint\s*\(/],
    grade: ({ code, stdout, error }) => {
      const crash = assertNoRuntimeCrash(error);
      if (crash) return crash;

      const ac = antiCheat(code, TESTS.l10.expectedStdoutLines);
      if (ac) return ac;

      const req = requirePatterns(code, TESTS.l10.requiredPatterns, "Lesson 10 requires looped input collection, storing events, and printing a report.");
      if (req) return req;

      const contains = stdoutMustContain(stdout, ["report", "total", "events"], "Output should include a report with Total events and an Events section.");
      if (contains) return contains;

      return pass("Mastered ✅ Lesson 10 passed.");
    },
  },
};

/**
 * Main grader used by App.jsx
 */
export function gradeLesson({ lessonId, stdout, error, code }) {
  const t = TESTS[lessonId];
  if (!t) return missing("No mastery test found for this lesson.");
  return t.grade({ stdout, error, code });
}

/**
 * Hidden inputs used by App.jsx harness
 */
export function getLessonTestInputs(lessonId) {
  return TESTS[lessonId]?.inputs ?? [];
}