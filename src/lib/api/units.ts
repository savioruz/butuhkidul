import { apiRequest } from './client';
import type { UnitsResponse, UnitMembersResponse } from '../types/unit';

export const unitsApi = {
	/**
	 * Get all units
	 */
	async getUnits(params?: { name?: string; description?: string }): Promise<UnitsResponse> {
		const searchParams = new URLSearchParams();

		if (params?.name) searchParams.append('name', params.name);
		if (params?.description) searchParams.append('description', params.description);

		const query = searchParams.toString();
		const endpoint = `/v1/units${query ? `?${query}` : ''}`;

		return apiRequest<UnitsResponse>(endpoint);
	},

	/**
	 * Get all unit members
	 */
	async getUnitMembers(params?: {
		unit?: string;
		name?: string;
		position?: string;
		limit?: number;
	}): Promise<UnitMembersResponse> {
		const searchParams = new URLSearchParams();

		if (params?.unit) searchParams.append('unit', params.unit);
		if (params?.name) searchParams.append('name', params.name);
		if (params?.position) searchParams.append('position', params.position);
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const query = searchParams.toString();
		const endpoint = `/v1/units-members${query ? `?${query}` : ''}`;

		return apiRequest<UnitMembersResponse>(endpoint);
	},

	/**
	 * Get unit members by unit ID
	 */
	async getUnitMembersByUnitId(
		unitId: string,
		params?: {
			unit?: string;
			name?: string;
			position?: string;
			limit?: number;
		}
	): Promise<UnitMembersResponse> {
		const searchParams = new URLSearchParams();

		if (params?.unit) searchParams.append('unit', params.unit);
		if (params?.name) searchParams.append('name', params.name);
		if (params?.position) searchParams.append('position', params.position);
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const query = searchParams.toString();
		const endpoint = `/v1/units/${unitId}/members${query ? `?${query}` : ''}`;

		return apiRequest<UnitMembersResponse>(endpoint);
	}
};
