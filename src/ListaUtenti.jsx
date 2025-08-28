import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const ListaUtenti = () => {
  const [utenti, setUtenti] = useState([]);

  useEffect(() => {
    const fetchUtenti = async () => {
      try {
        const snapshot = await getDocs(collection(db, "UTENTI"));
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUtenti(lista);
      } catch (error) {
        console.error("Errore nel recupero utenti:", error);
      }
    };

    fetchUtenti();
  }, []);

  return (
    <div className="container mt-4">
      <h3>📋 Elenco Utenti Firestore</h3>
      <table className="table table-bordered mt-3">
        <thead className="table-light">
          <tr>
            <th>ID Documento</th>
            <th>UID</th>
            <th>Email</th>
            <th>Ruolo</th>
          </tr>
        </thead>
        <tbody>
          {utenti.map((utente) => (
            <tr key={utente.id}>
              <td>{utente.id}</td>
              <td>{utente.UId || utente.uid || utente.Assigned_username || "—"}</td>
              <td>{utente.Email || utente.email || "—"}</td>
              <td>{utente.Role || utente.ruolo || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaUtenti;