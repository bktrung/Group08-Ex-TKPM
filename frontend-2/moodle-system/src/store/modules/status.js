import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    statusTypes: [],
    statusTransitions: [],
    countries: [],
    nationalities: [],
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
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    // Status types
    async fetchStatusTypes({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getStatusTypes()
        const statusTypes = response.data.metadata || []
        commit('SET_STATUS_TYPES', statusTypes)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createStatusType({ commit, dispatch }, statusType) {
      commit('SET_LOADING', true)
      try {
        const response = await api.createStatusType(statusType)
        await dispatch('fetchStatusTypes')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateStatusType({ commit, dispatch }, { id, statusType }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.updateStatusType(id, statusType)
        await dispatch('fetchStatusTypes')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteStatusType({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        const response = await api.deleteStatusType(id)
        await dispatch('fetchStatusTypes')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Status transitions
    async fetchStatusTransitions({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getStatusTransitions()
        commit('SET_STATUS_TRANSITIONS', response.data.metadata || [])
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createStatusTransition({ commit, dispatch }, transition) {
      commit('SET_LOADING', true)
      try {
        const response = await api.createStatusTransition(transition)
        await dispatch('fetchStatusTransitions')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteStatusTransition({ commit, dispatch }, transition) {
      commit('SET_LOADING', true)
      try {
        const response = await api.deleteStatusTransition(transition)
        await dispatch('fetchStatusTransitions')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Geography data
    async fetchCountries({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getCountries()
        commit('SET_COUNTRIES', response.data.metadata.countries || [])
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchNationalities({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getNationalities()
        commit('SET_NATIONALITIES', response.data.metadata.nationalities || [])
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchLocationChildren(_, geonameId) {
      try {
        const response = await api.getLocationChildren(geonameId)
        return response.data.metadata.children
      } catch (error) {
        console.error('Error fetching location children:', error)
        throw error
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
    }
  }
}