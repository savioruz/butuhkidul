<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronUp } from 'lucide-svelte';

	let isVisible = $state(false);
	let scrollY = $state(0);

	// Show button when user scrolls down 300px
	const showThreshold = 300;

	onMount(() => {
		const updateScrollY = () => {
			scrollY = window.scrollY;
			isVisible = scrollY > showThreshold;
		};

		// Initial check
		updateScrollY();

		// Listen for scroll events
		window.addEventListener('scroll', updateScrollY);

		// Cleanup
		return () => {
			window.removeEventListener('scroll', updateScrollY);
		};
	});

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}
</script>

{#if isVisible}
	<button
		onclick={scrollToTop}
		class="fixed right-6 bottom-6 z-50 transform rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:bg-primary/90 hover:shadow-xl focus:ring-4 focus:ring-primary/25 focus:outline-none"
		aria-label="Scroll to top"
		title="Kembali ke atas"
	>
		<ChevronUp class="h-6 w-6" />
	</button>
{/if}

<style>
	button {
		backdrop-filter: blur(10px);
		animation: fadeInUp 0.3s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
