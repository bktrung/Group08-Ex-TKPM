import courseModule from '@/store/modules/course.js'
import courseService from '@/services/course.js'

// Mock the course service
jest.mock('@/services/course.js', () => ({
  getCourses: jest.fn(),
  createCourse: jest.fn(),
  updateCourse: jest.fn(),
  deleteCourse: jest.fn(),
  toggleCourseStatus: jest.fn()
}))

describe('course store module', () => {
  let store

  beforeEach(() => {
    store = {
      state: { ...courseModule.state },
      commit: jest.fn(),
      dispatch: jest.fn()
    }
    jest.clearAllMocks()
  })

  describe('mutations', () => {
    it('should set courses', () => {
      const courses = [{ _id: '1', courseCode: 'CS101' }]
      courseModule.mutations.SET_COURSES(store.state, courses)
      expect(store.state.courses).toEqual(courses)
    })

    it('should add course', () => {
      const newCourse = { _id: '1', courseCode: 'CS101' }
      courseModule.mutations.ADD_COURSE(store.state, newCourse)
      expect(store.state.courses).toContain(newCourse)
    })

    it('should add course to empty array', () => {
      store.state.courses = null
      const newCourse = { _id: '1', courseCode: 'CS101' }
      courseModule.mutations.ADD_COURSE(store.state, newCourse)
      expect(store.state.courses).toEqual([newCourse])
    })

    it('should update course', () => {
      store.state.courses = [{ _id: '1', courseCode: 'CS101', name: 'Old' }]
      const updatedCourse = { _id: '1', courseCode: 'CS101', name: 'New' }
      
      courseModule.mutations.UPDATE_COURSE(store.state, updatedCourse)
      expect(store.state.courses[0]).toEqual(updatedCourse)
    })

    it('should remove course', () => {
      store.state.courses = [{ courseCode: 'CS101' }, { courseCode: 'CS102' }]
      
      courseModule.mutations.REMOVE_COURSE(store.state, 'CS101')
      expect(store.state.courses).toHaveLength(1)
      expect(store.state.courses[0].courseCode).toBe('CS102')
    })

    it('should set course active status', () => {
      store.state.courses = [{ courseCode: 'CS101', isActive: true }]
      
      courseModule.mutations.SET_COURSE_ACTIVE_STATUS(store.state, { 
        courseCode: 'CS101', 
        isActive: false 
      })
      
      expect(store.state.courses[0].isActive).toBe(false)
    })
  })

  describe('actions', () => {
    it('should fetch courses successfully', async () => {
      const mockCourses = [{ _id: '1', courseCode: 'CS101' }]
      const mockResponse = {
        data: {
          metadata: {
            courses: mockCourses
          }
        }
      }
      
      courseService.getCourses.mockResolvedValue(mockResponse)
      
      await courseModule.actions.fetchCourses(store)
      
      expect(store.commit).toHaveBeenCalledWith('SET_COURSES', mockCourses)
    })

    it('should fetch courses with nested courses structure', async () => {
      const mockCourses = [{ _id: '1', courseCode: 'CS101' }]
      const mockResponse = {
        data: {
          metadata: {
            courses: {
              courses: mockCourses
            }
          }
        }
      }
      
      courseService.getCourses.mockResolvedValue(mockResponse)
      
      await courseModule.actions.fetchCourses(store)
      
      expect(store.commit).toHaveBeenCalledWith('SET_COURSES', mockCourses)
    })

    it('should handle fetch courses error', async () => {
      const error = new Error('API Error')
      courseService.getCourses.mockRejectedValue(error)
      
      await expect(courseModule.actions.fetchCourses(store)).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'API Error')
      expect(store.commit).toHaveBeenCalledWith('SET_COURSES', [])
    })

    it('should create course successfully', async () => {
      const courseData = { 
        courseCode: 'CS101', 
        name: 'Intro to CS', 
        credits: '3',
        prerequisites: undefined
      }
      const mockResponse = {
        data: {
          metadata: {
            newCourse: { _id: '1', ...courseData, credits: 3 }
          }
        }
      }
      
      courseService.createCourse.mockResolvedValue(mockResponse)
      
      await courseModule.actions.createCourse(store, courseData)
      
      expect(courseService.createCourse).toHaveBeenCalledWith({
        ...courseData,
        credits: 3,
        prerequisites: []
      })
      expect(store.commit).toHaveBeenCalledWith('ADD_COURSE', mockResponse.data.metadata.newCourse)
    })

    it('should update course successfully', async () => {
      const courseCode = 'CS101'
      const data = { name: 'Updated Name', credits: 4 }
      const mockResponse = {
        data: {
          metadata: {
            updatedCourse: { courseCode, ...data }
          }
        }
      }
      
      courseService.updateCourse.mockResolvedValue(mockResponse)
      
      const result = await courseModule.actions.updateCourse(store, { courseCode, data })
      
      expect(store.commit).toHaveBeenCalledWith('UPDATE_COURSE', mockResponse.data.metadata.updatedCourse)
      expect(result).toEqual(mockResponse.data.metadata)
    })

    it('should update course and dispatch fetchCourses if no updatedCourse', async () => {
      const courseCode = 'CS101'
      const data = { name: 'Updated Name' }
      const mockResponse = { data: { metadata: {} } }
      
      courseService.updateCourse.mockResolvedValue(mockResponse)
      
      await courseModule.actions.updateCourse(store, { courseCode, data })
      
      expect(store.dispatch).toHaveBeenCalledWith('fetchCourses')
    })

    it('should delete course successfully (deactivate)', async () => {
      const courseCode = 'CS101'
      const mockResponse = {
        data: {
          metadata: {
            deletedCourse: { courseCode, isActive: false }
          }
        }
      }
      
      courseService.deleteCourse.mockResolvedValue(mockResponse)
      
      const result = await courseModule.actions.deleteCourse(store, courseCode)
      
      expect(store.commit).toHaveBeenCalledWith('SET_COURSE_ACTIVE_STATUS', { 
        courseCode, 
        isActive: false 
      })
      expect(result.deactivated).toBe(true)
    })

    it('should delete course successfully (remove)', async () => {
      const courseCode = 'CS101'
      const mockResponse = {
        data: {
          metadata: {
            deletedCourse: { courseCode, isActive: true }
          }
        }
      }
      
      courseService.deleteCourse.mockResolvedValue(mockResponse)
      
      const result = await courseModule.actions.deleteCourse(store, courseCode)
      
      expect(store.commit).toHaveBeenCalledWith('REMOVE_COURSE', courseCode)
      expect(result.deleted).toBe(true)
    })

    it('should toggle course active status', async () => {
      const courseCode = 'CS101'
      const isActive = false
      
      courseService.toggleCourseStatus.mockResolvedValue({})
      
      const result = await courseModule.actions.toggleCourseActiveStatus(store, { courseCode, isActive })
      
      expect(store.commit).toHaveBeenCalledWith('SET_COURSE_ACTIVE_STATUS', { courseCode, isActive })
      expect(store.dispatch).toHaveBeenCalledWith('fetchCourses')
      expect(result.success).toBe(true)
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      store.state.courses = [
        { courseCode: 'CS101', isActive: true, department: 'dept1' },
        { courseCode: 'CS102', isActive: false, department: { _id: 'dept2' } }
      ]
    })

    it('should get course by code', () => {
      const course = courseModule.getters.getCourseByCode(store.state)('CS101')
      expect(course.courseCode).toBe('CS101')
    })

    it('should get active courses', () => {
      const activeCourses = courseModule.getters.getActiveCourses(store.state)
      expect(activeCourses).toHaveLength(1)
      expect(activeCourses[0].courseCode).toBe('CS101')
    })

    it('should get courses by department', () => {
      const courses = courseModule.getters.getCoursesByDepartment(store.state)('dept1')
      expect(courses).toHaveLength(1)
      expect(courses[0].courseCode).toBe('CS101')
    })

    it('should get courses by department with object department', () => {
      const courses = courseModule.getters.getCoursesByDepartment(store.state)('dept2')
      expect(courses).toHaveLength(1)
      expect(courses[0].courseCode).toBe('CS102')
    })
  })
})