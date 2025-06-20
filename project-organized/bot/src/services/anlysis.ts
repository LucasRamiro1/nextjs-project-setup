// src/bot/services/analysis.ts
import { generateTimeBasedAnalysis } from './api.js';

export class AnalysisService {
  constructor() {
    this.gameMapping = {
      // PGSoft games
      'fortune_tiger': 'Fortune Tiger 🐅',
      'mahjong_ways': 'Mahjong Ways 🀄',
      'fortune_dragon': 'Fortune Dragon 🐉',
      'wild_bandito': 'Wild Bandito 🦅',
      'gems_bonanza': 'Gems Bonanza 💎',
      'pirates_gold': 'Pirates Gold 🏴‍☠️',
      'mask_carnival': 'Mask Carnival 🎭',
      'panda_fortune': 'Panda Fortune 🐼',
      'phoenix_rises': 'Phoenix Rises 🔥',
      'thunder_kick': 'Thunder Kick ⚡',
      'starlight_princess': 'Starlight Princess 🌟',
      'kitsune_masks': 'Kitsune Masks 🦊',
      'circus_launch': 'Circus Launch 🎪',
      'koala_fortune': 'Koala Fortune 🐨',
      'lucky_neko': 'Lucky Neko 🌙',
      'hip_hop_panda': 'Hip Hop Panda 🎨',
      'cash_patrol': 'Cash Patrol 💰',
      'rock_vegas': 'Rock Vegas 🎸',
      'irish_charms': 'Irish Charms 🍀',
      'tropical_tiki': 'Tropical Tiki 🌺',
      'mystic_potion': 'Mystic Potion 🔮',
      'archer_robin': 'Archer Robin 🎯',
      
      // Pragmatic Play games
      'gates_olympus': 'Gates of Olympus ⚡',
      'sweet_bonanza': 'Sweet Bonanza 🍭',
      'wolf_gold': 'Wolf Gold 🐺',
      'dog_house': 'The Dog House 💎',
      'starlight_pp': 'Starlight Princess 🌟',
      'fire_strike': 'Fire Strike 🔥',
      'fruit_party': 'Fruit Party 🍒',
      'wild_west_gold': 'Wild West Gold 🎭',
      'money_train': 'Money Train 💰',
      'john_hunter': 'John Hunter 🐻',
      'moonlight_princess': 'Moonlight Princess 🌙',
      'circus_delight': 'Circus Delight 🎪',
      'pirate_gold_pp': 'Pirate Gold 🏴‍☠️',
      'rise_giza': 'Rise of Giza 🔱',
      'street_racer': 'Street Racer 🎨',
      'buffalo_king': 'Buffalo King 🎯',
      'diamond_strike': 'Diamond Strike 💎',
      'hawaiian_tiki': 'Hawaiian Tiki 🌺',
      'magic_journey': 'Magic Journey 🔮',
      'rock_vegas_pp': 'Rock Vegas PP 🎸'
    };

    this.platformMapping = {
      'pop678': 'Pop678',
      'popbra': 'Popbra',
      'popkkk': 'Popkkk',
      '26bet': '26bet',
      'poppg': 'Poppg',
      'pop888': 'Pop888',
      'popwb': 'Popwb',
      'pop555': 'Pop555',
      'popbem': 'Popbem',
      'popmel': 'Popmel',
      'popceu': 'Popceu',
      'poplua': 'Poplua'
    };
  }

