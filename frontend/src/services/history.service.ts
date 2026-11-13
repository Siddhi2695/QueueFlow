import api from './api';
import { HistoryResponse } from '../types';

export interface HistoryFilterParams {
  search?: string;
  status?: string;
  queueId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const historyService = {
  async getHistory(params?: HistoryFilterParams): Promise<HistoryResponse> {
    const res = await api.get<{ success: boolean; data: HistoryResponse }>('/history', {
      params,
    });
    return res.data.data;
  },
};

