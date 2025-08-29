import React from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";

/**
 * Componente per importare file CSV o Excel e passarli al parent.
 * @param {Function} onUpload - Callback con i dati importati
 * @param {string} titolo - Titolo visivo (opzionale)
 */
const ImportaFile = ({ onUpload, titolo = "Importa file" }) => {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    try {
      let dati = [];

      if (ext === "csv") {
        const text = await file.text();
        const { data } = Papa.parse(text, {
          header: true,
          skipEmptyLines: true
        });
        dati = data;
      } else if (ext === "xlsx") {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        dati = XLSX.utils.sheet_to_json(sheet);
      } else {
        toast.error("❌ Formato non supportato. Usa .csv o .xlsx");
        return;
      }

      if (dati.length === 0) {
        toast.warning("⚠️ Il file è vuoto o non leggibile.");
        return;
      }

      toast.success(`📄 ${dati.length} record importati`);
      onUpload(dati);
    } catch (err) {
      console.error("Errore importazione:", err);
      toast.error("❌ Errore durante l'importazione del file.");
    }
  };

  return (
    <div className="mb-3">
      <Form.Label>{titolo}</Form.Label>
      <Form.Control type="file" accept=".csv,.xlsx" onChange={handleFile} />
    </div>
  );
};

export default ImportaFile;