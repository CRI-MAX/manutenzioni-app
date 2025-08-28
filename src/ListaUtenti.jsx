import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";

const ListaUtenti = () => {
  const [utenti, setUtenti] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchUtenti = async () => {
      try {
        const snapshot = await getDocs(collection(db, "UTENTI"));
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          uid: doc.data().UId || doc.data().uid || doc.data().Assigned_username || "—",
          email: doc.data().Email || doc.data().email || "—",
          ruolo: doc.data().Role || doc.data().ruolo || "—"
        }));
        setUtenti(lista);
      } catch (error) {
        console.error("Errore nel recupero utenti:", error);
      }
    };

    fetchUtenti();
  }, []);

  const filtrati = utenti.filter(u =>
    u.email.toLowerCase().includes(query.toLowerCase()) ||
    u.ruolo.toLowerCase().includes(query.toLowerCase())
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
    <div className="container mt-4">
      <h3>📋 Elenco Utenti Firestore</h3>

      <Form.Control
        type="text"
        placeholder="🔍 Cerca per email o ruolo..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
        style={{ maxWidth: "300px" }}
      />

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID Documento</th>
            <th>UID</th>
            <th>Email</th>
            <th>Ruolo</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((utente) => (
              <tr key={utente.id}>
                <td>{utente.id}</td>
                <td>{utente.uid}</td>
                <td>{utente.email}</td>
                <td>{renderRuoloBadge(utente.ruolo)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Nessun utente corrispondente alla ricerca.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListaUtenti;