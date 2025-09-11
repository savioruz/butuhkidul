<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { LazyMap } from '$lib/components/ui/lazy-map';
	import LazyPopulationStatistics from '$lib/components/pages/population/lazy-population-statistics.svelte';
	import { t } from '$lib/i18n';
	import {
		ChevronRight,
		MapPin,
		Users,
		Leaf,
		Calendar,
		Building2,
		Map,
		Navigation
	} from 'lucide-svelte';
	import type { Village, VillagesResponse } from '@/types/village';
	import type { Article, ArticlesResponse } from '@/types/article';
	import { getExcerpt } from '$lib/utils/markdown';

	// Accept server-side loaded data using $props()
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

	// Set up reactive state with initial server-side data
	let villageData = $state(initialVillageData);
	let articlesData = $state(initialArticlesData);
	let error = $state(initialVillageError);
	let articlesError = $state(initialArticlesError);

	// Set loading states to false since data is already loaded server-side
	let isLoading = $state(false);
	let isLoadingArticles = $state(false);

	let primaryVillage: Village | null = $state(null);
	let latestArticles: Article[] = $state([]);

	const googleMapsEmbedUrl =
		'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.3039250239203!2d110.27576072573447!3d-7.863228978172313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7af921ec0e2b1f%3A0x8ea440c9c9a1a377!2sButuh%20Kidul%2C%20Triwidadi%2C%20Pajangan%2C%20Bantul%20Regency%2C%20Special%20Region%20of%20Yogyakarta!5e0!3m2!1sen!2sid!4v1757404961400!5m2!1sen!2sid';

	function getGoogleMapsLink(): string {
		return `https://www.google.com/maps/place/Butuh+Kidul,+Triwidadi,+Pajangan,+Bantul+Regency,+Special+Region+of+Yogyakarta/@-7.863229,110.275761,17z`;
	}

	const villageCoordinates = {
		latitude: -7.863229,
		longitude: 110.275761
	};

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

	$effect(() => {
		if (villageData?.data?.villages && villageData.data.villages.length > 0) {
			primaryVillage = villageData.data.villages[0];
		} else {
			primaryVillage = null;
		}
	});

	$effect(() => {
		if (articlesData?.data?.articles) {
			latestArticles = articlesData.data.articles.slice(0, 3);
		} else {
			latestArticles = [];
		}
	});

	// Update reactive data when props change (for potential client-side navigation)
	$effect(() => {
		villageData = initialVillageData;
		articlesData = initialArticlesData;
		error = initialVillageError;
		articlesError = initialArticlesError;
	});
</script>

