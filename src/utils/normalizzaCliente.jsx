export const normalizzaCliente = (c) => ({
  ragioneSociale: c.ragioneSociale || c.Cliente || c["Ragione Sociale"] || c["Nome completo"] || "—",
  partitaIVA: c.partitaIVA || c["Partita IVA"] || c["P.IVA"] || "—",
  indirizzo: c.indirizzo || c["Indirizzo esteso"] || "—",
  telefono: c.telefono || c["Telefono 1"] || "—",
  cellulare: c.cellulare || c["Cellulare"] || "—",
  email: c.email || c.EMail || "—",
  comune: c.comune || c["Comune"] || "—",
  referente: c.referente || c["Contatti"] || "—",
  dataCreazione: c.dataCreazione || "—"
});