  getGameDisplayName(gameKey: string): string {
    return this.gameMapping[gameKey] || gameKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getPlatformDisplayName(platformKey: string): string {
    return this.platformMapping[platformKey] || platformKey;
  }

  async generateAnalysis(platform: string, provider: string, game: string) {
    try {
      const analysisData = await generateTimeBasedAnalysis(platform, provider, game);
      return this.formatAnalysisData(analysisData);
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      return this.getNoDataMessage();
    }
  }

  formatAnalysisData(analysisData: any): string {
    if (!analysisData || !analysisData.hasData) {
      return this.getNoDataMessage();
    }

    const {
      gameName,
      platform,
      provider,
      stats,
      bestHours,
      worstHours,
      recommendations
    } = analysisData;

    let message = `🎯 *${gameName}*\n`;
    message += `🎰 *${platform}* • ${provider}\n\n`;

    message += `📊 *Estatísticas Gerais:*\n`;
    message += `• Taxa de vitória: ${stats.winRate}%\n`;
    message += `• Total de apostas: ${stats.totalBets}\n`;
    message += `• Vitórias: ${stats.totalWins} | Derrotas: ${stats.totalLosses}\n`;
    message += `• Valor médio: R$ ${stats.avgBetValue.toFixed(2)}\n\n`;

    if (bestHours && bestHours.length > 0) {
      message += `🟢 *Melhores Horários:*\n`;
      bestHours.forEach((hour: any) => {
        message += `• ${hour.time} - ${hour.winRate}% (${hour.totalBets} apostas)\n`;
      });
      message += '\n';
    }

    if (worstHours && worstHours.length > 0) {
      message += `🔴 *Evitar Estes Horários:*\n`;
      worstHours.forEach((hour: any) => {
        message += `• ${hour.time} - ${hour.winRate}% (${hour.totalBets} apostas)\n`;
      });
      message += '\n';
    }

    if (recommendations && recommendations.length > 0) {
      message += `💡 *Recomendações:*\n`;
      recommendations.forEach((rec: string) => {
        message += `• ${rec}\n`;
      });
      message += '\n';
    }

    message += `⚠️ *Esta análise é baseada em dados históricos reais e não garante resultados futuros.*`;

    return message;
  }

  formatGroupAnalysisMessage(analysisData: any, user: any): string {
    const userName = user.first_name + (user.last_name ? ` ${user.last_name}` : '');
    const userMention = user.username ? `@${user.username}` : userName;

    if (!analysisData || !analysisData.hasData) {
      return `🚨 *ANÁLISE PARA A GALERA* 🚨

👤 *Solicitada por:* ${userMention}

❌ *Dados insuficientes para esta análise.*

💡 Tente outro jogo com mais histórico de dados.
💰 *Obrigado pelos 500 BP investidos na galera!*`;
    }

    const { gameName, platform, provider, stats, bestHours, worstHours, recommendations } = analysisData;

    let message = `🚨 *ANÁLISE PARA A GALERA* 🚨\n\n`;
    message += `👤 *Solicitada por:* ${userMention}\n`;
    message += `🎯 *Jogo:* ${gameName}\n`;
    message += `🎰 *Plataforma:* ${platform} • ${provider}\n\n`;

    message += `📊 *ESTATÍSTICAS GERAIS:*\n`;
    message += `• Taxa de vitória: ${stats.winRate}%\n`;
    message += `• Total de apostas: ${stats.totalBets}\n`;
    message += `• Valor médio: R$ ${stats.avgBetValue.toFixed(2)}\n\n`;

    if (bestHours && bestHours.length > 0) {
      message += `🟢 *MELHORES HORÁRIOS:*\n`;
      bestHours.forEach((hour: any) => {
        message += `• ${hour.time} - ${hour.winRate}% de vitórias\n`;
      });
      message += '\n';
    }

    if (worstHours && worstHours.length > 0) {
      message += `🔴 *EVITEM ESTES HORÁRIOS:*\n`;
      worstHours.forEach((hour: any) => {
        message += `• ${hour.time} - ${hour.winRate}% de vitórias\n`;
      });
      message += '\n';
    }

    if (recommendations && recommendations.length > 0) {
      message += `💡 *RECOMENDAÇÕES PARA A GALERA:*\n`;
      recommendations.forEach((rec: string) => {
        message += `• ${rec}\n`;
      });
      message += '\n';
    }

    message += `⚠️ *Esta análise é baseada em dados históricos reais.*\n`;
    message += `💰 *Obrigado ${userMention} pelos 500 BP investidos na galera!*\n`;
    message += `🏆 *Boa sorte a todos!*`;

    return message;
  }

  getNoDataMessage(): string {
    return `📊 *Análise Não Disponível*

❌ Dados insuficientes para gerar análise confiável deste jogo.

💡 *Sugestões:*
• Tente um jogo com mais histórico
• Aguarde mais dados serem coletados
• Considere jogos mais populares

🔄 Tente novamente em alguns dias quando houver mais dados disponíveis.`;
  }

  validateAnalysisRequest(requestData: any): { isValid: boolean; message?: string } {
    const { platform, provider, game } = requestData;

    if (!platform || !this.platformMapping[platform]) {
      return { isValid: false, message: 'Plataforma inválida.' };
    }

    if (!provider || !['pgsoft', 'pp'].includes(provider)) {
      return { isValid: false, message: 'Provedor inválido.' };
    }

    if (!game || !this.gameMapping[game]) {
      return { isValid: false, message: 'Jogo inválido.' };
    }

    return { isValid: true };
  }

  private gameMapping: { [key: string]: string };
  private platformMapping: { [key: string]: string };
}

export const analysisService = new AnalysisService();