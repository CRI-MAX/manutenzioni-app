import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { toast } from "react-toastify";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

function GestioneRuoli() {
  const [utenti, setUtenti] = useState([]);
  const [filtroRuolo, setFiltroRuolo] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUtenti = async () => {
    try {
      const snapshot = await getDocs(collection(db, "UTENTI"));
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().Email || doc.data().email || "—",
        uid: doc.data().UId || doc.data().uid || doc.data().Assigned_username || "—",
        ruolo: doc.data().Role || doc.data().ruolo || "",
      }));
      setUtenti(lista);
      setLoading(false);
    } catch (error) {
      console.error("Errore nel recupero utenti:", error);
      toast.error("❌ Errore nel caricamento utenti");
    }
  };

  useEffect(() => {
    fetchUtenti();
  }, []);

  const aggiornaRuolo = async (id, nuovoRuolo) => {
    if (!["admin", "tecnico", "cliente"].includes(nuovoRuolo)) return;
    try {
      const ref = doc(db, "UTENTI", id);
      await updateDoc(ref, { Role: nuovoRuolo });
      toast.success(`✅ Ruolo aggiornato a "${nuovoRuolo}"`);
      fetchUtenti();
    } catch (error) {
      console.error("Errore nell'aggiornamento del ruolo:", error);
      toast.error("❌ Errore nell'aggiornamento del ruolo");
    }
  };

  const filtrati = utenti.filter(u =>
    (filtroRuolo ? u.ruolo === filtroRuolo : true) &&
    u.email.toLowerCase().includes(filtroEmail.toLowerCase())
  );

  if (loading) return <p className="text-muted p-3">🔄 Caricamento utenti...</p>;

  return (
    <div className="container mt-4">
      <h3>🛠️ Gestione Ruoli Utenti</h3>

      <div className="d-flex gap-3 mb-3 flex-wrap">
        <Form.Select
          value={filtroRuolo}
          onChange={(e) => setFiltroRuolo(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="">Tutti i ruoli</option>
          <option value="admin">Admin</option>
          <option value="tecnico">Tecnico</option>
          <option value="cliente">Cliente</option>
        </Form.Select>

        <Form.Control
          type="text"
          placeholder="🔍 Cerca per email..."
          value={filtroEmail}
          onChange={(e) => setFiltroEmail(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <Button variant="outline-secondary" onClick={() => {
          setFiltroRuolo("");
          setFiltroEmail("");
        }}>
          🔄 Reset filtri
        </Button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Email</th>
            <th>UID</th>
            <th>Ruolo</th>
            <th>Modifica</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((utente) => (
              <tr key={utente.id}>
                <td>{utente.email}</td>
                <td>{utente.uid}</td>
                <td>{utente.ruolo || "—"}</td>
                <td>
                  <Form.Select
                    value={utente.ruolo || ""}
                    onChange={(e) => aggiornaRuolo(utente.id, e.target.value)}
                  >
                    <option value="">—</option>
                    <option value="admin">admin</option>
                    <option value="tecnico">tecnico</option>
                    <option value="cliente">cliente</option>
                  </Form.Select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Nessun utente corrispondente ai filtri.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GestioneRuoli;