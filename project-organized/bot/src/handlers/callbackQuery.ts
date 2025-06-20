// src/bot/handlers/callbackQuery.ts
import { mainKeyboard, backToMainButton } from '../keyboards/mainMenu.js';
import { rankingKeyboard, positionKeyboard } from '../keyboards/ranking.js';
import { platformsKeyboard, reportPlatformsKeyboard } from '../keyboards/platforms.js';
import { providersKeyboard, pgsoftGamesKeyboard, pragmaticGamesKeyboard } from '../keyboards/providers.js';
import { navigationManager } from '../utils/navigation.js';
import { conversationManager } from './conversation.js';
import { handleAnalysisSelection } from '../commands/analysis.js';
import { handleReportFlow } from '../commands/report.js';
import { handleRankingFlow } from '../commands/ranking.js';
import { handlePointsFlow } from '../commands/points.js';
import { handleHistoryFlow } from '../commands/history.js';
import { groupVerificationService } from '../services/groupVerification.js';

export const handleCallbackQuery = async (ctx: any) => {
  try {
    const callbackData = ctx.callbackQuery.data;
    const session = ctx.session;

    // Confirmar recebimento do callback
    await ctx.answerCbQuery();

    console.log(`📲 Callback recebido: ${callbackData} de ${ctx.from.id}`);

    // Roteamento principal
    switch (true) {
      // Navegação principal
      case callbackData === 'back_main':
        return await handleBackToMain(ctx);
      
      case callbackData === 'back':
        return await handleBack(ctx);
      
      // Verificação de grupo
      case callbackData === 'verify_group':
        return await handleGroupVerification(ctx);
      
      // Menus principais
      case callbackData === 'menu_analyses':
        return await handleAnalysesMenu(ctx);
      
      case callbackData === 'menu_platforms':
        return await handlePlatformsMenu(ctx);
      
      case callbackData === 'menu_report':
        return await handleReportMenu(ctx);
      
      case callbackData === 'menu_points':
        return await handlePointsFlow(ctx);
      
      case callbackData === 'menu_ranking':
        return await handleRankingFlow(ctx);
      
      case callbackData === 'menu_history':
        return await handleHistoryFlow(ctx);
      
      // Análises
      case callbackData === 'analysis_individual':
        return await handleAnalysisSelection(ctx, 'individual');
      
      case callbackData === 'analysis_group':
        return await handleAnalysisSelection(ctx, 'group');
      
      // Ranking
      case callbackData.startsWith('ranking_'):
        return await handleRankingFlow(ctx, callbackData);
      
      case callbackData.startsWith('position_'):
        return await handleRankingFlow(ctx, callbackData);
      
      // Reports
      case callbackData.startsWith('platform_'):
        return await handleReportFlow(ctx, callbackData);
      
      case callbackData.startsWith('provider_'):
        return await handleReportFlow(ctx, callbackData);
      
      case callbackData.startsWith('game_'):
        return await handleReportFlow(ctx, callbackData);
      
      case callbackData.startsWith('result_'):
        return await handleReportFlow(ctx, callbackData);
      
      // Confirmações
      case callbackData.startsWith('confirm_'):
        return await handleConfirmation(ctx, callbackData);
      
      case callbackData.startsWith('cancel_'):
        return await handleCancellation(ctx, callbackData);
      
      default:
        console.warn(`⚠️ Callback não reconhecido: ${callbackData}`);
        await ctx.reply('❓ Ação não reconhecida. Retornando ao menu principal.');
        return await handleBackToMain(ctx);
    }

  } catch (error) {
    console.error('❌ Erro ao processar callback:', error);
    await ctx.reply('❌ Erro ao processar sua solicitação. Tente novamente.');
  }
};

// Voltar ao menu principal
const handleBackToMain = async (ctx: any) => {
  const session = ctx.session;
  
  // Limpar dados da sessão
  session.currentFlow = null;
  session.conversationData = null;
  session.reportData = {};
  session.analysisData = {};
  navigationManager.clearStack(session);

  const message = `🏠 *Menu Principal*

Escolha uma das opções abaixo:`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...mainKeyboard
  });
};

// Voltar um nível
const handleBack = async (ctx: any) => {
  const session = ctx.session;
  const previousMenu = navigationManager.popFromStack(session);
  
  switch (previousMenu) {
    case 'main':
      return await handleBackToMain(ctx);
    
    case 'analyses':
      return await handleAnalysesMenu(ctx);
    
    case 'platforms':
      return await handlePlatformsMenu(ctx);
    
    case 'report':
      return await handleReportMenu(ctx);
    
    case 'ranking':
      return await handleRankingFlow(ctx);
    
    default:
      return await handleBackToMain(ctx);
  }
};

