<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { t } from '$lib/i18n';
	import { Heart, Calendar, User } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { villageApi } from '$lib/api/village';
	import type { VillageHistory, VillageHistoryResponse } from '@/types/village';
	import { parseMarkdown } from '@/utils/markdown';

	let villageHistory: VillageHistoryResponse | null = $state(null);
	let histories: VillageHistory[] = $state([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		if (villageHistory?.data?.village_histories) {
			histories = villageHistory.data.village_histories;
		} else {
			histories = [];
		}
	});

	onMount(async () => {
		try {
			isLoading = true;
			error = null;
			villageHistory = await villageApi.getVillageHistory();
		} catch (err) {
			console.error('Error fetching village history:', err);
			error = err instanceof Error ? err.message : 'Failed to load village history';
		} finally {
			isLoading = false;
		}
	});

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{$t('navigation.histories')} - {$t('common.hero.village_name')}</title>
	<meta name="description" content={$t('common.history.meta_description')} />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header Section -->
	<div class="mb-8">
		<div class="text-center">
			<div class="mb-4 flex justify-center">
				<div class="rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
					<Heart class="h-8 w-8 text-amber-600 dark:text-amber-400" />
				</div>
			</div>
			<h1 class="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
				{$t('common.history.title')}
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-300">
				{$t('common.history.subtitle')}
			</p>
		</div>
	</div>

	<!-- Loading State -->
	{#if isLoading}
		<div class="grid gap-6">
			{#each Array(3) as item, index (index)}
				{void item}
				<Card class="overflow-hidden">
					<CardHeader>
						<div class="flex items-start justify-between">
							<div class="h-6 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
							<div class="flex items-center gap-2">
								<div class="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
								<div class="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
							</div>
						</div>
						<div class="mt-2 flex items-center gap-2">
							<div class="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
							<div class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
						</div>
					</CardHeader>
					<CardContent class="space-y-6">
						<div class="flex justify-center">
							<div class="h-64 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
						</div>
						<div class="space-y-3">
							{#each Array(4) as line, lineIndex (lineIndex)}
								{void line}
								<div class="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
							{/each}
							<div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if error}
		<!-- Error State -->
		<Card class="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/50">
			<CardContent class="pt-6">
				<div class="text-center">
					<p class="text-red-800 dark:text-red-200">{error}</p>
					<Button variant="outline" class="mt-4" onclick={() => window.location.reload()}>
						{$t('common.retry')}
					</Button>
				</div>
			</CardContent>
		</Card>
	{:else if histories.length === 0}
		<!-- Empty State -->
		<Card>
			<CardContent class="pt-6">
				<div class="text-center">
					<Heart class="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<p class="text-gray-600 dark:text-gray-300">
						{$t('common.history.no_history')}
					</p>
				</div>
			</CardContent>
		</Card>
	{:else}
		<!-- History Content -->
		<div class="grid gap-8">
			{#each histories as history (history.id)}
				<Card class="overflow-hidden">
					<CardHeader>
						<CardTitle class="flex items-start justify-between">
							<span>{$t('common.history.entry_title')}</span>
							<div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
								<Calendar class="h-4 w-4" />
								{formatDate(history.created_at)}
							</div>
						</CardTitle>
						{#if history.modified_by}
							<div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
								<User class="h-4 w-4" />
								{history.modified_by}
							</div>
						{/if}
					</CardHeader>
					<CardContent class="space-y-6">
						{#if history.image_url}
							<div class="flex justify-center">
								<img
									src={history.image_url}
									alt="Village History"
									class="max-h-96 w-full rounded-lg object-cover shadow-md"
								/>
							</div>
						{/if}
						<div class="prose">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html parseMarkdown(history.description ?? $t('common.history.default_message'))}
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>
