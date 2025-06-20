import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { bot } from '../bot'; // Ajuste o caminho conforme sua estrutura

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Middleware para parsear updates do Telegram
app.use((req, res, next) => {
  if (req.path === `/bot${process.env.BOT_TOKEN}`) {
    return express.json()(req, res, next);
  }
  next();
});

registerRoutes(app).then(() => {
  const webhookPath = `/bot${process.env.BOT_TOKEN}`;

  // Configuração do webhook
  app.post(webhookPath, (req, res) => {
    bot.handleUpdate(req.body)
      .then(() => res.status(200).send("OK"))
      .catch((err) => {
        console.error("Erro no webhook:", err);
        res.status(500).send("Erro");
      });
  });

  // Configura o webhook no Telegram
  const setupWebhook = async () => {
    try {
      const url = process.env.WEBHOOK_URL;
      await bot.telegram.setWebhook(`${url}${webhookPath}`);
      console.log(`✅ Webhook configurado em: ${url}${webhookPath}`);
    } catch (error) {
      console.error("Erro ao configurar webhook:", error);
    }
  };

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    setupWebhook();
  });
});