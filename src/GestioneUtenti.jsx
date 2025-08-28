import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

const GestioneUtenti = () => {
  const [utenti, setUtenti] = useState([]);
  const [clienti, setClienti] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [utentiSnap, clientiSnap] = await Promise.all([
          getDocs(collection(db, "utenti")),
          getDocs(collection(db, "clienti")),
        ]);
        setUtenti(utentiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setClienti(clientiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Errore nel caricamento utenti/clienti:", error);
      }
    };
    fetchData();
  }, []);

  const aggiornaRuolo = async (id, nuovoRuolo) => {
    try {
      await updateDoc(doc(db, "utenti", id), { ruolo: nuovoRuolo });
      aggiornaVista();
    } catch (error) {
      console.error("Errore aggiornamento ruolo:", error);
    }
  };

  const aggiornaCliente = async (id, clienteId) => {
    try {
      await updateDoc(doc(db, "utenti", id), { clienteId });
      aggiornaVista();
    } catch (error) {
      console.error("Errore aggiornamento cliente:", error);
    }
  };

  const eliminaUtente = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questo utente?")) {
      try {
        await deleteDoc(doc(db, "utenti", id));
        setUtenti((prev) => prev.filter((u) => u.id !== id));
      } catch (error) {
        console.error("Errore eliminazione utente:", error);
      }
    }
  };

  const aggiornaVista = async () => {
    try {
      const snapshot = await getDocs(collection(db, "utenti"));
      setUtenti(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Errore aggiornamento vista:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-4">👥 Gestione Utenti</h3>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Email</th>
            <th>Ruolo</th>
            <th>Cliente assegnato</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {utenti.length > 0 ? (
            utenti.map((u) => (
              <tr key={u.id}>
                <td>{u.email || "—"}</td>
                <td>
                  <Form.Select
                    value={u.ruolo || ""}
                    onChange={(e) => aggiornaRuolo(u.id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="tecnico">Tecnico</option>
                    <option value="cliente">Cliente</option>
                  </Form.Select>
                </td>
                <td>
                  {u.ruolo === "tecnico" ? (
                    <Form.Select
                      value={u.clienteId || ""}
                      onChange={(e) => aggiornaCliente(u.id, e.target.value)}
                    >
                      <option value="">—</option>
                      {clienti.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.ragioneSociale}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => eliminaUtente(u.id)}
                  >
                    Elimina
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Nessun utente registrato.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default GestioneUtenti;