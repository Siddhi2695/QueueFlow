import api from './api';
import { AnalyticsOverview, AnalyticsTrends, QueuePerformanceItem } from '../types';

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    const res = await api.get<{ success: boolean; data: AnalyticsOverview }>('/analytics/overview');
    return res.data.data;
  },

  async getTrends(period: 'day' | 'week' | 'month' = 'week'): Promise<AnalyticsTrends> {
    const res = await api.get<{ success: boolean; data: AnalyticsTrends }>('/analytics/trends', {
      params: { period },
    });
    return res.data.data;
  },

  async getPerformance(): Promise<QueuePerformanceItem[]> {
    const res = await api.get<{ success: boolean; data: QueuePerformanceItem[] }>('/analytics/performance');
    return res.data.data;
  },
};

