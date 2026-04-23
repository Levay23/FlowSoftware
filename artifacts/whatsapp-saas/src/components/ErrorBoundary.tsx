import React from "react";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#fff",
            padding: "2rem",
            fontFamily: "monospace",
          }}
        >
          <h1 style={{ color: "#f87171", marginBottom: "1rem" }}>
            ⚠️ Error en la aplicacion
          </h1>
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #f87171",
              borderRadius: "8px",
              padding: "1rem",
              maxWidth: "600px",
              width: "100%",
              wordBreak: "break-all",
            }}
          >
            <p style={{ color: "#fca5a5", marginBottom: "0.5rem", fontWeight: "bold" }}>
              {this.state.error?.name}: {this.state.error?.message}
            </p>
            <pre
              style={{
                color: "#9ca3af",
                fontSize: "0.75rem",
                overflow: "auto",
                maxHeight: "200px",
              }}
            >
              {this.state.error?.stack}
            </pre>
          </div>
          <button
            onClick={() => window.location.href = "/login"}
            style={{
              marginTop: "1.5rem",
              background: "#00b8a9",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            Volver al login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
