// src/components/EditorPane.jsx
import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import AIPopup from "./AIPopup.jsx";

export default function EditorPane({
  code,
  onChange,
  hint,
  onSave,
  antiPasteEnabled,
  /** When false (students before Learn is done), editor is read-only and Save is disabled. */
  unlocked = true,
  /** Increment when loading starter code from Learn / Lab so Monaco picks up `value` while read-only. */
  layoutKey = 0,
  /** Try me with `editableToken`: only the token slice may change in the editor. */
  tryMeConstrained = false,
}) {
  const monacoRef = useRef(null);

  useEffect(() => {
    const ed = monacoRef.current;
    if (!ed) return;
    ed.updateOptions({
      readOnly: !unlocked,
      quickSuggestions: unlocked,
    });
  }, [unlocked]);

  const block = (e) => {
    if (!antiPasteEnabled) return;
    e.preventDefault();
  };

  return (
    <div className="pane editor-pane">
      <div className="pane-header">
        <div className="pane-title">Code</div>
        <div className="pane-actions">
          <button
            type="button"
            className="btn"
            onClick={onSave}
            disabled={!unlocked}
            title={!unlocked ? "Complete Learn (reading + video) to save your code" : undefined}
          >
            Save
          </button>
        </div>
      </div>

      <div
        className="editor-wrap"
        onPaste={block}
        onCopy={block}
        onCut={block}
        onDrop={block}
        onDragOver={(e) => antiPasteEnabled && e.preventDefault()}
      >
        {tryMeConstrained && (
          <div className="editor-tryme-constrained-banner">
            Try me: only the part from the Hint may change here; the rest of the script is fixed.
          </div>
        )}
        <Editor
          key={layoutKey}
          height="70vh"
          defaultLanguage="python"
          value={code}
          onMount={(editor) => {
            monacoRef.current = editor;
            editor.updateOptions({
              readOnly: !unlocked,
              quickSuggestions: unlocked,
            });
          }}
          onChange={(v) => onChange(v ?? "")}
          options={{
            readOnly: !unlocked,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            contextmenu: false,         // ✅ reduces easy copy/paste
            quickSuggestions: unlocked,
          }}
        />

        <AIPopup hint={hint} />

        {!unlocked && (
          <div className="locked-overlay">
            Complete Learn (scroll + time + video). If no videos are assigned, the video step completes after reading.
            Then editing, Run, and Mastery Check unlock.
          </div>
        )}
      </div>
    </div>
  );
}