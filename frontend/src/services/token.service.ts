import api from './api';
import { Token } from '../types';

export const tokenService = {
  async addToken(queueId: string, personName: string, phoneNumber?: string): Promise<Token> {
    const res = await api.post<{ success: boolean; data: Token }>(`/queues/${queueId}/tokens`, {
      personName,
      phoneNumber,
    });
    return res.data.data;
  },

  async getTokens(queueId: string, status?: string): Promise<Token[]> {
    const res = await api.get<{ success: boolean; data: Token[] }>(`/queues/${queueId}/tokens`, {
      params: { status },
    });
    return res.data.data;
  },

  async moveUp(tokenId: string): Promise<Token> {
    const res = await api.patch<{ success: boolean; data: Token }>(`/tokens/${tokenId}/move-up`);
    return res.data.data;
  },

  async moveDown(tokenId: string): Promise<Token> {
    const res = await api.patch<{ success: boolean; data: Token }>(`/tokens/${tokenId}/move-down`);
    return res.data.data;
  },

  async callNext(queueId: string): Promise<Token> {
    const res = await api.patch<{ success: boolean; data: Token }>(`/queues/${queueId}/call-next`);
    return res.data.data;
  },

  async completeService(tokenId: string): Promise<Token> {
    const res = await api.patch<{ success: boolean; data: Token }>(`/tokens/${tokenId}/complete`);
    return res.data.data;
  },

  async cancelToken(tokenId: string): Promise<Token> {
    const res = await api.patch<{ success: boolean; data: Token }>(`/tokens/${tokenId}/cancel`);
    return res.data.data;
  },
};

