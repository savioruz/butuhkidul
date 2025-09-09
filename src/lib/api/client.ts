import { API_BASE_URL } from '../types/api';

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public response?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		},
		...options
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new ApiError(
			errorData.error || `HTTP ${response.status}: ${response.statusText}`,
			response.status,
			errorData
		);
	}

	return response.json();
}
