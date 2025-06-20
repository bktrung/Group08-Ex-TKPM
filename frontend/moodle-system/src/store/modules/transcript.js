import api from '@/services/index.js'

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
        commit('SET_TRANSCRIPT', null)
        const response = await api.enrollment.getTranscript(studentId)
       
        commit('SET_TRANSCRIPT', response.data.metadata.transcript)

        commit('SET_ERROR', null)
        return response.data.metadata.transcript
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Fetching transcript failed')
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {

  }
}