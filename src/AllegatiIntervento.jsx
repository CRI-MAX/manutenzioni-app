import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "./firebase";
import { toast } from "react-toastify";

function AllegatiIntervento({ interventoId, onAggiorna }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      toast.warning("⚠️ Nessun file selezionato.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("❌ Il file supera i 10MB.");
      return;
    }

    const tipo = file.type.startsWith("image/") ? "foto" : "documento";
    const storageRef = ref(storage, `interventi/${interventoId}/${Date.now()}_${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const docRef = doc(db, "INTERVENTI", interventoId);
      const snapshot = await getDoc(docRef);
      const dati = snapshot.data();
      const allegati = dati?.allegati || [];

      await updateDoc(docRef, {
        allegati: [...allegati, { tipo, url, nome: file.name }]
      });

      toast.success(`📎 Allegato "${file.name}" caricato`);
      setFile(null);
      onAggiorna?.();
    } catch (error) {
      console.error("Errore durante l'upload:", error);
      toast.error("❌ Errore durante il caricamento del file.");
    }
  };

  return (
    <div className="mb-2">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="form-control form-control-sm"
      />
      <button
        className="btn btn-sm btn-outline-success mt-1"
        onClick={handleUpload}
        disabled={!file}
      >
        📤 Carica Allegato
      </button>
    </div>
  );
}

export default AllegatiIntervento;