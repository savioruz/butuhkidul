import type { ApiResponse } from './api';

export interface Village {
	id: string;
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	created_at: string;
	created_by: string;
	modified_at?: string;
	modified_by?: string;
}

export type VillagesResponse = ApiResponse<{ villages: Village[] }>;

export interface VillageHistory {
	id: string;
	description: string;
	image_url?: string;
	village_id: string;
	created_at: string;
	created_by: string;
	modified_at: string;
	modified_by: string;
}

export type VillageHistoryResponse = ApiResponse<{ village_histories: VillageHistory[] }>;
