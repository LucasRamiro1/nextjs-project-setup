// src/bot/commands/points.ts
import { backToMainButton } from '../keyboards/mainMenu.js';
import { navigationManager } from '../utils/navigation.js';
import { getUserPoints } from '../services/api.js';

export const handlePointsFlow = async (ctx: any) => {
  const session = ctx.session;
  navigationManager.pushToStack(session, 'main');

  try {
    await ctx.editMessageText('🔄 Carregando seus BetPoints...', {
      parse_mode: 'Markdown'
    });

    const pointsData = await getUserPoints(ctx.from.id);
    
    const message = `💰 *Seus BetPoints*

💎 *Saldo atual:* **${pointsData.points || 0} BP**

📊 *Detalhamento:*
• Reports aprovados: +${pointsData.reports_points || 0} BP
• Análises compradas: -${pointsData.spent_points || 0} BP
• Bônus recebidos: +${pointsData.bonus_points || 0} BP
• Cashback: +${pointsData.cashback_points || 0} BP

📈 *Estatísticas:*
• Total de reports: ${pointsData.total_reports || 0}
• Reports aprovados: ${pointsData.approved_reports || 0}
• Taxa de aprovação: ${pointsData.approval_rate || 0}%
• Análises compradas: ${pointsData.analyses_purchased || 0}

💡 *Como ganhar mais pontos:*
• Envie reports de apostas (10-20 BP)
• Primeiro report do dia (+5 BP bônus)
• Reports com fotos (+5 BP extra)
• Participe de promoções especiais
• Convide amigos para o grupo

🎯 *Como usar seus pontos:*
• Análise individual: 25 BP
• Análise para grupo: 500 BP
• Promoções especiais (em breve)

${pointsData.points >= 25 ? 
  '✅ Você pode comprar uma análise individual!' : 
  `❌ Precisa de mais ${25 - pointsData.points} BP para análise individual`}

${pointsData.points >= 500 ? 
  '🎉 Você pode comprar uma análise para grupo!' : 
  `💰 Precisa de mais ${500 - pointsData.points} BP para análise de grupo`}`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Comprar Análise', callback_data: 'menu_analyses' },
            { text: '📝 Enviar Report', callback_data: 'menu_report' }
          ],
          [
            { text: '🏆 Ver Ranking', callback_data: 'menu_ranking' },
            { text: '📋 Histórico', callback_data: 'menu_history' }
          ],
          [
            { text: '⬅️ Voltar', callback_data: 'back' }
          ]
        ]
      }
    });

  } catch (error) {
    console.error('❌ Erro ao carregar pontos:', error);
    await ctx.editMessageText('❌ Erro ao carregar seus pontos. Tente novamente.', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Tentar Novamente', callback_data: 'menu_points' }],
          [{ text: '⬅️ Voltar', callback_data: 'back' }]
        ]
      }
    });
  }
};