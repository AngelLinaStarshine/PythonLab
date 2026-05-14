// src/data/labs.js
// Coursera-style hands-on lab data for all 10 lessons.
// Split across ./labs/*.js for maintainability; this module re-exports one array.
// Each lab has: estimatedMinutes, objectives, exercises (prompt, starter, hints,
// solution, expectedOutput), and wrapUp.
// The PracticeLab component reads this file — no logic lives here.

import { lab1 } from "./labs/l1.js";
import { lab2 } from "./labs/l2.js";
import { lab3 } from "./labs/l3.js";
import { lab4 } from "./labs/l4.js";
import { lab5 } from "./labs/l5.js";
import { lab6 } from "./labs/l6.js";
import { lab7 } from "./labs/l7.js";
import { lab8 } from "./labs/l8.js";
import { lab9 } from "./labs/l9.js";
import { lab10 } from "./labs/l10.js";

export const labs = [lab1, lab2, lab3, lab4, lab5, lab6, lab7, lab8, lab9, lab10];
