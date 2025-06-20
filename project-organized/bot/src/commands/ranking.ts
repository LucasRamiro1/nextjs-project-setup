// src/bot/commands/ranking.js
import { rankingService } from '../services/ranking.js';
import { backButton } from '../keyboards/mainMenu.js';
import { rankingKeyboard, positionKeyboard } from '../keyboards/ranking.js';

export const handleRankingMenu = async (ctx) => {
  const message = `🏆 *Sistema de Ranking*

Confira os jogadores que mais acumularam pontos:

🏆 *Ranking Diário* - Pontos do dia atual
📅 *Ranking Semanal* - Pontos da semana
📊 *Ranking Mensal* - Pontos do mês

🎯 *Minha Posição* - Veja sua colocação

💡 *Como subir no ranking:*
• Envie reports de apostas
• Ganhe 10-15 BP por report aprovado
• Seja consistente enviando diariamente

Escolha uma opção abaixo:`;

  return ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...rankingKeyboard
  });
};

export const handleRankingDaily = async (ctx) => {
  try {
    await ctx.answerCbQuery('Carregando ranking diário...');
    
    const rankingData = await rankingService.getDailyRanking();
    const message = rankingService.formatRankingMessage(rankingData, 'daily');

    return ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📅 Semanal', callback_data: 'ranking_weekly' },
            { text: '📊 Mensal', callback_data: 'ranking_monthly' }
          ],
          [
            { text: '🎯 Minha Posição', callback_data: 'ranking_position' }
          ],
          [
            { text: '⬅️ Voltar', callback_data: 'menu_ranking' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ranking diário:', error);
    return ctx.editMessageText('❌ Erro ao carregar ranking diário. Tente novamente.', backButton);
  }
};

export const handleRankingWeekly = async (ctx) => {
  try {
    await ctx.answerCbQuery('Carregando ranking semanal...');
    
    const rankingData = await rankingService.getWeeklyRanking();
    const message = rankingService.formatRankingMessage(rankingData, 'weekly');

    return ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🏆 Diário', callback_data: 'ranking_daily' },
            { text: '📊 Mensal', callback_data: 'ranking_monthly' }
          ],
          [
            { text: '🎯 Minha Posição', callback_data: 'ranking_position' }
          ],
          [
            { text: '⬅️ Voltar', callback_data: 'menu_ranking' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ranking semanal:', error);
    return ctx.editMessageText('❌ Erro ao carregar ranking semanal. Tente novamente.', backButton);
  }
};

export const handleRankingMonthly = async (ctx) => {
  try {
    await ctx.answerCbQuery('Carregando ranking mensal...');
    
    const rankingData = await rankingService.getMonthlyRanking();
    const message = rankingService.formatRankingMessage(rankingData, 'monthly');

    return ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🏆 Diário', callback_data: 'ranking_daily' },
            { text: '📅 Semanal', callback_data: 'ranking_weekly' }
          ],
          [
            { text: '🎯 Minha Posição', callback_data: 'ranking_position' }
          ],
          [
            { text: '⬅️ Voltar', callback_data: 'menu_ranking' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ranking mensal:', error);
    return ctx.editMessageText('❌ Erro ao carregar ranking mensal. Tente novamente.', backButton);
  }
};

export const handleUserPosition = async (ctx) => {
  const message = `🎯 *Minha Posição no Ranking*

Selecione o período para ver sua colocação:

📈 *Ranking Diário* - Sua posição hoje
📅 *Ranking Semanal* - Sua posição esta semana  
📊 *Ranking Mensal* - Sua posição este mês

💡 *Dica:* Rankings são atualizados a cada hora!`;

  return ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...positionKeyboard
  });
};

export const handleUserPositionDaily = async (ctx) => {
  try {
    await ctx.answerCbQuery('Carregando sua posição...');
    
    const telegramId = ctx.from.id;
    const rankingData = await rankingService.getDailyRanking();
    const position = rankingService.getUserRankingPosition(rankingData, telegramId);
    const message = rankingService.formatUserPosition(position, 'daily');

    return ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📅 Semanal', callback_data: 'position_weekly' },
            { text: '📊 Mensal', callback_data: 'position_monthly' }
          ],
          [
            { text: '🏆 Ver Ranking', callback_data: 'ranking_daily' }
          ],
          [
            { text: '⬅️ Voltar', callback_data: 'ranking_position' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posição do usuário:', error);
    return ctx.editMessageText('❌ Erro ao carregar sua posição. Tente novamente.', backButton);
  }
};

export const handleUserPositionWeekly = async (ctx) => {
  try {
    await ctx.answerCbQuery('Carregando sua posição...');
    
    const telegramId = ctx.from.id;
    const rankingData = await rankingService.getWeeklyRanking();
    const position = rankingService.getUserRankingPosition(rankingData, telegramId);
    const message = rankingService.formatUserPosition(position, 'weekly');

    return ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📈 Diário', callback_data: 'position_daily' },
            { text: '📊 Mensal', callback_data: 'position_monthly' }
          ],
          [
            { text: '🏆 Ver Ranking', callback_data: 'ranking_weekly' }
          ],
          [
            { text: '⬅️ Voltar', callback_data: 'ranking_position' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posição do usuário:', error);
    return ctx.editMessageText('❌ Erro ao carregar sua posição. Tente novamente.', backButton);
  }
};

export const handleUserPositionMonthly = async (ctx) => {
  try {
    await ctx.answerCbQuery('Carregando sua posição...');
    
    const telegramId = ctx.from.id;
    const rankingData = await rankingService.getMonthlyRanking();
    const position = rankingService.getUserRankingPosition(rankingData, telegramId);
    const message = rankingService.formatUserPosition(position, 'monthly');

    return ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📈 Diário', callback_data: 'position_daily' },
            { text: '📅 Semanal', callback_data: 'position_weekly' }
          ],
          [
            { text: '🏆 Ver Ranking', callback_data: 'ranking_monthly' }
          ],
          [
            { text: '⬅️ Voltar', callback_data: 'ranking_position' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posição do usuário:', error);
    return ctx.editMessageText('❌ Erro ao carregar sua posição. Tente novamente.', backButton);
  }
};