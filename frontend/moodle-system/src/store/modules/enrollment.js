import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    enrollments: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_ENROLLMENTS(state, enrollments) {
      state.enrollments = enrollments
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
    }
  },
  getters: {

  }
}