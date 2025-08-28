// 👥 Clienti
export const normalizzaCliente = (c) => ({
  ragioneSociale: c.ragioneSociale || c["Ragione Sociale"] || c.Cliente || "—",
  email: c.email || c.Email || c["E-mail"] || "—",
  telefono: c.telefono || c.Telefono || c["Telefono 1"] || "—",
  indirizzo: c.indirizzo || c.Indirizzo || c["Indirizzo esteso"] || "—",
  referente: c.referente || c.Referente || "—"
});

// 🚚 Mezzi
export const normalizzaMezzo = (m) => ({
  modello: m.modello || m["Modello"] || m["Mezzo"] || "—",
  targa: m.targa || m["Targa"] || "—",
  marca: m.marca || m["Marca"] || "—",
  anno: m.anno || m["Anno"] || "—",
  clienteId: m.clienteId || m["Cliente ID"] || "—"
});

// 👤 Utenti
export const normalizzaUtente = (u) => ({
  nome: u.nome || u.Nome || u["Nome completo"] || "—",
  email: u.email || u.EMail || "—",
  ruolo: u.ruolo || u.Ruolo || u.Role || "—",
  uid: u.uid || u.UId || u.UID || u.Assigned_username || "—",
  attivo: u.attivo ?? true
});

// 🛠️ Interventi
export const normalizzaIntervento = (i) => ({
  titolo: i.titolo || i["Titolo intervento"] || "—",
  descrizione: i.descrizione || i["Descrizione"] || "—",
  stato: i.stato || i["Stato"] || "in attesa",
  tecnico: i.tecnico || i["Tecnico assegnato"] || "—",
  clienteId: i.clienteId || i["Cliente ID"] || "—",
  mezzoId: i.mezzoId || i["Mezzo ID"] || "—",
  data: i.data || i["Data intervento"] || "—",
  priorita: i.priorita || i["Priorità"] || "normale"
});

// 🔔 Notifiche
export const normalizzaNotifica = (n) => ({
  messaggio: n.messaggio || n["Messaggio"] || "—",
  tipo: n.tipo || n["Tipo"] || "info",
  utente: n.utente || n["Utente"] || "—",
  timestamp: n.timestamp || n["Data"] || "—"
});