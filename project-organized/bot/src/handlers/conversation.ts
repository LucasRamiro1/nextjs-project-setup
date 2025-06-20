// src/bot/handlers/conversation.ts
import { backButton } from '../keyboards/mainMenu.js';
import { validateBetValue, validateTime, sanitizeInput } from '../utils/validation.js';

export class ConversationManager {
  private activeConversations: Map<number, any>;

  constructor() {
    this.activeConversations = new Map();
  }

  // Iniciar conversação
  startConversation(ctx: any, type: string, data = {}): void {
    const userId = ctx.from.id;
    const session = ctx.session;
    
    session.currentFlow = type;
    session.conversationData = {
      type,
      step: 'start',
      data: { ...data },
      startedAt: new Date(),
      lastActivity: new Date()
    };

    this.activeConversations.set(userId, session.conversationData);
    console.log(`🔄 Conversação ${type} iniciada para ${userId}`);
  }

  // Processar mensagem de texto
  async processTextMessage(ctx: any, text: string): Promise<boolean> {
    const session = ctx.session;
    const conversation = session.conversationData;

    if (!conversation) {
      return false;
    }

    // Atualizar atividade
    conversation.lastActivity = new Date();

    try {
      switch (conversation.type) {
        case 'report':
          return await this.handleReportConversation(ctx, text, conversation);
        
        case 'analysis_individual':
        case 'analysis_group':
          return await this.handleAnalysisConversation(ctx, text, conversation);
        
        default:
          console.warn(`⚠️ Tipo de conversação desconhecido: ${conversation.type}`);
          return false;
      }
    } catch (error) {
      console.error('❌ Erro na conversação:', error);
      await ctx.reply('❌ Erro ao processar. A conversação será reiniciada.');
      this.endConversation(ctx);
      return true;
    }
  }

  // Handler para conversação de report
  async handleReportConversation(ctx: any, text: string, conversation: any): Promise<boolean> {
    const session = ctx.session;

    switch (conversation.step) {
      case 'bet_value':
        return await this.handleBetValueInput(ctx, text, conversation);
      
      case 'bet_time':
        return await this.handleBetTimeInput(ctx, text, conversation);
      
      case 'waiting_photos':
        return await this.handlePhotoWaitingMessage(ctx, text, conversation);
      
      case 'additional_info':
        return await this.handleAdditionalInfoInput(ctx, text, conversation);
      
      default:
        return false;
    }
  }

