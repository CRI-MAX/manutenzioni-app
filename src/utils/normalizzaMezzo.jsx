// 🧠 Funzione generica per normalizzare un campo
const normalizzaCampo = (obj, chiavi, fallback = "—") => {
  for (const k of chiavi) {
    const val = obj[k];
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return fallback;
};

// 🚚 Mezzo
export const normalizzaMezzo = (m) => ({
  modello: normalizzaCampo(m, ["modello", "Modello", "Mezzo"]),
  targa: normalizzaCampo(m, ["targa", "Targa"]),
  marca: normalizzaCampo(m, ["marca", "Marca"]),
  anno: normalizzaCampo(m, ["anno", "Anno"]),
  clienteId: normalizzaCampo(m, ["clienteId", "Cliente ID"]),
  matricola: normalizzaCampo(m, ["matricola", "Matricola", "Codice mezzo"]),
  stato: normalizzaCampo(m, ["stato", "Stato mezzo", "Disponibilità"], "Disponibile"),
  note: normalizzaCampo(m, ["note", "Note interne", "Annotazioni"]),
  fotoUrl: normalizzaCampo(m, ["fotoUrl", "Immagine", "Foto"])
});