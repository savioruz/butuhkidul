<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { unitsApi } from '$lib/api/units';
	import type { Unit } from '$lib/types/unit';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Users, Building2 } from 'lucide-svelte';

	let organizations: Unit[] = $state([]);
	let isLoading = $state(true);
	let error = $state('');

	// Helper function to create slug from organization name
	function createSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
			.replace(/\s+/g, '-') // Replace spaces with hyphens
			.replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
			.trim();
	}

	async function loadOrganizations() {
		try {
			isLoading = true;
			error = '';

			const response = await unitsApi.getUnits();
			console.log('API Response:', response);

			// Handle successful response
			if (response && response.data && Array.isArray(response.data.units)) {
				organizations = response.data.units;
			} else if (response && Array.isArray(response.data)) {
				// Handle case where data is directly an array
				organizations = response.data;
			} else if (response && response.success === false) {
				error = response.message || 'Failed to load organizations';
			} else {
				console.warn('Unexpected response structure:', response);
				error = 'Failed to load organizations';
			}
		} catch (err) {
			console.error('Error loading organizations:', err);
			error = 'Failed to load organizations';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadOrganizations();
	});
</script>

<svelte:head>
	<title>{$t('common.organizations.title')} - {$t('common.hero.village_name')}</title>
	<meta name="description" content={$t('common.organizations.subtitle')} />
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<!-- Main Content -->
	<section class="py-8 sm:py-12 lg:py-16">
		<div class="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
			{#if isLoading}
				<!-- Loading State -->
				<div class="py-16 text-center sm:py-20">
					<div
						class="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary sm:mb-6 sm:h-12 sm:w-12"
					></div>
					<h3 class="mb-2 text-lg font-semibold text-foreground sm:text-xl">
						{$t('common.organizations.loading')}
					</h3>
					<p class="text-sm text-muted-foreground sm:text-base">
						{$t('common.organizations.loading_data')}
					</p>
				</div>
			{:else if error}
				<!-- Error State -->
				<div class="py-16 text-center sm:py-20">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-destructive/50 bg-card p-4 sm:mb-6 sm:h-20 sm:w-20 sm:p-6"
					>
						<Building2 class="h-8 w-8 text-destructive sm:h-10 sm:w-10" />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-foreground sm:text-xl">
						{$t('common.organizations.failed_to_load')}
					</h3>
					<p class="mb-4 px-4 text-sm text-destructive sm:mb-6 sm:text-base">{error}</p>
					<Button onclick={loadOrganizations} variant="outline" class="gap-2 text-sm sm:text-base">
						{$t('common.organizations.retry')}
					</Button>
				</div>
			{:else if organizations.length === 0}
				<!-- No Organizations -->
				<div class="py-16 text-center sm:py-20">
					<Building2 class="mx-auto mb-4 h-16 w-16 text-muted-foreground sm:mb-6 sm:h-20 sm:w-20" />
					<h3 class="mb-2 text-lg font-semibold text-foreground sm:text-xl">
						{$t('common.organizations.no_organizations')}
					</h3>
					<p class="px-4 text-sm text-muted-foreground sm:text-base">
						{$t('common.organizations.no_organizations_desc')}
					</p>
				</div>
			{:else}
				<!-- Organizations Grid -->
				<div class="space-y-6 sm:space-y-8">
					<!-- Hero Section -->
					<div class="mb-8 text-center sm:mb-12">
						<h1
							class="mb-3 text-3xl font-bold text-foreground sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
						>
							{$t('common.organizations.title')}
						</h1>
						<p
							class="mx-auto max-w-2xl px-4 text-sm text-muted-foreground sm:text-base lg:max-w-4xl lg:text-lg"
						>
							{$t('common.organizations.subtitle')}
						</p>
					</div>

					<!-- Organizations Grid -->
					<div
						class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4 2xl:grid-cols-5"
					>
						{#each organizations as organization (organization.id)}
							<a href="/organizations/{createSlug(organization.name)}" class="group block">
								<Card
									class="flex h-120 w-80 cursor-pointer flex-col overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:hover:-translate-y-2"
								>
									<CardHeader class="px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6">
										<div class="mb-3 flex items-start justify-between sm:mb-4">
											<div
												class="rounded-lg bg-primary p-3 text-primary-foreground shadow-lg transition-shadow group-hover:shadow-xl sm:rounded-xl sm:p-4"
											>
												<Building2 class="h-6 w-6 sm:h-8 sm:w-8" />
											</div>
											<div class="text-right">
												<div
													class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
												>
													{$t('common.organizations.organization')}
												</div>
												<div class="text-xs font-semibold text-primary sm:text-sm">
													#{organization.id.slice(-4)}
												</div>
											</div>
										</div>

										<CardTitle
											class="text-lg leading-tight font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl lg:text-2xl"
										>
											{organization.name}
										</CardTitle>

										{#if organization.description}
											<CardDescription
												class="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base"
											>
												{organization.description}
											</CardDescription>
										{/if}
									</CardHeader>

									<CardContent
										class="flex flex-grow flex-col justify-end px-4 pt-0 pb-4 sm:px-6 sm:pb-6"
									>
										<div class="space-y-3 sm:space-y-4">
											<div
												class="w-full rounded-lg bg-primary/10 px-3 py-2 text-center text-sm font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:text-base"
											>
												<Users class="mr-2 inline h-3 w-3 sm:h-4 sm:w-4" />
												{$t('common.organizations.view_members')}
											</div>
										</div>
									</CardContent>
								</Card>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</section>
</div>
