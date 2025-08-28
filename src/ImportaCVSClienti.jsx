import React, { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

const ImportaCSVClienti = () => {
  const [file, setFile] = useState(null);
  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessaggio("");
  };

  const handleImport = () => {
    if (!file) {
      setMessaggio("❌ Seleziona un file CSV.");
      return;
    }

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          for (const cliente of results.data) {
            await addDoc(collection(db, "clienti"), {
              ragioneSociale: cliente.ragioneSociale || "—",
              partitaIVA: cliente.partitaIVA || "—",
              indirizzo: cliente.indirizzo || "—",
              email: cliente.email || "—",
              telefono: cliente.telefono || "—",
              referente: cliente.referente || "—",
            });
          }
          setMessaggio("✅ Importazione completata con successo.");
          setFile(null);
        } catch (error) {
          console.error("Errore durante l'importazione:", error);
          setMessaggio("❌ Errore durante l'importazione.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="p-3 border rounded bg-light mb-4">
      <h5 className="mb-3">📥 Importa Clienti da CSV</h5>

      <Form.Group className="mb-3">
        <Form.Label>Seleziona file CSV</Form.Label>
        <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
        {file && <div className="mt-2 text-muted">📎 File selezionato: {file.name}</div>}
      </Form.Group>

      <Button variant="success" onClick={handleImport} disabled={loading}>
        {loading ? "Importazione in corso..." : "Importa clienti"}
      </Button>

      {messaggio && (
        <Alert
          variant={messaggio.startsWith("✅") ? "success" : "danger"}
          className="mt-3"
        >
          {messaggio}
        </Alert>
      )}
    </div>
  );
};

export default ImportaCSVClienti;