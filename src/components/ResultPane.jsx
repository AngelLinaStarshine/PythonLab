// src/components/ResultPane.jsx
export default function ResultPane({
  stdout,
  error,
  onRun,
  onReset,
  runtimeReady,
  loadingMsg,
  onMasteryCheck,
  masteryMsg,
  mastered,
  unlocked,
}) {
  const canRun = Boolean(runtimeReady && unlocked);
  const canMastery = Boolean(runtimeReady && unlocked);

  return (
    <section className="pane result-pane">
      <div className="pane-header">
        <div className="pane-title">Result</div>

        <div className="pane-actions">
          <button className="btn" onClick={onRun} disabled={!canRun}>
            Run
          </button>

          <button className="btn ghost" onClick={onReset} disabled={!runtimeReady}>
            Reset
          </button>

          <button
            className="btn"
            onClick={onMasteryCheck}
            disabled={!canMastery}
            title={!unlocked ? "Finish Learn gates to unlock mastery" : ""}
          >
            {mastered ? "Mastered ✅" : "Mastery Check"}
          </button>
        </div>
      </div>

      {!runtimeReady && (
        <div className="runtime-loading">
          {loadingMsg || "Loading Python runtime..."}
          <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
            If you’re inside Canvas/Brightspace, external CDNs may be blocked — host Pyodide locally.
          </div>
        </div>
      )}

      {masteryMsg ? (
        <div className="console" style={{ paddingTop: 0 }}>
          <div className="console-block">
            <div className="console-label">Mastery</div>
            <pre className="console-pre">{masteryMsg}</pre>
          </div>
        </div>
      ) : null}

      <div className="console">
        <div className="console-block">
          <div className="console-label">stdout</div>
          <pre className="console-pre">{stdout || ""}</pre>
        </div>

        <div className="console-block">
          <div className="console-label">error</div>
          <pre className="console-pre err">{error || ""}</pre>
        </div>

        {!unlocked && (
          <div className="console-block">
            <div className="console-label">Locked</div>
            <pre className="console-pre">
              Finish Learn gates (scroll + time + video) to unlock Run and Mastery.
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}