<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Users } from 'lucide-svelte';
	import type { Component } from 'svelte';

	let container: HTMLDivElement;
	let isVisible = false;
	let PopulationStatistics: Component | null = null;

	onMount(() => {
		// Use Intersection Observer for lazy loading
		const observer = new IntersectionObserver(
			async (entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting && !isVisible) {
						isVisible = true;

						// Dynamically import the actual component
						const module = await import('./population-statistics.svelte');
						PopulationStatistics = module.default;

						observer.disconnect();
						break;
					}
				}
			},
			{
				rootMargin: '100px' // Load 100px before entering viewport
			}
		);

		if (container) {
			observer.observe(container);
		}

		return () => {
			observer.disconnect();
		};
	});
</script>

<div bind:this={container}>
	{#if !isVisible || !PopulationStatistics}
		<!-- Loading placeholder -->
		<section class="mt-16 w-full">
			<Card
				class="animate-pulse border-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 shadow-2xl dark:from-blue-950/20 dark:to-purple-950/20"
			>
				<CardHeader class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50"
					>
						<Users class="h-8 w-8 text-blue-600 dark:text-blue-400" />
					</div>
					<CardTitle class="text-4xl font-bold">Loading Statistics...</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{#each Array(4) as i, index (index)}
							{void i}
							<div class="rounded-xl bg-white/50 p-6 dark:bg-gray-900/50">
								<div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
								<div class="mt-2 h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		</section>
	{:else}
		<svelte:component this={PopulationStatistics} />
	{/if}
</div>
