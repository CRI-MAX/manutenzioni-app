import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./CsvUploader.css";

function CsvUploader({ titolo = "Importa CSV/XLSX", collezione = "CLIENTI" }) {
  const [dati, setDati] = useState([]);
  const [intestazioni, setIntestazioni] = useState([]);
  const [caricamento, setCaricamento] = useState(false);
  const [messaggio, setMessaggio] = useState("");

  const normalizza = (riga) => {
    if (collezione === "CLIENTI") {
      return {
        ragioneSociale: riga["Cliente"] || riga["Ragione Sociale"] || riga["Nome completo"] || "—",
        indirizzo: riga["Indirizzo"] || riga["Indirizzo esteso"] || "",
        telefono: riga["Telefono"] || riga["Telefono 1"] || "",
        email: riga["Email"] || riga["EMail"] || "",
        partitaIVA: riga["Partita IVA"] || "",
        comune: riga["Comune"] || "",
        referente: riga["Referente"] || riga["Contatti"] || "",
        cellulare: riga["Cellulare"] || "",
        dataCreazione: new Date().toISOString()
      };
    } else if (collezione === "MEZZI") {
      return {
        modello: riga["Modello"] || riga["Mezzo"] || "—",
        targa: riga["Targa"] || "",
        marca: riga["Marca"] || "",
        anno: riga["Anno"] || "",
        clienteId: riga["Cliente ID"] || ""
      };
    } else {
      return riga;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    try {
      let raw = [];

      if (ext === "csv") {
        const text = await file.text();
        const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
        raw = data;
      } else if (ext === "xlsx") {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        raw = XLSX.utils.sheet_to_json(sheet);
      } else {
        setMessaggio("❌ Formato non supportato. Usa .csv o .xlsx");
        return;
      }

      const corretti = raw.map(normalizza);
      setDati(corretti);
      setIntestazioni(Object.keys(corretti[0] || {}));
      setMessaggio(`✅ ${corretti.length} record pronti per l'importazione`);
    } catch (err) {
      console.error("Errore nel parsing:", err);
      setMessaggio("❌ Errore durante la lettura del file");
    }
  };

  const salvaSuFirebase = async () => {
    if (dati.length === 0) return;
    setCaricamento(true);
    try {
      for (const item of dati) {
        await addDoc(collection(db, collezione), item);
      }
      setMessaggio(`✅ ${dati.length} record salvati nella collezione "${collezione}"`);
      setDati([]);
      setIntestazioni([]);
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      setMessaggio("❌ Errore nel salvataggio su Firebase");
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="csv-uploader">
      <h3>{titolo}</h3>
      <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
      {messaggio && <p className="status-message">{messaggio}</p>}

      {dati.length > 0 && (
        <>
          <table className="csv-table">
            <thead>
              <tr>
                {intestazioni.map((col, index) => (
                  <th key={index}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dati.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {intestazioni.map((col, colIndex) => (
                    <td key={colIndex}>{String(row[col] ?? "—")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={salvaSuFirebase} disabled={caricamento}>
            {caricamento ? "⏳ Salvataggio in corso..." : "📤 Salva su Firebase"}
          </button>
        </>
      )}
    </div>
  );
}

export default CsvUploader;