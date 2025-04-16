import api from '@/services/api'

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
    async postEnrollment({ commit }, enrollment) {
      commit('SET_LOADING', true)
      try {
        const response = await api.enrollCourse(enrollment)
        return response.data
      } catch (error) {
        let errorMessage = 'Lỗi không xác định'

        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }

        commit('SET_ERROR', errorMessage)

      } finally {
        commit('SET_LOADING', false)
      }
    },

    async dropEnrollment({ commit }, enrollment) {
      commit('SET_LOADING', true)
      try {
        const response = await api.dropCourse(enrollment)
        return response.data
      } catch (error) {
        let errorMessage = 'Lỗi không xác định'

        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }

        commit('SET_ERROR', errorMessage)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async getDropHistory({ commit }, studentId) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getDropCourseHistory(studentId)
        commit('SET_HISTORY', response.data.metadata.dropHistory)
        commit('SET_HISTORY_ERROR', null)
      
      } catch (error) {
        let errorMessage = 'Lỗi không xác định'

        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }

        commit('SET_HISTORY_ERROR', errorMessage)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {

  }
}