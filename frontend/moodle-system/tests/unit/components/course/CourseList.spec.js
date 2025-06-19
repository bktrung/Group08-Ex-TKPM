import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import CourseList from '@/components/course/CourseList.vue'
import { createI18n } from 'vue-i18n'

// Mock Bootstrap Modal
const mockModal = {
  show: jest.fn(),
  hide: jest.fn()
}

jest.mock('bootstrap', () => ({
  Modal: jest.fn().mockImplementation(() => mockModal)
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      course: {
        search_placeholder: 'Search courses...',
        course_code: 'Course Code',
        name: 'Course Name',
        department: 'Department',
        credits: 'Credits',
        prerequisite: 'Prerequisites',
        status: {
          active: 'Active',
          inactive: 'Inactive'
        },
        no_search_result: 'No search results',
        no_data: 'No courses available',
        display_count: 'Showing {current} / {total} courses',
        delete_confirm: 'Are you sure you want to delete course {code} - {name}?',
        delete_note: 'Course can only be deleted within 30 minutes',
        confirm_close: 'Are you sure you want to close course {courseCode} - {name}?',
        confirm_reopen: 'Are you sure you want to reopen course {courseCode} - {name}?',
        close: 'Close Course',
        reopen: 'Reopen Course'
      },
      common: {
        search: 'Search',
        reset: 'Reset',
        add: 'Add',
        action: 'Action',
        loading: 'Loading...',
        status: 'Status',
        none: 'None',
        page: 'Page',
        previous: 'Previous',
        next: 'Next',
        cancel: 'Cancel',
        delete: 'Delete'
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
          loading: false,
          ...initialState.course
        }
      },
      department: {
        namespaced: true,
        getters: {
          getDepartmentById: () => (id) => ({ _id: id, name: `Department ${id}` })
        }
      }
    }
  })
}

