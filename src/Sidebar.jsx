import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css"; // Puoi integrare in App.css se preferisci

function Sidebar({ ruolo }) {
  return (
    <div className="sidebar">
      <h4 className="sidebar-title">📋 Menu</h4>
      <nav className="sidebar-nav">
        <Link to="/">🏠 Dashboard</Link>

        {(ruolo === "admin" || ruolo === "tecnico") && (
          <Link to="/mezzi">🚚 Mezzi</Link>
        )}

        {ruolo === "admin" && (
          <>
            <Link to="/clienti">👥 Clienti</Link>
            <Link to="/registrazione">➕ Registrazione</Link>
            <Link to="/utenti">👤 Gestione Utenti</Link>
            <Link to="/admin">🛠️ Dashboard Admin</Link>
            <Link to="/log">📑 Registro Attività</Link>
          </>
        )}

        <Link to="/report">📊 Report</Link>
        <Link to="/recupero">🔐 Recupero Password</Link>

        {/* 🔐 Se vuoi aggiungere logout o profilo in futuro:
        <Link to="/profilo">👤 Profilo</Link>
        <Link to="/logout">🚪 Logout</Link>
        */}
      </nav>
    </div>
  );
}

export default Sidebar;