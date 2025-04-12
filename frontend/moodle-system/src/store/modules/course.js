import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    courses: [],
    selectedCourse: null,
    classes: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1
  },
  mutations: {
    SET_COURSES(state, courses) {
      state.courses = courses
    },
    SET_SELECTED_COURSE(state, course) {
      state.selectedCourse = course
    },
    SET_CLASSES(state, classes) {
      state.classes = classes
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_PAGINATION(state, { currentPage, totalPages }) {
      state.currentPage = currentPage
      state.totalPages = totalPages
    }
  },
  actions: {
    async fetchCourses({ commit }, { page = 1, limit = 10 } = {}) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getCourses(page, limit)
        commit('SET_COURSES', response.data.metadata.courses || [])
        commit('SET_PAGINATION', { 
          currentPage: page, 
          totalPages: response.data.metadata.pagination?.totalPages || 1 
        })
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchCourse({ commit }, courseCode) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getCourse(courseCode)
        commit('SET_SELECTED_COURSE', response.data.metadata.course)
        return response.data.metadata.course
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createCourse({ commit }, courseData) {
      commit('SET_LOADING', true)
      try {
        const response = await api.createCourse(courseData)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateCourse({ commit }, { courseCode, courseData }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.updateCourse(courseCode, courseData)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteCourse({ commit }, courseCode) {
      commit('SET_LOADING', true)
      try {
        const response = await api.deleteCourse(courseCode)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchCourseClasses({ commit }, courseCode) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getCourseClasses(courseCode)
        commit('SET_CLASSES', response.data.metadata.classes || [])
        return response.data.metadata.classes
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createClass({ commit }, classData) {
      commit('SET_LOADING', true)
      try {
        const response = await api.createClass(classData)
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
    getCourseByCode: (state) => (courseCode) => {
      return state.courses.find(course => course.courseCode === courseCode)
    },
    getCreationTimeRemaining: () => (course) => {
      if (!course || !course.createdAt) return 0
      
      const createdTime = new Date(course.createdAt).getTime()
      const currentTime = new Date().getTime()
      const thirtyMinutesInMs = 30 * 60 * 1000
      
      // Time remaining in milliseconds
      const timeRemainingMs = Math.max(0, thirtyMinutesInMs - (currentTime - createdTime))
      
      // Convert to minutes
      return Math.ceil(timeRemainingMs / (60 * 1000))
    },
    canDeleteCourse: (state, getters) => (course) => {
      // Can delete if within 30 minutes of creation and no classes exist
      return getters.getCreationTimeRemaining(course) > 0 && 
             (!course.classes || course.classes.length === 0)
    }
  }
}