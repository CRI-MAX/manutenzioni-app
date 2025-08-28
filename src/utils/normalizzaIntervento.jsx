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