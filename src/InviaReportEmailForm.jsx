import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import InterventiFiltratiReport from "./InterventiFiltratiReport";
import ReactDOMServer from "react-dom/server";
import { toast } from "react-toastify";

/**
 * Modulo per inviare il report PDF via email.
 */
const InviaReportEmailForm = ({ interventi }) => {
  const [email, setEmail] = useState("");
  const [inviando, setInviando] = useState(false);

  const isEmailValid = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleInvia = async () => {
    if (!isEmailValid(email)) {
      toast.error("❌ Inserisci un indirizzo email valido.");
      return;
    }

    setInviando(true);
    const htmlContent = ReactDOMServer.renderToStaticMarkup(
      <InterventiFiltratiReport interventi={interventi} titolo="Report Interventi Filtrati" />
    );

    try {
      const sendReportEmail = httpsCallable(functions, "sendReportEmail");
      await sendReportEmail({
        htmlContent,
        destinatario: email,
        oggetto: "Report Interventi Filtrati",
        nomeFile: "report_interventi.pdf"
      });
      toast.success("📧 Report inviato con successo!");
      setEmail("");
    } catch (err) {
      console.error("Errore invio:", err);
      toast.error("❌ Errore nell'invio del report.");
    } finally {
      setInviando(false);
    }
  };

  return (
    <Form className="mt-4">
      <Form.Group controlId="emailReport">
        <Form.Label>📩 Invia report via email</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="email"
            placeholder="es. mario.rossi@email.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={inviando}
            style={{ maxWidth: "300px" }}
          />
          <Button
            variant="primary"
            onClick={handleInvia}
            disabled={inviando || interventi.length === 0}
          >
            {inviando ? "⏳ Invio in corso..." : "📤 Invia"}
          </Button>
        </div>
      </Form.Group>
    </Form>
  );
};

export default InviaReportEmailForm;