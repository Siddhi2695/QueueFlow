import api from './api';
import { Queue, QueueDetailResponse, PublicQueueDisplay } from '../types';

export const queueService = {
  async getQueues(): Promise<Queue[]> {
    const res = await api.get<{ success: boolean; data: Queue[] }>('/queues');
    return res.data.data;
  },

  async createQueue(name: string): Promise<Queue> {
    const res = await api.post<{ success: boolean; data: Queue }>('/queues', { name });
    return res.data.data;
  },

  async getQueueById(id: string): Promise<QueueDetailResponse> {
    const res = await api.get<{ success: boolean; data: QueueDetailResponse }>(`/queues/${id}`);
    return res.data.data;
  },

  async updateQueue(id: string, data: { name?: string; status?: 'active' | 'closed' }): Promise<Queue> {
    const res = await api.put<{ success: boolean; data: Queue }>(`/queues/${id}`, data);
    return res.data.data;
  },

  async deleteQueue(id: string): Promise<void> {
    await api.delete(`/queues/${id}`);
  },

  async getPublicDisplay(id: string): Promise<PublicQueueDisplay> {
    const res = await api.get<{ success: boolean; data: PublicQueueDisplay }>(`/queues/${id}/public`);
    return res.data.data;
  },
};

