import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { normalizzaUtente } from "./utils/normalizza";
import CsvExport from "./CsvExport";
import { toast } from "react-toastify";
import Badge from "react-bootstrap/Badge";

function GestioneUtenti() {
  const [utenti, setUtenti] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const fetchUtenti = async () => {
      try {
        const snapshot = await getDocs(collection(db, "UTENTI"));
        const dati = snapshot.docs.map(d => ({
          id: d.id,
          ...normalizzaUtente(d.data())
        }));
        setUtenti(dati);
      } catch (error) {
        console.error("Errore nel caricamento utenti:", error);
        toast.error("❌ Errore nel caricamento utenti");
      }
    };
    fetchUtenti();
  }, []);

  const creaNotifica = async (messaggio, tipo = "info") => {
    await addDoc(collection(db, "NOTIFICHE"), {
      messaggio,
      tipo,
      utente: "admin",
      timestamp: Timestamp.now()
    });
  };

  const toggleAttivo = async (id, statoAttuale) => {
    try {
      await updateDoc(doc(db, "UTENTI", id), { attivo: !statoAttuale });
      setUtenti(prev =>
        prev.map(u => (u.id === id ? { ...u, attivo: !statoAttuale } : u))
      );
      toast.success("✅ Stato aggiornato");
      await creaNotifica(`Utente ${id} ${!statoAttuale ? "attivato" : "disattivato"}`, "info");
    } catch (error) {
      console.error("Errore nel cambio stato:", error);
      toast.error("❌ Errore nel cambio stato");
    }
  };

  const eliminaUtente = async (id, nome) => {
    if (!window.confirm(`Vuoi davvero eliminare l'utente "${nome}"?`)) return;
    try {
      await deleteDoc(doc(db, "UTENTI", id));
      setUtenti(prev => prev.filter(u => u.id !== id));
      toast.success("🗑️ Utente eliminato");
      await creaNotifica(`Utente "${nome}" eliminato`, "warning");
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
      toast.error("❌ Errore nell'eliminazione");
    }
  };

  const cambiaRuolo = async (id, nuovoRuolo) => {
    try {
      await updateDoc(doc(db, "UTENTI", id), { ruolo: nuovoRuolo });
      setUtenti(prev =>
        prev.map(u => (u.id === id ? { ...u, ruolo: nuovoRuolo } : u))
      );
      toast.success(`🔄 Ruolo aggiornato a "${nuovoRuolo}"`);
      await creaNotifica(`Ruolo utente ${id} aggiornato a "${nuovoRuolo}"`, "info");
    } catch (error) {
      console.error("Errore nel cambio ruolo:", error);
      toast.error("❌ Errore nel cambio ruolo");
    }
  };

  const intestazioni = [
    { label: "Nome", key: "nome" },
    { label: "Email", key: "email" },
    { label: "Ruolo", key: "ruolo" },
    { label: "Attivo", key: "attivo" }
  ];

  const filtrati = utenti.filter(u =>
    [u.nome, u.email, u.ruolo]
      .filter(Boolean)
      .some(val => val.toLowerCase().includes(filtro.toLowerCase()))
  );

  const renderStatoBadge = (attivo) => (
    <Badge bg={attivo ? "success" : "secondary"}>
      {attivo ? "Attivo" : "Disattivo"}
    </Badge>
  );

  const renderRuoloBadge = (ruolo) => {
    const colori = {
      admin: "danger",
      tecnico: "primary",
      cliente: "info"
    };
    return <Badge bg={colori[ruolo] || "secondary"}>{ruolo}</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>👤 Gestione Utenti</h3>
        <CsvExport
          dati={filtrati}
          intestazioni={intestazioni}
          nomeFile="utenti.csv"
        />
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Cerca per nome, email o ruolo..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ruolo</th>
            <th>Stato</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((u, i) => (
              <tr key={i}>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    {renderRuoloBadge(u.ruolo)}
                    <select
                      className="form-select form-select-sm"
                      value={u.ruolo}
                      onChange={(e) => cambiaRuolo(u.id, e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="tecnico">Tecnico</option>
                      <option value="cliente">Cliente</option>
                    </select>
                  </div>
                </td>
                <td>{renderStatoBadge(u.attivo)}</td>
                <td className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleAttivo(u.id, u.attivo)}
                  >
                    {u.attivo ? "Disattiva" : "Attiva"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminaUtente(u.id, u.nome)}
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                Nessun utente trovato.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GestioneUtenti;