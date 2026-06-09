/**
 * Gentle, non-spoiler coaching for the Result "error" area.
 * Does not quote line numbers or prescribe exact edits; points to reading after repeated trouble.
 */

const ERROR_KIND_ORDER = [
  "syntaxerror",
  "indentationerror",
  "nameerror",
  "typeerror",
  "valueerror",
  "zerodivisionerror",
  "indexerror",
  "keyerror",
  "attributeerror",
  "modulenotfounderror",
];

/** Short heading fragments that match real <h2>/<h3> text in lessons.js (scroll uses word overlap). */
const LESSON_READING_ANCHOR = {
  l1: "Common mistakes",
  l2: "Common mistakes",
  l3: "Common mistakes",
  l4: "Common mistakes",
  l5: "Common mistakes",
  l6: "Common mistakes",
  l7: "Common mistakes",
  l8: "Common mistakes",
  l9: "Common mistakes",
  l10: "Common mistakes",
};

const KIND_READING = {
  syntaxerror: "Creating a variable",
  indentationerror: "basic structure",
  nameerror: "Common mistakes",
  typeerror: "Common mistakes",
  valueerror: "Converting to numbers",
  zerodivisionerror: "Common mistakes",
  indexerror: "Common mistakes",
  keyerror: "Common mistakes",
  attributeerror: "Common mistakes",
  modulenotfounderror: "Common mistakes",
  unknown: "Common mistakes",
};

function extractKind(errorText) {
  const t = String(errorText || "");
  for (const k of ERROR_KIND_ORDER) {
    const re = new RegExp(`\\b${k}\\b`, "i");
    if (re.test(t)) return k;
  }
  return "unknown";
}

function bulletsForKind(kind) {
  switch (kind) {
    case "syntaxerror":
    case "indentationerror":
      return [
        "Python is strict about spelling, punctuation, and indentation. Small shape issues in the code block often show up as this kind of message.",
        "Compare your block structure to the short examples in the lesson: colons after headers, consistent indent, and paired brackets and quotes.",
      ];
    case "nameerror":
      return [
        "Python could not resolve a name you used. That usually means a variable or function name does not match what you defined earlier, or a built in name is misspelled.",
        "Re-check identifiers letter by letter against the lesson examples (capitalisation matters).",
      ];
    case "typeerror":
      return [
        "Two values were used together in a way their types do not allow. Think about what each value is (text vs number vs list) before combining or comparing.",
        "Walk through the lesson section on types and conversions, then reread the line the exercise is asking you to build.",
      ];
    case "valueerror":
      return [
        "A function received a value it cannot use in that form. Often that is about converting or validating input before using it in math or comparisons.",
        "Revisit the lesson pattern for safe conversion and what valid inputs look like for this exercise.",
      ];
    case "zerodivisionerror":
      return [
        "Something was divided by zero. That often means a count or length turned out to be zero when you did not expect it.",
        "Reread how the lesson guards totals and loop counters before dividing.",
      ];
    case "indexerror":
    case "keyerror":
      return [
        "You asked for a position or key that is not available on that data structure. Sizes and keys are easy to mis-count by one.",
        "Review how the lesson builds the structure step by step before indexing or looking up keys.",
      ];
    case "attributeerror":
      return [
        "The object you have does not offer that operation. Often the fix is about using the right type first (for example normalising text before string methods).",
        "Skim the lesson section that introduces the type you are working with and the methods it supports.",
      ];
    case "modulenotfounderror":
      return [
        "Python could not load a module name you referenced. In this course that is usually a typo in a standard name, not an extra install step.",
        "Compare your import or call to the spelling shown in the lesson starter.",
      ];
    default:
      return [
        "The interpreter stopped before finishing. Use the official message above as a label, then reason backwards: what step in the lesson flow were you on?",
        "Re-run mentally in small steps: inputs, conversions, conditionals, then output.",
      ];
  }
}

/**
 * @param {{ errorText: string, lessonId: string, streak: number }} p
 * @returns {{ kind: string, intro: string, bullets: string[], readingHint: string, suggestReading: boolean } | null}
 */
export function buildErrorCoach({ errorText, lessonId, streak }) {
  const err = String(errorText || "").trim();
  if (!err) return null;

  const kind = extractKind(err);
  const bullets = bulletsForKind(kind);
  const readingHint = KIND_READING[kind] || LESSON_READING_ANCHOR[lessonId] || "Common mistakes";
  const suggestReading = streak >= 2;

  const intro =
    streak >= 3
      ? "You have hit several run errors in a row. That is normal while learning. The reading for this lesson has the patterns and checks that match these exercises."
      : "Below is Python’s own report (keep it). Here is high-level guidance without rewriting your answer for you.";

  return {
    kind,
    intro,
    bullets,
    readingHint,
    suggestReading,
  };
}
