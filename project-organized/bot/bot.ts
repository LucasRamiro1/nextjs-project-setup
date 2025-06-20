// src/bot/bot.ts
import { Telegraf, session } from 'telegraf';
import { config } from './config.js';
import { mainKeyboard } from './keyboards/mainMenu.js';
import { handleCallbackQuery } from './handlers/callbackQuery.js';
import { handleMessage } from './handlers/message.js';
import { handleConversationPhoto } from './handlers/conversation.js';
import { registerUser } from './services/api.js';
import { groupVerificationService } from './services/groupVerification.js';

const bot = new Telegraf(config.BOT_TOKEN, {
  handlerTimeout: 60_000,
  telegram: {
    webhookReply: false,
    agent: null
  }
});

// Função de escape MarkdownV2
function escapeMarkdown(text = '') {
  return text.toString()
    .replace(/\\/g, '\\\\')
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
}

// Middleware de sessão
bot.use(session({
  defaultSession: () => ({
    navigationStack: [],
    currentFlow: null,
    reportData: {},
    analysisData: {},
    conversationData: null,
    __startHandled: false
  })
}));

// Middleware global para verificação de grupo
bot.use(async (ctx, next) => {
  // Pular verificação para comandos específicos
  if (ctx.message?.text?.startsWith('/start') || 
      ctx.message?.text?.startsWith('/help') ||
      ctx.callbackQuery?.data === 'verify_group') {
    return next();
  }

  // Verificar se é admin
  if (config.ADMIN_IDS.includes(ctx.from.id)) {
    return next();
  }

  // Verificar se está no grupo obrigatório
  if (config.REQUIRED_GROUP_ID) {
    const isInGroup = await groupVerificationService.checkUserInGroup(bot.telegram, ctx.from.id);
    
    if (!isInGroup) {
      const message = groupVerificationService.getGroupRequirementMessage();
      return ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Verificar Novamente', callback_data: 'verify_group' }]
          ]
        }
      });
    }
  }

  return next();
});

// Comando /start
bot.start(async (ctx) => {
  try {
    if (ctx.session.__startHandled) return;
    ctx.session.__startHandled = true;

    const user = ctx.from;
    if (!user) {
      return ctx.reply('❌ Não foi possível identificar seu usuário.');
    }

    const getValidName = () => {
      if (!user.first_name && !user.last_name) return 'Usuário';

      const firstName = user.first_name
        ? escapeMarkdown(user.first_name).substring(0, 30)
        : '';

      const lastName = user.last_name
        ? escapeMarkdown(user.last_name).substring(0, 30)
        : '';

      return [firstName, lastName].filter(Boolean).join(' ') || 'Usuário';
    };

    const userName = getValidName();

    await registerUser({
      telegram_id: user.id,
      username: user.username ? escapeMarkdown(user.username) : '',
      first_name: userName,
      last_name: ''
    });

    const welcome = `🎰 *Bem\\-vindo ao RewardTrackerBot\\!*\n\n` +
      `Olá ${userName} 👋\n\n` +
      `🎯 *Funcionalidades disponíveis:*\n` +
      `📊 Análises baseadas em dados reais\n` +
      `🎰 Plataformas parceiras\n` +
      `📝 Sistema de reports com pontos\n` +
      `🏆 Ranking competitivo\n` +
      `💰 Gestão de BetPoints\n\n` +
      `📈 *Como funciona:*\n` +
      `• Envie reports → Ganhe pontos\n` +
      `• Use pontos → Compre análises\n` +
      `• Acumule pontos → Suba no ranking\n\n` +
      `Use o menu abaixo para começar:`;

    await ctx.reply(welcome, {
      parse_mode: 'MarkdownV2',
      ...mainKeyboard
    });

  } catch (error) {
    console.error('[START ERROR]', error);
    await ctx.reply('❌ Erro ao iniciar. Tente novamente.');
  }
});

// Handlers
bot.on('callback_query', handleCallbackQuery);
bot.on('text', handleMessage);
bot.on('photo', handleConversationPhoto);

// Comandos administrativos
bot.command('admin', (ctx) => {
  if (!config.ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.reply('❌ Acesso negado.');
  }
  return ctx.reply('🛠️ Painel administrativo - Use o dashboard web para gerenciar o sistema.');
});

// Comandos de controle de report
bot.command('finalizar', async (ctx) => {
  try {
    const sessionData = ctx.session;

    if (sessionData?.currentFlow === 'report' &&
      sessionData?.conversationData?.step === 'waiting_photos') {

      await ctx.reply(
        '⚠️ *Confirmar envio do report?*\n\n' +
        'Você tem certeza que deseja finalizar e enviar este report?',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Sim, Finalizar', callback_data: 'confirm_submit' },
                { text: '❌ Cancelar', callback_data: 'cancel_report' }
              ]
            ]
          }
        }
      );
      return;
    }

    await ctx.reply(
      'ℹ️ *Nenhum report ativo*\n\n' +
      'Você só pode usar /finalizar durante um report ativo.\n\n' +
      'Deseja iniciar um novo report?',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📝 Novo Report', callback_data: 'menu_report' }]
          ]
        }
      }
    );

  } catch (error) {
    console.error('[FINALIZAR ERROR]', error);
    await ctx.reply('❌ Erro ao finalizar. Tente novamente.');
  }
});

bot.command('cancelar', async (ctx) => {
  try {
    const sessionData = ctx.session;

    if (sessionData?.currentFlow === 'report') {
      await ctx.reply(
        '⚠️ *Confirmar cancelamento?*\n\n' +
        'Todos os dados do report serão perdidos. Tem certeza?',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Sim, Cancelar', callback_data: 'confirm_cancel' },
                { text: '❌ Continuar Report', callback_data: 'continue_report' }
              ]
            ]
          }
        }
      );
      return;
    }

    await ctx.reply(
      'ℹ️ *Nenhum report ativo*\n\n' +
      'Você só pode usar /cancelar durante um report ativo.',
      {
        parse_mode: 'Markdown'
      }
    );

  } catch (error) {
    console.error('[CANCELAR ERROR]', error);
    await ctx.reply('❌ Erro ao cancelar. Tente novamente.');
  }
});

// Tratamento de erros
bot.catch(async (error, ctx) => {
  console.error('[GLOBAL ERROR]', {
    timestamp: new Date().toISOString(),
    error: error.message,
    user: ctx.from?.id
  });

  try {
    await ctx.reply(
      '⚠️ *Erro inesperado*\n\n' +
      'Nosso sistema encontrou um problema. Nossa equipe já foi notificada.',
      { parse_mode: 'Markdown' }
    );

    // Notificar admins
    for (const adminId of config.ADMIN_IDS) {
      try {
        await bot.telegram.sendMessage(
          adminId,
          `🚨 *Erro no Bot*\n\n` +
          `• *Usuário*: ${ctx.from?.id || 'N/A'}\n` +
          `• *Erro*: ${error.message}\n` +
          `• *Hora*: ${new Date().toLocaleString()}`,
          { parse_mode: 'Markdown' }
        );
      } catch (adminError) {
        console.error('Erro ao notificar admin:', adminError);
      }
    }
  } catch (sendError) {
    console.error('Erro ao enviar mensagem de erro:', sendError);
  }
});

export { bot, escapeMarkdown };