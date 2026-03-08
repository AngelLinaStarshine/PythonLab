// src/ai/hintAgent.js
// A safe "coach" agent: helps without giving direct answers.

import { blockDirectAnswers } from "./safety.js";

const RULES = `
You are a Python coach for teens.
You must NOT give the final solution code.
You must NOT fill blanks directly.
You must:
- explain the concept
- point out mistakes in the student's code
- give 1–3 hints
- ask 1 guiding question
- provide a small unrelated example (different values/names)
Keep it short and supportive.
`;

const lessonGuides = {
  l1: `
Lesson 1 mastery rules:
- username must be a quoted string ("" or '')
- grade must be number 10 or 11 (no quotes)
- two_factor_enabled must be True or False (capital, no quotes)
- must print using all variables
`,
  // add l2..l10 guides later
};

export async function hintAgent({
  lessonId,
  lessonTitle,
  studentQuestion,
  code,
  lastError,
  masteryMsg,
}) {
  const lessonGuide = lessonGuides[lessonId] ?? "";

  // If you use OpenAI / another model later: send RULES + lessonGuide + studentQuestion + code.
  // For now, return a deterministic safe hint response:

  const rawHint = buildLocalHint({
    lessonId,
    lessonTitle,
    lessonGuide,
    studentQuestion,
    code,
    lastError,
    masteryMsg,
  });

  return blockDirectAnswers(rawHint);
}

// ✅ IMPORTANT: helper must be OUTSIDE hintAgent (or above return)
function buildLocalHint({
  lessonId,
  lessonTitle,
  lessonGuide,
  studentQuestion,
  code,
  lastError,
  masteryMsg,
}) {
  const q = (studentQuestion || "").toLowerCase();
  const c = String(code || "");

  // L1 coaching logic (safe + not direct answers)
  if (lessonId === "l1") {
    const hints = [];

    // username missing quotes
    if (/username\s*=\s*[A-Za-z_]+/.test(c) && !/username\s*=\s*['"]/.test(c)) {
      hints.push("Hint 1: `username` is text, so it needs quotes (a string).");
    }

    // grade incorrectly quoted
    if (/grade\s*=\s*['"]/.test(c)) {
      hints.push("Hint 2: `grade` should be a number (10 or 11) without quotes.");
    }

    // 2FA incorrectly quoted
    if (/two_factor_enabled\s*=\s*['"]/.test(c)) {
      hints.push(
        "Hint 3: `two_factor_enabled` should be a real boolean: `True` or `False` (capital T/F), not a string."
      );
    }

    // missing print
    if (!/print\s*\(/.test(c)) {
      hints.push("Hint: You must use `print()` to show your profile output.");
    }

    const base = [
      `Lesson: ${lessonTitle || lessonId}`,
      lessonGuide ? `\nCoach notes:\n${lessonGuide.trim()}\n` : "",
      "Here’s what your program needs (without giving you the final answer):",
      ...hints.slice(0, 3),
      "",
      "Quick example (NOT your exact task):",
      '```python\nstatus = "online"\nlevel = 11\nflag = False\nprint(status, level, flag)\n```',
      "",
      "Guiding question:",
      "Which of your three variables is currently being treated as *text* but should be a *number* or *boolean*?",
    ].filter(Boolean);

    if (masteryMsg) base.unshift(`Mastery feedback: ${masteryMsg}`);
    if (lastError) base.unshift(`Runtime error: ${lastError}`);

    return base.join("\n");
  }

  // Default safe coach reply for other lessons
  return [
    "I can help — but I won’t paste the final answer.",
    "",
    "Tell me:",
    "1) What output are you trying to get?",
    "2) What line confuses you most?",
    "",
    "Guiding question:",
    "Which concept from this lesson do you think your code is missing (input / if / loop / list / dict / string / try-except)?",
  ].join("\n");
}