import React, { useState } from "react";
import * as XLSX from "xlsx";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

const ImportaExcel = ({ tipo }) => {
  const [file, setFile] = useState(null);
  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessaggio("");
  };

  const handleImport = async () => {
    if (!file || !tipo) {
      setMessaggio("❌ Seleziona un file e il tipo di dati da importare.");
      return;
    }

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const dati = XLSX.utils.sheet_to_json(sheet);

      const collezione = tipo === "clienti" ? "CLIENTI" : "MEZZI";

      for (const item of dati) {
        const record =
          tipo === "clienti"
            ? {
                ragioneSociale: item.ragioneSociale || "—",
                partitaIVA: item.partitaIVA || "—",
                indirizzo: item.indirizzo || "—",
                email: item.email || "—",
                telefono: item.telefono || "—",
                referente: item.referente || "—",
                dataCreazione: new Date().toISOString() // ✅ blindato
              }
            : {
                marca: item.marca || "—",
                modello: item.modello || "—",
                matricola: item.matricola || "—",
                clienteId: item.clienteId || "—",
                dataCreazione: new Date().toISOString() // ✅ blindato
              };

        await addDoc(collection(db, collezione), record);
      }

      setMessaggio(`✅ Importazione completata con successo. (${dati.length} record)`);
      setFile(null);
    } catch (error) {
      console.error("Errore durante l'importazione:", error);
      setMessaggio("❌ Errore durante l'importazione. Controlla il file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 border rounded bg-light mb-4">
      <h5 className="mb-3">📥 Importa {tipo === "clienti" ? "Clienti" : "Mezzi"} da Excel</h5>

      <Form.Group className="mb-3">
        <Form.Label>Seleziona file Excel (.xlsx)</Form.Label>
        <Form.Control type="file" accept=".xlsx" onChange={handleFileChange} />
        {file && <div className="mt-2 text-muted">📎 File selezionato: {file.name}</div>}
      </Form.Group>

      <Button variant="success" onClick={handleImport} disabled={loading}>
        {loading ? "Importazione in corso..." : "Importa dati"}
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

export default ImportaExcel;