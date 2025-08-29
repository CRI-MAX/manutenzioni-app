import React from "react";
import { CSVLink } from "react-csv";

/**
 * Esporta un array di oggetti in formato CSV.
 * @param {Array} dati - Array di oggetti da esportare
 * @param {Array} intestazioni - Array di { label, key } per le colonne
 * @param {string} nomeFile - Nome del file CSV
 * @param {string} className - Classe CSS per il bottone
 */
function CsvExport({
  dati = [],
  intestazioni = [],
  nomeFile = "export.csv",
  className = "btn btn-outline-primary"
}) {
  const haDati = Array.isArray(dati) && dati.length > 0;

  if (!haDati) {
    return (
      <button className="btn btn-outline-secondary" disabled>
        📄 CSV vuoto
      </button>
    );
  }

  return (
    <CSVLink
      data={dati}
      headers={intestazioni}
      filename={nomeFile}
      className={className}
    >
      📤 Esporta CSV
    </CSVLink>
  );
}

export default CsvExport;