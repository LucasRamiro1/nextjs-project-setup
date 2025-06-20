// src/bot/services/ranking.ts
import { getRankingData } from './api.js';

export class RankingService {
  constructor() {
    this.rankingTypes = {
      daily: 'Diário',
      weekly: 'Semanal', 
      monthly: 'Mensal'
    };

    this.medals = ['🥇', '🥈', '🥉', '🏅', '🏅'];
  }

  async getDailyRanking() {
    try {
      return await getRankingData('daily');
    } catch (error) {
      console.error('Erro ao buscar ranking diário:', error);
      return [];
    }
  }

  async getWeeklyRanking() {
    try {
      return await getRankingData('weekly');
    } catch (error) {
      console.error('Erro ao buscar ranking semanal:', error);
      return [];
    }
  }

  async getMonthlyRanking() {
    try {
      return await getRankingData('monthly');
    } catch (error) {
      console.error('Erro ao buscar ranking mensal:', error);
      return [];
    }
  }

  formatRankingMessage(rankingData: any, type: string): string {
    if (!rankingData || rankingData.length === 0) {
      return `🏆 *Ranking ${this.rankingTypes[type]}*\n\n❌ Nenhum dado disponível ainda.\n\n💡 Envie reports para aparecer no ranking!`;
    }

    let message = `🏆 *Ranking ${this.rankingTypes[type]}*\n\n`;
    
    // Período do ranking
    if (rankingData.period) {
      message += `📅 *Período:* ${rankingData.period}\n\n`;
    }

    // Top players
    message += `🎯 *Top Jogadores:*\n`;
    
    rankingData.players.slice(0, 10).forEach((player: any, index: number) => {
      const medal = this.medals[index] || '🏅';
      const position = index + 1;
      const name = player.first_name + (player.last_name ? ` ${player.last_name}` : '');
      const username = player.username ? `(@${player.username})` : '';
      
      message += `${medal} *${position}º* ${name} ${username}\n`;
      message += `   💎 ${player.points} BP | 📊 ${player.reports_count} reports\n\n`;
    });

    // Estatísticas gerais
    if (rankingData.stats) {
      message += `📈 *Estatísticas Gerais:*\n`;
      message += `• Total de jogadores: ${rankingData.stats.total_players}\n`;
      message += `• Total de pontos: ${rankingData.stats.total_points} BP\n`;
      message += `• Total de reports: ${rankingData.stats.total_reports}\n\n`;
    }

    message += `🔄 *Atualizado a cada hora*`;

    return message;
  }

  getUserRankingPosition(rankingData: any, telegramId: number) {
    if (!rankingData || !rankingData.players) {
      return null;
    }

    const userIndex = rankingData.players.findIndex((player: any) => player.telegram_id === telegramId);
    
    if (userIndex === -1) {
      return null;
    }

    const user = rankingData.players[userIndex];
    return {
      position: userIndex + 1,
      points: user.points,
      reports_count: user.reports_count
    };
  }

  formatUserPosition(position: any, type: string): string {
    if (!position) {
      return `❌ Você ainda não aparece no ranking ${this.rankingTypes[type].toLowerCase()}.\n\n💡 Envie reports para ganhar pontos e aparecer no ranking!`;
    }

    const medal = position.position <= 3 ? this.medals[position.position - 1] : '🏅';
    
    return `${medal} *Sua posição no ranking ${this.rankingTypes[type].toLowerCase()}:*

🏆 Posição: *${position.position}º*
💎 Pontos: *${position.points} BP*
📊 Reports: *${position.reports_count}*

${position.position <= 10 ? '🎉 Você está no Top 10!' : '💪 Continue enviando reports para subir no ranking!'}`;
  }

  private rankingTypes: { [key: string]: string };
  private medals: string[];
}

export const rankingService = new RankingService();