import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    enrollments: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_ENROLLMENTS(state, departments) {
      state.departments = departments
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async postEnrollment({ commit }, enrollment) {
      commit('SET_LOADING', true)
      try {
        const response = await api.postEnrollment(enrollment)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async dropEnrollment({ commit }, enrollment) {
      commit('SET_LOADING', true)
      try {
        const response = await api.dropEnrollment(enrollment)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }

    },
  },
  getters: {
   
  }
}