import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "./firebase";
import { toast } from "react-toastify";

function AllegatiIntervento({ interventoId, onAggiorna }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const tipo = file.type.startsWith("image/") ? "foto" : "documento";
    const storageRef = ref(storage, `interventi/${interventoId}/${file.name}`);
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
  };

  return (
    <div className="mb-2">
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button className="btn btn-sm btn-outline-success mt-1" onClick={handleUpload}>
        📤 Carica Allegato
      </button>
    </div>
  );
}

export default AllegatiIntervento;