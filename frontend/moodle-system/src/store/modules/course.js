import api from '@/services/index.js'

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
        const { data } = await api.course.getCourses(params);
        const metadata = data?.metadata || {};

        let coursesArray = [];

        if (Array.isArray(metadata.courses)) {
          coursesArray = metadata.courses;
        } else if (Array.isArray(metadata.courses?.courses)) {
          coursesArray = metadata.courses.courses;
        }

        commit('SET_COURSES', coursesArray);
      } catch (error) {
        commit('SET_ERROR', error?.response?.data?.message || error.message || 'Error fetching courses')
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
        if (!courseData.prerequisites) {
          courseData.prerequisites = [];
        }

        if (courseData.credits) {
          courseData.credits = Number(courseData.credits);
        }

        const { data } = await api.course.createCourse(courseData);
        const newCourse = data?.metadata?.newCourse;

        if (newCourse) { commit('ADD_COURSE', newCourse); }

      } catch (error) {
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

        const updateData = {
          name: data.name,
          credits: data.credits ? Number(data.credits) : undefined,
          department: data.department,
          description: data.description
        };

        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        const response = await api.course.updateCourse(courseCode, updateData);
        const metadata = response?.data?.metadata;

        if (metadata?.updatedCourse) {
          commit('UPDATE_COURSE', metadata.updatedCourse);
        } else {
          await dispatch('fetchCourses');
        }

        return metadata || {};
      } catch (error) {
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

        const response = await api.course.deleteCourse(courseCode);

        if (response.data && response.data.metadata && response.data.metadata.deletedCourse) {
          if (response.data.metadata.deletedCourse.isActive === false) {
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
            commit('REMOVE_COURSE', courseCode);
            return {
              success: true,
              message: 'Khóa học đã được xóa thành công',
              deleted: true
            };
          }
        }

        await dispatch('fetchCourses');
        return {
          success: true,
          message: 'Thao tác thành công, làm mới dữ liệu'
        };
      } catch (error) {

        commit('SET_ERROR', error.response?.data?.message || error.message || 'Deleting course failed');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Toggle course active status
    async toggleCourseActiveStatus({ commit, dispatch }, { courseCode, isActive }) {
      commit('SET_LOADING', true);
      try {

        await api.course.toggleCourseStatus(courseCode, isActive);
        commit('SET_COURSE_ACTIVE_STATUS', { courseCode, isActive });
        await dispatch('fetchCourses');

        return {
          success: true,
          message: isActive
            ? 'Khóa học đã được mở lại thành công'
            : 'Khóa học đã được đóng thành công'
        };

      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || error.message || `Error ${isActive ? 'activating' : 'deactivating'} course`);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },

  getters: {
    getCourseByCode: (state) => (courseCode) => {
      return state.courses.find(course => course.courseCode === courseCode)
    },

    getActiveCourses: (state) => {
      return state.courses.filter(course => course.isActive)
    },

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