// src/bot/handlers/message.ts
import { mainKeyboard } from '../keyboards/mainMenu.js';
import { conversationManager } from './conversation.js';

export const handleMessage = async (ctx: any) => {
  try {
    const messageText = ctx.message.text;
    const session = ctx.session;

    // Verificar se há uma conversação ativa
    if (session.conversationData) {
      const processed = await conversationManager.processTextMessage(ctx, messageText);
      if (processed) {
        return; // Mensagem processada pela conversação
      }
    }

    // Comandos especiais
    if (messageText.startsWith('/')) {
      return await handleSlashCommand(ctx, messageText);
    }

    // Mensagens casuais
    await handleCasualMessage(ctx, messageText);

  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error);
    await ctx.reply('❌ Erro ao processar sua mensagem. Tente novamente.');
  }
};

// Handler para comandos com /
const handleSlashCommand = async (ctx: any, command: string) => {
  const [cmd] = command.toLowerCase().split(' ');
  
  switch (cmd) {
    case '/pontos':
      return await handlePointsCommand(ctx);
    
    case '/historico':
      return await handleHistoryCommand(ctx);
    
    case '/help':
      return await handleHelpCommand(ctx);
    
    case '/status':
      return await handleStatusCommand(ctx);
    
    default:
      await ctx.reply(`❓ Comando não reconhecido: ${command}\n\nUse /help para ver comandos disponíveis.`);
  }
};

// Comando de pontos
const handlePointsCommand = async (ctx: any) => {
  try {
    const { getUserPoints } = await import('../services/api.js');
    const pointsData = await getUserPoints(ctx.from.id);
    
    const message = `💰 *Seus BetPoints*

💎 *Saldo atual:* ${pointsData.points || 0} BP

📊 *Detalhamento:*
• Reports aprovados: +${pointsData.reports_points || 0} BP
• Análises compradas: -${pointsData.spent_points || 0} BP
• Bônus recebidos: +${pointsData.bonus_points || 0} BP

📈 *Como ganhar mais pontos:*
• Envie reports de apostas (até 20 BP por report)
• Participe de promoções especiais
• Convide amigos para o grupo

💡 *Como usar seus pontos:*
• Análise individual: 25 BP
• Análise para grupo: 500 BP`;

    return ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar pontos:', error);
    return ctx.reply('❌ Erro ao buscar seus pontos. Tente novamente.');
  }
};

// Comando de histórico
const handleHistoryCommand = async (ctx: any) => {
  try {
    const { getUserHistory } = await import('../services/api.js');
    const history = await getUserHistory(ctx.from.id);

    let message = '📋 *Seu Histórico Completo*\n\n';

    // Reports
    if (history.reports && history.reports.length > 0) {
      message += '📝 *Reports Recentes:*\n';
      history.reports.slice(0, 5).forEach((report: any) => {
        const status = report.status === 'approved' ? '✅' : 
                      report.status === 'rejected' ? '❌' : '⏳';
        const date = new Date(report.created_at).toLocaleDateString('pt-BR');
        message += `${status} ${report.game} - ${report.platform}\n`;
        message += `   💰 ${report.bet_value} | 📅 ${date}\n\n`;
      });
    } else {
      message += '📝 *Reports:* Nenhum report enviado ainda\n\n';
    }

    // Análises
    if (history.analyses && history.analyses.length > 0) {
      message += '📊 *Análises Recentes:*\n';
      history.analyses.slice(0, 5).forEach((analysis: any) => {
        const date = new Date(analysis.created_at).toLocaleDateString('pt-BR');
        const type = analysis.type === 'individual' ? '🔍' : '👥';
        message += `${type} ${analysis.game} - ${analysis.platform}\n`;
        message += `   💎 ${analysis.cost} BP | 📅 ${date}\n\n`;
      });
    } else {
      message += '📊 *Análises:* Nenhuma análise comprada ainda\n\n';
    }

    // Estatísticas
    message += '📈 *Suas Estatísticas:*\n';
    message += `• Total de reports: ${history.stats?.total_reports || 0}\n`;
    message += `• Reports aprovados: ${history.stats?.approved_reports || 0}\n`;
    message += `• Taxa de aprovação: ${history.stats?.approval_rate || 0}%\n`;
    message += `• Total gasto em análises: ${history.stats?.total_spent || 0} BP`;

    return ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return ctx.reply('❌ Erro ao buscar seu histórico. Tente novamente.');
  }
};

