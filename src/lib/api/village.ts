import { apiRequest } from './client';
import type { VillagesResponse, VillageHistoryResponse } from '@/types/village';

// Village API functions
export const villageApi = {
	async getVillages(): Promise<VillagesResponse> {
		return apiRequest<VillagesResponse>('/v1/villages');
	},

	async getVillageHistory(): Promise<VillageHistoryResponse> {
		return apiRequest<VillageHistoryResponse>('/v1/villages/history');
	}
};
