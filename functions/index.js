const { onRequest } = require("firebase-functions/v2/https");
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const admin = require("firebase-admin");
const Papa = require("papaparse");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

/**
 * Funzione HTTP Gen2: sostituisce "Targa" con "Matricola"
 */
exports.sostituisciTargaConMatricola = onRequest({ region: "europe-west1" }, async (req, res) => {
  try {
    const snapshot = await db.collection("MEZZI").get();
    const batch = db.batch();

    snapshot.forEach(doc => {
      const data = doc.data();
      const ref = doc.ref;

      if (data.Targa) {
        batch.update(ref, {
          Matricola: data.Targa,
          Targa: admin.firestore.FieldValue.delete()
        });
      }
    });

    await batch.commit();
    res.status(200).send("✅ Campo 'Targa' sostituito con 'Matricola' in tutti i documenti.");
  } catch (error) {
    console.error("❌ Errore nella sostituzione:", error);
    res.status(500).send("Errore durante la conversione.");
  }
});

/**
 * Funzione automatica Gen2: importa MEZZI da CSV e associa tramite Ragione Sociale
 */
exports.importMezziDaCSV = onObjectFinalized({
  region: "europe-west1"
}, async (event) => {
  const object = event.data;
  const filePath = object.name;

  if (!filePath.startsWith("mezzi_csv/") || !filePath.endsWith(".csv")) {
    console.log("❌ File ignorato:", filePath);
    return;
  }

  try {
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    const [contents] = await file.download();
    const text = contents.toString("utf-8");

    const { data } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true
    });

    const normalize = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");

    const clientiSnapshot = await db.collection("CLIENTI").get();
    const ragioneToClienteMap = {};
    clientiSnapshot.forEach(doc => {
      const cliente = doc.data();
      if (cliente.ragioneSociale) {
        const chiave = normalize(cliente.ragioneSociale);
        ragioneToClienteMap[chiave] = {
          id: doc.id,
          nome: cliente.ragioneSociale
        };
      }
    });

    const batch = db.batch();
    data.forEach((row) => {
      const ragione = normalize(row.Cliente || "");
      const cliente = ragioneToClienteMap[ragione] || null;

      const docRef = db.collection("MEZZI").doc();
      batch.set(docRef, {
        Marca: row.Marca || null,
        modello: row.modello || null,
        Tipo: row.Tipo || null,
        Targa: row.Targa || null,
        Matricola: row.Targa || null,
        clienteId: cliente ? cliente.id : null,
        clienteNome: cliente ? cliente.nome : row.Cliente || null,
        importatoIl: admin.firestore.Timestamp.now()
      });
    });

    await batch.commit();
    console.log(`✅ Importati ${data.length} mezzi da ${filePath}`);
  } catch (error) {
    console.error("❌ Errore durante l'importazione automatica:", error);
  }
});

/**
 * Funzione automatica Gen2: importa CLIENTI da CSV con controllo duplicati
 */
exports.importClientiDaCSV = onObjectFinalized({
  region: "europe-west1"
}, async (event) => {
  const object = event.data;
  const filePath = object.name;

  if (!filePath.startsWith("clienti_csv/") || !filePath.endsWith(".csv")) {
    console.log("❌ File ignorato:", filePath);
    return;
  }

  try {
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    const [contents] = await file.download();
    const text = contents.toString("utf-8");

    const { data } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true
    });

    const normalize = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");

    const existingSnapshot = await db.collection("CLIENTI").get();
    const existingKeys = new Set();
    existingSnapshot.forEach(doc => {
      const cliente = doc.data();
      if (cliente.ragioneSociale) {
        existingKeys.add(normalize(cliente.ragioneSociale));
      }
    });

    const batch = db.batch();
    data.forEach((row) => {
      const ragioneSociale = row["Cliente"] || row["Ragione Sociale"] || row["Nome completo"];
      if (!ragioneSociale) return;

      const chiave = normalize(ragioneSociale);
      if (existingKeys.has(chiave)) {
        console.log(`⚠️ Cliente già presente: ${ragioneSociale}`);
        return;
      }

      const docRef = db.collection("CLIENTI").doc();
      batch.set(docRef, {
        ragioneSociale: ragioneSociale.trim(),
        partitaIVA: row["Partita IVA"] || row["P.IVA"] || "",
        indirizzo: row["Indirizzo"] || row["Indirizzo esteso"] || "",
        email: row["Email"] || row["EMail"] || "",
        telefono: row["Telefono"] || row["Telefono 1"] || "",
        referente: row["Referente"] || row["Contatti"] || "",
        importatoIl: admin.firestore.Timestamp.now()
      });
    });

    await batch.commit();
    console.log(`✅ Importati clienti da ${filePath}`);
  } catch (error) {
    console.error("❌ Errore durante l'importazione clienti:", error);
  }
});