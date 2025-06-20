// src/bot/commands/analysis.ts
import { providersKeyboard, pgsoftGamesKeyboard, pragmaticGamesKeyboard } from '../keyboards/providers.js';
import { reportPlatformsKeyboard } from '../keyboards/platforms.js';
import { backButton } from '../keyboards/mainMenu.js';
import { navigationManager } from '../utils/navigation.js';
import { analysisService } from '../services/analysis.js';
import { purchaseAnalysis, purchaseGroupAnalysis, getUserPoints } from '../services/api.js';
import { groupVerificationService } from '../services/groupVerification.js';

export const handleAnalysisSelection = async (ctx: any, action: string) => {
  const session = ctx.session;
  
  try {
    switch (action) {
      case 'individual':
        return await handleIndividualAnalysis(ctx);
      
      case 'group':
        return await handleGroupAnalysis(ctx);
      
      default:
        if (action.startsWith('confirm_purchase_')) {
          return await handlePurchaseConfirmation(ctx, action);
        }
        
        // Processar seleções de plataforma/provedor/jogo
        await processAnalysisSelection(ctx, action);
    }
  } catch (error) {
    console.error('❌ Erro na análise:', error);
    await ctx.reply('❌ Erro ao processar análise. Tente novamente.');
  }
};

// Análise individual
const handleIndividualAnalysis = async (ctx: any) => {
  const session = ctx.session;
  navigationManager.pushToStack(session, 'analyses');
  
  session.analysisData = {
    type: 'individual',
    cost: 25,
    step: 'platform'
  };

  const message = `🔍 *Análise Individual - 25 BP*

💡 *Benefícios:*
• Análise personalizada só para você
• Recomendações de horários baseadas em dados
• Estatísticas detalhadas do jogo
• Suporte prioritário

📊 *Como funciona:*
1. Selecione a plataforma
2. Escolha o provedor
3. Selecione o jogo
4. Receba a análise instantaneamente

🎯 *Primeiro passo:*
Escolha a plataforma onde deseja jogar:`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...reportPlatformsKeyboard
  });
};

// Análise para grupo
const handleGroupAnalysis = async (ctx: any) => {
  const session = ctx.session;
  navigationManager.pushToStack(session, 'analyses');
  
  session.analysisData = {
    type: 'group',
    cost: 500,
    step: 'platform'
  };

  const message = `👥 *Análise para Grupo - 500 BP*

🎯 *Benefícios:*
• Análise compartilhada no grupo oficial
• Beneficia toda a comunidade
• Discussão em tempo real
• Reconhecimento público

🔥 *Características especiais:*
• Análise mais detalhada
• Dados de múltiplas plataformas
• Recomendações para diferentes perfis
• Histórico de performance

💰 *Investimento alto, retorno para todos!*

🎯 *Primeiro passo:*
Escolha a plataforma para análise:`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...reportPlatformsKeyboard
  });
};

