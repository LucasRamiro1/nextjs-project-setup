// src/bot/commands/history.ts
import { backToMainButton } from '../keyboards/mainMenu.js';
import { navigationManager } from '../utils/navigation.js';
import { getUserHistory } from '../services/api.js';

export const handleHistoryFlow = async (ctx: any) => {
  const session = ctx.session;
  navigationManager.pushToStack(session, 'main');

  try {
    await ctx.editMessageText('🔄 Carregando seu histórico...', {
      parse_mode: 'Markdown'
    });

    const history = await getUserHistory(ctx.from.id);
    
    let message = '📋 *Seu Histórico Completo*\n\n';

    // Reports recentes
    if (history.reports && history.reports.length > 0) {
      message += '📝 *Reports Recentes:*\n';
      history.reports.slice(0, 5).forEach((report: any, index: number) => {
        const status = report.status === 'approved' ? '✅' : 
                      report.status === 'rejected' ? '❌' : 
                      report.status === 'pending' ? '⏳' : '❓';
        const date = new Date(report.created_at).toLocaleDateString('pt-BR');
        const time = new Date(report.created_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        message += `${index + 1}. ${status} **${report.game}**\n`;
        message += `   🎰 ${report.platform} • ${report.provider}\n`;
        message += `   💰 ${report.bet_value} • ${report.result === 'win' ? '📈 Ganho' : '📉 Perda'}\n`;
        message += `   📅 ${date} às ${time}\n`;
        
        if (report.points_earned > 0) {
          message += `   💎 +${report.points_earned} BP\n`;
        }
        
        if (report.rejection_reason) {
          message += `   ❌ Motivo: ${report.rejection_reason}\n`;
        }
        
        message += '\n';
      });
      
      if (history.reports.length > 5) {
        message += `... e mais ${history.reports.length - 5} reports\n\n`;
      }
    } else {
      message += '📝 *Reports:* Nenhum report enviado ainda\n\n';
    }

    // Análises recentes
    if (history.analyses && history.analyses.length > 0) {
      message += '📊 *Análises Recentes:*\n';
      history.analyses.slice(0, 5).forEach((analysis: any, index: number) => {
        const date = new Date(analysis.created_at).toLocaleDateString('pt-BR');
        const time = new Date(analysis.created_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        const type = analysis.type === 'individual' ? '🔍 Individual' : '👥 Grupo';
        
        message += `${index + 1}. ${type} **${analysis.game}**\n`;
        message += `   🎰 ${analysis.platform} • ${analysis.provider}\n`;
        message += `   💎 -${analysis.cost} BP\n`;
        message += `   📅 ${date} às ${time}\n\n`;
      });
      
      if (history.analyses.length > 5) {
        message += `... e mais ${history.analyses.length - 5} análises\n\n`;
      }
    } else {
      message += '📊 *Análises:* Nenhuma análise comprada ainda\n\n';
    }

    // Estatísticas gerais
    message += '📈 *Suas Estatísticas:*\n';
    message += `• Total de reports: ${history.stats?.total_reports || 0}\n`;
    message += `• Reports aprovados: ${history.stats?.approved_reports || 0}\n`;
    message += `• Reports rejeitados: ${history.stats?.rejected_reports || 0}\n`;
    message += `• Taxa de aprovação: ${history.stats?.approval_rate || 0}%\n`;
    message += `• Total gasto em análises: ${history.stats?.total_spent || 0} BP\n`;
    message += `• Pontos ganhos com reports: ${history.stats?.points_earned || 0} BP\n`;
    message += `• Análises compradas: ${history.stats?.analyses_purchased || 0}\n\n`;

    // Dicas para melhorar
    if (history.stats?.approval_rate < 80) {
      message += '💡 *Dicas para melhorar:*\n';
      message += '• Envie fotos mais claras\n';
      message += '• Seja preciso com horários\n';
      message += '• Inclua ID da transação\n';
      message += '• Verifique os dados antes de enviar\n\n';
    }

    // Atividade recente
    if (history.last_activity) {
      const lastActivity = new Date(history.last_activity);
      const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceActivity > 7) {
        message += '⏰ *Você está inativo há mais de 7 dias!*\n';
        message += 'Envie um report hoje e ganhe +5 BP de bônus!\n\n';
      }
    }

    message += '🔄 *Histórico atualizado em tempo real*';

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📝 Novo Report', callback_data: 'menu_report' },
            { text: '📊 Comprar Análise', callback_data: 'menu_analyses' }
          ],
          [
            { text: '💰 Ver Pontos', callback_data: 'menu_points' },
            { text: '🏆 Ver Ranking', callback_data: 'menu_ranking' }
          ],
          [
            { text: '⬅️ Voltar', callback_data: 'back' }
          ]
        ]
      }
    });

  } catch (error) {
    console.error('❌ Erro ao carregar histórico:', error);
    await ctx.editMessageText('❌ Erro ao carregar seu histórico. Tente novamente.', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Tentar Novamente', callback_data: 'menu_history' }],
          [{ text: '⬅️ Voltar', callback_data: 'back' }]
        ]
      }
    });
  }
};