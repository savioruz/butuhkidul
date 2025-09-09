import { apiRequest } from './client';
import type { ArticlesResponse, ArticleResponse } from '../types/article';

export const articlesApi = {
	/**
	 * Get all articles
	 */
	async getArticles(params?: {
		title?: string;
		content?: string;
		active?: boolean;
		page?: number;
		limit?: number;
	}): Promise<ArticlesResponse> {
		const searchParams = new URLSearchParams();

		if (params?.title) searchParams.append('title', params.title);
		if (params?.content) searchParams.append('content', params.content);
		if (params?.active !== undefined) searchParams.append('active', params.active.toString());
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const query = searchParams.toString();
		const endpoint = `/v1/articles${query ? `?${query}` : ''}`;

		return apiRequest<ArticlesResponse>(endpoint);
	},

	/**
	 * Get article by ID
	 */
	async getArticleById(id: string): Promise<ArticleResponse> {
		const endpoint = `/v1/articles/id/${id}`;
		return apiRequest<ArticleResponse>(endpoint);
	},

	/**
	 * Get article by slug
	 */
	async getArticleBySlug(slug: string): Promise<ArticleResponse> {
		const endpoint = `/v1/articles/${slug}`;
		return apiRequest<ArticleResponse>(endpoint);
	}
};
