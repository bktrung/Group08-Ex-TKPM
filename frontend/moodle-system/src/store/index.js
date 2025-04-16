import { createStore } from 'vuex'
import student from './modules/student'
import department from './modules/department'
import program from './modules/program'
import status from './modules/status'
import course from './modules/course'
import classModule from './modules/class' // Renamed to avoid using reserved keyword
import enrollment from './modules/enrollment'
import transcript from './modules/transcript'

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
    course, 
    'class': classModule,
    enrollment,
    transcript
  }
})