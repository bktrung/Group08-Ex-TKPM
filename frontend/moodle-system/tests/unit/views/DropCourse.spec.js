import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import DropCourse from '@/views/DropCourse.vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      enrollment: {
        drop: {
          title: 'Drop Course',
          reason: 'Drop Reason',
          enter_reason: 'Enter drop reason',
          confirmation: 'Are you sure you want to remove student {studentId} from class {classCode}?',
          confirm_success: 'Student {studentId} has been successfully removed from class {classCode}.',
          failed: 'Drop failed',
          history: {
            search_by_id: 'Search by student ID',
            no_data: 'No drop history',
            loading_error: 'Cannot load drop history'
          }
        }
      },
      student: {
        student_id: 'Student ID',
        enter_student_id: 'Enter student ID',
        name: 'Name'
      },
      class: {
        class_code: 'Class Code'
      },
      common: {
        delete: 'Delete',
        search: 'Search',
        reason: 'Reason',
        fill_all_required: 'Please fill all required fields',
        confirm_cancel: 'Confirm Cancel',
        cancel_success: 'Cancel Success',
        cancel_failed: 'Cancel Failed'
      }
    }
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
})

const createMockStore = (initialState = {}) => {
  return createStore({
    modules: {
      enrollment: {
        namespaced: true,
        state: {
          loading: false,
          error: null,
          history: [],
          historyError: null,
          ...initialState.enrollment
        },
        actions: {
          dropEnrollment: jest.fn(),
          getDropHistory: jest.fn()
        }
      }
    }
  })
}

describe('DropCourse.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(DropCourse, {
      global: {
        plugins: [store, i18n, router]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('h3').text()).toBe('Drop Course')
    expect(wrapper.find('input[placeholder="Enter student ID"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('Delete')
  })

  it('should show validation error when fields are empty', async () => {
    const deleteButton = wrapper.find('button')
    await deleteButton.trigger('click')
    
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showErrorModal).toBe(true)
  })

  it('should show confirm modal when all fields are filled', async () => {
    await wrapper.find('input').setValue('123456')
    await wrapper.findAll('input')[1].setValue('CS101')
    await wrapper.find('textarea').setValue('Test reason')
    
    const deleteButton = wrapper.find('button')
    await deleteButton.trigger('click')
    
    expect(wrapper.vm.showConfirmModal).toBe(true)
  })

  it('should load drop history when search is clicked', async () => {
    const searchInput = wrapper.findAll('input')[2] // Search MSSV input
    await searchInput.setValue('123456')
    
    const searchButton = wrapper.findAll('button')[1] // Search button
    await searchButton.trigger('click')
    
    expect(store._actions['enrollment/getDropHistory']).toHaveBeenCalledWith(
      expect.any(Object),
      '123456',
      undefined
    )
  })

  it('should display drop history when available', async () => {
    const historyData = [{
      _id: '1',
      student: { studentId: '123456', fullName: 'John Doe' },
      class: { classCode: 'CS101' },
      dropReason: 'Test reason',
      enrollmentDate: new Date().toISOString(),
      dropDate: new Date().toISOString()
    }]
    
    await wrapper.setData({ dropHistory: historyData })
    
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.text()).toContain('123456')
    expect(wrapper.text()).toContain('John Doe')
  })

  it('should perform delete when confirmed', async () => {
    await wrapper.setData({
      studentId: '123456',
      classCode: 'CS101',
      reason: 'Test reason'
    })
    
    await wrapper.vm.performDelete()
    
    expect(store._actions['enrollment/dropEnrollment']).toHaveBeenCalledWith(
      expect.any(Object),
      {
        studentId: '123456',
        classCode: 'CS101',
        dropReason: 'Test reason'
      },
      undefined
    )
  })

  it('should format date correctly', () => {
    const isoString = '2023-01-01T00:00:00.000Z'
    const formatted = wrapper.vm.formatDate(isoString)
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
  })

  it('should reset form after successful delete', async () => {
    await wrapper.setData({
      studentId: '123456',
      classCode: 'CS101',
      reason: 'Test reason'
    })
    
    // Mock successful delete
    store.state.enrollment.error = null
    await wrapper.vm.performDelete()
    
    expect(wrapper.vm.studentId).toBe('')
    expect(wrapper.vm.classCode).toBe('')
    expect(wrapper.vm.reason).toBe('')
  })
})