<!-- 1. Hero Section -->
<section class="relative w-full">
	<!-- Hero Background -->
	<div
		class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-blue-950/30"
	>
		<div
			class="bg-grid-slate-100 dark:bg-grid-slate-700/25 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"
		></div>

		<div
			class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-green-400/20 to-blue-400/20 blur-3xl"
		></div>
		<div
			class="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-400/20 to-cyan-400/20 blur-3xl"
		></div>

		<div class="relative px-6 py-20 sm:px-12 sm:py-24 lg:px-16 lg:py-32">
			<div class="mx-auto max-w-5xl text-center">
				<div class="mb-8 flex justify-center">
					<div class="relative">
						<div class="absolute inset-0 animate-pulse rounded-full bg-green-500/20 blur-2xl"></div>
						<div
							class="relative rounded-full bg-gradient-to-br from-green-100 to-emerald-100 p-6 shadow-2xl dark:from-green-900/50 dark:to-emerald-900/50"
						>
							<MapPin class="h-12 w-12 text-green-600 dark:text-green-400" />
						</div>
					</div>
				</div>

				<!-- Main Heading -->
				<h1
					class="mb-8 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl"
				>
					{$t('common.hero.welcome')}
					<br class="hidden sm:block" />
					<span
						class="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent"
					>
						{isLoading
							? $t('common.loading')
							: (primaryVillage?.name ?? $t('common.hero.village_name'))}
					</span>
				</h1>

				<!-- Subtitle -->
				<p
					class="mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-muted-foreground sm:text-2xl lg:text-3xl"
				>
					{isLoading
						? $t('common.loading') + '...'
						: (primaryVillage?.address ?? $t('common.hero.subtitle'))}
				</p>

				<!-- Error Message -->
				{#if error}
					<div
						class="mb-8 rounded-2xl bg-red-50 p-6 text-red-800 dark:bg-red-900/50 dark:text-red-200"
					>
						{error}
					</div>
				{/if}

				<!-- CTA Buttons -->
				<div class="flex flex-col items-center justify-center gap-6 sm:flex-row">
					<Button
						size="lg"
						href="#statistics"
						class="group px-8 py-4 text-lg shadow-xl hover:shadow-2xl"
						disabled={isLoading}
						aria-label="Explore population statistics and demographics of Butuh Kidul village"
					>
						{$t('common.hero.explore_button')}
						<ChevronRight class="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Button>
					<Button
						variant="outline"
						size="lg"
						href="/histories"
						class="px-8 py-4 text-lg shadow-lg hover:shadow-xl"
						disabled={isLoading}
						aria-label="Learn more about Butuh Kidul village history and heritage"
					>
						{$t('common.hero.learn_more')}
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- 2. Statistics Section -->
<section id="statistics" class="mt-16 w-full">
	<LazyPopulationStatistics />
</section>
<!-- 4. Location Section -->
{#if primaryVillage}
	<section id="location" class="mt-16 w-full">
		<Card
			class="overflow-hidden border-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 shadow-2xl dark:from-green-950/20 dark:to-blue-950/20"
		>
			<CardHeader class="pb-8">
				<div class="flex flex-col items-center gap-6 text-center">
					<div class="space-y-4">
						<div class="flex justify-center">
							<div class="relative">
								<div class="absolute inset-0 rounded-xl bg-green-500/20 blur-xl"></div>
								<div
									class="relative rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-4 dark:from-green-900/50 dark:to-emerald-900/50"
								>
									<Map class="h-8 w-8 text-green-600 lg:h-10 lg:w-10 dark:text-green-400" />
								</div>
							</div>
						</div>
						<CardTitle class="text-3xl font-bold lg:text-4xl">
							<span
								class="bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent dark:from-green-400 dark:to-blue-400"
							>
								{$t('common.location.title')}
							</span>
						</CardTitle>
						<CardDescription class="text-lg text-muted-foreground lg:text-xl">
							{$t('common.location.subtitle')}
						</CardDescription>
					</div>
					<div class="flex gap-3">
						<Button
							variant="outline"
							size="lg"
							onclick={() => window.open(getGoogleMapsLink(), '_blank')}
							class="group border-green-200 bg-white/80 backdrop-blur-sm transition-all hover:border-green-300 hover:bg-green-50 hover:shadow-lg dark:border-green-800 dark:bg-green-950/50 dark:hover:bg-green-900/50"
							aria-label="Open Butuh Kidul village location in Google Maps"
						>
							<Navigation class="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
							{$t('common.location.open_maps')}
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent class="p-0">
				<div class="grid gap-0 xl:grid-cols-3">
					<!-- Map Container -->
					<div class="xl:col-span-2">
						<LazyMap {googleMapsEmbedUrl} title="Butuh Kidul Village Location Map" />
					</div>

					<!-- Enhanced Location Info -->
					<div
						class="bg-gradient-to-b from-white/50 to-gray-50/50 p-8 xl:col-span-1 dark:from-gray-900/50 dark:to-gray-950/50"
					>
						<div class="space-y-8">
							<!-- Village Information -->
							<div class="space-y-6">
								<div class="flex items-center gap-3">
									<div
										class="h-8 w-1 rounded-full bg-gradient-to-b from-green-500 to-blue-500"
									></div>
									<h3 class="text-xl font-bold text-foreground">
										{$t('common.location.village_info')}
									</h3>
								</div>

								<div class="space-y-5">
									<!-- Village Name & Address -->
									<div
										class="group rounded-xl bg-white/80 p-5 shadow-sm transition-all hover:shadow-md dark:bg-gray-900/80"
									>
										<div class="flex items-start gap-4">
											<div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/50">
												<MapPin class="h-5 w-5 text-green-600 dark:text-green-400" />
											</div>
											<div class="flex-1 space-y-1">
												<p class="text-lg font-semibold text-foreground">{primaryVillage.name}</p>
												<p class="text-sm leading-relaxed text-muted-foreground">
													{primaryVillage.address}
												</p>
											</div>
										</div>
									</div>

									<!-- Coordinates -->
									<div
										class="group rounded-xl bg-white/80 p-5 shadow-sm transition-all hover:shadow-md dark:bg-gray-900/80"
									>
										<div class="flex items-start gap-4">
											<div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50">
												<div
													class="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"
												></div>
											</div>
											<div class="flex-1 space-y-1">
												<p class="text-sm font-semibold text-foreground">
													{$t('common.location.coordinates')}
												</p>
												<p class="font-mono text-sm text-muted-foreground">
													{villageCoordinates.latitude.toFixed(6)}, {villageCoordinates.longitude.toFixed(
														6
													)}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- Quick Actions -->
							<div class="space-y-6">
								<div class="flex items-center gap-3">
									<div
										class="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"
									></div>
									<h4 class="text-lg font-bold text-foreground">
										{$t('common.location.quick_actions')}
									</h4>
								</div>

								<div class="space-y-3">
									<Button
										variant="outline"
										size="lg"
										onclick={() => window.open(getGoogleMapsLink(), '_blank')}
										class="group w-full justify-start gap-3 border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 py-6 transition-all hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 hover:shadow-lg dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50"
										aria-label="Get directions to Butuh Kidul village via Google Maps"
									>
										<div
											class="rounded-lg bg-blue-100 p-2 transition-transform group-hover:scale-110 dark:bg-blue-900/50"
										>
											<Navigation class="h-5 w-5 text-blue-600 dark:text-blue-400" />
										</div>
										<div class="text-left">
											<p class="font-semibold">{$t('common.location.get_directions')}</p>
											<p class="text-xs text-muted-foreground">Open in Google Maps</p>
										</div>
									</Button>

									<Button
										variant="outline"
										size="lg"
										onclick={() => {
											navigator.clipboard?.writeText(
												`${villageCoordinates.latitude}, ${villageCoordinates.longitude}`
											);
										}}
										class="group w-full justify-start gap-3 border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50 py-6 transition-all hover:border-purple-300 hover:from-purple-100 hover:to-pink-100 hover:shadow-lg dark:border-purple-800 dark:from-purple-950/30 dark:to-pink-950/30 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50"
										aria-label="Copy Butuh Kidul village GPS coordinates to clipboard"
									>
										<div
											class="rounded-lg bg-purple-100 p-2 transition-transform group-hover:scale-110 dark:bg-purple-900/50"
										>
											<MapPin class="h-5 w-5 text-purple-600 dark:text-purple-400" />
										</div>
										<div class="text-left">
											<p class="font-semibold">{$t('common.location.copy_coordinates')}</p>
											<p class="text-xs text-muted-foreground">Copy to clipboard</p>
										</div>
									</Button>
								</div>
							</div>

							<!-- Additional Info -->
							<div
								class="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-5 dark:from-green-950/30 dark:to-emerald-950/30"
							>
								<div class="flex items-start gap-3">
									<div class="rounded-full bg-green-100 p-1 dark:bg-green-900/50">
										<div class="h-3 w-3 rounded-full bg-green-500"></div>
									</div>
									<div>
										<p class="text-sm font-medium text-green-800 dark:text-green-200">
											Real-time Location
										</p>
										<p class="text-xs text-green-600 dark:text-green-400">
											GPS coordinates verified
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</section>
{/if}

<!-- 3. Explore Section -->
<section id="explore" class="mt-16 w-full">
	<!-- Section Header -->
	<div class="mb-12 text-center">
		<div
			class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50"
		>
			<Building2 class="h-8 w-8 text-blue-600 dark:text-blue-400" />
		</div>
		<h2 class="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
			{$t('common.features.title')}
		</h2>
		<p class="mx-auto max-w-3xl text-xl text-muted-foreground">
			{$t('common.features.subtitle')}
		</p>
	</div>

	<!-- Features Grid -->
	<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
		<!-- Community Feature -->
		<Card
			class="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-blue-950/30 dark:to-indigo-950/30"
		>
			<div
				class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity group-hover:opacity-100"
			></div>
			<CardHeader class="relative pt-8 pb-6">
				<div class="mb-4 flex justify-center">
					<div
						class="rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-4 shadow-lg dark:from-blue-900/50 dark:to-indigo-900/50"
					>
						<Users class="h-8 w-8 text-blue-600 dark:text-blue-400" />
					</div>
				</div>
				<CardTitle class="text-center text-2xl font-bold">
					{$t('common.features.community.title')}
				</CardTitle>
			</CardHeader>
			<CardContent class="relative text-center">
				<CardDescription class="text-lg leading-relaxed">
					{$t('common.features.community.description')}
				</CardDescription>
			</CardContent>
		</Card>

		<!-- Environment Feature -->
		<Card
			class="group relative overflow-hidden border-0 bg-gradient-to-br from-green-50/80 to-emerald-50/80 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-green-950/30 dark:to-emerald-950/30"
		>
			<div
				class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 transition-opacity group-hover:opacity-100"
			></div>
			<CardHeader class="relative pt-8 pb-6">
				<div class="mb-4 flex justify-center">
					<div
						class="rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 p-4 shadow-lg dark:from-green-900/50 dark:to-emerald-900/50"
					>
						<Leaf class="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
				</div>
				<CardTitle class="text-center text-2xl font-bold">
					{$t('common.features.environment.title')}
				</CardTitle>
			</CardHeader>
			<CardContent class="relative text-center">
				<CardDescription class="text-lg leading-relaxed">
					{$t('common.features.environment.description')}
				</CardDescription>
			</CardContent>
		</Card>

		<!-- Services Feature -->
		<Card
			class="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50/80 to-pink-50/80 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:col-span-2 lg:col-span-1 dark:from-purple-950/30 dark:to-pink-950/30"
		>
			<div
				class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity group-hover:opacity-100"
			></div>
			<CardHeader class="relative pt-8 pb-6">
				<div class="mb-4 flex justify-center">
					<div
						class="rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-4 shadow-lg dark:from-purple-900/50 dark:to-pink-900/50"
					>
						<Building2 class="h-8 w-8 text-purple-600 dark:text-purple-400" />
					</div>
				</div>
				<CardTitle class="text-center text-2xl font-bold">
					{$t('common.features.services.title')}
				</CardTitle>
			</CardHeader>
			<CardContent class="relative text-center">
				<CardDescription class="text-lg leading-relaxed">
					{$t('common.features.services.description')}
				</CardDescription>
			</CardContent>
		</Card>
	</div>

	<!-- Latest Articles Preview -->
	<div class="mt-16">
		<!-- Articles Header -->
		<div class="mb-12 text-center">
			<div class="mb-4 flex justify-center">
				<div
					class="rounded-full bg-gradient-to-br from-orange-100 to-red-100 p-3 dark:from-orange-900/50 dark:to-red-900/50"
				>
					<Calendar class="h-6 w-6 text-orange-600 dark:text-orange-400" />
				</div>
			</div>
			<h3 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
				{$t('common.articles.title')}
			</h3>
			<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
				{$t('common.articles.subtitle')}
			</p>
		</div>

		<!-- Articles Loading State -->
		{#if isLoadingArticles}
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each Array(3) as i, index (index)}
					{void i}
					<Card class="animate-pulse overflow-hidden border-0 shadow-xl">
						<div
							class="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
						></div>
						<CardHeader class="pb-4">
							<div class="mb-2 h-6 rounded bg-gray-200 dark:bg-gray-700"></div>
							<div class="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								<div class="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
								<div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{:else if articlesError}
			<!-- Articles Error State -->
			<div class="py-12 text-center">
				<div
					class="mx-auto max-w-md rounded-2xl bg-red-50 p-8 text-red-800 dark:bg-red-900/50 dark:text-red-200"
				>
					<Calendar class="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
					<h4 class="mb-2 text-lg font-semibold">{$t('common.articles.error_loading')}</h4>
					<p class="mb-4 text-sm">{articlesError}</p>
					<Button
						variant="outline"
						size="sm"
						onclick={() => window.location.reload()}
						aria-label="Try again to reload articles from Butuh Kidul village"
					>
						{$t('common.articles.try_again')}
					</Button>
				</div>
			</div>
		{:else if latestArticles.length === 0}
			<!-- No Articles State -->
			<div class="py-12 text-center">
				<div
					class="mx-auto max-w-md rounded-2xl bg-gray-50 p-8 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400"
				>
					<Calendar class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
					<h4 class="mb-2 text-lg font-semibold">{$t('common.articles.no_articles_found')}</h4>
					<p class="mb-4 text-sm">{$t('common.articles.no_articles_published')}</p>
					<Button
						variant="outline"
						href="/articles"
						size="sm"
						aria-label="View all articles page for Butuh Kidul village"
					>
						{$t('common.articles.view_all_articles')}
					</Button>
				</div>
			</div>
		{:else}
			<!-- Articles Grid with Real Data -->
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each latestArticles as article, index (article.id)}
					{@const gradients = [
						'from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30',
						'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
						'from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30'
					]}
					{@const iconColors = [
						'text-purple-500 dark:text-purple-400',
						'text-green-500 dark:text-green-400',
						'text-orange-500 dark:text-orange-400'
					]}
					{@const icons = [Building2, Leaf, Users]}
					{@const IconComponent = icons[index % icons.length]}

					<Card
						class="group overflow-hidden border-0 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl {index ===
							2 && latestArticles.length === 3
							? 'sm:col-span-2 lg:col-span-1'
							: ''}"
					>
						<!-- Article Cover -->
						<div
							class="relative aspect-video overflow-hidden bg-gradient-to-br {gradients[
								index % gradients.length
							]}"
						>
							{#if article.cover_url}
								<img
									src={article.cover_url}
									alt={article.title}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
									loading="lazy"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
								></div>
							{:else}
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
								></div>
								<div class="flex h-full items-center justify-center">
									<IconComponent
										class="h-16 w-16 {iconColors[
											index % iconColors.length
										]} transition-transform group-hover:scale-110"
									/>
								</div>
							{/if}
						</div>

						<!-- Article Content -->
						<CardHeader class="pb-4">
							<CardTitle class="line-clamp-2 text-xl transition-colors group-hover:text-primary">
								<a
									href="/articles/{article.slug}"
									class="hover:underline"
									aria-label="Read article: {article.title}"
								>
									{article.title}
								</a>
							</CardTitle>
							<div class="flex items-center gap-2 text-sm text-muted-foreground">
								<Calendar class="h-4 w-4" />
								<span>
									{article.published_at
										? formatDate(article.published_at)
										: formatDate(article.created_at)}
								</span>
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription class="line-clamp-3 text-base leading-relaxed">
								{getExcerpt(article.content, 150)}
							</CardDescription>
							{#if article.content.length > 150}
								<div class="mt-3">
									<Button
										variant="ghost"
										href="/articles/{article.slug}"
										size="sm"
										class="h-auto p-0 text-xs text-primary hover:underline"
										aria-label="Read more about: {article.title}"
									>
										{$t('common.articles.read_more')}
										<ChevronRight class="ml-1 h-3 w-3" />
									</Button>
								</div>
							{/if}
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}

		<!-- Browse All CTA -->
		<div class="mt-12 text-center">
			<Button
				href="/articles"
				size="lg"
				class="group px-8 py-4 text-lg shadow-xl hover:shadow-2xl"
				aria-label="Browse all articles about Butuh Kidul village"
			>
				{$t('common.articles.browse_all')}
				<ChevronRight class="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
			</Button>
		</div>
	</div>
</section>
