// src/components/EditorPane.jsx
import Editor from "@monaco-editor/react";
import AIPopup from "./AIPopup.jsx";

export default function EditorPane({
  code,
  onChange,
  hint,
  onSave,
  antiPasteEnabled,
  unlocked,
  /** Increment when loading starter code from Learn / Lab so Monaco picks up `value` while read-only. */
  layoutKey = 0,
}) {
  const block = (e) => {
    if (!antiPasteEnabled) return;
    e.preventDefault();
  };

  return (
    <div className="pane editor-pane">
      <div className="pane-header">
        <div className="pane-title">Code</div>
        <div className="pane-actions">
          <button className="btn" onClick={onSave}>
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
        <Editor
          key={layoutKey}
          height="70vh"
          defaultLanguage="python"
          value={code}
          onChange={(v) => onChange(v ?? "")}
          options={{
            readOnly: false,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            contextmenu: false,         // ✅ reduces easy copy/paste
            quickSuggestions: true,
          }}
        />

        <AIPopup hint={hint} />

        {!unlocked && (
          <div className="locked-overlay">
            Complete Learn (scroll + time + video) to unlock Run and mastery checks.
          </div>
        )}
      </div>
    </div>
  );
}