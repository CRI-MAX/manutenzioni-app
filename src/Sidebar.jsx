import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, deleteUser } from "firebase/auth";
import "./Sidebar.css";
import LogoAziendale from "./components/LogoAziendale";

function Sidebar({ ruolo = "ospite" }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const isAdmin = ruolo === "admin";
  const isTecnico = ruolo === "tecnico";
  const isCliente = ruolo === "cliente";

  const handleDeleteAccount = async () => {
    if (window.confirm("⚠️ Sei sicuro di voler eliminare questo account?")) {
      try {
        await deleteUser(user);
        alert("✅ Account eliminato con successo.");
        navigate("/logout");
      } catch (error) {
        console.error("Errore nell'eliminazione account:", error);
        alert("❌ Impossibile eliminare l'account. Riprova o contatta l'amministratore.");
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="text-center mb-3">
        <LogoAziendale altezza={50} className="sidebar-logo" />
        <div className="text-muted mt-2" style={{ fontSize: "0.9em" }}>
          Ruolo: <strong>{ruolo}</strong>
        </div>
        {user && (
          <div className="mt-1" style={{ fontSize: "0.85em" }}>
            <strong>{user.displayName || "Utente"}</strong><br />
            <small>{user.email}</small>
          </div>
        )}
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
        <Link to="/profilo">👤 Profilo Utente</Link>
        <Link to="/logout">🚪 Logout</Link>
        <Link to="/recupero">🔑 Cambia Password</Link>
        {isAdmin && (
          <button className="btn btn-sm btn-outline-danger mt-2 w-100" onClick={handleDeleteAccount}>
            🗑️ Elimina Account
          </button>
        )}
      </nav>
    </div>
  );
}

export default Sidebar;