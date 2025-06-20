// src/server/middleware/pointsValidation.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/connection';

export const validatePointsForAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { telegram_id, type } = req.body;
    const requiredPoints = type === 'individual' ? 25 : 500;

    // Verificar se usuário tem pontos suficientes
    const userQuery = 'SELECT points FROM users WHERE telegram_id = $1';
    const result = await db.query(userQuery, [telegram_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const userPoints = result.rows[0].points;

    if (userPoints < requiredPoints) {
      return res.status(402).json({ 
        message: `Pontos insuficientes. Necessário: ${requiredPoints} BP, Atual: ${userPoints} BP`,
        required: requiredPoints,
        current: userPoints
      });
    }

    next();
  } catch (error) {
    console.error('Erro na validação de pontos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};