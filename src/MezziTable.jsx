import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { normalizzaMezzo } from "./utils/normalizza";
import CsvExport from "./CsvExport";

function MezziTable() {
  const [mezzi, setMezzi] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const fetchMezzi = async () => {
      const snapshot = await getDocs(collection(db, "MEZZI"));
      const dati = snapshot.docs.map(doc => normalizzaMezzo(doc.data()));
      setMezzi(dati);
    };
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
    m.modello.toLowerCase().includes(filtro.toLowerCase()) ||
    m.targa.toLowerCase().includes(filtro.toLowerCase()) ||
    m.clienteId.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>🚚 Elenco Mezzi</h3>
        <CsvExport
          dati={filtrati}
          intestazioni={intestazioni}
          nomeFile="mezzi.csv"
        />
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Cerca per modello, targa o cliente ID..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Modello</th>
            <th>Marca</th>
            <th>Targa</th>
            <th>Anno</th>
            <th>Cliente ID</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((m, i) => (
              <tr key={i}>
                <td>{m.modello}</td>
                <td>{m.marca}</td>
                <td>{m.targa}</td>
                <td>{m.anno}</td>
                <td>{m.clienteId}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                Nessun mezzo trovato.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MezziTable;