// Processar seleções
const processAnalysisSelection = async (ctx: any, action: string) => {
  const session = ctx.session;
  const analysisData = session.analysisData;
  
  if (!analysisData) {
    return await ctx.reply('❌ Dados da análise perdidos. Reinicie o processo.');
  }

  // Plataforma selecionada
  if (action.startsWith('platform_')) {
    const platform = action.replace('platform_', '');
    analysisData.platform = platform;
    analysisData.step = 'provider';
    
    const platformName = analysisService.getPlatformDisplayName(platform);
    
    const message = `🎰 *${platformName} selecionado*

${analysisData.type === 'individual' ? '🔍 Análise Individual' : '👥 Análise para Grupo'} - ${analysisData.cost} BP

🎮 *Agora escolha o provedor:*`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...providersKeyboard
    });
    return;
  }

  // Provedor selecionado
  if (action.startsWith('provider_')) {
    const provider = action.replace('provider_', '');
    analysisData.provider = provider;
    analysisData.step = 'game';
    
    const platformName = analysisService.getPlatformDisplayName(analysisData.platform);
    const providerName = provider === 'pgsoft' ? 'PGSoft' : 'Pragmatic Play';
    
    const message = `🎮 *${providerName} selecionado*

🎰 ${platformName} • ${providerName}
${analysisData.type === 'individual' ? '🔍 Análise Individual' : '👥 Análise para Grupo'} - ${analysisData.cost} BP

🎯 *Escolha o jogo para análise:*`;

    const keyboard = provider === 'pgsoft' ? pgsoftGamesKeyboard : pragmaticGamesKeyboard;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...keyboard
    });
    return;
  }

  // Jogo selecionado
  if (action.startsWith('game_')) {
    const game = action.replace('game_', '');
    analysisData.game = game;
    analysisData.step = 'confirm';
    
    const platformName = analysisService.getPlatformDisplayName(analysisData.platform);
    const providerName = analysisData.provider === 'pgsoft' ? 'PGSoft' : 'Pragmatic Play';
    const gameName = analysisService.getGameDisplayName(game);
    
    const message = `🎯 *Confirmação de Compra*

📋 *Detalhes da análise:*
• Plataforma: ${platformName}
• Provedor: ${providerName}
• Jogo: ${gameName}
• Tipo: ${analysisData.type === 'individual' ? '🔍 Individual' : '👥 Grupo'}
• Custo: ${analysisData.cost} BP

${analysisData.type === 'group' ? 
  '👥 *Esta análise será compartilhada no grupo oficial*' : 
  '🔍 *Esta análise será enviada apenas para você*'}

💰 *Verificar pontos antes da compra?*`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Comprar Análise', callback_data: 'confirm_purchase_analysis' },
            { text: '💰 Ver Meus Pontos', callback_data: 'check_points' }
          ],
          [
            { text: '❌ Cancelar', callback_data: 'cancel_analysis' },
            { text: '⬅️ Voltar', callback_data: 'back' }
          ]
        ]
      }
    });
    return;
  }

  // Verificar pontos
  if (action === 'check_points') {
    try {
      const pointsData = await getUserPoints(ctx.from.id);
      const analysisData = session.analysisData;
      
      const canAfford = pointsData.points >= analysisData.cost;
      
      const message = `💰 *Seus BetPoints*

💎 *Saldo atual:* ${pointsData.points} BP
🎯 *Custo da análise:* ${analysisData.cost} BP
${canAfford ? '✅ *Você pode comprar esta análise*' : '❌ *Saldo insuficiente*'}

${!canAfford ? `
💡 *Como ganhar mais pontos:*
• Envie reports de apostas
• Participe de promoções
• Convide amigos para o grupo
` : ''}

${canAfford ? 'Deseja prosseguir com a compra?' : 'Precisa de mais pontos para esta análise.'}`;

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: canAfford ? [
            [
              { text: '✅ Comprar Análise', callback_data: 'confirm_purchase_analysis' },
              { text: '❌ Cancelar', callback_data: 'cancel_analysis' }
            ],
            [
              { text: '📝 Enviar Report', callback_data: 'menu_report' },
              { text: '⬅️ Voltar', callback_data: 'back' }
            ]
          ] : [
            [
              { text: '📝 Enviar Report', callback_data: 'menu_report' },
              { text: '❌ Cancelar', callback_data: 'cancel_analysis' }
            ]
          ]
        }
      });
    } catch (error) {
      console.error('Erro ao verificar pontos:', error);
      await ctx.reply('❌ Erro ao verificar pontos. Tente novamente.');
    }
    return;
  }
};

// Confirmar compra
const handlePurchaseConfirmation = async (ctx: any, action: string) => {
  const session = ctx.session;
  const analysisData = session.analysisData;
  
  if (!analysisData) {
    return await ctx.reply('❌ Dados da análise perdidos. Reinicie o processo.');
  }

  try {
    await ctx.editMessageText('🔄 Processando compra...', {
      parse_mode: 'Markdown'
    });

    // Dados para a API
    const purchaseData = {
      telegram_id: ctx.from.id,
      platform: analysisData.platform,
      provider: analysisData.provider,
      game: analysisData.game,
      analysis_type: analysisData.type
    };

    let result;
    if (analysisData.type === 'individual') {
      result = await purchaseAnalysis(purchaseData);
    } else {
      result = await purchaseGroupAnalysis(purchaseData);
    }

    if (result.success) {
      // Enviar análise individual
      if (analysisData.type === 'individual') {
        await ctx.editMessageText(result.analysis, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔄 Nova Análise', callback_data: 'menu_analyses' },
                { text: '🏠 Menu Principal', callback_data: 'back_main' }
              ]
            ]
          }
        });
      } else {
        // Enviar para grupo
        if (result.analysis) {
          await groupVerificationService.sendGroupAnalysis(
            ctx.telegram,
            result.analysis
          );
        }
        
        await ctx.editMessageText(
          '✅ *Análise comprada com sucesso!*\n\n' +
          '👥 A análise foi enviada para o grupo oficial.\n\n' +
          '💰 Obrigado por investir na comunidade!',
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔄 Nova Análise', callback_data: 'menu_analyses' },
                  { text: '🏠 Menu Principal', callback_data: 'back_main' }
                ]
              ]
            }
          }
        );
      }
      
      // Limpar dados da sessão
      session.analysisData = {};
      
    } else {
      await ctx.editMessageText(
        `❌ *Erro na compra*\n\n${result.message || 'Erro desconhecido'}`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔄 Tentar Novamente', callback_data: 'menu_analyses' },
                { text: '🏠 Menu Principal', callback_data: 'back_main' }
              ]
            ]
          }
        }
      );
    }

  } catch (error) {
    console.error('❌ Erro ao comprar análise:', error);
    
    await ctx.editMessageText(
      '❌ *Erro ao processar compra*\n\n' +
      'Ocorreu um erro inesperado. Seus pontos não foram descontados.\n\n' +
      'Tente novamente em alguns minutos.',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔄 Tentar Novamente', callback_data: 'menu_analyses' },
              { text: '🏠 Menu Principal', callback_data: 'back_main' }
            ]
          ]
        }
      }
    );
  }
};