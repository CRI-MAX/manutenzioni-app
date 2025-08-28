import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css"; // Assicurati che esista o rimuovi se non serve

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/manutenzioni-app">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);