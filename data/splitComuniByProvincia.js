const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const inputFile = "comuni.csv"; // ← nome del tuo CSV
const outputDir = "output";     // ← cartella dove salvare i JSON

const provinceMap = {};

fs.createReadStream(inputFile)
  .pipe(csv())
  .on("data", (row) => {
    const comune = row.comune?.trim();
    const provincia = row.provincia?.trim();
    const cap = row.cap?.trim();

    if (!comune || !provincia || !cap) return;

    if (!provinceMap[provincia]) {
      provinceMap[provincia] = {};
    }

    if (!provinceMap[provincia][comune]) {
      provinceMap[provincia][comune] = new Set();
    }

    provinceMap[provincia][comune].add(cap);
  })
  .on("end", () => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    Object.entries(provinceMap).forEach(([provincia, comuni]) => {
      const output = Object.entries(comuni).map(([comune, capSet]) => ({
        comune,
        cap: Array.from(capSet).sort(),
      }));

      const fileName = `comuni_${provincia}.json`;
      fs.writeFileSync(
        path.join(outputDir, fileName),
        JSON.stringify(output, null, 2),
        "utf8"
      );

      console.log(`✅ Creato: ${fileName} (${output.length} comuni)`);
    });

    console.log("🎉 Generazione completata.");
  });