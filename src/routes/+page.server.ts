import { villageApi } from '$lib/api/village';
import { articlesApi } from '$lib/api/articles';
import type { VillagesResponse } from '@/types/village';
import type { ArticlesResponse } from '@/types/article';

export const load = async ({ setHeaders }) => {
	try {
		// Set cache headers for better performance
		setHeaders({
			'cache-control': 'public, max-age=300, s-maxage=600' // 5 min browser, 10 min CDN
		});

		// Use Promise.allSettled to prevent one failed request from blocking the other
		const [villageResult, articlesResult] = await Promise.allSettled([
			// Fetch village data
			villageApi.getVillages(),
			// Fetch latest articles (limit to 3 for home page)
			articlesApi.getArticles({
				active: true,
				limit: 3,
				page: 1
			})
		]);

		const villageData: VillagesResponse | null =
			villageResult.status === 'fulfilled' ? villageResult.value : null;
		const villageError: string | null =
			villageResult.status === 'rejected'
				? villageResult.reason instanceof Error
					? villageResult.reason.message
					: 'Failed to load village data'
				: null;

		const articlesData: ArticlesResponse | null =
			articlesResult.status === 'fulfilled' ? articlesResult.value : null;
		const articlesError: string | null =
			articlesResult.status === 'rejected'
				? articlesResult.reason instanceof Error
					? articlesResult.reason.message
					: 'Failed to load articles'
				: null;

		return {
			villageData,
			articlesData,
			villageError,
			articlesError
		};
	} catch (error) {
		console.error('Unexpected error in page server load:', error);

		return {
			villageData: null,
			articlesData: null,
			villageError: 'Unexpected error occurred while loading data',
			articlesError: 'Unexpected error occurred while loading articles'
		};
	}
};
