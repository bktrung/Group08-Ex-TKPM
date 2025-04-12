import { createStore } from 'vuex'
import student from './modules/student'
import department from './modules/department'
import program from './modules/program'
import status from './modules/status'
import course from './modules/course'

export default createStore({
  state: {
    loading: false,
    error: null
  },
  getters: {
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
  },
  modules: {
    student,
    department,
    program,
    status,
    course 
  }
})