import geographyService from '@/services/geography.js'
import apiClient from '@/services/client.js'

jest.mock('@/services/client.js')

describe('Geography Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCountries', () => {
    it('should fetch all countries', async () => {
      const mockResponse = { 
        data: { 
          metadata: {
            countries: [
              { geonameId: '1562822', countryName: 'Vietnam' },
              { geonameId: '6252001', countryName: 'United States' },
              { geonameId: '2635167', countryName: 'United Kingdom' }
            ]
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getCountries()

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/address/countries')
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty countries response', async () => {
      const mockResponse = { 
        data: { 
          metadata: { countries: [] }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getCountries()
      expect(result.data.metadata.countries).toEqual([])
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch countries')
      apiClient.get.mockRejectedValue(error)

      await expect(geographyService.getCountries()).rejects.toThrow('Failed to fetch countries')
    })

    it('should handle malformed response', async () => {
      const mockResponse = { data: null }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getCountries()
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getNationalities', () => {
    it('should fetch all nationalities', async () => {
      const mockResponse = { 
        data: { 
          metadata: {
            nationalities: [
              'Vietnamese',
              'American',
              'British',
              'Chinese',
              'French',
              'Japanese'
            ]
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getNationalities()

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/address/nationalities')
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty nationalities response', async () => {
      const mockResponse = { 
        data: { 
          metadata: { nationalities: [] }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getNationalities()
      expect(result.data.metadata.nationalities).toEqual([])
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch nationalities')
      apiClient.get.mockRejectedValue(error)

      await expect(geographyService.getNationalities()).rejects.toThrow('Failed to fetch nationalities')
    })

    it('should handle response without metadata', async () => {
      const mockResponse = { data: {} }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getNationalities()
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getLocationChildren', () => {
    it('should fetch location children by geonameId', async () => {
      const geonameId = '1562822'
      const mockResponse = { 
        data: { 
          metadata: {
            children: {
              geonames: [
                { geonameId: '1581130', toponymName: 'Ho Chi Minh City' },
                { geonameId: '1581297', toponymName: 'Hanoi' },
                { geonameId: '1580830', toponymName: 'Da Nang' }
              ]
            }
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getLocationChildren(geonameId)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/address/children/1562822')
      expect(result).toEqual(mockResponse)
    })

    it('should handle numeric geonameId', async () => {
      const geonameId = 1562822
      const mockResponse = { 
        data: { 
          metadata: {
            children: { geonames: [] }
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      await geographyService.getLocationChildren(geonameId)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/address/children/1562822')
    })

    it('should handle empty children response', async () => {
      const geonameId = '1562822'
      const mockResponse = { 
        data: { 
          metadata: {
            children: { geonames: [] }
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getLocationChildren(geonameId)
      expect(result.data.metadata.children.geonames).toEqual([])
    })

    it('should handle API errors', async () => {
      const geonameId = '1562822'
      const error = new Error('Failed to fetch location children')
      apiClient.get.mockRejectedValue(error)

      await expect(geographyService.getLocationChildren(geonameId))
        .rejects.toThrow('Failed to fetch location children')
    })

    it('should handle invalid geonameId', async () => {
      const mockResponse = { data: { error: 'Invalid geonameId' } }
      apiClient.get.mockResolvedValue(mockResponse)

      await geographyService.getLocationChildren('')
      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/address/children/')

      await geographyService.getLocationChildren(null)
      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/address/children/null')

      await geographyService.getLocationChildren(undefined)
      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/address/children/undefined')
    })

    it('should handle response without geonames', async () => {
      const geonameId = '1562822'
      const mockResponse = { 
        data: { 
          metadata: {
            children: {}
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getLocationChildren(geonameId)
      expect(result).toEqual(mockResponse)
    })

    it('should handle children as array instead of object', async () => {
      const geonameId = '1562822'
      const mockResponse = { 
        data: { 
          metadata: {
            children: [
              { geonameId: '1581130', toponymName: 'Ho Chi Minh City' },
              { geonameId: '1581297', toponymName: 'Hanoi' }
            ]
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getLocationChildren(geonameId)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Error handling and edge cases', () => {
    it('should handle network errors', async () => {
      const networkError = { 
        code: 'NETWORK_ERROR',
        message: 'Network Error' 
      }
      apiClient.get.mockRejectedValue(networkError)

      await expect(geographyService.getCountries()).rejects.toMatchObject(networkError)
      await expect(geographyService.getNationalities()).rejects.toMatchObject(networkError)
      await expect(geographyService.getLocationChildren('123')).rejects.toMatchObject(networkError)
    })

    it('should handle timeout errors', async () => {
      const timeoutError = { 
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded' 
      }
      apiClient.get.mockRejectedValue(timeoutError)

      await expect(geographyService.getCountries()).rejects.toMatchObject(timeoutError)
    })

    it('should handle server errors', async () => {
      const serverError = { 
        response: { 
          status: 500, 
          data: { message: 'Internal Server Error' } 
        } 
      }
      apiClient.get.mockRejectedValue(serverError)

      await expect(geographyService.getNationalities()).rejects.toMatchObject(serverError)
    })

    it('should handle malformed JSON responses', async () => {
      const mockResponse = { data: 'invalid json' }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await geographyService.getCountries()
      expect(result).toEqual(mockResponse)
    })
  })
})