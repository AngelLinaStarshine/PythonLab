/**
 * Learner-facing guidance for lessons that use input().
 * Shown in Result panel and in the custom input modal.
 */

export const LESSON_INPUT_GUIDES = {
  l2: {
    title: "What to enter when asked (Lesson 2)",
    intro:
      "Click Run to open a form and type your three answers. Mastery Check uses sample answers automatically.",
    fields: [
      {
        label: "Message",
        hint: "Suspicious text any words or sentence (letters only, not a number).",
        example: "Click this now!",
        placeholder: "e.g. Click this now!",
      },
      {
        label: "Risk Score",
        hint: "Whole number from 0 to 100. Do not type % or decimals.",
        example: "85",
        placeholder: "e.g. 85",
      },
      {
        label: "Confidence",
        hint: "Decimal from 0.0 to 1.0 (not a percent). 0.85 means 85%.",
        example: "0.85",
        placeholder: "e.g. 0.85",
      },
    ],
    sampleInputs: ["Click this now!", "85", "0.85"],
    /** Shown in browser prompt() when interactive fallback runs */
    promptLines: [
      "1/3 MESSAGE — suspicious text (any words)",
      "Example: Click this now!",
      "Type your message:",
    ],
  },
  l10: {
    title: "What to enter when asked (Lesson 10 capstone)",
    intro: "Type one log line per prompt. On the last prompt, type done to finish.",
    fields: [
      {
        label: "Event 1",
        hint: "First security log line.",
        example: "FAILED login from ip 10.0.0.5",
        placeholder: "log line",
      },
      {
        label: "Event 2",
        hint: "Second log line.",
        example: "blocked url: http://bad.site",
        placeholder: "log line",
      },
      {
        label: "Event 3",
        hint: "Third log line.",
        example: "login success user ava",
        placeholder: "log line",
      },
      {
        label: "Finish",
        hint: 'Type exactly: done (lowercase) to stop the loop.',
        example: "done",
        placeholder: "done",
      },
    ],
    sampleInputs: [
      "FAILED login from ip 10.0.0.5",
      "blocked url: http://bad.site",
      "login success user ava",
      "done",
    ],
    promptLines: ["Enter a log line, or type done to finish:", "Example: FAILED login from ip 10.0.0.5"],
  },
};

export function getLessonInputGuide(lessonId) {
  return LESSON_INPUT_GUIDES[lessonId] ?? null;
}

/** One popup string per input() call (Lesson 2 has 3). */
export function getLessonInputPrompts(lessonId) {
  const guide = getLessonInputGuide(lessonId);
  if (!guide) return [];

  if (lessonId === "l2") {
    const [msg, risk, conf] = guide.fields;
    return [
      `1/3 ${msg.label.toUpperCase()}\n${msg.hint}\nExample: ${msg.example}`,
      `2/3 ${risk.label.toUpperCase()}\n${risk.hint}\nExample: ${risk.example}`,
      `3/3 ${conf.label.toUpperCase()}\n${conf.hint}\nExample: ${conf.example}`,
    ];
  }

  if (lessonId === "l10") {
    return [
      `${guide.promptLines.join("\n")}`,
      `${guide.promptLines.join("\n")}`,
      `${guide.promptLines.join("\n")}`,
      `Last prompt — type: done`,
    ];
  }

  return guide.fields.map(
    (f, i) => `${i + 1}. ${f.label}\n${f.hint}\nExample: ${f.example}`
  );
}
