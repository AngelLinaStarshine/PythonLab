export function blockDirectAnswers(text) {
  const t = String(text || "");
  // block long code blocks
  const codeBlocks = (t.match(/```[\s\S]*?```/g) || []);
  if (codeBlocks.some((b) => b.split("\n").length > 12)) {
    return "I can’t paste full solutions. I can give hints and check your logic step-by-step. What part is confusing?";
  }
  // block blank-filling style
  if (t.includes("__BLANK")) {
    return "I can’t fill blanks directly. I can give hints: what type should that blank be (string/int/bool)?";
  }
  return t;
}