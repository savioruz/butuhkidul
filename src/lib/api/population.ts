import { apiRequest } from './client';
import type { PopulationApiResponse, PopulationStats, Population } from '@/types/population';

export const populationApi = {
	/**
	 * Get population data from the API
	 */
	async getPopulations(): Promise<PopulationApiResponse> {
		return await apiRequest<PopulationApiResponse>('/v1/populations');
	},

	/**
	 * Process population data to calculate aggregated statistics
	 */
	processPopulationStats(populations: Population[]): PopulationStats {
		const totalPopulation = populations.reduce((sum, pop) => sum + pop.total_population, 0);
		const totalHouseholds = populations.reduce((sum, pop) => sum + pop.households, 0);

		const genderDistribution = {
			male: populations.reduce((sum, pop) => sum + pop.male, 0),
			female: populations.reduce((sum, pop) => sum + pop.female, 0)
		};

		const ageDistribution = {
			toddlers: populations.reduce((sum, pop) => sum + pop.toddlers, 0),
			children: populations.reduce((sum, pop) => sum + pop.children, 0),
			adults:
				totalPopulation -
				populations.reduce((sum, pop) => sum + pop.toddlers + pop.children + pop.elderly, 0),
			elderly: populations.reduce((sum, pop) => sum + pop.elderly, 0)
		};

		const hamletData = populations.map((pop) => ({
			name: pop.hamlet,
			population: pop.total_population,
			households: pop.households
		}));

		return {
			totalPopulation,
			totalHouseholds,
			genderDistribution,
			ageDistribution,
			hamletData
		};
	}
};
