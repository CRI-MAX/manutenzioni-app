import React from "react";

function VisualizzaAllegati({ allegati = [] }) {
  if (allegati.length === 0) return <p className="text-muted">📎 Nessun allegato</p>;

  return (
    <div className="mt-2">
      {allegati.map((a, i) => (
        <div key={i} className="mb-2">
          {a.tipo === "foto" ? (
            <img src={a.url} alt={a.nome} className="img-thumbnail" style={{ maxWidth: "150px" }} />
          ) : (
            <a href={a.url} target="_blank" rel="noopener noreferrer">
              📄 {a.nome}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default VisualizzaAllegati;