describe('CourseList.vue', () => {
  let wrapper
  let store

  const mockCourses = [
    {
      _id: '1',
      courseCode: 'CS101',
      name: 'Introduction to Computer Science',
      department: { _id: 'dept1', name: 'Computer Science' },
      credits: 3,
      prerequisites: [],
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      courseCode: 'MATH101',
      name: 'Calculus I',
      department: { _id: 'dept2', name: 'Mathematics' },
      credits: 4,
      prerequisites: [],
      isActive: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
    }
  ]

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(CourseList, {
      global: {
        plugins: [store, i18n]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('.input-group').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('Add')
  })

  it('should show loading state', async () => {
    store.state.course.loading = true
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading...')
  })

  it('should show no data message when courses array is empty', async () => {
    store.state.course.courses = []
    store.state.course.loading = false
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('No courses available')
  })

  it('should display courses when available', async () => {
    store.state.course.courses = mockCourses
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('CS101')
    expect(wrapper.text()).toContain('Introduction to Computer Science')
    expect(wrapper.text()).toContain('MATH101')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('should filter courses by search query', async () => {
    store.state.course.courses = mockCourses
    await wrapper.find('input[type="text"]').setValue('CS101')
    await wrapper.vm.filterCourses()
    
    expect(wrapper.vm.filteredCourses).toHaveLength(1)
    expect(wrapper.vm.filteredCourses[0].courseCode).toBe('CS101')
  })

  it('should reset filter', async () => {
    await wrapper.find('input[type="text"]').setValue('test')
    wrapper.vm.searchQuery = 'test'
    
    await wrapper.find('.btn-secondary').trigger('click')
    
    expect(wrapper.vm.searchQuery).toBe('')
    expect(wrapper.vm.currentPage).toBe(1)
  })

  it('should emit add-course event', async () => {
    const addButton = wrapper.find('.btn-success')
    await addButton.trigger('click')
    
    expect(wrapper.emitted('add-course')).toBeTruthy()
  })

  it('should emit edit-course event', async () => {
    store.state.course.courses = mockCourses
    await wrapper.vm.$nextTick()
    
    const editButton = wrapper.find('.btn-warning')
    await editButton.trigger('click')
    
    expect(wrapper.emitted('edit-course')).toBeTruthy()
    expect(wrapper.emitted('edit-course')[0][0]).toEqual(mockCourses[0])
  })

  it('should show delete confirmation modal', async () => {
    store.state.course.courses = mockCourses
    await wrapper.vm.$nextTick()
    
    const deleteButton = wrapper.find('.btn-danger')
    await deleteButton.trigger('click')
    
    expect(wrapper.vm.courseToDelete).toEqual(mockCourses[0])
    expect(mockModal.show).toHaveBeenCalled()
  })

  it('should emit delete-course event when confirmed', async () => {
    wrapper.vm.courseToDelete = mockCourses[0]
    
    await wrapper.vm.deleteCourse()
    
    expect(wrapper.emitted('delete-course')).toBeTruthy()
    expect(wrapper.emitted('delete-course')[0][0]).toEqual(mockCourses[0])
  })

  it('should show toggle status confirmation modal', async () => {
    store.state.course.courses = mockCourses
    await wrapper.vm.$nextTick()
    
    const toggleButton = wrapper.find('.btn-outline-danger')
    await toggleButton.trigger('click')
    
    expect(wrapper.vm.courseToToggle).toEqual(mockCourses[0])
    expect(mockModal.show).toHaveBeenCalled()
  })

  it('should emit toggle-active-status event when confirmed', async () => {
    wrapper.vm.courseToToggle = mockCourses[0]
    
    await wrapper.vm.confirmToggleStatus()
    
    expect(wrapper.emitted('toggle-active-status')).toBeTruthy()
    expect(wrapper.emitted('toggle-active-status')[0][0]).toEqual(mockCourses[0])
  })

  it('should get department name correctly', () => {
    const departmentId = 'dept1'
    const departmentName = wrapper.vm.getDepartmentName(departmentId)
    
    expect(departmentName).toBe('Department dept1')
  })

  it('should get department name from object', () => {
    const department = { _id: 'dept1', name: 'Computer Science' }
    const departmentName = wrapper.vm.getDepartmentName(department)
    
    expect(departmentName).toBe('Computer Science')
  })

  it('should get prerequisite names correctly', () => {
    const prerequisites = [
      { _id: 'course1', courseCode: 'CS100', name: 'Intro to Programming' }
    ]
    
    store.state.course.courses = [
      { _id: 'course1', courseCode: 'CS100', name: 'Intro to Programming' }
    ]
    
    const names = wrapper.vm.getPrerequisiteNames(prerequisites)
    
    expect(names).toEqual(['CS100 - Intro to Programming'])
  })

  it('should determine if course can be deleted', () => {
    const recentCourse = {
      createdAt: new Date().toISOString(),
      hasClasses: false
    }
    
    const oldCourse = {
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      hasClasses: false
    }
    
    expect(wrapper.vm.canDelete(recentCourse)).toBe(true)
    expect(wrapper.vm.canDelete(oldCourse)).toBe(false)
  })

  it('should handle pagination correctly', () => {
    const manyCourses = Array.from({ length: 25 }, (_, i) => ({
      ...mockCourses[0],
      _id: `course${i}`,
      courseCode: `CS${i.toString().padStart(3, '0')}`
    }))
    
    store.state.course.courses = manyCourses
    wrapper.vm.pageSize = 10
    
    expect(wrapper.vm.totalPages).toBe(3)
    expect(wrapper.vm.paginatedCourses).toHaveLength(10)
  })

  it('should change page correctly', () => {
    wrapper.vm.currentPage = 1
    wrapper.vm.totalPages = 3
    
    wrapper.vm.changePage(2)
    expect(wrapper.vm.currentPage).toBe(2)
    
    wrapper.vm.changePage(5) // Invalid page
    expect(wrapper.vm.currentPage).toBe(2) // Should not change
  })
})