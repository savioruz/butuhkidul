<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { t } from '$lib/i18n';
	import { ChevronRight, MapPin, Users, Leaf, Calendar, Building2 } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { villageApi } from '$lib/api/village';
	import type { Village, VillagesResponse } from '@/types/village';
	import { marked } from 'marked';

	// Reactive village data state
	let villageData: VillagesResponse | null = $state(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Computed state using effects
	let primaryVillage: Village | null = $state(null);

	// Configure marked options
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	// Update primaryVillage when villageData changes
	$effect(() => {
		if (villageData?.data?.villages && villageData.data.villages.length > 0) {
			primaryVillage = villageData.data.villages[0];
		} else {
			primaryVillage = null;
		}
	});

	// Fetch village data on component mount
	onMount(async () => {
		try {
			isLoading = true;
			error = null;

			// Fetch villages
			const villagesResponse = await villageApi.getVillages();
			villageData = villagesResponse;
		} catch (err) {
			console.error('Error fetching village data:', err);
			error = err instanceof Error ? err.message : 'Failed to load village data';
		} finally {
			isLoading = false;
		}
	});
</script>

<!-- Hero Section -->
<section class="relative w-full">
	<!-- Hero Background -->
	<div
		class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-blue-50 to-green-100 dark:from-green-950 dark:via-blue-950 dark:to-green-900"
	>
		<!-- Background Pattern -->
		<div
			class="bg-grid-slate-100 dark:bg-grid-slate-700/25 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"
		></div>

		<!-- Content Container -->
		<div class="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
			<div class="mx-auto max-w-4xl text-center">
				<!-- Village Icon/Logo -->
				<div class="mb-6 flex justify-center">
					<div class="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
						<MapPin class="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
				</div>

				<!-- Main Heading -->
				<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
					{$t('common.hero.welcome')}
					<span class="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
						{isLoading
							? $t('common.loading')
							: (primaryVillage?.name ?? $t('common.hero.village_name'))}
					</span>
				</h1>

				<!-- Subtitle -->
				<p class="mb-8 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
					{isLoading
						? $t('common.loading') + '...'
						: (primaryVillage?.address ?? $t('common.hero.subtitle'))}
				</p>

				<!-- Error Message -->
				{#if error}
					<div
						class="mb-6 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/50 dark:text-red-200"
					>
						{error}
					</div>
				{/if}

				<!-- CTA Buttons -->
				<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button size="lg" class="group" disabled={isLoading}>
						{$t('common.hero.explore_button')}
						<ChevronRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Button>
					<Button variant="outline" size="lg" disabled={isLoading}>
						{$t('common.hero.learn_more')}
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Village Features Section -->
<section class="mt-12 w-full">
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<!-- Community Feature -->
		<Card class="group transition-all hover:shadow-md">
			<CardHeader>
				<CardTitle class="flex items-center gap-3">
					<div class="rounded-lg bg-primary/10 p-2">
						<Users class="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
					{$t('common.features.community.title')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>
					{$t('common.features.community.description')}
				</CardDescription>
			</CardContent>
		</Card>

		<!-- Environment Feature -->
		<Card class="group transition-all hover:shadow-md">
			<CardHeader>
				<CardTitle class="flex items-center gap-3">
					<div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
						<Leaf class="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
					{$t('common.features.environment.title')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>
					{$t('common.features.environment.description')}
				</CardDescription>
			</CardContent>
		</Card>

		<!-- Services Feature -->
		<Card class="group transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
			<CardHeader>
				<CardTitle class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
						<Building2 class="h-5 w-5 text-purple-600 dark:text-purple-400" />
					</div>
					{$t('common.features.services.title')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>
					{$t('common.features.services.description')}
				</CardDescription>
			</CardContent>
		</Card>
	</div>
</section>

<!-- Latest Articles Preview Section -->
<section class="mt-12 w-full">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{$t('common.articles.title')}</h2>
			<p class="text-muted-foreground">{$t('common.articles.subtitle')}</p>
		</div>
		<Button variant="outline" href="/articles">
			{$t('common.articles.view_all')}
			<ChevronRight class="ml-1 h-4 w-4" />
		</Button>
	</div>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<!-- Article Card 1 -->
		<Card class="group overflow-hidden transition-all hover:shadow-lg">
			<div
				class="aspect-video overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30"
			>
				<div class="flex h-full items-center justify-center">
					<Building2 class="h-12 w-12 text-purple-500 dark:text-purple-400" />
				</div>
			</div>
			<CardHeader>
				<CardTitle class="line-clamp-2 transition-colors group-hover:text-primary">
					{$t('common.articles.sample1.title')}
				</CardTitle>
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Calendar class="h-4 w-4" />
					<span>{$t('common.articles.sample1.date')}</span>
				</div>
			</CardHeader>
			<CardContent>
				<CardDescription class="line-clamp-3">
					{$t('common.articles.sample1.description')}
				</CardDescription>
			</CardContent>
		</Card>

		<!-- Article Card 2 -->
		<Card class="group overflow-hidden transition-all hover:shadow-lg">
			<div
				class="aspect-video overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30"
			>
				<div class="flex h-full items-center justify-center">
					<Leaf class="h-12 w-12 text-green-500 dark:text-green-400" />
				</div>
			</div>
			<CardHeader>
				<CardTitle class="line-clamp-2 transition-colors group-hover:text-primary">
					{$t('common.articles.sample2.title')}
				</CardTitle>
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Calendar class="h-4 w-4" />
					<span>{$t('common.articles.sample2.date')}</span>
				</div>
			</CardHeader>
			<CardContent>
				<CardDescription class="line-clamp-3">
					{$t('common.articles.sample2.description')}
				</CardDescription>
			</CardContent>
		</Card>

		<!-- Article Card 3 -->
		<Card class="group overflow-hidden transition-all hover:shadow-lg sm:col-span-2 lg:col-span-1">
			<div
				class="aspect-video overflow-hidden bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30"
			>
				<div class="flex h-full items-center justify-center">
					<Users class="h-12 w-12 text-orange-500 dark:text-orange-400" />
				</div>
			</div>
			<CardHeader>
				<CardTitle class="line-clamp-2 transition-colors group-hover:text-primary">
					{$t('common.articles.sample3.title')}
				</CardTitle>
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Calendar class="h-4 w-4" />
					<span>{$t('common.articles.sample3.date')}</span>
				</div>
			</CardHeader>
			<CardContent>
				<CardDescription class="line-clamp-3">
					{$t('common.articles.sample3.description')}
				</CardDescription>
			</CardContent>
		</Card>
	</div>

	<div class="mt-6 text-center">
		<Button href="/articles" size="lg" class="group">
			{$t('common.articles.browse_all')}
			<ChevronRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
		</Button>
	</div>
</section>
