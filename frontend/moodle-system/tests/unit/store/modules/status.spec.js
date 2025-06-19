import statusModule from '@/store/modules/status.js'
import api from '@/services/index.js'

// Mock the API
jest.mock('@/services/index.js', () => ({
  statusType: {
    getStatusTypes: jest.fn(),
    createStatusType: jest.fn(),
    updateStatusType: jest.fn(),
    deleteStatusType: jest.fn()
  },
  statusTransition: {
    getStatusTransitions: jest.fn(),
    createStatusTransition: jest.fn(),
    deleteStatusTransition: jest.fn()
  },
  geography: {
    getCountries: jest.fn(),
    getNationalities: jest.fn(),
    getLocationChildren: jest.fn()
  }
}))

describe('status store module', () => {
  let store

  beforeEach(() => {
    store = {
      state: { ...statusModule.state },
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {}
    }
    jest.clearAllMocks()
  })

  describe('mutations', () => {
    it('should set status types', () => {
      const statusTypes = [{ _id: '1', type: 'Active' }, { _id: '2', type: 'Inactive' }]
      statusModule.mutations.SET_STATUS_TYPES(store.state, statusTypes)
      expect(store.state.statusTypes).toEqual(statusTypes)
    })

    it('should set status transitions', () => {
      const transitions = [{ fromStatusId: '1', toStatus: [{ _id: '2' }] }]
      statusModule.mutations.SET_STATUS_TRANSITIONS(store.state, transitions)
      expect(store.state.statusTransitions).toEqual(transitions)
    })

    it('should set countries', () => {
      const countries = [{ countryName: 'Vietnam', geonameId: '1562822' }]
      statusModule.mutations.SET_COUNTRIES(store.state, countries)
      expect(store.state.countries).toEqual(countries)
    })

    it('should set nationalities', () => {
      const nationalities = ['Vietnamese', 'American', 'British']
      statusModule.mutations.SET_NATIONALITIES(store.state, nationalities)
      expect(store.state.nationalities).toEqual(nationalities)
    })

    it('should set location data in cache', () => {
      const geonameId = '1562822'
      const data = { geonames: [{ toponymName: 'Hanoi' }] }
      
      statusModule.mutations.SET_LOCATION_DATA(store.state, { geonameId, data })
      
      expect(store.state.locationCache[geonameId]).toEqual(data)
    })

    it('should set loading state', () => {
      statusModule.mutations.SET_LOADING(store.state, true)
      expect(store.state.loading).toBe(true)
    })

    it('should set error state', () => {
      const error = 'Test error'
      statusModule.mutations.SET_ERROR(store.state, error)
      expect(store.state.error).toBe(error)
    })
  })

  describe('actions', () => {
    describe('fetchStatusTypes', () => {
      it('should fetch status types successfully', async () => {
        const statusTypes = [{ _id: '1', type: 'Active' }]
        const mockResponse = {
          data: {
            metadata: statusTypes
          }
        }
        
        api.statusType.getStatusTypes.mockResolvedValue(mockResponse)
        
        await statusModule.actions.fetchStatusTypes(store)
        
        expect(store.commit).toHaveBeenCalledWith('SET_LOADING', true)
        expect(store.commit).toHaveBeenCalledWith('SET_STATUS_TYPES', statusTypes)
        expect(store.commit).toHaveBeenCalledWith('SET_LOADING', false)
      })

      it('should handle fetch status types error', async () => {
        const error = new Error('Fetch failed')
        api.statusType.getStatusTypes.mockRejectedValue(error)
        
        await statusModule.actions.fetchStatusTypes(store)
        
        expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Fetch failed')
      })

      it('should handle response without metadata', async () => {
        const mockResponse = { data: {} }
        api.statusType.getStatusTypes.mockResolvedValue(mockResponse)
        
        await statusModule.actions.fetchStatusTypes(store)
        
        expect(store.commit).toHaveBeenCalledWith('SET_STATUS_TYPES', [])
      })
    })

    describe('createStatusType', () => {
      it('should create status type successfully', async () => {
        const statusType = { type: 'New Status' }
        
        api.statusType.createStatusType.mockResolvedValue({})
        
        await statusModule.actions.createStatusType(store, statusType)
        
        expect(api.statusType.createStatusType).toHaveBeenCalledWith(statusType)
        expect(store.dispatch).toHaveBeenCalledWith('fetchStatusTypes')
      })

      it('should handle create status type error', async () => {
        const error = new Error('Create failed')
        api.statusType.createStatusType.mockRejectedValue(error)
        
        await expect(statusModule.actions.createStatusType(store, {})).rejects.toThrow()
        
        expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Create failed')
      })
    })

    describe('updateStatusType', () => {
      it('should update status type successfully', async () => {
        const id = '1'
        const statusType = { type: 'Updated Status' }
        
        api.statusType.updateStatusType.mockResolvedValue({})
        
        await statusModule.actions.updateStatusType(store, { id, statusType })
        
        expect(api.statusType.updateStatusType).toHaveBeenCalledWith(id, statusType)
        expect(store.dispatch).toHaveBeenCalledWith('fetchStatusTypes')
      })

      it('should handle update status type error', async () => {
        const error = new Error('Update failed')
        api.statusType.updateStatusType.mockRejectedValue(error)
        
        await expect(statusModule.actions.updateStatusType(store, { id: '1', statusType: {} })).rejects.toThrow()
        
        expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Update failed')
      })
    })

    describe('deleteStatusType', () => {
      it('should delete status type successfully', async () => {
        const id = '1'
        
        api.deleteStatusType = jest.fn().mockResolvedValue({})
        
        await statusModule.actions.deleteStatusType(store, id)
        
        expect(api.deleteStatusType).toHaveBeenCalledWith(id)
        expect(store.dispatch).toHaveBeenCalledWith('fetchStatusTypes')
      })

      it('should handle delete status type error', async () => {
        const error = new Error('Delete failed')
        api.deleteStatusType = jest.fn().mockRejectedValue(error)
        
        await expect(statusModule.actions.deleteStatusType(store, '1')).rejects.toThrow()
        
        expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Delete failed')
      })
    })

    describe('fetchStatusTransitions', () => {
      it('should fetch status transitions successfully', async () => {
        const transitions = [{ fromStatusId: '1', toStatus: [{ _id: '2' }] }]
        const mockResponse = {
          data: {
            metadata: transitions
          }
        }
        
        api.statusTransition.getStatusTransitions.mockResolvedValue(mockResponse)
        
        await statusModule.actions.fetchStatusTransitions(store)
        
        expect(store.commit).toHaveBeenCalledWith('SET_STATUS_TRANSITIONS', transitions)
      })

      it('should handle fetch transitions error', async () => {
        const error = new Error('Fetch failed')
        api.statusTransition.getStatusTransitions.mockRejectedValue(error)
        
        await statusModule.actions.fetchStatusTransitions(store)
        
        expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Fetch failed')
      })
    })

    describe('createStatusTransition', () => {
      it('should create status transition successfully', async () => {
        const transition = { fromStatus: '1', toStatus: '2' }
        
        api.statusTransition.createStatusTransition.mockResolvedValue({})
        
        await statusModule.actions.createStatusTransition(store, transition)
        
        expect(api.statusTransition.createStatusTransition).toHaveBeenCalledWith(transition)
        expect(store.dispatch).toHaveBeenCalledWith('fetchStatusTransitions')
      })

      it('should handle create transition error', async () => {
        const error = new Error('Create failed')
        api.statusTransition.createStatusTransition.mockRejectedValue(error)
        
        await expect(statusModule.actions.createStatusTransition(store, {})).rejects.toThrow()
        
        expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Create failed')
      })
    })

    describe('deleteStatusTransition', () => {
      it('should delete status transition successfully', async () => {
        const transition = { fromStatus: '1', toStatus: '2' }
        
        api.statusTransition.deleteStatusTransition.mockResolvedValue({})
        
        await statusModule.actions.deleteStatusTransition(store, transition)
        
        expect(api.statusTransition.deleteStatusTransition).toHaveBeenCalledWith(transition)
        expect(store.dispatch).toHaveBeenCalledWith('fetchStatusTransitions')
      })

      it('should handle delete transition error', async () => {
        const error = new Error('Delete failed')
        api.statusTransition.deleteStatusTransition.mockRejectedValue(error)
        
        await expect(statusModule.actions.deleteStatusTransition(store, {})).rejects.toThrow()
        
        expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Delete failed')
      })
    })

    describe('fetchCountries', () => {
      it('should fetch countries successfully', async () => {
        const countries = [{ countryName: 'Vietnam', geonameId: '1562822' }]
        const mockResponse = {
          data: {
            metadata: {
              countries
            }
          }
        }
        
        api.geography.getCountries.mockResolvedValue(mockResponse)
        
        await statusModule.actions.fetchCountries(store)
        
        expect(store.commit).toHaveBeenCalledWith('SET_COUNTRIES', countries)
      })

      it('should add Vietnam if not present in countries', async () => {
        const countries = [{ countryName: 'United States', geonameId: '6252001' }]
        const mockResponse = {
          data: {
            metadata: {
              countries
            }
          }
        }
        
        api.geography.getCountries.mockResolvedValue(mockResponse)
        
        await statusModule.actions.fetchCountries(store)
        
        const expectedCountries = [
          ...countries,
          { countryName: 'Vietnam', geonameId: '1562822' }
        ]
        expect(store.commit).toHaveBeenCalledWith('SET_COUNTRIES', expectedCountries)
      })

      it('should not add Vietnam if already present', async () => {
        const countries = [{ countryName: 'Vietnam', geonameId: '1562822' }]
        const mockResponse = {
          data: {
            metadata: {
              countries
            }
          }
        }
        
        api.geography.getCountries.mockResolvedValue(mockResponse)
        
        await statusModule.actions.fetchCountries(store)
        
        expect(store.commit).toHaveBeenCalledWith('SET_COUNTRIES', countries)
      })

      it('should handle fetch countries error with fallback', async () => {
        const error = new Error('Fetch failed')
        api.geography.getCountries.mockRejectedValue(error)
        
        await statusModule.actions.fetchCountries(store)
        
        expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Fetch failed')
        
        const defaultCountries = [
          { countryName: 'Vietnam', geonameId: '1562822' },
          { countryName: 'United States', geonameId: '6252001' },
          { countryName: 'United Kingdom', geonameId: '2635167' },
          { countryName: 'China', geonameId: '1814991' },
          { countryName: 'Japan', geonameId: '1861060' },
          { countryName: 'France', geonameId: '3017382' }
        ]
        expect(store.commit).toHaveBeenCalledWith('SET_COUNTRIES', defaultCountries)
      })
    })

    describe('fetchNationalities', () => {
      it('should fetch nationalities successfully', async () => {
        const nationalities = ['Vietnamese', 'American', 'British']
        const mockResponse = {
          data: {
            metadata: {
              nationalities
            }
          }
        }
        
        api.geography.getNationalities.mockResolvedValue(mockResponse)
        
        await statusModule.actions.fetchNationalities(store)
        
        expect(store.commit).toHaveBeenCalledWith('SET_NATIONALITIES', nationalities)
      })

      it('should handle fetch nationalities error with fallback', async () => {
        const error = new Error('Fetch failed')
        api.geography.getNationalities.mockRejectedValue(error)
        
        await statusModule.actions.fetchNationalities(store)
        
        expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Fetch failed')
        
        const defaultNationalities = [
          'Vietnamese', 'American', 'British', 'Chinese', 'French', 'Japanese'
        ]
        expect(store.commit).toHaveBeenCalledWith('SET_NATIONALITIES', defaultNationalities)
      })
    })

    describe('fetchLocationChildren', () => {
      it('should fetch location children successfully', async () => {
        const geonameId = '1562822'
        const locationData = {
          geonames: [{ toponymName: 'Hanoi', geonameId: '1581130' }]
        }
        const mockResponse = {
          data: {
            metadata: {
              children: locationData
            }
          }
        }
        
        api.geography.getLocationChildren.mockResolvedValue(mockResponse)
        
        const result = await statusModule.actions.fetchLocationChildren(store, geonameId)
        
        expect(store.commit).toHaveBeenCalledWith('SET_LOCATION_DATA', { 
          geonameId, 
          data: locationData 
        })
        expect(result).toEqual(locationData)
      })

      it('should return cached data if available', async () => {
        const geonameId = '1562822'
        const cachedData = { geonames: [{ toponymName: 'Cached City' }] }
        store.state.locationCache[geonameId] = cachedData
        
        const result = await statusModule.actions.fetchLocationChildren(store, geonameId)
        
        expect(api.geography.getLocationChildren).not.toHaveBeenCalled()
        expect(result).toEqual(cachedData)
      })

      it('should handle invalid geonameId', async () => {
        const result = await statusModule.actions.fetchLocationChildren(store, null)
        
        expect(result).toEqual({ geonames: [] })
        expect(api.geography.getLocationChildren).not.toHaveBeenCalled()
      })

      it('should handle API response with children.geonames', async () => {
        const geonameId = '1562822'
        const mockResponse = {
          data: {
            metadata: {
              children: {
                geonames: [{ toponymName: 'Test City' }]
              }
            }
          }
        }
        
        api.geography.getLocationChildren.mockResolvedValue(mockResponse)
        
        const result = await statusModule.actions.fetchLocationChildren(store, geonameId)
        
        expect(result).toEqual({ geonames: [{ toponymName: 'Test City' }] })
      })

      it('should handle API response with children as array', async () => {
        const geonameId = '1562822'
        const mockResponse = {
          data: {
            metadata: {
              children: [{ toponymName: 'Test City' }]
            }
          }
        }
        
        api.geography.getLocationChildren.mockResolvedValue(mockResponse)
        
        const result = await statusModule.actions.fetchLocationChildren(store, geonameId)
        
        expect(result).toEqual({ geonames: [{ toponymName: 'Test City' }] })
      })

      it('should handle fetch location children error', async () => {
        const error = new Error('Location fetch failed')
        api.geography.getLocationChildren.mockRejectedValue(error)
        
        const result = await statusModule.actions.fetchLocationChildren(store, '1562822')
        
        expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Location fetch failed')
        expect(result).toEqual({ geonames: [] })
      })

      it('should handle malformed API response', async () => {
        const mockResponse = { data: {} }
        api.geography.getLocationChildren.mockResolvedValue(mockResponse)
        
        const result = await statusModule.actions.fetchLocationChildren(store, '1562822')
        
        expect(result).toEqual({ geonames: [] })
      })
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      store.state.statusTypes = [
        { _id: '1', type: 'Active' },
        { _id: '2', type: 'Inactive' },
        { _id: '3', type: 'Pending' }
      ]
      
      store.state.statusTransitions = [
        { 
          fromStatusId: '1', 
          toStatus: [
            { _id: '2', type: 'Inactive' },
            { _id: '3', type: 'Pending' }
          ]
        },
        {
          fromStatusId: '2',
          toStatus: [
            { _id: '1', type: 'Active' }
          ]
        }
      ]

      store.state.countries = [
        { countryName: 'Vietnam', geonameId: '1562822' },
        { countryName: 'United States', geonameId: '6252001' },
        { countryName: 'viet nam', geonameId: '1562823' }
      ]
    })

    it('should get status type by ID', () => {
      const statusType = statusModule.getters.getStatusTypeById(store.state)('2')
      expect(statusType).toEqual({ _id: '2', type: 'Inactive' })
    })

    it('should return undefined for non-existent status type', () => {
      const statusType = statusModule.getters.getStatusTypeById(store.state)('999')
      expect(statusType).toBeUndefined()
    })

    it('should get status type name by ID', () => {
      const name = statusModule.getters.getStatusTypeName(store.state)('1')
      expect(name).toBe('Active')
    })

    it('should return empty string for non-existent status type name', () => {
      const name = statusModule.getters.getStatusTypeName(store.state)('999')
      expect(name).toBe('')
    })

    it('should get valid transitions for status', () => {
      const transitions = statusModule.getters.getValidTransitionsForStatus(store.state)('1')
      expect(transitions).toEqual([
        { _id: '2', type: 'Inactive' },
        { _id: '3', type: 'Pending' }
      ])
    })

    it('should return empty array for non-existent transition', () => {
      const transitions = statusModule.getters.getValidTransitionsForStatus(store.state)('999')
      expect(transitions).toEqual([])
    })

    it('should validate status transition (same status)', () => {
      const isValid = statusModule.getters.isValidStatusTransition(store.state)('1', '1')
      expect(isValid).toBe(true)
    })

    it('should validate status transition (valid transition)', () => {
      const isValid = statusModule.getters.isValidStatusTransition(store.state)('1', '2')
      expect(isValid).toBe(true)
    })

    it('should invalidate status transition (invalid transition)', () => {
      const isValid = statusModule.getters.isValidStatusTransition(store.state)('3', '1')
      expect(isValid).toBe(false)
    })

    it('should invalidate status transition (no transition rule)', () => {
      const isValid = statusModule.getters.isValidStatusTransition(store.state)('999', '1')
      expect(isValid).toBe(false)
    })

    it('should get country by name (exact match)', () => {
      const country = statusModule.getters.getCountryByName(store.state)('Vietnam')
      expect(country).toEqual({ countryName: 'Vietnam', geonameId: '1562822' })
    })

    it('should get country by name (case insensitive)', () => {
      const country = statusModule.getters.getCountryByName(store.state)('vietnam')
      expect(country).toEqual({ countryName: 'Vietnam', geonameId: '1562822' })
    })

    it('should get country by name (partial match)', () => {
      const country = statusModule.getters.getCountryByName(store.state)('viet')
      expect(country).toEqual({ countryName: 'Vietnam', geonameId: '1562822' })
    })

    it('should return null for non-existent country', () => {
      const country = statusModule.getters.getCountryByName(store.state)('NonExistent')
      expect(country).toBeNull()
    })

    it('should return null for null country name', () => {
      const country = statusModule.getters.getCountryByName(store.state)(null)
      expect(country).toBeNull()
    })
  })
})