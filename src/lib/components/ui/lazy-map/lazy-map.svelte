<script lang="ts">
	import { onMount } from 'svelte';
	import { Map } from 'lucide-svelte';

	export let googleMapsEmbedUrl: string;
	export let title: string = 'Map';

	let mapContainer: HTMLDivElement;
	let isVisible = false;
	let isLoaded = false;

	onMount(() => {
		// Use Intersection Observer for better performance
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !isLoaded) {
						isVisible = true;
						isLoaded = true;
						observer.disconnect();
					}
				});
			},
			{
				rootMargin: '50px' // Load 50px before entering viewport
			}
		);

		if (mapContainer) {
			observer.observe(mapContainer);
		}

		return () => {
			observer.disconnect();
		};
	});
</script>

<div
	bind:this={mapContainer}
	class="group relative aspect-video w-full overflow-hidden bg-muted xl:aspect-[4/3] 2xl:aspect-video"
>
	{#if !isVisible}
		<!-- Loading placeholder -->
		<div
			class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
		>
			<div class="text-center">
				<Map class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading map...</p>
			</div>
		</div>
	{:else}
		<!-- Map Loading Skeleton -->
		<div
			class="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
		></div>

		<!-- Map Iframe -->
		<iframe
			src={googleMapsEmbedUrl}
			width="100%"
			height="100%"
			style="border:0;"
			allowfullscreen={true}
			loading="lazy"
			referrerpolicy="no-referrer-when-downgrade"
			{title}
			class="absolute inset-0 opacity-100 transition-opacity duration-500"
		></iframe>

		<!-- Map Overlay -->
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
		></div>

		<!-- Map Badge -->
		<div
			class="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 shadow-lg backdrop-blur-sm dark:bg-gray-900/90 dark:text-white"
		>
			<div class="flex items-center gap-2">
				<div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
				Live Map
			</div>
		</div>
	{/if}
</div>
