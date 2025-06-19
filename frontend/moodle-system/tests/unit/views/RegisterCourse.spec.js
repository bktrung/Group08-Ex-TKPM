import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import RegisterCourse from '@/views/RegisterCourse.vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      enrollment: {
        register: {
          title: 'Course Registration',
          success: 'Registration Success',
          failed: 'Registration Failed',
          confirm_success: 'Successfully registered class {registeredClassCode} for student {studentQuery}'
        }
      },
      student: {
        student_id: 'Student ID',
        enter_student_id: 'Enter student ID',
        validation: {
          required_student_id: 'Student ID is required'
        }
      },
      course: {
        load_error: 'Error loading courses'
      },
      common: {
        error: 'Error'
      }
    }
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } }
  ]
})

// Mock CourseTable and ClassTable components
const CourseTableMock = {
  template: '<div class="course-table-mock">Course Table</div>',
  emits: ['select-course']
}

const ClassTableMock = {
  template: '<div class="class-table-mock">Class Table</div>',
  props: ['courseId'],
  emits: ['register']
}

const createMockStore = (initialState = {}) => {
  return createStore({
    modules: {
      course: {
        namespaced: true,
        actions: {
          fetchCourses: jest.fn()
        }
      },
      enrollment: {
        namespaced: true,
        state: {
          loading: false,
          error: null,
          ...initialState.enrollment
        },
        actions: {
          postEnrollment: jest.fn()
        }
      }
    }
  })
}

describe('RegisterCourse.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(RegisterCourse, {
      global: {
        plugins: [store, i18n, router],
        components: {
          CourseTable: CourseTableMock,
          ClassTable: ClassTableMock
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('h3').text()).toBe('Course Registration')
    expect(wrapper.find('input[placeholder="Enter student ID"]').exists()).toBe(true)
    expect(wrapper.find('.course-table-mock').exists()).toBe(true)
  })

  it('should show class table when course is selected', async () => {
    await wrapper.vm.selectCourse({ _id: 'course123' })
    
    expect(wrapper.vm.selectedCourseId).toBe('course123')
    expect(wrapper.find('.class-table-mock').exists()).toBe(true)
  })

  it('should not show class table initially', () => {
    expect(wrapper.vm.selectedCourseId).toBe(null)
    expect(wrapper.find('.class-table-mock').exists()).toBe(false)
  })

  it('should show error when registering without student ID', async () => {
    await wrapper.vm.register('CS101')
    
    expect(wrapper.vm.showErrorModal).toBe(true)
  })

  it('should register successfully with valid data', async () => {
    await wrapper.find('input').setValue('123456')
    await wrapper.vm.register('CS101')
    
    expect(store._actions['enrollment/postEnrollment']).toHaveBeenCalledWith(
      expect.any(Object),
      {
        studentId: '123456',
        classCode: 'CS101'
      },
      undefined
    )
  })

  it('should show success modal on successful registration', async () => {
    await wrapper.find('input').setValue('123456')
    store.state.enrollment.error = null
    
    await wrapper.vm.register('CS101')
    
    expect(wrapper.vm.showSuccessModal).toBe(true)
    expect(wrapper.vm.registeredClassCode).toBe('CS101')
  })

  it('should handle registration error', async () => {
    await wrapper.find('input').setValue('123456')
    store.state.enrollment.error = 'Registration failed'
    
    await wrapper.vm.register('CS101')
    
    expect(wrapper.vm.showErrorModal).toBe(true)
  })

  it('should fetch courses on mount', () => {
    expect(store._actions['course/fetchCourses']).toHaveBeenCalled()
  })

  it('should navigate back when goBack is called', () => {
    const backSpy = jest.spyOn(router, 'back')
    wrapper.vm.goBack()
    
    expect(backSpy).toHaveBeenCalled()
  })

  it('should emit select-course event from CourseTable', async () => {
    const courseTable = wrapper.findComponent(CourseTableMock)
    await courseTable.vm.$emit('select-course', { _id: 'course456' })
    
    expect(wrapper.vm.selectedCourseId).toBe('course456')
  })

  it('should emit register event from ClassTable', async () => {
    await wrapper.setData({ selectedCourseId: 'course123', studentQuery: '123456' })
    
    const classTable = wrapper.findComponent(ClassTableMock)
    await classTable.vm.$emit('register', 'CS102')
    
    expect(store._actions['enrollment/postEnrollment']).toHaveBeenCalledWith(
      expect.any(Object),
      {
        studentId: '123456',
        classCode: 'CS102'
      },
      undefined
    )
  })
})