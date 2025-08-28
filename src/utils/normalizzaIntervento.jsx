// 🧠 Funzione generica per normalizzare un campo
const normalizzaCampo = (obj, chiavi, fallback = "—") => {
  for (const k of chiavi) {
    const val = obj[k];
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return fallback;
};

// 📎 Normalizza singolo allegato
const normalizzaAllegato = (a) => ({
  nome: normalizzaCampo(a, ["nome", "Nome file"]),
  url: normalizzaCampo(a, ["url", "Link"]),
  tipo: normalizzaCampo(a, ["tipo", "Tipo"], "documento"),
  dataCaricamento: a.dataCaricamento || a["Data"] || null
});

// 🛠️ Intervento
export const normalizzaIntervento = (i) => ({
  titolo: normalizzaCampo(i, ["titolo", "Titolo intervento"]),
  descrizione: normalizzaCampo(i, ["descrizione", "Descrizione"]),
  stato: normalizzaCampo(i, ["stato", "Stato"], "in attesa"),
  tecnico: normalizzaCampo(i, ["tecnico", "Tecnico assegnato"]),
  firmaTecnico: normalizzaCampo(i, ["firmaTecnico", "Firma", "Firma del tecnico"]),
  clienteId: normalizzaCampo(i, ["clienteId", "Cliente ID"]),
  mezzoId: normalizzaCampo(i, ["mezzoId", "Mezzo ID"]),
  data: normalizzaCampo(i, ["data", "Data intervento"]),
  priorita: normalizzaCampo(i, ["priorita", "Priorità"], "normale"),
  urgente: i.urgente ?? (i.priorita === "urgente" || i["Urgente"] === true),
  allegati: Array.isArray(i.allegati)
    ? i.allegati.map(normalizzaAllegato)
    : []
});