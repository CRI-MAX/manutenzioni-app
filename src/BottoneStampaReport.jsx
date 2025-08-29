import React from "react";
import Button from "react-bootstrap/Button";
import InterventiFiltratiReport from "./InterventiFiltratiReport";
import ReactDOMServer from "react-dom/server";

/**
 * Bottone per stampare il report degli interventi filtrati.
 * Apre una nuova finestra con layout ottimizzato per la stampa.
 */
const BottoneStampaReport = ({ interventi, titolo = "Report Interventi" }) => {
  const handlePrint = () => {
    const htmlContent = ReactDOMServer.renderToStaticMarkup(
      <InterventiFiltratiReport interventi={interventi} titolo={titolo} />
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${titolo}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
          <style>
            body { padding: 2rem; font-family: 'Segoe UI', sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #dee2e6; padding: 0.5rem; text-align: left; }
            th { background-color: #f8f9fa; }
            img { max-height: 50px; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Button variant="outline-dark" onClick={handlePrint}>
      🖨️ Stampa report
    </Button>
  );
};

export default BottoneStampaReport;