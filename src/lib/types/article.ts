import type { ApiResponse } from './api';

export interface Article {
	id: string;
	title: string;
	content: string;
	slug: string;
	cover_url?: string;
	active: boolean;
	published_at?: string;
	created_at: string;
	created_by: string;
	modified_at?: string;
	modified_by?: string;
}

export type ArticlesResponse = ApiResponse<{
	articles: Article[];
	total_data: number;
	total_page: number;
}>;

export type ArticleResponse = ApiResponse<Article>;
