<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { articlesApi } from '$lib/api/articles';
	import type { Article } from '$lib/types/article';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Pagination } from '$lib/components/ui/pagination';
	import { ScrollToTop } from '$lib/components/ui/scroll-to-top';
	import { Calendar, ArrowRight, BookOpen, Search } from 'lucide-svelte';
	import { getExcerpt } from '$lib/utils/markdown';

	let articles: Article[] = $state([]);
	let isLoading = $state(true);
	let isPaginating = $state(false);
	let error = $state('');
	let searchQuery = $state('');
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalData = $state(0);
	const itemsPerPage = 9;

	async function loadArticles() {
		try {
			if (currentPage === 1) {
				isLoading = true;
			} else {
				isPaginating = true;
			}
			error = '';

			const params = {
				active: true,
				page: currentPage,
				limit: itemsPerPage,
				...(searchQuery.trim() && { title: searchQuery })
			};

			const response = await articlesApi.getArticles(params);

			if (response && response.data && Array.isArray(response.data.articles)) {
				articles = response.data.articles;
				totalData = response.data.total_data || 0;
				totalPages = response.data.total_page || 1;
			} else if (response && Array.isArray(response.data)) {
				articles = response.data;
				totalData = response.data.length;
				totalPages = 1;
			} else {
				console.warn('Unexpected response structure:', response);
				error = $t('common.articles.error_loading');
			}
		} catch (err) {
			console.error('Error loading articles:', err);
			error = $t('common.articles.error_loading');
		} finally {
			isLoading = false;
			isPaginating = false;
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function handleSearch() {
		currentPage = 1;
		loadArticles();
	}

	function handlePageChange(page: number) {
		currentPage = page;
		loadArticles();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	onMount(() => {
		loadArticles();
	});
</script>

<svelte:head>
	<title>{$t('common.articles.title')} - {$t('common.hero.village_name')}</title>
	<meta name="description" content={$t('common.articles.meta_description')} />
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<!-- Search Section -->
	<section class="py-4">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-2xl">
				<div class="relative">
					<Search
						class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground"
					/>
					<input
						bind:value={searchQuery}
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						type="text"
						placeholder={$t('common.articles.search_placeholder')}
						class="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-10 text-foreground shadow-sm focus:border-transparent focus:ring-2 focus:ring-primary"
					/>
					<Button
						onclick={handleSearch}
						class="absolute top-1/2 right-2 -translate-y-1/2 transform"
					>
						{$t('common.articles.search')}
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Main Content -->
	<section class="py-8">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			{#if isLoading}
				<!-- Loading State -->
				<div class="py-20 text-center">
					<div
						class="mb-6 inline-block h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"
					></div>
					<h3 class="mb-2 text-xl font-semibold text-foreground">
						{$t('common.articles.loading')}
					</h3>
					<p class="text-muted-foreground">{$t('common.articles.loading_content')}</p>
				</div>
			{:else if error}
				<!-- Error State -->
				<div class="py-20 text-center">
					<div
						class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-destructive/50 bg-card p-6"
					>
						<BookOpen class="h-10 w-10 text-destructive" />
					</div>
					<h3 class="mb-2 text-xl font-semibold text-foreground">
						{$t('common.articles.failed_to_load')}
					</h3>
					<p class="mb-6 text-destructive">{error}</p>
					<Button onclick={loadArticles} variant="outline" class="gap-2">
						{$t('common.retry')}
					</Button>
				</div>
			{:else if articles.length === 0}
				<!-- Empty State -->
				<div class="py-20 text-center">
					<BookOpen class="mx-auto mb-6 h-20 w-20 text-muted-foreground" />
					<h3 class="mb-2 text-xl font-semibold text-foreground">
						{searchQuery
							? $t('common.articles.no_articles_found')
							: $t('common.articles.no_articles_published')}
					</h3>
					<p class="text-muted-foreground">
						{searchQuery
							? `${$t('common.articles.no_matching_articles')} "${searchQuery}".`
							: $t('common.articles.no_articles_published')}
					</p>
					{#if searchQuery}
						<Button
							onclick={() => {
								searchQuery = '';
								currentPage = 1;
								loadArticles();
							}}
							variant="outline"
							class="mt-4"
						>
							{$t('common.articles.view_all_articles')}
						</Button>
					{/if}
				</div>
			{:else}
				<!-- Articles Grid -->
				<div class="space-y-8">
					<div class="mb-12 text-center">
						<h2 class="mb-4 text-3xl font-bold text-foreground">
							{searchQuery
								? `${$t('common.articles.search_results')} "${searchQuery}"`
								: $t('common.articles.latest_articles')}
						</h2>
						<p class="mx-auto max-w-2xl text-muted-foreground">
							{searchQuery
								? `${$t('common.articles.found_articles').replace('{count}', totalData)} • ${$t('common.articles.page_of').replace('{current}', currentPage).replace('{total}', totalPages)}`
								: `${$t('common.articles.available_articles').replace('{count}', totalData)} • ${$t('common.articles.page_of').replace('{current}', currentPage).replace('{total}', totalPages)}`}
						</p>
					</div>

					<div class="relative">
						<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							{#each articles as article (article.id)}
								<Card
									class="group cursor-pointer overflow-hidden border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg {isPaginating
										? 'opacity-70'
										: ''}"
								>
									{#if article.cover_url}
										<div class="relative h-48 overflow-hidden border-b border-border">
											<img
												src={article.cover_url}
												alt={article.title}
												class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
											/>
											<div class="absolute top-4 right-4">
												<div
													class="rounded-full border border-border bg-card/90 px-3 py-1 text-sm font-medium text-card-foreground backdrop-blur-sm"
												>
													{$t('common.articles.article_label')}
												</div>
											</div>
										</div>
									{:else}
										<div
											class="flex h-48 items-center justify-center border-b border-border bg-muted"
										>
											<BookOpen class="h-16 w-16 text-muted-foreground" />
										</div>
									{/if}

									<CardHeader class="pb-4">
										<div class="mb-2 flex items-center text-sm text-muted-foreground">
											<Calendar class="mr-2 h-4 w-4 flex-shrink-0" />
											<span>{formatDate(article.published_at || article.created_at)}</span>
										</div>

										<CardTitle
											class="line-clamp-2 text-xl leading-tight font-bold text-foreground transition-colors group-hover:text-primary"
										>
											{article.title}
										</CardTitle>
									</CardHeader>

									<CardContent class="pt-0 pb-6">
										<div class="space-y-4">
											<CardDescription class="line-clamp-3 leading-relaxed text-muted-foreground">
												{getExcerpt(article.content || '', 150)}
											</CardDescription>

											<a
												href={`/articles/${article.slug}`}
												class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
												data-sveltekit-preload-data
											>
												{$t('common.articles.read_more')}
												<ArrowRight class="h-4 w-4" />
											</a>
										</div>
									</CardContent>
								</Card>
							{/each}
						</div>

						<!-- Pagination Loading Overlay -->
						{#if isPaginating}
							<div
								class="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
							>
								<div
									class="flex items-center gap-3 rounded-lg border border-border bg-card px-6 py-3 shadow-lg"
								>
									<div
										class="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"
									></div>
									<span class="font-medium text-foreground"
										>{$t('common.articles.loading_page')}</span
									>
								</div>
							</div>
						{/if}
					</div>

					<!-- Pagination -->
					{#if totalPages > 1}
						<div class="mt-12 flex justify-center">
							<Pagination
								{currentPage}
								{totalPages}
								onPageChange={handlePageChange}
								maxVisiblePages={5}
								showFirstLast={true}
							/>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</section>
</div>

<ScrollToTop />
