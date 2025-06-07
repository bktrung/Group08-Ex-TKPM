export interface IAddressService {
	getCountries(): Promise<any>;
	getChildren(geonameId: string): Promise<any>;
	getNationalities(): Promise<any>;
} 