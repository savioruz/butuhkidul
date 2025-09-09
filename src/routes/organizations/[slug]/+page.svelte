<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		ArrowLeft,
		User,
		Building2,
		Calendar,
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
		const pos = position.toLowerCase();
		if (pos.includes('ketua') || pos.includes('chair') || pos.includes('president')) {
			return 'bg-primary text-primary-foreground';
		}
		if (pos.includes('sekretaris') || pos.includes('secretary')) {
			return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
		}
		if (pos.includes('bendahara') || pos.includes('treasurer')) {
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
		}
		if (pos.includes('pemasaran') || pos.includes('marketing')) {
			return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
		}
		if (
			pos.includes('produksi') ||
			pos.includes('production') ||
			pos.includes('operasi') ||
			pos.includes('operation')
		) {
			return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100';
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
		const pos = position.toLowerCase();
		if (pos.includes('ketua') || pos.includes('chair') || pos.includes('president')) return 1;
		if (
			pos.includes('sekretaris') ||
			pos.includes('secretary') ||
			pos.includes('bendahara') ||
			pos.includes('treasurer')
		)
			return 2;
		if (
			pos.includes('pemasaran') ||
			pos.includes('marketing') ||
			pos.includes('produksi') ||
			pos.includes('production') ||
			pos.includes('operasi') ||
			pos.includes('operation')
		)
			return 3;
		return 4;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function organizeByHierarchy(members: any[]) {
		const allMembers = type === 'organization' ? members : [member, ...members];
		const sorted = allMembers.sort((a, b) => {
			const levelA = getPositionLevel(a.position);
			const levelB = getPositionLevel(b.position);
			if (levelA !== levelB) return levelA - levelB;
			return a.name.localeCompare(b.name);
		});

		return {
			leaders: sorted.filter((m) => getPositionLevel(m.position) === 1),
			keyRoles: sorted.filter((m) => getPositionLevel(m.position) === 2),
			departments: sorted.filter((m) => getPositionLevel(m.position) === 3),
			others: sorted.filter((m) => getPositionLevel(m.position) === 4)
		};
	}

	let hierarchy = $derived(organizeByHierarchy(organizationMembers));
</script>

<svelte:head>
	{#if type === 'organization'}
		<title>{organization.name} - Organization Members | Village Organizations</title>
		<meta name="description" content="View members of {organization.name} organization" />
	{:else}
		<title>{member.name} - {organization.name} | Village Organizations</title>
		<meta
			name="description"
			content="Profile of {member.name}, {formatPosition(member.position)} of {organization.name}"
		/>
	{/if}
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Navigation Header -->
	<div class="sticky top-0 z-40 bg-card/50 backdrop-blur-sm">
		<div class="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="sm" onclick={() => goto('/organizations')} class="gap-2">
					<ArrowLeft class="h-4 w-4" />
					<span class="hidden sm:inline">Back to Organizations</span>
					<span class="sm:hidden">Back</span>
				</Button>
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<span>Organizations</span>
					<span>/</span>
					{#if type === 'organization'}
						<span class="font-medium text-foreground">{organization.name}</span>
					{:else}
						<span class="font-medium text-foreground">{member.name}</span>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
		<div class="mx-auto max-w-6xl space-y-8">
			<!-- Organization/Member Profile Header -->
			<Card
				class="overflow-hidden border-2 bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg"
			>
				<CardHeader class="pb-8">
					<div class="flex flex-col gap-6 lg:flex-row lg:items-center">
						<!-- Profile Image -->
						<div class="flex justify-center lg:justify-start">
							{#if type === 'organization'}
								<div
									class="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground shadow-2xl ring-8 ring-background sm:h-40 sm:w-40 sm:text-5xl lg:h-48 lg:w-48 lg:text-6xl"
								>
									{organization.name.charAt(0).toUpperCase()}
								</div>
							{:else if member.photo_url}
								<img
									src={member.photo_url}
									alt={member.name}
									class="h-32 w-32 rounded-full object-cover shadow-2xl ring-8 ring-background sm:h-40 sm:w-40 lg:h-48 lg:w-48"
								/>
							{:else}
								<div
									class="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground shadow-2xl ring-8 ring-background sm:h-40 sm:w-40 sm:text-5xl lg:h-48 lg:w-48 lg:text-6xl"
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
									{:else}
										{member.name}
									{/if}
								</h1>
								{#if type === 'organization'}
									<p class="mb-3 text-lg text-muted-foreground">Village Organization</p>
									{#if organization.description}
										<p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
											{organization.description}
										</p>
									{/if}
								{:else}
									<p class="mb-3 text-lg text-muted-foreground">
										Member of {organization.name}
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

							<div
								class="flex flex-col justify-center gap-4 pt-4 sm:flex-row sm:items-center lg:justify-start"
							>
								{#if type === 'organization'}
									<div class="flex items-center gap-2 text-muted-foreground">
										<Calendar class="h-5 w-5" />
										<span>Established {new Date(organization.created_at).getFullYear()}</span>
									</div>
									<div class="flex items-center gap-2 text-muted-foreground">
										<Users class="h-5 w-5" />
										<span>{organizationMembers.length} Members</span>
									</div>
								{:else}
									<div class="flex items-center gap-2 text-muted-foreground">
										<Building2 class="h-5 w-5" />
										<span class="font-medium">{organization.name}</span>
									</div>
									<div class="flex items-center gap-2 text-muted-foreground">
										<Calendar class="h-5 w-5" />
										<span>Member since {new Date(member.created_at).getFullYear()}</span>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>

			<!-- Member Details & Organization Info -->
			<div class="space-y-8">
				{#if type === 'organization'}
					<!-- Organization Description -->
					{#if organization.description}
						<Card>
							<CardHeader>
								<CardTitle class="flex items-center gap-2">
									<Building2 class="h-5 w-5" />
									About {organization.name}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p class="leading-relaxed text-foreground">{organization.description}</p>
							</CardContent>
						</Card>
					{/if}

					<!-- Organizational Hierarchy -->
					<Card>
						<CardHeader class="">
							<CardTitle class="flex items-center gap-2 text-2xl">
								<Users class="h-6 w-6" />
								Organizational Structure
							</CardTitle>
							<p class="mt-2">
								The organizational structure and team members of {organization.name}
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
										Leadership
									</h3>
									<div class="flex justify-center">
										{#each hierarchy.leaders as leader (leader.id)}
											<div class="group w-full max-w-md">
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
										Key Positions
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
										Departments
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
											General Members
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
				{:else}
					<!-- Individual Member View -->
					<div class="grid gap-8 lg:grid-cols-3">
						<!-- Member Details -->
						<div class="space-y-6 lg:col-span-2">
							<!-- About Section -->
							<Card>
								<CardHeader>
									<CardTitle class="flex items-center gap-2">
										<User class="h-5 w-5" />
										About {member.name}
									</CardTitle>
								</CardHeader>
								<CardContent class="space-y-4">
									<div class="grid gap-4 sm:grid-cols-2">
										<div class="space-y-2">
											<div class="text-sm font-medium text-muted-foreground">Position</div>
											<p class="font-medium text-foreground">{formatPosition(member.position)}</p>
										</div>
										<div class="space-y-2">
											<div class="text-sm font-medium text-muted-foreground">Organization</div>
											<p class="font-medium text-foreground">{organization.name}</p>
										</div>
										<div class="space-y-2">
											<div class="text-sm font-medium text-muted-foreground">Member ID</div>
											<p class="font-mono text-sm text-muted-foreground">#{member.id.slice(-8)}</p>
										</div>
										<div class="space-y-2">
											<div class="text-sm font-medium text-muted-foreground">Joined Date</div>
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
												Organization Description
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
										Other Members
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
														And {organizationMembers.length - 10} more members...
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
									<CardTitle class="text-lg">Quick Actions</CardTitle>
								</CardHeader>
								<CardContent class="space-y-3">
									<Button
										variant="outline"
										class="w-full justify-start gap-2"
										onclick={() => goto('/organizations')}
									>
										<Building2 class="h-4 w-4" />
										View All Organizations
									</Button>
									<Button
										variant="outline"
										class="w-full justify-start gap-2"
										onclick={() => goto(`/organizations/${createSlug(organization.name)}`)}
									>
										<Users class="h-4 w-4" />
										View Organization
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
