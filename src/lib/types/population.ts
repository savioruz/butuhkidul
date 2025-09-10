export interface Population {
	children: number;
	elderly: number;
	female: number;
	hamlet: string;
	households: number;
	male: number;
	toddlers: number;
	total_population: number;
	wives: number;
}

export interface PopulationResponse {
	population: Population[];
}

// Updated to match the actual API response structure
export interface PopulationApiResponse {
	data: PopulationResponse;
	message?: string;
	status?: string;
}

// Aggregated population statistics for charts
export interface PopulationStats {
	totalPopulation: number;
	totalHouseholds: number;
	genderDistribution: {
		male: number;
		female: number;
	};
	ageDistribution: {
		toddlers: number;
		children: number;
		adults: number;
		elderly: number;
	};
	hamletData: {
		name: string;
		population: number;
		households: number;
	}[];
}
