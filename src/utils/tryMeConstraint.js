/**
 * Try me with optional `editableToken` in lesson content: only that substring may be
 * changed in the Code editor (see clampTryMeCode).
 */

/** First occurrence of `editableToken` in starter; null if missing or not found. */
export function splitTryMeStarter(starter, editableToken) {
  const s = typeof starter === "string" ? starter : "";
  const tok = typeof editableToken === "string" ? editableToken.trim() : "";
  if (!s || !tok) return null;
  const i = s.indexOf(tok);
  if (i < 0) return null;
  return { before: s.slice(0, i), after: s.slice(i + tok.length), token: tok };
}

/**
 * @param {string} code
 * @param {{ before: string, after: string, maxLength?: number, defaultMid: string }} constraint
 */
export function clampTryMeCode(code, constraint) {
  if (!constraint) return code ?? "";
  const { before, after, defaultMid } = constraint;
  const maxLength = Number(constraint.maxLength) > 0 ? Number(constraint.maxLength) : 64;
  const c = typeof code === "string" ? code : "";
  const dm = typeof defaultMid === "string" ? defaultMid : "";
  if (!c.startsWith(before) || !c.endsWith(after)) {
    return before + dm + after;
  }
  let mid = c.slice(before.length, c.length - after.length);
  mid = mid.replace(/[\r\n]/g, "");
  if (mid.length > maxLength) mid = mid.slice(0, maxLength);
  return before + mid + after;
}

export function previewTryMeExpected(expectedOutput, token, currentValue) {
  if (typeof expectedOutput !== "string" || !token) return expectedOutput ?? "";
  const cur = typeof currentValue === "string" ? currentValue : token;
  if (!expectedOutput.includes(token)) return expectedOutput;
  return expectedOutput.split(token).join(cur);
}
