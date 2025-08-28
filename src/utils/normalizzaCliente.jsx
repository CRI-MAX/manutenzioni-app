// 🧠 Funzione generica per normalizzare un campo con alias
const normalizzaCampo = (obj, chiavi, fallback = "—") => {
  for (const k of chiavi) {
    const val = obj[k];
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return fallback;
};

// 👥 Clienti
export const normalizzaCliente = (c) => ({
  ragioneSociale: normalizzaCampo(c, ["ragioneSociale", "Cliente", "Ragione Sociale", "Nome completo"]),
  partitaIVA: normalizzaCampo(c, ["partitaIVA", "Partita IVA", "P.IVA"]),
  indirizzo: normalizzaCampo(c, ["indirizzo", "Indirizzo esteso"]),
  telefono: normalizzaCampo(c, ["telefono", "Telefono 1"]),
  cellulare: normalizzaCampo(c, ["cellulare", "Cellulare"]),
  email: normalizzaCampo(c, ["email", "EMail"]),
  comune: normalizzaCampo(c, ["comune", "Comune"]),
  referente: normalizzaCampo(c, ["referente", "Contatti"]),
  dataCreazione: normalizzaCampo(c, ["dataCreazione"])
});