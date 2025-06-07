import { Container } from "inversify";
import { AddressService } from "../../../src/services/address.service";
import { TYPES } from "../../../src/configs/di.types";
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock NodeCache with a simple implementation
jest.mock('node-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue(undefined), // Always return undefined to force API calls
    set: jest.fn(),
  }));
});

describe("Address Service", () => {
  let container: Container;
  let addressService: AddressService;

  beforeEach(() => {
    // Create test container
    container = new Container();
    
    // Bind service
    container.bind<AddressService>(TYPES.AddressService).to(AddressService);
    
    // Get service instance
    addressService = container.get<AddressService>(TYPES.AddressService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getCountries', () => {
    const mockCountriesResponse = {
      data: {
        geonames: [
          { countryName: 'Vietnam', geonameId: 1562822 },
          { countryName: 'United States', geonameId: 6252001 }
        ]
      }
    };

    const expectedCountries = [
      { countryName: 'Vietnam', geonameId: 1562822 },
      { countryName: 'United States', geonameId: 6252001 }
    ];

    it('should fetch countries from API successfully', async () => {
      mockedAxios.get.mockResolvedValue(mockCountriesResponse);

      const result = await addressService.getCountries();
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://api.geonames.org/countryInfoJSON', {
        params: {
          username: process.env.GEONAMES_USERNAME,
        }
      });
      expect(result).toEqual(expectedCountries);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(addressService.getCountries()).rejects.toThrow('API Error');
      
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  describe('getChildren', () => {
    const geonameId = '1562822';
    const mockChildrenResponse = {
      data: {
        totalResultsCount: 2,
        geonames: [
          { name: 'Ho Chi Minh City', toponymName: 'Ho Chi Minh City', geonameId: 1566083 },
          { name: 'Hanoi', toponymName: 'Hanoi', geonameId: 1581130 }
        ]
      }
    };

    const expectedChildren = [
      { name: 'Ho Chi Minh City', toponymName: 'Ho Chi Minh City', geonameId: 1566083 },
      { name: 'Hanoi', toponymName: 'Hanoi', geonameId: 1581130 }
    ];

    it('should fetch children from API successfully', async () => {
      mockedAxios.get.mockResolvedValue(mockChildrenResponse);

      const result = await addressService.getChildren(geonameId);
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://api.geonames.org/children', {
        params: {
          geonameId,
          username: process.env.GEONAMES_USERNAME,
          type: 'json'
        }
      });
      expect(result).toEqual({
        totalResultsCount: 2,
        geonames: expectedChildren
      });
    });

    it('should handle empty results', async () => {
      const emptyResponse = {
        data: {
          totalResultsCount: 0,
          geonames: []
        }
      };

      mockedAxios.get.mockResolvedValue(emptyResponse);

      const result = await addressService.getChildren(geonameId);
      
      expect(result).toEqual({
        totalResultsCount: 0,
        geonames: [{
          name: "null",
          toponymName: "null",
          geonameId: -1
        }]
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(addressService.getChildren(geonameId)).rejects.toThrow('API Error');
      
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  describe('getNationalities', () => {
    const mockNationalitiesResponse = {
      data: [
        { demonyms: { eng: { f: 'Vietnamese' } } },
        { demonyms: { eng: { f: 'American' } } },
        { demonyms: { eng: { f: '' } } } // Should be filtered out
      ]
    };

    const expectedNationalities = ['American', 'Vietnamese']; // Sorted

    it('should fetch nationalities from API successfully', async () => {
      mockedAxios.get.mockResolvedValue(mockNationalitiesResponse);

      const result = await addressService.getNationalities();
      
      expect(mockedAxios.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/all', {
        params: {
          fields: 'demonyms',
        }
      });
      expect(result).toEqual(expectedNationalities);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(addressService.getNationalities()).rejects.toThrow('API Error');
      
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });
}); 