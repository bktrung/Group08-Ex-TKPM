import api from '@/services/index.js'

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

    // Fetch all programs
    async fetchPrograms({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.program.getPrograms()
        commit('SET_PROGRAMS', response.data.metadata.programs)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Fetching programs failed')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Create a new program
    async createProgram({ commit, dispatch }, program) {
      commit('SET_LOADING', true)
      try {
        await api.program.createProgram(program)
        await dispatch('fetchPrograms')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Creating program failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Update an existing program
    async updateProgram({ commit, dispatch }, { id, program }) {
      commit('SET_LOADING', true)
      try {
        await api.program.updateProgram(id, program)
        await dispatch('fetchPrograms')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Updating program failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Delete a program
    async deleteProgram({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.program.deleteProgram(id)
        await dispatch('fetchPrograms')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Deleting program failed')
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