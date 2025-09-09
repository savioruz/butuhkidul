import type { ApiResponse } from './api';

export interface Unit {
	id: string;
	name: string;
	description?: string;
	created_at: string;
	created_by: string;
	modified_at?: string;
	modified_by?: string;
}

export type UnitsResponse = ApiResponse<{ units: Unit[] }>;

export interface UnitMember {
	id: string;
	name: string;
	position: string;
	unit_id: string;
	unit_name: string;
	photo_url?: string;
	created_at: string;
	created_by: string;
	modified_at?: string;
	modified_by?: string;
}

export type UnitMembersResponse = ApiResponse<{ unit_members: UnitMember[] }>;
