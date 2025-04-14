import api from '@/services/api'

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
    // Fetch all classes or filtered classes
    async fetchClasses({ commit }, params = {}) {
      commit('SET_LOADING', true);
      try {
        const response = await api.getClasses(params);
        console.log('API response for classes:', response.data);
        
        // Check if response has the expected structure
        if (response.data && response.data.metadata) {
          const metadata = response.data.metadata;
          console.log('Response metadata:', metadata);
          
          // Check different possible locations of classes array
          let classesArray = [];
          
          if (metadata.classes && Array.isArray(metadata.classes)) {
            // Direct classes array
            classesArray = metadata.classes;
            console.log('Found classes array directly in metadata.classes');
          } else if (metadata.docs && Array.isArray(metadata.docs)) {
            // MongoDB pagination response format
            classesArray = metadata.docs;
            console.log('Found classes array in metadata.docs');
          } else {
            // Try to find any array property that might contain classes
            for (const key in metadata) {
              if (Array.isArray(metadata[key]) && metadata[key].length > 0) {
                // Check if first item has classCode property which suggests it's a class
                if (metadata[key][0] && metadata[key][0].classCode) {
                  classesArray = metadata[key];
                  console.log(`Found classes array in metadata.${key}`);
                  break;
                }
              }
            }
          }
          
          console.log('Extracted classes:', classesArray);
          commit('SET_CLASSES', classesArray);
          return metadata;
        } else {
          console.error('Unexpected API response structure:', response.data);
          commit('SET_CLASSES', []);
          return { classes: [] };
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        commit('SET_ERROR', error.message || 'Error fetching classes');
        // Set empty array on error to prevent issues with computed properties
        commit('SET_CLASSES', []);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Create a new class
    async addClass({ commit }, classData) {
      commit('SET_LOADING', true)
      try {
        const response = await api.createClass(classData)
        commit('ADD_CLASS', response.data.metadata.newClass)
        return response.data.metadata
      } catch (error) {
        commit('SET_ERROR', error.message || 'Error creating class')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Update an existing class
    async updateClass({ commit }, { classCode, data }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.updateClass(classCode, data)
        commit('UPDATE_CLASS', response.data.metadata.updatedClass)
        return response.data.metadata
      } catch (error) {
        commit('SET_ERROR', error.message || 'Error updating class')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Toggle class active status
    async toggleClassActiveStatus({ commit }, { classCode, isActive }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.updateClass(classCode, { isActive })
        commit('SET_CLASS_ACTIVE_STATUS', { classCode, isActive })
        return response.data.metadata
      } catch (error) {
        commit('SET_ERROR', error.message || 'Error updating class status')
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