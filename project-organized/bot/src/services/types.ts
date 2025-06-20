import type {
  User,
  Bet,
  Reward,
  GroupAnalysis,
  BroadcastMessage,
  AnalysisPeriod
} from '../../../shared/schema';

// API Response Types
export interface UserPointsResponse {
  points: number;
  reports_points: number;
  spent_points: number;
  bonus_points: number;
}

export interface UserHistoryResponse {
  reports: Bet[];
  analyses: GroupAnalysis[];
}

export interface RankingResponse {
  users: Array<{
    telegramId: number;
    username?: string;
    firstName: string;
    points: number;
  }>;
}

export interface SystemSettingsResponse {
  settings: Record<string, string>;
}

// API Request Types
export interface RegisterUserRequest {
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  affiliateCode: string;
  referredBy?: number;
}

export interface BetReportRequest {
  telegramId: number;
  platform: string;
  game: string;
  betAmount: number;
  winAmount?: number;
  lossAmount?: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  proofImage?: string;
  betType: 'win' | 'loss';
}

export interface AnalysisRequest {
  telegramId: number;
  platform: string;
  provider: string;
  game: string;
  timePeriod: number;
}

export interface GroupAnalysisRequest extends AnalysisRequest {
  isPublic: boolean;
  accessCost: number;
}
