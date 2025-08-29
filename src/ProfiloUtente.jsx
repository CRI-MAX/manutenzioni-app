import React, { useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { toast } from "react-toastify";

function ProfiloUtente() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim()
      });
      toast.success("✅ Profilo aggiornato con successo");
    } catch (error) {
      console.error("Errore nell'aggiornamento profilo:", error);
      toast.error("❌ Errore nell'aggiornamento");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="text-muted">🔒 Nessun utente autenticato.</p>;
  }

  return (
    <div className="card p-3 mb-4">
      <h5>👤 Profilo Utente</h5>

      <div className="mb-2">
        <label>Nome visualizzato</label>
        <input
          type="text"
          className="form-control"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label>URL foto profilo</label>
        <input
          type="text"
          className="form-control"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
        />
      </div>

      {photoURL && (
        <div className="mt-3">
          <p className="mb-1"><strong>Anteprima foto:</strong></p>
          <img src={photoURL} alt="Foto profilo" className="img-thumbnail" style={{ maxWidth: "150px" }} />
        </div>
      )}

      <div className="mt-3">
        <strong>Email:</strong> {user.email || "—"}
      </div>
      <div className="mb-2">
        <strong>UID:</strong> {user.uid}
      </div>

      <button className="btn btn-primary mt-3" onClick={handleUpdate} disabled={loading}>
        {loading ? "⏳ Aggiornamento..." : "💾 Salva modifiche"}
      </button>
    </div>
  );
}

export default ProfiloUtente;