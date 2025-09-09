import type { Unit, UnitMember } from '$lib/types/unit';

export interface PageData {
	member: UnitMember;
	organization: Unit;
	organizationMembers: UnitMember[];
	slug: string;
	type: string;
}
