import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Errore catturato:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-danger">
          <h5>❌ Errore nel caricamento della pagina</h5>
          <p>Ricarica o contatta l'amministratore se il problema persiste.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;