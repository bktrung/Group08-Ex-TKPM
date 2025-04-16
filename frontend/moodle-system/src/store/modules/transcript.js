import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    transcript: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_TRANSCRIPT(state, transcript) {
      state.transcript = transcript
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async getTranscript({ commit }, studentId) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getTranscript(studentId)
        commit('SET_TRANSCRIPT', response.data)
        commit('SET_ERROR', null)
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