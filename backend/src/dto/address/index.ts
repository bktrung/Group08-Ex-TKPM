// Types for GeoNames countryInfoJSON response
export interface GeonamesCountry {
	countryName: string;
	geonameId: number;
	[key: string]: any; // Allow extra fields from the API
}

export interface GeonamesCountryResponse {
	geonames: GeonamesCountry[];
	[key: string]: any; // Allow extra fields
}

// Types for GeoNames children response
export interface GeonamesChild {
	countryName?: string;
	toponymName: string;
	geonameId: number;
	[key: string]: any; // Allow extra fields from the API
}

export interface GeonamesChildrenResponse {
	totalResultsCount: number;
	geonames: GeonamesChild[];
	[key: string]: any; // Allow extra fields
}

// Types for filtered data
export interface Country {
	countryName: string;
	geonameId: number;
}

export interface Child {
	name: string;
	toponymName: string;
	geonameId: number;
}

export interface IAddress {
	houseNumberStreet: string;
	wardCommune: string;
	districtCounty: string;
	provinceCity: string;
	country: string;
}