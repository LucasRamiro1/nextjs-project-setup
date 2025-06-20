// src/bot/services/groupVerification.ts
import { config } from '../config.js';

export class GroupVerificationService {
  constructor() {
    this.requiredGroupId = config.REQUIRED_GROUP_ID;
    this.galeraGroupId = config.GALERA_GROUP_ID;
  }

  async checkUserInGroup(bot: any, telegramId: number): Promise<boolean> {
    try {
      if (!this.requiredGroupId) {
        console.warn('⚠️ REQUIRED_GROUP_ID não configurado - verificação desabilitada');
        return true;
      }

      const chatMember = await bot.getChatMember(this.requiredGroupId, telegramId);
      
      // Verificar se o usuário está no grupo e não foi removido
      return ['member', 'administrator', 'creator'].includes(chatMember.status);
      
    } catch (error: any) {
      console.error('Erro ao verificar membro do grupo:', error);
      
      // Se o erro for "user not found" ou "chat not found", usuário não está no grupo
      if (error.description?.includes('user not found') || 
          error.description?.includes('chat not found') ||
          error.response?.error_code === 400) {
        return false;
      }
      
      // Para outros erros, assumir que está no grupo (evitar bloqueios por problemas técnicos)
      return true;
    }
  }

  async sendGroupAnalysis(bot: any, analysisMessage: string): Promise<void> {
    try {
      if (!this.galeraGroupId) {
        throw new Error('GALERA_GROUP_ID não configurado');
      }

      await bot.sendMessage(this.galeraGroupId, analysisMessage, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      console.error('Erro ao enviar análise para o grupo:', error);
      throw error;
    }
  }

  getGroupRequirementMessage(): string {
    return `🚫 *Acesso Restrito*

Para usar este bot, você precisa estar no nosso grupo oficial.

👥 *Como proceder:*
• Entre no grupo através do link oficial
• Após entrar, use /start novamente
• O sistema verificará automaticamente

❓ *Problemas para entrar?*
• Verifique se não foi removido do grupo
• Entre em contato com um administrador

🔄 *Já está no grupo?*
• Aguarde alguns minutos e tente novamente
• O sistema verifica a cada tentativa`;
  }

  getGaleraGroupInfo(): { groupId: string | undefined; isConfigured: boolean } {
    return {
      groupId: this.galeraGroupId,
      isConfigured: !!this.galeraGroupId
    };
  }

  private requiredGroupId: string | undefined;
  private galeraGroupId: string | undefined;
}

export const groupVerificationService = new GroupVerificationService();