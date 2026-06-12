<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { t } from '$lib/i18n';
	import { ChevronRight, Calendar } from 'lucide-svelte';
	import type { Village, VillagesResponse } from '@/types/village';
	import type { Article, ArticlesResponse } from '@/types/article';
	import { getExcerpt } from '$lib/utils/markdown';
	import { populationApi } from '$lib/api/population';
	import type { PopulationStats } from '@/types/population';

	let {
		villageData: initialVillageData = null,
		articlesData: initialArticlesData = null,
		villageError: initialVillageError = null,
		articlesError: initialArticlesError = null
	}: {
		villageData: VillagesResponse | null;
		articlesData: ArticlesResponse | null;
		villageError: string | null;
		articlesError: string | null;
	} = $props();

	let villageData = $state(initialVillageData);
	let articlesData = $state(initialArticlesData);
	let error = $state(initialVillageError);
	let articlesError = $state(initialArticlesError);

	let isLoading = $state(false);
	let isLoadingArticles = $state(false);

	let primaryVillage: Village | null = $state(null);
	let latestArticles: Article[] = $state([]);

	let populationStats: PopulationStats | null = $state(null);
	let populationLoading = $state(true);
	let populationError = $state<string | null>(null);

	let hamletData: Array<{ hamlet: string; population: number; households: number }> = $state([]);

	const villageCoordinates = {
		latitude: -7.863229,
		longitude: 110.275761
	};

	const googleMapsEmbedUrl =
		'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.3039250239203!2d110.27576072573447!3d-7.863228978172313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7af921ec0e2b1f%3A0x8ea440c9c9a1a377!2sButuh%20Kidul%2C%20Triwidadi%2C%20Pajangan%2C%20Bantul%20Regency%2C%20Special%20Region%20of%20Yogyakarta!5e0!3m2!1sen!2sid!4v1757404961400!5m2!1sen!2sid';

	function formatDate(dateString: string): string {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('id-ID', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return dateString;
		}
	}

	function getHamletStatus(population: number, avg: number): string {
		if (population > avg * 1.1) return 'DENSE';
		if (population < avg * 0.9) return 'STABLE';
		return 'BALANCED';
	}

	$effect(() => {
		if (villageData?.data?.villages && villageData.data.villages.length > 0) {
			primaryVillage = villageData.data.villages[0];
		} else {
			primaryVillage = null;
		}
	});

	$effect(() => {
		if (articlesData?.data?.articles) {
			latestArticles = articlesData.data.articles.slice(0, 2);
		} else {
			latestArticles = [];
		}
	});

	$effect(() => {
		villageData = initialVillageData;
		articlesData = initialArticlesData;
		error = initialVillageError;
		articlesError = initialArticlesError;
	});

	onMount(async () => {
		try {
			populationLoading = true;
			const response = await populationApi.getPopulations();
			if (response?.data?.population && Array.isArray(response.data.population)) {
				const stats = populationApi.processPopulationStats(response.data.population);
				populationStats = stats;
				hamletData = stats.hamletData.map((h, i) => ({
					hamlet: `RT ${String(i + 1).padStart(2, '0')}`,
					population: h.population,
					households: h.households
				}));
			} else {
				populationError = $t('common.population.no_data_available');
			}
		} catch (err) {
			populationError = err instanceof Error ? err.message : $t('common.population.load_failed');
		} finally {
			populationLoading = false;
		}
	});
</script>

<!-- 1. Hero Section -->
<section
	class="grid-bg relative flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center border-b border-border"
