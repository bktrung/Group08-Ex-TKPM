import api from '@/services/index.js'

export default {
  namespaced: true,
  state: {
    statusTypes: [],
    statusTransitions: [],
    countries: [],
    nationalities: [],
    locationCache: {}, // Cache for location data by geonameId
    loading: false,
    error: null
  },
  mutations: {

    SET_STATUS_TYPES(state, statusTypes) {
      state.statusTypes = statusTypes
    },

    SET_STATUS_TRANSITIONS(state, transitions) {
      state.statusTransitions = transitions
    },

    SET_COUNTRIES(state, countries) {
      state.countries = countries
    },

    SET_NATIONALITIES(state, nationalities) {
      state.nationalities = nationalities
    },

    SET_LOCATION_DATA(state, { geonameId, data }) {
      state.locationCache[geonameId] = data
    },

    SET_LOADING(state, loading) {
      state.loading = loading
    },

    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {

    // Fetch status types
    async fetchStatusTypes({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.statusType.getStatusTypes()
        const statusTypes = response.data.metadata || []
        commit('SET_STATUS_TYPES', statusTypes)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Fetching status types failed')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Create new status type
    async createStatusType({ commit, dispatch }, statusType) {
      commit('SET_LOADING', true)
      try {
        await api.statusType.createStatusType(statusType)
        await dispatch('fetchStatusTypes')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Creating status type failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Update existing status type
    async updateStatusType({ commit, dispatch }, { id, statusType }) {
      commit('SET_LOADING', true)
      try {
        await api.statusType.updateStatusType(id, statusType)
        await dispatch('fetchStatusTypes')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Updating status type failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Delete status type
    async deleteStatusType({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.statusType.deleteStatusType(id)
        await dispatch('fetchStatusTypes')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Deleting status type failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Status transitions
    async fetchStatusTransitions({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.statusTransition.getStatusTransitions()
        commit('SET_STATUS_TRANSITIONS', response.data.metadata || [])
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Fetching status transitions failed')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Create new status transition
    async createStatusTransition({ commit, dispatch }, transition) {
      commit('SET_LOADING', true)
      try {
        await api.statusTransition.createStatusTransition(transition)
        await dispatch('fetchStatusTransitions')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Creating status transition failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Delete status transition
    async deleteStatusTransition({ commit, dispatch }, transition) {
      commit('SET_LOADING', true)
      try {
        await api.statusTransition.deleteStatusTransition(transition)
        await dispatch('fetchStatusTransitions')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Deleting status transition failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Geography data
    async fetchCountries({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.geography.getCountries()
        const countries = response.data.metadata.countries || []
        
        // Ensure Vietnam is always available
        const hasVietnam = countries.some(country => 
          country.countryName === 'Vietnam' || 
          country.countryName === 'Viet Nam' || 
          country.countryName.toLowerCase().includes('viet')
        )
        
        if (!hasVietnam) {
          countries.push({
            countryName: 'Vietnam',
            geonameId: '1562822'
          })
        }
        
        commit('SET_COUNTRIES', countries)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Fetching countries failed')
        
        // Fallback to default countries if API fails
        const defaultCountries = [
          { countryName: 'Vietnam', geonameId: '1562822' },
          { countryName: 'United States', geonameId: '6252001' },
          { countryName: 'United Kingdom', geonameId: '2635167' },
          { countryName: 'China', geonameId: '1814991' },
          { countryName: 'Japan', geonameId: '1861060' },
          { countryName: 'France', geonameId: '3017382' }
        ]
        commit('SET_COUNTRIES', defaultCountries)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchNationalities({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.geography.getNationalities()
        commit('SET_NATIONALITIES', response.data.metadata.nationalities || [])
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Fetching nationalities failed')
        
        // Fallback to default nationalities if API fails
        const defaultNationalities = [
          'Vietnamese', 'American', 'British', 'Chinese', 'French', 'Japanese'
        ]
        commit('SET_NATIONALITIES', defaultNationalities)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Improved location children fetching with caching and better error handling
    async fetchLocationChildren({ commit, state }, geonameId) {
      if (!geonameId) {
        console.error('Invalid geonameId:', geonameId)
        return { geonames: [] }
      }
      
      if (state.locationCache[geonameId]) {
        return state.locationCache[geonameId]
      }
      
      commit('SET_LOADING', true)
      try {
        const response = await api.geography.getLocationChildren(geonameId)
        
        if (!response.data || !response.data.metadata || !response.data.metadata.children) {
          return { geonames: [] }
        }
        
        let locationData
        
        // Normalize data structure
        if (response.data.metadata.children.geonames) {
          locationData = { 
            geonames: response.data.metadata.children.geonames 
          }
        } else if (Array.isArray(response.data.metadata.children)) {
          locationData = { 
            geonames: response.data.metadata.children 
          }
        } else {
          locationData = { geonames: [] }
        }
        
        // Cache the data
        commit('SET_LOCATION_DATA', { 
          geonameId: geonameId, 
          data: locationData 
        })
        
        return locationData
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Fetching location children failed')
        return { geonames: [] }
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    getStatusTypeById: (state) => (id) => {
      return state.statusTypes.find(status => status._id === id)
    },
    getStatusTypeName: (state) => (id) => {
      const status = state.statusTypes.find(status => status._id === id)
      return status ? status.type : ''
    },
    getValidTransitionsForStatus: (state) => (fromStatusId) => {
      const transition = state.statusTransitions.find(t => t.fromStatusId === fromStatusId)
      return transition ? transition.toStatus : []
    },
    isValidStatusTransition: (state) => (fromStatusId, toStatusId) => {
      if (fromStatusId === toStatusId) return true
      const transition = state.statusTransitions.find(t => t.fromStatusId === fromStatusId)
      if (!transition) return false
      return transition.toStatus.some(status => status._id === toStatusId)
    },
    getCountryByName: (state) => (countryName) => {
      if (!countryName) return null
      
      // First try exact match
      let country = state.countries.find(c => c.countryName === countryName)
      
      // If not found, try case-insensitive match
      if (!country) {
        const countryNameLower = countryName.toLowerCase()
        country = state.countries.find(c => c.countryName.toLowerCase() === countryNameLower)
      }
      
      // If still not found, try partial match
      if (!country) {
        const countryNameLower = countryName.toLowerCase()
        country = state.countries.find(c => 
          c.countryName.toLowerCase().includes(countryNameLower) || 
          countryNameLower.includes(c.countryName.toLowerCase())
        )
      }
      
      return country
    }
  }
}