<script lang="ts">
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import {
		ArrowLeft,
		User,
		Building2,
		Users,
		Crown,
		Shield,
		Briefcase,
		UserCheck
	} from 'lucide-svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';

	type Props = { data: PageData };
	let { data }: Props = $props();

	const { member, organization, organizationMembers, type } = data;

	function formatPosition(position: string): string {
		return position
			.split(/[\s_-]+/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
	}

	function getPositionBadgeColor(position: string): string {
		const pos = position.toLowerCase().trim();
		if (pos.includes('ketua') || pos.includes('chair') || pos.includes('president')) {
			return 'bg-primary text-primary-foreground';
		}
		if (pos.includes('sekretaris') || pos.includes('secretary')) {
			return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
		}
		if (pos.includes('bendahara') || pos.includes('treasurer')) {
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
		}
		if (pos.includes('humas')) {
			return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100';
		}
		if (pos.includes('pemasaran') || pos.includes('marketing')) {
			return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
		}
		if (pos.includes('pj')) {
			return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100';
		}
		if (pos.includes('divisi')) {
			return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
		}
		if (
			pos.includes('produksi') ||
			pos.includes('production') ||
			pos.includes('operasi') ||
			pos.includes('operation')
		) {
			return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100';
		}
		if (pos.includes('anggota') || pos.includes('member')) {
			return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
		}
		return 'bg-muted text-muted-foreground';
	}

	// Helper function to create slug for linking
	function createSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	}

	// Helper function to get position hierarchy level
	function getPositionLevel(position: string): number {
		// Handle ALL possible whitespace including leading/trailing spaces, newlines, tabs
		// Also normalize multiple spaces to single spaces and trim everything
		const pos = position
			.replace(/[\r\n\t\u00A0\u2000-\u200B\u2028\u2029]/g, ' ') // Replace all whitespace chars with space
			.replace(/\s+/g, ' ') // Normalize multiple spaces to single space
			.trim() // Remove leading and trailing spaces
			.toLowerCase();

		// Debug log to see what positions we're getting - now showing raw position clearly
		console.log('RAW Position:', JSON.stringify(position), 'Normalized:', JSON.stringify(pos));

		// More specific matching for leadership positions
		if (
			pos === 'ketua' ||
			pos.includes('ketua') ||
			pos.includes('chair') ||
			pos.includes('president')
		) {
			console.log('  -> Level 1 (Leadership)');
			return 1;
		}

		// More specific matching for key roles
		if (
			pos === 'sekretaris' ||
			pos.includes('sekretaris') ||
			pos === 'secretary' ||
			pos.includes('secretary') ||
			pos === 'bendahara' ||
			pos.includes('bendahara') ||
			pos === 'treasurer' ||
			pos.includes('treasurer')
		) {
			console.log('  -> Level 2 (Key Roles)');
			return 2;
		}

		// More specific matching for departments - handle PJ with comprehensive patterns
		if (
			pos.includes('divisi') ||
			pos.includes('humas') ||
			pos.includes('pemasaran') ||
			pos.includes('marketing') ||
			pos.includes('produksi') ||
			pos.includes('production') ||
			pos.includes('operasi') ||
			pos.includes('operation') ||
			pos.includes('pj ') || // handles "pj pemasaran", "pj produksi", etc.
			pos.startsWith('pj ') ||
			pos.endsWith(' pj') ||
			pos.includes(' pj ') || // handles middle PJ like "some pj something"
			/\bpj\b/i.test(pos) // word boundary match for PJ (case insensitive)
		) {
			console.log('  -> Level 3 (Departments)');
			return 3;
		}

		// Check for "ANGGOTA" specifically as level 4 (general members)
		if (pos === 'anggota' || pos.includes('anggota') || pos.includes('member')) {
			console.log('  -> Level 4 (General Members)');
			return 4;
		}

		console.log('  -> Level 4 (Default - General Members)');
		return 4; // Default to general members
	}

	// Helper function to get leadership sub-order (for sorting within leadership)
	function getLeadershipOrder(position: string): number {
		const pos = position.toLowerCase().trim();
		// Check for exact "ketua" without numbers - highest priority (0)
		if (pos === 'ketua' || pos === 'chair' || pos === 'president') return 0;

		// Check for numbered positions like "ketua 1", "ketua 2", etc.
		const numberedMatch = pos.match(/ketua\s*(\d+)|chair\s*(\d+)|president\s*(\d+)/);
		if (numberedMatch) {
			const number = parseInt(numberedMatch[1] || numberedMatch[2] || numberedMatch[3] || '1');
			return number; // Returns 1, 2, 3, etc.
		}

		// Other leadership positions (like "ketua bidang", "wakil ketua", etc.)
		if (pos.includes('ketua') || pos.includes('chair') || pos.includes('president')) return 999;

		return 1000; // Not a leadership position
	}

	// Helper function to get key role sub-order (for sorting secretaries and treasurers)
	function getKeyRoleOrder(position: string): number {
		const pos = position.toLowerCase().trim();

		// For secretaries
		if (pos.includes('sekretaris') || pos.includes('secretary')) {
			// Check for exact "sekretaris" without numbers
			if (pos === 'sekretaris' || pos === 'secretary') return 0;

			// Check for numbered positions like "sekretaris 1", "sekretaris 2", etc.
			const numberedMatch = pos.match(/sekretaris\s*(\d+)|secretary\s*(\d+)/);
			if (numberedMatch) {
				const number = parseInt(numberedMatch[1] || numberedMatch[2] || '1');
				return number;
			}
			return 999;
		}

		// For treasurers
		if (pos.includes('bendahara') || pos.includes('treasurer')) {
			return 1000; // Bendahara comes after all secretaries
		}

		return 2000;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function organizeByHierarchy(members: any[]) {
		// For organization view, use all organizationMembers
		// For member view, include the current member + organizationMembers
		const allMembers = type === 'organization' ? members : member ? [member, ...members] : members;

		console.log(
			'All members:',
			allMembers.map((m) => ({ name: m.name, position: m.position }))
		);

		const sorted = allMembers.sort((a, b) => {
			const levelA = getPositionLevel(a.position);
			const levelB = getPositionLevel(b.position);

			// First sort by hierarchy level
			if (levelA !== levelB) return levelA - levelB;

			// If both are leadership positions (level 1), sort by leadership order
			if (levelA === 1 && levelB === 1) {
				const orderA = getLeadershipOrder(a.position);
				const orderB = getLeadershipOrder(b.position);
				if (orderA !== orderB) return orderA - orderB;
			}

			// If both are key roles (level 2), sort by key role order
			if (levelA === 2 && levelB === 2) {
				const orderA = getKeyRoleOrder(a.position);
				const orderB = getKeyRoleOrder(b.position);
				if (orderA !== orderB) return orderA - orderB;
			}

			// Finally sort by name
			return a.name.localeCompare(b.name);
		});

		const result = {
			leaders: sorted.filter((m) => getPositionLevel(m.position) === 1),
			keyRoles: sorted.filter((m) => getPositionLevel(m.position) === 2),
			departments: sorted.filter((m) => getPositionLevel(m.position) === 3),
			others: sorted.filter((m) => getPositionLevel(m.position) === 4)
		};

		console.log('Hierarchy result:', {
			leaders: result.leaders.map((m) => ({ name: m.name, position: m.position })),
			keyRoles: result.keyRoles.map((m) => ({ name: m.name, position: m.position })),
			departments: result.departments.map((m) => ({ name: m.name, position: m.position })),
			others: result.others.map((m) => ({ name: m.name, position: m.position }))
		});

		return result;
	}

	let hierarchy = $derived(organizeByHierarchy(organizationMembers));
</script>

<svelte:head>
	{#if type === 'organization'}
		<title
			>{organization.name} - {$t('common.organizations.organization_members')} | {$t(
				'common.organizations.title'
			)}</title
		>
		<meta name="description" content="View members of {organization.name} organization" />
	{:else if member}
		<title>{member.name} - {organization.name} | {$t('common.organizations.title')}</title>
		<meta
			name="description"
			content="Profile of {member.name}, {formatPosition(member.position)} of {organization.name}"
		/>
	{/if}
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Navigation Header -->
	<div class="container mx-auto sm:px-6 md:px-4 md:py-4 lg:px-8">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="sm" onclick={() => goto('/organizations')} class="gap-2">
				<ArrowLeft class="h-4 w-4" />
				<span class="hidden sm:inline">{$t('common.organizations.back_to_organizations')}</span>
				<span class="sm:hidden">{$t('common.organizations.back')}</span>
			</Button>
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<span>{$t('common.organizations.title')}</span>
				<span>/</span>
				{#if type === 'organization'}
					<span class="font-medium text-foreground">{organization.name}</span>
				{:else if member}
					<span class="font-medium text-foreground">{member.name}</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
		<div class="mx-auto max-w-6xl space-y-8">
			<!-- Member Details & Organization Info -->
			<div class="space-y-8">
				{#if type === 'organization'}
					{#if organization.description}
						<Card
							class="overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 px-8 shadow-lg"
						>
							<div class="flex flex-col gap-6 lg:flex-row lg:items-center">
								<!-- Profile Image -->
								<div class="flex justify-center lg:justify-start">
									{#if type === 'organization'}
										<div
											class="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground shadow-2xl ring-8 ring-background sm:h-40 sm:w-40 sm:text-5xl lg:h-48 lg:w-48 lg:text-6xl"
										>
											{organization.name.charAt(0).toUpperCase()}
										</div>
									{:else if member && member.photo_url}
										<img
											src={member.photo_url}
											alt={member.name}
											class="h-24 w-24 rounded-full object-cover shadow-2xl ring-8 ring-background sm:h-40 sm:w-40 lg:h-48 lg:w-48"
										/>
									{:else if member}
										<div
											class="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground shadow-2xl ring-8 ring-background sm:h-40 sm:w-40 md:text-5xl"
										>
											{member.name.charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>

								<!-- Profile Info -->
								<div class="flex-1 space-y-4 text-center lg:text-left">
									<div>
										<h1 class="mb-2 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
											{#if type === 'organization'}
												{organization.name}
											{:else if member}
												{member.name}
											{/if}
										</h1>
										{#if type === 'organization'}
											<p class="mb-3 text-lg text-muted-foreground">
												{$t('common.organizations.village_organization')}
											</p>
											{#if organization.description}
												<p class="text-base leading-relaxed text-muted-foreground">
													{organization.description}
												</p>
											{/if}
										{:else if member}
											<p class="mb-3 text-lg text-muted-foreground">
												{$t('common.organizations.member_of').replace(
													'{organization}',
													organization.name
												)}
											</p>
											<div class="flex flex-wrap justify-center gap-2 lg:justify-start">
												<span
													class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium {getPositionBadgeColor(
														member.position
													)}"
												>
													<User class="h-4 w-4" />
													{formatPosition(member.position)}
												</span>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</Card>
					{/if}

					<!-- Organizational Hierarchy -->
					<Card>
						<CardHeader class="">
							<CardTitle class="flex items-center gap-2 text-2xl">
								<Users class="h-6 w-6" />
								{$t('common.organizations.organizational_structure')}
							</CardTitle>
							<p class="mt-2">
								{$t('common.organizations.structure_desc').replace('{name}', organization.name)}
							</p>
						</CardHeader>
						<CardContent class="space-y-8 pt-8">
							<!-- Leaders -->
							{#if hierarchy && hierarchy.leaders && hierarchy.leaders.length > 0}
								<div class="text-center">
									<h3
										class="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-foreground"
									>
										<Crown class="h-6 w-6 text-yellow-500" />
										{$t('common.organizations.leadership')}
									</h3>
									<div
										class="mx-auto grid max-w-4xl gap-6 {hierarchy.leaders.length === 1
											? 'max-w-md grid-cols-1'
											: hierarchy.leaders.length === 2
												? 'grid-cols-1 md:grid-cols-2'
												: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}"
									>
										{#each hierarchy.leaders as leader (leader.id)}
											<div class="group">
												<Card
													class="cursor-pointer overflow-hidden border border-border bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
												>
													<CardHeader class="pt-6 pb-4">
														<div class="flex items-start gap-4">
															<div class="flex-shrink-0">
																{#if leader.photo_url}
																	<img
																		src={leader.photo_url}
																		alt={leader.name}
																		class="h-16 w-16 rounded-full object-cover ring-4 ring-background/30 transition-all group-hover:ring-background/50"
																	/>
																{:else}
																	<div
																		class="flex h-16 w-16 items-center justify-center rounded-full bg-background/20 text-xl font-bold text-primary-foreground ring-4 ring-background/30 backdrop-blur-sm transition-all group-hover:ring-background/50"
																	>
																		{leader.name.charAt(0).toUpperCase()}
																	</div>
																{/if}
															</div>
															<div class="min-w-0 flex-1">
																<CardTitle class="mb-1 text-lg font-bold text-primary-foreground">
																	{leader.name}
																</CardTitle>
																<div
																	class="inline-flex items-center gap-2 rounded-full bg-background/20 px-3 py-1 text-sm font-medium text-primary-foreground backdrop-blur-sm"
																>
																	<Crown class="h-3 w-3" />
																	{formatPosition(leader.position)}
																</div>
															</div>
														</div>
													</CardHeader>
												</Card>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Key Roles (Secretary & Treasurer) -->
							{#if hierarchy && hierarchy.keyRoles && hierarchy.keyRoles.length > 0}
								<div>
									<h3
										class="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-foreground"
									>
										<Shield class="h-6 w-6 text-blue-500" />
										{$t('common.organizations.key_positions')}
									</h3>
									<div class="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
										{#each hierarchy.keyRoles as keyMember (keyMember.id)}
											<div class="group">
												<Card
													class="overflow-hidden border border-border {keyMember.position
														.toLowerCase()
														.includes('sekretaris') ||
													keyMember.position.toLowerCase().includes('secretary')
														? 'bg-purple-500'
														: 'bg-green-500'} cursor-pointer text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
												>
													<CardHeader class="pt-6 pb-4">
														<div class="flex items-start gap-4">
															<div class="flex-shrink-0">
																{#if keyMember.photo_url}
																	<img
																		src={keyMember.photo_url}
																		alt={keyMember.name}
																		class="h-16 w-16 rounded-full object-cover ring-4 ring-white/30 transition-all group-hover:ring-white/50"
																	/>
																{:else}
																	<div
																		class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white ring-4 ring-white/30 backdrop-blur-sm transition-all group-hover:ring-white/50"
																	>
																		{keyMember.name.charAt(0).toUpperCase()}
																	</div>
																{/if}
															</div>
															<div class="min-w-0 flex-1">
																<CardTitle class="mb-1 truncate text-lg font-bold text-white">
																	{keyMember.name}
																</CardTitle>
																<div
																	class="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm"
																>
																	<Shield class="h-3 w-3" />
																	{formatPosition(keyMember.position)}
																</div>
															</div>
														</div>
													</CardHeader>
												</Card>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Departments -->
							{#if hierarchy && hierarchy.departments && hierarchy.departments.length > 0}
								<div>
									<h3
										class="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-foreground"
									>
										<Briefcase class="h-6 w-6 text-purple-500" />
										{$t('common.organizations.departments')}
									</h3>
									<div class="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
										{#each hierarchy.departments as deptMember (deptMember.id)}
											<div class="group">
												<Card
													class="overflow-hidden border border-border {deptMember.position
														.toLowerCase()
														.includes('pemasaran') ||
													deptMember.position.toLowerCase().includes('marketing') ||
													deptMember.position.toLowerCase().includes('humas')
														? 'bg-orange-500'
														: 'bg-teal-500'} cursor-pointer text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
												>
													<CardHeader class="pt-6 pb-4">
														<div class="flex items-start gap-4">
															<div class="flex-shrink-0">
																{#if deptMember.photo_url}
																	<img
																		src={deptMember.photo_url}
																		alt={deptMember.name}
																		class="h-16 w-16 rounded-full object-cover ring-4 ring-white/30 transition-all group-hover:ring-white/50"
																	/>
																{:else}
																	<div
																		class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white ring-4 ring-white/30 backdrop-blur-sm transition-all group-hover:ring-white/50"
																	>
																		{deptMember.name.charAt(0).toUpperCase()}
																	</div>
																{/if}
															</div>
															<div class="min-w-0 flex-1">
																<CardTitle class="mb-1 truncate text-lg font-bold text-white">
																	{deptMember.name}
																</CardTitle>
																<div
																	class="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm"
																>
																	<Briefcase class="h-3 w-3" />
																	{formatPosition(deptMember.position)}
																</div>
															</div>
														</div>
													</CardHeader>
												</Card>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- General Members -->
							{#if hierarchy && hierarchy.others && hierarchy.others.length > 0}
								<div class="space-y-6">
									<div class="text-center">
										<h3
											class="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-foreground"
										>
											<UserCheck class="h-6 w-6 text-green-500" />
											{$t('common.organizations.general_members')}
										</h3>
										<div class="mx-auto h-1 w-24 rounded-full bg-primary"></div>
									</div>

									<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										{#each hierarchy.others as otherMember (otherMember.id)}
											<div class="group">
												<Card
													class="cursor-pointer overflow-hidden border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
												>
													<CardHeader class="pt-6 pb-4">
														<div class="flex items-start gap-4">
															<div class="flex-shrink-0">
																{#if otherMember.photo_url}
																	<img
																		src={otherMember.photo_url}
																		alt={otherMember.name}
																		class="h-14 w-14 rounded-full object-cover ring-4 ring-border transition-all group-hover:ring-primary/20"
																	/>
																{:else}
																	<div
																		class="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground ring-4 ring-border transition-all group-hover:ring-primary/20"
																	>
																		{otherMember.name.charAt(0).toUpperCase()}
																	</div>
																{/if}
															</div>
															<div class="min-w-0 flex-1">
																<CardTitle
																	class="mb-1 truncate text-base font-bold text-foreground transition-colors group-hover:text-primary"
																>
																	{otherMember.name}
																</CardTitle>
																<div
																	class="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground"
																>
																	<UserCheck class="h-3 w-3" />
																	{formatPosition(otherMember.position)}
																</div>
															</div>
														</div>
													</CardHeader>
												</Card>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</CardContent>
					</Card>
				{:else if member}
					<!-- Individual Member View -->
					<div class="grid gap-8 lg:grid-cols-3">
						<!-- Member Details -->
						<div class="space-y-6 lg:col-span-2">
							<!-- About Section -->
							<Card>
								<CardHeader>
									<CardTitle class="flex items-center gap-2">
										<User class="h-5 w-5" />
										{$t('common.organizations.about').replace('{name}', member.name)}
									</CardTitle>
								</CardHeader>
								<CardContent class="space-y-4">
									<div class="grid gap-4 sm:grid-cols-2">
										<div class="space-y-2">
											<div class="text-sm font-medium text-muted-foreground">
												{$t('common.organizations.position')}
											</div>
											<p class="font-medium text-foreground">{formatPosition(member.position)}</p>
										</div>
										<div class="space-y-2">
											<div class="text-sm font-medium text-muted-foreground">
												{$t('common.organizations.organization')}
											</div>
											<p class="font-medium text-foreground">{organization.name}</p>
										</div>
										<div class="space-y-2">
											<div class="text-sm font-medium text-muted-foreground">
												{$t('common.organizations.member_id')}
											</div>
											<p class="font-mono text-sm text-muted-foreground">#{member.id.slice(-8)}</p>
										</div>
										<div class="space-y-2">
											<div class="text-sm font-medium text-muted-foreground">
												{$t('common.organizations.joined_date')}
											</div>
											<p class="text-foreground">
												{new Date(member.created_at).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric'
												})}
											</p>
										</div>
									</div>

									{#if organization.description}
										<div class="space-y-2 border-t border-border pt-4">
											<div class="text-sm font-medium text-muted-foreground">
												{$t('common.organizations.organization_description')}
											</div>
											<p class="leading-relaxed text-foreground">{organization.description}</p>
										</div>
									{/if}
								</CardContent>
							</Card>
						</div>

						<!-- Organization Members Sidebar -->
						<div class="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle class="flex items-center gap-2">
										<Users class="h-5 w-5" />
										{$t('common.organizations.other_members')}
									</CardTitle>
								</CardHeader>
								<CardContent>
									{#if organizationMembers.length > 0}
										<div class="max-h-96 space-y-3 overflow-y-auto">
											{#each organizationMembers.slice(0, 10) as otherMember (otherMember.id)}
												<a
													href="/organizations/{createSlug(otherMember.name)}"
													class="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
												>
													{#if otherMember.photo_url}
														<img
															src={otherMember.photo_url}
															alt={otherMember.name}
															class="h-10 w-10 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/20"
														/>
													{:else}
														<div
															class="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground ring-2 ring-border group-hover:ring-primary/20"
														>
															{otherMember.name.charAt(0).toUpperCase()}
														</div>
													{/if}
													<div class="min-w-0 flex-1">
														<p
															class="truncate font-medium text-foreground group-hover:text-primary"
														>
															{otherMember.name}
														</p>
														<p class="truncate text-xs text-muted-foreground">
															{formatPosition(otherMember.position)}
														</p>
													</div>
												</a>
											{/each}

											{#if organizationMembers.length > 10}
												<div class="border-t border-border pt-2">
													<p class="text-center text-sm text-muted-foreground">
														{$t('common.organizations.more_members').replace(
															'{count}',
															organizationMembers.length - 10
														)}
													</p>
												</div>
											{/if}
										</div>
									{:else}
										<p class="py-4 text-center text-sm text-muted-foreground">
											No other members in this organization
										</p>
									{/if}
								</CardContent>
							</Card>

							<!-- Quick Actions -->
							<Card>
								<CardHeader>
									<CardTitle class="text-lg">{$t('common.organizations.quick_actions')}</CardTitle>
								</CardHeader>
								<CardContent class="space-y-3">
									<Button
										variant="outline"
										class="w-full justify-start gap-2"
										onclick={() => goto('/organizations')}
									>
										<Building2 class="h-4 w-4" />
										{$t('common.organizations.view_all_organizations')}
									</Button>
									<Button
										variant="outline"
										class="w-full justify-start gap-2"
										onclick={() => goto(`/organizations/${createSlug(organization.name)}`)}
									>
										<Users class="h-4 w-4" />
										{$t('common.organizations.view_organization')}
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
