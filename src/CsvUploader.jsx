import React, { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./CsvUploader.css"; // opzionale per lo stile

function CsvUploader({ titolo = "Importa CSV", collezione = "CLIENTI" }) {
  const [dati, setDati] = useState([]);
  const [intestazioni, setIntestazioni] = useState([]);
  const [caricamento, setCaricamento] = useState(false);
  const [messaggio, setMessaggio] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setDati(results.data);
        setIntestazioni(Object.keys(results.data[0] || {}));
        setMessaggio(`✅ ${results.data.length} record pronti per l'importazione`);
      },
      error: function (err) {
        console.error("Errore nel parsing:", err);
        setMessaggio("❌ Errore nel parsing del file CSV");
      }
    });
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
      <input type="file" accept=".csv" onChange={handleFileUpload} />
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
                    <td key={colIndex}>{row[col]}</td>
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