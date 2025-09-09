export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.butuhkidul.my.id';

export interface ApiResponse<T> {
	data?: T;
	message?: string;
	success?: boolean;
	total_data?: number;
	total_page?: number;
}

export interface ErrorResponse {
	error: string;
}
