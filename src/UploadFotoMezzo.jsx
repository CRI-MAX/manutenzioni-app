import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

function UploadFotoMezzo({ mezzoId }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const storageRef = ref(storage, `mezzi/${mezzoId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "MEZZI", mezzoId), { fotoUrl: url });
    toast.success("📸 Foto mezzo caricata");
  };

  return (
    <div className="mb-3">
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button className="btn btn-primary mt-2" onClick={handleUpload}>
        📤 Carica Foto Mezzo
      </button>
    </div>
  );
}

export default UploadFotoMezzo;