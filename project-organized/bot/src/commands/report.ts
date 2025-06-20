// src/bot/commands/report.ts
import { reportPlatformsKeyboard } from '../keyboards/platforms.js';
import { providersKeyboard, pgsoftGamesKeyboard, pragmaticGamesKeyboard } from '../keyboards/providers.js';
import { backButton } from '../keyboards/mainMenu.js';
import { navigationManager } from '../utils/navigation.js';
import { conversationManager } from '../handlers/conversation.js';
import { analysisService } from '../services/analysis.js';
import { submitBetReport } from '../services/api.js';

export const handleReportFlow = async (ctx: any, action: string) => {
  const session = ctx.session;
  
  try {
    switch (true) {
      case action.startsWith('platform_'):
        return await handlePlatformSelection(ctx, action);
      
      case action.startsWith('provider_'):
        return await handleProviderSelection(ctx, action);
      
      case action.startsWith('game_'):
        return await handleGameSelection(ctx, action);
      
      case action.startsWith('result_'):
        return await handleResultSelection(ctx, action);
      
      case action === 'confirm_submit':
        return await handleReportSubmission(ctx);
      
      case action === 'cancel_report':
        return await handleReportCancellation(ctx);
      
      default:
        console.warn(`⚠️ Ação de report não reconhecida: ${action}`);
    }
  } catch (error) {
    console.error('❌ Erro no fluxo de report:', error);
    await ctx.reply('❌ Erro ao processar report. Tente novamente.');
  }
};

// Seleção de plataforma
const handlePlatformSelection = async (ctx: any, action: string) => {
  const session = ctx.session;
  const platform = action.replace('platform_', '');
  
  // Inicializar dados do report
  session.reportData = {
    platform,
    step: 'provider'
  };
  
  navigationManager.pushToStack(session, 'report');
  
  const platformName = analysisService.getPlatformDisplayName(platform);
  
  const message = `🎰 *${platformName} selecionado*

📝 *Novo Report de Aposta*

🎮 *Agora escolha o provedor do jogo:*`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...providersKeyboard
  });
};

// Seleção de provedor
const handleProviderSelection = async (ctx: any, action: string) => {
  const session = ctx.session;
  const provider = action.replace('provider_', '');
  
  session.reportData.provider = provider;
  session.reportData.step = 'game';
  
  const platformName = analysisService.getPlatformDisplayName(session.reportData.platform);
  const providerName = provider === 'pgsoft' ? 'PGSoft' : 'Pragmatic Play';
  
  const message = `🎮 *${providerName} selecionado*

📝 *Report: ${platformName} • ${providerName}*

🎯 *Escolha o jogo que você apostou:*`;

  const keyboard = provider === 'pgsoft' ? pgsoftGamesKeyboard : pragmaticGamesKeyboard;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...keyboard
  });
};

// Seleção de jogo
const handleGameSelection = async (ctx: any, action: string) => {
  const session = ctx.session;
  const game = action.replace('game_', '');
  
  session.reportData.game = game;
  session.reportData.step = 'bet_value';
  
  const platformName = analysisService.getPlatformDisplayName(session.reportData.platform);
  const providerName = session.reportData.provider === 'pgsoft' ? 'PGSoft' : 'Pragmatic Play';
  const gameName = analysisService.getGameDisplayName(game);
  
  // Iniciar conversação para coleta de dados
  conversationManager.startConversation(ctx, 'report', {
    platform: session.reportData.platform,
    provider: session.reportData.provider,
    game: session.reportData.game
  });
  
  const message = `🎯 *${gameName} selecionado*

📝 *Report: ${platformName} • ${providerName} • ${gameName}*

💰 *Agora digite o valor da sua aposta:*

💡 *Exemplos:*
• R$ 0,50
• 1.00
• 5,25

Digite o valor da aposta:`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...backButton
  });
};

