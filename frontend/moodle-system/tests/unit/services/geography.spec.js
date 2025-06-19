import geographyService from '@/services/geography';
import apiClient from '@/services/client';

jest.mock('@/services/client');

describe('Geography Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCountries', () => {
    it('should fetch all countries', async () => {
      const mockResponse = {
        data: {
          metadata: {
            countries: [
              { countryName: 'Vietnam', geonameId: '1562822' },
              { countryName: 'United States', geonameId: '6252001' }
            ]
          }
        }
      };
      
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await geographyService.getCountries();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/address/countries');
      expect(result).toBe(mockResponse);
    });
  });

  describe('getNationalities', () => {
    it('should fetch all nationalities', async () => {
      const mockResponse = {
        data: {
          metadata: {
            nationalities: ['Vietnamese', 'American', 'British']
          }
        }
      };
      
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await geographyService.getNationalities();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/address/nationalities');
      expect(result).toBe(mockResponse);
    });
  });

  describe('getLocationChildren', () => {
    it('should fetch location children by geonameId', async () => {
      const geonameId = '1562822';
      const mockResponse = {
        data: {
          metadata: {
            children: {
              geonames: [
                { toponymName: 'Ho Chi Minh City', geonameId: '1566083' },
                { toponymName: 'Hanoi', geonameId: '1581130' }
              ]
            }
          }
        }
      };
      
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await geographyService.getLocationChildren(geonameId);

      expect(apiClient.get).toHaveBeenCalledWith(`/v1/api/address/children/${geonameId}`);
      expect(result).toBe(mockResponse);
    });
  });
});