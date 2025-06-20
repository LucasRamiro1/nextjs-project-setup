// src/bot/index.ts
import { bot } from './bot.js';
import { config } from './config.js';
import { handleAdminCommand } from './commands/admin.js';

// Registrar comandos administrativos
bot.command('admin', handleAdminCommand);

// Comandos de utilitário
bot.command('pontos', async (ctx) => {
  try {
    const { getUserPoints } = await import('./services/api.js');
    const pointsData = await getUserPoints(ctx.from.id);
    
    const message = `💰 **Seus BetPoints**

💎 Saldo atual: ${pointsData.points || 0} BP

📊 Histórico:
• Reports aprovados: +${pointsData.reports_points || 0} BP
• Análises compradas: -${pointsData.spent_points || 0} BP
• Bônus recebidos: +${pointsData.bonus_points || 0} BP`;

    return ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar pontos:', error);
    return ctx.reply('❌ Erro ao buscar seus pontos.');
  }
});

bot.command('historico', async (ctx) => {
  try {
    const { getUserHistory } = await import('./services/api.js');
    const history = await getUserHistory(ctx.from.id);

    let message = '📋 **Seu Histórico**\n\n';

    if (history.reports && history.reports.length > 0) {
      message += '📝 **Reports recentes:**\n';
      history.reports.slice(0, 5).forEach((report: any) => {
        const status = report.status === 'approved' ? '✅' : 
                      report.status === 'rejected' ? '❌' : '⏳';
        message += `${status} ${report.game} - ${report.created_at}\n`;
      });
    } else {
      message += '📝 **Reports:** Nenhum report enviado\n';
    }

    message += '\n';

    if (history.analyses && history.analyses.length > 0) {
      message += '📊 **Análises recentes:**\n';
      history.analyses.slice(0, 5).forEach((analysis: any) => {
        message += `🔍 ${analysis.game} - ${analysis.created_at}\n`;
      });
    } else {
      message += '📊 **Análises:** Nenhuma análise comprada';
    }

    return ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return ctx.reply('❌ Erro ao buscar histórico.');
  }
});

bot.command('help', (ctx) => {
  const message = `🤖 **RewardTrackerBot - Ajuda**

**Comandos disponíveis:**
• /start - Iniciar o bot
• /pontos - Ver seus BetPoints
• /historico - Ver seu histórico
• /help - Esta mensagem de ajuda

**Como usar:**
1️⃣ Use o menu principal para navegar
2️⃣ Envie reports para ganhar pontos
3️⃣ Compre análises com seus pontos
4️⃣ Acesse plataformas parceiras

**Suporte:**
Para dúvidas ou problemas, entre em contato com um administrador.`;

  return ctx.reply(message, { parse_mode: 'Markdown' });
});

// Função para iniciar o bot
export const startBot = async () => {
  try {
    console.log('🤖 Iniciando RewardTrackerBot...');
    
    // Verificar configurações
    if (!config.BOT_TOKEN) {
      throw new Error('TELEGRAM_TOKEN não configurado');
    }

    // Iniciar bot
    await bot.launch();
    console.log('✅ Bot iniciado com sucesso!');
    console.log(`🔧 Ambiente: ${config.NODE_ENV}`);
    console.log(`🌐 API: ${config.API_BASE_URL}`);
    console.log(`👑 Admins: ${config.ADMIN_IDS.length}`);
    
    // Graceful shutdown
    process.once('SIGINT', () => {
      console.log('🛑 Parando bot...');
      bot.stop('SIGINT');
    });

    process.once('SIGTERM', () => {
      console.log('🛑 Parando bot...');
      bot.stop('SIGTERM');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar bot:', error);
    process.exit(1);
  }
};

// Iniciar bot se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  startBot();
}

export { bot };