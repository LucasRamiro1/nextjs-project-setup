// src/bot/config.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  BOT_TOKEN: process.env.TELEGRAM_TOKEN!,
  BOT_USERNAME: process.env.BOT_USERNAME,
  DATABASE_URL: process.env.DATABASE_URL!,
  ADMIN_IDS: process.env.ADMIN_IDS?.split(',').map(id => parseInt(id.trim())) || [],
  REQUIRED_GROUP_ID: process.env.REQUIRED_GROUP_ID,
  GALERA_GROUP_ID: process.env.GALERA_GROUP_ID,
  API_BASE_URL: process.env.API_BASE_URL || 'https://reward-tracker-web-wild-wave-7489.fly.dev/api',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Validações
if (!config.BOT_TOKEN) {
  throw new Error('TELEGRAM_TOKEN é obrigatório');
}

if (!config.DATABASE_URL) {
  throw new Error('DATABASE_URL é obrigatório');
}

console.log('🔧 Bot configurado para API:', config.API_BASE_URL);