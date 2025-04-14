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
        
        // Check if response has the expected structure
        if (response.data && response.data.metadata) {
          const metadata = response.data.metadata;
          
          // Check different possible locations of courses array
          let coursesArray = [];
          
          if (metadata.courses && Array.isArray(metadata.courses)) {
            // Direct courses array
            coursesArray = metadata.courses;
          } else if (metadata.courses && metadata.courses.courses && Array.isArray(metadata.courses.courses)) {
            // Nested courses
            coursesArray = metadata.courses.courses;
          }
          
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
        
        // Attempt to delete the course - backend sẽ xử lý deactivate nếu không thể xóa
        const response = await api.deleteCourse(courseCode);
        
        if (response.data && response.data.metadata && response.data.metadata.deletedCourse) {
          // Nếu xóa thành công
          if (response.data.metadata.deletedCourse.isActive === false) {
            // Trường hợp khóa học bị deactivate
            commit('SET_COURSE_ACTIVE_STATUS', { 
              courseCode, 
              isActive: false 
            });
            return { 
              success: true, 
              message: 'Khóa học đã được đóng thành công',
              deactivated: true
            };
          } else {
            // Trường hợp khóa học bị xóa hoàn toàn
            commit('REMOVE_COURSE', courseCode);
            return { 
              success: true, 
              message: 'Khóa học đã được xóa thành công',
              deleted: true
            };
          }
        }
        
        // Nếu không có response.data.metadata.deletedCourse, cập nhật lại danh sách
        await dispatch('fetchCourses');
        return { 
          success: true, 
          message: 'Thao tác thành công, làm mới dữ liệu'
        };
      } catch (error) {
        console.error('Error in deleteCourse:', error);
        commit('SET_ERROR', error.message || 'Error deleting course');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Toggle course active status (activate/deactivate)
    async toggleCourseActiveStatus({ commit, dispatch }, { courseCode, isActive }) {
      commit('SET_LOADING', true);
      try {
        console.log(`${isActive ? 'Activating' : 'Deactivating'} course ${courseCode}`);
        
        // Gọi API và sử dụng kết quả
        await api.toggleCourseStatus(courseCode, isActive);
        
        // Cập nhật trạng thái trong store
        commit('SET_COURSE_ACTIVE_STATUS', { courseCode, isActive });
        
        // Refresh dữ liệu từ server để đảm bảo đồng bộ
        await dispatch('fetchCourses');
        
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