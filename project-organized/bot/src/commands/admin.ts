// src/bot/commands/admin.ts
import { config } from '../config.js';
import { getPendingBroadcasts, promoteUser, getSystemSettings } from '../services/api.js';

export const handleAdminCommand = async (ctx: any) => {
  // Verificar se é admin
  if (!config.ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.reply('❌ Acesso negado.');
  }

  const message = `🛠️ *Painel Administrativo*

👑 Olá, Admin ${ctx.from.first_name}!

🖥️ **Dashboard Web Completo:**
${config.API_BASE_URL.replace('/api', '')}

📊 **Funcionalidades Disponíveis:**
• Gerenciar usuários e reports
• Aprovar/rejeitar reports
• Configurar sistema de pontos
• Broadcasts para usuários
• Análises e estatísticas

💡 **Use o dashboard web para:**
• Análise completa de dados
• Gestão de usuários
• Configurações avançadas
• Relatórios detalhados

🤖 **Comandos do Bot:**
• /status - Status do sistema
• /broadcast - Enviar mensagem
• /promote - Promover usuário

🔧 **Tudo integrado com o painel web!**`;

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🖥️ Abrir Dashboard', url: config.API_BASE_URL.replace('/api', '') },
          { text: '📊 Status Sistema', callback_data: 'admin_status' }
        ],
        [
          { text: '📢 Broadcasts', callback_data: 'admin_broadcasts' },
          { text: '👥 Usuários', callback_data: 'admin_users' }
        ]
      ]
    }
  });
};

// Status do sistema para admins
export const handleAdminStatus = async (ctx: any) => {
  if (!config.ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.reply('❌ Acesso negado.');
  }

  try {
    const settings = await getSystemSettings();
    
    const message = `🔧 *Status Detalhado do Sistema*

⚡ **Operacional:** ${settings.operational ? '✅ Online' : '❌ Offline'}
🔄 **Última atualização:** ${new Date().toLocaleString('pt-BR')}

📊 **Estatísticas em Tempo Real:**
• Usuários total: ${settings.stats?.total_users || 0}
• Usuários ativos hoje: ${settings.stats?.active_users_today || 0}
• Reports pendentes: ${settings.stats?.pending_reports || 0}
• Reports hoje: ${settings.stats?.reports_today || 0}
• Análises hoje: ${settings.stats?.analyses_today || 0}
• Pontos distribuídos hoje: ${settings.stats?.points_distributed_today || 0}

🎯 **Funcionalidades:**
• Reports: ${settings.features?.reports ? '✅ Ativo' : '❌ Inativo'}
• Análises: ${settings.features?.analyses ? '✅ Ativo' : '❌ Inativo'}
• Ranking: ${settings.features?.ranking ? '✅ Ativo' : '❌ Inativo'}
• Plataformas: ${settings.features?.platforms ? '✅ Ativo' : '❌ Inativo'}
• Grupo obrigatório: ${config.REQUIRED_GROUP_ID ? '✅ Ativo' : '❌ Inativo'}

🔧 **Sistema:**
• Versão: ${settings.version || '1.0.0'}
• Ambiente: ${config.NODE_ENV}
• Database: ${settings.database?.status || 'Conectado'}
• API: ${settings.api?.status || 'Online'}

⚠️ **Alertas:**
${settings.alerts?.length > 0 ? 
  settings.alerts.map((alert: string) => `• ${alert}`).join('\n') : 
  '• Nenhum alerta no momento'}`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔄 Atualizar', callback_data: 'admin_status' },
            { text: '🖥️ Dashboard', url: config.API_BASE_URL.replace('/api', '') }
          ]
        ]
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar status:', error);
    await ctx.reply('❌ Erro ao buscar status do sistema.');
  }
};

// Broadcasts pendentes
export const handleAdminBroadcasts = async (ctx: any) => {
  if (!config.ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.reply('❌ Acesso negado.');
  }

  try {
    const broadcasts = await getPendingBroadcasts();
    
    if (!broadcasts || broadcasts.length === 0) {
      return ctx.reply('📢 Nenhum broadcast pendente.\n\nUse o dashboard web para criar broadcasts.');
    }

    let message = '📢 *Broadcasts Pendentes*\n\n';
    
    broadcasts.forEach((broadcast: any, index: number) => {
      message += `${index + 1}. **${broadcast.title}**\n`;
      message += `   📅 Criado: ${new Date(broadcast.created_at).toLocaleDateString('pt-BR')}\n`;
      message += `   👥 Destinatários: ${broadcast.target_users || 'Todos'}\n`;
      message += `   📝 Prévia: ${broadcast.message.substring(0, 50)}...\n\n`;
    });

    message += '🖥️ **Use o dashboard web para gerenciar broadcasts**';

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🖥️ Gerenciar no Dashboard', url: config.API_BASE_URL.replace('/api', '/broadcasts') },
            { text: '🔄 Atualizar', callback_data: 'admin_broadcasts' }
          ]
        ]
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar broadcasts:', error);
    await ctx.reply('❌ Erro ao buscar broadcasts pendentes.');
  }
};