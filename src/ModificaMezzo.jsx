import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { toast } from "react-toastify";

function ModificaMezzo({ mezzoId, onClose, onAggiorna }) {
  const [mezzo, setMezzo] = useState(null);
  const [file, setFile] = useState(null);
  const [interventi, setInterventi] = useState([]);

  useEffect(() => {
    const fetchMezzo = async () => {
      try {
        const docRef = doc(db, "MEZZI", mezzoId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setMezzo({ id: snapshot.id, ...snapshot.data() });
        } else {
          toast.error("❌ Mezzo non trovato");
        }
      } catch (error) {
        console.error("Errore nel caricamento mezzo:", error);
        toast.error("❌ Errore nel caricamento");
      }
    };

    const fetchInterventi = async () => {
      try {
        const q = query(
          collection(db, "INTERVENTI"),
          where("mezzoId", "==", mezzoId),
          orderBy("data", "desc")
        );
        const snapshot = await getDocs(q);
        const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInterventi(dati);
      } catch (error) {
        if (error.code === "failed-precondition") {
          toast.info("⚠️ Indice Firestore mancante. Crealo dalla console.");
          console.warn("Indice richiesto da Firestore:", error.message);
        } else {
          console.error("Errore nel recupero interventi:", error);
          toast.error("❌ Errore nel recupero interventi.");
        }
      }
    };

    if (mezzoId) {
      fetchMezzo();
      fetchInterventi();
    }
  }, [mezzoId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMezzo(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadFoto = async () => {
    if (!file) return null;
    const storageRef = ref(storage, `mezzi/${mezzoId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSave = async () => {
    if (!mezzo.modello || !mezzo.clienteId) {
      toast.warning("⚠️ Compila almeno Modello e Cliente ID");
      return;
    }

    try {
      const fotoUrl = await handleUploadFoto();
      const docRef = doc(db, "MEZZI", mezzo.id);
      await updateDoc(docRef, {
        modello: mezzo.modello,
        marca: mezzo.marca || "",
        targa: mezzo.targa || "",
        anno: mezzo.anno || "",
        clienteId: mezzo.clienteId,
        note: mezzo.note || "",
        stato: mezzo.stato || "Disponibile",
        ...(fotoUrl && { fotoUrl })
      });
      toast.success("✅ Mezzo aggiornato");
      onAggiorna();
      onClose();
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      toast.error("❌ Errore nel salvataggio");
    }
  };

  if (!mezzo) return <p className="text-muted">🔄 Caricamento dati mezzo...</p>;

  return (
    <div className="card p-3 mb-4">
      <h5>✏️ Modifica Mezzo</h5>

      <div className="mb-2">
        <label>Modello *</label>
        <input type="text" name="modello" className="form-control" value={mezzo.modello || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Marca</label>
        <input type="text" name="marca" className="form-control" value={mezzo.marca || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Targa</label>
        <input type="text" name="targa" className="form-control" value={mezzo.targa || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Anno</label>
        <input type="text" name="anno" className="form-control" value={mezzo.anno || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Cliente ID *</label>
        <input type="text" name="clienteId" className="form-control" value={mezzo.clienteId || ""} onChange={handleChange} />
      </div>

      <div className="mb-2">
        <label>Note interne</label>
        <textarea name="note" className="form-control" rows="2" value={mezzo.note || ""} onChange={handleChange} />
      </div>

      <div className="mb-2">
        <label>Stato mezzo</label>
        <select name="stato" className="form-select" value={mezzo.stato || "Disponibile"} onChange={handleChange}>
          <option value="Disponibile">✅ Disponibile</option>
          <option value="In manutenzione">🛠️ In manutenzione</option>
          <option value="Fuori servizio">🚫 Fuori servizio</option>
        </select>
      </div>

      <div className="mb-2">
        <label>📸 Nuova Foto Mezzo (facoltativa)</label>
        <input type="file" accept="image/*" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      {mezzo.fotoUrl && (
        <div className="mt-3">
          <p className="mb-1"><strong>Foto attuale:</strong></p>
          <img src={mezzo.fotoUrl} alt="Foto mezzo" className="img-thumbnail" style={{ maxWidth: "200px" }} />
        </div>
      )}

      <div className="mt-4">
        <h6>📁 Interventi associati</h6>
        {interventi.length > 0 ? (
          <ul className="list-group">
            {interventi.map((int) => (
              <li key={int.id} className="list-group-item">
                <strong>{int.titolo || "Intervento"}</strong><br />
                <small>{int.data || "—"} • {int.stato || "—"} • Tecnico: {int.tecnico || "—"}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Nessun intervento registrato per questo mezzo.</p>
        )}
      </div>

      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-success" onClick={handleSave}>💾 Salva</button>
        <button className="btn btn-secondary" onClick={onClose}>❌ Annulla</button>
      </div>
    </div>
  );
}

export default ModificaMezzo;