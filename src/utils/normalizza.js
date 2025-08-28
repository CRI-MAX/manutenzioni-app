// 🧠 Funzione generica per normalizzare un campo
const normalizzaCampo = (obj, chiavi, fallback = "—") => {
  for (const k of chiavi) {
    const val = obj[k];
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return fallback;
};

// 👥 Clienti
export const normalizzaCliente = (c) => ({
  ragioneSociale: normalizzaCampo(c, ["ragioneSociale", "Ragione Sociale", "Cliente"]),
  email: normalizzaCampo(c, ["email", "Email", "E-mail"]),
  telefono: normalizzaCampo(c, ["telefono", "Telefono", "Telefono 1"]),
  indirizzo: normalizzaCampo(c, ["indirizzo", "Indirizzo", "Indirizzo esteso"]),
  referente: normalizzaCampo(c, ["referente", "Referente"])
});

// 🚚 Mezzi
export const normalizzaMezzo = (m) => ({
  modello: normalizzaCampo(m, ["modello", "Modello", "Mezzo"]),
  targa: normalizzaCampo(m, ["targa", "Targa"]),
  marca: normalizzaCampo(m, ["marca", "Marca"]),
  anno: normalizzaCampo(m, ["anno", "Anno"]),
  clienteId: normalizzaCampo(m, ["clienteId", "Cliente ID"])
});

// 👤 Utenti
export const normalizzaUtente = (u) => ({
  nome: normalizzaCampo(u, ["nome", "Nome", "Nome completo"]),
  email: normalizzaCampo(u, ["email", "EMail"]),
  ruolo: normalizzaCampo(u, ["ruolo", "Ruolo", "Role"]),
  uid: normalizzaCampo(u, ["uid", "UId", "UID", "Assigned_username"]),
  attivo: u.attivo ?? true
});

// 🛠️ Interventi
export const normalizzaIntervento = (i) => ({
  titolo: normalizzaCampo(i, ["titolo", "Titolo intervento"]),
  descrizione: normalizzaCampo(i, ["descrizione", "Descrizione"]),
  stato: normalizzaCampo(i, ["stato", "Stato"], "in attesa"),
  tecnico: normalizzaCampo(i, ["tecnico", "Tecnico assegnato"]),
  clienteId: normalizzaCampo(i, ["clienteId", "Cliente ID"]),
  mezzoId: normalizzaCampo(i, ["mezzoId", "Mezzo ID"]),
  data: normalizzaCampo(i, ["data", "Data intervento"]),
  priorita: normalizzaCampo(i, ["priorita", "Priorità"], "normale")
});

// 🔔 Notifiche
export const normalizzaNotifica = (n) => ({
  messaggio: normalizzaCampo(n, ["messaggio", "Messaggio"]),
  tipo: normalizzaCampo(n, ["tipo", "Tipo"], "info"),
  utente: normalizzaCampo(n, ["utente", "Utente"]),
  timestamp: n.timestamp || n["Data"] || null
});

// 📎 Allegati (opzionale)
export const normalizzaAllegato = (a) => ({
  nome: normalizzaCampo(a, ["nome", "Nome file"]),
  url: normalizzaCampo(a, ["url", "Link"]),
  tipo: normalizzaCampo(a, ["tipo", "Tipo"], "documento"),
  dataCaricamento: a.dataCaricamento || a["Data"] || null
});