  // Handler para entrada do valor da aposta
  async handleBetValueInput(ctx: any, text: string, conversation: any): Promise<boolean> {
    const validation = validateBetValue(text);
    
    if (!validation.isValid) {
      await ctx.reply(
        `❌ ${validation.message}\n\n💰 Digite o valor da aposta:\n\n` +
        `💡 *Exemplos válidos:*\n• R$ 0,50\n• 1.00\n• 5,25\n• 10`
      );
      return true;
    }

    const session = ctx.session;
    session.reportData.bet_value = `R$ ${validation.value!.toFixed(2).replace('.', ',')}`;
    conversation.step = 'result';

    const message = `✅ Valor registrado: **${session.reportData.bet_value}**

🎯 *Agora informe o resultado da sua aposta:*`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Ganho', callback_data: 'result_win' },
            { text: '❌ Perda', callback_data: 'result_loss' }
          ],
          [
            { text: '⬅️ Voltar', callback_data: 'back' }
          ]
        ]
      }
    });

    return true;
  }

  // Handler para entrada do horário
  async handleBetTimeInput(ctx: any, text: string, conversation: any): Promise<boolean> {
    const validation = validateTime(text);
    
    if (!validation.isValid) {
      await ctx.reply(
        `❌ ${validation.message}\n\n⏰ Digite o horário da aposta:\n\n` +
        `💡 *Exemplos válidos:*\n• 14:30\n• 09:15\n• 22:45\n• 08:00`
      );
      return true;
    }

    const session = ctx.session;
    session.reportData.bet_time = validation.time;
    conversation.step = 'waiting_photos';

    const message = `✅ Horário registrado: **${session.reportData.bet_time}**

📋 *Resumo do seu report:*
• Plataforma: ${session.reportData.platform}
• Provedor: ${session.reportData.provider}
• Jogo: ${session.reportData.game}
• Valor: ${session.reportData.bet_value}
• Resultado: ${session.reportData.result === 'win' ? '✅ Ganho' : '❌ Perda'}
• Horário: ${session.reportData.bet_time}

📷 *Agora envie fotos como comprovação:*

💡 *Dicas importantes:*
• Envie até 4 fotos
• Inclua print da aposta
• Mostre o ID da transação
• Fotos claras aumentam aprovação

*Comandos:*
• /finalizar - Enviar report
• /cancelar - Cancelar report`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...backButton
    });

    // Inicializar array de fotos
    if (!session.reportData.photos) {
      session.reportData.photos = [];
    }

    return true;
  }

  // Handler para mensagens durante espera de fotos
  async handlePhotoWaitingMessage(ctx: any, text: string, conversation: any): Promise<boolean> {
    const cleanText = text.toLowerCase().trim();

    // Comandos especiais
    if (cleanText === '/finalizar' || cleanText === 'finalizar') {
      return await this.finalizeReport(ctx, conversation);
    }

    if (cleanText === '/cancelar' || cleanText === 'cancelar') {
      return await this.cancelReport(ctx, conversation);
    }

    if (cleanText === '/info' || cleanText === 'info') {
      conversation.step = 'additional_info';
      await ctx.reply(
        '📝 *Informações Adicionais*\n\n' +
        'Digite qualquer informação extra sobre sua aposta:\n\n' +
        '💡 *Exemplos:*\n• Estratégia utilizada\n• Padrões observados\n• Comentários sobre o jogo\n\n' +
        'Ou digite "pular" para continuar sem informações extras:'
      );
      return true;
    }

    // Resposta padrão
    const session = ctx.session;
    const photoCount = session.reportData.photos?.length || 0;

    const message = `📷 *Aguardando fotos...*

📊 *Status atual:*
• Fotos enviadas: ${photoCount}/4
• Dados: ✅ Completos

*Próximos passos:*
• Envie fotos (máximo 4)
• /finalizar - Enviar report
• /cancelar - Cancelar report
• /info - Adicionar informações extras

💡 *Lembre-se:* Fotos claras aumentam as chances de aprovação!`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });

    return true;
  }

  // Handler para informações adicionais
  async handleAdditionalInfoInput(ctx: any, text: string, conversation: any): Promise<boolean> {
    const session = ctx.session;
    const cleanText = text.toLowerCase().trim();

    if (cleanText === 'pular' || cleanText === '/pular') {
      session.reportData.additional_info = '';
    } else {
      session.reportData.additional_info = sanitizeInput(text);
    }

    conversation.step = 'waiting_photos';

    const message = `✅ *Informações ${cleanText === 'pular' ? 'puladas' : 'adicionadas'}*

📷 *Agora envie suas fotos:*

*Status:*
• Dados: ✅ Completos
• Info extra: ${session.reportData.additional_info ? '✅ Adicionada' : '⏭️ Pulada'}
• Fotos: ${session.reportData.photos?.length || 0}/4

*Comandos:*
• /finalizar - Enviar report
• /cancelar - Cancelar report`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });

    return true;
  }

  // Finalizar report
  async finalizeReport(ctx: any, conversation: any): Promise<boolean> {
    const session = ctx.session;
    const photoCount = session.reportData.photos?.length || 0;

    if (photoCount === 0) {
      await ctx.reply(
        '⚠️ *Nenhuma foto enviada*\n\n' +
        'Reports sem fotos têm menor chance de aprovação.\n\n' +
        'Deseja enviar mesmo assim?',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Enviar Sem Fotos', callback_data: 'confirm_submit' },
                { text: '📷 Adicionar Fotos', callback_data: 'add_photos' }
              ],
              [
                { text: '❌ Cancelar', callback_data: 'cancel_report' }
              ]
            ]
          }
        }
      );
      return true;
    }

    const message = `📋 *Confirmar Envio*

✅ *Seu report está pronto:*
• Fotos: ${photoCount}/4
• Dados: Completos
• Info extra: ${session.reportData.additional_info ? 'Sim' : 'Não'}

⚠️ *Importante:* Após enviar, não será possível editar.

Deseja enviar o report?`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirmar Envio', callback_data: 'confirm_submit' },
            { text: '📷 Adicionar Fotos', callback_data: 'add_photos' }
          ],
          [
            { text: '❌ Cancelar', callback_data: 'cancel_report' }
          ]
        ]
      }
    });

    return true;
  }

  // Cancelar report
  async cancelReport(ctx: any, conversation: any): Promise<boolean> {
    await ctx.reply(
      '⚠️ *Confirmar Cancelamento*\n\n' +
      'Todos os dados serão perdidos.\n\n' +
      'Tem certeza?',
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

    return true;
  }

  // Processar foto
  async processPhoto(ctx: any): Promise<boolean> {
    const session = ctx.session;
    const conversation = session.conversationData;

    if (!conversation || conversation.type !== 'report' || conversation.step !== 'waiting_photos') {
      return false;
    }

    try {
      const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Maior resolução
      
      if (!session.reportData.photos) {
        session.reportData.photos = [];
      }

      if (session.reportData.photos.length >= 4) {
        await ctx.reply(
          '⚠️ *Limite de fotos atingido*\n\n' +
          'Você já enviou 4 fotos (máximo permitido).\n\n' +
          'Use /finalizar para enviar o report.',
          { parse_mode: 'Markdown' }
        );
        return true;
      }

      // Adicionar foto
      session.reportData.photos.push({
        file_id: photo.file_id,
        file_unique_id: photo.file_unique_id,
        file_size: photo.file_size,
        width: photo.width,
        height: photo.height,
        uploaded_at: new Date()
      });

      const photoCount = session.reportData.photos.length;
      
      const message = `📷 *Foto ${photoCount}/4 recebida!*

${photoCount < 4 ? 
  `✅ Pode enviar mais ${4 - photoCount} foto(s)` : 
  '✅ Limite máximo atingido'}

*Status do report:*
• Dados: ✅ Completos
• Fotos: ${photoCount}/4
• Pronto para envio: ${photoCount > 0 ? '✅ Sim' : '❌ Não'}

*Próximos passos:*
${photoCount < 4 ? '• Enviar mais fotos (opcional)\n' : ''}• /finalizar - Enviar report
• /cancelar - Cancelar report`;

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Finalizar Report', callback_data: 'confirm_submit' }
            ],
            [
              { text: '❌ Cancelar Report', callback_data: 'cancel_report' }
            ]
          ]
        }
      });

      return true;

    } catch (error) {
      console.error('❌ Erro ao processar foto:', error);
      await ctx.reply('❌ Erro ao processar foto. Tente enviar novamente.');
      return true;
    }
  }

  // Finalizar conversação
  endConversation(ctx: any): void {
    const session = ctx.session;
    const userId = ctx.from.id;
    
    session.currentFlow = null;
    session.conversationData = null;
    this.activeConversations.delete(userId);
    
    console.log(`🔄 Conversação finalizada para ${userId}`);
  }

  // Limpar conversações inativas
  cleanupInactiveConversations(): void {
    const now = new Date();
    const timeoutMs = 30 * 60 * 1000; // 30 minutos

    for (const [userId, conversation] of this.activeConversations.entries()) {
      const timeSinceLastActivity = now.getTime() - conversation.lastActivity.getTime();
      
      if (timeSinceLastActivity > timeoutMs) {
        this.activeConversations.delete(userId);
        console.log(`🧹 Conversação inativa removida para usuário ${userId}`);
      }
    }
  }

  // Verificar se usuário tem conversação ativa
  hasActiveConversation(userId: number): boolean {
    return this.activeConversations.has(userId);
  }

  // Obter conversação ativa
  getActiveConversation(userId: number): any {
    return this.activeConversations.get(userId);
  }
}

// Instância global
export const conversationManager = new ConversationManager();

// Handlers principais
export const handleConversation = async (ctx: any, text: string): Promise<boolean> => {
  return await conversationManager.processTextMessage(ctx, text);
};

export const handleConversationPhoto = async (ctx: any): Promise<boolean> => {
  return await conversationManager.processPhoto(ctx);
};

// Limpeza automática a cada 15 minutos
setInterval(() => {
  conversationManager.cleanupInactiveConversations();
}, 15 * 60 * 1000);