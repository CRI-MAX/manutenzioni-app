import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { normalizzaUtente } from "./utils/normalizza";
import DateDisplay from "./components/DateDisplay"; // ✅ integrato

function DashboardUtenti() {
  const [utenti, setUtenti] = useState([]);

  useEffect(() => {
    const fetchUtenti = async () => {
      const snapshot = await getDocs(collection(db, "UTENTI"));
      const dati = snapshot.docs.map(d => ({
        id: d.id,
        ...normalizzaUtente(d.data())
      }));
      setUtenti(dati);
    };
    fetchUtenti();
  }, []);

  const totali = {
    admin: utenti.filter(u => u.ruolo === "admin").length,
    tecnico: utenti.filter(u => u.ruolo === "tecnico").length,
    cliente: utenti.filter(u => u.ruolo === "cliente").length,
    attivi: utenti.filter(u => u.attivo).length,
    disattivi: utenti.filter(u => !u.attivo).length
  };

  const ultimi = [...utenti]
    .sort((a, b) => (b.dataCreazione?.seconds || 0) - (a.dataCreazione?.seconds || 0))
    .slice(0, 5);

  return (
    <div>
      <h3>📊 Dashboard Utenti</h3>
      <div className="row mb-4">
        <div className="col">
          <div className="card p-3 text-center">
            <h5>Admin</h5>
            <p className="display-6">{totali.admin}</p>
          </div>
        </div>
        <div className="col">
          <div className="card p-3 text-center">
            <h5>Tecnici</h5>
            <p className="display-6">{totali.tecnico}</p>
          </div>
        </div>
        <div className="col">
          <div className="card p-3 text-center">
            <h5>Clienti</h5>
            <p className="display-6">{totali.cliente}</p>
          </div>
        </div>
        <div className="col">
          <div className="card p-3 text-center">
            <h5>Attivi</h5>
            <p className="display-6 text-success">{totali.attivi}</p>
          </div>
        </div>
        <div className="col">
          <div className="card p-3 text-center">
            <h5>Disattivi</h5>
            <p className="display-6 text-danger">{totali.disattivi}</p>
          </div>
        </div>
      </div>

      <h5 className="mt-4">🕒 Ultimi utenti registrati</h5>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ruolo</th>
            <th>Stato</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {ultimi.map((u, i) => (
            <tr key={i}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.ruolo}</td>
              <td>{u.attivo ? "✅" : "⛔"}</td>
              <td><DateDisplay data={u.dataCreazione} /></td> {/* ✅ blindato */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardUtenti;