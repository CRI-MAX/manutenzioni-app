import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { storage, db } from "./firebase";
import { toast } from "react-toastify";

function AllegatiUploader({ mezzoId, onAggiorna }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    const validFiles = selected.filter(file =>
      file.type.startsWith("image/") ||
      file.type.includes("pdf") ||
      file.type.includes("word") ||
      file.type.includes("excel")
    );

    if (validFiles.length !== selected.length) {
      toast.warning("⚠️ Alcuni file non sono supportati e verranno ignorati.");
    }

    setFiles(validFiles);
  };

  const handleUpload = async () => {
    if (!mezzoId) {
      toast.error("❌ ID mezzo non valido.");
      return;
    }

    if (!files.length) {
      toast.warning("⚠️ Seleziona almeno un file da caricare.");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "MEZZI", mezzoId);
      const snapshot = await getDoc(docRef);
      const dati = snapshot.exists() ? snapshot.data() : {};
      const allegatiCorrenti = Array.isArray(dati.allegati) ? dati.allegati : [];

      const nuoviAllegati = [];

      for (const file of files) {
        const tipo = file.type.startsWith("image/") ? "foto" : "documento";
        const fileRef = ref(storage, `mezzi/${mezzoId}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        nuoviAllegati.push({
          url,
          nome: file.name,
          tipo
        });
      }

      await updateDoc(docRef, {
        allegati: [...allegatiCorrenti, ...nuoviAllegati]
      });

      toast.success(`✅ Caricati ${nuoviAllegati.length} allegati`);
      setFiles([]);
      if (onAggiorna) onAggiorna();
    } catch (error) {
      console.error("Errore durante l'upload:", error);
      toast.error("❌ Errore nel caricamento degli allegati.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="form-label">📎 Carica allegati (foto o documenti)</label>
      <input
        type="file"
        multiple
        className="form-control"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        onChange={handleFileSelect}
      />

      {files.length > 0 && (
        <div className="mt-3">
          <p><strong>Anteprima:</strong></p>
          <div className="d-flex flex-wrap gap-3">
            {files.map((file, i) => (
              file.type.startsWith("image/") ? (
                <img
                  key={i}
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="img-thumbnail"
                  style={{ maxWidth: "120px" }}
                />
              ) : (
                <div key={i} className="text-muted">
                  📄 {file.name}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <button
        className="btn btn-primary mt-3"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Caricamento in corso..." : "📤 Carica Allegati"}
      </button>
    </div>
  );
}

export default AllegatiUploader;