// Seleção de resultado
const handleResultSelection = async (ctx: any, action: string) => {
  const session = ctx.session;
  const result = action.replace('result_', '');
  
  session.reportData.result = result;
  session.reportData.step = 'bet_time';
  
  const resultText = result === 'win' ? '✅ Ganho' : '❌ Perda';
  
  const message = `${resultText} *registrado*

📝 *Resumo atual:*
• Plataforma: ${analysisService.getPlatformDisplayName(session.reportData.platform)}
• Provedor: ${session.reportData.provider === 'pgsoft' ? 'PGSoft' : 'Pragmatic Play'}
• Jogo: ${analysisService.getGameDisplayName(session.reportData.game)}
• Valor: ${session.reportData.bet_value}
• Resultado: ${resultText}

⏰ *Agora digite o horário da aposta:*

💡 *Formato: HH:MM*
• Exemplo: 14:30, 09:15, 22:45

Digite o horário da aposta:`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...backButton
  });
};

// Submissão do report
const handleReportSubmission = async (ctx: any) => {
  const session = ctx.session;
  const reportData = session.reportData;
  
  if (!reportData || !reportData.platform || !reportData.game) {
    return await ctx.reply('❌ Dados do report incompletos. Reinicie o processo.');
  }

  try {
    await ctx.editMessageText('📤 Enviando seu report...', {
      parse_mode: 'Markdown'
    });

    // Preparar dados para envio
    const submissionData = {
      telegram_id: ctx.from.id,
      platform: reportData.platform,
      provider: reportData.provider,
      game: reportData.game,
      bet_value: reportData.bet_value,
      result: reportData.result,
      bet_time: reportData.bet_time,
      photos: reportData.photos || [],
      additional_info: reportData.additional_info || ''
    };

    const result = await submitBetReport(submissionData);

    if (result.success) {
      // Limpar dados do report
      session.currentFlow = null;
      session.conversationData = null;
      session.reportData = {};
      conversationManager.endConversation(ctx);

      const message = `✅ *Report enviado com sucesso!*

📋 *ID do Report:* #${result.report_id}

🎯 *Detalhes:*
• Plataforma: ${analysisService.getPlatformDisplayName(submissionData.platform)}
• Jogo: ${analysisService.getGameDisplayName(submissionData.game)}
• Valor: ${submissionData.bet_value}
• Resultado: ${submissionData.result === 'win' ? '✅ Ganho' : '❌ Perda'}
• Fotos: ${submissionData.photos.length}/4

⏳ *Status:* Aguardando análise
⏰ *Prazo:* Até 24 horas
💰 *Recompensa:* Até 20 BP (se aprovado)

📧 *Você será notificado quando o report for analisado.*

🎉 *Obrigado por contribuir com a comunidade!*`;

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📝 Novo Report', callback_data: 'menu_report' },
              { text: '💰 Ver Pontos', callback_data: 'menu_points' }
            ],
            [
              { text: '📋 Histórico', callback_data: 'menu_history' },
              { text: '🏠 Menu Principal', callback_data: 'back_main' }
            ]
          ]
        }
      });

    } else {
      await ctx.editMessageText(
        `❌ *Erro ao enviar report*\n\n${result.message || 'Erro desconhecido'}`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔄 Tentar Novamente', callback_data: 'confirm_submit' },
                { text: '❌ Cancelar', callback_data: 'cancel_report' }
              ]
            ]
          }
        }
      );
    }

  } catch (error) {
    console.error('❌ Erro ao enviar report:', error);
    await ctx.editMessageText(
      '❌ *Erro ao enviar report*\n\n' +
      'Ocorreu um erro inesperado. Tente novamente em alguns minutos.',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔄 Tentar Novamente', callback_data: 'confirm_submit' },
              { text: '❌ Cancelar', callback_data: 'cancel_report' }
            ]
          ]
        }
      }
    );
  }
};

// Cancelamento do report
const handleReportCancellation = async (ctx: any) => {
  const session = ctx.session;
  
  // Limpar todos os dados
  session.currentFlow = null;
  session.conversationData = null;
  session.reportData = {};
  conversationManager.endConversation(ctx);
  
  await ctx.editMessageText(
    '❌ *Report cancelado*\n\n' +
    'Todos os dados foram descartados.\n\n' +
    'Deseja fazer outra coisa?',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📝 Novo Report', callback_data: 'menu_report' },
            { text: '📊 Análises', callback_data: 'menu_analyses' }
          ],
          [
            { text: '🏠 Menu Principal', callback_data: 'back_main' }
          ]
        ]
      }
    }
  );
};