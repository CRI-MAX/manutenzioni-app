import React from "react";

function GalleriaMezzo({ fotoUrl }) {
  if (!fotoUrl) return <p className="text-muted">📷 Nessuna foto disponibile</p>;

  return (
    <div className="mt-3">
      <h5>📸 Foto del mezzo</h5>
      <img src={fotoUrl} alt="Foto mezzo" className="img-fluid rounded shadow" />
    </div>
  );
}

export default GalleriaMezzo;