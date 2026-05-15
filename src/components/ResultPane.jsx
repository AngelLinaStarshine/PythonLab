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
  /** Students: false until reading + video gates in Learn are complete. */
  unlocked = true,
  /** From `buildErrorCoach`: gentle guidance when `error` is non-empty. */
  errorCoach = null,
  /** Scroll Learn reading to a heading that matches `section` (word overlap). */
  onGoToReading,
  inputGuide = null,
  onRunWithOwnInputs,
}) {
  const canRun = Boolean(runtimeReady && unlocked);
  const canMastery = Boolean(runtimeReady && unlocked);

  return (
    <section className="pane result-pane">
      <div className="pane-header">
        <div className="pane-title">Result</div>

        <div className="pane-actions">
          <button type="button" className="btn" onClick={onRun} disabled={!canRun}>
            Run
          </button>

          <button type="button" className="btn ghost" onClick={onReset} disabled={!runtimeReady}>
            Reset
          </button>

          <button type="button" className="btn" onClick={onMasteryCheck} disabled={!canMastery}>
            {mastered ? "Mastered ✅" : "Mastery Check"}
          </button>
        </div>
      </div>

      {!runtimeReady && (
        <div className="runtime-loading">
          {loadingMsg || "Loading Python runtime..."}
          <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
            If loading stalls, put a full Pyodide build in <code>public/pyodide/</code> or check your network.
          </div>
        </div>
      )}

      {inputGuide && runtimeReady && unlocked ? (
        <div className="input-guide" role="region" aria-label="Input help">
          <div className="input-guide-title">{inputGuide.title}</div>
          <p className="input-guide-intro">{inputGuide.intro}</p>
          <ol className="input-guide-list">
            {inputGuide.fields.map((field) => (
              <li key={field.label}>
                <strong>{field.label}</strong> — {field.hint}
                {field.example ? (
                  <span className="input-guide-example"> Example: {field.example}</span>
                ) : null}
              </li>
            ))}
          </ol>
          {typeof onRunWithOwnInputs === "function" ? (
            <button type="button" className="btn ghost small input-guide-btn" onClick={onRunWithOwnInputs}>
              Run with my own values…
            </button>
          ) : null}
        </div>
      ) : null}

      {runtimeReady && !unlocked && (
        <div className="result-learn-gate-hint" role="status">
          Finish the Learn steps: scroll through reading, wait the minimum time, then complete the video step (or, if
          no videos are assigned, that step is skipped after reading). Run and Mastery Check unlock after that.
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
          {errorCoach && error?.trim() ? (
            <div className="error-coach" role="region" aria-label="Learning guide for this error">
              <div className="error-coach-label">Guide</div>
              <p className="error-coach-intro">{errorCoach.intro}</p>
              <ul className="error-coach-list">
                {errorCoach.bullets.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {errorCoach.suggestReading && typeof onGoToReading === "function" ? (
                <div className="error-coach-actions">
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => onGoToReading(errorCoach.readingHint)}
                  >
                    Open Learn reading ({errorCoach.readingHint})
                  </button>
                  <p className="error-coach-foot">
                    The lesson text walks through this idea step by step. Use search in your browser on the Learn
                    panel if you do not see that heading right away.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
