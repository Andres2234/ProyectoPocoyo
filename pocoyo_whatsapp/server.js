const { Client, NoAuth, MessageMedia } = require("whatsapp-web.js");
const express = require("express");
const bodyParser = require("body-parser");
const qrcode = require("qrcode-terminal");

const app = express();
app.use(bodyParser.json());

const SECRET_TOKEN = "qmx4owznrctvd3n4lytihgrmbiusoj";

const client = new Client({
  authStrategy: new NoAuth(),
  puppeteer: {
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu"
    ]
  }
});

client.on("ready", () => {
  console.log("✅ WhatsApp Bot listo");
});

client.on("qr", (qr) => {
  console.log("📲 Escanea este QR con tu WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("auth_failure", (msg) => {
  console.error("❌ Error de autenticación:", msg);
});

client.on("disconnected", (reason) => {
  console.error("❌ Cliente desconectado:", reason);
});

app.post("/send-message", async (req, res) => {
  const { token, number, message } = req.body;

  if (token !== SECRET_TOKEN) {
    return res.status(401).json({ error: "Token inválido" });
  }

  if (!number || !message) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    await client.sendMessage(`${number}@c.us`, message);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error enviando mensaje" });
  }
});

client.initialize();
app.listen(3000, () =>
  console.log("🚀 API corriendo en http://localhost:3000")
);
