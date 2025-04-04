import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    departments: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_DEPARTMENTS(state, departments) {
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
    async fetchDepartments({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getDepartments()
        commit('SET_DEPARTMENTS', response.data.metadata.departments)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createDepartment({ commit, dispatch }, department) {
      commit('SET_LOADING', true)
      try {
        const response = await api.createDepartment(department)
        await dispatch('fetchDepartments')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateDepartment({ commit, dispatch }, { id, department }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.updateDepartment(id, department)
        await dispatch('fetchDepartments')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteDepartment({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        const response = await api.deleteDepartment(id)
        await dispatch('fetchDepartments')
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
    getDepartmentById: (state) => (id) => {
      return state.departments.find(department => department._id === id)
    },
    getDepartmentName: (state) => (id) => {
      const department = state.departments.find(department => department._id === id)
      return department ? department.name : ''
    }
  }
}