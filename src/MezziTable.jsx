import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { normalizzaMezzo } from "./utils/normalizza";
import CsvExport from "./CsvExport";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import ModificaMezzo from "./ModificaMezzo";

function MezziTable() {
  const [mezzi, setMezzi] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mezzoDaModificare, setMezzoDaModificare] = useState(null);

  const fetchMezzi = async () => {
    try {
      const snapshot = await getDocs(collection(db, "MEZZI"));
      const dati = snapshot.docs.map(doc => ({
        id: doc.id,
        ...normalizzaMezzo(doc.data())
      }));
      setMezzi(dati);
    } catch (error) {
      console.error("Errore nel caricamento mezzi:", error);
      toast.error("❌ Errore nel caricamento dei mezzi");
    }
  };

  useEffect(() => {
    fetchMezzi();
  }, []);

  const intestazioni = [
    { label: "Modello", key: "modello" },
    { label: "Marca", key: "marca" },
    { label: "Targa", key: "targa" },
    { label: "Anno", key: "anno" },
    { label: "Cliente ID", key: "clienteId" }
  ];

  const filtrati = mezzi.filter(m =>
    [m.modello, m.targa, m.clienteId]
      .filter(Boolean)
      .some(val => val.toLowerCase().includes(filtro.toLowerCase()))
  );

  const stampaTabella = () => window.print();

  const esportaExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtrati);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mezzi");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "mezzi.xlsx");
  };

  const eliminaMezzo = async (id, modello) => {
    if (!window.confirm(`Vuoi eliminare il mezzo "${modello}"?`)) return;
    try {
      await deleteDoc(doc(db, "MEZZI", id));
      setMezzi(prev => prev.filter(m => m.id !== id));
      toast.success(`🗑️ Mezzo "${modello}" eliminato`);
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
      toast.error("❌ Errore nell'eliminazione");
    }
  };

  return (
    <div className="d-flex flex-wrap gap-4">
      {/* 👉 Pannello laterale riepilogo */}
      <div className="p-3 border rounded bg-light" style={{ minWidth: "300px", maxHeight: "80vh", overflowY: "auto" }}>
        <h5 className="mb-3">📋 Riepilogo mezzi visibili</h5>
        {filtrati.length > 0 ? (
          <ul className="list-group">
            {filtrati.map((m) => (
              <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{m.modello || "—"}</strong><br />
                  <small>{m.marca || "—"} • {m.targa || "—"} • Cliente: {m.clienteId || "—"}</small>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setMezzoDaModificare(m.id)}
                >
                  ✏️
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Nessun mezzo corrispondente alla ricerca.</p>
        )}
      </div>

      {/* 👉 Tabella principale */}
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>🚚 Elenco Mezzi</h3>
          <div className="d-flex gap-2">
            <CsvExport
              dati={filtrati}
              intestazioni={intestazioni}
              nomeFile="mezzi.csv"
            />
            <button className="btn btn-outline-success" onClick={esportaExcel}>
              📤 Excel
            </button>
            <button className="btn btn-outline-secondary" onClick={stampaTabella}>
              🖨️ Stampa
            </button>
          </div>
        </div>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="🔍 Cerca per modello, targa o cliente ID..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        {mezzoDaModificare && (
          <ModificaMezzo
            mezzoId={mezzoDaModificare}
            onClose={() => setMezzoDaModificare(null)}
            onAggiorna={fetchMezzi}
          />
        )}

        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Modello</th>
              <th>Marca</th>
              <th>Targa</th>
              <th>Anno</th>
              <th>Cliente ID</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtrati.length > 0 ? (
              filtrati.map((m) => (
                <tr key={m.id}>
                  <td>{m.modello || "—"}</td>
                  <td>{m.marca || "—"}</td>
                  <td>{m.targa || "—"}</td>
                  <td>{m.anno || "—"}</td>
                  <td>{m.clienteId || "—"}</td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setMezzoDaModificare(m.id)}
                    >
                      ✏️ Modifica
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => eliminaMezzo(m.id, m.modello)}
                    >
                      🗑️ Elimina
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  Nessun mezzo trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MezziTable;