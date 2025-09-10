<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { t } from '$lib/i18n';
	import { Users, Home, Mars, Venus, BarChart3 } from 'lucide-svelte';
	import { populationApi } from '$lib/api/population';
	import type { PopulationStats } from '@/types/population';

	let populationStats: PopulationStats | null = $state(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Chart data for shadcn-svelte charts
	let genderData: Array<{ gender: string; population: number; color: string }> = $state([]);
	let ageData: Array<{ ageGroup: string; population: number }> = $state([]);
	let hamletData: Array<{ hamlet: string; population: number; households: number }> = $state([]);

	function prepareChartData(stats: PopulationStats) {
		genderData = [
			{
				gender: $t('common.population.charts.male_label'),
				population: stats.genderDistribution.male,
				color: '#3B82F6'
			},
			{
				gender: $t('common.population.charts.female_label'),
				population: stats.genderDistribution.female,
				color: '#F97316'
			}
		];

		ageData = [
			{
				ageGroup: $t('common.population.age_groups.toddlers'),
				population: stats.ageDistribution.toddlers
			},
			{
				ageGroup: $t('common.population.age_groups.children'),
				population: stats.ageDistribution.children
			},
			{
				ageGroup: $t('common.population.age_groups.adults'),
				population: stats.ageDistribution.adults
			},
			{
				ageGroup: $t('common.population.age_groups.elderly'),
				population: stats.ageDistribution.elderly
			}
		];

		hamletData = stats.hamletData.map((hamlet, index) => ({
			hamlet: `RT ${String(index + 1).padStart(2, '0')}`,
			population: hamlet.population,
			households: hamlet.households
		}));
	}

	onMount(async () => {
		try {
			isLoading = true;
			error = null;

			const response = await populationApi.getPopulations();

			if (response?.data?.population && Array.isArray(response.data.population)) {
				populationStats = populationApi.processPopulationStats(response.data.population);
				prepareChartData(populationStats);
			} else {
				error = $t('common.population.no_data_available');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : $t('common.population.load_failed');
		} finally {
			isLoading = false;
		}
	});
</script>

<!-- Population Statistics Section -->
<section class="mt-24 w-full">
	<div class="mb-12 text-center">
		<div class="mb-4 flex justify-center">
			<div
				class="rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-3 dark:from-indigo-900/50 dark:to-purple-900/50"
			>
				<BarChart3 class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
			</div>
		</div>
		<h2 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
			{$t('common.population.title')}
		</h2>
		<p class="mx-auto max-w-3xl text-xl text-muted-foreground">
			{$t('common.population.subtitle')}
		</p>
	</div>

	{#if isLoading}
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			{#each Array(4) as i, index (index)}
				{void i}
				<Card class="animate-pulse">
					<CardHeader class="pb-4">
						<div class="mb-2 h-6 rounded bg-gray-200 dark:bg-gray-700"></div>
						<div class="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
					</CardHeader>
					<CardContent>
						<div class="h-16 rounded bg-gray-200 dark:bg-gray-700"></div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if error}
		<div class="py-12 text-center">
			<div
				class="mx-auto max-w-md rounded-2xl bg-red-50 p-8 text-red-800 dark:bg-red-900/50 dark:text-red-200"
			>
				<BarChart3 class="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
				<h3 class="mb-2 text-lg font-semibold">{$t('common.population.loading_failed')}</h3>
				<p class="mb-4 text-sm">{error}</p>
				<button
					class="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
					onclick={() => window.location.reload()}
				>
					{$t('common.population.try_again')}
				</button>
			</div>
		</div>
	{:else if populationStats}
		<div class="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<Card
				class="group overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:from-blue-950/30 dark:to-indigo-950/30"
			>
				<CardHeader class="pb-4">
					<div class="flex items-center justify-between">
						<div>
							<CardDescription class="text-sm font-medium text-blue-600 dark:text-blue-400">
								{$t('common.population.cards.total_population')}
							</CardDescription>
							<CardTitle class="text-3xl font-bold text-blue-700 dark:text-blue-300">
								{populationStats.totalPopulation.toLocaleString('id-ID')}
							</CardTitle>
						</div>
						<div
							class="rounded-xl bg-blue-100 p-3 transition-transform group-hover:scale-110 dark:bg-blue-900/50"
						>
							<Users class="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
				</CardHeader>
			</Card>

			<Card
				class="group overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:from-green-950/30 dark:to-emerald-950/30"
			>
				<CardHeader class="pb-4">
					<div class="flex items-center justify-between">
						<div>
							<CardDescription class="text-sm font-medium text-green-600 dark:text-green-400">
								{$t('common.population.cards.total_households')}
							</CardDescription>
							<CardTitle class="text-3xl font-bold text-green-700 dark:text-green-300">
								{populationStats.totalHouseholds.toLocaleString('id-ID')}
							</CardTitle>
						</div>
						<div
							class="rounded-xl bg-green-100 p-3 transition-transform group-hover:scale-110 dark:bg-green-900/50"
						>
							<Home class="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
					</div>
				</CardHeader>
			</Card>

			<Card
				class="group overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:from-purple-950/30 dark:to-pink-950/30"
			>
				<CardHeader class="pb-4">
					<div class="flex items-center justify-between">
						<div>
							<CardDescription class="text-sm font-medium text-purple-600 dark:text-purple-400">
								{$t('common.population.cards.male_population')}
							</CardDescription>
							<CardTitle class="text-3xl font-bold text-purple-700 dark:text-purple-300">
								{populationStats.genderDistribution.male.toLocaleString('id-ID')}
							</CardTitle>
						</div>
						<div
							class="rounded-xl bg-purple-100 p-3 transition-transform group-hover:scale-110 dark:bg-purple-900/50"
						>
							<Mars class="h-6 w-6 text-purple-600 dark:text-purple-400" />
						</div>
					</div>
				</CardHeader>
			</Card>

			<Card
				class="group overflow-hidden border-0 bg-gradient-to-br from-pink-50 to-rose-50 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:from-pink-950/30 dark:to-rose-950/30"
			>
				<CardHeader class="pb-4">
					<div class="flex items-center justify-between">
						<div>
							<CardDescription class="text-sm font-medium text-pink-600 dark:text-pink-400">
								{$t('common.population.cards.female_population')}
							</CardDescription>
							<CardTitle class="text-3xl font-bold text-pink-700 dark:text-pink-300">
								{populationStats.genderDistribution.female.toLocaleString('id-ID')}
							</CardTitle>
						</div>
						<div
							class="rounded-xl bg-pink-100 p-3 transition-transform group-hover:scale-110 dark:bg-pink-900/50"
						>
							<Venus class="h-6 w-6 text-pink-600 dark:text-pink-400" />
						</div>
					</div>
				</CardHeader>
			</Card>
		</div>

		<div class="grid gap-8 md:grid-cols-2">
			<Card class="overflow-hidden border-0 shadow-xl">
				<CardHeader>
					<CardTitle class="text-lg font-bold"
						>{$t('common.population.charts.total_population_chart')}</CardTitle
					>
				</CardHeader>
				<CardContent class="pb-6">
					<div class="relative flex h-[280px] flex-col">
						{#if hamletData && hamletData.length > 0}
							{@const maxPopulation = Math.max(...hamletData.map((d) => d.population))}
							<div class="flex flex-1 items-end justify-center gap-8 pb-8">
								{#each hamletData as item, index (item.hamlet)}
									{void index}
									{@const barHeight = (item.population / maxPopulation) * 180}
									<div class="group relative flex flex-col items-center gap-2">
										<span
											class="text-sm font-medium text-gray-700 transition-all group-hover:text-blue-600"
											>{item.population}</span
										>
										<div
											class="flex w-12 cursor-pointer items-end justify-center rounded-t bg-blue-500 transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:shadow-lg"
											style="height: {barHeight}px"
											title="{item.hamlet}: {item.population} {$t(
												'common.population.charts.people'
											)}, {item.households} {$t(
												'common.population.charts.households_label'
											).toLowerCase()}"
										>
											<div
												class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg bg-black px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
											>
												<div class="font-semibold">{item.hamlet}</div>
												<div>
													{$t('common.population.charts.population_label')}: {item.population}
												</div>
												<div>
													{$t('common.population.charts.households_label')}: {item.households}
												</div>
												<div
													class="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-black"
												></div>
											</div>
										</div>
										<span
											class="text-sm text-gray-600 transition-all group-hover:font-medium group-hover:text-blue-600"
											>{item.hamlet}</span
										>
									</div>
								{/each}
							</div>
						{:else}
							<div class="flex h-full items-center justify-center">
								<p class="text-muted-foreground">{$t('common.population.no_data')}</p>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>

			<Card class="overflow-hidden border-0 shadow-xl">
				<CardHeader>
					<CardTitle class="text-lg font-bold"
						>{$t('common.population.charts.gender_distribution')}</CardTitle
					>
				</CardHeader>
				<CardContent class="pb-6">
					<div class="flex h-[280px] items-center">
						{#if genderData && genderData.length > 0}
							{@const total = genderData[0].population + genderData[1].population}
							{@const malePercentage = (genderData[0].population / total) * 100}
							{@const femalePercentage = (genderData[1].population / total) * 100}

							<div class="flex w-full items-center gap-6">
								<div class="flex flex-1 justify-center">
									<div class="group relative">
										<svg width="160" height="160" viewBox="0 0 160 160" class="cursor-pointer">
											<circle
												cx="80"
												cy="80"
												r="60"
												fill="none"
												stroke="#e5e7eb"
												stroke-width="20"
											/>
											<circle
												cx="80"
												cy="80"
												r="60"
												fill="none"
												stroke="#3B82F6"
												stroke-width="20"
												stroke-dasharray="{(malePercentage / 100) * 377} 377"
												stroke-dashoffset="0"
												transform="rotate(-90 80 80)"
												class="transition-all duration-300 hover:stroke-[#2563EB] hover:drop-shadow-lg"
											/>
											<circle
												cx="80"
												cy="80"
												r="60"
												fill="none"
												stroke="#F97316"
												stroke-width="20"
												stroke-dasharray="{(femalePercentage / 100) * 377} 377"
												stroke-dashoffset="-{(malePercentage / 100) * 377}"
												transform="rotate(-90 80 80)"
												class="transition-all duration-300 hover:stroke-[#EA580C] hover:drop-shadow-lg"
											/>
											<text
												x="80"
												y="75"
												text-anchor="middle"
												class="fill-gray-700 text-lg font-bold"
											>
												{total}
											</text>
											<text x="80" y="90" text-anchor="middle" class="fill-gray-500 text-xs">
												{$t('common.population.charts.total_label')}
											</text>
										</svg>

										<div
											class="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 transform rounded-lg bg-black px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
										>
											<div class="font-semibold">
												{$t('common.population.charts.gender_distribution')}
											</div>
											<div>
												{$t('common.population.charts.male_label')}: {genderData[0].population} ({malePercentage.toFixed(
													1
												)}%)
											</div>
											<div>
												{$t('common.population.charts.female_label')}: {genderData[1].population} ({femalePercentage.toFixed(
													1
												)}%)
											</div>
											<div
												class="absolute bottom-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-b-black"
											></div>
										</div>
									</div>
								</div>

								<div class="space-y-3">
									{#each genderData as item, index (item.gender)}
										{void index}
										{@const percentage = ((item.population / total) * 100).toFixed(1)}
										<div
											class="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
										>
											<div
												class="h-4 w-4 rounded-full transition-transform group-hover:scale-110"
												style="background-color: {item.color}"
											></div>
											<div>
												<div
													class="text-sm font-medium transition-colors group-hover:text-blue-600"
												>
													{item.gender}: {item.population}
												</div>
												<div
													class="text-xs text-gray-500 transition-colors group-hover:text-blue-500"
												>
													{percentage}%
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="flex h-full w-full items-center justify-center">
								<p class="text-muted-foreground">{$t('common.population.no_data')}</p>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>

			<Card class="overflow-hidden border-0 shadow-xl">
				<CardHeader>
					<CardTitle class="text-lg font-bold"
						>{$t('common.population.charts.age_distribution')}</CardTitle
					>
				</CardHeader>
				<CardContent class="pb-6">
					<div class="h-[280px]">
						{#if ageData && ageData.length > 0}
							<div class="space-y-4 pt-4">
								{#each ageData as item, index (item.ageGroup)}
									{@const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
									{@const maxValue = Math.max(...ageData.map((d) => d.population))}
									{@const percentage = (item.population / maxValue) * 100}

									<div class="group space-y-2">
										<div class="flex items-center justify-between">
											<span class="text-sm font-medium transition-colors group-hover:text-blue-600"
												>{item.ageGroup}</span
											>
											<span
												class="text-sm text-gray-600 transition-colors group-hover:font-medium group-hover:text-blue-600"
												>{item.population}</span
											>
										</div>
										<div
											class="relative h-6 w-full cursor-pointer overflow-hidden rounded-full bg-gray-200"
										>
											<div
												class="relative h-6 rounded-full transition-all duration-500 hover:scale-y-110 hover:shadow-md"
												style="width: {percentage}%; background-color: {colors[index]}"
												title="{item.ageGroup}: {item.population} {$t(
													'common.population.charts.people'
												)}"
											>
												<div
													class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg bg-black px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
												>
													<div class="font-semibold">{item.ageGroup}</div>
													<div>
														{$t('common.population.charts.population_label')}: {item.population}
													</div>
													<div
														class="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-black"
													></div>
												</div>
											</div>
										</div>
									</div>
								{/each}

								<div class="grid grid-cols-2 gap-2 pt-4">
									{#each [$t('common.population.age_groups.toddlers'), $t('common.population.age_groups.children')] as label, i (label)}
										<div class="flex items-center gap-2">
											<div
												class="h-3 w-3 rounded"
												style="background-color: {i === 0 ? '#3B82F6' : '#10B981'}"
											></div>
											<span class="text-xs">{label}</span>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="flex h-full items-center justify-center">
								<p class="text-muted-foreground">{$t('common.population.no_data')}</p>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>

			<Card class="overflow-hidden border-0 shadow-xl">
				<CardHeader>
					<CardTitle class="text-lg font-bold"
						>{$t('common.population.charts.voting_rights')}</CardTitle
					>
				</CardHeader>
				<CardContent class="pb-6">
					<div class="h-[280px]">
						{#if hamletData && hamletData.length > 0}
							<div class="space-y-4 pt-4">
								{#each hamletData as item, index (item.hamlet)}
									{void index}
									{@const votersCount = Math.floor(item.population * 0.7)}
									{@const maxVoters = Math.max(
										...hamletData.map((d) => Math.floor(d.population * 0.7))
									)}
									{@const percentage = (votersCount / maxVoters) * 100}
									{@const blueVoters = Math.floor(votersCount * 0.6)}
									{@const orangeVoters = votersCount - blueVoters}

									<div class="group space-y-2">
										<div class="flex items-center justify-between">
											<span class="text-sm font-medium transition-colors group-hover:text-blue-600"
												>{item.hamlet}</span
											>
											<span
												class="text-sm text-gray-600 transition-colors group-hover:font-medium group-hover:text-blue-600"
												>{votersCount}</span
											>
										</div>
										<div
											class="relative h-6 w-full cursor-pointer overflow-hidden rounded-full bg-gray-200"
										>
											<div class="flex h-6 rounded-full">
												<div
													class="relative bg-blue-500 transition-all duration-500 hover:bg-blue-600"
													style="width: {percentage * 0.6}%"
													title="{$t('common.population.charts.blue_team')} {$t(
														'common.population.charts.voters_label'
													).toLowerCase()}: {blueVoters}"
												>
													<div
														class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg bg-black px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
													>
														<div class="font-semibold">
															{item.hamlet} - {$t('common.population.charts.blue_team')}
														</div>
														<div>{$t('common.population.charts.voters_label')}: {blueVoters}</div>
														<div
															class="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-black"
														></div>
													</div>
												</div>
												<div
													class="relative bg-orange-500 transition-all duration-500 hover:bg-orange-600"
													style="width: {percentage * 0.4}%"
													title="{$t('common.population.charts.orange_team')} {$t(
														'common.population.charts.voters_label'
													).toLowerCase()}: {orangeVoters}"
												>
													<div
														class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg bg-black px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
													>
														<div class="font-semibold">
															{item.hamlet} - {$t('common.population.charts.orange_team')}
														</div>
														<div>{$t('common.population.charts.voters_label')}: {orangeVoters}</div>
														<div
															class="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-black"
														></div>
													</div>
												</div>
											</div>
										</div>
									</div>
								{/each}

								<div class="flex justify-around pt-2 text-xs text-gray-600">
									<span>{$t('common.population.rt_labels.rt_01')}</span>
									<span>{$t('common.population.rt_labels.rt_03')}</span>
									<span>{$t('common.population.rt_labels.rt_04')}</span>
								</div>
							</div>
						{:else}
							<div class="flex h-full items-center justify-center">
								<p class="text-muted-foreground">{$t('common.population.no_data')}</p>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>
		</div>
	{:else}
		<div class="py-12 text-center">
			<div
				class="mx-auto max-w-md rounded-2xl bg-gray-50 p-8 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400"
			>
				<BarChart3 class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
				<h3 class="mb-2 text-lg font-semibold">{$t('common.population.no_data')}</h3>
				<p class="text-sm">{$t('common.population.no_data_description')}</p>
			</div>
		</div>
	{/if}
</section>
