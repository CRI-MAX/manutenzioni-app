export const normalizzaMezzo = (m) => ({
  modello: m.modello || m["Modello"] || m["Mezzo"] || "—",
  targa: m.targa || m["Targa"] || "—",
  marca: m.marca || m["Marca"] || "—",
  anno: m.anno || m["Anno"] || "—",
  clienteId: m.clienteId || m["Cliente ID"] || "—"
});