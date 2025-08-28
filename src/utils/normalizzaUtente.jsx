export const normalizzaUtente = (u) => ({
  nome: u.nome || u.Nome || u["Nome completo"] || "—",
  email: u.email || u.EMail || "—",
  ruolo: u.ruolo || u.Ruolo || u.Role || "—",
  uid: u.uid || u.UId || u.UID || u.Assigned_username || "—",
  attivo: u.attivo ?? true
});