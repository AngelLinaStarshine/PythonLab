import { useEffect, useRef, useState } from "react";

/**
 * Collects learner-provided stdin values with labeled fields (Message, Risk Score, etc.).
 */
export default function InputPromptModal({ guide, open, onCancel, onSubmit }) {
  const [values, setValues] = useState([]);
  const [formError, setFormError] = useState("");
  const firstRef = useRef(null);

  useEffect(() => {
    if (!open || !guide) return;
    setValues(guide.fields.map(() => ""));
    setFormError("");
  }, [open, guide]);

  useEffect(() => {
    if (open) firstRef.current?.focus();
  }, [open]);

  if (!open || !guide) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = values.map((v) => String(v).trim());
    const empty = trimmed.findIndex((v) => !v);
    if (empty >= 0) {
      setFormError(`Please fill in ${guide.fields[empty]?.label ?? "all fields"} before running.`);
      return;
    }
    setFormError("");
    onSubmit(trimmed);
  };

  return (
    <div className="input-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="input-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="input-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="input-modal-title" className="input-modal-title">
          {guide.title}
        </h3>
        <p className="input-modal-intro">{guide.intro}</p>

        <form onSubmit={handleSubmit} className="input-modal-form">
          {guide.fields.map((field, i) => (
            <label key={`${field.label}-${i}`} className="input-modal-field">
              <span className="input-modal-label">
                {i + 1}. {field.label}
              </span>
              <span className="input-modal-hint">{field.hint}</span>
              <input
                ref={i === 0 ? firstRef : undefined}
                type="text"
                className="input-modal-input"
                value={values[i] ?? ""}
                placeholder={field.placeholder ?? field.example}
                onChange={(e) => {
                  const next = [...values];
                  next[i] = e.target.value;
                  setValues(next);
                }}
              />
              {field.example ? (
                <span className="input-modal-example">Example: {field.example}</span>
              ) : null}
            </label>
          ))}

          {formError ? <p className="input-modal-error">{formError}</p> : null}

          <div className="input-modal-actions">
            <button type="button" className="btn ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Run
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
