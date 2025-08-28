import React from "react";
import { CSVLink } from "react-csv";

function CsvExport({ dati = [], intestazioni = [], nomeFile = "export.csv", className = "btn btn-primary" }) {
  if (!dati || dati.length === 0) {
    return <button className="btn btn-secondary" disabled>CSV vuoto</button>;
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