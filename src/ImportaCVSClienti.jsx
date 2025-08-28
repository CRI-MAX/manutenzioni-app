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
          const clientiCorretti = results.data.map((riga) => ({
            ragioneSociale: riga["Cliente"] || riga["Ragione Sociale"] || riga["Nome completo"] || "—",
            partitaIVA: riga["Partita IVA"] || riga["P.IVA"] || "",
            indirizzo: riga["Indirizzo"] || riga["Indirizzo esteso"] || "",
            email: riga["Email"] || riga["EMail"] || "",
            telefono: riga["Telefono"] || riga["Telefono 1"] || "",
            referente: riga["Referente"] || riga["Contatti"] || "",
            dataCreazione: new Date()
          }));

          for (const cliente of clientiCorretti) {
            await addDoc(collection(db, "CLIENTI"), cliente);
          }

          setMessaggio(`✅ Importati ${clientiCorretti.length} clienti con successo.`);
          setFile(null);
        } catch (error) {
          console.error("Errore durante l'importazione:", error);
          setMessaggio("❌ Errore durante l'importazione.");
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        console.error("Errore nel parsing CSV:", err);
        setMessaggio("❌ Errore nel parsing del file.");
        setLoading(false);
      }
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