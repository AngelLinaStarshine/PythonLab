// src/data/lessonTryMe.js
// Extended lesson content: TTS intro text + per-section Try Me blocks.
// Each section has: id, icon, heading, body (TTS readable), code, tryMe, tip.
// Bodies live in ./tryMeContent/tm-l*.js for maintainability.

import { tryMeL1 } from "./tryMeContent/tm-l1.js";
import { tryMeL2 } from "./tryMeContent/tm-l2.js";
import { tryMeL3 } from "./tryMeContent/tm-l3.js";
import { tryMeL4 } from "./tryMeContent/tm-l4.js";
import { tryMeL5 } from "./tryMeContent/tm-l5.js";
import { tryMeL6 } from "./tryMeContent/tm-l6.js";
import { tryMeL7 } from "./tryMeContent/tm-l7.js";
import { tryMeL8 } from "./tryMeContent/tm-l8.js";
import { tryMeL9 } from "./tryMeContent/tm-l9.js";
import { tryMeL10 } from "./tryMeContent/tm-l10.js";

export const lessonContent = [
  tryMeL1,
  tryMeL2,
  tryMeL3,
  tryMeL4,
  tryMeL5,
  tryMeL6,
  tryMeL7,
  tryMeL8,
  tryMeL9,
  tryMeL10,
];

/** @param {string} lessonId */
export function getLessonContent(lessonId) {
  return lessonContent.find((c) => c.lessonId === lessonId) ?? null;
}
