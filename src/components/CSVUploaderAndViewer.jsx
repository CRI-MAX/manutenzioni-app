import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import Papa from "papaparse";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";

const CSVUploaderAndViewer = () => {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.name.endsWith(".csv")) {
      toast.error("❌ Il file deve essere in formato .csv");
      return;
    }

    setFile(selected);
  };

  const handleUploadAndParse = async () => {
    if (!file) {
      toast.warning("⚠️ Seleziona un file CSV prima di caricare");
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

  return (
    <div className="mb-4">
      <h5>📤 Carica e visualizza CSV</h5>
      <input type="file" accept=".csv" onChange={handleFileChange} className="form-control mb-2" />
      <button className="btn btn-primary" onClick={handleUploadAndParse} disabled={loading}>
        {loading ? "Caricamento..." : "📎 Carica e Visualizza"}
      </button>

      {rows.length > 0 && (
        <>
          <Form.Control
            type="text"
            placeholder="🔍 Cerca nei dati..."
            value={search}
            onChange={handleSearchChange}
            className="mt-4 mb-3"
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
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default CSVUploaderAndViewer;