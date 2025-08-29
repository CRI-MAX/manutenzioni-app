import React from "react";

/**
 * Componente ErrorBoundary per catturare errori runtime React.
 * Visualizza un messaggio di fallback e logga l'errore.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("❌ Errore catturato:", error, info);

    // 🔔 Integrazione con servizi esterni (es. Sentry)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-danger">
          <h5>❌ Errore nel caricamento della pagina</h5>
          <p>Ricarica o contatta l'amministratore se il problema persiste.</p>
          <button className="btn btn-outline-danger mt-3" onClick={this.handleReload}>
            🔄 Ricarica
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;