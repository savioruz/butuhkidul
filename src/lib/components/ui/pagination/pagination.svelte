<script lang="ts">
	import { Button } from '../button';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	export let currentPage: number = 1;
	export let totalPages: number = 1;
	export let onPageChange: (page: number) => void = () => {};
	export let showFirstLast: boolean = true;
	export let maxVisiblePages: number = 5;

	$: visiblePages = getVisiblePages(currentPage, totalPages, maxVisiblePages);

	function getVisiblePages(current: number, total: number, max: number): number[] {
		if (total <= max) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		const half = Math.floor(max / 2);
		let start = Math.max(1, current - half);
		let end = Math.min(total, start + max - 1);

		if (end - start < max - 1) {
			start = Math.max(1, end - max + 1);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	function handlePageChange(page: number) {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			onPageChange(page);
		}
	}
</script>

{#if totalPages > 1}
	<nav class="flex items-center justify-center space-x-2" aria-label="Pagination">
		<!-- Previous Button -->
		<Button
			variant="outline"
			size="sm"
			onclick={() => handlePageChange(currentPage - 1)}
			disabled={currentPage === 1}
			class="gap-2"
		>
			<ChevronLeft class="h-4 w-4" />
			<span class="hidden sm:inline">Previous</span>
		</Button>

		<!-- First Page -->
		{#if showFirstLast && visiblePages[0] > 1}
			<Button
				variant={1 === currentPage ? 'default' : 'outline'}
				size="sm"
				onclick={() => handlePageChange(1)}
				class="min-w-[40px]"
			>
				1
			</Button>
			{#if visiblePages[0] > 2}
				<span class="px-2 text-muted-foreground">...</span>
			{/if}
		{/if}

		<!-- Visible Pages -->
		{#each visiblePages as page (page)}
			<Button
				variant={page === currentPage ? 'default' : 'outline'}
				size="sm"
				onclick={() => handlePageChange(page)}
				class="min-w-[40px] {page === currentPage
					? 'bg-primary text-white hover:bg-primary/90'
					: ''}"
			>
				{page}
			</Button>
		{/each}

		<!-- Last Page -->
		{#if showFirstLast && visiblePages[visiblePages.length - 1] < totalPages}
			{#if visiblePages[visiblePages.length - 1] < totalPages - 1}
				<span class="px-2 text-muted-foreground">...</span>
			{/if}
			<Button
				variant={totalPages === currentPage ? 'default' : 'outline'}
				size="sm"
				onclick={() => handlePageChange(totalPages)}
				class="min-w-[40px]"
			>
				{totalPages}
			</Button>
		{/if}

		<!-- Next Button -->
		<Button
			variant="outline"
			size="sm"
			onclick={() => handlePageChange(currentPage + 1)}
			disabled={currentPage === totalPages}
			class="gap-2"
		>
			<span class="hidden sm:inline">Next</span>
			<ChevronRight class="h-4 w-4" />
		</Button>
	</nav>
{/if}
