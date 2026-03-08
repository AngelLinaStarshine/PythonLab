export default function AIPopup({ hint }) {
  if (!hint?.message) return null;

  return (
    <div className="ai-popup" role="status" aria-live="polite">
      <div className="ai-popup-title">AI Coach</div>
      <div className="ai-popup-msg">{hint.message}</div>
    </div>
  );
}