// src/bot/services/api.ts
import axios from 'axios';
import { config } from '../config.js';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'RewardTrackerBot/1.0'
  }
});

// Interceptors para logs
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Registrar usuário
export const registerUser = async (userData: any) => {
  try {
    const response = await api.post('/user/register', userData);
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

// Enviar report de aposta
export const submitBetReport = async (reportData: any) => {
  try {
    const response = await api.post('/report-bet', reportData);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar report:', error);
    throw error;
  }
};

// Buscar histórico do usuário
export const getUserHistory = async (telegramId: number) => {
  try {
    const response = await api.get(`/user/${telegramId}/history`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    throw error;
  }
};

// Buscar pontos do usuário
export const getUserPoints = async (telegramId: number) => {
  try {
    const response = await api.get(`/user/${telegramId}/points`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pontos:', error);
    throw error;
  }
};

// Comprar análise individual
export const purchaseAnalysis = async (analysisData: any) => {
  try {
    const response = await api.post('/analyze', analysisData);
    return response.data;
  } catch (error) {
    console.error('Erro ao comprar análise:', error);
    throw error;
  }
};

// Comprar análise para grupo
export const purchaseGroupAnalysis = async (analysisData: any) => {
  try {
    const response = await api.post('/analyze_all', analysisData);
    return response.data;
  } catch (error) {
    console.error('Erro ao comprar análise para grupo:', error);
    throw error;
  }
};

// Buscar dados de ranking
export const getRankingData = async (type: string) => {
  try {
    const response = await api.get(`/ranking/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar ranking ${type}:`, error);
    throw error;
  }
};

// Buscar posição do usuário no ranking
export const getUserRankingPosition = async (telegramId: number, type: string) => {
  try {
    const response = await api.get(`/user/${telegramId}/ranking/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar posição do usuário no ranking ${type}:`, error);
    throw error;
  }
};

// Atualizar status do grupo do usuário
export const updateUserGroupStatus = async (telegramId: number, inGroup: boolean) => {
  try {
    const response = await api.post('/user/group-status', {
      telegram_id: telegramId,
      in_group: inGroup
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar status do grupo:', error);
    throw error;
  }
};

// Promover usuário a admin
export const promoteUser = async (userData: any) => {
  try {
    const response = await api.post('/user/promote', userData);
    return response.data;
  } catch (error) {
    console.error('Erro ao promover usuário:', error);
    throw error;
  }
};

// Buscar configurações do sistema
export const getSystemSettings = async () => {
  try {
    const response = await api.get('/system-settings');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    throw error;
  }
};

// Buscar broadcasts pendentes
export const getPendingBroadcasts = async () => {
  try {
    const response = await api.get('/broadcasts/pending');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar broadcasts:', error);
    throw error;
  }
};

// Gerar análise baseada em tempo
export const generateTimeBasedAnalysis = async (platform: string, provider: string, game: string) => {
  try {
    const response = await api.post('/analysis/time-based', {
      platform,
      provider,
      game
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar análise baseada em tempo:', error);
    throw error;
  }
};