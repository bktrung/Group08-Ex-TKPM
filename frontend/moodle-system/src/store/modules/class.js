import api from '@/services/index.js'

export default {
  namespaced: true,

  state: {
    classes: [],
    loading: false,
    error: null
  },

  mutations: {

    SET_CLASSES(state, classes) {
      state.classes = classes
    },

    ADD_CLASS(state, classItem) {
      state.classes.push(classItem)
    },

    UPDATE_CLASS(state, updatedClass) {
      const index = state.classes.findIndex(c => c.classCode === updatedClass.classCode)
      if (index !== -1) {
        state.classes.splice(index, 1, updatedClass)
      }
    },

    SET_CLASS_ACTIVE_STATUS(state, { classCode, isActive }) {
      const classItem = state.classes.find(c => c.classCode === classCode)
      if (classItem) {
        classItem.isActive = isActive
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

    // Fetch all classes with optional parameters
    async fetchClasses({ commit }, params = {}) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const response = await api.class.getClasses(params)
        const metadata = response?.data?.metadata || {}

        const { classes, docs, ...rest } = metadata
        let classesArray = []

        if (Array.isArray(classes)) classesArray = classes
        else if (Array.isArray(docs)) classesArray = docs
        else {
          for (const key in rest) {
            if (Array.isArray(rest[key]) && rest[key].length > 0 && rest[key][0].classCode) {
              classesArray = rest[key]
              break
            }
          }
        }

        commit('SET_CLASSES', classesArray)
        
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Error fetching classes')
        commit('SET_CLASSES', [])
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Create a new class
    async addClass({ commit }, classData) {
      commit('SET_LOADING', true)
      try {
        const response = await api.class.createClass(classData)
        commit('ADD_CLASS', response.data.metadata.newClass)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Creating class failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Update an existing class
    async updateClass({ commit }, { classCode, data }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.class.updateClass(classCode, data)
        commit('UPDATE_CLASS', response.data.metadata.updatedClass)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Updating class failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Toggle class active status
    async toggleClassActiveStatus({ commit }, { classCode, isActive }) {
      commit('SET_LOADING', true)
      try {
        await api.class.updateClass(classCode, { isActive })
        commit('SET_CLASS_ACTIVE_STATUS', { classCode, isActive })
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Updating class status failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },

  getters: {
    // Get class by class code
    getClassByCode: (state) => (classCode) => {
      return state.classes.find(classItem => classItem.classCode === classCode)
    },

    // Get active classes
    getActiveClasses: (state) => {
      return state.classes.filter(classItem => classItem.isActive)
    },

    // Get classes by course
    getClassesByCourse: (state) => (courseId) => {
      return state.classes.filter(classItem => {
        const classCourseId = typeof classItem.course === 'object'
          ? classItem.course._id
          : classItem.course
        return classCourseId === courseId
      })
    },

    // Get classes by academic year and semester
    getClassesByTerm: (state) => (academicYear, semester) => {
      return state.classes.filter(classItem =>
        classItem.academicYear === academicYear &&
        classItem.semester === semester
      )
    }
  }
}