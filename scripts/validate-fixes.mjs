/**
 * Quick sanity checks for teacher session + student videos.
 * Run: node scripts/validate-fixes.mjs
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

let failed = 0;
function ok(msg) {
  console.log(`  OK  ${msg}`);
}
function bad(msg) {
  console.log(` FAIL ${msg}`);
  failed += 1;
}

console.log("Validating teacher passcode + video fixes...\n");

const rolePicker = read("src/components/RolePicker.jsx");
if (rolePicker.includes("TEACHER_SESSION_KEY") && rolePicker.includes("markTeacherSession")) {
  ok("RolePicker uses session gate for teacher");
} else bad("RolePicker missing teacher session gate");

if (rolePicker.includes("hasValidTeacherSession") && rolePicker.includes("localStorage.removeItem(ROLE_STORAGE_KEY)")) {
  ok("Stale teacher role cleared without session");
} else bad("Stale teacher role not cleared");

if (rolePicker.includes("passcode !== TEACHER_PASSCODE")) {
  ok("Teacher passcode comparison present");
} else bad("Teacher passcode check missing");

const videoUtils = read("src/utils/videoUtils.js");
if (videoUtils.includes("getStudentVideoSources(lessonId, lesson)") && videoUtils.includes("defaults")) {
  ok("Students get lesson default videos fallback");
} else bad("Student video fallback missing");

const videoStore = read("src/utils/videoStore.js");
if (videoStore.includes("loadPublishedVideosFromSite")) {
  ok("Site-wide lesson-videos.json loader present");
} else bad("Published videos loader missing");

const app = read("src/App.jsx");
if (app.includes("clearTeacherSession") && app.includes("loadPublishedVideosFromSite")) {
  ok("App clears teacher session on switch + loads published videos");
} else bad("App integration incomplete");

console.log(failed ? `\n${failed} check(s) failed.\n` : "\nAll checks passed.\n");
process.exit(failed ? 1 : 0);
