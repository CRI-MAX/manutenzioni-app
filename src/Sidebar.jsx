import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import LogoAziendale from "./components/LogoAziendale";

function Sidebar({ ruolo = "ospite" }) {
  const isAdmin = ruolo === "admin";
  const isTecnico = ruolo === "tecnico";
  const isCliente = ruolo === "cliente";

  return (
    <div className="sidebar">
      <div className="text-center mb-3">
        <LogoAziendale altezza={50} className="sidebar-logo" />
        <div className="text-muted mt-2" style={{ fontSize: "0.9em" }}>
          Ruolo: <strong>{ruolo}</strong>
        </div>
      </div>

      <h4 className="sidebar-title">📋 Menu</h4>
      <nav className="sidebar-nav">
        <Link to="/">🏠 Dashboard</Link>

        {(isAdmin || isTecnico) && (
          <Link to="/mezzi">🚚 Mezzi</Link>
        )}

        {isAdmin && (
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
      </nav>

      <hr className="my-3" />

      <h6 className="sidebar-subtitle">👤 Account</h6>
      <nav className="sidebar-nav">
        <Link to="/profilo">👤 Profilo</Link>
        <Link to="/logout">🚪 Logout</Link>
      </nav>
    </div>
  );
}

export default Sidebar;