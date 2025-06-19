import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import ClassTable from '@/components/class/ClassTable.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      class: {
        class_code: 'Class Code',
        academic_year: 'Academic Year',
        semester: 'Semester',
        lecturer: 'Lecturer',
        student_count: 'Student Count',
        schedule: 'Schedule',
        view_schedule: 'View Schedule',
        no_matching_classes: 'No matching classes'
      },
      common: {
        loading: 'Loading...',
        action: 'Action',
        register: 'Register'
      },
      days: {
        2: 'Monday',
        3: 'Tuesday',
        4: 'Wednesday',
        5: 'Thursday',
        6: 'Friday',
        7: 'Saturday'
      },
      semester: {
        summer: 'Summer Semester',
        regular: 'Semester {semester}'
      },
      error: {
        prefix: 'Error',
        load_failed: 'Load failed'
      }
    }
  }
})

const createMockStore = (initialState = {}) => {
  return createStore({
    modules: {
      class: {
        namespaced: true,
        state: {
          classes: [],
          loading: false,
          ...initialState.class
        },
        actions: {
          fetchClasses: jest.fn()
        }
      }
    }
  })
}

describe('ClassTable.vue', () => {
  let wrapper
  let store

  const mockClasses = [
    {
      _id: '1',
      classCode: 'CS101-01',
      course: {
        _id: 'course1',
        courseCode: 'CS101',
        name: 'Intro to CS'
      },
      academicYear: '2023-2024',
      semester: 1,
      instructor: 'John Doe',
      enrolledStudents: 25,
      maxCapacity: 30,
      schedule: [{
        dayOfWeek: 2,
        startPeriod: 1,
        endPeriod: 3,
        classroom: 'A101'
      }]
    }
  ]

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(ClassTable, {
      global: {
        plugins: [store, i18n]
      },
      props: {
        courseId: 'course1'
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').exists()).toBe(true)
    expect(wrapper.text()).toContain('Class Code')
    expect(wrapper.text()).toContain('Academic Year')
  })

  it('should show loading state', async () => {
    store.state.class.loading = true
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading...')
  })

  it('should show no data message when no classes', async () => {
    store.state.class.classes = []
    store.state.class.loading = false
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('No matching classes')
  })

  it('should display classes when available', async () => {
    store.state.class.classes = mockClasses
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('CS101-01')
    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('25 / 30')
  })

  it('should filter classes by course ID', async () => {
    const allClasses = [
      ...mockClasses,
      {
        _id: '2',
        classCode: 'MATH101-01',
        course: { _id: 'course2' },
        academicYear: '2023-2024',
        semester: 1,
        instructor: 'Jane Smith',
        enrolledStudents: 20,
        maxCapacity: 25
      }
    ]
    
    store.state.class.classes = allClasses
    await wrapper.vm.$nextTick()
    
    // Should only show classes for courseId 'course1'
    expect(wrapper.vm.filteredClasses).toHaveLength(1)
    expect(wrapper.vm.filteredClasses[0].classCode).toBe('CS101-01')
  })

  it('should show schedule modal when view schedule is clicked', async () => {
    store.state.class.classes = mockClasses
    await wrapper.vm.$nextTick()
    
    const viewScheduleButton = wrapper.find('button')
    await viewScheduleButton.trigger('click')
    
    expect(wrapper.vm.isScheduleModalVisible).toBe(true)
    expect(wrapper.vm.selectedClass).toEqual(mockClasses[0])
  })

  it('should emit register event when register button is clicked', async () => {
    store.state.class.classes = mockClasses
    await wrapper.vm.$nextTick()
    
    const registerButton = wrapper.find('.btn-outline-success')
    await registerButton.trigger('click')
    
    expect(wrapper.emitted('register')).toBeTruthy()
    expect(wrapper.emitted('register')[0]).toEqual(['CS101-01'])
  })

  it('should format semester correctly', () => {
    expect(wrapper.vm.formatSemester(1)).toBe('Semester 1')
    expect(wrapper.vm.formatSemester(3)).toBe('Summer Semester')
  })

  it('should get correct progress bar class', () => {
    const class1 = { enrolledStudents: 10, maxCapacity: 30 } // 33%
    const class2 = { enrolledStudents: 25, maxCapacity: 30 } // 83%
    const class3 = { enrolledStudents: 29, maxCapacity: 30 } // 97%
    
    expect(wrapper.vm.getProgressBarClass(class1)).toBe('bg-success')
    expect(wrapper.vm.getProgressBarClass(class2)).toBe('bg-warning')
    expect(wrapper.vm.getProgressBarClass(class3)).toBe('bg-danger')
  })

  it('should handle pagination correctly', () => {
    const manyClasses = Array.from({ length: 25 }, (_, i) => ({
      ...mockClasses[0],
      _id: `class${i}`,
      classCode: `CS101-${i.toString().padStart(2, '0')}`
    }))
    
    store.state.class.classes = manyClasses
    wrapper.vm.pageSize = 10
    
    expect(wrapper.vm.totalPages).toBe(3)
    expect(wrapper.vm.paginatedClasses).toHaveLength(10)
  })

  it('should change page correctly', async () => {
    wrapper.vm.currentPage = 1
    wrapper.vm.changePage(2)
    
    expect(wrapper.vm.currentPage).toBe(2)
  })

  it('should not change to invalid page', () => {
    wrapper.vm.currentPage = 1
    wrapper.vm.totalPages = 3
    
    wrapper.vm.changePage(0) // Invalid
    expect(wrapper.vm.currentPage).toBe(1)
    
    wrapper.vm.changePage(4) // Invalid
    expect(wrapper.vm.currentPage).toBe(1)
  })

  it('should fetch classes on mount', () => {
    expect(store._actions['class/fetchClasses']).toHaveBeenCalled()
  })
})