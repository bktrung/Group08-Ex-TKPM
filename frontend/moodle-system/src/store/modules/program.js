import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    programs: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_PROGRAMS(state, programs) {
      state.programs = programs
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchPrograms({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getPrograms()
        commit('SET_PROGRAMS', response.data.metadata.programs)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createProgram({ commit, dispatch }, program) {
      commit('SET_LOADING', true)
      try {
        const response = await api.createProgram(program)
        await dispatch('fetchPrograms')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateProgram({ commit, dispatch }, { id, program }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.updateProgram(id, program)
        await dispatch('fetchPrograms')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteProgram({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        const response = await api.deleteProgram(id)
        await dispatch('fetchPrograms')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    getProgramById: (state) => (id) => {
      return state.programs.find(program => program._id === id)
    },
    getProgramName: (state) => (id) => {
      const program = state.programs.find(program => program._id === id)
      return program ? program.name : ''
    }
  }
}