>
	<div class="mx-auto max-w-7xl px-4 text-center md:px-6">
		<div class="mb-4 inline-flex items-center gap-2 text-primary">
			<span class="material-symbols-outlined text-sm">verified</span>
			<span class="text-xs font-semibold tracking-widest uppercase">{$t('common.hero.badge')}</span>
		</div>
		<h1
			class="mx-auto mb-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground md:text-6xl md:leading-[1.1]"
		>
			Butuh Kidul Digital Hub
		</h1>
		<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
			{isLoading
				? `${$t('common.loading')}...`
				: (primaryVillage?.address ?? $t('common.hero.subtitle'))}
		</p>
		{#if error}
			<div class="mx-auto mt-6 max-w-md bg-destructive/10 px-6 py-4 text-destructive">
				{error}
			</div>
		{/if}
		<div class="mt-8 flex justify-center">
			<Button
				size="lg"
				href="#statistics"
				class="px-8 py-4 text-base shadow-md hover:shadow-lg"
				disabled={isLoading}
			>
				{$t('common.hero.explore_button')}
				<ChevronRight class="ml-2 h-5 w-5" />
			</Button>
		</div>
	</div>
	<div
		class="absolute bottom-12 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-1 text-primary"
	>
		<span class="text-xs font-semibold tracking-widest uppercase"
			>{$t('common.hero.explore_text')}</span
		>
		<span class="material-symbols-outlined text-2xl">keyboard_double_arrow_down</span>
	</div>
</section>

<!-- Bento Grid Container -->
<div id="statistics" class="mx-auto px-4 py-12 md:px-16">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-12">
		<!-- 2. Core Village Metrics (KPI Grid) -->
		<div class="space-y-6 md:col-span-12">
			<div class="flex items-center gap-4">
				<h2 class="text-lg font-bold md:text-xl">{$t('common.population.title')}</h2>
				<div class="h-px flex-grow bg-border"></div>
			</div>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				{#if populationLoading}
					{#each Array(3) as __unused, i (i)}
						{void __unused}
						<div class="animate-pulse border border-border p-8">
							<div class="mb-4 h-8 w-8 bg-muted"></div>
							<div class="mb-2 h-8 w-24 bg-muted"></div>
							<div class="mb-2 h-4 w-32 bg-muted"></div>
							<div class="h-3 w-48 bg-muted"></div>
						</div>
					{/each}
				{:else if populationError}
					<div class="py-12 text-center md:col-span-3">
						<p class="text-destructive">{populationError}</p>
					</div>
				{:else if populationStats}
					<div class="group border border-border bg-card p-8 transition-colors hover:bg-accent/50">
						<div class="mb-4 flex items-center justify-between text-primary">
							<span class="material-symbols-outlined text-3xl">groups</span>
							<span class="text-xs text-muted-foreground transition-colors group-hover:text-primary"
								>{$t('common.population.cards.live_data_badge')}</span
							>
						</div>
						<div class="mb-1 text-3xl font-bold">
							{populationStats.totalPopulation.toLocaleString('id-ID')}
						</div>
						<div class="mb-2 text-xs font-semibold tracking-wider text-foreground uppercase">
							{$t('common.population.cards.total_population')}
						</div>
						<p class="text-xs text-muted-foreground">
							{$t('common.population.descriptions.census')}
						</p>
					</div>
					<div class="group border border-border bg-card p-8 transition-colors hover:bg-accent/50">
						<div class="mb-4 flex items-center justify-between text-primary">
							<span class="material-symbols-outlined text-3xl">home</span>
							<span class="text-xs text-muted-foreground transition-colors group-hover:text-primary"
								>{$t('common.population.cards.validated_badge')}</span
							>
						</div>
						<div class="mb-1 text-3xl font-bold">
							{populationStats.totalHouseholds.toLocaleString('id-ID')}
						</div>
						<div class="mb-2 text-xs font-semibold tracking-wider text-foreground uppercase">
							{$t('common.population.cards.total_households')}
						</div>
						<p class="text-xs text-muted-foreground">
							{$t('common.population.descriptions.households')}
						</p>
					</div>
					<div class="group border border-border bg-card p-8 transition-colors hover:bg-accent/50">
						<div class="mb-4 flex items-center justify-between text-primary">
							<span class="material-symbols-outlined text-3xl">family_restroom</span>
							<span class="text-xs text-muted-foreground transition-colors group-hover:text-primary"
								>{$t('common.population.cards.kk_badge')}</span
							>
						</div>
						<div class="mb-1 text-3xl font-bold">
							{populationStats.totalHouseholds.toLocaleString('id-ID')}
						</div>
						<div class="mb-2 text-xs font-semibold tracking-wider text-foreground uppercase">
							{$t('common.population.cards.total_family_units')}
						</div>
						<p class="text-xs text-muted-foreground">
							{$t('common.population.descriptions.kk')}
						</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- 3. Granular Administrative Data + Geographic Verification -->
		{#if populationStats && hamletData.length > 0}
			{@const avgPopulation = hamletData.reduce((s, d) => s + d.population, 0) / hamletData.length}
			<div class="flex flex-col border border-border bg-card md:col-span-8">
				<div class="flex items-center justify-between border-b border-border bg-muted/30 p-6">
					<h2 class="text-lg font-bold md:text-xl">{$t('common.population.admin.title')}</h2>
					<span class="material-symbols-outlined text-muted-foreground">analytics</span>
				</div>
				<!-- Mobile: stacked cards -->
				<div class="divide-y divide-border md:hidden">
					{#each hamletData as item (item.hamlet)}
						{@const status = getHamletStatus(item.population, avgPopulation)}
						{@const statusColor =
							status === 'DENSE'
								? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
								: status === 'BALANCED'
									? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
									: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}
						<div class="flex items-center justify-between px-4 py-3">
							<div class="flex items-center gap-3">
								<span class="text-sm font-semibold">{item.hamlet}</span>
							</div>
							<div class="flex items-center gap-4 text-xs text-muted-foreground">
								<span><span class="font-medium text-foreground">{item.population}</span> pop</span>
								<span><span class="font-medium text-foreground">{item.households}</span> kk</span>
								<span class="rounded-full px-2 py-0.5 text-[10px] font-bold {statusColor}"
									>{status}</span
								>
							</div>
						</div>
					{/each}
				</div>
				<!-- Desktop: full table -->
				<div class="hidden overflow-x-auto md:block">
					<table class="w-full text-left text-sm">
						<thead>
							<tr class="border-b border-border bg-card">
								<th class="px-6 py-4 text-xs font-semibold tracking-wider"
									>{$t('common.population.admin.unit_label')}</th
								>
								<th class="px-6 py-4 text-xs font-semibold tracking-wider"
									>{$t('common.population.admin.population_label')}</th
								>
								<th class="px-6 py-4 text-xs font-semibold tracking-wider"
									>{$t('common.population.admin.households_label')}</th
								>
								<th class="px-6 py-4 text-xs font-semibold tracking-wider"
									>{$t('common.population.admin.status_label')}</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							{#each hamletData as item (item.hamlet)}
								{@const status = getHamletStatus(item.population, avgPopulation)}
								<tr>
									<td class="px-6 py-4">{item.hamlet}</td>
									<td class="px-6 py-4">{item.population}</td>
									<td class="px-6 py-4">{item.households}</td>
									<td class="px-6 py-4">
										<span
											class="rounded-full px-2 py-1 text-[10px] font-bold {status === 'DENSE'
												? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
												: status === 'BALANCED'
													? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
													: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}"
											>{status}</span
										>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div
					class="mt-auto grid grid-cols-1 gap-4 border-t border-border bg-muted/20 p-6 md:grid-cols-3"
				>
					<div class="flex flex-col gap-1">
						<div class="text-[10px] font-bold text-primary uppercase">
							{$t('common.population.insights.gender_balance.title')}
						</div>
						<p class="text-xs leading-tight text-muted-foreground">
							{$t('common.population.insights.gender_balance.desc')}
						</p>
					</div>
					<div class="flex flex-col gap-1">
						<div class="text-[10px] font-bold text-primary uppercase">
							{$t('common.population.insights.household_density.title')}
						</div>
						<p class="text-xs leading-tight text-muted-foreground">
							{$t('common.population.insights.household_density.desc')}
						</p>
					</div>
					<div class="flex flex-col gap-1">
						<div class="text-[10px] font-bold text-primary uppercase">
							{$t('common.population.insights.youth_demographic.title')}
						</div>
						<p class="text-xs leading-tight text-muted-foreground">
							{$t('common.population.insights.youth_demographic.desc')}
						</p>
					</div>
				</div>
			</div>

			<!-- 5. Geographic Verification -->
			<div class="flex flex-col border border-border bg-card md:col-span-4">
				<div class="border-b border-border bg-muted/30 p-6">
					<h2 class="text-lg font-bold md:text-xl">
						{$t('common.location.geographic_verification')}
					</h2>
				</div>
				<a
					href="https://www.google.com/maps?q={villageCoordinates.latitude},{villageCoordinates.longitude}"
					target="_blank"
					rel="noopener noreferrer"
					class="relative block min-h-[200px] flex-grow overflow-hidden"
					aria-label="Open in Google Maps"
				>
					<iframe
						src={googleMapsEmbedUrl}
						class="pointer-events-none absolute inset-0 h-full w-full"
						loading="lazy"
						title="Google Maps"
					></iframe>
				</a>
				<div class="p-6">
					<p class="mb-2 text-xs text-muted-foreground">
						{$t('common.location.verified_coordinates')}
					</p>
					<div class="text-xs font-semibold tracking-wider text-foreground">
						{villageCoordinates.latitude.toFixed(4)}, {villageCoordinates.longitude.toFixed(4)}
					</div>
					<div class="mt-1 text-sm leading-tight text-foreground">
						{primaryVillage?.name}, {primaryVillage?.address}
					</div>
				</div>
			</div>
		{/if}

		<!-- 4. Latest Articles -->
		<div class="md:col-span-12">
			<div class="mb-6 flex items-center gap-4">
				<h2 class="text-lg font-bold md:text-xl">{$t('common.articles.title')}</h2>
				<div class="h-px flex-grow bg-border"></div>
			</div>

			{#if isLoadingArticles}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					{#each Array(2) as __unused, i (i)}
						{void __unused}
						<div class="animate-pulse border border-border bg-card p-6">
							<div class="flex flex-col gap-6 md:flex-row">
								<div class="aspect-video w-full bg-muted md:aspect-square md:w-1/3"></div>
								<div class="w-full space-y-3 md:w-2/3">
									<div class="h-5 w-3/4 bg-muted"></div>
									<div class="h-4 w-full bg-muted"></div>
									<div class="h-4 w-2/3 bg-muted"></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else if articlesError}
				<div class="py-12 text-center">
					<div class="mx-auto max-w-md bg-destructive/10 p-8 text-destructive">
						<Calendar class="mx-auto mb-4 h-12 w-12 text-destructive" />
						<h3 class="mb-2 text-lg font-semibold">{$t('common.articles.error_loading')}</h3>
						<p class="mb-4 text-sm">{articlesError}</p>
						<Button variant="outline" size="sm" onclick={() => window.location.reload()}>
							{$t('common.articles.try_again')}
						</Button>
					</div>
				</div>
			{:else if latestArticles.length === 0}
				<div class="py-12 text-center">
					<div class="mx-auto max-w-md bg-muted p-8 text-muted-foreground">
						<Calendar class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<h3 class="mb-2 text-lg font-semibold">{$t('common.articles.no_articles_found')}</h3>
						<p class="mb-4 text-sm">{$t('common.articles.no_articles_published')}</p>
						<Button variant="outline" href="/articles" size="sm">
							{$t('common.articles.view_all_articles')}
						</Button>
					</div>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					{#each latestArticles as article (article.id)}
						<div
							class="flex flex-col gap-6 border border-border bg-card p-6 transition-shadow hover:shadow-sm md:flex-row"
						>
							<div
								class="flex aspect-video w-full items-center justify-center overflow-hidden bg-muted md:aspect-square md:w-1/3"
							>
								{#if article.cover_url}
									<img
										src={article.cover_url}
										alt={article.title}
										class="h-full w-full object-cover"
									/>
								{:else}
									<span class="material-symbols-outlined text-5xl text-primary/30">inventory_2</span
									>
								{/if}
							</div>
							<div class="w-full md:w-2/3">
								<h3 class="mb-2 text-lg font-bold md:text-xl">{article.title}</h3>
								<div class="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
									<span class="material-symbols-outlined text-sm">calendar_today</span>
									<span>
										{article.published_at
											? formatDate(article.published_at)
											: formatDate(article.created_at)}
									</span>
								</div>
								<p class="mb-4 text-sm text-muted-foreground">
									{getExcerpt(article.content, 120)}
								</p>
								<a
									href="/articles/{article.slug}"
									class="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-primary transition-all hover:gap-2"
								>
									{$t('common.articles.read_more')}
									<span class="material-symbols-outlined text-sm">arrow_forward</span>
								</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<div class="mt-8 text-center">
				<Button href="/articles" size="lg" class="px-8 py-4 text-base shadow-md hover:shadow-lg">
					{$t('common.articles.browse_all')}
					<ChevronRight class="ml-2 h-5 w-5" />
				</Button>
			</div>
		</div>
	</div>
</div>
