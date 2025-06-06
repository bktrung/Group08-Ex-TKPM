import api from '@/services/index.js'

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
    
    // Fetch all departments
    async fetchDepartments({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.department.getDepartments()
        commit('SET_DEPARTMENTS', response.data.metadata.departments)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Fetching departments failed')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Create a new department
    async createDepartment({ commit, dispatch }, department) {
      commit('SET_LOADING', true)
      try {
        await api.department.createDepartment(department)
        await dispatch('fetchDepartments')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Creating department failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Update an existing department
    async updateDepartment({ commit, dispatch }, { id, department }) {
      commit('SET_LOADING', true)
      try {
        await api.department.updateDepartment(id, department)
        await dispatch('fetchDepartments')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Updating department failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Delete a department
    async deleteDepartment({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.department.deleteDepartment(id)
        await dispatch('fetchDepartments')
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Deleting department failed')
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