// Verificação de grupo
const handleGroupVerification = async (ctx: any) => {
  try {
    await ctx.editMessageText('🔄 Verificando sua participação no grupo...', {
      parse_mode: 'Markdown'
    });

    const isInGroup = await groupVerificationService.checkUserInGroup(
      ctx.telegram, 
      ctx.from.id
    );

    if (isInGroup) {
      await ctx.editMessageText(
        '✅ *Verificação concluída!*\n\n' +
        'Você está no grupo e pode usar todas as funcionalidades do bot.\n\n' +
        'Bem-vindo(a)! Use o menu abaixo para navegar:',
        {
          parse_mode: 'Markdown',
          ...mainKeyboard
        }
      );
    } else {
      const message = groupVerificationService.getGroupRequirementMessage();
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Verificar Novamente', callback_data: 'verify_group' }]
          ]
        }
      });
    }

  } catch (error) {
    console.error('Erro na verificação do grupo:', error);
    await ctx.editMessageText(
      '❌ Erro ao verificar grupo. Tente novamente em alguns minutos.',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Tentar Novamente', callback_data: 'verify_group' }]
          ]
        }
      }
    );
  }
};

// Menu de análises
const handleAnalysesMenu = async (ctx: any) => {
  const session = ctx.session;
  navigationManager.pushToStack(session, 'main');

  const message = `📊 *Análises Baseadas em Dados*

Escolha o tipo de análise que deseja comprar:

🔍 *Individual (25 BP)*
• Análise personalizada só para você
• Recomendações baseadas em horários
• Dados estatísticos detalhados

👥 *Para Grupo (500 BP)*
• Análise compartilhada no grupo
• Beneficia toda a comunidade
• Maior visibilidade e discussão

💡 *Como funciona:*
• Selecione plataforma e jogo
• Sistema analisa dados históricos
• Recebe recomendações de horários

Qual tipo de análise deseja?`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔍 Individual (25 BP)', callback_data: 'analysis_individual' },
          { text: '👥 Grupo (500 BP)', callback_data: 'analysis_group' }
        ],
        [
          { text: '⬅️ Voltar', callback_data: 'back' }
        ]
      ]
    }
  });
};

// Menu de plataformas
const handlePlatformsMenu = async (ctx: any) => {
  const session = ctx.session;
  navigationManager.pushToStack(session, 'main');

  const message = `🎰 *Plataformas Parceiras*

Acesse nossas plataformas parceiras através dos links abaixo:

🎯 *Benefícios:*
• Links de afiliado exclusivos
• Bônus especiais para nossa comunidade
• Suporte prioritário
• Cashback em apostas

🔒 *Todas as plataformas são verificadas e confiáveis*

Escolha sua plataforma preferida:`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...platformsKeyboard
  });
};

// Menu de reports
const handleReportMenu = async (ctx: any) => {
  const session = ctx.session;
  navigationManager.pushToStack(session, 'main');

  const message = `📝 *Enviar Report de Aposta*

📋 *Como funciona:*
• Selecione a plataforma onde apostou
• Escolha o provedor e jogo
• Informe valor, resultado e horário
• Envie fotos como comprovação

💰 *Recompensas:*
• Reports aprovados: +10 BP
• Reports com fotos: +5 BP bônus
• Primeiro report do dia: +5 BP extra

📸 *Dicas para aprovação:*
• Envie prints claros da aposta
• Inclua o ID da transação
• Seja preciso com horários

Escolha a plataforma onde apostou:`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...reportPlatformsKeyboard
  });
};

// Handler de confirmações
const handleConfirmation = async (ctx: any, callbackData: string) => {
  const [, action, ...params] = callbackData.split('_');
  
  switch (action) {
    case 'submit':
      return await handleReportFlow(ctx, 'confirm_submit');
    
    case 'cancel':
      return await handleCancellation(ctx, `cancel_${params.join('_')}`);
    
    case 'purchase':
      return await handleAnalysisSelection(ctx, `confirm_purchase_${params.join('_')}`);
    
    default:
      await ctx.reply('❓ Confirmação não reconhecida.');
  }
};

// Handler de cancelamentos
const handleCancellation = async (ctx: any, callbackData: string) => {
  const session = ctx.session;
  const [, action, ...params] = callbackData.split('_');
  
  switch (action) {
    case 'report':
      // Limpar dados do report
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
          ...backToMainButton
        }
      );
      break;
    
    case 'analysis':
      // Limpar dados da análise
      session.currentFlow = null;
      session.analysisData = {};
      
      await ctx.editMessageText(
        '❌ *Compra cancelada*\n\n' +
        'A análise não foi comprada.\n\n' +
        'Deseja fazer outra coisa?',
        {
          parse_mode: 'Markdown',
          ...backToMainButton
        }
      );
      break;
    
    default:
      await ctx.reply('❓ Cancelamento não reconhecido.');
  }
};