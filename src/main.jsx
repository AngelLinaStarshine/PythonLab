import React from "react";
import ReactDOM from "react-dom/client";
import "./securityLayer.js";
import App from "./App.jsx";
import "./styles.css";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          padding: 24,
          background: "#1e2a35",
          color: "#e8edf4",
          fontFamily: "system-ui, sans-serif",
        }}>
          <h1 style={{ color: "#ff6b6b" }}>Something went wrong</h1>
          <pre style={{ fontSize: 12, overflow: "auto" }}>{String(this.state.error?.message || this.state.error)}</pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = "<div style='padding:24px;color:#e8edf4;font-family:system-ui'>No #root element found.</div>";
} else {
  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (err) {
    rootEl.innerHTML = "<div style='padding:24px;background:#1e2a35;color:#e8edf4;font-family:system-ui'><h1 style='color:#ff6b6b'>Failed to start app</h1><pre>" + String(err?.message || err) + "</pre><p>Run locally: <strong>npm run dev</strong> then open http://localhost:5173</p></div>";
  }
}