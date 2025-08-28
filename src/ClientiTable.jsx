import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { normalizzaCliente } from "./utils/normalizza";
import CsvExport from "./CsvExport";

function ClientiTable() {
  const [clienti, setClienti] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const fetchClienti = async () => {
      const snapshot = await getDocs(collection(db, "CLIENTI"));
      const dati = snapshot.docs.map(doc => normalizzaCliente(doc.data()));
      setClienti(dati);
    };
    fetchClienti();
  }, []);

  const intestazioni = [
    { label: "Ragione Sociale", key: "ragioneSociale" },
    { label: "Email", key: "email" },
    { label: "Telefono", key: "telefono" },
    { label: "Indirizzo", key: "indirizzo" }
  ];

  const filtrati = clienti.filter(c =>
    c.ragioneSociale.toLowerCase().includes(filtro.toLowerCase()) ||
    c.email.toLowerCase().includes(filtro.toLowerCase()) ||
    c.telefono.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>👥 Elenco Clienti</h3>
        <CsvExport
          dati={filtrati}
          intestazioni={intestazioni}
          nomeFile="clienti.csv"
        />
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Cerca cliente per nome, email o telefono..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Ragione Sociale</th>
            <th>Email</th>
            <th>Telefono</th>
            <th>Indirizzo</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((c, i) => (
              <tr key={i}>
                <td>{c.ragioneSociale}</td>
                <td>{c.email}</td>
                <td>{c.telefono}</td>
                <td>{c.indirizzo}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
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