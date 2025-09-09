import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { unitsApi } from '$lib/api/units';
import type { UnitMember, Unit } from '$lib/types/unit';

// Helper function to create slug from name
function createSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

function findMemberBySlug(members: UnitMember[], slug: string): UnitMember | undefined {
	return members.find((member) => createSlug(member.name) === slug);
}

function findOrganizationBySlug(organizations: Unit[], slug: string): Unit | undefined {
	return organizations.find((org) => createSlug(org.name) === slug);
}

export const load: ServerLoad = async ({ params }) => {
	const { slug } = params;

	if (!slug) {
		throw error(400, 'Invalid member slug');
	}

	try {
		const unitsResponse = await unitsApi.getUnits();
		if (!unitsResponse || !unitsResponse.data) {
			throw error(500, 'Failed to load organizations');
		}

		let organizations: Unit[] = [];
		if (Array.isArray(unitsResponse.data.units)) {
			organizations = unitsResponse.data.units;
		} else if (Array.isArray(unitsResponse.data)) {
			organizations = unitsResponse.data;
		} else {
			throw error(500, 'Invalid organizations data format');
		}

		const membersResponse = await unitsApi.getUnitMembers({ limit: 50 });
		if (!membersResponse || !membersResponse.data) {
			throw error(500, 'Failed to load organization members');
		}

		let allMembers: UnitMember[] = [];
		if (Array.isArray(membersResponse.data.unit_members)) {
			allMembers = membersResponse.data.unit_members;
		} else if (Array.isArray(membersResponse.data)) {
			allMembers = membersResponse.data;
		} else {
			throw error(500, 'Invalid members data format');
		}

		const member = findMemberBySlug(allMembers, slug);
		if (member) {
			const organization = organizations.find((org) => org.id === member.unit_id);
			if (!organization) {
				throw error(404, 'Organization not found for this member');
			}

			const organizationMembers = allMembers.filter(
				(m) => m.unit_id === organization.id && m.id !== member.id
			);

			return {
				member,
				organization,
				organizationMembers,
				slug: createSlug(member.name),
				type: 'member' as const
			};
		}

		// If no member found, try to find an organization with this slug
		const organization = findOrganizationBySlug(organizations, slug);
		if (organization) {
			// Found an organization, get its members
			const organizationMembers = allMembers.filter((m) => m.unit_id === organization.id);

			if (organizationMembers.length === 0) {
				throw error(404, 'No members found in this organization');
			}

			// Use the first member as the primary member for display
			const member = organizationMembers[0];
			const otherMembers = organizationMembers.slice(1);

			return {
				member,
				organization,
				organizationMembers: otherMembers,
				slug: createSlug(organization.name),
				type: 'organization' as const
			};
		}

		// Neither member nor organization found
		throw error(404, `Member or organization not found: ${slug}`);
	} catch (err) {
		console.error('Error loading member data:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
