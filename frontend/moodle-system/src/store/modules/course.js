import api from '@/services/api'

export default {
  namespaced: true,
  
  state: {
    courses: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_COURSES(state, courses) {
      state.courses = courses
    },
    ADD_COURSE(state, course) {
      // Ensure state.courses is an array before pushing
      if (!Array.isArray(state.courses)) {
        state.courses = []
      }
      state.courses.push(course)
    },
    UPDATE_COURSE(state, updatedCourse) {
      const index = state.courses.findIndex(c => c.courseCode === updatedCourse.courseCode)
      if (index !== -1) {
        state.courses.splice(index, 1, updatedCourse)
      }
    },
    REMOVE_COURSE(state, courseCode) {
      state.courses = state.courses.filter(c => c.courseCode !== courseCode)
    },
    SET_COURSE_ACTIVE_STATUS(state, { courseCode, isActive }) {
      const course = state.courses.find(c => c.courseCode === courseCode)
      if (course) {
        course.isActive = isActive
      }
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    // Fetch all courses
    async fetchCourses({ commit }, params = {}) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getCourses(params)
        console.log('API response for courses:', response.data);
        
        // Check if response has the expected structure
        if (response.data && response.data.metadata) {
          // Properly extract courses from the response
          const coursesData = response.data.metadata.courses || [];
          console.log('Extracted courses:', coursesData);
          commit('SET_COURSES', coursesData);
          return response.data.metadata;
        } else {
          console.error('Unexpected API response structure:', response.data);
          commit('SET_COURSES', []);
          return { courses: [] };
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        commit('SET_ERROR', error.message || 'Error fetching courses');
        // Set empty array on error to prevent issues with computed properties
        commit('SET_COURSES', []);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Create a new course
    async createCourse({ commit }, courseData) {
      commit('SET_LOADING', true)
      try {
        // Ensure prerequisites is an array
        if (!courseData.prerequisites) {
          courseData.prerequisites = [];
        }
        
        // Convert numeric values to ensure they're numbers, not strings
        if (courseData.credits) {
          courseData.credits = Number(courseData.credits);
        }
        
        // Log the data being sent to help debug
        console.log('Creating course with data:', courseData);
        
        const response = await api.createCourse(courseData)
        if (response.data && response.data.metadata && response.data.metadata.newCourse) {
          commit('ADD_COURSE', response.data.metadata.newCourse)
        }
        return response.data.metadata
      } catch (error) {
        console.error('Error creating course:', error.response || error);
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Error creating course')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Update an existing course
    async updateCourse({ commit }, { courseCode, data }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.updateCourse(courseCode, data)
        commit('UPDATE_COURSE', response.data.metadata.updatedCourse)
        return response.data.metadata
      } catch (error) {
        commit('SET_ERROR', error.message || 'Error updating course')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Delete a course
    async deleteCourse({ commit }, courseCode) {
      commit('SET_LOADING', true)
      try {
        const response = await api.deleteCourse(courseCode)
        commit('REMOVE_COURSE', courseCode)
        return response.data.metadata
      } catch (error) {
        commit('SET_ERROR', error.message || 'Error deleting course')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Toggle course active status (activate/deactivate)
    async toggleCourseActiveStatus({ commit }, { courseCode, isActive }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.updateCourse(courseCode, { isActive })
        commit('SET_COURSE_ACTIVE_STATUS', { courseCode, isActive })
        return response.data.metadata
      } catch (error) {
        commit('SET_ERROR', error.message || 'Error updating course status')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  
  getters: {
    // Get course by course code
    getCourseByCode: (state) => (courseCode) => {
      return state.courses.find(course => course.courseCode === courseCode)
    },
    
    // Get active courses
    getActiveCourses: (state) => {
      return state.courses.filter(course => course.isActive)
    },
    
    // Get courses by department
    getCoursesByDepartment: (state) => (departmentId) => {
      return state.courses.filter(course => {
        const courseDeptId = typeof course.department === 'object' 
          ? course.department._id 
          : course.department
        return courseDeptId === departmentId
      })
    }
  }
}