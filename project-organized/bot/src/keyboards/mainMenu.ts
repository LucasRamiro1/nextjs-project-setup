// src/bot/keyboards/mainMenu.ts
import { Markup } from 'telegraf';

export const mainKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('📊 Análises', 'menu_analyses'),
    Markup.button.callback('🎰 Plataformas', 'menu_platforms')
  ],
  [
    Markup.button.callback('📝 Enviar Report', 'menu_report'),
    Markup.button.callback('💰 BetPoints', 'menu_points')
  ],
  [
    Markup.button.callback('🏆 Ranking', 'menu_ranking'),
    Markup.button.callback('📋 Histórico', 'menu_history')
  ]
]);

export const backButton = Markup.inlineKeyboard([
  [Markup.button.callback('⬅️ Voltar', 'back')]
]);

export const backToMainButton = Markup.inlineKeyboard([
  [Markup.button.callback('🏠 Menu Principal', 'back_main')]
]);

export const confirmationKeyboard = (action: string, data = '') => Markup.inlineKeyboard([
  [
    Markup.button.callback('✅ Confirmar', `confirm_${action}_${data}`),
    Markup.button.callback('❌ Cancelar', 'back')
  ]
]);