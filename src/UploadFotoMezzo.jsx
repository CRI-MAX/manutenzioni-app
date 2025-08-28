import React, { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

function UploadFotoMezzo({ mezzoId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fotoAttuale, setFotoAttuale] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFoto = async () => {
      try {
        const docRef = doc(db, "MEZZI", mezzoId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.fotoUrl) setFotoAttuale(data.fotoUrl);
        }
      } catch (error) {
        console.error("Errore nel recupero foto mezzo:", error);
      }
    };
    if (mezzoId) fetchFoto();
  }, [mezzoId]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("❌ Il file selezionato non è un'immagine.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error("❌ L'immagine supera i 5MB.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("⚠️ Seleziona un'immagine prima di caricare.");
      return;
    }

    setLoading(true);
    try {
      const storageRef = ref(storage, `mezzi/${mezzoId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "MEZZI", mezzoId), { fotoUrl: url });
      toast.success("📸 Foto mezzo caricata con successo");
      setFotoAttuale(url);
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Errore nell'upload:", error);
      toast.error("❌ Errore durante il caricamento.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!fotoAttuale) return;
    if (!window.confirm("Vuoi eliminare la foto attuale del mezzo?")) return;

    setLoading(true);
    try {
      const fileRef = ref(storage, fotoAttuale);
      await deleteObject(fileRef);
      await updateDoc(doc(db, "MEZZI", mezzoId), { fotoUrl: "" });
      toast.success("🗑️ Foto mezzo eliminata");
      setFotoAttuale(null);
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
      toast.error("❌ Errore durante l'eliminazione.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label">📷 Seleziona nuova foto mezzo</label>
      <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} />

      {preview && (
        <div className="mt-3">
          <p className="mb-1"><strong>Anteprima nuova foto:</strong></p>
          <img src={preview} alt="Anteprima" className="img-thumbnail" style={{ maxWidth: "200px" }} />
        </div>
      )}

      <button className="btn btn-primary mt-3" onClick={handleUpload} disabled={loading}>
        {loading ? "Caricamento in corso..." : "📤 Carica Foto Mezzo"}
      </button>

      {fotoAttuale && (
        <div className="mt-4">
          <p className="mb-1"><strong>Foto attuale:</strong></p>
          <img src={fotoAttuale} alt="Foto attuale" className="img-thumbnail" style={{ maxWidth: "200px" }} />
          <button className="btn btn-outline-danger mt-2" onClick={handleDelete} disabled={loading}>
            🗑️ Elimina Foto
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadFotoMezzo;