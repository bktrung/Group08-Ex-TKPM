import axios, { AxiosResponse } from 'axios';
import NodeCache from 'node-cache';
import { 
	GeonamesCountryResponse, 
	GeonamesChildrenResponse, 
	Country, 
	Child,
	CountryDemonym
} from '../dto/address';

const cache = new NodeCache({
	stdTTL: 600, // 10 minutes time to live
	checkperiod: 120 // Check every 2 minutes
});

class AddressService {
	static async getCountries() {
		const cachedCountries = cache.get<Country[]>('address_countries');
		if (cachedCountries) {
			return cachedCountries;
		}

		const response: AxiosResponse<GeonamesCountryResponse> = await axios.get('http://api.geonames.org/countryInfoJSON', {
			params: {
				username: process.env.GEONAMES_USERNAME,
			}
		});

		const countries: Country[] = response.data.geonames.map(country => ({
			countryName: country.countryName,
			geonameId: country.geonameId
		}));

		cache.set('address_countries', countries, 86400); // 24 hours time to live

		return countries;
	}

	static async getChildren(geonameId: string) {
		const cachedChildren = cache.get<Child[]>(`address_children_${geonameId}`);
		if (cachedChildren) {
			return cachedChildren;
		}
		
		const response: AxiosResponse<GeonamesChildrenResponse> = await axios.get('http://api.geonames.org/children', {
			params: {
				geonameId,
				username: process.env.GEONAMES_USERNAME,
				type: 'json'
			}
		});

		const children: Child[] = response.data.geonames.map(child => ({
			name: child.name || '',
			toponymName: child.toponymName,
			geonameId: child.geonameId
		}));

		const result = {
			totalResultsCount: response.data.totalResultsCount,
			geonames: children
		};

		if (result.totalResultsCount === 0) {
			result.geonames = [{
				name: "null",
				toponymName: "null",
				geonameId: -1
			}];
		}

		cache.set(`address_children_${geonameId}`, children);

		return result;
	}

	static async getNationalities() {
		const cachedNationalities = cache.get<any[]>('address_nationalities');
		if (cachedNationalities) {
			return cachedNationalities;
		}

		const response: AxiosResponse<CountryDemonym[]> = await axios.get('https://restcountries.com/v3.1/all', {
			params: {
				fields: 'demonyms',
			}
		});

		const nationalities = response.data
			.map((country: CountryDemonym) => country.demonyms.eng.f)
			.filter(nationality => nationality.trim() !== '')
			.sort();

		cache.set('address_nationalities', nationalities, 86400); // 24 hours time to live

		return nationalities;
	}
}

export default AddressService;