import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import ClassForm from '@/components/class/ClassForm.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      class: {
        infor: 'Class Information',
        class_code: 'Class Code',
        course: 'Course',
        academic_year: 'Academic Year',
        semester: 'Semester',
        lecturer: 'Lecturer',
        student_max_count: 'Max Students',
        schedule: 'Schedule',
        add: 'Add Class',
        edit: 'Edit Class',
        required_class_code: 'Class code is required',
        required_course: 'Course is required',
        required_academic_year: 'Academic year is required',
        required_semester: 'Semester is required',
        required_instructor: 'Instructor is required',
        max_class_size_validation: 'Max size must be >= 1',
        required_schedule: 'Schedule is required',
        min_length_schedule: 'At least one schedule required',
        please_add_at_least_one_schedule: 'Please add at least one schedule',
        end_period_validation: 'End period must be >= start period',
        schedule_conflict: 'Schedule conflicts with schedule #{index} in room {room}',
        semester_1: 'Semester 1',
        semester_2: 'Semester 2',
        semester_3: 'Summer Semester',
        room: 'Room',
        start_period: 'Start Period',
        end_period: 'End Period',
        period: 'Period'
      },
      days: {
        day_of_week: 'Day of Week',
        2: 'Monday',
        3: 'Tuesday',
        4: 'Wednesday',
        5: 'Thursday',
        6: 'Friday',
        7: 'Saturday'
      },
      common: {
        choose: 'Choose',
        add: 'Add',
        cancel: 'Cancel',
        please_choose: 'Please choose',
        please_enter: 'Please enter'
      }
    }
  }
})

const createMockStore = (initialState = {}) => {
  return createStore({
    modules: {
      course: {
        namespaced: true,
        state: {
          courses: [],
          ...initialState.course
        },
        getters: {
          getActiveCourses: () => [
            { _id: '1', courseCode: 'CS101', name: 'Intro to CS', credits: 3 },
            { _id: '2', courseCode: 'MATH101', name: 'Calculus', credits: 4 }
          ]
        },
        actions: {
          fetchCourses: jest.fn()
        }
      },
      class: {
        namespaced: true,
        state: {
          loading: false,
          ...initialState.class
        }
      }
    }
  })
}

describe('ClassForm.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(ClassForm, {
      global: {
        plugins: [store, i18n]
      },
      props: {
        classData: {},
        isEditing: false
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.text()).toContain('Class Information')
    expect(wrapper.find('#class-code').exists()).toBe(true)
    expect(wrapper.find('#class-course').exists()).toBe(true)
  })

  it('should populate form when classData is provided', async () => {
    const classData = {
      classCode: 'CS101-01',
      course: { _id: '1', courseCode: 'CS101' },
      academicYear: '2023-2024',
      semester: 1,
      instructor: 'John Doe',
      maxCapacity: 30,
      schedule: [{
        dayOfWeek: 2,
        startPeriod: 1,
        endPeriod: 3,
        classroom: 'A101'
      }]
    }

    await wrapper.setProps({ classData, isEditing: true })

    expect(wrapper.find('#class-code').element.value).toBe('CS101-01')
    expect(wrapper.find('#class-instructor').element.value).toBe('John Doe')
    expect(wrapper.find('#class-max-capacity').element.value).toBe('30')
  })

  it('should disable class code input when editing', async () => {
    await wrapper.setProps({ isEditing: true })
    
    const classCodeInput = wrapper.find('#class-code')
    expect(classCodeInput.attributes('readonly')).toBeDefined()
  })

  it('should add schedule item when add button is clicked', async () => {
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    
    expect(wrapper.vm.form.schedule).toHaveLength(1)
    expect(wrapper.findAll('.card')).toHaveLength(1)
  })

  it('should remove schedule item when remove button is clicked', async () => {
    // Add a schedule item first
    wrapper.vm.addScheduleItem()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.form.schedule).toHaveLength(1)
    
    // Remove the schedule item
    const removeButton = wrapper.find('.btn-danger')
    await removeButton.trigger('click')
    
    expect(wrapper.vm.form.schedule).toHaveLength(0)
  })

  it('should validate required fields', async () => {
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.v$.$invalid).toBe(true)
    expect(wrapper.findAll('.is-invalid')).toHaveLength(expect.any(Number))
  })

  it('should validate schedule conflicts', async () => {
    // Add two conflicting schedules
    wrapper.vm.form.schedule = [
      {
        dayOfWeek: 2,
        startPeriod: 1,
        endPeriod: 3,
        classroom: 'A101'
      },
      {
        dayOfWeek: 2,
        startPeriod: 2,
        endPeriod: 4,
        classroom: 'A101'
      }
    ]
    
    const isValid = wrapper.vm.validateAllSchedules()
    expect(isValid).toBe(false)
  })

  it('should validate end period is after start period', async () => {
    wrapper.vm.form.schedule = [{
      dayOfWeek: 2,
      startPeriod: 5,
      endPeriod: 3,
      classroom: 'A101'
    }]
    
    const isValid = wrapper.vm.validateScheduleItem(wrapper.vm.form.schedule[0], 0)
    expect(isValid).toBe(false)
  })

  it('should emit submit event with valid data', async () => {
    // Fill in required fields
    await wrapper.find('#class-code').setValue('CS101-01')
    await wrapper.find('#class-course').setValue('1')
    await wrapper.find('#class-academic-year').setValue('2023-2024')
    await wrapper.find('#class-semester').setValue('1')
    await wrapper.find('#class-instructor').setValue('John Doe')
    await wrapper.find('#class-max-capacity').setValue('30')
    
    // Add a valid schedule
    wrapper.vm.form.schedule = [{
      dayOfWeek: 2,
      startPeriod: 1,
      endPeriod: 3,
      classroom: 'A101'
    }]
    
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('should emit cancel event', async () => {
    const cancelButton = wrapper.findAll('button').find(btn => 
      btn.text().includes('Cancel')
    )
    await cancelButton.trigger('click')
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('should show loading state', async () => {
    store.state.class.loading = true
    await wrapper.vm.$nextTick()
    
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.find('.spinner-border').exists()).toBe(true)
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('should populate academic years correctly', () => {
    const currentYear = new Date().getFullYear()
    const academicYears = wrapper.vm.academicYears
    
    expect(academicYears).toContain(`${currentYear}-${currentYear + 1}`)
    expect(academicYears).toHaveLength(4)
  })

  it('should fetch courses on mount', () => {
    expect(store._actions['course/fetchCourses']).toHaveBeenCalled()
  })

  it('should validate all schedules', async () => {
    wrapper.vm.form.schedule = [
      {
        dayOfWeek: 2,
        startPeriod: 1,
        endPeriod: 3,
        classroom: 'A101'
      },
      {
        dayOfWeek: '',
        startPeriod: '',
        endPeriod: '',
        classroom: ''
      }
    ]
    
    const isValid = wrapper.vm.validateAllSchedules()
    expect(isValid).toBe(false)
  })
})