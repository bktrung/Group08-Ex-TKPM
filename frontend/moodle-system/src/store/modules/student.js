import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    students: [],
    currentPage: 1,
    totalPages: 1,
    selectedStudent: null,
    isSearchMode: false,
    searchQuery: '',
    selectedDepartment: '',
    loading: false,
    error: null
  },
  mutations: {
    SET_STUDENTS(state, students) {
      state.students = students
    },
    SET_PAGINATION(state, { currentPage, totalPages }) {
      state.currentPage = currentPage
      state.totalPages = totalPages
    },
    SET_SELECTED_STUDENT(state, student) {
      state.selectedStudent = student
    },
    SET_SEARCH_MODE(state, isSearchMode) {
      state.isSearchMode = isSearchMode
    },
    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query
    },
    SET_SELECTED_DEPARTMENT(state, departmentId) {
      state.selectedDepartment = departmentId
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchStudents({ commit }, { page = 1, limit = 10 }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getStudents(page, limit)
        commit('SET_STUDENTS', response.data.metadata.students)
        commit('SET_PAGINATION', { 
          currentPage: page, 
          totalPages: response.data.metadata.pagination.totalPages 
        })
        commit('SET_SEARCH_MODE', false)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchStudent({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getStudent(id)
        commit('SET_SELECTED_STUDENT', response.data.metadata)
        return response.data.metadata
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createStudent({ commit }, student) {
      commit('SET_LOADING', true)
      try {
        const response = await api.createStudent(student)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateStudent({ commit }, { id, student }) {
      commit('SET_LOADING', true);
      try {
        // Log the data being sent
        console.log('Updating student with ID:', id);
        console.log('Data being sent:', JSON.stringify(student, null, 2));
        
        const response = await api.updateStudent(id, student);
        return response.data;
      } catch (error) {
        console.error('Update student error details:', {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : 'No response data',
          requestData: student
        });
        
        commit('SET_ERROR', error.response?.data?.message || error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async deleteStudent({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        const response = await api.deleteStudent(id)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async searchStudents({ commit }, { query = '', departmentId = '', page = 1, limit = 10 }) {
      commit('SET_LOADING', true)
      commit('SET_SEARCH_QUERY', query)
      commit('SET_SELECTED_DEPARTMENT', departmentId)
      
      try {
        let response
        
        if (departmentId && !query) {
          // Search by department only
          response = await api.getStudentsByDepartment(departmentId, page, limit)
        } else if (query && !departmentId) {
          // Search by query only
          response = await api.searchStudents(query, page, limit)
        } else if (query && departmentId) {
          // Search by both department and query
          const deptResponse = await api.getStudentsByDepartment(departmentId, 1, 1000)
          const deptStudents = deptResponse.data.metadata.students || []
          
          // Filter students by name or ID
          const filteredStudents = deptStudents.filter(student => 
            student.fullName.toLowerCase().includes(query.toLowerCase()) || 
            student.studentId.toLowerCase().includes(query.toLowerCase())
          )
          
          // Implement manual pagination
          const totalItems = filteredStudents.length
          const totalPages = Math.ceil(totalItems / limit)
          const startIdx = (page - 1) * limit
          const endIdx = Math.min(startIdx + limit, totalItems)
          
          const paginatedStudents = filteredStudents.slice(startIdx, endIdx)
          
          commit('SET_STUDENTS', paginatedStudents)
          commit('SET_PAGINATION', { currentPage: page, totalPages })
          commit('SET_SEARCH_MODE', true)
          commit('SET_LOADING', false)
          return
        } else {
          // No search criteria, fetch all students
          return await this.dispatch('student/fetchStudents', { page, limit })
        }
        
        commit('SET_STUDENTS', response.data.metadata.students)
        commit('SET_PAGINATION', { 
          currentPage: page, 
          totalPages: response.data.metadata.pagination.totalPages 
        })
        commit('SET_SEARCH_MODE', true)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    exportStudents(_, format) {
      return api.exportStudents(format)
    },
    
    async importStudents({ commit }, formData) {
      commit('SET_LOADING', true)
      try {
        const response = await api.importStudents(formData)
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
    getStudentById: (state) => (id) => {
      return state.students.find(student => student.studentId === id)
    }
  }
}