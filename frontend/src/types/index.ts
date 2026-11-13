export interface Manager {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export type QueueStatus = 'active' | 'closed';

export interface QueueStats {
  waitingCount: number;
  servingCount: number;
  completedCount: number;
  cancelledCount: number;
  totalCount: number;
}

export interface ServingInfo {
  id: string;
  tokenNumber: string;
  personName: string;
  calledAt: string;
}

export interface Queue {
  _id: string;
  name: string;
  managerId: string;
  status: QueueStatus;
  nextTokenNumber: number;
  createdAt: string;
  updatedAt: string;
  stats?: QueueStats;
  currentServing?: ServingInfo | null;
}

export type TokenStatus = 'Waiting' | 'Serving' | 'Completed' | 'Cancelled';

export interface Token {
  _id: string;
  tokenNumber: string;
  personName: string;
  phoneNumber?: string;
  queueId: string;
  managerId: string;
  position: number | null;
  status: TokenStatus;
  createdAt: string;
  calledAt?: string | null;
  completedAt?: string | null;
  waitingTime?: number | null; // seconds
  serviceDuration?: number | null; // seconds
  queueName?: string;
}

export interface QueueDetailResponse {
  queue: Queue;
  stats: {
    waitingCount: number;
    servingCount: number;
    completedCount: number;
    cancelledCount: number;
    totalTokens: number;
  };
  currentServing: Token | null;
  waitingTokens: Token[];
}

export interface PublicQueueDisplay {
  queue: {
    id: string;
    name: string;
    status: QueueStatus;
  };
  currentServing: {
    tokenNumber: string;
    personName: string;
    calledAt: string;
    status: TokenStatus;
  } | null;
  waitingTokens: {
    tokenNumber: string;
    personName: string;
    position: number;
    status: TokenStatus;
    createdAt: string;
  }[];
  totalWaiting: number;
}

export interface HistoryResponse {
  tokens: Token[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AnalyticsOverview {
  totalQueues: number;
  activeQueues: number;
  totalTokens: number;
  waitingCount: number;
  servingCount: number;
  completedCount: number;
  cancelledCount: number;
  cancellationRate: number;
  avgWaitingTime: number; // in seconds
  avgServiceDuration: number; // in seconds
}

export interface TokenTrendItem {
  _id: string;
  generated: number;
  completed: number;
  cancelled: number;
}

export interface QueueLengthItem {
  timestamp: string;
  timeFormatted: string;
  waitingCount: number;
  eventType: string;
}

export interface HourlyDistributionItem {
  hour: string;
  count: number;
}

export interface AnalyticsTrends {
  tokenTrends: TokenTrendItem[];
  lengthTrends: QueueLengthItem[];
  hourlyDistribution: HourlyDistributionItem[];
}

export interface QueuePerformanceItem {
  queueId: string;
  queueName: string;
  status: QueueStatus;
  totalTokens: number;
  waiting: number;
  serving: number;
  completed: number;
  cancelled: number;
  avgWaitTime: number; // seconds
  avgServiceDuration: number; // seconds
  cancellationRate: number;
}

