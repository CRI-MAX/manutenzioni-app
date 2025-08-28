// 🧠 Funzione generica per normalizzare un campo
const normalizzaCampo = (obj, chiavi, fallback = "—") => {
  for (const k of chiavi) {
    const val = obj[k];
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return fallback;
};

// 👤 Utente
export const normalizzaUtente = (u) => ({
  nome: normalizzaCampo(u, ["nome", "Nome", "Nome completo"]),
  email: normalizzaCampo(u, ["email", "EMail"]),
  ruolo: normalizzaCampo(u, ["ruolo", "Ruolo", "Role"]),
  uid: normalizzaCampo(u, ["uid", "UId", "UID", "Assigned_username"]),
  attivo: u.attivo ?? true,
  telefono: normalizzaCampo(u, ["telefono", "Telefono", "Cellulare"]),
  azienda: normalizzaCampo(u, ["azienda", "Cliente", "Organizzazione"]),
  dataCreazione: normalizzaCampo(u, ["dataCreazione", "Data registrazione", "Creato il"]),
  avatarUrl: normalizzaCampo(u, ["avatarUrl", "Foto", "Immagine profilo"])
});