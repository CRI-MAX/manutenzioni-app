const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");

// 🔐 Configura il trasporto email (es. Gmail o SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tuo.email@gmail.com",
    pass: "password_o_app_password"
  }
});

exports.sendReportEmail = functions.https.onCall(async (data, context) => {
  const { htmlContent, destinatario, oggetto = "Report Interventi", nomeFile = "report.pdf" } = data;

  try {
    // 📄 Genera PDF da HTML usando Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // 📧 Invia email con allegato
    await transporter.sendMail({
      from: "Report Interventi <tuo.email@gmail.com>",
      to: destinatario,
      subject: oggetto,
      text: "In allegato trovi il report richiesto.",
      attachments: [
        {
          filename: nomeFile,
          content: pdfBuffer
        }
      ]
    });

    return { success: true };
  } catch (error) {
    console.error("Errore invio email:", error);
    throw new functions.https.HttpsError("internal", "Errore invio email");
  }
});