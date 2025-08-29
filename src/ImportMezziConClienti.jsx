import React, { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { storage, db } from "../../firebase";
import Papa from "papaparse";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";

const ImportMezziConClienti = () => {
  const [file, setFile] = useState(null);
  const [mezzi, setMezzi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emailToIdMap, setEmailToIdMap] = useState({});

  useEffect(() => {
    const fetchClienti = async () => {
      const snapshot = await getDocs(collection(db, "CLIENTI"));
      const map = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.email) map[data.email.trim().toLowerCase()] = doc.id;
      });
      setEmailToIdMap(map);
    };
    fetchClienti();
  }, []);

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
      toast.warning(⚠️ Nessun file selezionato");
      return;
    }

    setLoading(true);
    try {
      const storageRef = ref(storage, `mezzi_csv/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);
      const text = await response.text();

      const { data } = Papa.parse(text, {
        header: true,
        skipEmptyLines: true
      });

      const enriched = data.map((row) => {
        const email = (row.clienteEmail || "").trim().toLowerCase();
        const clienteId = emailToIdMap[email] || null;
        return {
          ...row,
          clienteId
        };
      });

      setMezzi(enriched);
      toast.success("📄 CSV caricato e associato ai clienti");
    } catch (error) {
      console.error("Errore CSV:", error);
      toast.error("❌ Errore durante il caricamento o parsing");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    const valid = mezzi.filter(m => m.clienteId);
    const colRef = collection(db, "MEZZI");
    let count = 0;
    try {
      for (const mezzo of valid) {
        await addDoc(colRef, mezzo);
        count++;
      }
      toast.success(`✅ Importati ${count} mezzi associati`);
    } catch (err) {
      console.error("Errore importazione:", err);
      toast.error("❌ Errore durante l'import su Firestore");
    }
  };

  return (
    <div className="mb-5">
      <h5>🚚 Importa Mezzi con Associazione Clienti</h5>

      <Form.Group className="mb-2">
        <Form.Label>📁 Seleziona file CSV</Form.Label>
        <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
      </Form.Group>

      <Button variant="success" className="me-2" onClick={handleUploadAndParse} disabled={loading}>
        {loading ? "⏳ Caricamento..." : "📎 Carica e Associa"}
      </Button>

      {mezzi.length > 0 && (
        <>
          <p className="mt-3">
            ✅ Mezzi pronti per l'import: {mezzi.filter(m => m.clienteId).length} associati,{" "}
            {mezzi.filter(m => !m.clienteId).length} senza cliente
          </p>
          <Button variant="primary" onClick={handleImport}>
            🚀 Importa su Firestore
          </Button>
        </>
      )}
    </div>
  );
};

export default ImportMezziConClienti;