import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { normalizzaCliente } from "./utils/normalizza";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ✅ Importa SafeRow e CsvExport
import { SafeRow } from "./components/CSVImporter";
import CsvExport from "./CsvExport";

function ClientiTable() {
  const [clienti, setClienti] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const fetchClienti = async () => {
      try {
        const snapshot = await getDocs(collection(db, "CLIENTI"));
        const dati = snapshot.docs.map(doc => ({
          id: doc.id,
          ...normalizzaCliente(doc.data())
        }));
        setClienti(dati);
      } catch (error) {
        console.error("Errore nel caricamento clienti:", error);
        toast.error("❌ Errore nel caricamento dei clienti");
      }
    };
    fetchClienti();
  }, []);

  const intestazioni = [
    { label: "Ragione Sociale", key: "ragioneSociale" },
    { label: "Email", key: "email" },
    { label: "Telefono", key: "telefono" },
    { label: "Indirizzo", key: "indirizzo" },
    { label: "Referente", key: "referente" }
  ];

  const filtrati = clienti.filter(c =>
    c.ragioneSociale?.toLowerCase().includes(filtro.toLowerCase()) ||
    c.email?.toLowerCase().includes(filtro.toLowerCase()) ||
    c.telefono?.toLowerCase().includes(filtro.toLowerCase()) ||
    c.referente?.toLowerCase().includes(filtro.toLowerCase())
  );

  const stampaTabella = () => window.print();

  const esportaExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtrati);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clienti");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "clienti.xlsx");
  };

  const eliminaCliente = async (id, nome) => {
    if (!window.confirm(`Vuoi eliminare il cliente "${nome}"?`)) return;
    try {
      await deleteDoc(doc(db, "CLIENTI", id));
      setClienti(prev => prev.filter(c => c.id !== id));
      toast.success(`🗑️ Cliente "${nome}" eliminato`);
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
      toast.error("❌ Errore nell'eliminazione");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>👥 Elenco Clienti</h3>
        <div className="d-flex gap-2">
          <CsvExport
            dati={filtrati}
            intestazioni={intestazioni}
            nomeFile="clienti.csv"
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
        placeholder="🔍 Cerca per nome, email, telefono o referente..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Ragione Sociale</th>
            <th>Email</th>
            <th>Telefono</th>
            <th>Indirizzo</th>
            <th>Referente</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((c) => (
              <tr key={c.id}>
                <SafeRow row={c} />
                <td className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" disabled>
                    ✏️ Modifica
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminaCliente(c.id, c.ragioneSociale)}
                  >
                    🗑️ Elimina
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                Nessun cliente trovato.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ClientiTable;