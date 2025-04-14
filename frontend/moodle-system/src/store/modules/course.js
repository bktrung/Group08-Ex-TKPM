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
          const metadata = response.data.metadata;
          console.log('Response metadata:', metadata);
          
          // Check different possible locations of courses array
          let coursesArray = [];
          
          if (metadata.courses && Array.isArray(metadata.courses)) {
            // Direct courses array
            coursesArray = metadata.courses;
            console.log('Found courses array directly in metadata.courses');
          } else if (metadata.courses && metadata.courses.courses && Array.isArray(metadata.courses.courses)) {
            // Nested courses
            coursesArray = metadata.courses.courses;
            console.log('Found courses array in metadata.courses.courses');
          }
          
          console.log('Extracted courses:', coursesArray);
          commit('SET_COURSES', coursesArray);
          return metadata;
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
    async updateCourse({ commit, dispatch }, { courseCode, data }) {
      commit('SET_LOADING', true)
      try {
        console.log('Updating course with courseCode:', courseCode);
        console.log('Update data being sent:', data);
        
        // Ensure we're only sending allowed fields for update
        const updateData = {
          name: data.name,
          credits: data.credits ? Number(data.credits) : undefined,
          department: data.department,
          description: data.description
        };
        
        // Remove any undefined fields
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });
        
        console.log('Sanitized update data:', updateData);
        
        const response = await api.updateCourse(courseCode, updateData)
        
        // Check if response contains the updated course
        if (response.data && response.data.metadata && response.data.metadata.updatedCourse) {
          commit('UPDATE_COURSE', response.data.metadata.updatedCourse)
          return response.data.metadata
        } else {
          console.warn('Update course response does not contain updated course data:', response.data);
          // Refresh the courses list to get the updated data
          await dispatch('fetchCourses');
          return response.data.metadata
        }
      } catch (error) {
        console.error('Error updating course:', error);
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Error updating course')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Delete a course
    async deleteCourse({ commit, dispatch }, courseCode) {
      commit('SET_LOADING', true)
      try {
        console.log('Attempting to delete course with code:', courseCode);
        
        // First check if the course has any classes
        // This should be done by the backend, but we'll add extra validation here
        const coursesWithClasses = await dispatch('fetchCoursesWithClasses');
        const hasClasses = coursesWithClasses.some(c => c.courseCode === courseCode);
        
        if (hasClasses) {
          console.log('Course has classes, deactivating instead of deleting');
          // If it has classes, deactivate instead
          return await dispatch('toggleCourseActiveStatus', { 
            courseCode, 
            isActive: false 
          });
        }
        
        // If no classes, attempt to delete
        const response = await api.deleteCourse(courseCode);
        
        if (response.status === 200 || response.status === 204) {
          commit('REMOVE_COURSE', courseCode);
          return { success: true, message: 'Khóa học đã được xóa thành công' };
        } else {
          // If deletion not allowed, deactivate instead
          console.log('Deletion not allowed, deactivating instead');
          return await dispatch('toggleCourseActiveStatus', { 
            courseCode, 
            isActive: false 
          });
        }
      } catch (error) {
        console.error('Error in deleteCourse:', error);
        
        // If deletion fails with a 400 error, it might be because the course has classes
        // In this case, we should try to deactivate instead
        if (error.response && error.response.status === 400) {
          try {
            console.log('Deletion failed with 400, trying to deactivate instead');
            return await dispatch('toggleCourseActiveStatus', { 
              courseCode, 
              isActive: false 
            });
          } catch (deactivateError) {
            console.error('Error deactivating course:', deactivateError);
            commit('SET_ERROR', 'Không thể xóa hoặc đóng khóa học');
            throw deactivateError;
          }
        }
        
        commit('SET_ERROR', error.message || 'Error deleting course');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Toggle course active status (activate/deactivate)
    async toggleCourseActiveStatus({ commit }, { courseCode, isActive }) {
      commit('SET_LOADING', true);
      try {
        console.log(`${isActive ? 'Activating' : 'Deactivating'} course ${courseCode}`);
        
        // Only send the isActive field in the update
        const response = await api.updateCourse(courseCode, { isActive });
        
        if (response.data && response.data.metadata && response.data.metadata.updatedCourse) {
          commit('SET_COURSE_ACTIVE_STATUS', { courseCode, isActive });
        } else {
          // If the response doesn't include the updated course, update the status manually
          commit('SET_COURSE_ACTIVE_STATUS', { courseCode, isActive });
        }
        
        return { 
          success: true, 
          message: isActive 
            ? 'Khóa học đã được mở lại thành công' 
            : 'Khóa học đã được đóng thành công' 
        };
      } catch (error) {
        console.error('Error toggling course status:', error);
        commit('SET_ERROR', error.message || `Error ${isActive ? 'activating' : 'deactivating'} course`);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Fetch courses with information about whether they have classes
    async fetchCoursesWithClasses() {
      // In a real implementation, this would call a specific API endpoint
      // For now, we're simulating it using the existing courses data
      try {
        const response = await api.getCourses();
        if (response.data && response.data.metadata && response.data.metadata.courses) {
          return response.data.metadata.courses;
        }
        return [];
      } catch (error) {
        console.error('Error fetching courses with classes info:', error);
        return [];
      }
    },
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