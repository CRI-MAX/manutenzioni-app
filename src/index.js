import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";

// ✅ Se il file index.css esiste, mantieni questa riga
// Altrimenti puoi rimuoverla o commentarla
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ Elemento con id 'root' non trovato nel DOM.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);