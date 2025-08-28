import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const GestioneRuoli = () => {
  const [utenti, setUtenti] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUtenti = async () => {
    try {
      const snapshot = await getDocs(collection(db, "UTENTI"));
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUtenti(lista);
      setLoading(false);
    } catch (error) {
      console.error("Errore nel recupero utenti:", error);
    }
  };

  useEffect(() => {
    fetchUtenti();
  }, []);

  const aggiornaRuolo = async (id, nuovoRuolo) => {
    try {
      const ref = doc(db, "UTENTI", id);
      await updateDoc(ref, { Role: nuovoRuolo });
      fetchUtenti(); // ricarica la lista aggiornata
    } catch (error) {
      console.error("Errore nell'aggiornamento del ruolo:", error);
    }
  };

  if (loading) return <p className="text-muted p-3">🔄 Caricamento utenti...</p>;

  return (
    <div className="container mt-4">
      <h3>🛠️ Gestione Ruoli Utenti</h3>
      <table className="table table-bordered mt-3">
        <thead className="table-light">
          <tr>
            <th>Email</th>
            <th>UID</th>
            <th>Ruolo</th>
            <th>Modifica</th>
          </tr>
        </thead>
        <tbody>
          {utenti.map((utente) => (
            <tr key={utente.id}>
              <td>{utente.Email || utente.email || "—"}</td>
              <td>{utente.UId || utente.uid || utente.Assigned_username || "—"}</td>
              <td>{utente.Role || utente.ruolo || "—"}</td>
              <td>
                <select
                  className="form-select"
                  value={utente.Role || utente.ruolo || ""}
                  onChange={(e) => aggiornaRuolo(utente.id, e.target.value)}
                >
                  <option value="">—</option>
                  <option value="admin">admin</option>
                  <option value="tecnico">tecnico</option>
                  <option value="cliente">cliente</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestioneRuoli;