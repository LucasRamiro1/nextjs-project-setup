import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertBetSchema,
  insertRewardSchema,
  insertSystemSettingSchema,
  insertBroadcastMessageSchema,
  insertAnalysisPeriodSchema,
} from "../../shared/shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("Admin dashboard connected");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received message:", data);
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("Admin dashboard disconnected");
    });
  });

  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // ✅ BOT: Registrar usuário
  app.post("/api/user/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.registerUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      res.status(500).json({ error: "Erro interno ao registrar usuário" });
    }
  });

  // ✅ BOT: Enviar report
  app.post("/api/report-bet", async (req, res) => {
    try {
      const betData = insertBetSchema.parse(req.body);
      const bet = await storage.submitBetReport(betData);
      res.json(bet);
    } catch (error) {
      console.error("Erro ao registrar aposta:", error);
      res.status(500).json({ error: "Erro ao registrar aposta" });
    }
  });

  // ✅ BOT: Buscar histórico do usuário
  app.get("/api/users/:telegramId/history", async (req, res) => {
    try {
      const { telegramId } = req.params;
      const history = await storage.getUserHistory(Number(telegramId));
      res.json(history);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      res.status(500).json({ error: "Erro ao buscar histórico" });
    }
  });

  // ✅ BOT: Buscar pontos do usuário
  app.get("/api/users/:telegramId/points", async (req, res) => {
    try {
      const { telegramId } = req.params;
      const user = await storage.getUserByTelegramId(Number(telegramId));
      res.json({ points: user?.points || 0 });
    } catch (error) {
      console.error("Erro ao buscar pontos:", error);
      res.status(500).json({ error: "Erro ao buscar pontos" });
    }
  });

  // ✅ BOT: Comprar análise individual
  app.post("/api/analyze", async (req, res) => {
    try {
      const result = await storage.purchaseAnalysis(req.body);
      res.json(result);
    } catch (error) {
      console.error("Erro ao processar análise:", error);
      res.status(500).json({ error: "Erro ao processar análise" });
    }
  });

  // ✅ BOT: Comprar análise em grupo
  app.post("/api/analyze_all", async (req, res) => {
    try {
      const result = await storage.purchaseGroupAnalysis(req.body);
      res.json(result);
    } catch (error) {
      console.error("Erro ao processar análise coletiva:", error);
      res.status(500).json({ error: "Erro ao processar análise coletiva" });
    }
  });

  // ✅ BOT: Promover usuário (admin)
  app.post("/api/users/promote", async (req, res) => {
    try {
      const result = await storage.promoteUser(req.body);
      res.json(result);
    } catch (error) {
      console.error("Erro ao promover usuário:", error);
      res.status(500).json({ error: "Erro ao promover usuário" });
    }
  });

  // ✅ BOT: Buscar configurações do sistema
  app.get("/api/system-settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  });

  // ✅ BOT: Buscar broadcasts pendentes
  app.get("/api/broadcasts/pending", async (req, res) => {
    try {
      const broadcasts = await storage.getPendingBroadcasts();
      res.json(broadcasts);
    } catch (error) {
      console.error("Erro ao buscar broadcasts:", error);
      res.status(500).json({ error: "Erro ao buscar broadcasts" });
    }
  });

  // ANALYSIS PERIODS
  app.get("/api/analysis-periods", async (req, res) => {
    try {
      const periods = await storage.getAnalysisPeriods();
      res.json(periods);
    } catch (error) {
      console.error("Error fetching analysis periods:", error);
      res.status(500).json({ error: "Failed to fetch analysis periods" });
    }
  });

  app.post("/api/analysis-periods", async (req, res) => {
    try {
      const periodData = insertAnalysisPeriodSchema.parse(req.body);
      const period = await storage.createAnalysisPeriod(periodData);
      broadcast({ type: "analysis_period_created", period });
      res.json(period);
    } catch (error) {
      console.error("Error creating analysis period:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid period data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create analysis period" });
      }
    }
  });

  app.put("/api/analysis-periods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const periodData = insertAnalysisPeriodSchema.partial().parse(req.body);
      await storage.updateAnalysisPeriod(Number(id), periodData);
      broadcast({ type: "analysis_period_updated", periodId: id });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating analysis period:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid period data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update analysis period" });
      }
    }
  });

  app.delete("/api/analysis-periods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAnalysisPeriod(Number(id));
      broadcast({ type: "analysis_period_deleted", periodId: id });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting analysis period:", error);
      res.status(500).json({ error: "Failed to delete analysis period" });
    }
  });

  return httpServer;
}
