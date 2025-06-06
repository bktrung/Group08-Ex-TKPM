import api from '@/services/index.js'

export default {
  namespaced: true,
  state: {
    enrollments: [],
    history: [],
    loading: false,
    error: null,
    historyError: null
  },
  mutations: {

    SET_ENROLLMENTS(state, enrollments) {
      state.enrollments = enrollments
    },

    SET_HISTORY(state, history) {
      state.history = history
    },

    SET_LOADING(state, loading) {
      state.loading = loading
    },

    SET_ERROR(state, error) {
      state.error = error
    },

    SET_HISTORY_ERROR(state, error) {
      state.historyError = error
    },
  },
  actions: {

    //  Enroll a course for a student
    async postEnrollment({ commit }, enrollment) {
      commit('SET_LOADING', true)
      try {
        await api.enrollment.enrollCourse(enrollment)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Enroll course failed')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Drop an enrollment for a student
    async dropEnrollment({ commit }, enrollment) {
      commit('SET_LOADING', true)
      try {
        await api.enrollment.dropCourse(enrollment)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Drop course failed')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Fetch drop history for a student
    async getDropHistory({ commit }, studentId) {
      commit('SET_LOADING', true)
      try {
        const response = await api.enrollment.getDropCourseHistory(studentId)
        commit('SET_HISTORY', response.data.metadata.dropHistory)
        commit('SET_HISTORY_ERROR', null)
      } catch (error) {
        commit('SET_HISTORY_ERROR', error.response?.data?.message || error.message || 'Fetching drop history failed')
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },

  getters: {}

}