// Comando de ajuda
const handleHelpCommand = async (ctx: any) => {
  const message = `🤖 *RewardTrackerBot - Guia Completo*

🔧 *Comandos Básicos:*
• /start - Iniciar o bot
• /pontos - Ver seus BetPoints
• /historico - Consultar histórico
• /help - Esta mensagem
• /status - Status do sistema

📝 *Sistema de Reports:*
• Selecione plataforma → provedor → jogo
• Informe valor, resultado e horário
• Envie até 4 fotos como comprovação
• Aguarde aprovação (até 24h)

📊 *Sistema de Análises:*
• Individual: 25 BP (só para você)
• Grupo: 500 BP (compartilhado)
• Baseadas em dados reais
• Recomendações de horários

🏆 *Sistema de Ranking:*
• Diário, semanal e mensal
• Baseado em pontos BP
• Prêmios para top players

💰 *BetPoints (BP):*
• Ganhe enviando reports
• Use para comprar análises
• Participe de promoções

🎰 *Plataformas Parceiras:*
• Links com bônus especiais
• Cashback exclusivo
• Suporte prioritário

❓ *Dúvidas ou Problemas:*
• Entre em contato com @admin
• Reporte bugs ou sugestões
• Participe do grupo oficial`;

  return ctx.reply(message, { parse_mode: 'Markdown' });
};

// Comando de status
const handleStatusCommand = async (ctx: any) => {
  try {
    const { getSystemSettings } = await import('../services/api.js');
    const settings = await getSystemSettings();
    
    const message = `🔧 *Status do Sistema*

⚡ *Operacional:* ${settings.operational ? '✅ Online' : '❌ Offline'}
🔄 *Última atualização:* ${new Date(settings.last_update).toLocaleString('pt-BR')}

📊 *Estatísticas:*
• Usuários ativos: ${settings.stats?.active_users || 0}
• Reports hoje: ${settings.stats?.reports_today || 0}
• Análises hoje: ${settings.stats?.analyses_today || 0}

🎯 *Funcionalidades:*
• Reports: ${settings.features?.reports ? '✅' : '❌'}
• Análises: ${settings.features?.analyses ? '✅' : '❌'}
• Ranking: ${settings.features?.ranking ? '✅' : '❌'}
• Plataformas: ${settings.features?.platforms ? '✅' : '❌'}

💡 *Versão:* ${settings.version || '1.0.0'}`;

    return ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return ctx.reply('❌ Erro ao buscar status do sistema.');
  }
};

// Handler para mensagens casuais
const handleCasualMessage = async (ctx: any) => {
  const messageText = ctx.message.text.toLowerCase();
  
  // Respostas automáticas para palavras-chave
  if (messageText.includes('ajuda') || messageText.includes('help')) {
    return await handleHelpCommand(ctx);
  }
  
  if (messageText.includes('pontos') || messageText.includes('saldo')) {
    return await handlePointsCommand(ctx);
  }
  
  if (messageText.includes('ranking') || messageText.includes('posição')) {
    await ctx.reply('🏆 Use o menu para acessar o ranking!', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🏆 Ver Ranking', callback_data: 'menu_ranking' }],
          [{ text: '🏠 Menu Principal', callback_data: 'back_main' }]
        ]
      }
    });
    return;
  }
  
  // Resposta padrão
  const responses = [
    '🤖 Olá! Use o menu para navegar pelas funcionalidades.',
    '👋 Oi! Precisa de ajuda? Use /help para ver os comandos.',
    '😊 Estou aqui para ajudar! Use o menu abaixo para começar.',
    '🎯 Não entendi sua mensagem. Use o menu para navegar!'
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  await ctx.reply(randomResponse, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🏠 Menu Principal', callback_data: 'back_main' }],
        [{ text: '❓ Ajuda', callback_data: 'help' }]
      ]
    }
  });
};