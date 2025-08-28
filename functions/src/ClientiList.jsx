import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function ClientiList() {
  const [clienti, setClienti] = useState([]);

  useEffect(() => {
    const fetchClienti = async () => {
      const snapshot = await getDocs(collection(db, "CLIENTI"));
      const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClienti(dati);
    };
    fetchClienti();
  }, []);

  return (
    <div className="clienti-list">
      <h3>📋 Elenco Clienti</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Ragione Sociale</th>
            <th>Indirizzo</th>
            <th>Telefono</th>
            <th>Email</th>
            <th>Comune</th>
          </tr>
        </thead>
        <tbody>
          {clienti.map((c) => (
            <tr key={c.id}>
              <td>{c.ragioneSociale}</td>
              <td>{c.indirizzo}</td>
              <td>{c.telefono}</td>
              <td>{c.email}</td>
              <td>{c.comune}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientiList;