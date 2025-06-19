import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import CourseForm from '@/components/course/CourseForm.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      course: {
        course_code: 'Course Code',
        name: 'Course Name',
        credits: 'Credits',
        department: 'Department',
        prerequisite: 'Prerequisites',
        description: 'Description',
        multi_select_hint: 'Hold Ctrl to select multiple',
        enter_description: 'Enter course description',
        validation: {
          required_course_code: 'Course code is required',
          invalid_course_code: 'Invalid course code format',
          required_name: 'Course name is required',
          short_name: 'Name too short',
          required_credits: 'Credits required',
          min_credits: 'Min 2 credits',
          integer_credits: 'Credits must be integer',
          required_department: 'Department required',
          required_description: 'Description required',
          short_description: 'Description too short'
        }
      },
      common: {
        choose: 'Choose',
        add: 'Add',
        update: 'Update',
        cancel: 'Cancel'
      }
    }
  }
})

const createMockStore = (initialState = {}) => {
  return createStore({
    modules: {
      department: {
        namespaced: true,
        state: {
          departments: [
            { _id: 'dept1', name: 'Computer Science' },
            { _id: 'dept2', name: 'Mathematics' }
          ],
          ...initialState.department
        },
        actions: {
          fetchDepartments: jest.fn()
        }
      },
      course: {
        namespaced: true,
        state: {
          courses: [
            { _id: 'course1', courseCode: 'CS100', name: 'Intro to Programming' },
            { _id: 'course2', courseCode: 'MATH100', name: 'Calculus I' }
          ],
          loading: false,
          ...initialState.course
        },
        actions: {
          fetchCourses: jest.fn()
        }
      }
    }
  })
}

describe('CourseForm.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(CourseForm, {
      global: {
        plugins: [store, i18n]
      },
      props: {
        courseData: {},
        isEditing: false
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#courseCode').exists()).toBe(true)
    expect(wrapper.find('#name').exists()).toBe(true)
    expect(wrapper.find('#credits').exists()).toBe(true)
    expect(wrapper.find('#department').exists()).toBe(true)
    expect(wrapper.find('#description').exists()).toBe(true)
  })

  it('should populate form when courseData is provided', async () => {
    const courseData = {
      courseCode: 'CS101',
      name: 'Introduction to Computer Science',
      credits: 3,
      department: { _id: 'dept1', name: 'Computer Science' },
      description: 'A comprehensive introduction to computer science',
      prerequisites: [{ _id: 'course1' }]
    }

    await wrapper.setProps({ courseData, isEditing: true })

    expect(wrapper.find('#courseCode').element.value).toBe('CS101')
    expect(wrapper.find('#name').element.value).toBe('Introduction to Computer Science')
    expect(wrapper.find('#credits').element.value).toBe('3')
    expect(wrapper.find('#description').element.value).toBe('A comprehensive introduction to computer science')
  })

  it('should disable course code when editing', async () => {
    await wrapper.setProps({ isEditing: true })
    
    const courseCodeInput = wrapper.find('#courseCode')
    expect(courseCodeInput.attributes('disabled')).toBeDefined()
  })

  it('should validate required fields', async () => {
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.validationErrors.courseCode).toBeTruthy()
    expect(wrapper.vm.validationErrors.name).toBeTruthy()
    expect(wrapper.vm.validationErrors.department).toBeTruthy()
    expect(wrapper.vm.validationErrors.description).toBeTruthy()
  })

  it('should validate course code format', async () => {
    await wrapper.find('#courseCode').setValue('invalid-code!')
    
    wrapper.vm.validateForm()
    
    expect(wrapper.vm.validationErrors.courseCode).toBeTruthy()
  })

  it('should validate credits', async () => {
    await wrapper.find('#credits').setValue('1') // Below minimum
    
    wrapper.vm.validateForm()
    
    expect(wrapper.vm.validationErrors.credits).toBeTruthy()
  })

  it('should validate description length', async () => {
    await wrapper.find('#description').setValue('Short') // Too short
    
    wrapper.vm.validateForm()
    
    expect(wrapper.vm.validationErrors.description).toBeTruthy()
  })

  it('should emit submit with valid data', async () => {
    // Fill in valid data
    await wrapper.find('#courseCode').setValue('CS101')
    await wrapper.find('#name').setValue('Introduction to Computer Science')
    await wrapper.find('#credits').setValue('3')
    await wrapper.find('#department').setValue('dept1')
    await wrapper.find('#description').setValue('A comprehensive introduction to computer science and programming fundamentals')
    
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('should emit cancel event', async () => {
    const cancelButton = wrapper.find('.btn-secondary')
    await cancelButton.trigger('click')
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('should show loading state', async () => {
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()
    
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.find('.spinner-border').exists()).toBe(true)
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('should populate departments in dropdown', async () => {
    const departmentSelect = wrapper.find('#department')
    const options = departmentSelect.findAll('option')
    
    expect(options).toHaveLength(3) // Including default option
    expect(options[1].text()).toContain('Computer Science')
    expect(options[2].text()).toContain('Mathematics')
  })

  it('should filter available courses for prerequisites', () => {
    const courseData = { courseCode: 'CS101' }
    wrapper.setProps({ courseData, isEditing: true })
    
    const availableCourses = wrapper.vm.availableCourses
    
    // Should not include the current course
    expect(availableCourses.find(c => c.courseCode === 'CS101')).toBeUndefined()
  })

  it('should handle department object vs ID', async () => {
    const courseData = {
      department: { _id: 'dept1', name: 'Computer Science' }
    }
    
    await wrapper.setProps({ courseData })
    
    expect(wrapper.vm.formState.department).toBe('dept1')
  })

  it('should handle prerequisites array', async () => {
    const courseData = {
      prerequisites: [
        { _id: 'course1', name: 'Course 1' },
        { _id: 'course2', name: 'Course 2' }
      ]
    }
    
    await wrapper.setProps({ courseData })
    
    expect(wrapper.vm.formState.prerequisites).toEqual(['course1', 'course2'])
  })

  it('should fetch data on mount', () => {
    expect(store._actions['department/fetchDepartments']).toHaveBeenCalled()
    expect(store._actions['course/fetchCourses']).toHaveBeenCalled()
  })
})