<script lang="ts">
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import { ArrowLeft, User, Building2, Users } from 'lucide-svelte';
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

	function createSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	}

	function getPositionLevel(position: string): number {
		const pos = position
			.replace(/[\r\n\t\u00A0\u2000-\u200B\u2028\u2029]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
			.toLowerCase();

		if (
			pos === 'ketua' ||
			pos.includes('ketua') ||
			pos.includes('chair') ||
			pos.includes('president')
		) {
			return 1;
		}

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
			return 2;
		}

		if (
			pos.includes('divisi') ||
			pos.includes('humas') ||
			pos.includes('pemasaran') ||
			pos.includes('marketing') ||
			pos.includes('produksi') ||
			pos.includes('production') ||
			pos.includes('operasi') ||
			pos.includes('operation') ||
			pos.includes('pj ') ||
			pos.startsWith('pj ') ||
			pos.endsWith(' pj') ||
			pos.includes(' pj ') ||
			/\bpj\b/i.test(pos)
		) {
			return 3;
		}

		if (pos === 'anggota' || pos.includes('anggota') || pos.includes('member')) {
			return 4;
		}

		return 4;
	}

	function getLeadershipOrder(position: string): number {
		const pos = position.toLowerCase().trim();
		if (pos === 'ketua' || pos === 'chair' || pos === 'president') return 0;

		const numberedMatch = pos.match(/ketua\s*(\d+)|chair\s*(\d+)|president\s*(\d+)/);
		if (numberedMatch) {
			const num = numberedMatch[1] || numberedMatch[2] || numberedMatch[3];
			return parseInt(num);
		}

		return 99;
	}

	function organizeByHierarchy(members: typeof organizationMembers) {
		const sorted = [...members].sort((a, b) => {
			const levelA = getPositionLevel(a.position);
			const levelB = getPositionLevel(b.position);

			if (levelA !== levelB) return levelA - levelB;

			if (levelA === 1) {
				const orderA = getLeadershipOrder(a.position);
				const orderB = getLeadershipOrder(b.position);
				return orderA - orderB;
			}

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
	<title>
		{organization.name} | {$t('common.organizations.title')}
	</title>
	<meta
		name="description"
		content={$t('common.organizations.structure_desc').replace('{name}', organization.name)}
	/>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
		<!-- Back -->
		<div class="mb-6">
			<Button variant="ghost" size="sm" onclick={() => goto('/organizations')} class="gap-2">
				<ArrowLeft class="h-4 w-4" />
				{$t('common.organizations.back')}
			</Button>
		</div>

		<!-- Organization View -->
		{#if type === 'organization'}
			<!-- Organization Header -->
			<div class="mb-8 border border-border bg-card p-6">
				<div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
					<div
						class="flex h-20 w-20 items-center justify-center bg-muted text-2xl font-bold text-muted-foreground"
					>
						{organization.name.charAt(0).toUpperCase()}
					</div>
					<div class="text-center sm:text-left">
						<h1 class="text-2xl font-bold">{organization.name}</h1>
						<p class="mt-1 text-sm text-muted-foreground">
							{$t('common.organizations.village_organization')}
						</p>
						{#if organization.description}
							<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
								{organization.description}
							</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Hierarchy Sections -->
			<div class="space-y-8">
				{#if hierarchy.leaders.length > 0}
					<div>
						<h3 class="mb-4 text-lg font-bold">{$t('common.organizations.leadership')}</h3>
						<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each hierarchy.leaders as leader (leader.id)}
								<div class="border border-border bg-card p-4">
									<div class="flex items-start gap-3">
										<div
											class="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-muted text-sm font-bold text-muted-foreground"
										>
											{leader.name.charAt(0).toUpperCase()}
										</div>
										<div class="min-w-0 flex-1">
											<p class="truncate font-semibold">{leader.name}</p>
											<span
												class="mt-1 inline-block bg-muted px-2 py-0.5 text-xs text-muted-foreground"
											>
												{formatPosition(leader.position)}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if hierarchy.keyRoles.length > 0}
					<div>
						<h3 class="mb-4 text-lg font-bold">{$t('common.organizations.key_positions')}</h3>
						<div class="grid gap-4 sm:grid-cols-2">
							{#each hierarchy.keyRoles as keyMember (keyMember.id)}
								<div class="border border-border bg-card p-4">
									<div class="flex items-start gap-3">
										<div
											class="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-muted text-sm font-bold text-muted-foreground"
										>
											{keyMember.name.charAt(0).toUpperCase()}
										</div>
										<div class="min-w-0 flex-1">
											<p class="truncate font-semibold">{keyMember.name}</p>
											<span
												class="mt-1 inline-block bg-muted px-2 py-0.5 text-xs text-muted-foreground"
											>
												{formatPosition(keyMember.position)}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if hierarchy.departments.length > 0}
					<div>
						<h3 class="mb-4 text-lg font-bold">{$t('common.organizations.departments')}</h3>
						<div class="grid gap-4 sm:grid-cols-2">
							{#each hierarchy.departments as deptMember (deptMember.id)}
								<div class="border border-border bg-card p-4">
									<div class="flex items-start gap-3">
										<div
											class="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-muted text-sm font-bold text-muted-foreground"
										>
											{deptMember.name.charAt(0).toUpperCase()}
										</div>
										<div class="min-w-0 flex-1">
											<p class="truncate font-semibold">{deptMember.name}</p>
											<span
												class="mt-1 inline-block bg-muted px-2 py-0.5 text-xs text-muted-foreground"
											>
												{formatPosition(deptMember.position)}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if hierarchy.others.length > 0}
					<div>
						<h3 class="mb-4 text-lg font-bold">{$t('common.organizations.general_members')}</h3>
						<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each hierarchy.others as otherMember (otherMember.id)}
								<div class="border border-border bg-card p-4">
									<div class="flex items-start gap-3">
										<div
											class="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-muted text-sm font-bold text-muted-foreground"
										>
											{otherMember.name.charAt(0).toUpperCase()}
										</div>
										<div class="min-w-0 flex-1">
											<p class="truncate font-semibold">{otherMember.name}</p>
											<span
												class="mt-1 inline-block bg-muted px-2 py-0.5 text-xs text-muted-foreground"
											>
												{formatPosition(otherMember.position)}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Member View -->
		{:else if member}
			<div class="grid gap-6 lg:grid-cols-3">
				<!-- Member Details -->
				<div class="space-y-6 lg:col-span-2">
					<div class="border border-border bg-card p-6">
						<h2 class="mb-4 flex items-center gap-2 text-lg font-bold">
							<User class="h-5 w-5" />
							{$t('common.organizations.about').replace('{name}', member.name)}
						</h2>
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<p class="text-xs text-muted-foreground">{$t('common.organizations.position')}</p>
								<p class="mt-1 font-medium">{formatPosition(member.position)}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">
									{$t('common.organizations.organization')}
								</p>
								<p class="mt-1 font-medium">{organization.name}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">{$t('common.organizations.member_id')}</p>
								<p class="mt-1 font-mono text-sm text-muted-foreground">#{member.id.slice(-8)}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">
									{$t('common.organizations.joined_date')}
								</p>
								<p class="mt-1">
									{new Date(member.created_at).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</p>
							</div>
						</div>
						{#if organization.description}
							<div class="mt-4 border-t border-border pt-4">
								<p class="text-xs text-muted-foreground">
									{$t('common.organizations.organization_description')}
								</p>
								<p class="mt-1 text-sm leading-relaxed text-muted-foreground">
									{organization.description}
								</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Sidebar -->
				<div class="space-y-4">
					<div class="border border-border bg-card p-4">
						<h3 class="mb-3 flex items-center gap-2 text-sm font-bold">
							<Users class="h-4 w-4" />
							{$t('common.organizations.other_members')}
						</h3>
						{#if organizationMembers.length > 0}
							<div class="max-h-80 space-y-2 overflow-y-auto">
								{#each organizationMembers.slice(0, 10) as otherMember (otherMember.id)}
									<a
										href="/organizations/{createSlug(otherMember.name)}"
										class="flex items-center gap-3 border border-border p-3 transition-colors hover:bg-muted/50"
									>
										<div
											class="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-muted text-sm font-bold text-muted-foreground"
										>
											{otherMember.name.charAt(0).toUpperCase()}
										</div>
										<div class="min-w-0 flex-1">
											<p class="truncate text-sm font-medium">{otherMember.name}</p>
											<p class="truncate text-xs text-muted-foreground">
												{formatPosition(otherMember.position)}
											</p>
										</div>
									</a>
								{/each}
								{#if organizationMembers.length > 10}
									<p class="pt-2 text-center text-xs text-muted-foreground">
										{$t('common.organizations.more_members').replace(
											'{count}',
											organizationMembers.length - 10
										)}
									</p>
								{/if}
							</div>
						{:else}
							<p class="py-4 text-center text-sm text-muted-foreground">
								{$t('common.organizations.no_other_members')}
							</p>
						{/if}
					</div>

					<div class="border border-border bg-card p-4">
						<h3 class="mb-3 text-sm font-bold">{$t('common.organizations.quick_actions')}</h3>
						<div class="space-y-2">
							<Button
								variant="outline"
								size="sm"
								class="w-full justify-start gap-2"
								onclick={() => goto('/organizations')}
							>
								<Building2 class="h-4 w-4" />
								{$t('common.organizations.view_all_organizations')}
							</Button>
							<Button
								variant="outline"
								size="sm"
								class="w-full justify-start gap-2"
								onclick={() => goto(`/organizations/${createSlug(organization.name)}`)}
							>
								<Users class="h-4 w-4" />
								{$t('common.organizations.view_organization')}
							</Button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
