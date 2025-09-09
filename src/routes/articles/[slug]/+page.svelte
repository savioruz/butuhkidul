<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import { articlesApi } from '$lib/api/articles';
	import type { Article } from '$lib/types/article';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Calendar, ArrowLeft, BookOpen, Share2 } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { parseMarkdown } from '$lib/utils/markdown';

	let article: Article | null = $state(null);
	let isLoading = $state(true);
	let error = $state('');

	let slug: string = '';

	$effect(() => {
		slug = page.params.slug || '';

		if (slug) {
			loadArticle();
		}
	});

	async function loadArticle() {
		if (!slug) return;

		try {
			isLoading = true;
			error = '';

			const response = await articlesApi.getArticleBySlug(slug);
			console.log('Article response:', response);

			if (response && response.data) {
				article = response.data;
			} else {
				error = $t('common.articles.article_not_found');
			}
		} catch (err) {
			console.error('Error loading article:', err);
			error = $t('common.articles.failed_to_load');
		} finally {
			isLoading = false;
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function goBack() {
		goto('/articles');
	}

	function shareArticle() {
		if (navigator.share && article) {
			navigator.share({
				title: article.title,
				text: article.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
				url: window.location.href
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
		}
	}
</script>

<svelte:head>
	{#if article}
		<title>{article.title} - {$t('common.hero.village_name')}</title>
		<meta name="description" content={article.content.replace(/<[^>]*>/g, '').substring(0, 160)} />
		<meta property="og:title" content={article.title} />
		<meta
			property="og:description"
			content={article.content.replace(/<[^>]*>/g, '').substring(0, 160)}
		/>
		{#if article.cover_url}
			<meta property="og:image" content={article.cover_url} />
		{/if}
		<meta property="og:type" content="article" />
		<meta property="article:published_time" content={article.published_at || article.created_at} />
	{:else}
		<title>Artikel - {$t('common.hero.village_name')}</title>
	{/if}
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	{#if isLoading}
		<!-- Loading State -->
		<section class="py-20">
			<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<div class="py-20 text-center">
					<div
						class="mb-6 inline-block h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"
					></div>
					<h3 class="mb-2 text-xl font-semibold text-foreground">
						{$t('common.articles.loading_article')}
					</h3>
					<p class="text-muted-foreground">{$t('common.articles.loading_content')}</p>
				</div>
			</div>
		</section>
	{:else if error}
		<!-- Error State -->
		<section class="py-20">
			<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<div class="py-20 text-center">
					<div
						class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-destructive/50 bg-card p-6"
					>
						<BookOpen class="h-10 w-10 text-destructive" />
					</div>
					<h3 class="mb-2 text-xl font-semibold text-foreground">
						{$t('common.articles.article_not_found')}
					</h3>
					<p class="mb-6 text-destructive">{error}</p>
					<div class="space-x-4">
						<Button onclick={loadArticle} variant="outline" class="gap-2"
							>{$t('common.articles.try_again')}</Button
						>
						<Button onclick={goBack} class="gap-2">
							<ArrowLeft class="h-4 w-4" />
							{$t('common.articles.back_to_articles')}
						</Button>
					</div>
				</div>
			</div>
		</section>
	{:else if article}
		<!-- Article Content -->
		<section class="py-8">
			<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<!-- Back Navigation -->
				<div class="mb-8">
					<Button variant="ghost" onclick={goBack} class="gap-2">
						<ArrowLeft class="h-4 w-4" />
						{$t('common.articles.back_to_articles')}
					</Button>
				</div>

				<!-- Article Header -->
				<Card class="mb-8 overflow-hidden border border-border shadow-sm">
					{#if article.cover_url}
						<div class="relative h-64 overflow-hidden md:h-96">
							<img src={article.cover_url} alt={article.title} class="h-full w-full object-cover" />
							<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
							<div class="absolute right-6 bottom-6 left-6">
								<div
									class="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1 text-sm font-medium text-card-foreground backdrop-blur-sm"
								>
									<BookOpen class="h-4 w-4" />
									{$t('common.articles.article_label')}
								</div>
								<h1
									class="text-3xl leading-tight font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl"
								>
									{article.title}
								</h1>
							</div>
						</div>
					{:else}
						<CardHeader class="border-b border-border">
							<div
								class="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground"
							>
								<BookOpen class="h-4 w-4" />
								{$t('common.articles.article_label')}
							</div>
							<h1 class="text-3xl leading-tight font-bold text-foreground md:text-4xl lg:text-5xl">
								{article.title}
							</h1>
						</CardHeader>
					{/if}

					<CardHeader>
						<div class="flex flex-wrap items-center justify-between gap-4">
							<div class="flex items-center gap-4 text-muted-foreground">
								<div class="flex items-center gap-2">
									<Calendar class="h-4 w-4" />
									<span class="text-sm">
										{$t('common.articles.published_on')}
										{formatDate(article.published_at || article.created_at)}
									</span>
								</div>
							</div>
							<Button onclick={shareArticle} variant="outline" class="gap-2">
								<Share2 class="h-4 w-4" />
								{$t('common.articles.share')}
							</Button>
						</div>
					</CardHeader>
					<CardContent class="px-8 py-2 md:py-4">
						<div
							class="prose prose-lg dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-p:leading-8
							prose-p:leading-relaxed prose-a:text-primary
							prose-a:no-underline hover:prose-a:underline
							prose-strong:text-foreground prose-ul:text-foreground prose-ul:leading-8
							prose-ol:text-foreground prose-ol:leading-8
							prose-li:text-foreground prose-li:leading-8 prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
							prose-img:rounded-xl
							prose-img:shadow-sm prose-img:border
							prose-img:border-border prose-code:text-foreground prose-code:bg-muted prose-code:px-1
							prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:text-foreground prose-pre:border
							prose-pre:border-border prose-hr:border-border prose-table:text-foreground prose-thead:border-border
							prose-tr:border-border
							prose-td:border-border prose-th:border-border max-w-none font-serif leading-relaxed
						"
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html parseMarkdown(article.content || '')}
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	{/if}
</div>
