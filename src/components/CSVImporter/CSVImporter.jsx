import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { storage, db } from "../../firebase";
import Papa from "papaparse";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import SafeRowEditable, { validateRow } from "./SafeRowEditable";

const CSVImporter = () => {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [collectionName, setCollectionName] = useState(
    localStorage.getItem("lastCollection") || "IMPORT_CSV"
  );

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected || !selected.name.endsWith(".csv")) {
      toast.error("❌ Seleziona un file .csv valido");
      return;
    }
    setFile(selected);
  };

  const handleUploadAndParse = async () => {
    if (!file) {
      toast.warning("⚠️ Nessun file selezionato");
      return;
    }

    setLoading(true);
    try {
      const storageRef = ref(storage, `csv/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);
      const text = await response.text();

      const { data } = Papa.parse(text, {
        header: true,
        skipEmptyLines: true
      });

      setRows(data);
      setFilteredRows(data);
      localStorage.setItem("lastCollection", collectionName);
      toast.success("📄 CSV caricato e visualizzato");
    } catch (error) {
      console.error("Errore CSV:", error);
      toast.error("❌ Errore durante il caricamento o parsing");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(value)
      )
    );
    setFilteredRows(filtered);
  };

  const handleUpdateRow = (index, updatedRow) => {
    const updated = [...filteredRows];
    updated[index] = updatedRow;
    setFilteredRows(updated);
  };

  const handleImportValidRows = async () => {
    const validRows = filteredRows.filter(validateRow);
    const colRef = collection(db, collectionName);
    let count = 0;
    try {
      for (const row of validRows) {
        await addDoc(colRef, row);
        count++;
      }
      toast.success(`✅ Importate ${count} righe valide`);
    } catch (err) {
      console.error("Errore importazione:", err);
      toast.error("❌ Errore durante l'import su Firestore");
    }
  };

  const handleExportInvalidRows = () => {
    const invalidRows = filteredRows.filter((r) => !validateRow(r));
    const csv = Papa.unparse(invalidRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "righe_non_valide.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const invalidCount = filteredRows.filter((r) => !validateRow(r)).length;

  return (
    <div className="mb-5">
      <h5>📤 Importa CSV su Firestore con validazione e modifica</h5>

      <Form.Group className="mb-2">
        <Form.Label>📁 Collezione di destinazione</Form.Label>
        <Form.Control
          type="text"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          placeholder="Es: CLIENTI, INTERVENTI, MEZZI..."
        />
      </Form.Group>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="form-control mb-2"
      />

      <button
        className="btn btn-success mb-3"
        onClick={handleUploadAndParse}
        disabled={loading}
      >
        {loading ? "⏳ Importazione in corso..." : "📎 Carica e Visualizza"}
      </button>

      {filteredRows.length > 0 && (
        <>
          <Form.Control
            type="text"
            placeholder="🔍 Cerca nei dati..."
            value={search}
            onChange={handleSearchChange}
            className="mb-3"
          />

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {Object.keys(filteredRows[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <SafeRowEditable
                  key={i}
                  row={row}
                  onUpdate={(r) => handleUpdateRow(i, r)}
                />
              ))}
            </tbody>
          </Table>

          <div className="mt-3">
            <p>⚠️ {invalidCount} righe non valide rilevate</p>
            <button
              className="btn btn-outline-danger me-2"
              onClick={handleExportInvalidRows}
            >
              📤 Esporta righe non valide
            </button>
            <button
              className="btn btn-primary"
              onClick={handleImportValidRows}
            >
              ✅ Importa solo righe valide
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CSVImporter;